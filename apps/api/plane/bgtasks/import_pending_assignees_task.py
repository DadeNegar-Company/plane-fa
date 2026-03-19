# [FA-CUSTOM] Retroactive assignee creation for imported issues.
# When a workspace invite is accepted, this task resolves any pending
# assignee mappings that were stored during file-based imports.

import logging

from celery import shared_task
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from plane.db.models import (
    ImportJob,
    Issue,
    IssueAssignee,
    ProjectMember,
)
from plane.utils.exception_logger import log_exception

User = get_user_model()
logger = logging.getLogger(__name__)


def _ensure_project_member(project, workspace, user, actor_id):
    """Add a user to the project if not already a member."""
    ProjectMember.objects.get_or_create(
        project=project,
        member=user,
        defaults={
            "role": 15,
            "is_active": True,
            "workspace": workspace,
            "created_by_id": actor_id,
        },
    )


@shared_task
def process_pending_import_assignees(workspace_id, user_email):
    """
    Called when a user accepts a workspace invitation.
    Finds any ImportJobs that had pending assignee mappings for this
    email and creates the IssueAssignee records retroactively.
    """
    try:
        user = User.objects.filter(email=user_email).first()
        if not user:
            return

        import_jobs = ImportJob.objects.filter(
            workspace_id=workspace_id,
            status__in=["completed", "completed_with_errors"],
        ).exclude(pending_assignees=[])

        for job in import_jobs:
            remaining = []
            project = job.project
            workspace = job.workspace
            actor_id = str(job.initiated_by_id)

            for entry in job.pending_assignees:
                if entry.get("email") != user_email:
                    remaining.append(entry)
                    continue

                issue = Issue.objects.filter(
                    id=entry["issue_id"], project=project,
                ).first()
                if not issue:
                    # Issue was deleted after import — drop entry
                    continue

                _ensure_project_member(project, workspace, user, actor_id)

                try:
                    IssueAssignee.objects.create(
                        issue=issue,
                        assignee=user,
                        project=project,
                        workspace=workspace,
                        created_by_id=actor_id,
                    )
                except IntegrityError:
                    # Already assigned (e.g. manually) — skip
                    pass

            job.pending_assignees = remaining
            job.save(update_fields=["pending_assignees"])

    except Exception as e:
        log_exception(e)

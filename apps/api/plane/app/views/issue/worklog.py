# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# [FA-CUSTOM] ViewSet for IssueWorklog (time tracking)

# Python imports
import json

# Django imports
from django.utils import timezone
from django.core.serializers.json import DjangoJSONEncoder

# Third Party imports
from rest_framework.response import Response
from rest_framework import status

# Module imports
from .. import BaseAPIView, BaseViewSet
from plane.app.serializers import IssueWorklogSerializer
from plane.app.permissions import allow_permission, ROLE
from plane.db.models import IssueWorklog, Project
from plane.bgtasks.issue_activities_task import issue_activity
from plane.utils.host import base_host


class IssueWorklogViewSet(BaseViewSet):
    serializer_class = IssueWorklogSerializer
    model = IssueWorklog

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .filter(issue_id=self.kwargs.get("issue_id"))
            .filter(
                project__project_projectmember__member=self.request.user,
                project__project_projectmember__is_active=True,
                project__archived_at__isnull=True,
            )
            .select_related("actor", "project", "workspace", "issue")
            .distinct()
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def create(self, request, slug, project_id, issue_id):
        project = Project.objects.get(pk=project_id)
        if not project.is_time_tracking_enabled:
            return Response(
                {"error": "Time tracking is not enabled for this project."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = IssueWorklogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                project_id=project_id,
                issue_id=issue_id,
                actor=request.user,
            )
            issue_activity.delay(
                type="worklog.activity.created",
                requested_data=json.dumps(
                    serializer.data, cls=DjangoJSONEncoder
                ),
                actor_id=str(request.user.id),
                issue_id=str(issue_id),
                project_id=str(project_id),
                current_instance=None,
                epoch=int(timezone.now().timestamp()),
                notification=False,
                origin=base_host(request=request, is_app=True),
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission(
        allowed_roles=[ROLE.ADMIN], creator=True, model=IssueWorklog
    )
    def partial_update(self, request, slug, project_id, issue_id, pk):
        worklog = IssueWorklog.objects.get(
            workspace__slug=slug,
            project_id=project_id,
            issue_id=issue_id,
            pk=pk,
        )
        current_instance = json.dumps(
            IssueWorklogSerializer(worklog).data, cls=DjangoJSONEncoder
        )
        serializer = IssueWorklogSerializer(
            worklog, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            issue_activity.delay(
                type="worklog.activity.updated",
                requested_data=json.dumps(
                    request.data, cls=DjangoJSONEncoder
                ),
                actor_id=str(request.user.id),
                issue_id=str(issue_id),
                project_id=str(project_id),
                current_instance=current_instance,
                epoch=int(timezone.now().timestamp()),
                notification=False,
                origin=base_host(request=request, is_app=True),
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission(
        allowed_roles=[ROLE.ADMIN], creator=True, model=IssueWorklog
    )
    def destroy(self, request, slug, project_id, issue_id, pk):
        worklog = IssueWorklog.objects.get(
            workspace__slug=slug,
            project_id=project_id,
            issue_id=issue_id,
            pk=pk,
        )
        current_instance = json.dumps(
            IssueWorklogSerializer(worklog).data, cls=DjangoJSONEncoder
        )
        worklog.delete()
        issue_activity.delay(
            type="worklog.activity.deleted",
            requested_data=json.dumps(
                {"worklog_id": str(pk)}, cls=DjangoJSONEncoder
            ),
            actor_id=str(request.user.id),
            issue_id=str(issue_id),
            project_id=str(project_id),
            current_instance=current_instance,
            epoch=int(timezone.now().timestamp()),
            notification=False,
            origin=base_host(request=request, is_app=True),
        )
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectTimesheetEndpoint(BaseAPIView):
    """
    [FA-CUSTOM] Project-level timesheet — returns all worklogs for a project
    with optional date_from, date_to, and actor_id query filters.
    """

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def get(self, request, slug, project_id):
        queryset = (
            IssueWorklog.objects.filter(
                workspace__slug=slug,
                project_id=project_id,
                deleted_at__isnull=True,
            )
            .select_related("actor", "issue")
            .order_by("-date_worked", "-created_at")
        )

        # date filters
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        actor_id = request.query_params.get("actor_id")

        if date_from:
            queryset = queryset.filter(date_worked__gte=date_from)
        if date_to:
            queryset = queryset.filter(date_worked__lte=date_to)
        if actor_id:
            queryset = queryset.filter(actor_id=actor_id)

        serializer = IssueWorklogSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

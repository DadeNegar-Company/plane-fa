# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

# Module imports
from .project import ProjectBaseModel


class IssueWorklog(ProjectBaseModel):
    """Tracks actual time spent working on an issue."""

    issue = models.ForeignKey(
        "db.Issue",
        on_delete=models.CASCADE,
        related_name="issue_worklogs",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="worklogs",
        null=True,
    )
    duration_minutes = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )
    date_worked = models.DateField()
    description = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "Issue Worklog"
        verbose_name_plural = "Issue Worklogs"
        db_table = "issue_worklogs"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.issue_id} - {self.duration_minutes}m"

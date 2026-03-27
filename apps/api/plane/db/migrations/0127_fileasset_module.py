"""
Add module FK to FileAsset for MODULE_DESCRIPTION entity type support.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0126_alter_defaults_tehran_saturday"),
    ]

    operations = [
        migrations.AddField(
            model_name="fileasset",
            name="module",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="assets",
                to="db.module",
            ),
        ),
        migrations.AlterField(
            model_name="fileasset",
            name="entity_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("ISSUE_ATTACHMENT", "Issue Attachment"),
                    ("ISSUE_DESCRIPTION", "Issue Description"),
                    ("COMMENT_DESCRIPTION", "Comment Description"),
                    ("PAGE_DESCRIPTION", "Page Description"),
                    ("USER_COVER", "User Cover"),
                    ("USER_AVATAR", "User Avatar"),
                    ("WORKSPACE_LOGO", "Workspace Logo"),
                    ("PROJECT_COVER", "Project Cover"),
                    ("DRAFT_ISSUE_ATTACHMENT", "Draft Issue Attachment"),
                    ("DRAFT_ISSUE_DESCRIPTION", "Draft Issue Description"),
                    ("MODULE_DESCRIPTION", "Module Description"),
                ],
                max_length=255,
                null=True,
            ),
        ),
    ]

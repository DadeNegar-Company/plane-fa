# [FA-CUSTOM] Add pending_assignees field to ImportJob for retroactive invite assignment

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0124_alter_issueworklog_deleted_at_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="importjob",
            name="pending_assignees",
            field=models.JSONField(blank=True, default=list),
        ),
    ]

# [FA-CUSTOM] Change defaults: timezone to Asia/Tehran, start_of_week to Saturday

import pytz
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0125_importjob_pending_assignees"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="user_timezone",
            field=models.CharField(
                choices=tuple(zip(pytz.common_timezones, pytz.common_timezones)),
                default="Asia/Tehran",
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="profile",
            name="start_of_the_week",
            field=models.PositiveSmallIntegerField(
                choices=[
                    (0, "Sunday"),
                    (1, "Monday"),
                    (2, "Tuesday"),
                    (3, "Wednesday"),
                    (4, "Thursday"),
                    (5, "Friday"),
                    (6, "Saturday"),
                ],
                default=6,
            ),
        ),
        migrations.AlterField(
            model_name="workspace",
            name="timezone",
            field=models.CharField(
                choices=tuple(zip(pytz.common_timezones, pytz.common_timezones)),
                default="Asia/Tehran",
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="project",
            name="timezone",
            field=models.CharField(
                choices=tuple(zip(pytz.common_timezones, pytz.common_timezones)),
                default="Asia/Tehran",
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="cycle",
            name="timezone",
            field=models.CharField(
                choices=tuple(zip(pytz.common_timezones, pytz.common_timezones)),
                default="Asia/Tehran",
                max_length=255,
            ),
        ),
    ]

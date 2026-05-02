# [FA-CUSTOM] Change default language for Profile to Persian (fa)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0127_fileasset_module"),
    ]

    operations = [
        migrations.AlterField(
            model_name="profile",
            name="language",
            field=models.CharField(default="fa", max_length=255),
        ),
    ]

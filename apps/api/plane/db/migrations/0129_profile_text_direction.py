# [FA-CUSTOM] Add text_direction preference to Profile (default LTR for all users)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0128_alter_profile_language_default"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="text_direction",
            field=models.CharField(
                choices=[("ltr", "LTR"), ("rtl", "RTL")],
                default="ltr",
                max_length=3,
            ),
        ),
    ]

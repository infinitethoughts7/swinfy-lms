# Generated manually to fix missing duration_weeks column

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0010_alter_coursemodule_duration_weeks_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='coursemodule',
            name='duration_weeks',
            field=models.PositiveIntegerField(default=1, help_text='Module duration in weeks'),
        ),
    ]

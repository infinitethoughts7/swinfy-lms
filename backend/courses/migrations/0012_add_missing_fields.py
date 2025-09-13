# Generated manually to add missing fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0011_add_duration_weeks'),
    ]

    operations = [
        migrations.AddField(
            model_name='coursemodule',
            name='is_published',
            field=models.BooleanField(default=True, help_text='Module is visible to students'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='is_preview',
            field=models.BooleanField(default=False, help_text='Lesson is available for preview'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='is_published',
            field=models.BooleanField(default=True, help_text='Lesson is visible to students'),
        ),
    ]

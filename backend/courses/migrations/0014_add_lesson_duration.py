# Generated manually to add duration_minutes field to Lesson

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0013_add_module_is_published'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='duration_minutes',
            field=models.PositiveIntegerField(default=0, help_text='Lesson duration in minutes'),
        ),
    ]

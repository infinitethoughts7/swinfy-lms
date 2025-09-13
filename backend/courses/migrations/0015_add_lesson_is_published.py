# Generated manually to add is_published field to Lesson

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0014_add_lesson_duration'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='is_published',
            field=models.BooleanField(default=True, help_text='Lesson is visible to students'),
        ),
    ]

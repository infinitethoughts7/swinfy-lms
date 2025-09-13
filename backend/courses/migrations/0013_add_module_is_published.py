# Generated manually to add is_published field to CourseModule

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0012_add_missing_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='coursemodule',
            name='is_published',
            field=models.BooleanField(default=True, help_text='Module is visible to students'),
        ),
    ]

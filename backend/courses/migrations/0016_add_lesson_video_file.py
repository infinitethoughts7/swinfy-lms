# Generated manually to add video_file field to Lesson

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0015_add_lesson_is_published'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='video_file',
            field=models.FileField(blank=True, null=True, upload_to='courses/lessons/videos/', help_text='Video file (for video lessons)'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='attachment',
            field=models.FileField(blank=True, null=True, upload_to='courses/lessons/attachments/', help_text='Lesson attachment'),
        ),
    ]

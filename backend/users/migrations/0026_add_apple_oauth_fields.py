# Generated manually for OAuth integration (Google and Apple)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0025_alter_knowledgepartnerapplication_courses_interested_in_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='google_id',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True, verbose_name='Google ID'),
        ),
        migrations.AddField(
            model_name='user',
            name='apple_id',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True, verbose_name='Apple ID'),
        ),
        migrations.AddField(
            model_name='user',
            name='auth_provider',
            field=models.CharField(choices=[('email', 'Email/Password'), ('google', 'Google OAuth'), ('apple', 'Apple Sign-In')], default='email', max_length=50),
        ),
    ]

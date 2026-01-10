# Generated manually for Google OAuth integration

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_remove_knowledgepartnerapplication_users_knowl_knowled_06a0db_idx'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='google_id',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True, verbose_name='Google ID'),
        ),
        migrations.AddField(
            model_name='user',
            name='auth_provider',
            field=models.CharField(choices=[('email', 'Email/Password'), ('google', 'Google OAuth')], default='email', max_length=50),
        ),
    ]

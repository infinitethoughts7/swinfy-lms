from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser'

    def handle(self, *args, **options):
        if not User.objects.filter(email='admin@olla.co.in').exists():
            User.objects.create_superuser(
                email='admin@olla.co.in',
                full_name='Super Admin',
                role='super_admin',
                password='rockyg07'
            )
            self.stdout.write(
                self.style.SUCCESS('Superuser created successfully')
            )
        else:
            self.stdout.write('Superuser already exists')
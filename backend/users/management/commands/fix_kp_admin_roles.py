"""
Django management command to fix knowledge_partner_admin roles to knowledge_partner.

Usage:
    python manage.py fix_kp_admin_roles --dry-run  # Check what would be changed
    python manage.py fix_kp_admin_roles            # Apply the changes
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from users.models import User


class Command(BaseCommand):
    help = 'Fix knowledge_partner_admin roles to knowledge_partner in the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            dest='dry_run',
            help='Show what would be changed without making actual changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Find users with knowledge_partner_admin role
        users_to_fix = User.objects.filter(role='knowledge_partner_admin')
        
        if not users_to_fix.exists():
            self.stdout.write(
                self.style.SUCCESS('✅ No users found with knowledge_partner_admin role')
            )
            return
        
        self.stdout.write(f'Found {users_to_fix.count()} user(s) with knowledge_partner_admin role:')
        
        for user in users_to_fix:
            self.stdout.write(f'  - {user.email} ({user.full_name})')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('Would update these users to have role="knowledge_partner"')
            )
            return
        
        # Confirm before making changes
        confirm = input('\nDo you want to proceed with fixing these roles? (yes/no): ')
        if confirm.lower() != 'yes':
            self.stdout.write(self.style.WARNING('Operation cancelled'))
            return
        
        # Apply the fix
        try:
            with transaction.atomic():
                updated_count = users_to_fix.update(role='knowledge_partner')
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Successfully updated {updated_count} user(s) from '
                        f'knowledge_partner_admin to knowledge_partner'
                    )
                )
                
                # Verify the changes
                remaining = User.objects.filter(role='knowledge_partner_admin').count()
                if remaining == 0:
                    self.stdout.write(
                        self.style.SUCCESS('✅ All knowledge_partner_admin roles have been fixed')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'⚠️  Still {remaining} users with knowledge_partner_admin role')
                    )
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error updating roles: {str(e)}')
            )
            raise

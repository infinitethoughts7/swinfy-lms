"""
Django management command to safely clean the database while preserving superusers.

Usage: python manage.py clean_db

This command will:
1. Check if running in production or local environment
2. Show a warning about what will be deleted
3. Ask for confirmation (user must type "YES")
4. Delete all data EXCEPT superusers (is_superuser=True)
5. Preserve Django's built-in tables and migrations

What gets deleted:
- All non-superuser users (learners, instructors, knowledge partners, etc.)
- All user profiles (learner, instructor, KP profiles)
- All courses and course content (modules, lessons, resources)
- All enrollments and progress data
- All payments and payment history
- All OTP verifications
- All media files (course materials, profile pictures, etc.)

What gets preserved:
- Superuser accounts (is_superuser=True)
- Django migrations table
- Django admin log entries
- Django sessions (will be cleaned automatically)
"""

import os
import shutil
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import transaction
from django.contrib.auth import get_user_model
from django.apps import apps
from decouple import config

# Import all models that need to be cleaned
from users.models import User, KPProfile, KPInstructorProfile, LearnerProfile, OTPVerification
from courses.models import Course
from payments.models import Payment, PaymentWebhook, PaymentNotification, PaymentLog

# Get all course models
from courses.models.enrollment import Enrollment
from courses.models.progress import LessonProgress, CourseProgress
from courses.models.content import CourseModule, Lesson, LessonMaterial, CourseResource
from courses.models.attendance import AttendanceRecord


class Command(BaseCommand):
    help = 'Safely clean the database while preserving superusers'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Skip confirmation prompt (use with caution)',
        )
        parser.add_argument(
            '--no-media',
            action='store_true',
            help='Skip media files cleanup',
        )

    def handle(self, *args, **options):
        """Main command handler"""
        
        # Environment detection
        self.is_production = self.detect_environment()
        self.force = options.get('force', False)
        self.clean_media = not options.get('no_media', False)
        
        # Show environment info
        env_name = "PRODUCTION" if self.is_production else "LOCAL/DEVELOPMENT"
        self.stdout.write(
            self.style.WARNING(f"🌍 Environment: {env_name}")
        )
        
        # Show what will be preserved
        self.show_preservation_info()
        
        # Show what will be deleted
        self.show_deletion_info()
        
        # Get confirmation
        if not self.force:
            if not self.get_confirmation():
                self.stdout.write(
                    self.style.SUCCESS("❌ Operation cancelled by user.")
                )
                return
        
        # Perform the cleanup
        self.perform_cleanup()
        
        self.stdout.write(
            self.style.SUCCESS("✅ Database cleanup completed successfully!")
        )

    def detect_environment(self):
        """Detect if running in production or local environment"""
        # Check various environment indicators
        debug_mode = config('DEBUG', default=True, cast=bool)
        database_url = config('DATABASE_URL', default='')
        allowed_hosts = config('ALLOWED_HOSTS', default='localhost,127.0.0.1')
        
        # Production indicators
        is_production = (
            not debug_mode or
            'postgres' in database_url or
            'mysql' in database_url or
            '.ondigitalocean.app' in allowed_hosts or
            'herokuapp.com' in allowed_hosts or
            config('ENV', default='local').lower() in ['prod', 'production']
        )
        
        return is_production

    def show_preservation_info(self):
        """Show what will be preserved"""
        User = get_user_model()
        superuser_count = User.objects.filter(is_superuser=True).count()
        
        self.stdout.write(
            self.style.SUCCESS(f"\n🛡️  WHAT WILL BE PRESERVED:")
        )
        self.stdout.write(f"   • {superuser_count} superuser account(s)")
        self.stdout.write("   • Django system tables (migrations, admin logs)")
        self.stdout.write("   • Django sessions (auto-cleaned)")
        
        if superuser_count > 0:
            self.stdout.write("\n📋 Superuser accounts that will be preserved:")
            for user in User.objects.filter(is_superuser=True):
                self.stdout.write(f"   • {user.email} ({user.full_name})")

    def show_deletion_info(self):
        """Show what will be deleted with counts"""
        User = get_user_model()
        
        # Count what will be deleted
        non_superusers = User.objects.filter(is_superuser=False).count()
        courses_count = Course.objects.count()
        enrollments_count = Enrollment.objects.count()
        payments_count = Payment.objects.count()
        otp_count = OTPVerification.objects.count()
        attendance_count = AttendanceRecord.objects.count()
        
        self.stdout.write(
            self.style.ERROR(f"\n❌ WHAT WILL BE DELETED:")
        )
        self.stdout.write(f"   • {non_superusers} non-superuser accounts")
        self.stdout.write(f"   • {courses_count} courses (with all modules, lessons, materials)")
        self.stdout.write(f"   • {enrollments_count} enrollments (with all progress data)")
        self.stdout.write(f"   • {payments_count} payments (with all transaction history)")
        self.stdout.write(f"   • {otp_count} OTP verification records")
        self.stdout.write(f"   • {attendance_count} attendance records")
        self.stdout.write("   • All user profiles (learner, instructor, KP profiles)")
        self.stdout.write("   • All course resources and materials")
        self.stdout.write("   • All lesson and course progress tracking")
        
        if self.clean_media:
            self.stdout.write("   • All media files (uploads, course materials, profile pictures)")

    def get_confirmation(self):
        """Get user confirmation before proceeding"""
        env_name = "PRODUCTION" if self.is_production else "LOCAL"
        
        self.stdout.write(
            self.style.ERROR(f"\n⚠️  WARNING: This will permanently delete data from {env_name} environment!")
        )
        self.stdout.write(
            self.style.ERROR("This action CANNOT be undone!")
        )
        
        self.stdout.write(
            self.style.WARNING(f"\nTo confirm this destructive operation, type exactly: YES")
        )
        
        try:
            confirmation = input("Enter confirmation: ").strip()
        except (EOFError, KeyboardInterrupt):
            self.stdout.write("\n")
            return False
        
        return confirmation == "YES"

    def perform_cleanup(self):
        """Perform the actual database cleanup"""
        self.stdout.write("\n🧹 Starting database cleanup...")
        
        try:
            with transaction.atomic():
                # Delete in order to respect foreign key constraints
                
                # 1. Delete payment-related data first
                self.stdout.write("   • Deleting payment logs...")
                PaymentLog.objects.all().delete()
                
                self.stdout.write("   • Deleting payment notifications...")
                PaymentNotification.objects.all().delete()
                
                self.stdout.write("   • Deleting payment webhooks...")
                PaymentWebhook.objects.all().delete()
                
                self.stdout.write("   • Deleting payments...")
                Payment.objects.all().delete()
                
                # 2. Delete course progress and attendance data
                self.stdout.write("   • Deleting lesson progress...")
                LessonProgress.objects.all().delete()
                
                self.stdout.write("   • Deleting course progress...")
                CourseProgress.objects.all().delete()
                
                self.stdout.write("   • Deleting attendance records...")
                AttendanceRecord.objects.all().delete()
                
                # 3. Delete enrollments
                self.stdout.write("   • Deleting enrollments...")
                Enrollment.objects.all().delete()
                
                # 4. Delete course content (lessons, modules, resources)
                self.stdout.write("   • Deleting lesson materials...")
                LessonMaterial.objects.all().delete()
                
                self.stdout.write("   • Deleting lessons...")
                Lesson.objects.all().delete()
                
                self.stdout.write("   • Deleting course modules...")
                CourseModule.objects.all().delete()
                
                self.stdout.write("   • Deleting course resources...")
                CourseResource.objects.all().delete()
                
                # 5. Delete courses
                self.stdout.write("   • Deleting courses...")
                Course.objects.all().delete()
                
                # 6. Delete OTP verifications
                self.stdout.write("   • Deleting OTP verifications...")
                OTPVerification.objects.all().delete()
                
                # 7. Delete user profiles (must be done before users due to OneToOne relationships)
                self.stdout.write("   • Deleting instructor profiles...")
                KPInstructorProfile.objects.all().delete()
                
                self.stdout.write("   • Deleting learner profiles...")
                LearnerProfile.objects.all().delete()
                
                self.stdout.write("   • Deleting KP profiles...")
                KPProfile.objects.all().delete()
                
                # 8. Delete non-superuser accounts (this must be last)
                User = get_user_model()
                non_superuser_count = User.objects.filter(is_superuser=False).count()
                self.stdout.write(f"   • Deleting {non_superuser_count} non-superuser accounts...")
                User.objects.filter(is_superuser=False).delete()
                
                self.stdout.write(
                    self.style.SUCCESS("   ✅ Database cleanup completed successfully!")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"   ❌ Error during database cleanup: {str(e)}")
            )
            raise CommandError(f"Database cleanup failed: {str(e)}")
        
        # Clean media files if requested
        if self.clean_media:
            self.clean_media_files()

    def clean_media_files(self):
        """Clean uploaded media files"""
        self.stdout.write("\n🗂️  Cleaning media files...")
        
        media_root = settings.MEDIA_ROOT
        if not media_root or not os.path.exists(media_root):
            self.stdout.write("   • No media directory found, skipping...")
            return
        
        try:
            # Define directories to clean
            directories_to_clean = [
                'courses',
                'profiles', 
                'knowledge_partners',
            ]
            
            for directory in directories_to_clean:
                dir_path = os.path.join(media_root, directory)
                if os.path.exists(dir_path):
                    self.stdout.write(f"   • Deleting {directory}/ directory...")
                    shutil.rmtree(dir_path)
                    
            self.stdout.write(
                self.style.SUCCESS("   ✅ Media files cleaned successfully!")
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f"   ⚠️  Warning: Could not clean media files: {str(e)}")
            )

    def clean_django_sessions(self):
        """Clean expired Django sessions"""
        try:
            from django.core.management import call_command
            self.stdout.write("   • Cleaning expired sessions...")
            call_command('clearsessions', verbosity=0)
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f"   ⚠️  Could not clean sessions: {str(e)}")
            )

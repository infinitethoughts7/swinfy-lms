#!/usr/bin/env python
"""
Production fix script for registration issues.
This script addresses common production deployment issues.
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.template.loader import render_to_string
from django.core.mail import send_mail

def check_email_templates():
    """Ensure email templates are accessible."""
    print("🔍 Checking email templates...")
    
    try:
        # Test template rendering
        context = {
            'user_name': 'Test User',
            'otp_code': '123456',
            'purpose': 'email_verification',
            'expiry_minutes': 10,
            'site_name': 'Swinfy LMS',
            'support_email': settings.DEFAULT_FROM_EMAIL,
        }
        
        html_content = render_to_string('emails/otp_verification.html', context)
        text_content = render_to_string('emails/otp_verification.txt', context)
        
        print("✅ Email templates are accessible")
        return True
        
    except Exception as e:
        print(f"❌ Email template error: {e}")
        return False

def check_email_configuration():
    """Verify email configuration."""
    print("🔍 Checking email configuration...")
    
    required_settings = [
        'EMAIL_BACKEND',
        'EMAIL_HOST',
        'EMAIL_PORT',
        'EMAIL_USE_TLS',
        'EMAIL_HOST_USER',
        'DEFAULT_FROM_EMAIL'
    ]
    
    missing_settings = []
    for setting in required_settings:
        if not hasattr(settings, setting) or not getattr(settings, setting):
            missing_settings.append(setting)
    
    if missing_settings:
        print(f"❌ Missing email settings: {missing_settings}")
        return False
    else:
        print("✅ Email configuration looks good")
        return True

def test_email_sending():
    """Test email sending capability."""
    print("🔍 Testing email sending...")
    
    try:
        send_mail(
            subject='Production Test Email - Swinfy LMS',
            message='This is a test email to verify production email configuration.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.DEFAULT_FROM_EMAIL],  # Send to self
            fail_silently=False,
        )
        print("✅ Email sending test successful")
        return True
    except Exception as e:
        print(f"❌ Email sending test failed: {e}")
        return False

def run_migrations():
    """Ensure all migrations are applied."""
    print("🔍 Running migrations...")
    
    try:
        execute_from_command_line(['manage.py', 'migrate', '--noinput'])
        print("✅ Migrations completed")
        return True
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False

def collect_static():
    """Collect static files."""
    print("🔍 Collecting static files...")
    
    try:
        execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
        print("✅ Static files collected")
        return True
    except Exception as e:
        print(f"❌ Static collection error: {e}")
        return False

def main():
    """Run all production fixes."""
    print("🚀 PRODUCTION REGISTRATION FIX")
    print("=" * 40)
    
    checks = [
        ("Email Templates", check_email_templates),
        ("Email Configuration", check_email_configuration),
        ("Email Sending", test_email_sending),
        ("Migrations", run_migrations),
        ("Static Files", collect_static),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n{name}:")
        result = check_func()
        results.append((name, result))
    
    print("\n" + "=" * 40)
    print("📊 SUMMARY:")
    
    all_passed = True
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {name}: {status}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All checks passed! Registration should work now.")
    else:
        print("\n⚠️  Some checks failed. Please address the issues above.")
        print("\n💡 Common fixes:")
        print("  1. Ensure email templates are deployed to production")
        print("  2. Verify EMAIL_HOST_PASSWORD is correct")
        print("  3. Check that Gmail app password is valid")
        print("  4. Ensure all environment variables are set")

if __name__ == '__main__':
    main()

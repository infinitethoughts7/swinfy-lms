#!/usr/bin/env python
"""
Debug script to identify registration issues in production.
Run this script in your production environment to debug the 500 error.
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import timedelta
from users.models import User, OTPVerification
from users.utils import generate_otp, create_otp_verification

def test_email_configuration():
    """Test email configuration."""
    print("=== EMAIL CONFIGURATION TEST ===")
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print()

def test_email_templates():
    """Test if email templates exist."""
    print("=== EMAIL TEMPLATES TEST ===")
    try:
        # Test HTML template
        html_template = render_to_string('emails/otp_verification.html', {
            'user_name': 'Test User',
            'otp_code': '123456',
            'purpose': 'email_verification',
            'expiry_minutes': 10,
            'site_name': 'Swinfy LMS',
            'support_email': settings.DEFAULT_FROM_EMAIL,
        })
        print("✅ HTML template loaded successfully")
        print(f"Template length: {len(html_template)} characters")
    except Exception as e:
        print(f"❌ HTML template error: {e}")
    
    try:
        # Test text template
        text_template = render_to_string('emails/otp_verification.txt', {
            'user_name': 'Test User',
            'otp_code': '123456',
            'purpose': 'email_verification',
            'expiry_minutes': 10,
            'site_name': 'Swinfy LMS',
            'support_email': settings.DEFAULT_FROM_EMAIL,
        })
        print("✅ Text template loaded successfully")
        print(f"Template length: {len(text_template)} characters")
    except Exception as e:
        print(f"❌ Text template error: {e}")
    print()

def test_email_sending():
    """Test email sending."""
    print("=== EMAIL SENDING TEST ===")
    try:
        # Test basic email sending
        send_mail(
            subject='Test Email - Swinfy LMS',
            message='This is a test email to verify email configuration.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['rockyg.swinfy@gmail.com'],  # Use your email for testing
            fail_silently=False,
        )
        print("✅ Test email sent successfully")
    except Exception as e:
        print(f"❌ Email sending error: {e}")
    print()

def test_otp_generation():
    """Test OTP generation."""
    print("=== OTP GENERATION TEST ===")
    try:
        otp = generate_otp()
        print(f"✅ OTP generated: {otp}")
        print(f"OTP length: {len(otp)}")
    except Exception as e:
        print(f"❌ OTP generation error: {e}")
    print()

def test_database_operations():
    """Test database operations."""
    print("=== DATABASE OPERATIONS TEST ===")
    try:
        # Test User model
        user_count = User.objects.count()
        print(f"✅ User model accessible. Count: {user_count}")
        
        # Test OTPVerification model
        otp_count = OTPVerification.objects.count()
        print(f"✅ OTPVerification model accessible. Count: {otp_count}")
        
        # Test creating an OTP (without sending email)
        test_email = 'test@example.com'
        otp_code = generate_otp()
        expires_at = timezone.now() + timedelta(minutes=10)
        
        otp_verification = OTPVerification.objects.create(
            user=None,
            email=test_email,
            otp_code=otp_code,
            purpose='email_verification',
            expires_at=expires_at,
            temp_user_data={'test': 'data'}
        )
        print(f"✅ OTPVerification created successfully. ID: {otp_verification.id}")
        
        # Clean up
        otp_verification.delete()
        print("✅ Test OTPVerification cleaned up")
        
    except Exception as e:
        print(f"❌ Database operations error: {e}")
    print()

def test_full_registration_flow():
    """Test the full registration flow."""
    print("=== FULL REGISTRATION FLOW TEST ===")
    try:
        # Test data
        test_data = {
            'email': 'test@example.com',
            'full_name': 'Test User',
            'password': 'testpassword123'
        }
        
        # Test create_otp_verification function
        otp_verification = create_otp_verification(
            user=None,
            email=test_data['email'],
            purpose='email_verification',
            expiry_minutes=10,
            temp_user_data={
                'email': test_data['email'],
                'full_name': test_data['full_name'],
                'password': test_data['password'],
                'role': 'learner',
                'is_verified': False,
                'is_approved': True,
                'is_active': True,
            }
        )
        
        if otp_verification:
            print("✅ create_otp_verification function worked")
            print(f"OTP ID: {otp_verification.id}")
            print(f"OTP Code: {otp_verification.otp_code}")
            
            # Clean up
            otp_verification.delete()
            print("✅ Test OTPVerification cleaned up")
        else:
            print("❌ create_otp_verification function failed")
            
    except Exception as e:
        print(f"❌ Full registration flow error: {e}")
    print()

def main():
    """Run all tests."""
    print("🔍 DEBUGGING REGISTRATION ISSUES IN PRODUCTION")
    print("=" * 50)
    print()
    
    test_email_configuration()
    test_email_templates()
    test_otp_generation()
    test_database_operations()
    test_email_sending()
    test_full_registration_flow()
    
    print("=" * 50)
    print("✅ Debug complete! Check the results above to identify the issue.")

if __name__ == '__main__':
    main()

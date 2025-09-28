"""
Utility functions for OTP verification system.
"""
import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.core.cache import cache
from .models import OTPVerification, User


def generate_otp(length=6):
    """
    Generate a random OTP code.
    
    Args:
        length (int): Length of the OTP code (default: 6)
    
    Returns:
        str: Random OTP code
    """
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(user, otp_code, purpose='email_verification', email=None):
    """
    Send OTP code via email using Django's email system.
    
    Args:
        user (User): User instance (can be None for pending registrations)
        otp_code (str): OTP code to send
        purpose (str): Purpose of the OTP (email_verification, password_reset, etc.)
        email (str): Email address (used when user is None)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Determine email address and user name
        if user:
            email_address = user.email
            user_name = user.full_name
        else:
            email_address = email
            user_name = "User"  # Default name for pending registrations
        
        # Email context
        context = {
            'user_name': user_name,
            'otp_code': otp_code,
            'purpose': purpose,
            'expiry_minutes': 10,  # OTP expires in 10 minutes
            'site_name': 'Swinfy LMS',
            'support_email': settings.DEFAULT_FROM_EMAIL,
        }
        
        # Render email templates
        html_message = render_to_string('emails/otp_verification.html', context)
        plain_message = render_to_string('emails/otp_verification.txt', context)
        
        # Email subject based on purpose
        subject_map = {
            'email_verification': 'Verify Your Email - Swinfy LMS',
            'password_reset': 'Reset Your Password - Swinfy LMS',
            'login_verification': 'Login Verification - Swinfy LMS',
        }
        subject = subject_map.get(purpose, 'Verification Code - Swinfy LMS')
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email_address],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        # Log error silently
        return False


def is_otp_valid(otp_verification):
    """
    Check if OTP is still valid (not expired and within attempt limits).
    
    Args:
        otp_verification (OTPVerification): OTP verification instance
    
    Returns:
        bool: True if OTP is valid, False otherwise
    """
    if not otp_verification:
        return False
    
    # Check if already verified
    if otp_verification.is_verified:
        return False
    
    # Check if expired
    if otp_verification.is_expired():
        return False
    
    # Check if max attempts exceeded
    if otp_verification.attempts >= otp_verification.max_attempts:
        return False
    
    return True


def cleanup_expired_otps():
    """
    Clean up expired OTPs from the database.
    This function should be called periodically via a cron job or Celery task.
    
    Returns:
        int: Number of expired OTPs deleted
    """
    expired_otps = OTPVerification.objects.filter(
        expires_at__lt=timezone.now()
    )
    
    count = expired_otps.count()
    expired_otps.delete()
    
    return count


def create_otp_verification(user, email, purpose='email_verification', expiry_minutes=10, temp_user_data=None):
    """
    Create a new OTP verification record and send the OTP via email.
    
    Args:
        user (User): User instance (can be None for pending registrations)
        email (str): Email address to send OTP to
        purpose (str): Purpose of the OTP
        expiry_minutes (int): OTP expiry time in minutes
        temp_user_data (dict): Temporary user data for pending registrations
    
    Returns:
        OTPVerification: Created OTP verification instance or None if failed
    """
    try:
        # Generate OTP code
        otp_code = generate_otp()
        
        # Calculate expiry time
        expires_at = timezone.now() + timedelta(minutes=expiry_minutes)
        
        # Create OTP verification record
        otp_verification = OTPVerification.objects.create(
            user=user,
            email=email,
            otp_code=otp_code,
            purpose=purpose,
            expires_at=expires_at,
            temp_user_data=temp_user_data,
        )
        
        # Send OTP via email
        if send_otp_email(user, otp_code, purpose, email):
            return otp_verification
        else:
            # If email sending failed, delete the OTP record
            otp_verification.delete()
            return None
            
    except Exception as e:
        # Log error silently
        return None


def verify_otp_code(email, otp_code, purpose='email_verification'):
    """
    Verify an OTP code for a given email and purpose.
    
    Args:
        email (str): Email address
        otp_code (str): OTP code to verify
        purpose (str): Purpose of the OTP
    
    Returns:
        dict: Result dictionary with success status and message
    """
    try:
        # Find the most recent OTP for this email and purpose
        otp_verification = OTPVerification.objects.filter(
            email=email,
            purpose=purpose,
            is_verified=False
        ).order_by('-created_at').first()
        
        # Check if the OTP code matches
        if not otp_verification or otp_verification.otp_code != otp_code:
            return {
                'success': False,
                'message': 'Invalid OTP code. Please check the code and try again.',
                'error_code': 'INVALID_OTP'
            }
        
        # Check if OTP is still valid
        if not is_otp_valid(otp_verification):
            if otp_verification.is_expired():
                return {
                    'success': False,
                    'message': 'OTP has expired. Please request a new one.',
                    'error_code': 'OTP_EXPIRED'
                }
            elif otp_verification.attempts >= otp_verification.max_attempts:
                return {
                    'success': False,
                    'message': 'Maximum verification attempts exceeded. Please request a new OTP.',
                    'error_code': 'MAX_ATTEMPTS_EXCEEDED'
                }
            else:
                return {
                    'success': False,
                    'message': 'OTP is no longer valid.',
                    'error_code': 'OTP_INVALID'
                }
        
        # Increment attempt count
        otp_verification.attempts += 1
        
        # Check if OTP code matches
        if otp_verification.otp_code == otp_code:
            # Mark as verified
            otp_verification.is_verified = True
            otp_verification.save()
            
            # Mark user as verified if this is email verification and user exists
            if purpose == 'email_verification' and otp_verification.user:
                user = otp_verification.user
                user.is_verified = True
                user.save()
            
            # For password reset, keep it verified so it can be used for password reset
            # The reset password view will handle marking it as used
            
            return {
                'success': True,
                'message': 'OTP verified successfully.',
                'otp_verification': otp_verification
            }
        else:
            # OTP code doesn't match
            otp_verification.save()  # Save the incremented attempt count
            
            remaining_attempts = otp_verification.max_attempts - otp_verification.attempts
            
            if remaining_attempts > 0:
                return {
                    'success': False,
                    'message': f'Invalid OTP code. {remaining_attempts} attempts remaining.',
                    'error_code': 'INVALID_OTP',
                    'remaining_attempts': remaining_attempts
                }
            else:
                return {
                    'success': False,
                    'message': 'Invalid OTP code. Maximum attempts exceeded. Please request a new OTP.',
                    'error_code': 'MAX_ATTEMPTS_EXCEEDED'
                }
                
    except Exception as e:
        # Log error silently
        return {
            'success': False,
            'message': 'An error occurred during verification. Please try again.',
            'error_code': 'VERIFICATION_ERROR'
        }


def get_rate_limit_key(email, purpose='email_verification'):
    """
    Get cache key for rate limiting OTP requests.
    
    Args:
        email (str): Email address
        purpose (str): Purpose of the OTP
    
    Returns:
        str: Cache key for rate limiting
    """
    return f"otp_rate_limit:{email}:{purpose}"


def check_rate_limit(email, purpose='email_verification', max_requests=3, window_minutes=10):
    """
    Check if user has exceeded rate limit for OTP requests.
    
    Args:
        email (str): Email address
        purpose (str): Purpose of the OTP
        max_requests (int): Maximum requests allowed in the time window
        window_minutes (int): Time window in minutes
    
    Returns:
        dict: Rate limit check result
    """
    cache_key = get_rate_limit_key(email, purpose)
    
    # Get current request count
    current_requests = cache.get(cache_key, 0)
    
    if current_requests >= max_requests:
        return {
            'allowed': False,
            'message': f'Too many OTP requests. Please wait {window_minutes} minutes before requesting another OTP.',
            'retry_after': window_minutes * 60  # seconds
        }
    
    return {
        'allowed': True,
        'current_requests': current_requests,
        'max_requests': max_requests
    }


def increment_rate_limit(email, purpose='email_verification', window_minutes=10):
    """
    Increment the rate limit counter for OTP requests.
    
    Args:
        email (str): Email address
        purpose (str): Purpose of the OTP
        window_minutes (int): Time window in minutes
    """
    cache_key = get_rate_limit_key(email, purpose)
    
    # Get current count and increment
    current_requests = cache.get(cache_key, 0)
    cache.set(cache_key, current_requests + 1, timeout=window_minutes * 60)

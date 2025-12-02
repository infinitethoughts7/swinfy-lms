"""
This module handles ALL OTP business logic.
Follows Single Responsibility Principle (SRP) - manages OTP workflow.

Responsibilities:
- Generate OTP codes
- Validate rate limits
- Calculate expiry times
- Orchestrate OTP sending (uses EmailService + OTPRepository)
- Verify OTP codes
"""

import logging
import random
import string
from django.utils import timezone
from datetime import timedelta
from users.models import User
from users.repositories import otp_repository
from users.services.email_service import EmailService

logger = logging.getLogger(__name__)


class OTPService:
    """
    OTP business logic service.
    
    Orchestrates OTP workflow using EmailService and OTPRepository.
    Handles rate limiting, generation, validation, and verification.
    """
    
    # Configuration constants
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_OTPS_PER_HOUR = 3
    RATE_LIMIT_WINDOW_MINUTES = 60
    
    @staticmethod
    def generate_otp_code():
        """
        Generate a random 6-digit OTP code.
        
        Returns:
            str: 6-digit numeric code
        """
        return ''.join(random.choices(string.digits, k=OTPService.OTP_LENGTH))
    
    @staticmethod
    def calculate_expiry():
        """
        Calculate OTP expiry time (current time + expiry minutes).
        
        Returns:
            datetime: Expiry timestamp
        """
        return timezone.now() + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)
    
    @staticmethod
    def check_rate_limit(email, purpose):
        """
        Check if user has exceeded OTP rate limit.
        
        Args:
            email (str): Email address
            purpose (str): OTP purpose
            
        Returns:
            tuple: (bool, str) - (is_allowed, error_message)
        """
        recent_count = otp_repository.count_recent_otps(
            email=email,
            purpose=purpose,
            minutes=OTPService.RATE_LIMIT_WINDOW_MINUTES
        )
        
        if recent_count >= OTPService.MAX_OTPS_PER_HOUR:
            logger.warning(f"Rate limit exceeded for {email} - {purpose}")
            return False, f"Too many requests. Please try again after {OTPService.RATE_LIMIT_WINDOW_MINUTES} minutes."
        
        return True, ""
    
    @staticmethod
    def send_otp(email, purpose, user=None, temp_user_data=None):
        """
        Generate and send OTP to email address.
        
        This is the main method - handles complete OTP sending workflow.
        Works for: registration, password reset, login verification, etc.
        
        Args:
            email (str): Email address
            purpose (str): OTP purpose ('email_verification', 'password_reset', etc.)
            user (User, optional): User object (for existing users)
            temp_user_data (dict, optional): Temporary data for pending registrations
            
        Returns:
            tuple: (bool, str) - (success, message)
        """
        # Step 1: Validate email format
        if not EmailService.is_valid_email(email):
            logger.error(f"Invalid email format: {email}")
            return False, "Invalid email format"
        
        # Step 2: Check rate limit
        is_allowed, error_msg = OTPService.check_rate_limit(email, purpose)
        if not is_allowed:
            return False, error_msg
        
        # Step 3: Generate OTP code
        otp_code = OTPService.generate_otp_code()
        logger.info(f"Generated OTP for {email} - {purpose}")
        
        # Step 4: Calculate expiry
        expires_at = OTPService.calculate_expiry()
        
        # Step 5: Save to database
        try:
            otp_record = otp_repository.create(
                email=email,
                otp_code=otp_code,
                purpose=purpose,
                expires_at=expires_at,
                user=user,
                temp_user_data=temp_user_data
            )
        except Exception as e:
            logger.error(f"Failed to create OTP record: {str(e)}")
            return False, "Failed to create OTP. Please try again."
        
        # Step 6: Send email
        try:
            # Import email_service here to avoid circular import issues
            from users.services import email_service
            
            # Get user object for email (or create temp user object)
            if user:
                email_user = user
            else:
                # Create temporary user object for email template
                class TempUser:
                    def __init__(self, email, full_name="User"):
                        self.email = email
                        self.full_name = full_name
                
                # Try to get name from temp_user_data
                name = "User"
                if temp_user_data and 'full_name' in temp_user_data:
                    name = temp_user_data['full_name']
                
                email_user = TempUser(email, name)
            
            # Send OTP email
            email_sent = email_service.send_otp_email(
                user=email_user,
                otp_code=otp_code,
                purpose=purpose.replace('_', ' ').title(),
                expires_in_minutes=OTPService.OTP_EXPIRY_MINUTES
            )
            
            if not email_sent:
                logger.error(f"Failed to send OTP email to {email}")
                return False, "Failed to send email. Please try again."
            
            logger.info(f"OTP sent successfully to {email} - {purpose}")
            return True, "OTP sent successfully. Please check your email."
            
        except Exception as e:
            logger.error(f"Error sending OTP email: {str(e)}")
            return False, "Failed to send email. Please try again."
    
    @staticmethod
    def verify_otp(email, otp_code, purpose):
        """
        Verify OTP code entered by user.
        
        Checks:
        - OTP exists
        - Not already verified
        - Not expired
        - Attempts not exceeded
        - Code matches
        
        Args:
            email (str): Email address
            otp_code (str): OTP code to verify
            purpose (str): OTP purpose
            
        Returns:
            tuple: (bool, str, OTPVerification or None) 
                   (success, message, otp_record)
        """
        # Get OTP record
        otp_record = otp_repository.get_by_email_code_and_purpose(
            email=email,
            otp_code=otp_code,
            purpose=purpose
        )
        
        if not otp_record:
            logger.warning(f"Invalid OTP attempt for {email} - {purpose}")
            return False, "Invalid OTP code", None
        
        # Check if already verified
        if otp_record.is_verified:
            logger.warning(f"OTP already verified for {email}")
            return False, "OTP already used", None
        
        # Check if expired
        if otp_record.is_expired():
            logger.warning(f"Expired OTP for {email}")
            return False, "OTP has expired. Please request a new one.", None
        
        # Check attempts limit
        if not otp_record.can_attempt_verification():
            logger.warning(f"Max attempts exceeded for {email}")
            return False, "Maximum verification attempts exceeded. Please request a new OTP.", None
        
        # Increment attempts
        otp_repository.increment_attempts(otp_record)
        
        # Verify code (already checked in query, but double-check)
        if otp_record.otp_code != otp_code:
            logger.warning(f"OTP mismatch for {email}")
            return False, "Invalid OTP code", None
        
        # Mark as verified
        otp_repository.mark_as_verified(otp_record)
        
        logger.info(f"OTP verified successfully for {email} - {purpose}")
        return True, "OTP verified successfully", otp_record
    
    @staticmethod
    def resend_otp(email, purpose):
        """
        Resend OTP (generates new code).
        
        Convenience method - just calls send_otp again.
        Rate limiting will prevent abuse.
        
        Args:
            email (str): Email address
            purpose (str): OTP purpose
            
        Returns:
            tuple: (bool, str) - (success, message)
        """
        logger.info(f"Resending OTP to {email} - {purpose}")
        
        # Try to get existing user if purpose is not registration
        user = None
        if purpose != 'email_verification':
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
        
        return OTPService.send_otp(email, purpose, user=user)
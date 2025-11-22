"""
This module handles ALL database operations for OTP records.
Follows Single Responsibility Principle (SRP) - ONLY data access.

Business logic (OTP generation, validation, rate limiting) belongs in OTPService.
"""

import logging
from django.utils import timezone
from datetime import timedelta
from users.models import OTPVerification

logger = logging.getLogger(__name__)


class OTPRepository:
    """
    Repository for OTP database operations.
    
    Handles CRUD operations for OTPVerification model.
    No business logic - pure data access layer.
    """
    
    @staticmethod
    def create(email, otp_code, purpose, expires_at, user=None, temp_user_data=None):
        """
        Create a new OTP record in database.
        
        Args:
            email (str): Email address
            otp_code (str): 6-digit OTP code
            purpose (str): Purpose ('email_verification', 'password_reset', etc.)
            expires_at (datetime): When OTP expires
            user (User, optional): User object (null for pending registrations)
            temp_user_data (dict, optional): Temporary registration data
            
        Returns:
            OTPVerification: Created OTP record
        """
        try:
            otp_record = OTPVerification.objects.create(
                email=email,
                otp_code=otp_code,
                purpose=purpose,
                expires_at=expires_at,
                user=user,
                temp_user_data=temp_user_data
            )
            logger.info(f"OTP created for {email} - {purpose}")
            return otp_record
        except Exception as e:
            logger.error(f"Failed to create OTP for {email}: {str(e)}")
            raise
    
    @staticmethod
    def get_by_email_and_purpose(email, purpose):
        """
        Get the most recent OTP for an email and purpose.
        
        Args:
            email (str): Email address
            purpose (str): OTP purpose
            
        Returns:
            OTPVerification or None: Most recent OTP record
        """
        try:
            return OTPVerification.objects.filter(
                email=email,
                purpose=purpose
            ).order_by('-created_at').first()
        except Exception as e:
            logger.error(f"Error fetching OTP for {email}: {str(e)}")
            return None
    
    @staticmethod
    def get_by_email_code_and_purpose(email, otp_code, purpose):
        """
        Get OTP by email, code, and purpose (for verification).
        
        Args:
            email (str): Email address
            otp_code (str): OTP code to verify
            purpose (str): OTP purpose
            
        Returns:
            OTPVerification or None: Matching OTP record
        """
        try:
            return OTPVerification.objects.filter(
                email=email,
                otp_code=otp_code,
                purpose=purpose,
                is_verified=False
            ).first()
        except Exception as e:
            logger.error(f"Error fetching OTP for verification: {str(e)}")
            return None
    
    @staticmethod
    def mark_as_verified(otp_record):
        """
        Mark an OTP as verified.
        
        Args:
            otp_record (OTPVerification): OTP record to update
            
        Returns:
            bool: True if successful
        """
        try:
            otp_record.is_verified = True
            otp_record.save(update_fields=['is_verified'])
            logger.info(f"OTP verified for {otp_record.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to mark OTP as verified: {str(e)}")
            return False
    
    @staticmethod
    def increment_attempts(otp_record):
        """
        Increment verification attempt counter.
        
        Args:
            otp_record (OTPVerification): OTP record to update
            
        Returns:
            int: New attempt count
        """
        try:
            otp_record.attempts += 1
            otp_record.save(update_fields=['attempts'])
            logger.info(f"OTP attempt incremented for {otp_record.email} - Attempt {otp_record.attempts}")
            return otp_record.attempts
        except Exception as e:
            logger.error(f"Failed to increment attempts: {str(e)}")
            return otp_record.attempts
    
    @staticmethod
    def count_recent_otps(email, purpose, minutes=60):
        """
        Count OTPs created in the last N minutes (for rate limiting).
        
        Args:
            email (str): Email address
            purpose (str): OTP purpose
            minutes (int): Time window in minutes (default: 60)
            
        Returns:
            int: Number of OTPs created in time window
        """
        try:
            time_threshold = timezone.now() - timedelta(minutes=minutes)
            count = OTPVerification.objects.filter(
                email=email,
                purpose=purpose,
                created_at__gte=time_threshold
            ).count()
            logger.debug(f"Recent OTP count for {email}: {count} in last {minutes} minutes")
            return count
        except Exception as e:
            logger.error(f"Error counting recent OTPs: {str(e)}")
            return 0
    
    @staticmethod
    def delete_otp(otp_record):
        """
        Delete an OTP record.
        
        Args:
            otp_record (OTPVerification): OTP record to delete
            
        Returns:
            bool: True if successful
        """
        try:
            otp_record.delete()
            logger.info(f"OTP deleted for {otp_record.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete OTP: {str(e)}")
            return False
    
    @staticmethod
    def delete_expired_otps():
        """
        Delete all expired OTPs (cleanup operation).
        
        Returns:
            int: Number of OTPs deleted
        """
        try:
            now = timezone.now()
            expired_otps = OTPVerification.objects.filter(expires_at__lt=now)
            count = expired_otps.count()
            expired_otps.delete()
            logger.info(f"Deleted {count} expired OTPs")
            return count
        except Exception as e:
            logger.error(f"Failed to delete expired OTPs: {str(e)}")
            return 0
    
    @staticmethod
    def get_all_by_email(email):
        """
        Get all OTP records for an email (for admin/debugging).
        
        Args:
            email (str): Email address
            
        Returns:
            QuerySet: All OTP records for this email
        """
        return OTPVerification.objects.filter(email=email).order_by('-created_at')
"""
Email Service Module for OLLA LMS

This module handles ALL email sending operations for the platform.
Follows Single Responsibility Principle (SRP) - ONLY sends emails.

Business logic (OTP creation, rate limiting, validation) belongs elsewhere.
This service is responsible ONLY for formatting and sending emails.
"""

import logging
import re
from django.conf import settings
from users.adapters.email.base import EmailProviderInterface
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

# Initialize logger for email operations
logger = logging.getLogger(__name__)


class EmailService:
    """
    Centralized email service following SRP and DIP.
    
    Depends on EmailProviderInterface abstraction, not concrete implementations.
    All email methods use the core send_email() method for consistency.
    """
    
    def __init__(self, provider: EmailProviderInterface):
        """Initialize with an email provider (DIP - depend on abstraction)."""
        self.provider = provider
    
    @staticmethod
    def is_valid_email(email):
        """
        Validate email format.
        
        Args:
            email (str): Email address to validate
            
        Returns:
            bool: True if valid email format
        """
        if not email:
            return False
        try: 
            validate_email(email)
            return True 
        except ValidationError: 
            return False
    
    def send_email(self, to_email, subject, message):
        """
        Core email sending - delegates to provider.
        
        Args:
            to_email (str): Recipient email address
            subject (str): Email subject line
            message (str): Plain text email body
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        # Validate email before sending
        if not self.is_valid_email(to_email):
            logger.error(f"Invalid email format: {to_email}")
            return False
        
        # Delegate to provider - now handles tuple return
        success, error_msg = self.provider.send(to_email, subject, message)
        
        if not success:
            logger.error(f"Failed to send email to {to_email}: {error_msg}")
        
        return success
    
    def send_otp_email(self, user, otp_code, purpose, expires_in_minutes=10):
        """
        Send OTP verification email to user.
        
        Used for: Email verification, password reset, contact form verification.
        Note: OTP generation happens in the view/service layer, not here.
        
        Args:
            user: User model instance
            otp_code (str): The generated OTP code
            purpose (str): What the OTP is for (e.g., "email verification", "password reset")
            expires_in_minutes (int): How long the OTP is valid
            
        Returns:
            bool: True if sent successfully
        """
        subject = f"Your OLLA LMS Verification Code"
        
        message = f"""Hello {user.full_name.split()[0] or 'there'},

Your verification code for {purpose} is: {otp_code}

This code will expire in {expires_in_minutes} minutes.

If you did not request this code, please ignore this email.

Best regards, OLLA LMS Team
"""
        
        return self.send_email(user.email, subject, message)
    
    def send_password_changed_email(self, user):
        """
        Send confirmation email after password change.
        
        Security notification - alerts user their password was changed.
        If they didn't make this change, they know to take action.
        
        Args:
            user: User model instance
            
        Returns:
            bool: True if sent successfully
        """
        subject = "Password Changed Successfully - OLLA LMS"
        
        message = f"""Hello {user.full_name.split()[0] or 'there'},

Your password has been changed successfully.

If you did not make this change, please contact our support team immediately.

Best regards,
OLLA LMS Team
"""
        
        return self.send_email(user.email, subject, message)
    
    def send_password_reset_confirmation(self, user):
        """
        Send confirmation after password reset is complete.
        
        Different from password_changed - this is specifically for resets via OTP.
        Provides reassurance that the reset process completed successfully.
        
        Args:
            user: User model instance
            
        Returns:
            bool: True if sent successfully
        """
        subject = "Password Reset Successful - OLLA LMS"
        
        message = f"""Hello {user.full_name.split()[0] or 'there'},

Your password has been reset successfully. You can now log in with your new password.

If you did not request this password reset, please contact our support team immediately.

Best regards,
OLLA LMS Team
"""
        
        return self.send_email(user.email, subject, message)
    
    def send_instructor_invitation(self, instructor_user, kp_name, temp_password):
        """
        Send invitation email to new instructor with login credentials.
        
        Sent when a Knowledge Partner adds an instructor to their team.
        Includes temporary password - instructor should change on first login.
        
        Args:
            instructor_user: Instructor User model instance
            kp_name (str): Knowledge Partner organization name
            temp_password (str): Temporary password for first login
            
        Returns:
            bool: True if sent successfully
        """
        subject = f"Welcome to {kp_name} on OLLA LMS"
        
        message = f"""Hello {instructor_user.full_name.split()[0]},

You have been invited to join {kp_name} as an Instructor on OLLA LMS!

Your login credentials:
Email: {instructor_user.email}
Temporary Password: {temp_password}

Please log in and change your password immediately.

Login here: https://olla.co.in

Best regards,
OLLA LMS Team
"""
        
        return self.send_email(instructor_user.email, subject, message)
    
    def send_admin_notification(self, application_data):
        """
        Notify admin that a new Knowledge Partner application was submitted.
        
        Alerts admin team to review and approve/reject the application.
        Contains key details for quick review.
        
        Args:
            application_data (dict): Should contain:
                - kp_name (str): Knowledge Partner organization name
                - admin_name (str): Admin's first name
                - admin_email (str): Admin's email address
                - application_id (int): ID for reference
                
        Returns:
            bool: True if sent successfully
        """
        subject = "New Knowledge Partner Application - OLLA LMS"
        
        # Extract data with defaults to avoid KeyError
        kp_name = application_data.get('kp_name', 'Unknown')
        admin_name = application_data.get('admin_name', 'Admin')
        admin_email = application_data.get('admin_email')
        app_id = application_data.get('application_id', 'N/A')
        
        message = f"""Hello {admin_name},

A new Knowledge Partner application has been submitted:

Organization: {kp_name}
Admin Email: {admin_email}
Application ID: {app_id}

Please review this application in the admin dashboard.

Best regards,
OLLA LMS System
"""
        
        # Send to admin email from application_data
        return self.send_email(settings.EMAIL_HOST_USER, subject, message)
    
    def send_kp_approval_email(self, kp_name, admin_email, temp_password):
        """
        Send approval notification to Knowledge Partner with login credentials.
        
        Congratulates KP on approval and provides login details.
        Includes temporary password that should be changed immediately.
        
        Args:
            kp_name (str): Knowledge Partner organization name
            admin_email (str): KP admin's email address
            temp_password (str): Temporary password for first login
            
        Returns:
            bool: True if sent successfully
        """
        subject = "Congratulations! Your Knowledge Partner Application is Approved"
        
        message = f"""Congratulations!

Your Knowledge Partner application for {kp_name} has been approved!

Your login credentials:
Email: {admin_email}
Temporary Password: {temp_password}

Please log in and change your password immediately: https://olla.co.in

You can now:
- Add instructors to your team
- Create and manage courses
- Track student enrollments
- Access analytics and reports

Welcome to OLLA LMS!

Best regards, OLLA LMS Team
"""
        
        return self.send_email(admin_email, subject, message)



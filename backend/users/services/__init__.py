"""
Services module - Business logic ONLY

All business logic, workflows, and orchestration go here.
NO direct database queries, NO HTTP handling.
"""

from .otp_service import OTPService
from .email_service import EmailService
from .user_service import UserService
from .auth_service import AuthService
from .profile_service import ProfileService
from .kp_service import KPService

# Import email adapter
from users.adapters.email.gmail_adapter import GmailAdapter

# Create singleton instances
otp_service = OTPService()
email_service = EmailService(provider=GmailAdapter())
user_service = UserService()
auth_service = AuthService()
profile_service = ProfileService()
kp_service = KPService()

__all__ = [
    'OTPService',
    'EmailService',
    'UserService',
    'AuthService',
    'ProfileService',
    'KPService',
    'otp_service',
    'email_service',
    'user_service',
    'auth_service',
    'profile_service',
    'kp_service',
]

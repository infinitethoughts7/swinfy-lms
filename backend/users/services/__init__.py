"""
Services module - Business logic ONLY

All business logic, workflows, and orchestration go here.
NO direct database queries, NO HTTP handling.
"""

from decouple import config
from .otp_service import OTPService
from .email_service import EmailService
from .user_service import UserService
from .auth_service import AuthService
from .profile_service import ProfileService
from .kp_service import KPService
from .oauth_service import OAuthService

# Import email adapters
from users.adapters.email.gmail_adapter import GmailAdapter
from users.adapters.email.resend_adapter import ResendAdapter


def get_email_provider():
    """Select email provider based on EMAIL_PROVIDER environment variable."""
    provider = config('EMAIL_PROVIDER', default='gmail').lower()
    if provider == 'resend':
        return ResendAdapter()
    return GmailAdapter()


# Create singleton instances
otp_service = OTPService()
email_service = EmailService(provider=get_email_provider())
user_service = UserService()
auth_service = AuthService()
profile_service = ProfileService()
kp_service = KPService()
oauth_service = OAuthService()

__all__ = [
    'OTPService',
    'EmailService',
    'UserService',
    'AuthService',
    'ProfileService',
    'KPService',
    'OAuthService',
    'otp_service',
    'email_service',
    'user_service',
    'auth_service',
    'profile_service',
    'kp_service',
    'oauth_service',
]

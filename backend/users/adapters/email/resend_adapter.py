"""Resend HTTP API email provider implementation."""

import logging
from typing import Tuple
from django.conf import settings
from users.adapters.email.base import EmailProviderInterface

logger = logging.getLogger(__name__)


class ResendAdapter(EmailProviderInterface):
    """Resend HTTP API email provider - works when SMTP ports are blocked."""
    
    def __init__(self):
        """Initialize with Resend API key from settings."""
        try:
            import resend
            self.resend = resend
            self.resend.api_key = getattr(settings, 'RESEND_API_KEY', '')
            self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@olla.co.in')
        except ImportError:
            logger.error("Resend package not installed. Run: pip install resend")
            self.resend = None
    
    def send(self, to_email: str, subject: str, message: str) -> Tuple[bool, str]:
        """Send email via Resend HTTP API."""
        if not self.resend:
            return False, "Resend package not installed"
        
        if not self.resend.api_key:
            return False, "RESEND_API_KEY not configured"
        
        try:
            params = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "text": message,
            }
            
            email = self.resend.Emails.send(params)
            logger.info(f"Email sent via Resend to {to_email}, id: {email.get('id', 'unknown')}")
            return True, ""
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Resend send failed to {to_email}: {error_msg}")
            return False, error_msg

"""Gmail SMTP email provider implementation."""

import logging
from typing import Tuple
from django.core.mail import send_mail
from django.conf import settings
from users.adapters.email.base import EmailProviderInterface

logger = logging.getLogger(__name__)


class GmailAdapter(EmailProviderInterface):
    """Gmail SMTP email provider using Django's send_mail."""
    
    def send(self, to_email: str, subject: str, message: str) -> Tuple[bool, str]:
        """Send email via Gmail SMTP."""
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            logger.info(f"Email sent via Gmail to {to_email}")
            return True, ""
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Gmail send failed to {to_email}: {error_msg}")
            return False, error_msg
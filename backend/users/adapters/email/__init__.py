"""Email provider interfaces and implementations."""

from .base import EmailProviderInterface
from .gmail_adapter import GmailAdapter
from .resend_adapter import ResendAdapter

__all__ = ['EmailProviderInterface', 'GmailAdapter', 'ResendAdapter']


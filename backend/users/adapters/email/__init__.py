"""Email provider interfaces and implementations."""

from .base import EmailProviderInterface
from .gmail_adapter import GmailAdapter

__all__ = ['EmailProviderInterface', 'GmailAdapter']


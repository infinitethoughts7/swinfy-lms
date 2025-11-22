"""Abstract interface for email providers - enables easy provider switching."""

from abc import ABC, abstractmethod
from typing import Tuple


class EmailProviderInterface(ABC):
    """Contract that all email providers must follow (DIP)."""
    
    @abstractmethod
    def send(self, to_email: str, subject: str, message: str) -> Tuple[bool, str]:
        """
        Send email.
        
        Args:
            to_email: Recipient email address
            subject: Email subject line
            message: Email body content
            
        Returns:
            Tuple[bool, str]: (success, error_message)
            - (True, "") if successful
            - (False, "error details") if failed
        """
        pass
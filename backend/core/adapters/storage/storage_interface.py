from abc import ABC, abstractmethod 
from typing import Tuple, Optional


class StorageProviderInterface(ABC):
    """
    Abstract base class for storage providers.
    Dependency Inversion: Services depend on this interface, not concrete implementations.
    
    Tomorrow you can swap DigitalOcean Spaces → AWS S3 → Google Cloud
    by just creating a new adapter. No service code changes!
    """
    
    @abstractmethod
    def upload_file(self, file, folder_path: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Upload a file to storage.
        
        Returns:
            Tuple of (success, file_url, error_message)
        """
        pass
    
    @abstractmethod
    def delete_file(self, file_url: str) -> bool:
        """
        Delete a file from storage.
        
        Returns:
            True if successful, False otherwise
        """
        pass
    
    @abstractmethod
    def validate_file(self, file, allowed_extensions: list, max_size_mb: int) -> Tuple[bool, Optional[str]]:
        """
        Validate file before upload.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        pass

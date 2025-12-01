import uuid
import logging
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from typing import Tuple, Optional

from core.adapters.storage.storage_interface import StorageProviderInterface

logger = logging.getLogger(__name__)


class S3StorageAdapter(StorageProviderInterface):
    """
    DigitalOcean Spaces / AWS S3 storage adapter.
    
    Implements StorageProviderInterface contract.
    Single Responsibility: Only handles S3 operations.
    """
    
    def __init__(self):
        """Initialize S3 client with settings."""
        self.bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', '')
        self.region = getattr(settings, 'AWS_S3_REGION_NAME', '')
        self.endpoint_url = getattr(settings, 'AWS_S3_ENDPOINT_URL', None)
        
        self.client = boto3.client(
            's3',
            aws_access_key_id=getattr(settings, 'AWS_ACCESS_KEY_ID', ''),
            aws_secret_access_key=getattr(settings, 'AWS_SECRET_ACCESS_KEY', ''),
            region_name=self.region,
            endpoint_url=self.endpoint_url  # For DigitalOcean Spaces
        )
    
    def validate_file(self, file, allowed_extensions: list, max_size_mb: int) -> Tuple[bool, Optional[str]]:
        """
        Validate file before upload.
        
        Args:
            file: Django file object
            allowed_extensions: e.g., ['.mp4', '.avi', '.mov']
            max_size_mb: Maximum size in MB
        
        Returns:
            (True, None) if valid
            (False, "error message") if invalid
        """
        # Check file size
        max_size_bytes = max_size_mb * 1024 * 1024
        if file.size > max_size_bytes:
            return False, f"File too large. Maximum size is {max_size_mb}MB."
        
        # Check file extension
        file_extension = f".{file.name.lower().split('.')[-1]}"
        if file_extension not in allowed_extensions:
            return False, f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        
        return True, None
    
    def upload_file(self, file, folder_path: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Upload file to S3/DigitalOcean Spaces.
        
        Args:
            file: Django file object
            folder_path: e.g., 'courses/videos/'
        
        Returns:
            (True, file_url, None) on success
            (False, None, error_message) on failure
        """
        try:
            # Generate unique filename
            file_extension = file.name.split('.')[-1]
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            s3_key = f"{folder_path.strip('/')}/{unique_filename}"
            
            # Upload file
            self.client.upload_fileobj(
                file,
                self.bucket_name,
                s3_key,
                ExtraArgs={
                    'ContentType': getattr(file, 'content_type', 'application/octet-stream'),
                    'ACL': 'public-read'
                }
            )
            
            # Generate file URL
            file_url = self._generate_file_url(s3_key)
            
            logger.info(f"File uploaded successfully: {s3_key}")
            return True, file_url, None
            
        except ClientError as e:
            error_msg = f"S3 upload failed: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
        except Exception as e:
            error_msg = f"Upload failed: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    def delete_file(self, file_url: str) -> bool:
        """
        Delete file from S3/DigitalOcean Spaces.
        
        Args:
            file_url: Full URL of file to delete
        
        Returns:
            True if deleted, False otherwise
        """
        try:
            # Extract S3 key from URL
            s3_key = self._extract_key_from_url(file_url)
            
            if not s3_key:
                logger.error(f"Could not extract S3 key from URL: {file_url}")
                return False
            
            # Delete file
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            
            logger.info(f"File deleted successfully: {s3_key}")
            return True
            
        except Exception as e:
            logger.error(f"S3 delete error: {str(e)}")
            return False
    
    def _generate_file_url(self, s3_key: str) -> str:
        """Generate public URL for uploaded file."""
        if self.endpoint_url:
            # DigitalOcean Spaces format
            return f"{self.endpoint_url}/{self.bucket_name}/{s3_key}"
        else:
            # AWS S3 format
            return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"
    
    def _extract_key_from_url(self, file_url: str) -> Optional[str]:
        """Extract S3 key from file URL."""
        try:
            if self.endpoint_url:
                # DigitalOcean Spaces format
                return file_url.split(f"{self.bucket_name}/")[-1]
            else:
                # AWS S3 format
                return file_url.split(f".amazonaws.com/")[-1]
        except Exception:
            return None

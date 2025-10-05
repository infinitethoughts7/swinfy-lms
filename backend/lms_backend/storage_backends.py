"""
Custom storage backends for optimized media delivery.
"""
from storages.backends.s3 import S3Storage
from django.conf import settings


class OptimizedMediaStorage(S3Storage):
    """
    Custom S3 storage backend with optimizations for video streaming.
    """
    
    def __init__(self, **settings_dict):
        super().__init__(**settings_dict)
        
    def get_object_parameters(self, name):
        """
        Override to set content-specific parameters for better streaming.
        """
        params = super().get_object_parameters(name)
        
        # Get file extension
        ext = name.lower().split('.')[-1] if '.' in name else ''
        
        # Video files - optimize for streaming
        if ext in ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v']:
            params.update({
                'ContentType': 'video/mp4' if ext == 'mp4' else f'video/{ext}',
                'ContentDisposition': 'inline',  # Allow inline playback
                'CacheControl': 'public, max-age=31536000',  # 1 year cache
                'Metadata': {
                    'optimized-for': 'streaming'
                }
            })
        
        # Image files - optimize for display
        elif ext in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']:
            params.update({
                'ContentType': f'image/{ext}',
                'ContentDisposition': 'inline',
                'CacheControl': 'public, max-age=31536000',  # 1 year cache
            })
        
        # PDF and document files
        elif ext in ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']:
            params.update({
                'ContentDisposition': 'inline',
                'CacheControl': 'public, max-age=86400',  # 1 day cache
            })
        
        return params

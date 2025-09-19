"""
Utility functions for the courses app.
"""
import uuid
import hashlib
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import boto3
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)


def generate_unique_slug(title, model_class, instance=None):
    """
    Generate a unique slug for a given title.
    
    Args:
        title (str): The title to generate slug from
        model_class: The model class to check for uniqueness
        instance: The current instance (for updates)
    
    Returns:
        str: Unique slug
    """
    from django.utils.text import slugify
    
    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    
    while model_class.objects.filter(slug=slug).exclude(pk=instance.pk if instance else None).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    return slug


def generate_course_code():
    """
    Generate a unique course code.
    
    Returns:
        str: Unique course code
    """
    return f"CRS-{uuid.uuid4().hex[:8].upper()}"


def calculate_course_duration(modules):
    """
    Calculate total course duration from modules.
    
    Args:
        modules: QuerySet of course modules
    
    Returns:
        int: Total duration in weeks
    """
    total_duration = 0
    for module in modules:
        total_duration += module.duration_weeks or 0
    return total_duration


def get_course_progress_percentage(enrollment):
    """
    Calculate course progress percentage for a learner.
    
    Args:
        enrollment: Enrollment instance
    
    Returns:
        float: Progress percentage (0-100)
    """
    if not enrollment.course.modules.exists():
        return 0.0
    
    total_lessons = 0
    completed_lessons = 0
    
    for module in enrollment.course.modules.all():
        module_lessons = module.lessons.count()
        total_lessons += module_lessons
        
        # Count completed lessons in this module
        completed_in_module = enrollment.completed_lessons.filter(
            lesson__module=module
        ).count()
        completed_lessons += completed_in_module
    
    if total_lessons == 0:
        return 0.0
    
    return round((completed_lessons / total_lessons) * 100, 2)


def validate_video_file(file):
    """
    Validate video file before upload.
    
    Args:
        file: Uploaded file
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check file size (max 500MB)
    max_size = 500 * 1024 * 1024  # 500MB
    if file.size > max_size:
        return False, "File size too large. Maximum size is 500MB."
    
    # Check file extension
    allowed_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    file_extension = file.name.lower().split('.')[-1]
    if f'.{file_extension}' not in allowed_extensions:
        return False, f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
    
    return True, None


def upload_to_s3(file, folder_path):
    """
    Upload file to AWS S3.
    
    Args:
        file: File to upload
        folder_path (str): S3 folder path
    
    Returns:
        tuple: (success, file_url, error_message)
    """
    try:
        # Validate file
        is_valid, error = validate_video_file(file)
        if not is_valid:
            return False, None, error
        
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        # Generate unique filename
        file_extension = file.name.split('.')[-1]
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        s3_key = f"{folder_path}/{unique_filename}"
        
        # Upload file
        s3_client.upload_fileobj(
            file,
            settings.AWS_STORAGE_BUCKET_NAME,
            s3_key,
            ExtraArgs={
                'ContentType': file.content_type,
                'ACL': 'public-read'
            }
        )
        
        # Generate file URL
        file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{s3_key}"
        
        return True, file_url, None
        
    except ClientError as e:
        logger.error(f"S3 upload error: {str(e)}")
        return False, None, f"S3 upload failed: {str(e)}"
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return False, None, f"Upload failed: {str(e)}"


def delete_from_s3(file_url):
    """
    Delete file from AWS S3.
    
    Args:
        file_url (str): S3 file URL
    
    Returns:
        bool: Success status
    """
    try:
        # Extract S3 key from URL
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        s3_key = file_url.split(f"{bucket_name}.s3.")[1].split(".amazonaws.com/")[1]
        
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        # Delete file
        s3_client.delete_object(
            Bucket=bucket_name,
            Key=s3_key
        )
        
        return True
        
    except Exception as e:
        logger.error(f"S3 delete error: {str(e)}")
        return False


def send_course_approval_notification(course, action, approver):
    """
    Send notification for course approval actions.
    
    Args:
        course: Course instance
        action (str): 'approved' or 'rejected'
        approver: User who performed the action
    """
    # This would integrate with your notification system
    # For now, we'll just log the action
    logger.info(f"Course {course.title} {action} by {approver.email}")
    
    # TODO: Implement actual notification sending
    # - Email notifications
    # - In-app notifications
    # - Push notifications


def get_course_statistics(course):
    """
    Get comprehensive statistics for a course.
    
    Args:
        course: Course instance
    
    Returns:
        dict: Course statistics
    """
    from .models import Enrollment
    
    enrollments = Enrollment.objects.filter(course=course)
    
    stats = {
        'total_enrollments': enrollments.count(),
        'active_enrollments': enrollments.filter(status='active').count(),
        'completed_enrollments': enrollments.filter(status='completed').count(),
        'average_rating': course.rating,
        'total_reviews': course.total_reviews,
        'view_count': course.view_count,
        'completion_rate': 0,
        'average_progress': 0
    }
    
    if stats['total_enrollments'] > 0:
        # Calculate completion rate
        stats['completion_rate'] = round(
            (stats['completed_enrollments'] / stats['total_enrollments']) * 100, 2
        )
        
        # Calculate average progress
        total_progress = sum(
            get_course_progress_percentage(enrollment) 
            for enrollment in enrollments.filter(status='active')
        )
        active_count = stats['active_enrollments']
        if active_count > 0:
            stats['average_progress'] = round(total_progress / active_count, 2)
    
    return stats


def format_duration(weeks):
    """
    Format duration in a human-readable format.
    
    Args:
        weeks (int): Duration in weeks
    
    Returns:
        str: Formatted duration
    """
    if weeks < 1:
        return "Less than 1 week"
    elif weeks == 1:
        return "1 week"
    elif weeks < 4:
        return f"{weeks} weeks"
    else:
        months = weeks // 4
        remaining_weeks = weeks % 4
        if remaining_weeks == 0:
            return f"{months} month{'s' if months > 1 else ''}"
        else:
            return f"{months} month{'s' if months > 1 else ''} {remaining_weeks} week{'s' if remaining_weeks > 1 else ''}"


def generate_course_certificate(enrollment):
    """
    Generate course completion certificate.
    
    Args:
        enrollment: Enrollment instance
    
    Returns:
        str: Certificate URL or path
    """
    # This would integrate with a certificate generation service
    # For now, we'll return a placeholder
    logger.info(f"Generating certificate for {enrollment.learner.email} - {enrollment.course.title}")
    
    # TODO: Implement actual certificate generation
    # - PDF generation
    # - Digital signatures
    # - S3 storage
    
    return f"/certificates/{enrollment.id}/certificate.pdf"

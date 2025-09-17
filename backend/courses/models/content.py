"""
Content models for courses including modules, lessons, and materials.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
import uuid
import logging
from .course import Course

logger = logging.getLogger(__name__)


def detect_video_duration(video_path):
    """
    Detect video duration using multiple fallback methods.
    
    Args:
        video_path (str): Path to the video file
        
    Returns:
        int: Duration in minutes, or 0 if detection fails
    """
    duration_minutes = 0
    
    # Method 1: Try ffprobe (most reliable for video files)
    try:
        import subprocess
        import json
        result = subprocess.run([
            'ffprobe', '-v', 'quiet', '-print_format', 'json',
            '-show_format', video_path
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            metadata = json.loads(result.stdout)
            duration_seconds = float(metadata['format']['duration'])
            duration_minutes = int(duration_seconds / 60)
            logger.info(f"Video duration detected via ffprobe: {duration_minutes} minutes")
            return duration_minutes
    except (subprocess.SubprocessError, FileNotFoundError, KeyError, ValueError, subprocess.TimeoutExpired) as e:
        logger.debug(f"ffprobe failed: {e}")
    
    # Method 2: Try OpenCV if ffprobe fails and cv2 is available
    try:
        import cv2  # type: ignore # Optional dependency
        cap = cv2.VideoCapture(video_path)
        if cap.isOpened():
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            if fps > 0 and frame_count > 0:
                duration_seconds = frame_count / fps
                duration_minutes = int(duration_seconds / 60)
                logger.info(f"Video duration detected via OpenCV: {duration_minutes} minutes")
            cap.release()
            return duration_minutes
    except ImportError:
        logger.debug("OpenCV (cv2) not available for video duration detection")
    except Exception as e:
        logger.debug(f"OpenCV video detection failed: {e}")
    
    # Method 3: Basic file-based detection (placeholder for future implementation)
    # This could be expanded to parse specific video formats
    logger.warning(f"Could not detect video duration for {video_path}")
    return duration_minutes


class CourseModule(models.Model):
    """
    Course module model representing a section/topic of a course.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    title = models.CharField(max_length=200, help_text="Module/Topic title")
    slug = models.SlugField(max_length=220, help_text="URL-friendly version of title")
    
    # Course Relationship
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='modules',
        help_text="Course this module belongs to"
    )
    
    # Module Details
    order = models.PositiveIntegerField(
        default=0,
        help_text="Order of module in course"
    )

    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Course Module'
        verbose_name_plural = 'Course Modules'
        ordering = ['course', 'order']
        unique_together = ['course', 'order']
        indexes = [
            models.Index(fields=['course', 'order']),
        ]
    
    def save(self, *args, **kwargs):
        """Generate slug if not provided."""
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while CourseModule.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    """
    Lesson model representing individual lessons/subtopics within a module.
    """
    
    LESSON_TYPE_CHOICES = [
        ('video', 'Video Lesson'),
        ('text', 'Text Lesson'),
        ('assignment', 'Assignment'),
        ('image_gallery', 'Image Gallery'),
        ('mixed', 'Mixed Content'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    title = models.CharField(max_length=200, help_text="Lesson/Subtopic title")
    slug = models.SlugField(max_length=220, help_text="URL-friendly version of title")
    
    # Module Relationship
    module = models.ForeignKey(
        CourseModule,
        on_delete=models.CASCADE,
        related_name='lessons',
        help_text="Module this lesson belongs to"
    )
    
    # Lesson Details
    lesson_type = models.CharField(
        max_length=20,
        choices=LESSON_TYPE_CHOICES,
        default='video',
        help_text="Type of lesson"
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Order of lesson in module"
    )
    duration_minutes = models.PositiveIntegerField(
        default=0,
        help_text="Lesson duration in minutes (auto-detected from video files)"
    )
    is_preview = models.BooleanField(
        default=False,
        help_text="Lesson is available for preview"
    )

    is_mandatory = models.BooleanField(
        default=True,
        help_text="Lesson must be completed to progress"
    )
    
    # Content Fields
    content = models.TextField(
        blank=True,
        help_text="Lesson content (rich text for text lessons, assignment instructions, etc.)"
    )
    video_file = models.FileField(
        upload_to='courses/lessons/videos/',
        blank=True,
        null=True,
        help_text="Video file upload (duration will be auto-detected)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'
        ordering = ['module', 'order']
        unique_together = ['module', 'order']
        indexes = [
            models.Index(fields=['module', 'order']),
            models.Index(fields=['lesson_type']),
        ]
    
    def save(self, *args, **kwargs):
        """Generate slug and auto-detect video duration."""
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Lesson.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        # Auto-detect video duration if video file is uploaded
        if self.video_file and not self.duration_minutes:
            self.duration_minutes = detect_video_duration(self.video_file.path)
        
        super().save(*args, **kwargs)
    
    @property
    def course(self):
        """Get the course this lesson belongs to."""
        return self.module.course
    
    @property
    def has_video_content(self):
        """Check if lesson has video content."""
        return bool(self.video_file)
    
    @property
    def duration_formatted(self):
        """Get formatted duration (e.g., '1h 30m' or '45m')."""
        if self.duration_minutes == 0:
            return "Duration not set"
        
        hours = self.duration_minutes // 60
        minutes = self.duration_minutes % 60
        
        if hours > 0:
            return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
        else:
            return f"{minutes}m"
    
    @property
    def total_materials_count(self):
        """Get total count of lesson materials."""
        return self.materials.count()
    
    def __str__(self):
        return f"{self.module.title} - {self.title}"


class LessonMaterial(models.Model):
    """
    Additional materials for lessons (downloads, resources, etc.).
    """
    
    MATERIAL_TYPE_CHOICES = [
        ('pdf', 'PDF Document'),
        ('doc', 'Word Document'),
        ('ppt', 'PowerPoint Presentation'),
        ('zip', 'ZIP Archive'),
        ('image', 'Image'),
        ('video', 'Video File'),
        ('code', 'Code File'),
        ('other', 'Other'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    title = models.CharField(max_length=200, help_text="Material title")
    description = models.TextField(blank=True, help_text="Material description")
    
    # Lesson Relationship
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='materials',
        help_text="Lesson this material belongs to"
    )
    
    # Material Details
    material_type = models.CharField(
        max_length=20,
        choices=MATERIAL_TYPE_CHOICES,
        default='other',
        help_text="Type of material"
    )
    file = models.FileField(
        upload_to='courses/lessons/materials/',
        help_text="Material file"
    )
    file_size = models.PositiveIntegerField(
        default=0,
        help_text="File size in bytes"
    )
    download_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of downloads"
    )
    is_required = models.BooleanField(
        default=False,
        help_text="Material is required for the lesson"
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Order of material in lesson"
    )
    is_downloadable = models.BooleanField(
        default=True,
        help_text="Students can download this material"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Lesson Material'
        verbose_name_plural = 'Lesson Materials'
        ordering = ['lesson', 'order', 'title']
        indexes = [
            models.Index(fields=['lesson', 'order']),
            models.Index(fields=['material_type']),
        ]
    
    def save(self, *args, **kwargs):
        """Set file size when saving."""
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)
    
    @property
    def course(self):
        """Get the course this material belongs to."""
        return self.lesson.course
    
    @property
    def file_size_formatted(self):
        """Get human-readable file size."""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class CourseResource(models.Model):
    """
    General course resources (not tied to specific lessons).
    """
    
    RESOURCE_TYPE_CHOICES = [
        ('syllabus', 'Course Syllabus'),
        ('schedule', 'Course Schedule'),
        ('reference', 'Reference Material'),
        ('tool', 'Tool or Software'),
        ('link', 'External Link'),
        ('certificate_template', 'Certificate Template'),
        ('other', 'Other'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    title = models.CharField(max_length=200, help_text="Resource title")
    description = models.TextField(blank=True, help_text="Resource description")
    
    # Course Relationship
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='resources',
        help_text="Course this resource belongs to"
    )
    
    # Resource Details
    resource_type = models.CharField(
        max_length=25,
        choices=RESOURCE_TYPE_CHOICES,
        default='other',
        help_text="Type of resource"
    )
    file = models.FileField(
        upload_to='courses/resources/',
        blank=True,
        null=True,
        help_text="Resource file"
    )
    url = models.URLField(
        blank=True,
        help_text="Resource URL (for external links)"
    )
    is_public = models.BooleanField(
        default=True,
        help_text="Resource is visible to all students"
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Order of resource"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Course Resource'
        verbose_name_plural = 'Course Resources'
        ordering = ['course', 'order', 'title']
        indexes = [
            models.Index(fields=['course', 'order']),
            models.Index(fields=['resource_type']),
        ]
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


# Helper function for auto-creating modules
def get_or_create_default_module(course, module_number=1):
    """
    Get or create a default module for courses that don't use explicit modules.
    """
    module_title = f"Module {module_number}"
    module, created = CourseModule.objects.get_or_create(
        course=course,
        order=module_number,
        defaults={
            'title': module_title,
            'is_auto_created': True,
        }
    )
    return module
"""
Content models for courses including modules, lessons, and materials.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
import uuid
from .course import Course


class CourseModule(models.Model):
    """
    Course module model representing a section of a course.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    title = models.CharField(max_length=200, help_text="Module title")
    description = models.TextField(help_text="Module description")
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
    duration_weeks = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(52)],
        help_text="Module duration in weeks"
    )
    is_published = models.BooleanField(
        default=True,
        help_text="Module is visible to students"
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
            models.Index(fields=['is_published']),
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
    Lesson model representing individual lessons within a module.
    """
    
    LESSON_TYPE_CHOICES = [
        ('video', 'Video Lesson'),
        ('text', 'Text Lesson'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('live_session', 'Live Session'),
        ('download', 'Download'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    title = models.CharField(max_length=200, help_text="Lesson title")
    description = models.TextField(blank=True, help_text="Lesson description")
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
        help_text="Lesson duration in minutes"
    )
    is_preview = models.BooleanField(
        default=False,
        help_text="Lesson is available for preview"
    )
    is_published = models.BooleanField(
        default=True,
        help_text="Lesson is visible to students"
    )
    
    # Content Fields
    content = models.TextField(
        blank=True,
        help_text="Lesson content (for text lessons)"
    )
    video_url = models.URLField(
        blank=True,
        help_text="Video URL (for video lessons)"
    )
    video_file = models.FileField(
        upload_to='courses/lessons/videos/',
        blank=True,
        null=True,
        help_text="Video file (for video lessons)"
    )
    attachment = models.FileField(
        upload_to='courses/lessons/attachments/',
        blank=True,
        null=True,
        help_text="Lesson attachment"
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
            models.Index(fields=['is_published']),
        ]
    
    def save(self, *args, **kwargs):
        """Generate slug if not provided."""
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Lesson.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    @property
    def course(self):
        """Get the course this lesson belongs to."""
        return self.module.course
    
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
        ('audio', 'Audio File'),
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
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Lesson Material'
        verbose_name_plural = 'Lesson Materials'
        ordering = ['lesson', 'title']
        indexes = [
            models.Index(fields=['lesson']),
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
        max_length=20,
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
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Course Resource'
        verbose_name_plural = 'Course Resources'
        ordering = ['course', 'title']
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['resource_type']),
        ]
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"

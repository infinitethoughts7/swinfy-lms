from django.db import models
from django.core.exceptions import ValidationError
from users.models import User, Organization
import uuid


class Course(models.Model):
    """Course model for managing learning content."""
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('all_levels', 'All Levels'),
    ]
    
    CATEGORY_CHOICES = [
        ('frontend_development', 'Frontend Development'),
        ('backend_development', 'Backend Development'),
        ('data_analyst', 'Data Analyst'),
        ('data_science', 'Data Science'),
        ('interview_preparation', 'Interview Preparation'),
        ('ai_kids', 'AI for Kids'),
        ('programming_kids', 'Programming for Kids'),
        ('robotics', 'Robotics'),
        ('mobile_development', 'Mobile Development'),
        ('devops', 'DevOps'),
        ('cybersecurity', 'Cybersecurity'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    description = models.TextField()
    
    # Course content
    objectives = models.TextField(help_text="What students will learn")
    prerequisites = models.TextField(blank=True, null=True)
    
    # Organization and instructor
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE, 
        related_name='courses'
    )
    instructor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='courses_taught',
        limit_choices_to={'role__in': ['tutor', 'admin']}
    )
    
    # Course metadata
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    duration_weeks = models.PositiveIntegerField(help_text="Course duration in weeks")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Media
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True, help_text="Icon path for course")
    
    # Stats
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_enrollments = models.PositiveIntegerField(default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['level']),
            models.Index(fields=['status']),
            models.Index(fields=['organization']),
        ]
    
    def clean(self):
        """Custom validation for course model."""
        super().clean()
        
        # Instructor must belong to the same organization
        if self.instructor and self.organization:
            if self.instructor.organization != self.organization:
                raise ValidationError({
                    'instructor': 'Instructor must belong to the same organization as the course.'
                })
        
        # Instructor must be tutor or admin
        if self.instructor and self.instructor.role not in ['tutor', 'admin']:
            raise ValidationError({
                'instructor': 'Only tutors and admins can be course instructors.'
            })
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def enrollment_count(self):
        """Get current enrollment count."""
        return self.enrollments.filter(status='enrolled').count()
    
    @property
    def average_rating(self):
        """Calculate average rating from reviews."""
        from django.db.models import Avg
        reviews = CourseReview.objects.filter(enrollment__course=self, rating__isnull=False)
        if reviews.exists():
            return round(reviews.aggregate(Avg('rating'))['rating__avg'], 1)
        return 0.0
    
    def __str__(self):
        return f"{self.title} - {self.organization.name}"


class CourseModule(models.Model):
    """Course modules for organizing content."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Course Module'
        verbose_name_plural = 'Course Modules'
        ordering = ['course', 'order']
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - Module {self.order}: {self.title}"


class Lesson(models.Model):
    """Individual lessons within course modules."""
    
    LESSON_TYPE_CHOICES = [
        ('video', 'Video'),
        ('text', 'Text'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('live_session', 'Live Session'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    content = models.TextField(blank=True)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES)
    order = models.PositiveIntegerField()
    
    # Media
    video_url = models.URLField(blank=True, null=True)
    video_duration = models.DurationField(blank=True, null=True)
    
    # Settings
    is_preview = models.BooleanField(default=False, help_text="Can be viewed without enrollment")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'
        ordering = ['module', 'order']
        unique_together = ['module', 'order']
    
    def __str__(self):
        return f"{self.module.course.title} - {self.title}"


class Enrollment(models.Model):
    """Track student enrollments in courses."""
    
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='enrollments',
        limit_choices_to={'role': 'student'}
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    
    # Progress tracking
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    completed_lessons = models.ManyToManyField(Lesson, blank=True)
    
    # Payment
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, blank=True)
    
    # Timestamps
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_accessed = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        unique_together = ['student', 'course']
        ordering = ['-enrolled_at']
    
    def clean(self):
        """Custom validation."""
        super().clean()
        
        # Only students can enroll
        if self.student and self.student.role != 'student':
            raise ValidationError({
                'student': 'Only students can enroll in courses.'
            })
    
    @property
    def is_active(self):
        """Check if enrollment is active."""
        return self.status == 'enrolled'
    
    def calculate_progress(self):
        """Calculate and update progress percentage."""
        total_lessons = self.course.modules.aggregate(
            total=models.Count('lessons')
        )['total'] or 0
        
        if total_lessons > 0:
            completed_count = self.completed_lessons.count()
            self.progress_percentage = (completed_count / total_lessons) * 100
            self.save(update_fields=['progress_percentage'])
        
        return self.progress_percentage
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.title}"


class CourseReview(models.Model):
    """Student reviews and ratings for courses."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Course Review'
        verbose_name_plural = 'Course Reviews'
        ordering = ['-created_at']
    
    @property
    def student(self):
        return self.enrollment.student
    
    @property
    def course(self):
        return self.enrollment.course
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.title} ({self.rating}/5)"

"""
Enrollment models for course enrollments and related functionality.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
from .course import Course
from users.models import User


class Enrollment(models.Model):
    """
    Student enrollment in a course.
    """
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('suspended', 'Suspended'),
        ('pending', 'Pending'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('partial', 'Partial'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student'},
        help_text="Student enrolled in the course"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
        help_text="Course being enrolled in"
    )
    
    # Enrollment Details
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Enrollment status"
    )
    enrollment_date = models.DateTimeField(
        default=timezone.now,
        help_text="Date of enrollment"
    )
    completion_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date of course completion"
    )
    last_accessed = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last time student accessed the course"
    )
    
    # Progress Tracking
    progress_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Course completion percentage"
    )
    current_module = models.ForeignKey(
        'CourseModule',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Current module being studied"
    )
    current_lesson = models.ForeignKey(
        'Lesson',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Current lesson being studied"
    )
    
    # Payment Information
    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Amount paid for the course"
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
        help_text="Payment status"
    )
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        help_text="Payment method used"
    )
    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="Payment reference number"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        unique_together = ['student', 'course']
        ordering = ['-enrollment_date']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['course', 'status']),
            models.Index(fields=['enrollment_date']),
            models.Index(fields=['progress_percentage']),
        ]
    
    def clean(self):
        """Validate enrollment data."""
        from django.core.exceptions import ValidationError
        
        # Check if student is already enrolled
        if self.pk is None:  # New enrollment
            if Enrollment.objects.filter(student=self.student, course=self.course).exists():
                raise ValidationError('Student is already enrolled in this course.')
        
        # Validate payment amount
        if self.amount_paid < 0:
            raise ValidationError('Amount paid cannot be negative.')
        
        if self.amount_paid > self.course.price:
            raise ValidationError('Amount paid cannot exceed course price.')
    
    def save(self, *args, **kwargs):
        """Update progress and status before saving."""
        self.clean()
        
        # Update last accessed time
        if not self.last_accessed:
            self.last_accessed = timezone.now()
        
        # Update completion date if progress is 100%
        if self.progress_percentage >= 100 and not self.completion_date:
            self.completion_date = timezone.now()
            self.status = 'completed'
        
        super().save(*args, **kwargs)
    
    @property
    def is_completed(self):
        """Check if enrollment is completed."""
        return self.status == 'completed' or self.progress_percentage >= 100
    
    @property
    def is_active(self):
        """Check if enrollment is active."""
        return self.status == 'active'
    
    @property
    def days_since_enrollment(self):
        """Get days since enrollment."""
        if self.enrollment_date:
            return (timezone.now() - self.enrollment_date).days
        return 0
    
    @property
    def days_to_complete(self):
        """Get days taken to complete the course."""
        if self.completion_date and self.enrollment_date:
            return (self.completion_date - self.enrollment_date).days
        return None
    
    def update_progress(self, completed_lessons_count, total_lessons_count):
        """Update progress percentage."""
        if total_lessons_count > 0:
            self.progress_percentage = round(
                (completed_lessons_count / total_lessons_count) * 100, 2
            )
            self.save(update_fields=['progress_percentage'])
    
    def mark_lesson_completed(self, lesson):
        """Mark a lesson as completed."""
        from .progress import LessonProgress
        
        progress, created = LessonProgress.objects.get_or_create(
            enrollment=self,
            lesson=lesson,
            defaults={'is_completed': True, 'completed_at': timezone.now()}
        )
        
        if not created and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save()
        
        # Update overall progress
        self.update_progress()
    
    def update_progress(self):
        """Update overall course progress."""
        from .progress import LessonProgress
        
        total_lessons = self.course.modules.aggregate(
            total=models.Count('lessons')
        )['total'] or 0
        
        completed_lessons = LessonProgress.objects.filter(
            enrollment=self,
            is_completed=True
        ).count()
        
        if total_lessons > 0:
            self.progress_percentage = round(
                (completed_lessons / total_lessons) * 100, 2
            )
            self.save(update_fields=['progress_percentage'])
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.title}"


class CourseReview(models.Model):
    """
    Student review for a course.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    enrollment = models.OneToOneField(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='review',
        help_text="Enrollment this review belongs to"
    )
    
    # Review Details
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    title = models.CharField(
        max_length=200,
        default="Course Review",
        help_text="Review title"
    )
    content = models.TextField(
        default="Great course!",
        help_text="Review content"
    )
    is_approved = models.BooleanField(
        default=False,
        help_text="Review is approved and visible"
    )
    is_anonymous = models.BooleanField(
        default=False,
        help_text="Review is anonymous"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Course Review'
        verbose_name_plural = 'Course Reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['enrollment']),
            models.Index(fields=['rating']),
            models.Index(fields=['is_approved']),
        ]
    
    @property
    def student(self):
        """Get the student who wrote the review."""
        return self.enrollment.student
    
    @property
    def course(self):
        """Get the course being reviewed."""
        return self.enrollment.course
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.title} - {self.rating} stars"


class CourseWishlist(models.Model):
    """
    Student wishlist for courses.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wishlist',
        limit_choices_to={'role': 'student'},
        help_text="Student who added to wishlist"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='wishlist',
        help_text="Course in wishlist"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Course Wishlist'
        verbose_name_plural = 'Course Wishlists'
        unique_together = ['student', 'course']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['course']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.title}"


class CourseNotification(models.Model):
    """
    Notifications related to courses.
    """
    
    NOTIFICATION_TYPE_CHOICES = [
        ('enrollment', 'Enrollment'),
        ('completion', 'Completion'),
        ('new_lesson', 'New Lesson'),
        ('assignment_due', 'Assignment Due'),
        ('live_session', 'Live Session'),
        ('course_update', 'Course Update'),
        ('other', 'Other'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='course_notifications',
        help_text="User receiving the notification"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="Course related to the notification"
    )
    
    # Notification Details
    title = models.CharField(
        max_length=200,
        default="Course Notification",
        help_text="Notification title"
    )
    message = models.TextField(
        default="You have a new course notification.",
        help_text="Notification message"
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPE_CHOICES,
        default='other',
        help_text="Type of notification"
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Notification has been read"
    )
    is_email_sent = models.BooleanField(
        default=False,
        help_text="Email notification has been sent"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Course Notification'
        verbose_name_plural = 'Course Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['course']),
            models.Index(fields=['notification_type']),
        ]
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def __str__(self):
        return f"{self.user.full_name} - {self.title}"

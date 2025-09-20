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
    Learner enrollment in a course with admin approval workflow.
    """
    
    STATUS_CHOICES = [
        ('pending_approval', 'Pending Admin Approval'),  # NEW: Waiting for admin approval
        ('approved', 'Approved'),  # NEW: Admin approved, learner can access
        ('active', 'Active'),  # Learner actively learning
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),  # NEW: Admin rejected enrollment
        ('dropped', 'Dropped'),
        ('suspended', 'Suspended'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('partial', 'Partial'),
    ]
    
    ENROLLMENT_TYPE_CHOICES = [  # NEW: How enrollment was created
        ('admin_created', 'Created by Admin'),
        ('learner_requested', 'Requested by Learner'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    learner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'learner'},
        help_text="Learner enrolled in the course"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
        help_text="Course being enrolled in"
    )
    
    # NEW: Admin Approval Workflow
    enrollment_type = models.CharField(
        max_length=20,
        choices=ENROLLMENT_TYPE_CHOICES,
        default='learner_requested',
        help_text="How this enrollment was created"
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_enrollments',
        limit_choices_to={'role': 'admin'},
        help_text="Training partner admin who approved this enrollment"
    )
    approval_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date when enrollment was approved"
    )
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text="Reason for rejection (if applicable)"
    )
    admin_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Admin notes about this enrollment"
    )
    
    # Enrollment Details
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending_approval',
        help_text="Enrollment status"
    )
    enrollment_date = models.DateTimeField(
        default=timezone.now,
        help_text="Date when enrollment was requested/created"
    )
    start_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date when learner started learning (after approval)"
    )
    completion_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date of course completion"
    )
    last_accessed = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last time learner accessed the course"
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
        unique_together = ['learner', 'course']
        ordering = ['-enrollment_date']
        indexes = [
            models.Index(fields=['learner', 'status']),
            models.Index(fields=['course', 'status']),
            models.Index(fields=['enrollment_date']),
            models.Index(fields=['progress_percentage']),
            models.Index(fields=['enrollment_type']),  # NEW
            models.Index(fields=['approved_by']),  # NEW
        ]
    
    def clean(self):
        """Validate enrollment data."""
        from django.core.exceptions import ValidationError
        
        # Check if learner is already enrolled
        if self.pk is None:  # New enrollment
            if Enrollment.objects.filter(learner=self.learner, course=self.course).exists():
                raise ValidationError('Learner is already enrolled in this course.')
        
        # Validate payment amount
        if self.amount_paid < 0:
            raise ValidationError('Amount paid cannot be negative.')
        
        if self.amount_paid > self.course.price:
            raise ValidationError('Amount paid cannot exceed course price.')
        
        # Validate admin approval logic
        if self.status == 'approved' and not self.approved_by:
            raise ValidationError('Approved enrollments must have an approver.')
        
        # Validate organization matching
        if self.approved_by and hasattr(self.learner, 'knowledge_partner') and self.learner.knowledge_partner:
            if self.approved_by.knowledge_partner != self.course.training_partner:
                raise ValidationError('Approver must be from the same training partner as the course.')
        
        # For private courses, learner must be from same organization
        if self.course.is_private and hasattr(self.learner, 'knowledge_partner') and self.learner.knowledge_partner != self.course.training_partner:
            raise ValidationError('Learners can only enroll in private courses from their own organization.')
    
    def save(self, *args, **kwargs):
        """Handle status transitions and timestamps."""
        self.clean()
        
        # Set approval date when status changes to approved
        if self.status == 'approved' and not self.approval_date:
            self.approval_date = timezone.now()
            self.start_date = timezone.now()
        
        # Set start date when status changes to active
        if self.status == 'active' and not self.start_date:
            self.start_date = timezone.now()
        
        # Update last accessed time for active enrollments
        if self.status == 'active' and not self.last_accessed:
            self.last_accessed = timezone.now()
        
        # Update completion date if progress is 100%
        if self.progress_percentage >= 100 and not self.completion_date:
            self.completion_date = timezone.now()
            self.status = 'completed'
        
        super().save(*args, **kwargs)
    
    @property
    def is_approved(self):
        """Check if enrollment is approved."""
        return self.status in ['approved', 'active', 'completed']
    
    @property
    def is_pending(self):
        """Check if enrollment is pending approval."""
        return self.status == 'pending_approval'
    
    @property
    def is_rejected(self):
        """Check if enrollment was rejected."""
        return self.status == 'rejected'
    
    @property
    def is_completed(self):
        """Check if enrollment is completed."""
        return self.status == 'completed' or self.progress_percentage >= 100
    
    @property
    def is_active(self):
        """Check if enrollment is active (learner can learn)."""
        return self.status in ['approved', 'active']
    
    @property
    def can_access_content(self):
        """Check if learner can access course content."""
        # If payment is successful, give access (even after completion for review)
        if hasattr(self, 'payment') and self.payment and self.payment.status == 'paid':
            return True
        
        # For completed courses, give lifetime access regardless of payment status
        if self.status == 'completed':
            return True
        
        # For non-paid enrollments, check if active
        return self.is_active
    
    @property
    def days_since_enrollment(self):
        """Get days since enrollment request."""
        if self.enrollment_date:
            return (timezone.now() - self.enrollment_date).days
        return 0
    
    @property
    def days_since_start(self):
        """Get days since learning started."""
        if self.start_date:
            return (timezone.now() - self.start_date).days
        return 0
    
    @property
    def days_to_complete(self):
        """Get days taken to complete the course."""
        if self.completion_date and self.start_date:
            return (self.completion_date - self.start_date).days
        return None
    
    def approve(self, admin_user, notes=None):
        """Approve enrollment by admin."""
        if admin_user.role != 'admin':
            raise ValueError("Only admins can approve enrollments.")
        
        if admin_user.organization != self.course.training_partner:
            raise ValueError("Admin must be from the same training partner.")
        
        self.status = 'approved'
        self.approved_by = admin_user
        self.approval_date = timezone.now()
        self.start_date = timezone.now()
        if notes:
            self.admin_notes = notes
        self.save()
    
    def reject(self, admin_user, reason=None):
        """Reject enrollment by admin."""
        if admin_user.role != 'admin':
            raise ValueError("Only admins can reject enrollments.")
        
        if admin_user.organization != self.course.training_partner:
            raise ValueError("Admin must be from the same training partner.")
        
        self.status = 'rejected'
        self.approved_by = admin_user
        if reason:
            self.rejection_reason = reason
        self.save()
    
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
        from .progress import LessonProgress, CourseProgress
        from .content import Lesson
        
        # Get all lessons in the course
        total_lessons = Lesson.objects.filter(module__course=self.course).count()
        
        completed_lessons = LessonProgress.objects.filter(
            enrollment=self,
            is_completed=True
        ).count()
        
        if total_lessons > 0:
            self.progress_percentage = round(
                (completed_lessons / total_lessons) * 100, 2
            )
            
            # Update status to active if learner is learning
            if self.status == 'approved' and completed_lessons > 0:
                self.status = 'active'
            
            # Update status to completed if all lessons are done
            if completed_lessons == total_lessons and self.status != 'completed':
                self.status = 'completed'
                self.completion_date = timezone.now()
            
            self.save(update_fields=['progress_percentage', 'status', 'completion_date'])
        
        # Also update CourseProgress if it exists
        try:
            course_progress = self.course_progress
            course_progress.update_progress()
        except CourseProgress.DoesNotExist:
            # Create CourseProgress if it doesn't exist
            CourseProgress.objects.create(enrollment=self)
    
    @classmethod
    def create_admin_enrollment(cls, learner, course, admin_user, auto_approve=True):
        """Create enrollment by admin (directly approved)."""
        enrollment = cls.objects.create(
            learner=learner,
            course=course,
            enrollment_type='admin_created',
            status='approved' if auto_approve else 'pending_approval',
            approved_by=admin_user if auto_approve else None,
            approval_date=timezone.now() if auto_approve else None,
            start_date=timezone.now() if auto_approve else None
        )
        return enrollment
    
    @classmethod
    def create_learner_request(cls, learner, course):
        """Create enrollment request by learner (needs approval)."""
        enrollment = cls.objects.create(
            learner=learner,
            course=course,
            enrollment_type='learner_requested',
            status='pending_approval'
        )
        return enrollment
    
    def __str__(self):
        return f"{self.learner.full_name} - {self.course.title} ({self.status})"


class CourseReview(models.Model):
    """
    Learner review for a course.
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
    def learner(self):
        """Get the learner who wrote the review."""
        return self.enrollment.learner
    
    @property
    def course(self):
        """Get the course being reviewed."""
        return self.enrollment.course
    
    def __str__(self):
        return f"{self.learner.full_name} - {self.course.title} - {self.rating} stars"


class CourseWishlist(models.Model):
    """
    Learner wishlist for courses.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    learner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wishlist',
        limit_choices_to={'role': 'learner'},
        help_text="Learner who added to wishlist",
        null=True,
        blank=True,
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
        unique_together = ['learner', 'course']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['learner']),
            models.Index(fields=['course']),
        ]
    
    def __str__(self):
        return f"{self.learner.full_name} - {self.course.title}"


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
        ('enrollment_approved', 'Enrollment Approved'),  # NEW
        ('enrollment_rejected', 'Enrollment Rejected'),  # NEW
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
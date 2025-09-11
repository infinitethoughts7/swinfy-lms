"""
Progress tracking models for course completion and student progress.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
from .enrollment import Enrollment
from .content import Lesson


class LessonProgress(models.Model):
    """
    Student progress for individual lessons.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='lesson_progress',
        help_text="Enrollment this progress belongs to"
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='progress',
        help_text="Lesson being tracked"
    )
    
    # Progress Details
    is_completed = models.BooleanField(
        default=False,
        help_text="Lesson is completed"
    )
    is_started = models.BooleanField(
        default=False,
        help_text="Lesson has been started"
    )
    completion_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Lesson completion percentage"
    )
    time_spent_minutes = models.PositiveIntegerField(
        default=0,
        help_text="Time spent on lesson in minutes"
    )
    
    # Timestamps
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When lesson was started"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When lesson was completed"
    )
    last_accessed = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last time lesson was accessed"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Lesson Progress'
        verbose_name_plural = 'Lesson Progress'
        unique_together = ['enrollment', 'lesson']
        ordering = ['enrollment', 'lesson__order']
        indexes = [
            models.Index(fields=['enrollment', 'is_completed']),
            models.Index(fields=['lesson']),
            models.Index(fields=['is_completed']),
        ]
    
    def clean(self):
        """Validate progress data."""
        from django.core.exceptions import ValidationError
        
        # Ensure lesson belongs to the same course as enrollment
        if self.lesson.module.course != self.enrollment.course:
            raise ValidationError('Lesson must belong to the same course as enrollment.')
        
        # Validate completion percentage
        if self.completion_percentage < 0 or self.completion_percentage > 100:
            raise ValidationError('Completion percentage must be between 0 and 100.')
    
    def save(self, *args, **kwargs):
        """Update completion status and timestamps."""
        self.clean()
        
        # Update started status
        if not self.is_started and self.completion_percentage > 0:
            self.is_started = True
            if not self.started_at:
                self.started_at = timezone.now()
        
        # Update completion status
        if self.completion_percentage >= 100 and not self.is_completed:
            self.is_completed = True
            self.completed_at = timezone.now()
        elif self.completion_percentage < 100 and self.is_completed:
            self.is_completed = False
            self.completed_at = None
        
        # Update last accessed
        self.last_accessed = timezone.now()
        
        super().save(*args, **kwargs)
        
        # Update enrollment progress
        self.enrollment.update_progress()
    
    @property
    def student(self):
        """Get the student."""
        return self.enrollment.student
    
    @property
    def course(self):
        """Get the course."""
        return self.enrollment.course
    
    @property
    def module(self):
        """Get the module."""
        return self.lesson.module
    
    def mark_completed(self):
        """Mark lesson as completed."""
        self.completion_percentage = 100
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()
    
    def add_time_spent(self, minutes):
        """Add time spent on lesson."""
        self.time_spent_minutes += minutes
        self.save(update_fields=['time_spent_minutes'])
    
    def __str__(self):
        return f"{self.student.full_name} - {self.lesson.title}"


class ModuleProgress(models.Model):
    """
    Student progress for course modules.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='module_progress',
        help_text="Enrollment this progress belongs to"
    )
    module = models.ForeignKey(
        'CourseModule',
        on_delete=models.CASCADE,
        related_name='progress',
        help_text="Module being tracked"
    )
    
    # Progress Details
    is_completed = models.BooleanField(
        default=False,
        help_text="Module is completed"
    )
    completion_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Module completion percentage"
    )
    lessons_completed = models.PositiveIntegerField(
        default=0,
        help_text="Number of lessons completed in module"
    )
    total_lessons = models.PositiveIntegerField(
        default=0,
        help_text="Total number of lessons in module"
    )
    
    # Timestamps
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When module was started"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When module was completed"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Module Progress'
        verbose_name_plural = 'Module Progress'
        unique_together = ['enrollment', 'module']
        ordering = ['enrollment', 'module__order']
        indexes = [
            models.Index(fields=['enrollment', 'is_completed']),
            models.Index(fields=['module']),
            models.Index(fields=['is_completed']),
        ]
    
    def clean(self):
        """Validate progress data."""
        from django.core.exceptions import ValidationError
        
        # Ensure module belongs to the same course as enrollment
        if self.module.course != self.enrollment.course:
            raise ValidationError('Module must belong to the same course as enrollment.')
        
        # Validate completion percentage
        if self.completion_percentage < 0 or self.completion_percentage > 100:
            raise ValidationError('Completion percentage must be between 0 and 100.')
    
    def save(self, *args, **kwargs):
        """Update completion status and timestamps."""
        self.clean()
        
        # Update completion status
        if self.completion_percentage >= 100 and not self.is_completed:
            self.is_completed = True
            self.completed_at = timezone.now()
        elif self.completion_percentage < 100 and self.is_completed:
            self.is_completed = False
            self.completed_at = None
        
        super().save(*args, **kwargs)
    
    def update_progress(self):
        """Update module progress based on lesson progress."""
        from .content import CourseModule
        
        # Get lesson progress for this module
        lesson_progress = LessonProgress.objects.filter(
            enrollment=self.enrollment,
            lesson__module=self.module
        )
        
        total_lessons = lesson_progress.count()
        completed_lessons = lesson_progress.filter(is_completed=True).count()
        
        self.total_lessons = total_lessons
        self.lessons_completed = completed_lessons
        
        if total_lessons > 0:
            self.completion_percentage = round(
                (completed_lessons / total_lessons) * 100, 2
            )
        else:
            self.completion_percentage = 0.00
        
        self.save()
    
    @property
    def student(self):
        """Get the student."""
        return self.enrollment.student
    
    @property
    def course(self):
        """Get the course."""
        return self.enrollment.course
    
    def __str__(self):
        return f"{self.student.full_name} - {self.module.title}"


class CourseProgress(models.Model):
    """
    Overall course progress for a student.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    enrollment = models.OneToOneField(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='course_progress',
        help_text="Enrollment this progress belongs to"
    )
    
    # Progress Details
    overall_progress = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Overall course progress percentage"
    )
    modules_completed = models.PositiveIntegerField(
        default=0,
        help_text="Number of modules completed"
    )
    total_modules = models.PositiveIntegerField(
        default=0,
        help_text="Total number of modules in course"
    )
    lessons_completed = models.PositiveIntegerField(
        default=0,
        help_text="Number of lessons completed"
    )
    total_lessons = models.PositiveIntegerField(
        default=0,
        help_text="Total number of lessons in course"
    )
    
    # Time Tracking
    total_time_spent_minutes = models.PositiveIntegerField(
        default=0,
        help_text="Total time spent on course in minutes"
    )
    average_session_duration_minutes = models.PositiveIntegerField(
        default=0,
        help_text="Average session duration in minutes"
    )
    
    # Timestamps
    started_at = models.DateTimeField(
        default=timezone.now,
        help_text="When course was started"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When course was completed"
    )
    last_activity = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last activity on course"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Course Progress'
        verbose_name_plural = 'Course Progress'
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['enrollment']),
            models.Index(fields=['overall_progress']),
            models.Index(fields=['last_activity']),
        ]
    
    def save(self, *args, **kwargs):
        """Update completion status and timestamps."""
        # Update completion status
        if self.overall_progress >= 100 and not self.enrollment.is_completed:
            self.completed_at = timezone.now()
            self.enrollment.status = 'completed'
            self.enrollment.completion_date = timezone.now()
            self.enrollment.save()
        
        super().save(*args, **kwargs)
    
    def update_progress(self):
        """Update overall course progress."""
        from .content import CourseModule, Lesson
        
        # Get module progress
        module_progress = ModuleProgress.objects.filter(enrollment=self.enrollment)
        self.total_modules = module_progress.count()
        self.modules_completed = module_progress.filter(is_completed=True).count()
        
        # Get lesson progress
        lesson_progress = LessonProgress.objects.filter(enrollment=self.enrollment)
        self.total_lessons = lesson_progress.count()
        self.lessons_completed = lesson_progress.filter(is_completed=True).count()
        
        # Calculate overall progress
        if self.total_lessons > 0:
            self.overall_progress = round(
                (self.lessons_completed / self.total_lessons) * 100, 2
            )
        else:
            self.overall_progress = 0.00
        
        # Calculate total time spent
        self.total_time_spent_minutes = sum(
            progress.time_spent_minutes for progress in lesson_progress
        )
        
        # Update last activity
        self.last_activity = timezone.now()
        
        self.save()
    
    @property
    def student(self):
        """Get the student."""
        return self.enrollment.student
    
    @property
    def course(self):
        """Get the course."""
        return self.enrollment.course
    
    @property
    def is_completed(self):
        """Check if course is completed."""
        return self.overall_progress >= 100
    
    @property
    def days_since_started(self):
        """Get days since course was started."""
        return (timezone.now() - self.started_at).days
    
    @property
    def days_to_complete(self):
        """Get days taken to complete the course."""
        if self.completed_at:
            return (self.completed_at - self.started_at).days
        return None
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.title} - {self.overall_progress}%"


class StudySession(models.Model):
    """
    Study session tracking for detailed analytics.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='study_sessions',
        help_text="Enrollment this session belongs to"
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='study_sessions',
        null=True,
        blank=True,
        help_text="Lesson being studied (if applicable)"
    )
    
    # Session Details
    session_duration_minutes = models.PositiveIntegerField(
        default=0,
        help_text="Session duration in minutes"
    )
    progress_made = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Progress made during this session"
    )
    
    # Timestamps
    started_at = models.DateTimeField(
        default=timezone.now,
        help_text="When session started"
    )
    ended_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When session ended"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Study Session'
        verbose_name_plural = 'Study Sessions'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['enrollment']),
            models.Index(fields=['lesson']),
            models.Index(fields=['started_at']),
        ]
    
    def end_session(self):
        """End the study session."""
        if not self.ended_at:
            self.ended_at = timezone.now()
            if self.started_at:
                duration = self.ended_at - self.started_at
                self.session_duration_minutes = int(duration.total_seconds() / 60)
            self.save()
    
    @property
    def student(self):
        """Get the student."""
        return self.enrollment.student
    
    @property
    def course(self):
        """Get the course."""
        return self.enrollment.course
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.title} - {self.started_at}"

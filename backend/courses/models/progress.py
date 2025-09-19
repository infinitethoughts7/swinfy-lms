"""
Simplified progress tracking models for course completion.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
from .enrollment import Enrollment
from .content import Lesson


class LessonProgress(models.Model):
    """
    Learner progress for individual lessons - simplified version.
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
    
    # Progress Details (Simplified)
    is_completed = models.BooleanField(
        default=False,
        help_text="Lesson is completed"
    )
    is_started = models.BooleanField(
        default=False,
        help_text="Lesson has been started"
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
        ordering = ['enrollment', 'lesson__module__order', 'lesson__order']
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
    
    def save(self, *args, **kwargs):
        """Update completion status and timestamps."""
        self.clean()
        
        # Update started status and timestamp
        if not self.is_started and (self.is_completed or self.last_accessed):
            self.is_started = True
            if not self.started_at:
                self.started_at = timezone.now()
        
        # Update completion timestamp
        if self.is_completed and not self.completed_at:
            self.completed_at = timezone.now()
            if not self.started_at:
                self.started_at = timezone.now()
                self.is_started = True
        elif not self.is_completed:
            self.completed_at = None
        
        # Update last accessed
        if not self.last_accessed:
            self.last_accessed = timezone.now()
        
        super().save(*args, **kwargs)
        
        # Update enrollment progress after saving
        self.enrollment.update_progress()
    
    def mark_completed(self):
        """Mark lesson as completed."""
        self.is_completed = True
        self.completed_at = timezone.now()
        self.last_accessed = timezone.now()
        if not self.is_started:
            self.is_started = True
            self.started_at = timezone.now()
        self.save()
    
    def mark_started(self):
        """Mark lesson as started."""
        if not self.is_started:
            self.is_started = True
            self.started_at = timezone.now()
        self.last_accessed = timezone.now()
        self.save()
    
    @property
    def learner(self):
        """Get the learner."""
        return self.enrollment.learner
    
    @property
    def course(self):
        """Get the course."""
        return self.enrollment.course
    
    @property
    def module(self):
        """Get the module."""
        return self.lesson.module
    
    def __str__(self):
        return f"{self.learner.full_name} - {self.lesson.title} ({'✓' if self.is_completed else '○'})"


class CourseProgress(models.Model):
    """
    Overall course progress summary for a learner.
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
    
    # Progress Summary
    overall_progress = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Overall course progress percentage"
    )
    lessons_completed = models.PositiveIntegerField(
        default=0,
        help_text="Number of lessons completed"
    )
    total_lessons = models.PositiveIntegerField(
        default=0,
        help_text="Total number of lessons in course"
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
        if self.overall_progress >= 100 and not self.completed_at:
            self.completed_at = timezone.now()
            # Update enrollment status
            if self.enrollment.status != 'completed':
                self.enrollment.status = 'completed'
                self.enrollment.completion_date = timezone.now()
                self.enrollment.save()
        elif self.overall_progress < 100 and self.completed_at:
            self.completed_at = None
        
        super().save(*args, **kwargs)
    
    def update_progress(self):
        """Update overall course progress based on lesson completion."""
        # Get lesson progress stats
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
        
        # Update last activity
        self.last_activity = timezone.now()
        
        # Update enrollment progress percentage
        self.enrollment.progress_percentage = self.overall_progress
        self.enrollment.save(update_fields=['progress_percentage'])
        
        self.save()
    
    def get_module_progress(self):
        """Calculate progress by module (computed on-demand)."""
        from .content import CourseModule
        
        modules = CourseModule.objects.filter(course=self.enrollment.course).order_by('order')
        module_progress = []
        
        for module in modules:
            module_lessons = LessonProgress.objects.filter(
                enrollment=self.enrollment,
                lesson__module=module
            )
            total = module_lessons.count()
            completed = module_lessons.filter(is_completed=True).count()
            
            progress_percentage = round((completed / total) * 100, 2) if total > 0 else 0
            
            module_progress.append({
                'module': module,
                'total_lessons': total,
                'completed_lessons': completed,
                'progress_percentage': progress_percentage,
                'is_completed': progress_percentage >= 100
            })
        
        return module_progress
    
    def get_next_lesson(self):
        """Get the next incomplete lesson."""
        next_lesson_progress = LessonProgress.objects.filter(
            enrollment=self.enrollment,
            is_completed=False
        ).order_by(
            'lesson__module__order',
            'lesson__order'
        ).first()
        
        return next_lesson_progress.lesson if next_lesson_progress else None
    
    def get_current_module(self):
        """Get the module currently being studied."""
        next_lesson = self.get_next_lesson()
        return next_lesson.module if next_lesson else None
    
    @property
    def learner(self):
        """Get the learner."""
        return self.enrollment.learner
    
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
    
    @property
    def completion_rate_per_day(self):
        """Get average lessons completed per day."""
        days = self.days_since_started
        if days > 0:
            return round(self.lessons_completed / days, 2)
        return 0
    
    def __str__(self):
        return f"{self.learner.full_name} - {self.course.title} - {self.overall_progress}%"


# Helper functions for easy progress management
def mark_lesson_completed(enrollment, lesson):
    """Helper function to mark a lesson as completed."""
    progress, created = LessonProgress.objects.get_or_create(
        enrollment=enrollment,
        lesson=lesson,
        defaults={
            'is_completed': True,
            'is_started': True,
            'started_at': timezone.now(),
            'completed_at': timezone.now(),
            'last_accessed': timezone.now()
        }
    )
    
    if not created and not progress.is_completed:
        progress.mark_completed()
    
    return progress


def mark_lesson_started(enrollment, lesson):
    """Helper function to mark a lesson as started."""
    progress, created = LessonProgress.objects.get_or_create(
        enrollment=enrollment,
        lesson=lesson,
        defaults={
            'is_started': True,
            'started_at': timezone.now(),
            'last_accessed': timezone.now()
        }
    )
    
    if not created and not progress.is_started:
        progress.mark_started()
    
    return progress


def get_learner_progress_summary(enrollment):
    """Get comprehensive progress summary for a learner."""
    course_progress, created = CourseProgress.objects.get_or_create(
        enrollment=enrollment,
        defaults={'started_at': timezone.now()}
    )
    
    if created:
        course_progress.update_progress()
    
    return {
        'overall_progress': course_progress.overall_progress,
        'lessons_completed': course_progress.lessons_completed,
        'total_lessons': course_progress.total_lessons,
        'is_completed': course_progress.is_completed,
        'next_lesson': course_progress.get_next_lesson(),
        'current_module': course_progress.get_current_module(),
        'module_progress': course_progress.get_module_progress(),
        'days_since_started': course_progress.days_since_started,
        'completion_rate_per_day': course_progress.completion_rate_per_day
    }
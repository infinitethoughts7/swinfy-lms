from django.db import models
from django.contrib.auth import get_user_model
from .course import Course
from .enrollment import Enrollment

User = get_user_model()


class AttendanceRecord(models.Model):
    """Model to track learner attendance for course sessions."""
    
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]
    
    learner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        help_text="The learner whose attendance is being recorded"
    )
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        help_text="The course for which attendance is being recorded"
    )
    
    session_date = models.DateField(
        help_text="The date of the session"
    )
    
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='present',
        help_text="Attendance status for the session"
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Additional notes about the attendance"
    )
    
    marked_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the attendance was marked"
    )
    
    marked_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='marked_attendance',
        help_text="The instructor who marked the attendance"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['learner', 'course', 'session_date']
        ordering = ['-session_date', 'learner__full_name']
        verbose_name = 'Attendance Record'
        verbose_name_plural = 'Attendance Records'
    
    def __str__(self):
        return f"{self.learner.full_name} - {self.course.title} - {self.session_date} ({self.status})"
    
    def clean(self):
        """Validate the attendance record."""
        from django.core.exceptions import ValidationError
        
        # Check if the learner is enrolled in the course
        if not Enrollment.objects.filter(
            learner=self.learner,
            course=self.course,
            status__in=['approved', 'active', 'completed']
        ).exists():
            raise ValidationError(
                f"Learner {self.learner.full_name} is not enrolled in course {self.course.title}"
            )
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

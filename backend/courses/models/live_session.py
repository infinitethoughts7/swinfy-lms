from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.validators import MinValueValidator, URLValidator
import uuid
from users.models import User, KPProfile
from courses.models.course import Course


class LiveSession(models.Model):
    """
    Live session model for instructor-led online classes.
    Sessions require Super Admin approval before learners can see them.
    Instructors store meeting links (Zoom/Meet/Teams) for sessions.
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Super Admin Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('live', 'Live Now'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PLATFORM_CHOICES = [
        ('zoom', 'Zoom'),
        ('google_meet', 'Google Meet'),
        ('microsoft_teams', 'Microsoft Teams'),
        ('other', 'Other Platform'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Core Identity Fields
    title = models.CharField(
        max_length=200,
        help_text="Session title visible to learners"
    )
    description = models.TextField(
        help_text="Detailed description of what will be covered in this session"
    )
    
    # Relationship Fields
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='live_sessions',
        help_text="Course this session belongs to"
    )
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='hosted_sessions',
        limit_choices_to={'role': 'knowledge_partner_instructor'},
        help_text="Instructor hosting this session"
    )
    training_partner = models.ForeignKey(
        KPProfile,
        on_delete=models.CASCADE,
        related_name='live_sessions',
        help_text="Knowledge Partner organization this session belongs to"
    )
    
    # Scheduling Fields
    scheduled_datetime = models.DateTimeField(
        help_text="When the session is scheduled to start"
    )
    duration_minutes = models.PositiveIntegerField(
        default=60,
        validators=[MinValueValidator(15)],
        help_text="Session duration in minutes"
    )
    
    # Meeting Details
    meeting_link = models.URLField(
        max_length=500,
        validators=[URLValidator()],
        help_text="Direct link to join the live session"
    )
    meeting_platform = models.CharField(
        max_length=50,
        choices=PLATFORM_CHOICES,
        default='zoom',
        help_text="Platform being used for the session"
    )
    meeting_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Meeting ID or room number (optional)"
    )
    meeting_password = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Meeting password if required (optional)"
    )
    
    # Approval Workflow Fields (Super Admin Approval)
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='draft',
        help_text="Current status of the session"
    )
    is_approved = models.BooleanField(
        default=False,
        help_text="Super admin has approved this session"
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_sessions',
        limit_choices_to={'role': 'super_admin'},
        help_text="Super admin who approved this session"
    )
    approval_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Feedback from super admin"
    )
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the session was approved"
    )
    
    # Session Management Fields
    max_participants = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum number of participants (optional)"
    )
    is_recording_enabled = models.BooleanField(
        default=True,
        help_text="Whether this session will be recorded"
    )
    recording_link = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Link to session recording (added after session)"
    )
    
    # Additional Information
    session_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Pre-session notes or agenda from instructor"
    )
    post_session_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Summary or notes added after session completion"
    )
    
    # Notification Tracking
    notification_sent = models.BooleanField(
        default=False,
        help_text="Whether enrollment notification emails have been sent"
    )
    reminder_sent = models.BooleanField(
        default=False,
        help_text="Whether reminder emails have been sent"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Live Session'
        verbose_name_plural = 'Live Sessions'
        ordering = ['-scheduled_datetime']
        indexes = [
            models.Index(fields=['course', 'scheduled_datetime']),
            models.Index(fields=['instructor', 'status']),
            models.Index(fields=['status', 'scheduled_datetime']),
            models.Index(fields=['training_partner', 'status']),
        ]
    
    def clean(self):
        """Custom validation for live session model."""
        super().clean()
        
        # Validate scheduled time is in the future (only for new sessions)
        if not self.pk and self.scheduled_datetime:
            if self.scheduled_datetime <= timezone.now():
                raise ValidationError({
                    'scheduled_datetime': 'Session must be scheduled for a future date and time.'
                })
        
        # Validate instructor has correct role
        if self.instructor and self.instructor.role != 'knowledge_partner_instructor':
            raise ValidationError({
                'instructor': 'Only users with knowledge_partner_instructor role can host sessions.'
            })
        
        # Validate instructor belongs to same training partner as course
        if self.instructor and self.course:
            # Get instructor's KP profile
            try:
                instructor_profile = self.instructor.instructor_profile
                if instructor_profile.knowledge_partner != self.course.training_partner:
                    raise ValidationError({
                        'instructor': 'Instructor must belong to the same training partner as the course.'
                    })
            except Exception:
                raise ValidationError({
                    'instructor': 'Instructor must have a valid instructor profile.'
                })
        
        # Auto-set training_partner from course
        if self.course and not self.training_partner:
            self.training_partner = self.course.training_partner
        
        # Validate training_partner matches course
        if self.training_partner and self.course:
            if self.training_partner != self.course.training_partner:
                raise ValidationError({
                    'training_partner': 'Training partner must match the course training partner.'
                })
        
        # Only approved sessions can be marked as live
        if self.status == 'live' and not self.is_approved:
            raise ValidationError({
                'status': 'Only approved sessions can be marked as live.'
            })
    
    def save(self, *args, **kwargs):
        """Override save to handle status updates and approvals."""
        
        # Auto-set training_partner from course before validation
        if self.course and not self.training_partner:
            self.training_partner = self.course.training_partner
        
        # Update status based on approval
        if self.is_approved and self.status == 'pending_approval':
            self.status = 'approved'
            if not self.approved_at:
                self.approved_at = timezone.now()
        
        # Auto-submit for approval if all required fields are filled
        if self.status == 'draft' and self.meeting_link:
            if self.title and self.description and self.scheduled_datetime:
                self.status = 'pending_approval'
        
        # Validate before saving
        self.clean()
        super().save(*args, **kwargs)
        
        # Send notification emails after approval (only once)
        if self.is_approved and not self.notification_sent:
            self.send_notification_emails()
    
    @property
    def is_upcoming(self):
        """Check if session is scheduled for the future."""
        return self.scheduled_datetime > timezone.now() and self.status == 'approved'
    
    @property
    def is_live_now(self):
        """Check if session is currently happening."""
        now = timezone.now()
        end_time = self.scheduled_datetime + timezone.timedelta(minutes=self.duration_minutes)
        return self.scheduled_datetime <= now <= end_time and self.status in ['approved', 'live']
    
    @property
    def is_past(self):
        """Check if session has ended."""
        end_time = self.scheduled_datetime + timezone.timedelta(minutes=self.duration_minutes)
        return end_time < timezone.now()
    
    @property
    def end_datetime(self):
        """Calculate session end time."""
        return self.scheduled_datetime + timezone.timedelta(minutes=self.duration_minutes)
    
    @property
    def formatted_duration(self):
        """Get human-readable duration."""
        hours = self.duration_minutes // 60
        minutes = self.duration_minutes % 60
        if hours > 0:
            return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
        return f"{minutes}m"
    
    def get_enrolled_learners(self):
        """Get all learners enrolled in this session's course."""
        from courses.models.enrollment import Enrollment
        return Enrollment.objects.filter(
            course=self.course,
            status__in=['active', 'approved', 'completed']
        ).select_related('learner')
    
    def send_notification_emails(self):
        """Send notification emails to enrolled learners when session is approved."""
        if not self.is_approved:
            print(f"⚠️  Session '{self.title}' is not approved, skipping email notification")
            return False
        
        if self.notification_sent:
            print(f"ℹ️  Notification already sent for session '{self.title}'")
            return False  # Already sent
        
        enrolled_learners = self.get_enrolled_learners()
        
        print(f"📧 Preparing to send emails for session '{self.title}'")
        print(f"📊 Found {enrolled_learners.count()} enrolled learners")
        
        if not enrolled_learners.exists():
            print(f"⚠️  No enrolled learners found for course '{self.course.title}'")
            return False
        
        # Import here to avoid circular imports
        from django.core.mail import send_mail
        from django.conf import settings
        
        success_count = 0
        
        for enrollment in enrolled_learners:
            learner = enrollment.learner
            
            print(f"📤 Sending email to: {learner.full_name} ({learner.email})")
            
            # Email subject
            subject = f"🎓 Live Session Scheduled: {self.title}"
            
            # Format meeting info
            meeting_info = f"\nJoin Link: {self.meeting_link}"
            if self.meeting_id:
                meeting_info += f"\nMeeting ID: {self.meeting_id}"
            if self.meeting_password:
                meeting_info += f"\nPassword: {self.meeting_password}"
            
            # Email body
            message = f"""
Dear {learner.full_name},

A new live session has been scheduled for the course "{self.course.title}" you're enrolled in!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 SESSION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session Title: {self.title}
Course: {self.course.title}
Instructor: {self.instructor.full_name}

📅 Date & Time: {self.scheduled_datetime.strftime('%B %d, %Y at %I:%M %p')}
⏱️  Duration: {self.formatted_duration}
🎥 Platform: {self.get_meeting_platform_display()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 MEETING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{meeting_info}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 SESSION DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{self.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Please join on time to make the most of this learning opportunity!

If you have any questions, please contact your instructor.

Best regards,
{self.training_partner.name} Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated message. Please do not reply to this email.
            """
            
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[learner.email],
                    fail_silently=False,
                )
                success_count += 1
                print(f"✅ Email sent successfully to {learner.email}")
            except Exception as e:
                print(f"❌ Failed to send email to {learner.email}: {str(e)}")
                print(f"❌ Error details: {type(e).__name__}: {str(e)}")
        
        # Mark notification as sent only if at least one email was successful
        if success_count > 0:
            self.notification_sent = True
            self.save(update_fields=['notification_sent'])
            print(f"✅ Successfully sent {success_count}/{enrolled_learners.count()} notification emails for session: {self.title}")
            return True
        
        print(f"❌ Failed to send any notification emails for session: {self.title}")
        return False
    
    def __str__(self):
        return f"{self.title} - {self.course.title} ({self.scheduled_datetime.strftime('%Y-%m-%d %H:%M')})"


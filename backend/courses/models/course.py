from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from users.models import User, KPProfile


class Course(models.Model):
    """Main course model with single-stage approval workflow and private/public visibility."""
    
    CATEGORY_CHOICES = [
    ('frontend_development', 'Frontend Development'),
    ('backend_development', 'Backend Development'),
    ('programming_languages', 'Programming Languages'),
    ('ai', 'Artificial Intelligence'),
    ('ai_tools', 'AI Tools'),
    ('data_science', 'Data Science'),
    ('data_analysis', 'Data Analysis'),
    ('software_engineering', 'Software Engineering Essentials'), 
     ]
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    APPROVAL_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Training Partner Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Core Identity Fields
    title = models.CharField(max_length=200, default="Untitled Course", help_text="Course title as shown to students")
    slug = models.SlugField(max_length=220, unique=True, help_text="URL-friendly version of title")
    description = models.TextField(default="Course description", help_text="Full course description for course detail page")
    short_description = models.CharField(
        max_length=300, 
        default="Course description",
        help_text="Brief description for course cards and previews"
    )
    
    # Business Logic Fields
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        help_text="Course price"
    )
    duration_weeks = models.PositiveIntegerField(
        default=4,
        validators=[MinValueValidator(1), MaxValueValidator(52)],
        help_text="Course duration in weeks"
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='frontend_development')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    tags = models.TextField(
        blank=True, 
        null=True,
        help_text="Comma-separated tags for course discovery"
    )
    
    # NEW: Course Visibility & Access Control
    is_private = models.BooleanField(
        default=True,
        help_text="Private courses are only visible to learners from the same organization"
    )
    requires_admin_enrollment = models.BooleanField(
        default=True,
        help_text="All enrollments require training partner admin approval"
    )
    max_enrollments = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum number of enrollments allowed (leave blank for unlimited)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Course is currently active and available for enrollments (inactive = ended/paused)"
    )
    
    # Relationship Fields
    tutor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_courses',
        limit_choices_to={'role__in': ['knowledge_partner_instructor', 'knowledge_partner']},
        null=True,
        blank=True,
        help_text="Tutor or Admin who created this course"
    )
    training_partner = models.ForeignKey(
        KPProfile,
        on_delete=models.CASCADE,
        related_name='courses',
        null=True,
        blank=True,
        help_text="Knowledge partner"
    )
    
    # UPDATED: Simplified Approval Workflow Fields (No Super Admin)
    is_approved_by_training_partner = models.BooleanField(
        default=False,
        help_text="Training partner admin has approved this course"
    )
    approval_status = models.CharField(
        max_length=30,
        choices=APPROVAL_STATUS_CHOICES,
        default='draft'
    )
    approval_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Feedback from training partner admin"
    )
    # Publication & Visibility Fields
    is_published = models.BooleanField(
        default=False,
        help_text="Course is live and visible to students"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Show in featured courses section"
    )
    is_draft = models.BooleanField(
        default=True,
        help_text="Course is still being created"
    )
    
    # Analytics & Social Proof Fields
    enrollment_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    
    # Media & Content Fields
    thumbnail = models.ImageField(
        upload_to='courses/thumbnails/',
        blank=True,
        null=True,
        help_text="Course card thumbnail image"
    )
    banner_image = models.ImageField(
        upload_to='courses/banners/',
        blank=True,
        null=True,
        help_text="Course detail page banner image"
    )
    demo_video = models.FileField(
        upload_to='courses/demos/',
        blank=True,
        null=True,
        help_text="Course preview/demo video"
    )
    learning_outcomes = models.TextField(
        default="Students will learn various skills and concepts",
        help_text="What students will learn (bullet points or paragraph)"
    )
    prerequisites = models.TextField(
        blank=True,
        null=True,
        help_text="What students should know before taking this course"
    )
    
    # Timestamp Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    last_enrollment = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'level']),
            models.Index(fields=['approval_status']),
            models.Index(fields=['is_published', 'is_featured']),
            models.Index(fields=['training_partner']),
            models.Index(fields=['is_private', 'is_active']),  # NEW: For visibility filtering
        ]
    
    def clean(self):
        """Custom validation for course model."""
        super().clean()
        
        # Knowledge partner validation
        if not self.training_partner:
            raise ValidationError({
                'training_partner': 'Course must have a knowledge partner.'
            })
        
        # For now, skip instructor-KP validation since we haven't implemented the relationship properly
        # TODO: Implement proper instructor-to-KP relationship validation
        pass
        
        # Published courses must be approved by training partner only
        if self.is_published and not self.is_approved_by_training_partner:
            raise ValidationError({
                'is_published': 'Only approved courses can be published.'
            })
    
    def save(self, *args, **kwargs):
        """Override save to handle slug generation and status updates."""
        
        # Generate slug if not provided
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        # UPDATED: Simplified approval status logic (no super admin)
        if self.is_approved_by_training_partner:
            self.approval_status = 'approved'
        elif not self.is_draft:
            self.approval_status = 'pending_approval'
        elif self.is_draft:
            self.approval_status = 'draft'
        
        # Set published_at timestamp
        if self.is_published and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        # Validate before saving
        self.clean()
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Get the absolute URL for this course."""
        from django.urls import reverse
        return reverse('course-detail', kwargs={'slug': self.slug})
    
    @property
    def is_fully_approved(self):
        """Check if course is approved by training partner admin."""
        return self.is_approved_by_training_partner
    
    @property
    def can_be_published(self):
        """Check if course can be published."""
        return self.is_fully_approved and not self.is_draft and self.is_active
    
    @property
    def is_enrollment_open(self):
        """Check if course is accepting enrollments."""
        if not self.is_active or not self.is_published:
            return False
        
        if self.max_enrollments and self.enrollment_count >= self.max_enrollments:
            return False
        
        return True
    
    @property
    def display_price(self):
        """Get formatted price with currency."""
        return f"₹ {self.price}"  # Using Indian Rupee symbol
    
    @property
    def category_display(self):
        """Get human-readable category name."""
        return dict(self.CATEGORY_CHOICES).get(self.category, self.category)
    
    @property
    def level_display(self):
        """Get human-readable level name."""
        return dict(self.LEVEL_CHOICES).get(self.level, self.level)
    
    @property
    def visibility_display(self):
        """Get human-readable visibility status."""
        return "Private" if self.is_private else "Public"
    
    def get_tags_list(self):
        """Get tags as a list."""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',')]
        return []
    
    def increment_view_count(self):
        """Increment view count."""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def update_rating(self):
        """Update average rating based on reviews."""
        from django.db.models import Avg
        reviews = self.reviews.filter(is_approved=True)
        if reviews.exists():
            avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
            self.rating = round(avg_rating, 2)
            self.total_reviews = reviews.count()
            self.save(update_fields=['rating', 'total_reviews'])
    
    def can_user_view(self, user):
        """Check if a user can view this course."""
        # Must be published and approved
        if not (self.is_published and self.is_approved_by_training_partner):
            return False
        
        # If public course, anyone can view
        if not self.is_private:
            return True
        
        # If private course, only users from same training partner
        if user.is_authenticated and hasattr(user, 'organization'):
            return user.organization == self.training_partner
        
        return False
    
    def can_user_enroll(self, user):
        """Check if a user can request enrollment in this course."""
        # Must be able to view the course first
        if not self.can_user_view(user):
            return False
        
        # Must be a learner
        if not (user.is_authenticated and user.role == 'learner'):
            return False
        
        # Check if enrollment is open
        if not self.is_enrollment_open:
            return False
        
        # Check if already enrolled
        from courses.models import Enrollment
        if Enrollment.objects.filter(student=user, course=self).exists():
            return False
        
        return True
    
    def __str__(self):
        return f"{self.title} - {self.training_partner.name} ({'Private' if self.is_private else 'Public'})"
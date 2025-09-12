from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from users.models import User, TrainingPartner


class Course(models.Model):
    """Main course model with two-stage approval workflow."""
    
    CATEGORY_CHOICES = [
        ('frontend_development', 'Frontend Development'),
        ('backend_development', 'Backend Development'),
        ('data_analyst', 'Data Analyst'),
        ('data_science', 'Data Science'),
        ('interview_preparation', 'Interview Preparation'),
        ('ai_kids', 'AI for Kids'),
        ('programming_kids', 'Programming for Kids'),
        ('robotics', 'Robotics'),
        ('devops', 'DevOps'),
        ('cybersecurity', 'Cybersecurity'),
    ]
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    APPROVAL_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('training_partner_pending', 'Pending Training Partner Approval'),
        ('super_pending', 'Pending Super Admin Approval'),
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
    
    # Relationship Fields
    tutor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_courses',
        limit_choices_to={'role__in': ['tutor', 'admin']},
        null=True,
        blank=True,
        help_text="Tutor or Admin who created this course"
    )
    training_partner = models.ForeignKey(
        TrainingPartner,
        on_delete=models.CASCADE,
        related_name='courses',
        null=True,
        blank=True,
        help_text="Training partner"
    )
    
    # Approval Workflow Fields
    is_approved_by_training_partner = models.BooleanField(
        default=False,
        help_text="Training partner admin has approved this course"
    )
    is_approved_by_super_admin = models.BooleanField(
        default=False,
        help_text="Super admin has approved this course"
    )
    approval_status = models.CharField(
        max_length=30,
        choices=APPROVAL_STATUS_CHOICES,
        default='draft'
    )
    approval_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Feedback from approvers"
    )
    training_partner_admin_approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='training_partner_approved_courses',
        help_text="Training partner admin who approved this course"
    )
    super_admin_approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='super_approved_courses',
        help_text="Super admin who approved this course"
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
        ]
    
    def clean(self):
        """Custom validation for course model."""
        super().clean()
        
        # Training partner validation
        if not self.training_partner:
            raise ValidationError({
                'training_partner': 'Course must have a training partner.'
            })
        
        # Tutor must belong to the same training partner
        if self.tutor and self.training_partner:
            if self.tutor.organization != self.training_partner:
                raise ValidationError({
                    'tutor': 'Tutor must belong to the same training partner as the course.'
                })
        
        # Set training partner from tutor if not provided
        if self.tutor and not self.training_partner:
            self.training_partner = self.tutor.organization
        
        # Validate approval logic
        if self.is_approved_by_super_admin and not self.is_approved_by_training_partner:
            raise ValidationError({
                'is_approved_by_super_admin': 'Course must be approved by training partner admin first.'
            })
        
        # Published courses must be fully approved
        if self.is_published and not (self.is_approved_by_training_partner and self.is_approved_by_super_admin):
            raise ValidationError({
                'is_published': 'Only fully approved courses can be published.'
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
        
        # Update approval status based on approval fields
        if self.is_approved_by_training_partner and self.is_approved_by_super_admin:
            self.approval_status = 'approved'
        elif self.is_approved_by_training_partner and not self.is_approved_by_super_admin:
            self.approval_status = 'super_pending'
        elif not self.is_approved_by_training_partner and not self.is_draft:
            self.approval_status = 'training_partner_pending'
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
        """Check if course is approved by both training partner admin and super admin."""
        return self.is_approved_by_training_partner and self.is_approved_by_super_admin
    
    @property
    def can_be_published(self):
        """Check if course can be published."""
        return self.is_fully_approved and not self.is_draft
    
    @property
    def display_price(self):
        """Get formatted price with currency."""
        return f"{self.currency} {self.price}"
    
    @property
    def category_display(self):
        """Get human-readable category name."""
        return dict(self.CATEGORY_CHOICES).get(self.category, self.category)
    
    @property
    def level_display(self):
        """Get human-readable level name."""
        return dict(self.LEVEL_CHOICES).get(self.level, self.level)
    
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
    
    def __str__(self):
        return f"{self.title} - {self.training_partner.name}"
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.exceptions import ValidationError
import uuid
from django.utils import timezone

KP_TYPE_CHOICES = [
    ('company', 'Company'),
    ('organization', 'Organization'),
    ('university', 'University'),
    ('institute', 'Institute'),
    ('bootcamp', 'Bootcamp'),
    ('other', 'Other'),
]


class UserManager(BaseUserManager):
    """Custom manager for User model with email as username."""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('is_approved', True)
        extra_fields.setdefault('role', 'learner')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Simple User for authentication only."""
    
    username = None  # Remove username field completely
    
    ROLE_CHOICES = [
        ('learner', 'Learner'),
        ('knowledge_partner_instructor', 'Knowledge Partner Instructor'),
        ('knowledge_partner_admin', 'Knowledge Partner Admin'),
        ('super_admin', 'Super Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name='Email Address')
    full_name = models.CharField(max_length=200, verbose_name='Full Name')
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='learner')
    
    # User status
    is_verified = models.BooleanField(default=False, verbose_name='Email Verified')
    is_approved = models.BooleanField(default=True, verbose_name='Admin Approved')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use custom manager
    objects = UserManager()
    
    # Authentication settings
    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'role']
    
    def save(self, *args, **kwargs):
        """Override save to set first_name and last_name from full_name."""
        if self.full_name:
            name_parts = self.full_name.strip().split(' ', 1)
            self.first_name = name_parts[0]
            self.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Auto-approve learners and admins, instructors need approval
        if self.role in ['learner', 'knowledge_partner_admin']:
            self.is_approved = True
        elif self.role == 'knowledge_partner_instructor' and not self.pk:
            self.is_approved = False
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.get_role_display()}"
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']


class KPProfile(models.Model):
    """Main organization profile with company details and admin contact info."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kp_profile')
    
    # Basic Information (Organization)
    name = models.CharField(max_length=200, unique=True, help_text="Organization name")
    type = models.CharField(max_length=50, choices=KP_TYPE_CHOICES)
    description = models.TextField(help_text="About the organization")
    location = models.CharField(max_length=200, help_text="Organization address/location")
    website = models.URLField(blank=True, null=True, help_text="Organization website")
    
    # Admin Personal Information
    kp_admin_name = models.CharField(max_length=200, help_text="Admin contact name")
    kp_admin_email = models.EmailField(help_text="Admin personal email")
    kp_admin_phone = models.CharField(max_length=15, blank=True, null=True, help_text="Admin phone number")
    
    # Branding & Social
    logo = models.ImageField(
        upload_to='knowledge_partners/logos/',
        blank=True,
        null=True,
        help_text="Organization logo"
    )
    linkedin_url = models.URLField(
        blank=True,
        null=True,
        help_text="LinkedIn company page URL"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Organization is active")
    is_verified = models.BooleanField(
        default=False,
        help_text="Organization has been verified by super admin"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    class Meta:
        verbose_name = 'Knowledge Partner Profile'
        verbose_name_plural = 'Knowledge Partner Profiles'
        ordering = ['name']


class KPInstructorProfile(models.Model):
    """Profile for knowledge partner instructors with qualifications and expertise."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor_profile') 
    # Personal Information
    bio = models.TextField(help_text="Professional bio for students to see")
    profile_picture = models.ImageField(upload_to='profiles/instructors/', blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # Professional Information
    title = models.CharField(max_length=100, help_text="e.g., Senior Software Engineer, Data Scientist")
    years_of_experience = models.PositiveIntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Qualifications
    highest_education = models.CharField(max_length=50, choices=[
        ('bachelor', 'Bachelor\'s Degree'),
        ('master', 'Master\'s Degree'),
        ('phd', 'PhD'),
        ('professional', 'Professional Certification'),
        ('self_taught', 'Self-Taught'),
    ])
    certifications = models.TextField(blank=True, null=True, help_text="List your professional certifications")
    
    # Expertise
    specializations = models.TextField(help_text="Areas of expertise (comma-separated)")
    technologies = models.TextField(help_text="Technologies you can teach (comma-separated)")
    languages_spoken = models.TextField(default="English", help_text="Languages you can teach in")
    
    # Social Links
    linkedin_url = models.URLField(blank=True, null=True)
    
    # Status
    is_available = models.BooleanField(default=True)  
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.full_name} - {self.knowledge_partner.name} Instructor"
    
    class Meta:
        verbose_name = 'Instructor Profile'
        verbose_name_plural = 'Instructor Profiles'


class LearnerProfile(models.Model):
    """Profile for learners with learning preferences and progress tracking."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='learner_profile')
    
    # Personal Information
    bio = models.TextField(blank=True, null=True, help_text="Tell us about yourself")
    profile_picture = models.ImageField(upload_to='profiles/learners/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # Educational Background
    education_level = models.CharField(max_length=50, choices=[
        ('high_school', 'High School'),
        ('bachelor', 'Bachelor\'s Degree'),
        ('master', 'Master\'s Degree'),
        ('phd', 'PhD'),
        ('other', 'Other'),
    ], blank=True, null=True)
    field_of_study = models.CharField(max_length=100, blank=True, null=True)
    current_institution = models.CharField(max_length=200, blank=True, null=True)
    
    # Learning Preferences
    learning_goals = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.full_name}'s Learner Profile"
    
    class Meta:
        verbose_name = 'Learner Profile'
        verbose_name_plural = 'Learner Profiles'
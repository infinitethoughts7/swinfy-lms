from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
import uuid


class Organization(models.Model):
    """Organization model for managing institutions and companies."""
    
    ORG_TYPE_CHOICES = [
        ('university', 'University'),
        ('company', 'Company'),
        ('institute', 'Institute'),
        ('bootcamp', 'Bootcamp'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    type = models.CharField(max_length=50, choices=ORG_TYPE_CHOICES)
    location = models.CharField(max_length=200)
    website = models.URLField(blank=True, null=True)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    class Meta:
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
        ordering = ['name']


class User(AbstractUser):
    """Custom user model for authentication only."""
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('tutor', 'Tutor'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Basic authentication fields only
    email = models.EmailField(unique=True, verbose_name='Email Address')
    full_name = models.CharField(max_length=200, verbose_name='Full Name')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    # Organization relationship
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True,
        related_name='users'
    )
    
    # User status
    is_verified = models.BooleanField(default=False, verbose_name='Email Verified')
    is_approved = models.BooleanField(default=True, verbose_name='Admin Approved')  # For tutors
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Authentication settings
    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'role']
    
    def clean(self):
        """Custom validation for user model."""
        super().clean()
        
        # Tutors and admins must have an organization
        if self.role in ['tutor', 'admin'] and not self.organization:
            raise ValidationError({
                'organization': 'Tutors and Admins must belong to an organization.'
            })
        
        # Students should not have an organization
        if self.role == 'student' and self.organization:
            raise ValidationError({
                'organization': 'Students cannot belong to an organization.'
            })
        
        # Only one admin per organization
        if self.role == 'admin' and self.organization:
            existing_admin = User.objects.filter(
                role='admin', 
                organization=self.organization
            ).exclude(pk=self.pk).first()
            
            if existing_admin:
                raise ValidationError({
                    'role': f'Organization "{self.organization.name}" already has an admin: {existing_admin.email}'
                })
    
    def save(self, *args, **kwargs):
        """Override save to set first_name and last_name from full_name."""
        if self.full_name:
            name_parts = self.full_name.strip().split(' ', 1)
            self.first_name = name_parts[0]
            self.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Auto-approve students and admins, tutors need approval
        if self.role in ['student', 'admin']:
            self.is_approved = True
        elif self.role == 'tutor' and not self.pk:  # New tutor
            self.is_approved = False
        
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def can_create_courses(self):
        """Check if user can create courses."""
        return self.role in ['admin', 'tutor'] and self.is_approved
    
    @property
    def can_manage_organization(self):
        """Check if user can manage organization."""
        return self.role == 'admin' and self.is_approved
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']


class StudentProfile(models.Model):
    """Profile for students with learning preferences and progress tracking."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    
    # Personal Information
    bio = models.TextField(blank=True, null=True, help_text="Tell us about yourself")
    profile_picture = models.ImageField(upload_to='profiles/students/', blank=True, null=True)
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
        return f"{self.user.full_name}'s Student Profile"
    
    class Meta:
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'


class TutorProfile(models.Model):
    """Profile for tutors with qualifications and expertise."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tutor_profile')
    
    # Personal Information
    bio = models.TextField(help_text="Professional bio for students to see")
    profile_picture = models.ImageField(upload_to='profiles/tutors/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
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
    github_url = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    personal_website = models.URLField(blank=True, null=True)
    
    # Status
    is_available = models.BooleanField(default=True)
    availability_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.full_name}'s Tutor Profile"
    
    class Meta:
        verbose_name = 'Tutor Profile'
        verbose_name_plural = 'Tutor Profiles'


class AdminProfile(models.Model):
    """Profile for organization administrators."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    
    # Personal Information
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/admins/', blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # Professional Information
    job_title = models.CharField(max_length=100, help_text="Your role in the organization")
    department = models.CharField(max_length=100, blank=True, null=True)

    
    # Contact Information
    office_location = models.CharField(max_length=200, blank=True, null=True)
    office_phone = models.CharField(max_length=15, blank=True, null=True)
    emergency_contact = models.CharField(max_length=200, blank=True, null=True)
    
    # Social Links
    linkedin_url = models.URLField(blank=True, null=True)
    professional_email = models.EmailField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.full_name}'s Admin Profile"
    
    class Meta:
        verbose_name = 'Admin Profile'
        verbose_name_plural = 'Admin Profiles'

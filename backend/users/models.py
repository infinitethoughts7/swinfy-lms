from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
import uuid

class TrainingPartner(models.Model):
    """TrainingPartner model for managing institutions and companies."""
    
    ORG_TYPE_CHOICES = [
        ('company', 'Company'),
        ('organization', 'Organization'),
        ('university', 'University'),
        ('institute', 'Institute'),
        ('bootcamp', 'Bootcamp'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    name = models.CharField(max_length=200, unique=True)
    type = models.CharField(max_length=50, choices=ORG_TYPE_CHOICES)
    description = models.TextField()
    
    # Contact Information
    location = models.CharField(max_length=200)
    website = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)  # NEW: Official email
    phone = models.CharField(max_length=20, blank=True, null=True)  # NEW: Contact phone
    
    # Branding & Social
    logo = models.ImageField(
        upload_to='training_partners/logos/',
        blank=True,
        null=True,
        help_text="Organization logo"
    )  # NEW: Logo field
    linkedin_url = models.URLField(
        blank=True,
        null=True,
        help_text="LinkedIn company page URL"
    )  # NEW: LinkedIn URL
    
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(
        default=False,
        help_text="Organization has been verified by admin"
    )  # NEW: Verification status
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def clean(self):
        """Custom validation for training partner."""
        super().clean()
        
        # Validate LinkedIn URL format
        if self.linkedin_url:
            if not ('linkedin.com' in self.linkedin_url.lower()):
                raise ValidationError({
                    'linkedin_url': 'Please enter a valid LinkedIn URL.'
                })
    
    @property
    def total_courses(self):
        """Get total number of courses."""
        return self.courses.count()
    
    @property
    def published_courses(self):
        """Get number of published courses."""
        return self.courses.filter(is_published=True).count()
    
    @property
    def total_students(self):
        """Get total number of enrolled students across all courses."""
        from courses.models import Enrollment
        return Enrollment.objects.filter(
            course__training_partner=self,
            status__in=['approved', 'active', 'completed']
        ).values('student').distinct().count()
    
    @property
    def admin_user(self):
        """Get the admin user for this training partner."""
        return self.users.filter(role='admin').first()
    
    @property
    def tutors_count(self):
        """Get number of tutors."""
        return self.users.filter(role='tutor').count()
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    class Meta:
        verbose_name = 'Training Partner'
        verbose_name_plural = 'Training Partners'
        ordering = ['name']
        indexes = [
            models.Index(fields=['is_active', 'is_verified']),
            models.Index(fields=['type']),
        ]




class User(AbstractUser):
    """Custom user model for authentication with flexible organization membership."""
    
    ROLE_CHOICES = [
        ('learner', 'Learner'),
        ('kpi', 'Knowlege Patner Instructor'),
        ('kpa', 'Knowlege Patner Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Basic authentication fields only
    email = models.EmailField(unique=True, verbose_name='Email Address')
    full_name = models.CharField(max_length=200, verbose_name='Full Name')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='learner')
    
    # TrainingPartner relationship - NOW FLEXIBLE FOR ALL ROLES
    organization = models.ForeignKey(
        'TrainingPartner', 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True,
        related_name='users',
        help_text="Training partner organization (optional for students, required for tutors/admins)"
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
        
        # Tutors and admins must have a training partner
        if self.role in ['tutor', 'admin'] and not self.organization:
            raise ValidationError({
                'organization': 'Tutors and Admins must belong to a training partner.'
            })
        
        # REMOVED: Students can now belong to organizations for private course access
        # This allows students to access private courses from their organization
        
        # Only one admin per training partner
        if self.role == 'admin' and self.organization:
            existing_admin = User.objects.filter(
                role='admin', 
                organization=self.organization
            ).exclude(pk=self.pk).first()
            
            if existing_admin:
                raise ValidationError({
                    'role': f'Training Partner "{self.organization.name}" already has an admin: {existing_admin.email}'
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
        return self.role in ['admin', 'tutor'] and self.is_approved and self.organization
    
    @property
    def can_manage_organization(self):
        """Check if user can manage training partner."""
        return self.role == 'admin' and self.is_approved and self.organization
    
    @property
    def can_access_private_courses(self):
        """Check if user can access private courses from their organization."""
        return self.organization is not None
    
    @property
    def organization_name(self):
        """Get organization name or 'Independent' for users without organization."""
        return self.organization.name if self.organization else 'Independent'
    
    @property
    def is_organization_member(self):
        """Check if user belongs to any organization."""
        return self.organization is not None
    
    def can_enroll_in_course(self, course):
        """Check if user can enroll in a specific course."""
        if self.role != 'student':
            return False
        
        # For private courses, must be from same organization
        if course.is_private:
            return self.organization == course.training_partner
        
        # For public courses, any student can enroll
        return True
    
    def get_accessible_courses(self):
        """Get queryset of courses this user can access."""
        from courses.models import Course
        
        if self.role == 'student':
            if self.organization:
                # Students with organization can see public courses + private courses from their org
                return Course.objects.filter(
                    is_published=True,
                    is_approved_by_training_partner=True
                ).filter(
                    models.Q(is_private=False) |  # Public courses
                    models.Q(is_private=True, training_partner=self.organization)  # Private from their org
                )
            else:
                # Independent students can only see public courses
                return Course.objects.filter(
                    is_published=True,
                    is_approved_by_training_partner=True,
                    is_private=False
                )
        elif self.role in ['tutor', 'admin']:
            # Tutors and admins see all courses from their organization
            return Course.objects.filter(training_partner=self.organization)
        
        return Course.objects.none()
    
    def __str__(self):
        org_info = f" - {self.organization.name}" if self.organization else " - Independent"
        return f"{self.full_name} ({self.email}){org_info}"
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['role', 'organization']),
            models.Index(fields=['organization', 'is_approved']),
        ]


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

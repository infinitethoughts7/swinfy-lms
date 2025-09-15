# backend/users/models.py - Add this model

from django.db import models
import uuid
# Remove these imports since they're in the same file:      
from .models import KnowledgePartner, User, KPAProfile
from django.core.exceptions import ValidationError

class KnowledgePartnerApplication(models.Model):
    """Model for Knowledge Partner applications before approval."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    COURSE_CATEGORIES = [
        ('ai_ml', 'AI & Machine Learning'),
        ('programming', 'Programming & Development'),
        ('data_science', 'Data Science & Analytics'),
        ('cybersecurity', 'Cybersecurity'),
        ('cloud_computing', 'Cloud Computing'),
        ('digital_marketing', 'Digital Marketing'),
        ('soft_skills', 'Soft Skills'),
        ('other', 'Other'),
    ]
    
    EXPERIENCE_CHOICES = [
        ('0-1', '0-1 years'),
        ('2-5', '2-5 years'),
        ('6-10', '6-10 years'),
        ('10+', '10+ years'),
    ]
    
    TUTOR_COUNT_CHOICES = [
        ('1-2', '1-2 tutors'),
        ('3-5', '3-5 tutors'),
        ('6-10', '6-10 tutors'),
        ('10+', '10+ tutors'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Organization Details
    organization_name = models.CharField(max_length=200)
    organization_type = models.CharField(
        max_length=50, 
        choices=KnowledgePartner.KP_TYPE_CHOICES  # Fixed: use ORG_TYPE_CHOICES instead of KP_TYPE_CHOICES
    )
    website_url = models.URLField()
    organization_email = models.EmailField()
    contact_number = models.CharField(max_length=20)
    
    # Quick Questions
    courses_interested_in = models.CharField(max_length=50, choices=COURSE_CATEGORIES)
    experience_years = models.CharField(max_length=10, choices=EXPERIENCE_CHOICES)
    expected_tutors = models.CharField(max_length=10, choices=TUTOR_COUNT_CHOICES)
    partner_message = models.TextField(blank=True, null=True)
    
    # Application Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        'User',  # Use string reference since User is in same app
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='reviewed_applications'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Created entities (if approved)
    created_knowledge_partner = models.ForeignKey(
        'KnowledgePartner',  # Use string reference
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='source_application'
    )
    created_admin_user = models.ForeignKey(
        'User',  # Use string reference
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='created_from_application'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Knowledge Partner Application'
        verbose_name_plural = 'Knowledge Partner Applications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['organization_email']),
        ]
    
    def clean(self):
        """Custom validation for application."""
        super().clean()
        
        # Check for duplicate applications from same email
        if self.organization_email:
            existing = KnowledgePartnerApplication.objects.filter(
                organization_email=self.organization_email,
                status='pending'
            ).exclude(pk=self.pk)
            
            if existing.exists():
                raise ValidationError({
                    'organization_email': 'An application from this email is already pending review.'
                })
    
    def approve_and_create_kp(self, admin_user):
        """Approve application and create Knowledge Partner + Admin user."""
        from django.utils.crypto import get_random_string
        from django.utils import timezone
        
        # Create Knowledge Partner
        knowledge_partner = KnowledgePartner.objects.create(
            name=self.organization_name,
            type=self.organization_type,
            description=f"Knowledge Partner specializing in {self.get_courses_interested_in_display()}.",
            location="To be updated",
            website=self.website_url,
            email=self.organization_email,
            phone=self.contact_number,
            is_verified=True,
        )
        
        # Generate temporary password
        temp_password = get_random_string(12)
        
        # Create Admin User - Fixed: use knowledge_partner instead of organization
        admin_user_obj = User.objects.create_user(
            email=self.organization_email,
            password=temp_password,
            full_name=f"{self.organization_name} Admin",
            role='knowledge_partner_admin',
            knowledge_partner=knowledge_partner,  # Fixed: use knowledge_partner
            is_verified=True,
            is_approved=True,
        )
        
        # Create Admin Profile
        KPAProfile.objects.create(
            user=admin_user_obj,
            job_title="Knowledge Partner Administrator",
            professional_email=self.organization_email,
        )
        
        # Update application
        self.status = 'approved'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.created_knowledge_partner = knowledge_partner
        self.created_admin_user = admin_user_obj
        self.save()
        
        return knowledge_partner, admin_user_obj, temp_password
    
    def reject_application(self, admin_user, rejection_reason):
        """Reject application with reason."""
        from django.utils import timezone
        
        self.status = 'rejected'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.admin_notes = rejection_reason
        self.save()
    
    def __str__(self):
        return f"{self.organization_name} - {self.get_status_display()}"
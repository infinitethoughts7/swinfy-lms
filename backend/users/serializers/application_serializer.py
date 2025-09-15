# Create new file: backend/users/serializers/application_serializers.py

from rest_framework import serializers
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from ..models import KnowledgePartnerApplication, KnowledgePartner, User
import re


class KnowledgePartnerApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating knowledge partner applications."""
    
    # Custom validation for phone number
    contact_number = serializers.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^\+?[\d\s\-\(\)]{7,20}$',
                message='Enter a valid phone number (7-20 digits, can include +, spaces, hyphens, parentheses)'
            )
        ]
    )
    
    class Meta:
        model = KnowledgePartnerApplication
        fields = [
            'organization_name',
            'organization_type', 
            'organization_email',
            'contact_number',
            'website_url',
            'courses_interested_in',
            'experience_years',
            'expected_tutors',
            'partner_message',
        ]
        
    def validate_organization_name(self, value):
        """Validate organization name."""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Organization name must be at least 2 characters long.")
        
        # Check if organization already exists
        if KnowledgePartner.objects.filter(name__iexact=value.strip()).exists():
            raise serializers.ValidationError("An organization with this name already exists.")
        
        # Check for pending applications
        if KnowledgePartnerApplication.objects.filter(
            organization_name__iexact=value.strip(),
            status__in=['pending', 'under_review']
        ).exists():
            raise serializers.ValidationError("An application for this organization is already pending review.")
        
        return value.strip()
    
    def validate_organization_email(self, value):
        """Validate organization email."""
        value = value.lower().strip()
        
        # Check if email is already in use by existing KP
        if KnowledgePartner.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already associated with an existing Knowledge Partner.")
        
        # Check if email is already in use by a user
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered in our system.")
        
        # Check for pending applications
        if KnowledgePartnerApplication.objects.filter(
            organization_email__iexact=value,
            status__in=['pending', 'under_review']
        ).exists():
            raise serializers.ValidationError("An application from this email is already pending review.")
        
        return value
    
    def validate_website_url(self, value):
        """Validate website URL."""
        if not value:
            raise serializers.ValidationError("Website URL is required.")
        
        # Basic URL validation
        if not re.match(r'^https?://', value):
            # Add protocol if missing
            value = 'https://' + value.lstrip('/')
        
        # Check if URL format is valid
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if not url_pattern.match(value):
            raise serializers.ValidationError("Please enter a valid website URL.")
        
        return value
    
    def validate_contact_number(self, value):
        """Validate contact number."""
        # Remove all non-digit characters for length check
        digits_only = re.sub(r'\D', '', value)
        
        if len(digits_only) < 7:
            raise serializers.ValidationError("Phone number must contain at least 7 digits.")
        
        if len(digits_only) > 15:
            raise serializers.ValidationError("Phone number cannot contain more than 15 digits.")
        
        return value.strip()
    
    def validate(self, attrs):
        """Cross-field validation."""
        # Additional business logic validation can go here
        return attrs
    
    def create(self, validated_data):
        """Create application with additional processing."""
        # You can add any pre-processing here
        return KnowledgePartnerApplication.objects.create(**validated_data)


class KnowledgePartnerApplicationListSerializer(serializers.ModelSerializer):
    """Serializer for listing knowledge partner applications (admin view)."""
    
    courses_interested_display = serializers.ReadOnlyField()
    experience_display = serializers.ReadOnlyField()
    tutors_display = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    organization_type_display = serializers.CharField(source='get_organization_type_display', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)
    can_be_approved = serializers.ReadOnlyField()
    can_be_rejected = serializers.ReadOnlyField()
    is_pending = serializers.ReadOnlyField()
    
    class Meta:
        model = KnowledgePartnerApplication
        fields = [
            'id',
            'organization_name',
            'organization_type',
            'organization_type_display',
            'organization_email',
            'contact_number',
            'website_url',
            'courses_interested_in',
            'courses_interested_display',
            'experience_years',
            'experience_display',
            'expected_tutors',
            'tutors_display',
            'partner_message',
            'status',
            'status_display',
            'admin_notes',
            'reviewed_by_name',
            'reviewed_at',
            'created_at',
            'updated_at',
            'can_be_approved',
            'can_be_rejected',
            'is_pending',
        ]


class KnowledgePartnerApplicationDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed view of knowledge partner application."""
    
    courses_interested_display = serializers.ReadOnlyField()
    experience_display = serializers.ReadOnlyField()
    tutors_display = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    organization_type_display = serializers.CharField(source='get_organization_type_display', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)
    created_knowledge_partner_name = serializers.CharField(source='created_knowledge_partner.name', read_only=True)
    
    class Meta:
        model = KnowledgePartnerApplication
        fields = '__all__'


class ApplicationApprovalSerializer(serializers.Serializer):
    """Serializer for approving applications."""
    
    admin_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=1000,
        help_text="Optional notes about the approval"
    )
    
    def validate(self, attrs):
        """Validate approval data."""
        # You can add approval-specific validation here
        return attrs


class ApplicationRejectionSerializer(serializers.Serializer):
    """Serializer for rejecting applications."""
    
    rejection_reason = serializers.CharField(
        required=True,
        max_length=1000,
        help_text="Reason for rejection (required)"
    )
    
    def validate_rejection_reason(self, value):
        """Validate rejection reason."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Rejection reason must be at least 10 characters long.")
        return value.strip()


class ApplicationUpdateNotesSerializer(serializers.ModelSerializer):
    """Serializer for updating admin notes."""
    
    class Meta:
        model = KnowledgePartnerApplication
        fields = ['admin_notes']
        
    def validate_admin_notes(self, value):
        """Validate admin notes."""
        if value and len(value.strip()) > 2000:
            raise serializers.ValidationError("Admin notes cannot exceed 2000 characters.")
        return value


# Response serializer for successful operations
class ApplicationActionResponseSerializer(serializers.Serializer):
    """Serializer for application action responses."""
    
    success = serializers.BooleanField()
    message = serializers.CharField()
    application_id = serializers.UUIDField()
    knowledge_partner_id = serializers.UUIDField(required=False)
    admin_email = serializers.EmailField(required=False)
    temporary_password = serializers.CharField(required=False)
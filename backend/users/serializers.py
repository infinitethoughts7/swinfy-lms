from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, KnowledgePartner, LearnerProfile, KPIProfile, KPAProfile


class KnowledgePartnerSerializer(serializers.ModelSerializer):
    """Serializer for KnowledgePartner model."""
    
    class Meta:
        model = KnowledgePartner
        fields = ['id', 'name', 'type', 'location', 'website', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration matching frontend form."""
    
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    organization_details = serializers.DictField(write_only=True, required=False)
    organization_id = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'full_name', 'role', 'password', 'confirm_password',
            'organization_id', 'organization_details'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
            'role': {'required': True},
        }
    
    def validate(self, attrs):
        """Custom validation for registration data."""
        # Password confirmation
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })
        
        # Validate password strength
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({
                'password': e.messages
            })
        
        # Role-specific validation
        role = attrs.get('role')
        organization_id = attrs.get('organization_id')
        organization_details = attrs.get('organization_details')
        
        if role == 'learner':
            # Learners can optionally have organization
            pass  # No validation needed, learners can be independent or belong to org
        
        elif role == 'knowledge_partner_instructor':
            # Instructors must select an existing organization
            if not organization_id:
                raise serializers.ValidationError({
                    'organization_id': 'Instructors must select an organization.'
                })
            
            # Check if organization exists
            try:
                KnowledgePartner.objects.get(id=organization_id)
            except KnowledgePartner.DoesNotExist:
                raise serializers.ValidationError({
                    'organization_id': 'Selected organization does not exist.'
                })
        
        elif role == 'knowledge_partner_admin':
            # Admins must create a new organization
            if not organization_details:
                raise serializers.ValidationError({
                    'organization_details': 'Admins must provide organization details.'
                })
            
            # Validate organization details
            required_fields = ['name', 'type', 'location', 'description']
            for field in required_fields:
                if not organization_details.get(field):
                    raise serializers.ValidationError({
                        'organization_details': f'{field.title()} is required for organization.'
                    })
            
            # Check if organization name already exists
            if KnowledgePartner.objects.filter(name=organization_details['name']).exists():
                raise serializers.ValidationError({
                    'organization_details': 'An organization with this name already exists.'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create user and handle organization assignment."""
        # Remove non-model fields
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        organization_id = validated_data.pop('organization_id', None)
        organization_details = validated_data.pop('organization_details', None)
        
        # Handle organization assignment based on role
        if validated_data['role'] == 'knowledge_partner_instructor' and organization_id:
            # Assign instructor to existing organization
            validated_data['organization'] = KnowledgePartner.objects.get(id=organization_id)
            validated_data['is_approved'] = False  # Instructors need approval
        
        elif validated_data['role'] == 'knowledge_partner_admin' and organization_details:
            # Create new organization for admin
            organization = KnowledgePartner.objects.create(
                name=organization_details['name'],
                type=organization_details['type'],
                location=organization_details['location'],
                website=organization_details.get('website', ''),
                description=organization_details['description']
            )
            validated_data['organization'] = organization
            validated_data['is_approved'] = True  # Admins are auto-approved
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            password=password,
            **validated_data
        )
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile information (authentication data only)."""
    
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    organization_type = serializers.CharField(source='organization.type', read_only=True)
    can_create_courses = serializers.ReadOnlyField()
    can_manage_organization = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name', 'role',
            'organization_name', 'organization_type', 'is_verified', 'is_approved',
            'can_create_courses', 'can_manage_organization', 'created_at'
        ]
        read_only_fields = [
            'id', 'email', 'role', 'organization_name', 'organization_type',
            'is_verified', 'is_approved', 'can_create_courses', 'can_manage_organization',
            'created_at'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """Validate password change data."""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'New passwords do not match.'
            })
        
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({
                'new_password': e.messages
            })
        
        return attrs
    
    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class LearnerProfileSerializer(serializers.ModelSerializer):
    """Serializer for LearnerProfile with optional fields for completion flow."""
    
    class Meta:
        model = LearnerProfile
        fields = [
            'bio', 'profile_picture', 'date_of_birth', 'phone_number',
            'education_level', 'field_of_study', 'current_institution',
            'learning_goals'
        ]
        extra_kwargs = {
            'bio': {'required': False},
            'profile_picture': {'required': False},
            'date_of_birth': {'required': False},
            'phone_number': {'required': False},
            'education_level': {'required': False},
            'field_of_study': {'required': False},
            'current_institution': {'required': False},
            'learning_goals': {'required': False},
        }


class InstructorProfileSerializer(serializers.ModelSerializer):
    """Serializer for KPIProfile with optional fields for completion flow."""
    
    class Meta:
        model = KPIProfile
        fields = [
            'bio', 'profile_picture', 'date_of_birth', 'phone_number',
            'title', 'years_of_experience', 'hourly_rate',
            'highest_education', 'certifications',
            'specializations', 'technologies', 'languages_spoken',
            'linkedin_url', 'github_url', 'portfolio_url', 'personal_website',
            'is_available', 'availability_notes'
        ]
        extra_kwargs = {
            'bio': {'required': True},  # Professional bio required for tutors
            'title': {'required': True},  # Title required for tutors
            'highest_education': {'required': True},  # Education required for tutors
            'specializations': {'required': True},  # Specializations required for tutors
            'technologies': {'required': True},  # Technologies required for tutors
            # All other fields optional for completion flow
            'profile_picture': {'required': False},
            'date_of_birth': {'required': False},
            'phone_number': {'required': False},
            'years_of_experience': {'required': False},
            'hourly_rate': {'required': False},
            'certifications': {'required': False},
            'languages_spoken': {'required': False},
            'linkedin_url': {'required': False},
            'github_url': {'required': False},
            'portfolio_url': {'required': False},
            'personal_website': {'required': False},
            'is_available': {'required': False},
            'availability_notes': {'required': False},
        }


class AdminProfileSerializer(serializers.ModelSerializer):
    """Serializer for KPAProfile with optional fields for completion flow."""
    
    class Meta:
        model = KPAProfile
        fields = [
            'bio', 'profile_picture', 'phone_number',
            'job_title', 'department',
            'office_location', 'office_phone', 'emergency_contact',
            'linkedin_url', 'professional_email'
        ]
        extra_kwargs = {
            'job_title': {'required': True},  # Job title required for admins
            # All other fields optional for completion flow
            'bio': {'required': False},
            'profile_picture': {'required': False},
            'phone_number': {'required': False},
            'department': {'required': False},
            'office_location': {'required': False},
            'office_phone': {'required': False},
            'emergency_contact': {'required': False},
            'linkedin_url': {'required': False},
            'professional_email': {'required': False},
        }


class ProfileCompletionSerializer(serializers.Serializer):
    """Unified serializer for profile completion based on user role."""
    
    skip_profile = serializers.BooleanField(default=False, required=False)
    learner_profile = LearnerProfileSerializer(required=False)
    instructor_profile = InstructorProfileSerializer(required=False)
    admin_profile = AdminProfileSerializer(required=False)
    
    def validate(self, attrs):
        """Validate profile completion data based on user role."""
        user = self.context['request'].user
        skip_profile = attrs.get('skip_profile', False)
        
        if skip_profile:
            # User wants to skip profile completion
            return attrs
        
        # Check if user provided profile data for their role
        if user.role == 'learner':
            if 'learner_profile' not in attrs:
                raise serializers.ValidationError({
                    'learner_profile': 'Learner profile data is required.'
                })
        elif user.role == 'knowledge_partner_instructor':
            if 'instructor_profile' not in attrs:
                raise serializers.ValidationError({
                    'instructor_profile': 'Instructor profile data is required.'
                })
        elif user.role == 'knowledge_partner_admin':
            if 'admin_profile' not in attrs:
                raise serializers.ValidationError({
                    'admin_profile': 'Admin profile data is required.'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create profile based on user role."""
        user = self.context['request'].user
        skip_profile = validated_data.get('skip_profile', False)
        
        if skip_profile:
            return {'profile_created': False, 'message': 'Profile completion skipped'}
        
        # Create profile based on user role
        if user.role == 'learner' and 'learner_profile' in validated_data:
            profile_data = validated_data['learner_profile']
            profile, created = LearnerProfile.objects.get_or_create(
                user=user,
                defaults=profile_data
            )
            if not created:
                # Update existing profile
                for key, value in profile_data.items():
                    setattr(profile, key, value)
                profile.save()
            
        elif user.role == 'knowledge_partner_instructor' and 'instructor_profile' in validated_data:
            profile_data = validated_data['instructor_profile']
            profile, created = KPIProfile.objects.get_or_create(
                user=user,
                defaults=profile_data
            )
            if not created:
                # Update existing profile
                for key, value in profile_data.items():
                    setattr(profile, key, value)
                profile.save()
            
        elif user.role == 'knowledge_partner_admin' and 'admin_profile' in validated_data:
            profile_data = validated_data['admin_profile']
            profile, created = KPAProfile.objects.get_or_create(
                user=user,
                defaults=profile_data
            )
            if not created:
                # Update existing profile
                for key, value in profile_data.items():
                    setattr(profile, key, value)
                profile.save()
        
        return {'profile_created': True, 'message': 'Profile completed successfully'}

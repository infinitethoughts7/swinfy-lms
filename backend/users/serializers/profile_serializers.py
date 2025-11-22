from rest_framework import serializers
from ..models import User, KPProfile, LearnerProfile, KPInstructorProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile information (basic user data)."""
    
    knowledge_partner_name = serializers.CharField(
        source='knowledge_partner.name', 
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'full_name', 
            'role',
            'knowledge_partner_name',
            'is_verified', 
            'is_approved',
            'created_at'
        ]
        read_only_fields = [
            'id', 
            'email', 
            'role', 
            'knowledge_partner_name',
            'is_verified', 
            'is_approved',
            'created_at'
        ]


class LearnerProfileSerializer(serializers.ModelSerializer):
    """Serializer for LearnerProfile with optional fields for completion flow."""
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LearnerProfile
        fields = [
            'bio', 'profile_picture', 'profile_picture_url', 'phone_number', 'learning_goals', 'interests'
        ]
        extra_kwargs = {
            'bio': {'required': False},
            'profile_picture': {'required': False},
            'phone_number': {'required': False},
            'learning_goals': {'required': False},
            'interests': {'required': False},
        }
    
    def get_profile_picture_url(self, obj):
        """Get the direct profile picture URL."""
        if not obj.profile_picture:
            return None
        try:
            return obj.profile_picture.url
        except ValueError:
            return None


class InstructorProfileSerializer(serializers.ModelSerializer):
    """Serializer for KPInstructorProfile with optional fields for completion flow."""
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = KPInstructorProfile
        fields = [
            'bio', 'profile_picture', 'profile_picture_url', 'phone_number',
            'title', 'years_of_experience', 'hourly_rate',
            'highest_education', 'certifications',
            'specializations', 'technologies', 'languages_spoken',
            'linkedin_url', 'is_available'
        ]
        extra_kwargs = {
            'bio': {'required': False},  # Make optional for updates
            'title': {'required': False},  # Make optional for updates
            'highest_education': {'required': False},  # Make optional for updates
            'specializations': {'required': False},  # Make optional for updates
            'technologies': {'required': False},  # Make optional for updates
            # All other fields optional for completion flow
            'profile_picture': {'required': False},
            'phone_number': {'required': False},
            'years_of_experience': {'required': False},
            'hourly_rate': {'required': False},
            'certifications': {'required': False},
            'languages_spoken': {'required': False},
            'linkedin_url': {'required': False},
            'is_available': {'required': False},
        }
    
    def get_profile_picture_url(self, obj):
        """Get the direct profile picture URL."""
        if not obj.profile_picture:
            return None
        try:
            return obj.profile_picture.url
        except ValueError:
            return None


# AdminProfileSerializer removed - KPAProfile model not available in current models.py


class ProfileCompletionSerializer(serializers.Serializer):
    """Unified serializer for profile completion based on user role."""
    
    skip_profile = serializers.BooleanField(default=False, required=False)
    learner_profile = LearnerProfileSerializer(required=False)
    instructor_profile = InstructorProfileSerializer(required=False)
    
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
        # Admin profile validation removed - KPAProfile model not available
        
        return attrs
    
    def create(self, validated_data):
        """Create profile based on user role."""
        user = self.context['request'].user
        skip_profile = validated_data.get('skip_profile', False)
        
        if skip_profile:
            return {'profile_created': False, 'message': 'Profile completion skipped. You can complete your profile later from your dashboard.'}
        
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
            profile, created = KPInstructorProfile.objects.get_or_create(
                user=user,
                defaults=profile_data
            )
            if not created:
                # Update existing profile
                for key, value in profile_data.items():
                    setattr(profile, key, value)
                profile.save()
            
        # Admin profile creation removed - KPAProfile model not available
        
        return {'profile_created': True, 'message': '🎉 Profile completed successfully! Welcome to Swinfy LMS. You can now access all features and start your learning journey.'}



class KPProfileSerializer(serializers.ModelSerializer):
    """Serializer for KP Profile management."""
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = KPProfile
        fields = [
            'id',
            'name',
            'type',
            'description',
            'location',
            'website',
            'kp_admin_name',
            'kp_admin_email',
            'kp_admin_phone',
            'logo',
            'logo_url',
            'linkedin_url',
            'is_active',
            'is_verified',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True},
            'type': {'required': False},
            'description': {'required': False, 'allow_blank': True},
            'location': {'required': False, 'allow_blank': True},
            'website': {'required': False, 'allow_blank': True},
            'kp_admin_name': {'required': False, 'allow_blank': True},
            'kp_admin_email': {'required': False, 'allow_blank': True},
            'kp_admin_phone': {'required': False, 'allow_blank': True},
            'linkedin_url': {'required': False, 'allow_blank': True},
        }
    
    def validate_name(self, value):
        """Ensure organization name is unique."""
        if not value or value.strip() == '':
            return value  # Allow empty values for partial updates
            
        if self.instance and self.instance.name == value:
            return value
        
        if KPProfile.objects.filter(name=value).exists():
            raise serializers.ValidationError("An organization with this name already exists.")
        return value
    
    def validate_kp_admin_email(self, value):
        """Ensure admin email is unique among KP admins."""
        if not value or value.strip() == '':
            return value  # Allow empty values for partial updates
            
        if self.instance and self.instance.kp_admin_email == value:
            return value
        
        if User.objects.filter(email=value, role='knowledge_partner').exclude(
            kp_profile=self.instance
        ).exists():
            raise serializers.ValidationError("This email is already registered as a KP admin.")
        return value
    
    def update(self, instance, validated_data):
        """Update KP profile and related user information."""
        # Filter out empty values to only update fields that have actual content
        filtered_data = {}
        for key, value in validated_data.items():
            if value is not None and str(value).strip() != '':
                filtered_data[key] = value
        
        # Update user's full name if admin name changed and has value
        if 'kp_admin_name' in filtered_data and filtered_data['kp_admin_name']:
            instance.user.full_name = filtered_data['kp_admin_name']
            instance.user.save()
        
        # Update user's email if admin email changed and has value
        if 'kp_admin_email' in filtered_data and filtered_data['kp_admin_email']:
            instance.user.email = filtered_data['kp_admin_email']
            instance.user.save()
        
        return super().update(instance, filtered_data)
    
    def get_logo_url(self, obj):
        """Get the direct logo URL."""
        if not obj.logo:
            return None
        try:
            return obj.logo.url
        except ValueError:
            return None

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from ..models import User, KPProfile, LearnerProfile, KPInstructorProfile, OTPVerification


class KPProfileSerializer(serializers.ModelSerializer):
    """Serializer for KPProfile model."""
    
    class Meta:
        model = KPProfile
        fields = ['id', 'name', 'type', 'location', 'website', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Simplified serializer for learner registration only."""
    
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    knowledge_partner_id = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'full_name', 'password', 'confirm_password', 'knowledge_partner_id'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
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
        
        # Validate knowledge partner if provided
        knowledge_partner_id = attrs.get('knowledge_partner_id')
        if knowledge_partner_id:
            try:
                KPProfile.objects.get(id=knowledge_partner_id, is_active=True)
            except KPProfile.DoesNotExist:
                raise serializers.ValidationError({
                    'knowledge_partner_id': 'Selected knowledge partner does not exist or is not active.'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create learner user only."""
        # Remove non-model fields
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        knowledge_partner_id = validated_data.pop('knowledge_partner_id', None)
        
        # Force role to learner - SECURITY: Only learners can register publicly
        validated_data['role'] = 'learner'
        validated_data['is_verified'] = False  # Email verification required
        validated_data['is_approved'] = True   # Learners are auto-approved
        
        # Handle knowledge partner association for learners
        if knowledge_partner_id:
            validated_data['knowledge_partner'] = KPProfile.objects.get(id=knowledge_partner_id)
            validated_data['kp_approval_status'] = 'pending'  # Requires KP admin approval
        else:
            validated_data['kp_approval_status'] = 'none'  # No association requested
        
        # Create user
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        # Always create learner profile
        LearnerProfile.objects.create(user=user)
        
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


# =========================
# KP Instructor CRUD (KP Admin)
# =========================

class KPInstructorUserSerializer(serializers.ModelSerializer):
    """Basic user fields for KP Instructor."""

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'is_verified', 'is_approved', 'created_at']
        read_only_fields = ['id', 'role', 'is_verified', 'is_approved', 'created_at']


class KPInstructorCreateSerializer(serializers.Serializer):
    """Create a new KP Instructor (user only, profile with defaults)."""

    # User fields - only what KP admin should set
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=200)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate_email(self, value: str):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate_password(self, value: str):
        """Validate password strength."""
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, attrs):
        print(f"DEBUG SERIALIZER: Received data for validation: {attrs}")
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        print(f"DEBUG SERIALIZER: Creating instructor with validated_data: {validated_data}")
        print(f"DEBUG SERIALIZER: Required fields - email: {validated_data.get('email')}, full_name: {validated_data.get('full_name')}, password: {'***' if validated_data.get('password') else 'MISSING'}")
        print(f"DEBUG SERIALIZER: Context request user: {self.context.get('request', {}).user if self.context.get('request') else 'NO REQUEST'}")
        # Remove confirm_password as it's not needed for user creation
        validated_data.pop('confirm_password', None)

        # Extract user fields
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        full_name = validated_data.pop('full_name')

        # Get the Knowledge Partner user
        kp_user = self.context['request'].user
        
        # Find the KPProfile where this user is the Knowledge Partner
        try:
            kp_profile = KPProfile.objects.get(user=kp_user)
        except KPProfile.DoesNotExist:
            raise serializers.ValidationError("Knowledge Partner must have an associated profile")

        # Create instructor user
        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            role='knowledge_partner_instructor',
            is_verified=True,  # KP admin created users are pre-verified
            is_approved=True,  # KP admin created users are pre-approved
            knowledge_partner=kp_profile,  # Link user to KP organization
        )

        # Create instructor profile with default values that instructor can update later
        KPInstructorProfile.objects.create(
            user=user,
            knowledge_partner=kp_profile,  # Link instructor to KP organization
            bio='Professional instructor profile - to be updated by instructor.',
            title='Instructor',
            highest_education='bachelor',
            specializations='To be updated by instructor',
            technologies='To be updated by instructor',
            years_of_experience=0,
            languages_spoken='English',
            is_available=True,  # Default to available
        )

        return user


class KPInstructorListSerializer(serializers.ModelSerializer):
    """List serializer combining user + quick profile fields."""

    email = serializers.EmailField(source='user.email')
    full_name = serializers.CharField(source='user.full_name')
    is_active = serializers.BooleanField(source='user.is_active')
    is_approved = serializers.BooleanField(source='user.is_approved')

    class Meta:
        model = KPInstructorProfile
        fields = [
            'id', 'email', 'full_name', 'title', 'specializations', 'technologies',
            'years_of_experience', 'is_available', 'is_active', 'is_approved', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class KPInstructorDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer returning both user and profile data."""

    user = KPInstructorUserSerializer(read_only=True)

    class Meta:
        model = KPInstructorProfile
        fields = [
            'id', 'user', 'bio', 'profile_picture', 'phone_number',
            'title', 'years_of_experience', 'highest_education', 'certifications',
            'specializations', 'technologies', 'languages_spoken', 'linkedin_url',
            'is_available', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class KPInstructorUpdateSerializer(serializers.ModelSerializer):
    """Update serializer for instructor profile. User fields update supported via separate keys."""

    user_email = serializers.EmailField(required=False)
    user_full_name = serializers.CharField(required=False, max_length=200)

    class Meta:
        model = KPInstructorProfile
        fields = [
            'bio', 'profile_picture', 'phone_number',
            'title', 'years_of_experience', 'highest_education', 'certifications',
            'specializations', 'technologies', 'languages_spoken', 'linkedin_url',
            'is_available', 'user_email', 'user_full_name'
        ]

    def validate_user_email(self, value: str):
        user = self.instance.user if self.instance else None
        qs = User.objects.filter(email__iexact=value)
        if user:
            qs = qs.exclude(id=user.id)
        if qs.exists():
            raise serializers.ValidationError('Another user with this email already exists.')
        return value.lower()

    def update(self, instance: KPInstructorProfile, validated_data):
        # Update related user fields if provided
        user = instance.user
        user_email = validated_data.pop('user_email', None)
        user_full_name = validated_data.pop('user_full_name', None)

        if user_email is not None:
            user.email = user_email
        if user_full_name is not None:
            user.full_name = user_full_name
        if user_email is not None or user_full_name is not None:
            user.save()

        # Update profile fields
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        return instance


# =========================
# OTP Verification Serializers
# =========================

class SendOTPSerializer(serializers.Serializer):
    """Serializer for sending OTP to email."""
    
    email = serializers.EmailField(required=True)
    purpose = serializers.ChoiceField(
        choices=OTPVerification.PURPOSE_CHOICES,
        default='email_verification'
    )
    
    def validate_email(self, value):
        """Validate email address."""
        # Check if user exists for email verification
        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('No user found with this email address.')
        return value.lower()


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for verifying OTP code."""
    
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(max_length=6, min_length=6, required=True)
    purpose = serializers.ChoiceField(
        choices=OTPVerification.PURPOSE_CHOICES,
        default='email_verification'
    )
    
    def validate_otp_code(self, value):
        """Validate OTP code format."""
        if not value.isdigit():
            raise serializers.ValidationError('OTP code must contain only digits.')
        return value
    
    def validate_email(self, value):
        """Validate email address."""
        return value.lower()


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP."""
    
    email = serializers.EmailField(required=True)
    purpose = serializers.ChoiceField(
        choices=OTPVerification.PURPOSE_CHOICES,
        default='email_verification'
    )
    
    def validate_email(self, value):
        """Validate email address format."""
        return value.lower()

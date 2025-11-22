from rest_framework import serializers
from ..models import User, KPProfile, KPInstructorProfile
import secrets
import string


class KPInstructorUserSerializer(serializers.ModelSerializer):
    """Basic user fields for KP Instructor."""

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'is_verified', 'is_approved', 'created_at']
        read_only_fields = ['id', 'role', 'is_verified', 'is_approved', 'created_at']


def generate_secure_password(length=12):
    """Generate a secure random password with letters, digits, and special characters."""
    letters = string.ascii_letters
    digits = string.digits
    special_chars = '@#$%&*!'
    
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(digits),
        secrets.choice(special_chars),
    ]
    
    all_chars = letters + digits + special_chars
    password += [secrets.choice(all_chars) for _ in range(length - 4)]
    
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)


class KPInstructorCreateSerializer(serializers.Serializer):
    """Create a new KP Instructor (user only, profile with defaults)."""

    # User fields - only what KP admin should set
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=200)
    password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate_email(self, value: str):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate_password(self, value: str):
        """Validate password strength - skip if empty (will be auto-generated)."""
        # If password is empty or not provided, skip validation (will be auto-generated)
        if not value or value.strip() == '':
            return value
            
        # Only validate if password is actually provided
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, attrs):
        print(f"DEBUG SERIALIZER: Received data for validation: {attrs}")
        
        # If password is not provided or empty, generate a random one
        if not attrs.get('password') or attrs.get('password').strip() == '':
            generated_password = generate_secure_password(length=12)
            attrs['password'] = generated_password
            attrs['confirm_password'] = generated_password
            attrs['_password_generated'] = True  # Flag to indicate password was auto-generated
            print(f"DEBUG SERIALIZER: Generated random password for instructor")
        else:
            attrs['_password_generated'] = False
            # If password provided, confirm_password must match
            if attrs.get('password') != attrs.get('confirm_password'):
                raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        
        return attrs

    def create(self, validated_data):
        print(f"DEBUG SERIALIZER: Creating instructor with validated_data: {validated_data}")
        print(f"DEBUG SERIALIZER: Required fields - email: {validated_data.get('email')}, full_name: {validated_data.get('full_name')}, password: {'***' if validated_data.get('password') else 'MISSING'}")
        print(f"DEBUG SERIALIZER: Context request user: {self.context.get('request', {}).user if self.context.get('request') else 'NO REQUEST'}")
        
        # Store password and flag before popping
        password_generated = validated_data.pop('_password_generated', False)
        
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

        # Store password info on user object so view can access it for email
        user._temp_password = password
        user._password_was_generated = password_generated
        user._kp_profile = kp_profile

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

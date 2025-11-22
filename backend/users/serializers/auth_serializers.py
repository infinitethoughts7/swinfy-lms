from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from ..models import User, KPProfile, LearnerProfile, OTPVerification


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


from rest_framework import serializers
from ..models import KPProfile, User


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

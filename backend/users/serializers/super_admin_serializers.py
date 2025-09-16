# backend/users/serializers/super_admin_serializers.py

from rest_framework import serializers
from ..models.models import User, KPProfile
from ..models.kp_application import KnowledgePartnerApplication


class KnowledgePartnerApplicationSerializer(serializers.ModelSerializer):
    """Serializer for KP applications in Super Admin dashboard."""
    
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_knowledge_partner_type_display', read_only=True)
    courses_interested_display = serializers.CharField(source='get_courses_interested_in_display', read_only=True)
    experience_display = serializers.CharField(source='get_experience_years_display', read_only=True)
    expected_tutors_display = serializers.CharField(source='get_expected_tutors_display', read_only=True)
    
    class Meta:
        model = KnowledgePartnerApplication
        fields = [
            'id',
            'knowledge_partner_name',
            'knowledge_partner_type',
            'type_display',
            'knowledge_partner_email',
            'contact_number',
            'website_url',
            'courses_interested_in',
            'courses_interested_display',
            'experience_years',
            'experience_display',
            'expected_tutors',
            'expected_tutors_display',
            'partner_message',
            'status',
            'status_display',
            'admin_notes',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 'status_display', 'type_display', 'courses_interested_display',
            'experience_display', 'expected_tutors_display', 'reviewed_by_name',
            'created_at', 'updated_at'
        ]


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for user list in Super Admin dashboard."""
    
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    kp_name = serializers.CharField(source='kp_profile.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'role',
            'role_display',
            'kp_name',
            'is_verified',
            'is_approved',
            'is_active',
            'is_staff',
            'is_superuser',
            'last_login',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 'email', 'full_name', 'role', 'role_display', 'kp_name',
            'is_verified', 'is_approved', 'is_active', 'is_staff', 'is_superuser',
            'last_login', 'created_at', 'updated_at'
        ]  # All fields are read-only for Super Admin


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    
    users = serializers.DictField()
    applications = serializers.DictField()
    knowledge_partners = serializers.DictField()


class ApproveApplicationSerializer(serializers.Serializer):
    """Serializer for approving applications."""
    
    notes = serializers.CharField(required=False, allow_blank=True)


class RejectApplicationSerializer(serializers.Serializer):
    """Serializer for rejecting applications."""
    
    reason = serializers.CharField(required=True, allow_blank=False)

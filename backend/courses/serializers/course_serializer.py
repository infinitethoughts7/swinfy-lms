from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Course
from users.serializers import TrainingPartnerSerializer, UserProfileSerializer

User = get_user_model()


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for course list views with minimal data."""
    training_partner = TrainingPartnerSerializer(read_only=True)
    tutor = UserProfileSerializer(read_only=True)
    category_display = serializers.CharField(source='category_display', read_only=True)
    level_display = serializers.CharField(source='level_display', read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'price', 'duration_weeks',
            'category', 'category_display', 'level', 'level_display', 'rating',
            'total_reviews', 'enrollment_count', 'thumbnail', 'is_featured',
            'training_partner', 'tutor', 'created_at'
        ]


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new courses."""
    
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'short_description', 'price', 'duration_weeks',
            'category', 'level', 'tags', 'learning_outcomes', 'prerequisites',
            'thumbnail', 'banner_image', 'demo_video', 'training_partner', 'tutor'
        ]
    
    def validate(self, data):
        """Custom validation for course creation."""
        # Ensure tutor belongs to the same training partner
        if data.get('tutor') and data.get('training_partner'):
            if data['tutor'].training_partner != data['training_partner']:
                raise serializers.ValidationError({
                    'tutor': 'Tutor must belong to the same training partner as the course.'
                })
        
        # Set training partner from tutor if not provided
        if data.get('tutor') and not data.get('training_partner'):
            data['training_partner'] = data['tutor'].training_partner
        
        return data


class CourseUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating existing courses."""
    
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'short_description', 'price', 'duration_weeks',
            'category', 'level', 'tags', 'learning_outcomes', 'prerequisites',
            'thumbnail', 'banner_image', 'demo_video', 'is_published', 'is_featured'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class CourseSerializer(serializers.ModelSerializer):
    """Full serializer for course detail views."""
    training_partner = TrainingPartnerSerializer(read_only=True)
    tutor = UserProfileSerializer(read_only=True)
    category_display = serializers.CharField(source='category_display', read_only=True)
    level_display = serializers.CharField(source='level_display', read_only=True)
    tags_list = serializers.SerializerMethodField()
    is_fully_approved = serializers.BooleanField(read_only=True)
    can_be_published = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'short_description', 'price',
            'duration_weeks', 'category', 'category_display', 'level', 'level_display',
            'tags', 'tags_list', 'learning_outcomes', 'prerequisites', 'thumbnail',
            'banner_image', 'demo_video', 'rating', 'total_reviews', 'enrollment_count',
            'view_count', 'is_published', 'is_featured', 'is_draft', 'approval_status',
            'is_approved_by_training_partner', 'is_approved_by_super_admin',
            'is_fully_approved', 'can_be_published', 'training_partner', 'tutor',
            'created_at', 'updated_at', 'published_at', 'last_enrollment'
        ]
        read_only_fields = [
            'id', 'slug', 'rating', 'total_reviews', 'enrollment_count', 'view_count',
            'approval_status', 'is_approved_by_training_partner', 'is_approved_by_super_admin',
            'is_fully_approved', 'can_be_published', 'created_at', 'updated_at',
            'published_at', 'last_enrollment'
        ]
    
    def get_tags_list(self, obj):
        """Get tags as a list."""
        return obj.get_tags_list()


class CourseApprovalSerializer(serializers.ModelSerializer):
    """Serializer for course approval operations."""
    approval_notes = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Course
        fields = ['approval_notes']
    
    def validate(self, data):
        """Validate approval data."""
        user = self.context['request'].user
        
        # Check if user has permission to approve
        if not (user.role == 'admin' or user.role == 'super_admin'):
            raise serializers.ValidationError('You do not have permission to approve courses.')
        
        return data


class CourseStatsSerializer(serializers.Serializer):
    """Serializer for course statistics."""
    total_courses = serializers.IntegerField()
    published_courses = serializers.IntegerField()
    draft_courses = serializers.IntegerField()
    pending_approval = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    featured_courses = serializers.IntegerField()

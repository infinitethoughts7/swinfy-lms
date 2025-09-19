"""
Serializers for enrollment-related models.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import (
    Enrollment, CourseReview, CourseWishlist, CourseNotification,
    LessonProgress, CourseProgress
)
from .course_serializer import CourseListSerializer
from users.serializers import UserProfileSerializer 


User = get_user_model()


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for enrollment details."""
    learner = UserProfileSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    is_completed = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_approved = serializers.BooleanField(read_only=True)
    is_pending = serializers.BooleanField(read_only=True)
    is_rejected = serializers.BooleanField(read_only=True)
    can_access_content = serializers.BooleanField(read_only=True)
    days_since_enrollment = serializers.IntegerField(read_only=True)
    days_since_start = serializers.IntegerField(read_only=True)
    days_to_complete = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'learner', 'course', 'enrollment_type', 'status',
            'enrollment_date', 'start_date', 'completion_date', 'last_accessed',
            'progress_percentage', 'current_module', 'current_lesson',
            'amount_paid', 'payment_status', 'payment_method', 'payment_reference',
            'approved_by', 'approval_date', 'rejection_reason', 'admin_notes',
            'is_completed', 'is_active', 'is_approved', 'is_pending', 'is_rejected',
            'can_access_content', 'days_since_enrollment', 'days_since_start',
            'days_to_complete', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'enrollment_date', 'start_date', 'completion_date', 'last_accessed',
            'progress_percentage', 'is_completed', 'is_active', 'is_approved',
            'is_pending', 'is_rejected', 'can_access_content', 'days_since_enrollment',
            'days_since_start', 'days_to_complete', 'created_at', 'updated_at'
        ]


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new enrollments."""
    
    class Meta:
        model = Enrollment
        fields = ['course', 'amount_paid', 'payment_method', 'payment_reference', 'enrollment_type']
    
    def validate(self, data):
        """Validate enrollment data."""
        course = data['course']
        learner = self.context['request'].user

        # Check if learner is already enrolled
        if Enrollment.objects.filter(learner=learner, course=course).exists():
            raise serializers.ValidationError('You are already enrolled in this course.')
        
        # Check if course is available for enrollment
        if not course.is_published or not course.is_fully_approved:
            raise serializers.ValidationError('This course is not available for enrollment.')
        
        # Validate payment amount
        if data['amount_paid'] > course.price:
            raise serializers.ValidationError('Amount paid cannot exceed course price.')
        
        return data
    
    def create(self, validated_data):
        """Create enrollment with learner from request."""
        validated_data['learner'] = self.context['request'].user
        return super().create(validated_data)


class CourseReviewSerializer(serializers.ModelSerializer):
    """Serializer for course reviews."""
    learner = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseReview
        fields = [
            'id', 'learner', 'course', 'rating', 'title', 'content',
            'is_approved', 'is_anonymous', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'learner', 'course', 'is_approved', 'created_at', 'updated_at']
    
    def get_learner(self, obj):
        """Get learner information."""
        if obj.is_anonymous:
            return {'full_name': 'Anonymous', 'email': '***@***.***'}
        return UserProfileSerializer(obj.learner).data
    
    def get_course(self, obj):
        """Get course information."""
        return CourseListSerializer(obj.course).data
    
    def validate_rating(self, value):
        """Validate rating value."""
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value
    
    def create(self, validated_data):
        """Create review with enrollment from context."""
        enrollment = self.context['enrollment']
        validated_data['enrollment'] = enrollment
        return super().create(validated_data)


class CourseWishlistSerializer(serializers.ModelSerializer):
    """Serializer for course wishlist."""
    learner = UserProfileSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = CourseWishlist
        fields = ['id', 'learner', 'course', 'created_at']
        read_only_fields = ['id', 'learner', 'created_at']
    
    def create(self, validated_data):
        """Create wishlist item with learner from request."""
        validated_data['learner'] = self.context['request'].user
        return super().create(validated_data)


class CourseNotificationSerializer(serializers.ModelSerializer):
    """Serializer for course notifications."""
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = CourseNotification
        fields = [
            'id', 'course', 'title', 'message', 'notification_type',
            'is_read', 'is_email_sent', 'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'course', 'is_email_sent', 'created_at', 'read_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    """Serializer for lesson progress."""
    lesson = serializers.SerializerMethodField()
    learner = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    module = serializers.SerializerMethodField()
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'enrollment', 'lesson', 'learner', 'course', 'module',
            'is_completed', 'is_started', 'started_at', 'completed_at',
            'last_accessed', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'enrollment', 'learner', 'course', 'module',
            'started_at', 'completed_at', 'last_accessed',
            'created_at', 'updated_at'
        ]
    
    def get_lesson(self, obj):
        """Get lesson information."""
        from .content_serializers import LessonSerializer
        return LessonSerializer(obj.lesson).data
    
    def get_learner(self, obj):
        """Get learner information."""
        return UserProfileSerializer(obj.learner).data
    
    def get_course(self, obj):
        """Get course information."""
        return CourseListSerializer(obj.course).data
    
    def get_module(self, obj):
        """Get module information."""
        from .content_serializers import CourseModuleSerializer
        return CourseModuleSerializer(obj.module).data




class CourseProgressSerializer(serializers.ModelSerializer):
    """Serializer for course progress."""
    learner = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    is_completed = serializers.BooleanField(read_only=True)
    days_since_started = serializers.IntegerField(read_only=True)
    days_to_complete = serializers.IntegerField(read_only=True)
    completion_rate_per_day = serializers.DecimalField(read_only=True, max_digits=5, decimal_places=2)
    
    class Meta:
        model = CourseProgress
        fields = [
            'id', 'enrollment', 'learner', 'course', 'overall_progress',
            'lessons_completed', 'total_lessons', 'started_at',
            'completed_at', 'last_activity', 'is_completed',
            'days_since_started', 'days_to_complete', 'completion_rate_per_day',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'enrollment', 'learner', 'course', 'overall_progress',
            'lessons_completed', 'total_lessons', 'started_at',
            'completed_at', 'last_activity', 'is_completed',
            'days_since_started', 'days_to_complete', 'completion_rate_per_day',
            'created_at', 'updated_at'
        ]
    
    def get_learner(self, obj):
        """Get learner information."""
        return UserProfileSerializer(obj.learner).data
    
    def get_course(self, obj):
        """Get course information."""
        return CourseListSerializer(obj.course).data




class EnrollmentStatsSerializer(serializers.Serializer):
    """Serializer for enrollment statistics."""
    total_enrollments = serializers.IntegerField()
    active_enrollments = serializers.IntegerField()
    completed_enrollments = serializers.IntegerField()
    dropped_enrollments = serializers.IntegerField()
    average_progress = serializers.DecimalField(max_digits=5, decimal_places=2)
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)

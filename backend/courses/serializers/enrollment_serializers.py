"""
Serializers for enrollment-related models.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import (
    Enrollment, CourseReview, CourseWishlist, CourseNotification,
    LessonProgress, ModuleProgress, CourseProgress, StudySession
)
from .course_serializer import CourseListSerializer
from users.serializers import UserProfileSerializer

User = get_user_model()


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for enrollment details."""
    student = UserProfileSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    is_completed = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_since_enrollment = serializers.IntegerField(read_only=True)
    days_to_complete = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'course', 'status', 'enrollment_date',
            'completion_date', 'last_accessed', 'progress_percentage',
            'current_module', 'current_lesson', 'amount_paid',
            'payment_status', 'payment_method', 'payment_reference',
            'is_completed', 'is_active', 'days_since_enrollment',
            'days_to_complete', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'enrollment_date', 'completion_date', 'last_accessed',
            'progress_percentage', 'is_completed', 'is_active',
            'days_since_enrollment', 'days_to_complete', 'created_at', 'updated_at'
        ]


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new enrollments."""
    
    class Meta:
        model = Enrollment
        fields = ['course', 'amount_paid', 'payment_method', 'payment_reference']
    
    def validate(self, data):
        """Validate enrollment data."""
        course = data['course']
        student = self.context['request'].user
        
        # Check if student is already enrolled
        if Enrollment.objects.filter(student=student, course=course).exists():
            raise serializers.ValidationError('You are already enrolled in this course.')
        
        # Check if course is available for enrollment
        if not course.is_published or not course.is_fully_approved:
            raise serializers.ValidationError('This course is not available for enrollment.')
        
        # Validate payment amount
        if data['amount_paid'] > course.price:
            raise serializers.ValidationError('Amount paid cannot exceed course price.')
        
        return data
    
    def create(self, validated_data):
        """Create enrollment with student from request."""
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)


class CourseReviewSerializer(serializers.ModelSerializer):
    """Serializer for course reviews."""
    student = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseReview
        fields = [
            'id', 'student', 'course', 'rating', 'title', 'content',
            'is_approved', 'is_anonymous', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'course', 'is_approved', 'created_at', 'updated_at']
    
    def get_student(self, obj):
        """Get student information."""
        if obj.is_anonymous:
            return {'full_name': 'Anonymous', 'email': '***@***.***'}
        return UserProfileSerializer(obj.student).data
    
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
    student = UserProfileSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = CourseWishlist
        fields = ['id', 'student', 'course', 'created_at']
        read_only_fields = ['id', 'student', 'created_at']
    
    def create(self, validated_data):
        """Create wishlist item with student from request."""
        validated_data['student'] = self.context['request'].user
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
    student = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    module = serializers.SerializerMethodField()
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'enrollment', 'lesson', 'student', 'course', 'module',
            'is_completed', 'is_started', 'completion_percentage',
            'time_spent_minutes', 'started_at', 'completed_at',
            'last_accessed', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'enrollment', 'student', 'course', 'module',
            'is_completed', 'is_started', 'completion_percentage',
            'started_at', 'completed_at', 'last_accessed',
            'created_at', 'updated_at'
        ]
    
    def get_lesson(self, obj):
        """Get lesson information."""
        from .content import LessonSerializer
        return LessonSerializer(obj.lesson).data
    
    def get_student(self, obj):
        """Get student information."""
        return UserProfileSerializer(obj.student).data
    
    def get_course(self, obj):
        """Get course information."""
        return CourseListSerializer(obj.course).data
    
    def get_module(self, obj):
        """Get module information."""
        from .content import CourseModuleSerializer
        return CourseModuleSerializer(obj.module).data


class ModuleProgressSerializer(serializers.ModelSerializer):
    """Serializer for module progress."""
    module = serializers.SerializerMethodField()
    student = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    
    class Meta:
        model = ModuleProgress
        fields = [
            'id', 'enrollment', 'module', 'student', 'course',
            'is_completed', 'completion_percentage', 'lessons_completed',
            'total_lessons', 'started_at', 'completed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'enrollment', 'student', 'course', 'is_completed',
            'completion_percentage', 'lessons_completed', 'total_lessons',
            'started_at', 'completed_at', 'created_at', 'updated_at'
        ]
    
    def get_module(self, obj):
        """Get module information."""
        from .content import CourseModuleSerializer
        return CourseModuleSerializer(obj.module).data
    
    def get_student(self, obj):
        """Get student information."""
        return UserProfileSerializer(obj.student).data
    
    def get_course(self, obj):
        """Get course information."""
        return CourseListSerializer(obj.course).data


class CourseProgressSerializer(serializers.ModelSerializer):
    """Serializer for course progress."""
    student = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    is_completed = serializers.BooleanField(read_only=True)
    days_since_started = serializers.IntegerField(read_only=True)
    days_to_complete = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CourseProgress
        fields = [
            'id', 'enrollment', 'student', 'course', 'overall_progress',
            'modules_completed', 'total_modules', 'lessons_completed',
            'total_lessons', 'total_time_spent_minutes',
            'average_session_duration_minutes', 'started_at',
            'completed_at', 'last_activity', 'is_completed',
            'days_since_started', 'days_to_complete', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'enrollment', 'student', 'course', 'overall_progress',
            'modules_completed', 'total_modules', 'lessons_completed',
            'total_lessons', 'total_time_spent_minutes',
            'average_session_duration_minutes', 'started_at',
            'completed_at', 'last_activity', 'is_completed',
            'days_since_started', 'days_to_complete', 'created_at', 'updated_at'
        ]
    
    def get_student(self, obj):
        """Get student information."""
        return UserProfileSerializer(obj.student).data
    
    def get_course(self, obj):
        """Get course information."""
        return CourseListSerializer(obj.course).data


class StudySessionSerializer(serializers.ModelSerializer):
    """Serializer for study sessions."""
    student = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    lesson = serializers.SerializerMethodField()
    
    class Meta:
        model = StudySession
        fields = [
            'id', 'enrollment', 'lesson', 'student', 'course',
            'session_duration_minutes', 'progress_made', 'started_at',
            'ended_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'enrollment', 'student', 'course', 'session_duration_minutes',
            'started_at', 'ended_at', 'created_at'
        ]
    
    def get_student(self, obj):
        """Get student information."""
        return UserProfileSerializer(obj.student).data
    
    def get_course(self, obj):
        """Get course information."""
        return CourseListSerializer(obj.course).data
    
    def get_lesson(self, obj):
        """Get lesson information."""
        if obj.lesson:
            from .content import LessonSerializer
            return LessonSerializer(obj.lesson).data
        return None


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

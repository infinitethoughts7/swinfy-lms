from rest_framework import serializers
from .models import Course, CourseModule, Lesson, Enrollment, CourseReview
from users.models import User
from users.serializers import UserProfileSerializer, OrganizationSerializer


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for lesson data."""
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'content', 'lesson_type', 
            'order', 'video_url', 'video_duration', 'is_preview',
            'created_at', 'updated_at'
        ]


class CourseModuleSerializer(serializers.ModelSerializer):
    """Serializer for course module data."""
    
    lessons = LessonSerializer(many=True, read_only=True)
    lesson_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseModule
        fields = [
            'id', 'title', 'description', 'order', 'lessons', 
            'lesson_count', 'created_at', 'updated_at'
        ]
    
    def get_lesson_count(self, obj):
        return obj.lessons.count()


class CourseInstructorSerializer(serializers.ModelSerializer):
    """Serializer for course instructor data."""
    
    profile_picture = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'profile_picture', 
            'bio', 'title', 'role'
        ]
    
    def get_profile_picture(self, obj):
        if hasattr(obj, 'tutor_profile') and obj.tutor_profile.profile_picture:
            return obj.tutor_profile.profile_picture.url
        elif hasattr(obj, 'admin_profile') and obj.admin_profile.profile_picture:
            return obj.admin_profile.profile_picture.url
        return None
    
    def get_bio(self, obj):
        if hasattr(obj, 'tutor_profile'):
            return obj.tutor_profile.bio
        elif hasattr(obj, 'admin_profile'):
            return obj.admin_profile.bio
        return None
    
    def get_title(self, obj):
        if hasattr(obj, 'tutor_profile'):
            return obj.tutor_profile.title
        elif hasattr(obj, 'admin_profile'):
            return obj.admin_profile.job_title
        return None




class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for course list view."""
    
    organization = OrganizationSerializer(read_only=True)
    instructor = CourseInstructorSerializer(read_only=True)
    enrollment_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'category_display',
            'level', 'level_display', 'duration_weeks', 'price', 'thumbnail', 
            'icon', 'rating', 'enrollment_count', 'average_rating', 
            'organization', 'instructor', 'is_featured', 'created_at'
        ]
    
    def get_enrollment_count(self, obj):
        return obj.enrollment_count
    
    def get_average_rating(self, obj):
        return obj.average_rating


class CourseDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed course view."""
    
    organization = OrganizationSerializer(read_only=True)
    instructor = CourseInstructorSerializer(read_only=True)
    modules = CourseModuleSerializer(many=True, read_only=True)
    enrollment_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'objectives', 'prerequisites',
            'category', 'category_display', 'level', 'level_display', 
            'duration_weeks', 'price', 'thumbnail', 'icon', 'rating', 
            'enrollment_count', 'average_rating', 'total_lessons', 'total_duration',
            'organization', 'instructor', 'modules', 'is_featured', 
            'is_enrolled', 'user_progress', 'created_at', 'updated_at'
        ]
    
    def get_enrollment_count(self, obj):
        return obj.enrollment_count
    
    def get_average_rating(self, obj):
        return obj.average_rating
    
    def get_total_lessons(self, obj):
        return sum(module.lessons.count() for module in obj.modules.all())
    
    def get_total_duration(self, obj):
        # Calculate total video duration if available
        total_seconds = 0
        for module in obj.modules.all():
            for lesson in module.lessons.all():
                if lesson.video_duration:
                    total_seconds += lesson.video_duration.total_seconds()
        
        if total_seconds > 0:
            hours = int(total_seconds // 3600)
            minutes = int((total_seconds % 3600) // 60)
            return f"{hours}h {minutes}m"
        return None
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return obj.enrollments.filter(
                student=request.user, 
                status='enrolled'
            ).exists()
        return False
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            enrollment = obj.enrollments.filter(
                student=request.user, 
                status='enrolled'
            ).first()
            if enrollment:
                return {
                    'percentage': float(enrollment.progress_percentage),
                    'completed_lessons': enrollment.completed_lessons.count(),
                    'last_accessed': enrollment.last_accessed
                }
        return None


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for enrollment data."""
    
    course = CourseListSerializer(read_only=True)
    student = UserProfileSerializer(read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'course', 'student', 'status', 'progress_percentage',
            'amount_paid', 'enrolled_at', 'completed_at', 'last_accessed'
        ]


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating courses."""
    
    class Meta:
        model = Course
        fields = [
            'title', 'slug', 'description', 'objectives', 'prerequisites',
            'category', 'level', 'duration_weeks', 'price', 'thumbnail', 
            'icon', 'status', 'is_featured'
        ]
    
    def create(self, validated_data):
        # Set organization and instructor from request user
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['organization'] = request.user.organization
            validated_data['instructor'] = request.user
        
        return super().create(validated_data)


class CourseReviewSerializer(serializers.ModelSerializer):
    """Serializer for course reviews."""
    
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseReview
        fields = [
            'id', 'rating', 'comment', 'student_name', 'student_avatar',
            'created_at', 'updated_at'
        ]
    
    def get_student_avatar(self, obj):
        if hasattr(obj.student, 'student_profile') and obj.student.student_profile.profile_picture:
            return obj.student.student_profile.profile_picture.url
        return None

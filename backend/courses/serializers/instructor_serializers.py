"""
Serializers for KP Instructor course management dashboard.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Course, CourseModule, Lesson, LessonMaterial, CourseResource
from ..models.progress import LessonProgress, CourseProgress
from users.models import KPProfile

User = get_user_model()


class InstructorCourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for instructors to create courses."""
    
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'short_description', 'price', 'duration_weeks',
            'category', 'level', 'tags', 'learning_outcomes', 'prerequisites',
            'thumbnail', 'banner_image', 'demo_video', 'is_private', 
            'requires_admin_enrollment', 'max_enrollments'
        ]
    
    def create(self, validated_data):
        """Create course with instructor as tutor."""
        request = self.context['request']
        user = request.user
        
        # Set the instructor as tutor
        validated_data['tutor'] = user
        
        # Set training partner from available KP profiles
        # For now, use the first available KP profile
        # Set the training partner to the instructor's KP organization
        request = self.context.get('request')
        if request and request.user:
            instructor = request.user
            if hasattr(instructor, 'instructor_profile') and instructor.instructor_profile.knowledge_partner:
                validated_data['training_partner'] = instructor.instructor_profile.knowledge_partner
            else:
                # Fallback to first available KP profile if instructor has no KP association
                from users.models import KPProfile
                kp_profile = KPProfile.objects.first()
                if kp_profile:
                    validated_data['training_partner'] = kp_profile
        
        # Set default approval status for instructor-created courses
        validated_data['approval_status'] = 'draft'
        validated_data['is_approved_by_training_partner'] = False
        
        return super().create(validated_data)


class InstructorCourseListSerializer(serializers.ModelSerializer):
    """Serializer for instructor's course list."""
    
    modules_count = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()
    total_duration_minutes = serializers.SerializerMethodField()
    enrollment_count = serializers.IntegerField(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    tutor = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'price', 'duration_weeks',
            'category', 'category_display', 'level', 'level_display', 'thumbnail',
            'approval_status', 'approval_status_display', 'is_published', 'is_active',
            'modules_count', 'lessons_count', 'total_duration_minutes', 'enrollment_count',
            'tutor', 'created_at', 'updated_at'
        ]
    
    def get_modules_count(self, obj):
        return obj.modules.count()
    
    def get_lessons_count(self, obj):
        return sum(module.lessons.count() for module in obj.modules.all())
    
    def get_total_duration_minutes(self, obj):
        total_minutes = 0
        for module in obj.modules.all():
            for lesson in module.lessons.all():
                total_minutes += lesson.duration_minutes
        return total_minutes
    
    def get_tutor(self, obj):
        if obj.tutor:
            return {
                'id': obj.tutor.id,
                'full_name': obj.tutor.full_name,
                'email': obj.tutor.email
            }
        return None


class InstructorCourseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for instructor course management."""
    
    modules_count = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()
    total_duration_minutes = serializers.SerializerMethodField()
    enrollment_count = serializers.IntegerField(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    tags_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'short_description', 'price',
            'duration_weeks', 'category', 'category_display', 'level', 'level_display',
            'tags', 'tags_list', 'learning_outcomes', 'prerequisites', 'thumbnail',
            'banner_image', 'demo_video', 'approval_status', 'approval_status_display',
            'is_published', 'is_active', 'is_private', 'requires_admin_enrollment',
            'max_enrollments', 'modules_count', 'lessons_count', 'total_duration_minutes',
            'enrollment_count', 'approval_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'approval_status', 'is_published', 'enrollment_count',
            'created_at', 'updated_at'
        ]
    
    def get_modules_count(self, obj):
        return obj.modules.count()
    
    def get_lessons_count(self, obj):
        return sum(module.lessons.count() for module in obj.modules.all())
    
    def get_total_duration_minutes(self, obj):
        total_minutes = 0
        for module in obj.modules.all():
            for lesson in module.lessons.all():
                total_minutes += lesson.duration_minutes
        return total_minutes
    
    def get_tags_list(self, obj):
        if obj.tags:
            return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]
        return []


class InstructorModuleCreateSerializer(serializers.ModelSerializer):
    """Serializer for instructors to create course modules."""
    
    class Meta:
        model = CourseModule
        fields = ['title', 'order']
    
    def create(self, validated_data):
        """Create module for the specified course."""
        course = self.context['course']
        validated_data['course'] = course
        return super().create(validated_data)


class InstructorModuleListSerializer(serializers.ModelSerializer):
    """Serializer for instructor's module list."""
    
    lessons_count = serializers.SerializerMethodField()
    total_duration_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseModule
        fields = [
            'id', 'title', 'slug', 'order',
            'lessons_count', 'total_duration_minutes', 'created_at', 'updated_at'
        ]
    
    def get_lessons_count(self, obj):
        return obj.lessons.count()
    
    def get_total_duration_minutes(self, obj):
        return sum(lesson.duration_minutes for lesson in obj.lessons.all())


class InstructorLessonCreateSerializer(serializers.ModelSerializer):
    """Serializer for instructors to create lessons."""
    
    class Meta:
        model = Lesson
        fields = [
            'title', 'lesson_type', 'order', 'content',
            'video_file', 'duration_minutes', 'is_preview',
            'is_mandatory'
        ]
    
    def create(self, validated_data):
        """Create lesson for the specified module."""
        module = self.context['module']
        validated_data['module'] = module
        
        # Auto-assign order if not provided or if it would cause a conflict
        if 'order' not in validated_data or validated_data['order'] is None:
            # Get the next available order number for this module
            last_lesson = Lesson.objects.filter(module=module).order_by('-order').first()
            validated_data['order'] = (last_lesson.order + 1) if last_lesson else 0
        else:
            # Check if the order already exists and adjust if necessary
            existing_lesson = Lesson.objects.filter(module=module, order=validated_data['order']).first()
            if existing_lesson:
                # Find the next available order
                last_lesson = Lesson.objects.filter(module=module).order_by('-order').first()
                validated_data['order'] = (last_lesson.order + 1) if last_lesson else 0
        
        return super().create(validated_data)


class InstructorLessonListSerializer(serializers.ModelSerializer):
    """Serializer for instructor's lesson list."""
    
    lesson_type_display = serializers.CharField(source='get_lesson_type_display', read_only=True)
    duration_formatted = serializers.CharField(read_only=True)
    has_video_content = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'slug', 'lesson_type', 'lesson_type_display',
            'order', 'duration_minutes', 'duration_formatted', 'has_video_content',
            'is_preview', 'is_mandatory', 'created_at', 'updated_at'
        ]


class InstructorLessonDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for instructor lesson management."""
    
    lesson_type_display = serializers.CharField(source='get_lesson_type_display', read_only=True)
    duration_formatted = serializers.CharField(read_only=True)
    has_video_content = serializers.BooleanField(read_only=True)
    total_materials_count = serializers.CharField(read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'slug', 'lesson_type', 'lesson_type_display',
            'order', 'content', 'video_file', 'duration_minutes', 'duration_formatted',
            'has_video_content', 'is_preview', 'is_mandatory',
            'total_materials_count', 'module_title', 'course_title',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class InstructorLessonMaterialCreateSerializer(serializers.ModelSerializer):
    """Serializer for instructors to create lesson materials."""
    
    class Meta:
        model = LessonMaterial
        fields = [
            'title', 'description', 'material_type', 'file', 'order',
            'is_required', 'is_downloadable'
        ]
    
    def create(self, validated_data):
        """Create material for the specified lesson."""
        lesson = self.context['lesson']
        validated_data['lesson'] = lesson
        return super().create(validated_data)


class InstructorLessonMaterialListSerializer(serializers.ModelSerializer):
    """Serializer for instructor's lesson material list."""
    
    material_type_display = serializers.CharField(source='get_material_type_display', read_only=True)
    file_size_formatted = serializers.CharField(read_only=True)
    
    class Meta:
        model = LessonMaterial
        fields = [
            'id', 'title', 'description', 'material_type', 'material_type_display',
            'file', 'file_size', 'file_size_formatted', 'order', 'is_required',
            'is_downloadable', 'download_count', 'created_at', 'updated_at'
        ]


class InstructorCourseResourceCreateSerializer(serializers.ModelSerializer):
    """Serializer for instructors to create course resources."""
    
    class Meta:
        model = CourseResource
        fields = [
            'title', 'description', 'resource_type', 'file', 'url',
            'order', 'is_public'
        ]
    
    def create(self, validated_data):
        """Create resource for the specified course."""
        course = self.context['course']
        validated_data['course'] = course
        return super().create(validated_data)


class InstructorCourseResourceListSerializer(serializers.ModelSerializer):
    """Serializer for instructor's course resource list."""
    
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)
    
    class Meta:
        model = CourseResource
        fields = [
            'id', 'title', 'description', 'resource_type', 'resource_type_display',
            'file', 'url', 'order', 'is_public', 'created_at', 'updated_at'
        ]


class InstructorCourseStatsSerializer(serializers.Serializer):
    """Serializer for instructor's course statistics."""
    
    total_courses = serializers.IntegerField()
    published_courses = serializers.IntegerField()
    draft_courses = serializers.IntegerField()
    pending_approval_courses = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    total_modules = serializers.IntegerField()
    total_lessons = serializers.IntegerField()
    total_duration_hours = serializers.FloatField()
    avg_course_rating = serializers.FloatField()
    recent_courses = InstructorCourseListSerializer(many=True, read_only=True)


class LearnerProgressSummarySerializer(serializers.ModelSerializer):
    """Serializer for learner progress summary in instructor dashboard."""
    
    learner_name = serializers.CharField(source='enrollment.learner.full_name', read_only=True)
    learner_email = serializers.CharField(source='enrollment.learner.email', read_only=True)
    course_title = serializers.CharField(source='enrollment.course.title', read_only=True)
    enrollment_date = serializers.DateTimeField(source='enrollment.enrolled_at', read_only=True)
    
    class Meta:
        model = CourseProgress
        fields = [
            'id', 'learner_name', 'learner_email', 'course_title',
            'overall_progress', 'lessons_completed', 'total_lessons',
            'enrollment_date', 'started_at', 'completed_at', 'last_activity'
        ]

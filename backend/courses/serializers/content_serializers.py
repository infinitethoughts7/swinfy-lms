"""
Serializers for content-related models (modules, lessons, materials).
"""
from rest_framework import serializers
from ..models import CourseModule, Lesson, LessonMaterial, CourseResource
from .course_serializer import CourseListSerializer


class CourseModuleSerializer(serializers.ModelSerializer):
    """Serializer for course modules."""
    course = CourseListSerializer(read_only=True)
    lessons_count = serializers.SerializerMethodField()
    total_duration_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseModule
        fields = [
            'id', 'title', 'slug', 'course', 'order', 'is_published',
            'lessons_count', 'total_duration_minutes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'lessons_count', 'total_duration_minutes', 'created_at', 'updated_at']
    
    def get_lessons_count(self, obj):
        """Get number of lessons in this module."""
        return obj.lessons.count()
    
    def get_total_duration_minutes(self, obj):
        """Get total duration of all lessons in this module."""
        return sum(lesson.duration_minutes for lesson in obj.lessons.all())


class CourseModuleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating course modules."""
    
    class Meta:
        model = CourseModule
        fields = [
            'title', 'course', 'order', 'is_published'
        ]
    
    def validate(self, data):
        """Validate module data."""
        course = data['course']
        order = data.get('order', 0)
        
        # Check if order is already taken
        if CourseModule.objects.filter(course=course, order=order).exists():
            raise serializers.ValidationError('A module with this order already exists in this course.')
        
        return data


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for lessons."""
    module = CourseModuleSerializer(read_only=True)
    course = serializers.SerializerMethodField()
    materials_count = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    duration_formatted = serializers.CharField(read_only=True)
    has_video_content = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'slug', 'module', 'course',
            'lesson_type', 'order', 'duration_minutes', 'duration_formatted',
            'is_preview', 'is_published', 'is_mandatory', 'content', 'video_file',
            'materials_count', 'is_completed', 'has_video_content',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'course', 'materials_count', 'is_completed',
            'duration_formatted', 'has_video_content', 'created_at', 'updated_at'
        ]
    
    def get_course(self, obj):
        """Get course information."""
        return CourseListSerializer(obj.course).data
    
    def get_materials_count(self, obj):
        """Get number of materials for this lesson."""
        return obj.materials.count()
    
    def get_is_completed(self, obj):
        """Check if lesson is completed by current user."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from ..models import LessonProgress
            try:
                progress = LessonProgress.objects.get(
                    enrollment__student=request.user,
                    lesson=obj
                )
                return progress.is_completed
            except LessonProgress.DoesNotExist:
                return False
        return False


class LessonCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating lessons."""
    
    class Meta:
        model = Lesson
        fields = [
            'title', 'description', 'module', 'lesson_type', 'order',
            'duration_minutes', 'is_preview', 'is_published', 'is_mandatory',
            'content', 'video_file'
        ]
    
    def validate(self, data):
        """Validate lesson data."""
        module = data['module']
        order = data.get('order', 0)
        
        # Check if order is already taken in this module
        if Lesson.objects.filter(module=module, order=order).exists():
            raise serializers.ValidationError('A lesson with this order already exists in this module.')
        
        # Validate lesson type specific fields
        lesson_type = data.get('lesson_type', 'video')
        if lesson_type == 'video' and not data.get('video_file'):
            raise serializers.ValidationError('Video lessons must have a video file.')
        
        if lesson_type == 'text' and not data.get('content'):
            raise serializers.ValidationError('Text lessons must have content.')
        
        return data


class LessonMaterialSerializer(serializers.ModelSerializer):
    """Serializer for lesson materials."""
    lesson = LessonSerializer(read_only=True)
    course = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    file_size_formatted = serializers.CharField(read_only=True)
    
    class Meta:
        model = LessonMaterial
        fields = [
            'id', 'title', 'description', 'lesson', 'course',
            'material_type', 'file', 'file_size', 'file_size_mb', 'file_size_formatted',
            'download_count', 'is_required', 'order', 'is_downloadable',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'course', 'file_size', 'file_size_mb', 'file_size_formatted',
            'download_count', 'created_at', 'updated_at'
        ]
    
    def get_course(self, obj):
        """Get course information."""
        return CourseListSerializer(obj.course).data
    
    def get_file_size_mb(self, obj):
        """Get file size in MB."""
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0


class LessonMaterialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating lesson materials."""
    
    class Meta:
        model = LessonMaterial
        fields = [
            'title', 'description', 'lesson', 'material_type',
            'file', 'is_required', 'order', 'is_downloadable'
        ]
    
    def validate_file(self, value):
        """Validate uploaded file."""
        if value:
            # Check file size (max 50MB)
            max_size = 50 * 1024 * 1024  # 50MB
            if value.size > max_size:
                raise serializers.ValidationError('File size too large. Maximum size is 50MB.')
            
            # Check file extension
            allowed_extensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.jpg', '.jpeg', '.png', '.mp3', '.wav']
            file_extension = value.name.lower().split('.')[-1]
            if f'.{file_extension}' not in allowed_extensions:
                raise serializers.ValidationError(f'Invalid file type. Allowed types: {", ".join(allowed_extensions)}')
        
        return value


class CourseResourceSerializer(serializers.ModelSerializer):
    """Serializer for course resources."""
    course = CourseListSerializer(read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseResource
        fields = [
            'id', 'title', 'description', 'course', 'resource_type',
            'file', 'url', 'is_public', 'order', 'file_size_mb',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'course', 'file_size_mb', 'created_at', 'updated_at']
    
    def get_file_size_mb(self, obj):
        """Get file size in MB."""
        if obj.file and obj.file.size:
            return round(obj.file.size / (1024 * 1024), 2)
        return 0


class CourseResourceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating course resources."""
    
    class Meta:
        model = CourseResource
        fields = [
            'title', 'description', 'course', 'resource_type',
            'file', 'url', 'is_public', 'order'
        ]
    
    def validate(self, data):
        """Validate resource data."""
        # Either file or URL must be provided
        if not data.get('file') and not data.get('url'):
            raise serializers.ValidationError('Either file or URL must be provided.')
        
        if data.get('file') and data.get('url'):
            raise serializers.ValidationError('Provide either file or URL, not both.')
        
        return data
    
    def validate_file(self, value):
        """Validate uploaded file."""
        if value:
            # Check file size (max 100MB)
            max_size = 100 * 1024 * 1024  # 100MB
            if value.size > max_size:
                raise serializers.ValidationError('File size too large. Maximum size is 100MB.')
        
        return value


class CourseContentSerializer(serializers.Serializer):
    """Serializer for complete course content structure."""
    course = CourseListSerializer()
    modules = CourseModuleSerializer(many=True)
    total_lessons = serializers.IntegerField()
    total_duration_weeks = serializers.IntegerField()
    total_duration_minutes = serializers.IntegerField()


class ModuleContentSerializer(serializers.Serializer):
    """Serializer for complete module content structure."""
    module = CourseModuleSerializer()
    lessons = LessonSerializer(many=True)
    total_lessons = serializers.IntegerField()
    total_duration_minutes = serializers.IntegerField()

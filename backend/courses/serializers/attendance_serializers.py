from rest_framework import serializers
from ..models import AttendanceRecord, Course, Enrollment
from users.serializers import UserProfileSerializer


class AttendanceRecordSerializer(serializers.ModelSerializer):
    """Serializer for attendance records."""
    
    learner = UserProfileSerializer(read_only=True)
    learner_id = serializers.UUIDField(write_only=True)
    course = serializers.StringRelatedField(read_only=True)
    course_id = serializers.UUIDField(write_only=True)
    marked_by = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'learner',
            'learner_id',
            'course',
            'course_id',
            'session_date',
            'status',
            'notes',
            'marked_at',
            'marked_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'marked_at', 'marked_by', 'created_at', 'updated_at']
    
    def validate_learner_id(self, value):
        """Validate that the learner exists and is enrolled in the course."""
        course_id = self.initial_data.get('course_id')
        if course_id:
            if not Enrollment.objects.filter(
                learner_id=value,
                course_id=course_id,
                status__in=['approved', 'active', 'completed']
            ).exists():
                raise serializers.ValidationError(
                    "Learner is not enrolled in this course"
                )
        return value
    
    def validate_course_id(self, value):
        """Validate that the course exists."""
        if not Course.objects.filter(id=value).exists():
            raise serializers.ValidationError("Course does not exist")
        return value
    
    def create(self, validated_data):
        """Create attendance record with marked_by set to current user."""
        validated_data['marked_by'] = self.context['request'].user
        return super().create(validated_data)


class AttendanceMarkSerializer(serializers.Serializer):
    """Serializer for marking attendance for multiple learners."""
    
    course_id = serializers.UUIDField()
    session_date = serializers.DateField()
    attendance_records = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )
    
    def validate_attendance_records(self, value):
        """Validate attendance records data."""
        for record in value:
            required_fields = ['learner_id', 'status']
            for field in required_fields:
                if field not in record:
                    raise serializers.ValidationError(
                        f"Missing required field: {field}"
                    )
            
            if record['status'] not in ['present', 'absent', 'late']:
                raise serializers.ValidationError(
                    f"Invalid status: {record['status']}"
                )
        
        return value
    
    def validate_course_id(self, value):
        """Validate that the course exists and user has access."""
        try:
            course = Course.objects.get(id=value)
            # Check if user is instructor for this course
            if not course.instructors.filter(id=self.context['request'].user.id).exists():
                raise serializers.ValidationError(
                    "You don't have permission to mark attendance for this course"
                )
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course does not exist")
        
        return value


class AttendanceListSerializer(serializers.ModelSerializer):
    """Serializer for listing attendance records."""
    
    learner = UserProfileSerializer(read_only=True)
    course = serializers.StringRelatedField(read_only=True)
    marked_by = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'learner',
            'course',
            'session_date',
            'status',
            'notes',
            'marked_at',
            'marked_by'
        ]

from rest_framework import serializers
from django.utils import timezone
from courses.models.live_session import LiveSession
from courses.models.course import Course
from users.models import User, KPProfile


class LiveSessionSerializer(serializers.ModelSerializer):
    """Serializer for LiveSession model with full details."""
    
    # Read-only fields for display
    instructor_name = serializers.CharField(source='instructor.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    training_partner_name = serializers.CharField(source='training_partner.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    
    # Computed properties
    is_upcoming = serializers.ReadOnlyField()
    is_live_now = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    end_datetime = serializers.ReadOnlyField()
    formatted_duration = serializers.ReadOnlyField()
    
    # Meeting platform display
    meeting_platform_display = serializers.CharField(source='get_meeting_platform_display', read_only=True)
    
    class Meta:
        model = LiveSession
        fields = [
            'id', 'title', 'description', 'course', 'course_title',
            'instructor', 'instructor_name', 'training_partner', 'training_partner_name',
            'scheduled_datetime', 'duration_minutes', 'formatted_duration',
            'meeting_link', 'meeting_platform', 'meeting_platform_display',
            'meeting_id', 'meeting_password', 'status', 'is_approved',
            'approved_by', 'approved_by_name', 'approval_notes', 'approved_at',
            'max_participants', 'is_recording_enabled', 'recording_link',
            'session_notes', 'post_session_notes', 'notification_sent',
            'reminder_sent', 'created_at', 'updated_at',
            'is_upcoming', 'is_live_now', 'is_past', 'end_datetime'
        ]
        read_only_fields = [
            'id', 'instructor_name', 'course_title', 'training_partner_name',
            'approved_by_name', 'is_approved', 'approved_by', 'approved_at',
            'notification_sent', 'reminder_sent', 'created_at', 'updated_at',
            'is_upcoming', 'is_live_now', 'is_past', 'end_datetime',
            'formatted_duration', 'meeting_platform_display'
        ]


class LiveSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating LiveSession - instructor only."""
    
    class Meta:
        model = LiveSession
        fields = [
            'title', 'description', 'course', 'scheduled_datetime',
            'duration_minutes', 'meeting_link', 'meeting_platform',
            'meeting_id', 'meeting_password', 'max_participants',
            'is_recording_enabled', 'session_notes'
        ]
    
    def validate_scheduled_datetime(self, value):
        """Ensure session is scheduled for the future."""
        if value <= timezone.now():
            raise serializers.ValidationError(
                "Session must be scheduled for a future date and time."
            )
        return value
    
    def validate_course(self, value):
        """Validate course belongs to instructor's training partner."""
        request = self.context.get('request')
        if request and hasattr(request.user, 'instructor_profile'):
            instructor_profile = request.user.instructor_profile
            if value.training_partner != instructor_profile.knowledge_partner:
                raise serializers.ValidationError(
                    "You can only create sessions for courses from your training partner."
                )
        return value
    
    def create(self, validated_data):
        """Create live session with instructor and training partner auto-assignment."""
        request = self.context.get('request')
        if request and hasattr(request.user, 'instructor_profile'):
            instructor_profile = request.user.instructor_profile
            validated_data['instructor'] = request.user
            validated_data['training_partner'] = instructor_profile.knowledge_partner
        return super().create(validated_data)


class LiveSessionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating LiveSession - instructor only (limited fields)."""
    
    class Meta:
        model = LiveSession
        fields = [
            'title', 'description', 'scheduled_datetime', 'duration_minutes',
            'meeting_link', 'meeting_platform', 'meeting_id', 'meeting_password',
            'max_participants', 'is_recording_enabled', 'session_notes',
            'post_session_notes', 'recording_link'
        ]
    
    def validate_scheduled_datetime(self, value):
        """Ensure session is scheduled for the future."""
        if value <= timezone.now():
            raise serializers.ValidationError(
                "Session must be scheduled for a future date and time."
            )
        return value
    
    def validate(self, data):
        """Validate that only draft or pending sessions can be updated."""
        instance = self.instance
        if instance and instance.status not in ['draft', 'pending_approval']:
            raise serializers.ValidationError(
                "Only draft or pending approval sessions can be updated."
            )
        return data


class LiveSessionApprovalSerializer(serializers.ModelSerializer):
    """Serializer for training partner approval of LiveSession."""
    
    class Meta:
        model = LiveSession
        fields = ['is_approved', 'approval_notes']
    
    def validate(self, data):
        """Validate approval action."""
        instance = self.instance
        if instance.status != 'pending_approval':
            raise serializers.ValidationError(
                "Only sessions with pending approval status can be approved/rejected."
            )
        return data
    
    def update(self, instance, validated_data):
        """Handle approval/rejection with proper status updates."""
        is_approved = validated_data.get('is_approved', False)
        approval_notes = validated_data.get('approval_notes', '')
        
        if is_approved:
            instance.is_approved = True
            instance.status = 'approved'
            instance.approved_by = self.context['request'].user
            instance.approved_at = timezone.now()
            if approval_notes:
                instance.approval_notes = approval_notes
        else:
            instance.is_approved = False
            instance.status = 'rejected'
            instance.approved_by = self.context['request'].user
            instance.approved_at = timezone.now()
            instance.approval_notes = approval_notes or "Session rejected by training partner admin."
        
        instance.save()
        return instance


class LiveSessionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing LiveSessions."""
    
    instructor_name = serializers.CharField(source='instructor.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    training_partner_name = serializers.CharField(source='training_partner.name', read_only=True)
    is_upcoming = serializers.ReadOnlyField()
    is_live_now = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    formatted_duration = serializers.ReadOnlyField()
    meeting_platform_display = serializers.CharField(source='get_meeting_platform_display', read_only=True)
    
    class Meta:
        model = LiveSession
        fields = [
            'id', 'title', 'course_title', 'instructor_name', 'training_partner_name',
            'scheduled_datetime', 'duration_minutes', 'formatted_duration',
            'meeting_platform', 'meeting_platform_display', 'status', 'is_approved',
            'max_participants', 'is_upcoming', 'is_live_now', 'is_past',
            'created_at'
        ]


class LiveSessionStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating session status (live, completed, cancelled)."""
    
    class Meta:
        model = LiveSession
        fields = ['status']
    
    def validate_status(self, value):
        """Validate status transitions."""
        instance = self.instance
        valid_transitions = {
            'approved': ['live', 'cancelled'],
            'live': ['completed', 'cancelled'],
            'completed': [],  # No transitions from completed
            'cancelled': [],  # No transitions from cancelled
        }
        
        if instance.status in valid_transitions:
            if value not in valid_transitions[instance.status]:
                raise serializers.ValidationError(
                    f"Cannot change status from {instance.status} to {value}."
                )
        else:
            raise serializers.ValidationError(
                f"Cannot change status from {instance.status}."
            )
        
        return value
    
    def update(self, instance, validated_data):
        """Update status with proper timestamp handling."""
        new_status = validated_data['status']
        
        if new_status == 'live' and instance.status == 'approved':
            # Session is starting
            pass
        elif new_status == 'completed' and instance.status == 'live':
            # Session is ending
            pass
        elif new_status == 'cancelled':
            # Session is cancelled
            pass
        
        instance.status = new_status
        instance.save()
        return instance

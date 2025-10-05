from rest_framework import generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from courses.models.live_session import LiveSession
from courses.models.course import Course
from courses.serializers.live_session_serializers import (
    LiveSessionSerializer,
    LiveSessionCreateSerializer,
    LiveSessionUpdateSerializer,
    LiveSessionApprovalSerializer,
    LiveSessionListSerializer,
    LiveSessionStatusUpdateSerializer
)
from courses.permissions import IsInstructorOrReadOnly, IsTrainingPartnerAdmin, IsOwnerOrReadOnly


class LiveSessionViewSet(ModelViewSet):
    """ViewSet for LiveSession CRUD operations."""
    
    queryset = LiveSession.objects.select_related(
        'course', 'instructor', 'training_partner', 'approved_by'
    ).all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'is_approved', 'meeting_platform', 'course']
    ordering = ['-scheduled_datetime']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return LiveSessionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LiveSessionUpdateSerializer
        elif self.action == 'approve':
            return LiveSessionApprovalSerializer
        elif self.action == 'update_status':
            return LiveSessionStatusUpdateSerializer
        elif self.action == 'list':
            return LiveSessionListSerializer
        return LiveSessionSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        if user.role == 'super_admin':
            # Super admin can see all sessions
            return self.queryset
        elif user.role == 'knowledge_partner':
            # Training partner admin can see sessions from their organization
            if hasattr(user, 'kp_profile'):
                return self.queryset.filter(training_partner=user.kp_profile)
        elif user.role == 'knowledge_partner_instructor':
            # Instructor can see their own sessions
            return self.queryset.filter(instructor=user)
        elif user.role == 'learner':
            # Learners can see approved sessions for courses they're enrolled in
            from courses.models.enrollment import Enrollment
            enrolled_courses = Enrollment.objects.filter(
                learner=user,
                status__in=['active', 'approved', 'completed']
            ).values_list('course_id', flat=True)
            return self.queryset.filter(
                course_id__in=enrolled_courses,
                is_approved=True
            )
        
        return self.queryset.none()
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]
        elif self.action == 'approve':
            permission_classes = [permissions.IsAuthenticated, IsTrainingPartnerAdmin]
        elif self.action == 'update_status':
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Create session with proper instructor assignment."""
        serializer.save(instructor=self.request.user)
    
    def perform_update(self, serializer):
        """Update session with proper validation."""
        instance = self.get_object()
        
        # Only allow updates for draft or pending sessions
        if instance.status not in ['draft', 'pending_approval']:
            from rest_framework import serializers
            raise serializers.ValidationError(
                "Only draft or pending approval sessions can be updated."
            )
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Only allow deletion of draft sessions."""
        if instance.status != 'draft':
            from rest_framework import serializers
            raise serializers.ValidationError(
                "Only draft sessions can be deleted."
            )
        instance.delete()
    
    @action(detail=True, methods=['post'], permission_classes=[IsTrainingPartnerAdmin])
    def approve(self, request, pk=None):
        """Approve or reject a live session."""
        session = self.get_object()
        
        if session.status != 'pending_approval':
            return Response(
                {'error': 'Only sessions with pending approval status can be approved/rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(session, data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            # Send notification emails if approved
            if session.is_approved:
                session.send_notification_emails()
            
            return Response({
                'message': 'Session approved successfully' if session.is_approved else 'Session rejected',
                'session': LiveSessionSerializer(session).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InstructorLiveSessionViewSet(ModelViewSet):
    """ViewSet for instructor live session operations."""
    
    serializer_class = LiveSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'is_approved', 'meeting_platform', 'course']
    ordering = ['-scheduled_datetime']
    
    def get_queryset(self):
        """Return sessions created by the instructor."""
        return LiveSession.objects.filter(
            instructor=self.request.user
        ).select_related(
            'course', 'training_partner', 'approved_by'
        )
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return LiveSessionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LiveSessionUpdateSerializer
        elif self.action == 'update_status':
            return LiveSessionStatusUpdateSerializer
        elif self.action == 'list':
            return LiveSessionListSerializer
        return LiveSessionSerializer
    
    def perform_create(self, serializer):
        """Create session with proper instructor assignment."""
        serializer.save(instructor=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update session status (start/end session)."""
        session = self.get_object()
        serializer = LiveSessionStatusUpdateSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(LiveSessionSerializer(session).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def send_reminder(self, request, pk=None):
        """Send reminder emails for the session."""
        session = self.get_object()
        # Implement reminder logic here
        session.reminder_sent = True
        session.save(update_fields=['reminder_sent'])
        return Response({'message': 'Reminder sent successfully'})


class TrainingPartnerLiveSessionViewSet(ModelViewSet):
    """ViewSet for training partner admin live session operations."""
    
    serializer_class = LiveSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTrainingPartnerAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'is_approved', 'meeting_platform', 'instructor']
    ordering = ['-scheduled_datetime']
    
    def get_queryset(self):
        """Return sessions from the training partner's organization."""
        if hasattr(self.request.user, 'kp_profile'):
            return LiveSession.objects.filter(
                training_partner=self.request.user.kp_profile
            ).select_related(
                'course', 'instructor', 'approved_by'
            )
        return LiveSession.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'approve':
            return LiveSessionApprovalSerializer
        elif self.action == 'list':
            return LiveSessionListSerializer
        return LiveSessionSerializer
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject a live session."""
        session = self.get_object()
        
        if session.status != 'pending_approval':
            return Response(
                {'error': 'Only sessions with pending approval status can be approved/rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(session, data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            # Send notification emails if approved
            if session.is_approved:
                print(f"🎉 Session '{session.title}' approved by {request.user.full_name}")
                print(f"📧 Triggering email notifications to enrolled learners...")
                email_sent = session.send_notification_emails()
                if email_sent:
                    print(f"✅ Email notifications sent successfully")
                else:
                    print(f"⚠️  Email notifications were not sent")
            else:
                print(f"❌ Session '{session.title}' rejected by {request.user.full_name}")
            
            return Response({
                'message': 'Session approved successfully' if session.is_approved else 'Session rejected',
                'session': LiveSessionSerializer(session).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LearnerLiveSessionViewSet(ModelViewSet):
    """ViewSet for learner live session operations - read-only access to approved sessions."""
    
    serializer_class = LiveSessionListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'meeting_platform', 'course']
    ordering = ['-scheduled_datetime']
    http_method_names = ['get']  # Read-only for learners
    
    def get_queryset(self):
        """Return only approved live sessions for courses the learner is enrolled in."""
        user = self.request.user
        
        print(f"DEBUG: LearnerLiveSessionViewSet - User: {user}, Role: {getattr(user, 'role', 'NO_ROLE')}")
        print(f"DEBUG: User ID: {user.id}, Username: {getattr(user, 'username', 'NO_USERNAME')}")
        print(f"DEBUG: User has enrollments: {user.enrollments.exists()}")
        
        if user.role != 'learner':
            print("DEBUG: User is not a learner, returning empty queryset")
            return LiveSession.objects.none()
        
        # Get courses the learner is enrolled in (active, approved, or completed)
        enrolled_course_ids = user.enrollments.filter(
            status__in=['active', 'approved', 'completed']
        ).values_list('course_id', flat=True)
        
        print(f"DEBUG: Enrolled course IDs: {list(enrolled_course_ids)}")
        
        # Debug: Check all live sessions in database
        all_sessions = LiveSession.objects.all()
        print(f"DEBUG: Total live sessions in database: {all_sessions.count()}")
        for session in all_sessions:
            print(f"DEBUG: Session '{session.title}' - Course: {session.course_id}, Approved: {session.is_approved}")
        
        # Return only approved sessions for enrolled courses
        queryset = LiveSession.objects.filter(
            course_id__in=enrolled_course_ids,
            is_approved=True
        ).select_related(
            'course', 'instructor', 'training_partner'
        )
        
        print(f"DEBUG: Live sessions queryset count: {queryset.count()}")
        return queryset
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming approved live sessions."""
        now = timezone.now()
        queryset = self.get_queryset().filter(
            scheduled_datetime__gte=now
        ).order_by('scheduled_datetime')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def live_now(self, request):
        """Get currently live sessions."""
        now = timezone.now()
        queryset = self.get_queryset().filter(
            scheduled_datetime__lte=now,
            status='live'
        )
        
        # Filter for sessions that are actually live now
        live_sessions = [session for session in queryset if session.is_live_now]
        serializer = self.get_serializer(live_sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past live sessions."""
        now = timezone.now()
        queryset = self.get_queryset().filter(
            scheduled_datetime__lt=now
        ).order_by('-scheduled_datetime')
        
        # Filter for sessions that are actually past
        past_sessions = [session for session in queryset if session.is_past]
        serializer = self.get_serializer(past_sessions, many=True)
        return Response(serializer.data)
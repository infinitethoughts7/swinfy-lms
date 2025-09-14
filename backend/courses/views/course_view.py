from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, Sum
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone

from ..models import Course, CourseModule, Lesson, Enrollment, CourseProgress, LessonProgress, ModuleProgress, LessonMaterial, CourseResource, CourseNotification, StudySession
from ..serializers import (
    CourseSerializer, CourseListSerializer, CourseCreateSerializer,
    CourseUpdateSerializer, CourseApprovalSerializer, CourseStatsSerializer,
    CourseModuleSerializer, CourseModuleCreateSerializer, LessonSerializer, LessonCreateSerializer,
    EnrollmentCreateSerializer, CourseProgressSerializer, LessonProgressSerializer, 
    ModuleProgressSerializer, LessonMaterialSerializer, LessonMaterialCreateSerializer,
    CourseResourceSerializer, CourseResourceCreateSerializer, CourseNotificationSerializer,
    StudySessionSerializer
)
from ..filters import CourseFilter

User = get_user_model()


class CoursePagination(PageNumberPagination):
    """Custom pagination for course lists."""
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


class CourseListView(generics.ListAPIView):
    """List all published courses with filtering and search."""
    queryset = Course.objects.filter(is_published=True).select_related('training_partner', 'tutor')
    serializer_class = CourseListSerializer
    pagination_class = CoursePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CourseFilter
    search_fields = ['title', 'short_description', 'description', 'tags']
    ordering_fields = ['created_at', 'price', 'rating', 'enrollment_count']
    ordering = ['-created_at']
    permission_classes = [permissions.AllowAny]


class CourseDetailView(generics.RetrieveAPIView):
    """Retrieve a specific course by slug."""
    queryset = Course.objects.filter(is_published=True).select_related('training_partner', 'tutor')
    serializer_class = CourseSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when course is viewed."""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CourseCreateView(generics.CreateAPIView):
    """Create a new course."""
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Set the tutor to the current user."""
        serializer.save(tutor=self.request.user)


class CourseUpdateView(generics.UpdateAPIView):
    """Update an existing course."""
    queryset = Course.objects.all()
    serializer_class = CourseUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Only allow tutors/admins to update their own courses."""
        if self.request.user.role in ['tutor', 'admin']:
            return Course.objects.filter(tutor=self.request.user)
        return Course.objects.none()


class CourseDeleteView(generics.DestroyAPIView):
    """Delete a course."""
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Only allow tutors/admins to delete their own courses."""
        if self.request.user.role in ['tutor', 'admin']:
            return Course.objects.filter(tutor=self.request.user)
        return Course.objects.none()


class CourseApprovalView(generics.UpdateAPIView):
    """Approve or reject a course."""
    queryset = Course.objects.all()
    serializer_class = CourseApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Only allow admins to approve courses."""
        if self.request.user.role == 'admin':
            return Course.objects.filter(training_partner=self.request.user.training_partner)
        elif self.request.user.role == 'super_admin':
            return Course.objects.all()
        return Course.objects.none()
    
    def update(self, request, *args, **kwargs):
        """Handle course approval/rejection."""
        course = self.get_object()
        user = request.user
        
        action = request.data.get('action')  # 'approve' or 'reject'
        approval_notes = request.data.get('approval_notes', '')
        
        if action == 'approve':
            if user.role == 'admin':
                course.is_approved_by_training_partner = True
                course.training_partner_admin_approved_by = user
            elif user.role == 'super_admin':
                course.is_approved_by_super_admin = True
                course.super_admin_approved_by = user
        elif action == 'reject':
            course.approval_status = 'rejected'
        
        course.approval_notes = approval_notes
        course.save()
        
        serializer = CourseSerializer(course)
        return Response(serializer.data)


class CourseStatsView(generics.GenericAPIView):
    """Get course statistics."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Return course statistics based on user role."""
        user = request.user
        
        if user.role == 'super_admin':
            # Super admin sees all courses
            queryset = Course.objects.all()
        elif user.role == 'admin' and user.training_partner:
            # Admin sees courses from their training partner
            queryset = Course.objects.filter(training_partner=user.training_partner)
        elif user.role == 'tutor':
            # Tutor sees their own courses
            queryset = Course.objects.filter(tutor=user)
        else:
            queryset = Course.objects.none()
        
        stats = {
            'total_courses': queryset.count(),
            'published_courses': queryset.filter(is_published=True).count(),
            'draft_courses': queryset.filter(is_draft=True).count(),
            'pending_approval': queryset.filter(approval_status__in=['training_partner_pending', 'super_pending']).count(),
            'total_enrollments': queryset.aggregate(total=Count('enrollment_count'))['total'] or 0,
            'average_rating': queryset.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0,
            'featured_courses': queryset.filter(is_featured=True).count()
        }
        
        serializer = CourseStatsSerializer(stats)
        return Response(serializer.data)


class FeaturedCoursesView(generics.ListAPIView):
    """Get featured courses."""
    queryset = Course.objects.filter(is_published=True, is_featured=True).select_related('training_partner', 'tutor')
    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CoursePagination


class MyCoursesView(generics.ListAPIView):
    """Get courses for the current user - enrolled courses for students, created courses for tutors/admins."""
    serializer_class = CourseListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CoursePagination
    
    def get_queryset(self):
        """Return appropriate courses based on user role."""
        if self.request.user.role == 'student':
            # For students, return enrolled courses
            from ..models import Enrollment
            enrolled_course_ids = Enrollment.objects.filter(
                student=self.request.user
            ).values_list('course_id', flat=True)
            return Course.objects.filter(
                id__in=enrolled_course_ids
            ).select_related('training_partner', 'tutor')
        elif self.request.user.role in ['tutor', 'admin']:
            # For tutors/admins, return courses they created
            return Course.objects.filter(tutor=self.request.user).select_related('training_partner', 'tutor')
        return Course.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Override list method to return enrollment data for students."""
        if request.user.role == 'student':
            from ..models import Enrollment
            from ..serializers import EnrollmentSerializer
            
            # Get enrollments for the student
            enrollments = Enrollment.objects.filter(
                student=request.user
            ).select_related('course', 'course__training_partner', 'course__tutor').order_by('-enrollment_date')
            
            # Serialize enrollments
            serializer = EnrollmentSerializer(enrollments, many=True)
            return Response({
                'count': enrollments.count(),
                'next': None,
                'previous': None,
                'results': serializer.data
            })
        else:
            # For tutors/admins, use the default behavior
            return super().list(request, *args, **kwargs)


class CourseSearchView(generics.ListAPIView):
    """Advanced course search with filters."""
    queryset = Course.objects.filter(is_published=True).select_related('training_partner', 'tutor')
    serializer_class = CourseListSerializer
    pagination_class = CoursePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CourseFilter
    search_fields = ['title', 'short_description', 'description', 'tags', 'training_partner__name']
    ordering_fields = ['created_at', 'price', 'rating', 'enrollment_count']
    ordering = ['-created_at']
    permission_classes = [permissions.AllowAny]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def course_list(request):
    """Legacy course list endpoint."""
    courses = Course.objects.filter(is_published=True)
    serializer = CourseListSerializer(courses, many=True)
    return Response({'courses': serializer.data})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def course_stats(request):
    """Legacy course stats endpoint."""
    stats = {
        'total_courses': Course.objects.filter(is_published=True).count(),
        'featured_courses': Course.objects.filter(is_published=True, is_featured=True).count(),
        'total_enrollments': Course.objects.aggregate(total=Count('enrollment_count'))['total'] or 0,
        'average_rating': Course.objects.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    }
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_courses(request):
    """Legacy featured courses endpoint."""
    courses = Course.objects.filter(is_published=True, is_featured=True)
    serializer = CourseListSerializer(courses, many=True)
    return Response({'courses': serializer.data})


# ==================== LEARNING ENDPOINTS ====================

class CourseEnrollView(generics.CreateAPIView):
    """Enroll a student in a course."""
    serializer_class = EnrollmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        return Course.objects.filter(slug=course_slug, is_published=True)
    
    def perform_create(self, serializer):
        course = get_object_or_404(Course, slug=self.kwargs['slug'], is_published=True)
        serializer.save(student=self.request.user, course=course)
        
        # Create course progress record
        CourseProgress.objects.get_or_create(
            enrollment=serializer.instance,
            defaults={'overall_progress': 0.0}
        )


class CourseModulesView(generics.ListAPIView):
    """Get all modules for a specific course."""
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        course = get_object_or_404(Course, slug=course_slug, is_published=True)
        return CourseModule.objects.filter(course=course, is_published=True).order_by('order')


class ModuleLessonsView(generics.ListAPIView):
    """Get all lessons for a specific module."""
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        module_id = self.kwargs['module_id']
        course = get_object_or_404(Course, slug=course_slug, is_published=True)
        module = get_object_or_404(CourseModule, id=module_id, course=course, is_published=True)
        return Lesson.objects.filter(module=module, is_published=True).order_by('order')


class CourseProgressView(generics.RetrieveAPIView):
    """Get student's progress for a specific course."""
    serializer_class = CourseProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        course_slug = self.kwargs['slug']
        course = get_object_or_404(Course, slug=course_slug, is_published=True)
        enrollment = get_object_or_404(Enrollment, course=course, student=self.request.user)
        return get_object_or_404(CourseProgress, enrollment=enrollment)


class LessonCompleteView(generics.UpdateAPIView):
    """Mark a lesson as complete for a student."""
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id, is_published=True)
        enrollment = get_object_or_404(Enrollment, course=lesson.module.course, student=self.request.user)
        return get_object_or_404(LessonProgress, lesson=lesson, enrollment=enrollment)
    
    def perform_update(self, serializer):
        serializer.save(is_completed=True, completed_at=timezone.now())
        
        # Update module progress
        lesson = self.get_object().lesson
        module = lesson.module
        enrollment = self.get_object().enrollment
        
        # Calculate module progress
        total_lessons = module.lessons.filter(is_published=True).count()
        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            lesson__module=module,
            is_completed=True
        ).count()
        
        module_progress, created = ModuleProgress.objects.get_or_create(
            enrollment=enrollment,
            module=module,
            defaults={'progress_percentage': 0.0}
        )
        module_progress.progress_percentage = (completed_lessons / total_lessons) * 100
        module_progress.is_completed = completed_lessons == total_lessons
        module_progress.save()
        
        # Update course progress
        self._update_course_progress(enrollment)
    
    def _update_course_progress(self, enrollment):
        """Update overall course progress."""
        total_modules = enrollment.course.modules.filter(is_published=True).count()
        completed_modules = ModuleProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).count()
        
        course_progress, created = CourseProgress.objects.get_or_create(
            enrollment=enrollment,
            defaults={'overall_progress': 0.0}
        )
        course_progress.overall_progress = (completed_modules / total_modules) * 100
        course_progress.save()


class LessonMaterialsView(generics.ListAPIView):
    """Get all materials for a specific lesson."""
    serializer_class = LessonMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id, is_published=True)
        return LessonMaterial.objects.filter(lesson=lesson).order_by('order')


class LessonProgressView(generics.RetrieveUpdateAPIView):
    """Get or update student's progress for a specific lesson."""
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id, is_published=True)
        enrollment = get_object_or_404(Enrollment, course=lesson.module.course, student=self.request.user)
        return get_object_or_404(LessonProgress, lesson=lesson, enrollment=enrollment)


# ==================== CONTENT MANAGEMENT ENDPOINTS ====================

class CourseModuleCreateView(generics.CreateAPIView):
    """Create a new module for a course (Tutor/Admin only)."""
    serializer_class = CourseModuleCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        course_slug = self.kwargs['slug']
        course = get_object_or_404(Course, slug=course_slug)
        # Check if user is tutor or admin
        if not (course.tutor == self.request.user or self.request.user.is_staff):
            raise permissions.PermissionDenied("Only course tutors or admins can create modules.")
        serializer.save(course=course)


class LessonCreateView(generics.CreateAPIView):
    """Create a new lesson for a module (Tutor/Admin only)."""
    serializer_class = LessonCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        module_id = self.kwargs['module_id']
        module = get_object_or_404(CourseModule, id=module_id)
        # Check if user is tutor or admin
        if not (module.course.tutor == self.request.user or self.request.user.is_staff):
            raise permissions.PermissionDenied("Only course tutors or admins can create lessons.")
        serializer.save(module=module)


class LessonMaterialUploadView(generics.CreateAPIView):
    """Upload materials for a lesson (Tutor/Admin only)."""
    serializer_class = LessonMaterialCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        # Check if user is tutor or admin
        if not (lesson.module.course.tutor == self.request.user or self.request.user.is_staff):
            raise permissions.PermissionDenied("Only course tutors or admins can upload materials.")
        serializer.save(lesson=lesson)


class CourseResourceView(generics.ListCreateAPIView):
    """Manage course resources (Tutor/Admin only)."""
    serializer_class = CourseResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        course = get_object_or_404(Course, slug=course_slug)
        return CourseResource.objects.filter(course=course)
    
    def perform_create(self, serializer):
        course_slug = self.kwargs['slug']
        course = get_object_or_404(Course, slug=course_slug)
        # Check if user is tutor or admin
        if not (course.tutor == self.request.user or self.request.user.is_staff):
            raise permissions.PermissionDenied("Only course tutors or admins can manage resources.")
        serializer.save(course=course)


# ==================== ANALYTICS ENDPOINTS ====================

class StudentProgressAnalyticsView(generics.ListAPIView):
    """Get student progress analytics."""
    serializer_class = CourseProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Students can only see their own progress
        if not self.request.user.is_staff:
            return CourseProgress.objects.filter(enrollment__student=self.request.user)
        # Admins can see all progress
        return CourseProgress.objects.all()
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Calculate analytics
        total_courses = queryset.count()
        completed_courses = queryset.filter(overall_progress=100).count()
        in_progress_courses = queryset.filter(overall_progress__gt=0, overall_progress__lt=100).count()
        not_started_courses = queryset.filter(overall_progress=0).count()
        
        avg_progress = queryset.aggregate(avg=Avg('overall_progress'))['avg'] or 0
        
        analytics = {
            'total_courses': total_courses,
            'completed_courses': completed_courses,
            'in_progress_courses': in_progress_courses,
            'not_started_courses': not_started_courses,
            'average_progress': round(avg_progress, 2),
            'completion_rate': round((completed_courses / total_courses * 100) if total_courses > 0 else 0, 2)
        }
        
        return Response(analytics)


class CoursePerformanceAnalyticsView(generics.ListAPIView):
    """Get course performance analytics (Admin/Tutor only)."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_tutor):
            raise permissions.PermissionDenied("Only admins and tutors can view course analytics.")
        
        # Course performance metrics
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(is_published=True).count()
        draft_courses = Course.objects.filter(is_draft=True).count()
        featured_courses = Course.objects.filter(is_featured=True).count()
        
        # Enrollment metrics
        total_enrollments = Enrollment.objects.count()
        avg_rating = Course.objects.aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Progress metrics
        total_progress_records = CourseProgress.objects.count()
        completed_courses = CourseProgress.objects.filter(overall_progress=100).count()
        
        analytics = {
            'total_courses': total_courses,
            'published_courses': published_courses,
            'draft_courses': draft_courses,
            'featured_courses': featured_courses,
            'total_enrollments': total_enrollments,
            'average_rating': round(avg_rating, 2),
            'total_progress_records': total_progress_records,
            'completed_courses': completed_courses,
            'completion_rate': round((completed_courses / total_progress_records * 100) if total_progress_records > 0 else 0, 2)
        }
        
        return Response(analytics)


# ==================== STUDY SESSION ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def study_sessions_list(request):
    """Get user study sessions."""
    try:
        sessions = StudySession.objects.filter(enrollment__student=request.user).select_related('enrollment__student', 'enrollment__course', 'lesson').order_by('-started_at')
        
        data = []
        for session in sessions:
            data.append({
                'id': str(session.id),
                'session_duration_minutes': session.session_duration_minutes,
                'progress_made': float(session.progress_made),
                'started_at': session.started_at.isoformat(),
                'ended_at': session.ended_at.isoformat() if session.ended_at else None,
                'created_at': session.created_at.isoformat(),
                'course': {
                    'title': session.enrollment.course.title,
                    'slug': session.enrollment.course.slug
                },
                'lesson': {
                    'title': session.lesson.title,
                    'id': session.lesson.id
                } if session.lesson else None
            })
        
        return Response({'results': data, 'count': len(data)})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

class StudySessionView(generics.ListCreateAPIView):
    """List and create study sessions."""
    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return StudySession.objects.filter(enrollment__student=self.request.user).order_by('-started_at')
    
    def perform_create(self, serializer):
        serializer.save()


class StudySessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a study session."""
    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return StudySession.objects.filter(enrollment__student=self.request.user)


# ==================== NOTIFICATION ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_list(request):
    """Get user notifications."""
    try:
        notifications = CourseNotification.objects.filter(user=request.user).select_related('course').order_by('-created_at')
        
        data = []
        for notification in notifications:
            data.append({
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'notification_type': notification.notification_type,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat(),
                'course': {
                    'title': notification.course.title,
                    'slug': notification.course.slug
                } if notification.course else None
            })
        
        return Response({'results': data, 'count': len(data)})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

class NotificationView(generics.ListAPIView):
    """Get user notifications."""
    serializer_class = CourseNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination to avoid issues
    
    def get_queryset(self):
        return CourseNotification.objects.filter(user=self.request.user).select_related('course').order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """Get or update a notification."""
    serializer_class = CourseNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CourseNotification.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(is_read=True)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def enrollment_status(request, slug):
    """Get enrollment status for a course"""
    try:
        course = get_object_or_404(Course, slug=slug)
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=course
        ).first()
        
        if enrollment:
            return Response({
                'enrolled': True,
                'status': enrollment.status,
                'enrolled_at': enrollment.created_at,
                'course_title': course.title,
                'course_slug': course.slug
            })
        else:
            return Response({
                'enrolled': False,
                'status': 'not_enrolled',
                'course_title': course.title,
                'course_slug': course.slug
            })
    except Exception as e:
        return Response(
            {'error': 'Failed to check enrollment status'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weekly_activity_analytics(request):
    """Get weekly activity data for charts."""
    try:
        user = request.user
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        # Get study sessions for the last 7 days
        if user.role == 'student':
            sessions = StudySession.objects.filter(
                enrollment__student=user,
                started_at__gte=seven_days_ago
            )
        elif user.role == 'tutor':
            sessions = StudySession.objects.filter(
                enrollment__course__tutor=user,
                started_at__gte=seven_days_ago
            )
        elif user.role == 'admin' and user.organization:
            sessions = StudySession.objects.filter(
                enrollment__course__training_partner=user.organization,
                started_at__gte=seven_days_ago
            )
        else:
            sessions = StudySession.objects.none()
        
        # Group by day and calculate total hours
        daily_activity = {}
        for session in sessions:
            day = session.started_at.strftime('%a')  # Mon, Tue, etc.
            duration_hours = (session.session_duration_minutes or 0) / 60
            daily_activity[day] = daily_activity.get(day, 0) + duration_hours
        
        # Create data for all 7 days
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        weekly_data = []
        for day in days:
            weekly_data.append({
                'day': day,
                'hours': round(daily_activity.get(day, 0), 1)
            })
        
        return Response({
            'weekly_activity': weekly_data
        })
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch weekly activity data'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_distribution_analytics(request):
    """Get student distribution data for charts."""
    try:
        user = request.user
        
        # Get enrollments based on user role
        if user.role == 'tutor':
            enrollments = Enrollment.objects.filter(course__tutor=user)
        elif user.role == 'admin' and user.organization:
            enrollments = Enrollment.objects.filter(course__training_partner=user.organization)
        else:
            enrollments = Enrollment.objects.none()
        
        # Group by course level
        level_distribution = enrollments.values('course__level').annotate(
            count=Count('id')
        ).order_by('course__level')
        
        # Create data for chart
        distribution_data = []
        for item in level_distribution:
            level = item['course__level'] or 'Unknown'
            distribution_data.append({
                'level': level.title(),
                'count': item['count']
            })
        
        return Response({
            'student_distribution': distribution_data
        })
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch student distribution data'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

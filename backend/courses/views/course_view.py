from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, Sum
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.http import Http404

from ..models import Course, CourseModule, Lesson, Enrollment, CourseProgress, LessonProgress, LessonMaterial, CourseResource, CourseNotification
from ..serializers import (
    CourseSerializer, CourseListSerializer, CourseCreateSerializer,
    CourseUpdateSerializer, CourseApprovalSerializer, CourseStatsSerializer,
    CourseModuleSerializer, CourseModuleCreateSerializer, LessonSerializer, LessonCreateSerializer,
    EnrollmentCreateSerializer, CourseProgressSerializer, LessonProgressSerializer, 
    LessonMaterialSerializer, LessonMaterialCreateSerializer,
    CourseResourceSerializer, CourseResourceCreateSerializer, CourseNotificationSerializer
)
from ..filters import CourseFilter
from ..services import CourseService, EnrollmentService, ProgressService

User = get_user_model()


class CoursePagination(PageNumberPagination):
    """Custom pagination for course lists."""
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


class CourseListView(generics.ListAPIView):
    """List all published courses with filtering and search."""
    serializer_class = CourseListSerializer
    pagination_class = CoursePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CourseFilter
    search_fields = ['title', 'short_description', 'description', 'tags']
    ordering_fields = ['created_at', 'price', 'rating', 'enrollment_count']
    ordering = ['-created_at']
    permission_classes = [permissions.AllowAny]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
    
    def get_queryset(self):
        """Get published courses using service."""
        return self.course_service.get_published_courses().select_related('training_partner', 'tutor')


class CourseDetailView(generics.RetrieveAPIView):
    """Retrieve a specific course by slug."""
    queryset = Course.objects.filter(is_published=True).select_related('training_partner', 'tutor')
    serializer_class = CourseSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when course is viewed."""
        instance = self.get_object()
        self.course_service.increment_view_count(instance)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CourseCreateView(generics.CreateAPIView):
    """Create a new course."""
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
    
    def perform_create(self, serializer):
        """Create course using service."""
        validated_data = serializer.validated_data
        success, course, error = self.course_service.create_course(validated_data, self.request.user)
        
        if not success:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(error)
        
        # Update serializer instance
        serializer.instance = course


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
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
    
    def get_queryset(self):
        """Only allow admins to approve courses."""
        if self.request.user.role == 'admin':
            return self.course_service.get_courses_by_training_partner(self.request.user.training_partner)
        elif self.request.user.role == 'super_admin':
            return self.course_service.course_repo.get_all()
        return Course.objects.none()
    
    def update(self, request, *args, **kwargs):
        """Handle course approval/rejection."""
        course = self.get_object()
        user = request.user
        
        action = request.data.get('action')  # 'approve' or 'reject'
        approval_notes = request.data.get('approval_notes', '')
        
        if action == 'approve':
            success, error = self.course_service.approve_course(course, user, approval_notes)
        elif action == 'reject':
            success, error = self.course_service.reject_course(course, user, approval_notes)
        else:
            return Response({'error': 'Invalid action. Use "approve" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not success:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CourseSerializer(course)
        return Response(serializer.data)


class CourseStatsView(generics.GenericAPIView):
    """Get course statistics."""
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
    
    def get(self, request):
        """Return course statistics based on user role."""
        stats = self.course_service.get_stats_for_user(request.user)
        
        serializer = CourseStatsSerializer(stats)
        return Response(serializer.data)


class FeaturedCoursesView(generics.ListAPIView):
    """Get featured courses."""
    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CoursePagination
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
    
    def get_queryset(self):
        """Get featured courses using service."""
        return self.course_service.get_featured_courses().select_related('training_partner', 'tutor')


class MyCoursesView(generics.ListAPIView):
    """Get courses for the current user - enrolled courses for learners, created courses for tutors/admins."""
    serializer_class = CourseListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CoursePagination
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.enrollment_service = EnrollmentService()
        self.course_service = CourseService()
    
    def get_queryset(self):
        """Return appropriate courses based on user role."""
        if self.request.user.role == 'learner':
            # For learners, return enrolled courses
            enrollments = self.enrollment_service.get_learner_enrollments(self.request.user)
            enrolled_course_ids = [e.course_id for e in enrollments]
            return Course.objects.filter(
                id__in=enrolled_course_ids
            ).select_related('training_partner', 'tutor')
        elif self.request.user.role in ['tutor', 'admin']:
            # For tutors/admins, return courses they created
            return self.course_service.get_courses_by_tutor(self.request.user).select_related('training_partner', 'tutor')
        return Course.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Override list method to return enrollment data for learners."""
        if request.user.role == 'learner':
            from ..serializers import EnrollmentSerializer
            
            # Get enrollments for the learner using service
            enrollments = self.enrollment_service.get_learner_enrollments(request.user)
            
            # Serialize enrollments
            serializer = EnrollmentSerializer(enrollments, many=True)
            return Response({
                'count': len(enrollments),
                'next': None,
                'previous': None,
                'results': serializer.data
            })
        else:
            # For tutors/admins, use the default behavior
            return super().list(request, *args, **kwargs)


class CourseSearchView(generics.ListAPIView):
    """Advanced course search with filters."""
    serializer_class = CourseListSerializer
    pagination_class = CoursePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CourseFilter
    search_fields = ['title', 'short_description', 'description', 'tags', 'training_partner__name']
    ordering_fields = ['created_at', 'price', 'rating', 'enrollment_count']
    ordering = ['-created_at']
    permission_classes = [permissions.AllowAny]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
    
    def get_queryset(self):
        """Get published courses using service."""
        return self.course_service.get_published_courses().select_related('training_partner', 'tutor')


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def course_list(request):
    """Legacy course list endpoint."""
    course_service = CourseService()
    courses = course_service.get_published_courses()
    serializer = CourseListSerializer(courses, many=True)
    return Response({'courses': serializer.data})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def course_stats(request):
    """Legacy course stats endpoint."""
    course_service = CourseService()
    published = course_service.get_published_courses()
    featured = course_service.get_featured_courses()
    
    stats = {
        'total_courses': published.count(),
        'featured_courses': featured.count(),
        'total_enrollments': published.aggregate(total=Count('enrollment_count'))['total'] or 0,
        'average_rating': published.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    }
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_courses(request):
    """Legacy featured courses endpoint."""
    course_service = CourseService()
    courses = course_service.get_featured_courses()
    serializer = CourseListSerializer(courses, many=True)
    return Response({'courses': serializer.data})


# ==================== LEARNING ENDPOINTS ====================

class CourseEnrollView(generics.CreateAPIView):
    """Enroll a learner in a course."""
    serializer_class = EnrollmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.enrollment_service = EnrollmentService()
        self.progress_service = ProgressService()
        self.course_service = CourseService()
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        course = self.course_service.get_course_by_slug(course_slug, published_only=True)
        if course:
            return Course.objects.filter(id=course.id)
        return Course.objects.none()
    
    def perform_create(self, serializer):
        course = get_object_or_404(Course, slug=self.kwargs['slug'], is_published=True)
        learner = self.request.user
        
        # Use service to enroll learner
        success, enrollment, error = self.enrollment_service.enroll_learner(learner, course)
        
        if not success:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(error)
        
        # Create course progress record using service
        self.progress_service.get_course_progress(enrollment)


class CourseModulesView(generics.ListAPIView):
    """Get all modules for a specific course."""
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
        self.enrollment_service = EnrollmentService()
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        course = self.course_service.get_course_by_slug(course_slug, published_only=True)
        if not course:
            raise Http404("Course not found")
        
        # Check if user can access this course content
        user = self.request.user
        
        # Course owner can access
        if course.tutor == user:
            return CourseModule.objects.filter(course=course).order_by('order')
        
        # Training partner admin can access
        if (user.role == 'knowledge_partner' and 
            hasattr(user, 'knowledge_partner') and 
            user.knowledge_partner == course.training_partner):
            return CourseModule.objects.filter(course=course).order_by('order')
        
        # For learners, check if they have an active enrollment
        if user.role == 'learner':
            enrollment = self.enrollment_service.get_enrollment(user, course)
            if enrollment and enrollment.can_access_content:
                return CourseModule.objects.filter(course=course).order_by('order')
        
        raise permissions.PermissionDenied("You don't have access to this course content.")


class PublicCourseModulesView(generics.ListAPIView):
    """Get all modules for a specific course (public access for course preview)."""
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        course = get_object_or_404(Course, slug=course_slug, is_published=True)
        return CourseModule.objects.filter(course=course).order_by('order')


class ModuleLessonsView(generics.ListAPIView):
    """Get all lessons for a specific module."""
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
        self.enrollment_service = EnrollmentService()
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        module_id = self.kwargs['module_id']
        course = self.course_service.get_course_by_slug(course_slug, published_only=True)
        if not course:
            raise Http404("Course not found")
        module = get_object_or_404(CourseModule, id=module_id, course=course)
        
        # Check if user can access this course content
        user = self.request.user
        
        # Course owner can access
        if course.tutor == user:
            return Lesson.objects.filter(module=module).order_by('order')
        
        # Training partner admin can access
        if (user.role == 'knowledge_partner' and 
            hasattr(user, 'knowledge_partner') and 
            user.knowledge_partner == course.training_partner):
            return Lesson.objects.filter(module=module).order_by('order')
        
        # For learners, check if they have an active enrollment
        if user.role == 'learner':
            enrollment = self.enrollment_service.get_enrollment(user, course)
            if enrollment and enrollment.can_access_content:
                return Lesson.objects.filter(module=module).order_by('order')
        
        raise permissions.PermissionDenied("You don't have access to this course content.")


class PublicModuleLessonsView(generics.ListAPIView):
    """Get all lessons for a specific module (public access for course preview)."""
    serializer_class = LessonSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        module_id = self.kwargs['module_id']
        course = get_object_or_404(Course, slug=course_slug, is_published=True)
        module = get_object_or_404(CourseModule, id=module_id, course=course)
        return Lesson.objects.filter(module=module).order_by('order')


class CourseProgressView(generics.RetrieveAPIView):
    """Get learner's progress for a specific course."""
    serializer_class = CourseProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
        self.enrollment_service = EnrollmentService()
        self.progress_service = ProgressService()
    
    def get_object(self):
        course_slug = self.kwargs['slug']
        course = self.course_service.get_course_by_slug(course_slug, published_only=True)
        if not course:
            raise Http404("Course not found")
        
        enrollment = self.enrollment_service.get_enrollment(self.request.user, course)
        if not enrollment:
            raise Http404("Enrollment not found")
        
        # Get or create CourseProgress using service
        return self.progress_service.get_course_progress(enrollment)


class LessonCompleteView(generics.UpdateAPIView):
    """Mark a lesson as complete for a learner."""
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.enrollment_service = EnrollmentService()
        self.progress_service = ProgressService()
    
    def get_object(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        enrollment = self.enrollment_service.get_enrollment(self.request.user, lesson.module.course)
        if not enrollment:
            raise Http404("Enrollment not found")
        
        # Get lesson progress using service
        lesson_progress = self.progress_service.get_lesson_progress(enrollment, lesson)
        if not lesson_progress:
            # Create if doesn't exist
            _, lesson_progress, _ = self.progress_service.complete_lesson(enrollment, lesson)
        
        return lesson_progress
    
    def perform_update(self, serializer):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        enrollment = self.get_object().enrollment
        
        # Use service to complete lesson
        success, lesson_progress, error = self.progress_service.complete_lesson(enrollment, lesson)
        
        if not success:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(error)
        
        serializer.instance = lesson_progress


class LessonMaterialsView(generics.ListAPIView):
    """Get all materials for a specific lesson."""
    serializer_class = LessonMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        return LessonMaterial.objects.filter(lesson=lesson).order_by('order')


class LessonVideoView(APIView):
    """Serve lesson video with proper headers for streaming."""
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.enrollment_service = EnrollmentService()
    
    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Check if user has access to the course
        user = request.user
        if user.role == 'learner':
            can_access, reason = self.enrollment_service.can_access_course_content(user, lesson.module.course)
            if not can_access:
                return Response({'error': reason}, status=403)
        
        if not lesson.video_file:
            return Response({'error': 'No video file found'}, status=404)
        
        # Return the direct video URL for streaming
        return Response({
            'video_url': lesson.video_file.url,
            'title': lesson.title,
            'duration': lesson.duration_formatted
        })


class LessonProgressView(generics.RetrieveUpdateAPIView):
    """Get or update learner's progress for a specific lesson."""
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.enrollment_service = EnrollmentService()
        self.progress_service = ProgressService()
    
    def get_object(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        enrollment = self.enrollment_service.get_enrollment(self.request.user, lesson.module.course)
        if not enrollment:
            raise Http404("Enrollment not found")
        
        # Get lesson progress using service
        lesson_progress = self.progress_service.get_lesson_progress(enrollment, lesson)
        if not lesson_progress:
            # Create if doesn't exist by starting the lesson
            _, lesson_progress, _ = self.progress_service.start_lesson(enrollment, lesson)
        
        return lesson_progress


class LessonStartView(generics.UpdateAPIView):
    """Mark a lesson as started for a learner."""
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.enrollment_service = EnrollmentService()
        self.progress_service = ProgressService()
    
    def get_object(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        enrollment = self.enrollment_service.get_enrollment(self.request.user, lesson.module.course)
        if not enrollment:
            raise Http404("Enrollment not found")
        
        # Get lesson progress using service
        lesson_progress = self.progress_service.get_lesson_progress(enrollment, lesson)
        if not lesson_progress:
            # Create if doesn't exist by starting the lesson
            _, lesson_progress, _ = self.progress_service.start_lesson(enrollment, lesson)
        
        return lesson_progress
    
    def perform_update(self, serializer):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        enrollment = self.get_object().enrollment
        
        # Use service to start lesson
        success, lesson_progress, error = self.progress_service.start_lesson(enrollment, lesson)
        
        if not success:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(error)
        
        serializer.instance = lesson_progress


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


class LearnerCourseResourceView(generics.ListAPIView):
    """Get course resources for enrolled learners."""
    serializer_class = CourseResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
        self.enrollment_service = EnrollmentService()
    
    def get_queryset(self):
        course_slug = self.kwargs['slug']
        course = self.course_service.get_course_by_slug(course_slug, published_only=True)
        if not course:
            raise Http404("Course not found")
        
        user = self.request.user
        
        # Check if user is enrolled in the course
        if user.role == 'learner':
            can_access, _ = self.enrollment_service.can_access_course_content(user, course)
            if can_access:
                return CourseResource.objects.filter(course=course, is_public=True)
        
        # If not enrolled or no access, return empty queryset
        return CourseResource.objects.none()


class LearnerCourseContentView(generics.RetrieveAPIView):
    """Get full course content (modules and lessons) for enrolled learners."""
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
        self.enrollment_service = EnrollmentService()
    
    def get_serializer_class(self):
        from ..serializers.content_serializers import CourseModuleSerializer
        return CourseModuleSerializer
    
    def get_object(self):
        course_slug = self.kwargs['slug']
        course = self.course_service.get_course_by_slug(course_slug, published_only=True)
        if not course:
            raise Http404("Course not found")
        
        user = self.request.user
        
        # Check if user is enrolled in the course
        if user.role == 'learner':
            can_access, _ = self.enrollment_service.can_access_course_content(user, course)
            if can_access:
                # Return the course with modules and lessons
                return course
        
        # If not enrolled or no access, return 404
        raise Http404("Course not found or access denied")
    
    def retrieve(self, request, *args, **kwargs):
        course = self.get_object()
        
        # Get modules with lessons
        modules = course.modules.all().prefetch_related('lessons').order_by('order')
        
        # Serialize the data
        from ..serializers.content_serializers import CourseModuleSerializer, LessonSerializer
        
        modules_data = []
        for module in modules:
            module_data = CourseModuleSerializer(module, context={'request': request}).data
            # Pass request context to LessonSerializer so it can check completion status
            lessons_data = LessonSerializer(
                module.lessons.all().order_by('order'), 
                many=True, 
                context={'request': request}
            ).data
            module_data['lessons'] = lessons_data
            modules_data.append(module_data)
        
        return Response({
            'course': {
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'description': course.description,
                'thumbnail': course.thumbnail.url if course.thumbnail else None,
            },
            'modules': modules_data
        })


# ==================== ANALYTICS ENDPOINTS ====================

class LearnerProgressAnalyticsView(generics.ListAPIView):
    """Get learner progress analytics."""
    serializer_class = CourseProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.progress_service = ProgressService()
    
    def get_queryset(self):
        # Learners can only see their own progress
        if not self.request.user.is_staff:
            return self.progress_service.progress_repo.find_by_learner(self.request.user)
        # Admins can see all progress
        return self.progress_service.progress_repo.get_all()
    
    def list(self, request, *args, **kwargs):
        # Use service to get analytics
        analytics = self.progress_service.get_learner_analytics(request.user)
        return Response(analytics)


class CoursePerformanceAnalyticsView(generics.ListAPIView):
    """Get course performance analytics (Admin/Tutor only)."""
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.course_service = CourseService()
        self.progress_service = ProgressService()
        self.enrollment_service = EnrollmentService()
    
    def get(self, request, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_tutor):
            raise permissions.PermissionDenied("Only admins and tutors can view course analytics.")
        
        # Get stats using services
        course_stats = self.course_service.get_stats_for_user(request.user)
        progress_analytics = self.progress_service.get_course_analytics()
        
        # Enrollment count from repository
        total_enrollments = self.enrollment_service.enrollment_repo.get_total_count()
        
        analytics = {
            'total_courses': course_stats.get('total_courses', 0),
            'published_courses': course_stats.get('published_courses', 0),
            'draft_courses': course_stats.get('draft_courses', 0),
            'featured_courses': course_stats.get('featured_courses', 0),
            'total_enrollments': total_enrollments,
            'average_rating': course_stats.get('average_rating', 0),
            'total_progress_records': progress_analytics.get('total_progress_records', 0),
            'completed_courses': progress_analytics.get('completed_courses', 0),
            'completion_rate': progress_analytics.get('completion_rate', 0)
        }
        
        return Response(analytics)




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
        course_service = CourseService()
        enrollment_service = EnrollmentService()
        
        course = course_service.get_course_by_slug(slug, published_only=False)
        if not course:
            raise Http404("Course not found")
        
        enrollment_status_data = enrollment_service.get_enrollment_status(request.user, course)
        enrollment_status_data['course_title'] = course.title
        enrollment_status_data['course_slug'] = course.slug
        
        return Response(enrollment_status_data)
    except Exception as e:
        return Response(
            {'error': 'Failed to check enrollment status'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weekly_activity_analytics(request):
    """Get weekly activity data for charts based on lesson progress."""
    try:
        user = request.user
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        # Get lesson progress for the last 7 days
        if user.role == 'learner':
            progress_records = LessonProgress.objects.filter(
                enrollment__learner=user,
                last_accessed__gte=seven_days_ago
            )
        elif user.role == 'tutor':
            progress_records = LessonProgress.objects.filter(
                enrollment__course__tutor=user,
                last_accessed__gte=seven_days_ago
            )
        elif user.role == 'admin' and hasattr(user, 'organization') and user.organization:
            progress_records = LessonProgress.objects.filter(
                enrollment__course__training_partner=user.organization,
                last_accessed__gte=seven_days_ago
            )
        else:
            progress_records = LessonProgress.objects.none()
        
        # Group by day and calculate activity count
        daily_activity = {}
        for progress in progress_records:
            day = progress.last_accessed.strftime('%a')  # Mon, Tue, etc.
            daily_activity[day] = daily_activity.get(day, 0) + 1
        
        # Create data for all 7 days
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        weekly_data = []
        for day in days:
            weekly_data.append({
                'day': day,
                'activity_count': daily_activity.get(day, 0)
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
def learner_distribution_analytics(request):
    """Get learner distribution data for charts."""
    try:
        user = request.user
        
        # Get enrollments based on user role
        if user.role == 'tutor':
            enrollments = Enrollment.objects.filter(course__tutor=user)
        elif user.role == 'admin' and hasattr(user, 'organization') and user.organization:
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
            'learner_distribution': distribution_data
        })
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch learner distribution data'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

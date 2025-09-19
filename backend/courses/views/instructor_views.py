"""
Views for KP Instructor course management dashboard.
"""
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone

from ..models import Course, CourseModule, Lesson, LessonMaterial, CourseResource
from ..models.progress import LessonProgress, CourseProgress
from ..models.enrollment import Enrollment
from ..permissions import IsKnowledgePartnerInstructor
from ..serializers.instructor_serializers import (
    InstructorCourseCreateSerializer,
    InstructorCourseListSerializer,
    InstructorCourseDetailSerializer,
    InstructorModuleCreateSerializer,
    InstructorModuleListSerializer,
    InstructorLessonCreateSerializer,
    InstructorLessonListSerializer,
    InstructorLessonDetailSerializer,
    InstructorLessonMaterialCreateSerializer,
    InstructorLessonMaterialListSerializer,
    InstructorCourseResourceCreateSerializer,
    InstructorCourseResourceListSerializer,
    InstructorCourseStatsSerializer,
    LearnerProgressSummarySerializer
)


class InstructorCourseListCreateView(generics.ListCreateAPIView):
    """List and create courses for KP instructors."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InstructorCourseCreateSerializer
        return InstructorCourseListSerializer
    
    def create(self, request, *args, **kwargs):
        """Create course and return full course data."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.save()
        
        # Return full course data using the list serializer
        response_serializer = InstructorCourseListSerializer(course)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def get_queryset(self):
        """Return courses created by the instructor."""
        return Course.objects.filter(tutor=self.request.user).order_by('-created_at')


class InstructorCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a course for KP instructors."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    serializer_class = InstructorCourseDetailSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Return courses created by the instructor."""
        return Course.objects.filter(tutor=self.request.user)


class InstructorModuleListCreateView(generics.ListCreateAPIView):
    """List and create modules for a course."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InstructorModuleCreateSerializer
        return InstructorModuleListSerializer
    
    def get_queryset(self):
        """Return modules for the specified course."""
        course_slug = self.kwargs['course_slug']
        course = get_object_or_404(Course, slug=course_slug, tutor=self.request.user)
        return CourseModule.objects.filter(course=course).order_by('order')
    
    def get_serializer_context(self):
        """Add course to serializer context."""
        context = super().get_serializer_context()
        course_slug = self.kwargs['course_slug']
        context['course'] = get_object_or_404(Course, slug=course_slug, tutor=self.request.user)
        return context


class InstructorModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a module."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    serializer_class = InstructorModuleListSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return modules for courses owned by the instructor."""
        return CourseModule.objects.filter(course__tutor=self.request.user)


class InstructorLessonListCreateView(generics.ListCreateAPIView):
    """List and create lessons for a module."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InstructorLessonCreateSerializer
        return InstructorLessonListSerializer
    
    def get_queryset(self):
        """Return lessons for the specified module."""
        course_slug = self.kwargs['course_slug']
        module_id = self.kwargs['module_id']
        
        # Verify instructor owns the course
        course = get_object_or_404(Course, slug=course_slug, tutor=self.request.user)
        module = get_object_or_404(CourseModule, id=module_id, course=course)
        
        return Lesson.objects.filter(module=module).order_by('order')
    
    def get_serializer_context(self):
        """Add module to serializer context."""
        context = super().get_serializer_context()
        course_slug = self.kwargs['course_slug']
        module_id = self.kwargs['module_id']
        
        course = get_object_or_404(Course, slug=course_slug, tutor=self.request.user)
        context['module'] = get_object_or_404(CourseModule, id=module_id, course=course)
        return context


class InstructorLessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a lesson."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    serializer_class = InstructorLessonDetailSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return lessons for courses owned by the instructor."""
        return Lesson.objects.filter(module__course__tutor=self.request.user)


class InstructorLessonMaterialListCreateView(generics.ListCreateAPIView):
    """List and create materials for a lesson."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InstructorLessonMaterialCreateSerializer
        return InstructorLessonMaterialListSerializer
    
    def get_queryset(self):
        """Return materials for the specified lesson."""
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(
            Lesson, 
            id=lesson_id, 
            module__course__tutor=self.request.user
        )
        return LessonMaterial.objects.filter(lesson=lesson).order_by('order', 'title')
    
    def get_serializer_context(self):
        """Add lesson to serializer context."""
        context = super().get_serializer_context()
        lesson_id = self.kwargs['lesson_id']
        context['lesson'] = get_object_or_404(
            Lesson, 
            id=lesson_id, 
            module__course__tutor=self.request.user
        )
        return context


class InstructorLessonMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a lesson material."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    serializer_class = InstructorLessonMaterialListSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return materials for lessons owned by the instructor."""
        return LessonMaterial.objects.filter(lesson__module__course__tutor=self.request.user)


class InstructorCourseResourceListCreateView(generics.ListCreateAPIView):
    """List and create resources for a course."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InstructorCourseResourceCreateSerializer
        return InstructorCourseResourceListSerializer
    
    def get_queryset(self):
        """Return resources for the specified course."""
        course_slug = self.kwargs['course_slug']
        course = get_object_or_404(Course, slug=course_slug, tutor=self.request.user)
        return CourseResource.objects.filter(course=course).order_by('order', 'title')
    
    def get_serializer_context(self):
        """Add course to serializer context."""
        context = super().get_serializer_context()
        course_slug = self.kwargs['course_slug']
        context['course'] = get_object_or_404(Course, slug=course_slug, tutor=self.request.user)
        return context


class InstructorCourseResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a course resource."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerInstructor]
    serializer_class = InstructorCourseResourceListSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return resources for courses owned by the instructor."""
        return CourseResource.objects.filter(course__tutor=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerInstructor])
def instructor_dashboard_stats(request):
    """Get dashboard statistics for the instructor."""
    user = request.user
    
    # Get course statistics
    courses = Course.objects.filter(tutor=user)
    total_courses = courses.count()
    published_courses = courses.filter(is_published=True).count()
    draft_courses = courses.filter(approval_status='draft').count()
    pending_approval_courses = courses.filter(approval_status='pending_approval').count()
    
    # Get enrollment statistics
    total_enrollments = Enrollment.objects.filter(course__tutor=user).count()
    
    # Get content statistics
    total_modules = CourseModule.objects.filter(course__tutor=user).count()
    total_lessons = Lesson.objects.filter(module__course__tutor=user).count()
    total_duration_minutes = Lesson.objects.filter(
        module__course__tutor=user
    ).aggregate(total=Sum('duration_minutes'))['total'] or 0
    total_duration_hours = total_duration_minutes / 60.0
    
    # Get average rating
    avg_rating = courses.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0.0
    
    # Get recent courses (simplified)
    recent_courses = courses.order_by('-created_at')[:5]
    recent_courses_data = []
    for course in recent_courses:
        recent_courses_data.append({
            'id': str(course.id),
            'title': course.title,
            'slug': course.slug,
            'price': float(course.price),
            'approval_status': course.approval_status,
            'created_at': course.created_at.isoformat()
        })
    
    stats_data = {
        'total_courses': total_courses,
        'published_courses': published_courses,
        'draft_courses': draft_courses,
        'pending_approval_courses': pending_approval_courses,
        'total_enrollments': total_enrollments,
        'total_modules': total_modules,
        'total_lessons': total_lessons,
        'total_duration_hours': round(total_duration_hours, 2),
        'avg_course_rating': round(avg_rating, 2),
        'recent_courses': recent_courses_data
    }
    
    return Response(stats_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerInstructor])
def instructor_learner_progress(request):
    """Get learner progress for instructor's courses."""
    user = request.user
    
    # Get all course progress for instructor's courses
    course_progress = CourseProgress.objects.filter(
        enrollment__course__tutor=user
    ).select_related(
        'enrollment__learner', 'enrollment__course'
    ).order_by('-last_activity')
    
    # Apply filters
    course_slug = request.GET.get('course')
    if course_slug:
        course_progress = course_progress.filter(enrollment__course__slug=course_slug)
    
    # Pagination
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    
    page = paginator.paginate_queryset(course_progress, request)
    if page is not None:
        serializer = LearnerProgressSummarySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = LearnerProgressSummarySerializer(course_progress, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerInstructor])
def submit_course_for_approval(request, course_slug):
    """Submit a course for approval."""
    course = get_object_or_404(Course, slug=course_slug, tutor=request.user)
    
    # Check if course has at least one module and lesson
    if not course.modules.exists():
        return Response(
            {'error': 'Course must have at least one module before submission.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not any(module.lessons.exists() for module in course.modules.all()):
        return Response(
            {'error': 'Course must have at least one lesson before submission.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update approval status - set is_draft=False to trigger pending_approval status
    course.is_draft = False
    course.save()
    
    return Response({
        'message': 'Course submitted for approval successfully.',
        'approval_status': course.approval_status
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerInstructor])
def course_analytics(request, course_slug):
    """Get analytics for a specific course."""
    course = get_object_or_404(Course, slug=course_slug, tutor=request.user)
    
    # Get enrollment data
    enrollments = Enrollment.objects.filter(course=course)
    total_enrollments = enrollments.count()
    active_enrollments = enrollments.filter(status='active').count()
    completed_enrollments = enrollments.filter(status='completed').count()
    
    # Get progress data
    course_progress = CourseProgress.objects.filter(enrollment__course=course)
    avg_progress = course_progress.aggregate(avg_progress=Avg('overall_progress'))['avg_progress'] or 0
    
    # Get lesson completion data
    lessons = Lesson.objects.filter(module__course=course)
    lesson_stats = []
    
    for lesson in lessons:
        lesson_progress = LessonProgress.objects.filter(lesson=lesson)
        completion_rate = 0
        if total_enrollments > 0:
            completed_count = lesson_progress.filter(is_completed=True).count()
            completion_rate = (completed_count / total_enrollments) * 100
        
        lesson_stats.append({
            'lesson_id': lesson.id,
            'lesson_title': lesson.title,
            'module_title': lesson.module.title,
            'completion_rate': round(completion_rate, 2),
            'total_views': lesson_progress.count(),
            'avg_duration_minutes': lesson.duration_minutes
        })
    
    # Get recent activity
    recent_progress = LessonProgress.objects.filter(
        lesson__module__course=course
    ).select_related('enrollment__learner', 'lesson').order_by('-updated_at')[:10]
    
    recent_activity = []
    for progress in recent_progress:
        recent_activity.append({
            'learner_name': progress.enrollment.learner.full_name,
            'lesson_title': progress.lesson.title,
            'action': 'completed' if progress.is_completed else 'started',
            'timestamp': progress.updated_at
        })
    
    analytics_data = {
        'course_title': course.title,
        'total_enrollments': total_enrollments,
        'active_enrollments': active_enrollments,
        'completed_enrollments': completed_enrollments,
        'avg_progress': round(avg_progress, 2),
        'lesson_stats': lesson_stats,
        'recent_activity': recent_activity,
        'course_rating': course.rating,
        'total_reviews': course.total_reviews
    }
    
    return Response(analytics_data)

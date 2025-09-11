from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from ..models import Course
from ..serializers import (
    CourseSerializer, CourseListSerializer, CourseCreateSerializer,
    CourseUpdateSerializer, CourseApprovalSerializer, CourseStatsSerializer
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
    """Get courses created by the current user."""
    serializer_class = CourseListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CoursePagination
    
    def get_queryset(self):
        """Return courses created by the current user."""
        if self.request.user.role in ['tutor', 'admin']:
            return Course.objects.filter(tutor=self.request.user).select_related('training_partner', 'tutor')
        return Course.objects.none()


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

from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from .models import Course, Enrollment, CourseReview
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseCreateSerializer,
    EnrollmentSerializer, CourseReviewSerializer
)


class CourseListView(generics.ListAPIView):
    """List all published courses with filtering and search."""
    
    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'level', 'organization', 'organization__type']
    search_fields = ['title', 'description', 'instructor__full_name', 'organization__name']
    ordering_fields = ['created_at', 'title', 'price', 'rating', 'total_enrollments']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Course.objects.filter(status='published').select_related(
            'organization', 'instructor'
        ).prefetch_related('enrollments')
        
        # Filter by organization type if specified
        org_type = self.request.query_params.get('org_type')
        if org_type:
            queryset = queryset.filter(organization__type=org_type)
        
        # Filter featured courses
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        return queryset


class CourseDetailView(generics.RetrieveAPIView):
    """Retrieve detailed course information."""
    
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Course.objects.filter(status='published').select_related(
            'organization', 'instructor'
        ).prefetch_related('modules__lessons', 'enrollments')


class CourseCreateView(generics.CreateAPIView):
    """Create new course (tutors and admins only)."""
    
    serializer_class = CourseCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Ensure user can create courses
        if not self.request.user.can_create_courses:
            raise permissions.PermissionDenied("You don't have permission to create courses.")
        
        serializer.save()


class MyCoursesList(generics.ListAPIView):
    """List courses created by the authenticated instructor."""
    
    serializer_class = CourseListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Course.objects.filter(
            instructor=self.request.user
        ).select_related('organization').prefetch_related('enrollments')


class StudentEnrollmentsView(generics.ListAPIView):
    """List enrollments for authenticated student."""
    
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'student':
            return Enrollment.objects.none()
        
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related('course__organization', 'course__instructor')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def enroll_in_course(request, course_slug):
    """Enroll student in a course."""
    
    if request.user.role != 'student':
        return Response(
            {'error': 'Only students can enroll in courses.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(slug=course_slug, status='published')
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if already enrolled
    existing_enrollment = Enrollment.objects.filter(
        student=request.user,
        course=course
    ).first()
    
    if existing_enrollment:
        if existing_enrollment.status == 'enrolled':
            return Response(
                {'error': 'You are already enrolled in this course.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif existing_enrollment.status == 'dropped':
            # Re-enroll
            existing_enrollment.status = 'enrolled'
            existing_enrollment.save()
            return Response({
                'message': 'Successfully re-enrolled in course.',
                'enrollment_id': existing_enrollment.id
            })
    
    # Create new enrollment
    enrollment = Enrollment.objects.create(
        student=request.user,
        course=course,
        amount_paid=course.price
    )
    
    # Update course enrollment count
    course.total_enrollments += 1
    course.save(update_fields=['total_enrollments'])
    
    return Response({
        'message': 'Successfully enrolled in course.',
        'enrollment_id': enrollment.id
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def drop_course(request, course_slug):
    """Drop from a course."""
    
    if request.user.role != 'student':
        return Response(
            {'error': 'Only students can drop courses.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        enrollment = Enrollment.objects.get(
            student=request.user,
            course__slug=course_slug,
            status='enrolled'
        )
    except Enrollment.DoesNotExist:
        return Response(
            {'error': 'Enrollment not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    enrollment.status = 'dropped'
    enrollment.save()
    
    return Response({'message': 'Successfully dropped from course.'})


class CourseReviewListCreateView(generics.ListCreateAPIView):
    """List and create course reviews."""
    
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_slug = self.kwargs.get('course_slug')
        return CourseReview.objects.filter(
            enrollment__course__slug=course_slug
        ).select_related('enrollment__student')
    
    def perform_create(self, serializer):
        course_slug = self.kwargs.get('course_slug')
        
        # Get the user's enrollment
        try:
            enrollment = Enrollment.objects.get(
                student=self.request.user,
                course__slug=course_slug,
                status__in=['enrolled', 'completed']
            )
        except Enrollment.DoesNotExist:
            raise permissions.PermissionDenied(
                "You must be enrolled in this course to leave a review."
            )
        
        # Check if review already exists
        if hasattr(enrollment, 'review'):
            raise permissions.PermissionDenied(
                "You have already reviewed this course."
            )
        
        serializer.save(enrollment=enrollment)
        
        # Update course rating
        course = enrollment.course
        avg_rating = CourseReview.objects.filter(
            enrollment__course=course
        ).aggregate(Avg('rating'))['rating__avg']
        
        if avg_rating:
            course.rating = round(avg_rating, 2)
            course.save(update_fields=['rating'])


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def course_stats(request):
    """Get overall course statistics."""
    
    stats = {
        'total_courses': Course.objects.filter(status='published').count(),
        'total_organizations': Course.objects.filter(
            status='published'
        ).values('organization').distinct().count(),
        'total_students': Enrollment.objects.filter(
            status='enrolled'
        ).values('student').distinct().count(),
        'categories': Course.objects.filter(
            status='published'
        ).values('category').annotate(
            count=Count('id')
        ).order_by('-count')
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_courses(request):
    """Get featured courses."""
    
    courses = Course.objects.filter(
        status='published',
        is_featured=True
    ).select_related('organization', 'instructor')[:6]
    
    serializer = CourseListSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)

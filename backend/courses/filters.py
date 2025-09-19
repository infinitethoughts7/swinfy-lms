import django_filters
from django.db.models import Q, F
from courses.models import Course


class CourseFilter(django_filters.FilterSet):
    """Filter for Course model with updated fields."""
    
    # Category filter (updated choices)
    category = django_filters.ChoiceFilter(choices=Course.CATEGORY_CHOICES)
    
    # Level filter
    level = django_filters.ChoiceFilter(choices=Course.LEVEL_CHOICES)
    
    # Price range filter
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    # Duration filter
    min_duration = django_filters.NumberFilter(field_name='duration_weeks', lookup_expr='gte')
    max_duration = django_filters.NumberFilter(field_name='duration_weeks', lookup_expr='lte')
    
    # Rating filter
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    
    # Training partner filter
    training_partner = django_filters.UUIDFilter(field_name='training_partner__id')  # Changed to UUIDFilter
    training_partner_name = django_filters.CharFilter(field_name='training_partner__name', lookup_expr='icontains')
    
    # Tutor filter
    tutor = django_filters.UUIDFilter(field_name='tutor__id')  # Changed to UUIDFilter
    tutor_name = django_filters.CharFilter(field_name='tutor__full_name', lookup_expr='icontains')
    
    # Status filters
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    is_published = django_filters.BooleanFilter(field_name='is_published')
    approval_status = django_filters.ChoiceFilter(choices=Course.APPROVAL_STATUS_CHOICES)
    
    # NEW: Privacy and access filters
    is_private = django_filters.BooleanFilter(field_name='is_private')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    requires_admin_enrollment = django_filters.BooleanFilter(field_name='requires_admin_enrollment')
    
    # NEW: Enrollment filters
    max_enrollments = django_filters.NumberFilter(field_name='max_enrollments', lookup_expr='lte')
    has_space = django_filters.BooleanFilter(method='filter_has_space')
    
    # Date filters
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    published_after = django_filters.DateFilter(field_name='published_at', lookup_expr='gte')
    published_before = django_filters.DateFilter(field_name='published_at', lookup_expr='lte')
    
    # Tags filter
    tags = django_filters.CharFilter(method='filter_tags')
    
    # NEW: Search filter for title and description
    search = django_filters.CharFilter(method='filter_search')
    
    # NEW: Organization-specific filter (for private courses)
    my_organization = django_filters.BooleanFilter(method='filter_my_organization')
    
    # NEW: Enrollment status filter (for learners)
    enrollment_status = django_filters.CharFilter(method='filter_enrollment_status')
    
    class Meta:
        model = Course
        fields = [
            'category', 'level', 'min_price', 'max_price', 'min_duration', 'max_duration',
            'min_rating', 'training_partner', 'training_partner_name', 'tutor', 'tutor_name',
            'is_featured', 'is_published', 'approval_status', 'is_private', 'is_active',
            'requires_admin_enrollment', 'max_enrollments', 'has_space',
            'created_after', 'created_before', 'published_after', 'published_before',
            'tags', 'search', 'my_organization', 'enrollment_status'
        ]
    
    def filter_tags(self, queryset, name, value):
        """Filter courses by tags."""
        if value:
            tags = [tag.strip() for tag in value.split(',')]
            query = Q()
            for tag in tags:
                query |= Q(tags__icontains=tag)
            return queryset.filter(query)
        return queryset
    
    def filter_search(self, queryset, name, value):
        """Search in title, description, and short_description."""
        if value:
            return queryset.filter(
                Q(title__icontains=value) |
                Q(description__icontains=value) |
                Q(short_description__icontains=value) |
                Q(tags__icontains=value)
            )
        return queryset
    
    def filter_has_space(self, queryset, name, value):
        """Filter courses that have enrollment space available."""
        if value:
            # Courses with no max limit or current enrollments < max
            return queryset.filter(
                Q(max_enrollments__isnull=True) |
                Q(enrollment_count__lt=F('max_enrollments'))
            )
        elif value is False:
            # Courses that are full
            return queryset.filter(
                max_enrollments__isnull=False,
                enrollment_count__gte=F('max_enrollments')
            )
        return queryset
    
    def filter_my_organization(self, queryset, name, value):
        """Filter courses from user's organization."""
        if value and self.request and self.request.user.is_authenticated:
            if hasattr(self.request.user, 'organization') and self.request.user.organization:
                return queryset.filter(training_partner=self.request.user.organization)
        return queryset
    
    def filter_enrollment_status(self, queryset, name, value):
        """Filter courses based on user's enrollment status."""
        if not self.request or not self.request.user.is_authenticated:
            return queryset
        
        from .models import Enrollment
        user = self.request.user
        
        if value == 'enrolled':
            # Courses user is enrolled in
            enrolled_course_ids = Enrollment.objects.filter(
                learner=user
            ).values_list('course_id', flat=True)
            return queryset.filter(id__in=enrolled_course_ids)
        
        elif value == 'not_enrolled':
            # Courses user is not enrolled in
            enrolled_course_ids = Enrollment.objects.filter(
                learner=user
            ).values_list('course_id', flat=True)
            return queryset.exclude(id__in=enrolled_course_ids)
        
        elif value == 'pending':
            # Courses with pending enrollment
            pending_course_ids = Enrollment.objects.filter(
                learner=user,
                status='pending_approval'
            ).values_list('course_id', flat=True)
            return queryset.filter(id__in=pending_course_ids)
        
        elif value == 'approved':
            # Courses with approved/active enrollment
            approved_course_ids = Enrollment.objects.filter(
                learner=user,
                status__in=['approved', 'active', 'completed']
            ).values_list('course_id', flat=True)
            return queryset.filter(id__in=approved_course_ids)
        
        return queryset


class PublicCourseFilter(CourseFilter):
    """Simplified filter for public course discovery."""
    
    class Meta:
        model = Course
        fields = [
            'category', 'level', 'min_price', 'max_price', 'min_duration', 'max_duration',
            'min_rating', 'training_partner_name', 'is_featured', 'tags', 'search'
        ]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove internal/admin fields for public filtering
        fields_to_remove = [
            'is_published', 'approval_status', 'is_private', 'is_active',
            'requires_admin_enrollment', 'my_organization', 'enrollment_status'
        ]
        for field in fields_to_remove:
            if field in self.filters:
                del self.filters[field]


class AdminCourseFilter(CourseFilter):
    """Extended filter for admin course management."""
    
    # Additional admin-specific filters
    created_by_me = django_filters.BooleanFilter(method='filter_created_by_me')
    needs_approval = django_filters.BooleanFilter(method='filter_needs_approval')
    recently_updated = django_filters.BooleanFilter(method='filter_recently_updated')
    
    class Meta:
        model = Course
        fields = CourseFilter.Meta.fields + [
            'created_by_me', 'needs_approval', 'recently_updated'
        ]
    
    def filter_created_by_me(self, queryset, name, value):
        """Filter courses created by current user."""
        if value and self.request and self.request.user.is_authenticated:
            return queryset.filter(tutor=self.request.user)
        return queryset
    
    def filter_needs_approval(self, queryset, name, value):
        """Filter courses that need approval."""
        if value:
            return queryset.filter(approval_status='pending_approval')
        return queryset
    
    def filter_recently_updated(self, queryset, name, value):
        """Filter courses updated in last 7 days."""
        if value:
            from django.utils import timezone
            from datetime import timedelta
            seven_days_ago = timezone.now() - timedelta(days=7)
            return queryset.filter(updated_at__gte=seven_days_ago)
        return queryset
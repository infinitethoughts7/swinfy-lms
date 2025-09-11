import django_filters
from .models import Course


class CourseFilter(django_filters.FilterSet):
    """Filter for Course model."""
    
    # Category filter
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
    training_partner = django_filters.NumberFilter(field_name='training_partner__id')
    training_partner_name = django_filters.CharFilter(field_name='training_partner__name', lookup_expr='icontains')
    
    # Tutor filter
    tutor = django_filters.NumberFilter(field_name='tutor__id')
    tutor_name = django_filters.CharFilter(field_name='tutor__full_name', lookup_expr='icontains')
    
    # Status filters
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    is_published = django_filters.BooleanFilter(field_name='is_published')
    approval_status = django_filters.ChoiceFilter(choices=Course.APPROVAL_STATUS_CHOICES)
    
    # Date filters
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    
    # Tags filter
    tags = django_filters.CharFilter(method='filter_tags')
    
    class Meta:
        model = Course
        fields = [
            'category', 'level', 'min_price', 'max_price', 'min_duration', 'max_duration',
            'min_rating', 'training_partner', 'training_partner_name', 'tutor', 'tutor_name',
            'is_featured', 'is_published', 'approval_status', 'created_after', 'created_before', 'tags'
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

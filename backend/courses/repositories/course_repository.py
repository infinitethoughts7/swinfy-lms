"""
Course Repository - All database operations for Course model.

Single Responsibility: ONLY database queries, NO business logic.
"""
from typing import Optional, List
from django.db.models import QuerySet, Avg, Count

from ..models import Course, CourseReview


class CourseRepository:
    """
    Repository for Course database operations.
    
    All Course.objects calls should go through this class.
    Views and Services should NEVER directly use Course.objects.
    """
    
    # ==================== READ OPERATIONS ====================
    
    @staticmethod
    def get_all() -> QuerySet:
        """Get all courses."""
        return Course.objects.all()
    
    @staticmethod
    def get_published() -> QuerySet:
        """Get all published courses with related data."""
        return Course.objects.filter(
            is_published=True
        ).select_related('training_partner', 'tutor')
    
    @staticmethod
    def get_featured() -> QuerySet:
        """Get featured published courses."""
        return Course.objects.filter(
            is_published=True,
            is_featured=True
        ).select_related('training_partner', 'tutor')
    
    @staticmethod
    def find_by_slug(slug: str) -> Optional[Course]:
        """Find a single course by slug."""
        try:
            return Course.objects.select_related(
                'training_partner', 'tutor'
            ).get(slug=slug)
        except Course.DoesNotExist:
            return None
    
    @staticmethod
    def find_by_slug_published(slug: str) -> Optional[Course]:
        """Find a published course by slug."""
        try:
            return Course.objects.select_related(
                'training_partner', 'tutor'
            ).get(slug=slug, is_published=True)
        except Course.DoesNotExist:
            return None
    
    @staticmethod
    def find_by_tutor(user) -> QuerySet:
        """Get all courses created by a specific tutor."""
        return Course.objects.filter(
            tutor=user
        ).select_related('training_partner', 'tutor')
    
    @staticmethod
    def find_by_training_partner(training_partner) -> QuerySet:
        """Get all courses for a training partner."""
        return Course.objects.filter(
            training_partner=training_partner
        ).select_related('training_partner', 'tutor')
    
    @staticmethod
    def find_pending_approval(training_partner) -> QuerySet:
        """Get courses pending approval for a training partner."""
        return Course.objects.filter(
            training_partner=training_partner,
            approval_status='pending_approval'
        ).select_related('training_partner', 'tutor')
    
    # ==================== WRITE OPERATIONS ====================
    
    @staticmethod
    def create(data: dict) -> Course:
        """Create a new course."""
        return Course.objects.create(**data)
    
    @staticmethod
    def update(course: Course, data: dict) -> Course:
        """Update a course with given data."""
        for key, value in data.items():
            setattr(course, key, value)
        course.save()
        return course
    
    @staticmethod
    def delete(course: Course) -> bool:
        """Delete a course."""
        course.delete()
        return True
    
    # ==================== STATISTICS ====================
    
    @staticmethod
    def get_stats_for_tutor(user) -> dict:
        """Get course statistics for a tutor."""
        queryset = Course.objects.filter(tutor=user)
        return CourseRepository._calculate_stats(queryset)
    
    @staticmethod
    def get_stats_for_training_partner(training_partner) -> dict:
        """Get course statistics for a training partner."""
        queryset = Course.objects.filter(training_partner=training_partner)
        return CourseRepository._calculate_stats(queryset)
    
    @staticmethod
    def _calculate_stats(queryset: QuerySet) -> dict:
        """Calculate statistics for a queryset."""
        return {
            'total_courses': queryset.count(),
            'published_courses': queryset.filter(is_published=True).count(),
            'draft_courses': queryset.filter(is_draft=True).count(),
            'pending_approval': queryset.filter(approval_status='pending_approval').count(),
            'featured_courses': queryset.filter(is_featured=True).count(),
            'average_rating': queryset.aggregate(avg=Avg('rating'))['avg'] or 0,
        }
    
    # ==================== INCREMENT OPERATIONS ====================
    
    @staticmethod
    def increment_view_count(course: Course) -> None:
        """Increment course view count."""
        course.view_count += 1
        course.save(update_fields=['view_count'])
    
    @staticmethod
    def increment_enrollment_count(course: Course) -> None:
        """Increment course enrollment count."""
        course.enrollment_count += 1
        course.save(update_fields=['enrollment_count', 'last_enrollment'])
    
    @staticmethod
    def update_rating(course: Course, rating: float, total_reviews: int) -> None:
        """Update course rating and total reviews count."""
        course.rating = rating
        course.total_reviews = total_reviews
        course.save(update_fields=['rating', 'total_reviews'])
    
    @staticmethod
    def get_approved_reviews(course: Course) -> QuerySet:
        """Get all approved reviews for a course."""
        return CourseReview.objects.filter(
            enrollment__course=course,
            is_approved=True
        )
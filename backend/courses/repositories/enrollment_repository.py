"""
Enrollment Repository - All database operations for Enrollment model.

Single Responsibility: ONLY database queries, NO business logic.
"""
from typing import Optional
from django.db.models import QuerySet
from django.utils import timezone

from ..models import Enrollment, Course


class EnrollmentRepository:
    """
    Repository for Enrollment database operations.
    
    All Enrollment.objects calls should go through this class.
    """
    
    # ==================== READ OPERATIONS ====================
    
    @staticmethod
    def find_by_id(enrollment_id) -> Optional[Enrollment]:
        """Find enrollment by ID."""
        try:
            return Enrollment.objects.select_related(
                'learner', 'course', 'course__training_partner'
            ).get(id=enrollment_id)
        except Enrollment.DoesNotExist:
            return None
    
    @staticmethod
    def find_by_learner(user) -> QuerySet:
        """Get all enrollments for a learner."""
        return Enrollment.objects.filter(
            learner=user
        ).select_related('course', 'course__training_partner', 'course__tutor')
    
    @staticmethod
    def find_by_learner_and_course(user, course: Course) -> Optional[Enrollment]:
        """Check if a learner is enrolled in a specific course."""
        try:
            return Enrollment.objects.select_related(
                'course', 'learner'
            ).get(learner=user, course=course)
        except Enrollment.DoesNotExist:
            return None
    
    @staticmethod
    def find_by_course(course: Course) -> QuerySet:
        """Get all enrollments for a course."""
        return Enrollment.objects.filter(
            course=course
        ).select_related('learner')
    
    @staticmethod
    def find_by_tutor(user) -> QuerySet:
        """Get all enrollments for courses owned by a tutor."""
        return Enrollment.objects.filter(
            course__tutor=user
        ).select_related('course', 'learner')
    
    @staticmethod
    def find_by_training_partner(training_partner) -> QuerySet:
        """Get all enrollments for a training partner's courses."""
        return Enrollment.objects.filter(
            course__training_partner=training_partner
        ).select_related('course', 'learner')
    
    @staticmethod
    def find_pending_approval(training_partner) -> QuerySet:
        """Get enrollments pending approval for a training partner."""
        return Enrollment.objects.filter(
            course__training_partner=training_partner,
            status='pending_approval'
        ).select_related('course', 'learner')
    
    @staticmethod
    def get_enrolled_course_ids(user) -> list:
        """Get list of course IDs a learner is enrolled in."""
        return list(
            Enrollment.objects.filter(learner=user).values_list('course_id', flat=True)
        )
    
    @staticmethod
    def is_enrolled(user, course: Course) -> bool:
        """Check if user is enrolled in a course."""
        return Enrollment.objects.filter(learner=user, course=course).exists()
    
    # ==================== WRITE OPERATIONS ====================
    
    @staticmethod
    def create(data: dict) -> Enrollment:
        """Create a new enrollment."""
        return Enrollment.objects.create(**data)
    
    @staticmethod
    def update(enrollment: Enrollment, data: dict) -> Enrollment:
        """Update enrollment with given data."""
        for key, value in data.items():
            setattr(enrollment, key, value)
        enrollment.save()
        return enrollment
    
    @staticmethod
    def approve(enrollment: Enrollment, admin_user, notes: str = None) -> Enrollment:
        """Approve an enrollment."""
        enrollment.status = 'approved'
        enrollment.approved_by = admin_user
        enrollment.approval_date = timezone.now()
        enrollment.start_date = timezone.now()
        if notes:
            enrollment.admin_notes = notes
        enrollment.save()
        return enrollment
    
    @staticmethod
    def reject(enrollment: Enrollment, admin_user, reason: str = None) -> Enrollment:
        """Reject an enrollment."""
        enrollment.status = 'rejected'
        enrollment.approved_by = admin_user
        if reason:
            enrollment.rejection_reason = reason
        enrollment.save()
        return enrollment
    
    # ==================== STATISTICS ====================
    
    @staticmethod
    def get_total_count() -> int:
        """Get total enrollment count."""
        return Enrollment.objects.count()
    
    @staticmethod
    def get_count_by_course(course: Course) -> int:
        """Get enrollment count for a specific course."""
        return Enrollment.objects.filter(course=course).count()
    
    @staticmethod
    def get_count_by_status(status: str) -> int:
        """Get enrollment count by status."""
        return Enrollment.objects.filter(status=status).count()

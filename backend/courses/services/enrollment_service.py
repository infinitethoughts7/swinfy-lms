"""
Enrollment Service - Business logic for Enrollment operations.

Single Responsibility: Enrollment business rules only.
"""
from typing import Tuple, Optional
from django.utils import timezone

from ..repositories.enrollment_repository import EnrollmentRepository
from ..repositories.course_repository import CourseRepository
from ..models import Enrollment, Course


class EnrollmentService:
    """
    Service for Enrollment business logic.
    
    Handles: enroll, approve, reject, check access.
    """
    
    def __init__(self):
        self.enrollment_repo = EnrollmentRepository()
        self.course_repo = CourseRepository()
    
    # ==================== ENROLLMENT CREATION ====================
    
    def enroll_learner(self, learner, course: Course) -> Tuple[bool, Optional[Enrollment], Optional[str]]:
        """
        Enroll a learner in a course (learner-initiated).
        
        Business Rules:
        - Learner cannot already be enrolled
        - Course must be published
        - Course must have capacity (if max_enrollments set)
        
        Returns:
            Tuple: (success, enrollment, error_message)
        """
        # Rule: Check if already enrolled
        if self.enrollment_repo.is_enrolled(learner, course):
            return False, None, "You are already enrolled in this course."
        
        # Rule: Course must be published
        if not course.is_published:
            return False, None, "This course is not available for enrollment."
        
        # Rule: Check capacity
        if course.max_enrollments:
            current_count = self.enrollment_repo.get_count_by_course(course)
            if current_count >= course.max_enrollments:
                return False, None, "This course is full."
        
        # Create enrollment (pending approval)
        enrollment = self.enrollment_repo.create({
            'learner': learner,
            'course': course,
            'enrollment_type': 'learner_requested',
            'status': 'pending_approval'
        })
        
        return True, enrollment, None
    
    def create_admin_enrollment(self, learner, course: Course, admin_user, auto_approve: bool = True) -> Tuple[bool, Optional[Enrollment], Optional[str]]:
        """
        Create enrollment by admin (can be auto-approved).
        
        Business Rules:
        - Admin must be from same training partner as course
        - Learner cannot already be enrolled
        
        Returns:
            Tuple: (success, enrollment, error_message)
        """
        # Rule: Admin must be from same org
        if hasattr(admin_user, 'organization') and admin_user.organization != course.training_partner:
            return False, None, "You can only enroll learners in your organization's courses."
        
        # Rule: Check if already enrolled
        if self.enrollment_repo.is_enrolled(learner, course):
            return False, None, "Learner is already enrolled in this course."
        
        # Create enrollment
        enrollment_data = {
            'learner': learner,
            'course': course,
            'enrollment_type': 'admin_created',
            'status': 'approved' if auto_approve else 'pending_approval',
        }
        
        if auto_approve:
            enrollment_data['approved_by'] = admin_user
            enrollment_data['approval_date'] = timezone.now()
            enrollment_data['start_date'] = timezone.now()
        
        enrollment = self.enrollment_repo.create(enrollment_data)
        
        # Increment course enrollment count
        if auto_approve:
            self.course_repo.increment_enrollment_count(course)
        
        return True, enrollment, None
    
    # ==================== APPROVAL ====================
    
    def approve_enrollment(self, enrollment: Enrollment, admin_user, notes: str = None) -> Tuple[bool, Optional[str]]:
        """
        Approve an enrollment.
        
        Business Rules:
        - Only admin can approve
        - Admin must be from same training partner
        - Enrollment must be pending
        
        Returns:
            Tuple: (success, error_message)
        """
        # Rule: Only admin can approve
        if admin_user.role != 'admin':
            return False, "Only admins can approve enrollments."
        
        # Rule: Must be from same org
        if hasattr(admin_user, 'organization') and admin_user.organization != enrollment.course.training_partner:
            return False, "You can only approve enrollments for your organization's courses."
        
        # Rule: Must be pending
        if enrollment.status != 'pending_approval':
            return False, f"Cannot approve enrollment with status: {enrollment.status}"
        
        # Approve
        self.enrollment_repo.approve(enrollment, admin_user, notes)
        
        # Increment course enrollment count
        self.course_repo.increment_enrollment_count(enrollment.course)
        
        return True, None
    
    def reject_enrollment(self, enrollment: Enrollment, admin_user, reason: str = None) -> Tuple[bool, Optional[str]]:
        """
        Reject an enrollment.
        
        Returns:
            Tuple: (success, error_message)
        """
        # Rule: Only admin can reject
        if admin_user.role != 'admin':
            return False, "Only admins can reject enrollments."
        
        # Rule: Must be from same org
        if hasattr(admin_user, 'organization') and admin_user.organization != enrollment.course.training_partner:
            return False, "You can only reject enrollments for your organization's courses."
        
        # Rule: Must be pending
        if enrollment.status != 'pending_approval':
            return False, f"Cannot reject enrollment with status: {enrollment.status}"
        
        # Reject
        self.enrollment_repo.reject(enrollment, admin_user, reason)
        
        return True, None
    
    # ==================== ACCESS CHECKING ====================
    
    def can_access_course_content(self, user, course: Course) -> Tuple[bool, Optional[str]]:
        """
        Check if user can access course content.
        
        Returns:
            Tuple: (can_access, reason)
        """
        # Course owner always has access
        if course.tutor == user:
            return True, "Course owner"
        
        # Training partner admin has access
        if user.role == 'admin' and hasattr(user, 'organization'):
            if user.organization == course.training_partner:
                return True, "Training partner admin"
        
        # Learner must be enrolled and approved
        if user.role == 'learner':
            enrollment = self.enrollment_repo.find_by_learner_and_course(user, course)
            
            if not enrollment:
                return False, "Not enrolled in this course."
            
            if not enrollment.can_access_content:
                return False, "Enrollment not approved or payment pending."
            
            return True, "Enrolled learner"
        
        return False, "No access to this course."
    
    # ==================== RETRIEVAL ====================
    
    def get_enrollment(self, user, course: Course) -> Optional[Enrollment]:
        """Get enrollment for a user and course."""
        return self.enrollment_repo.find_by_learner_and_course(user, course)
    
    def get_learner_enrollments(self, user):
        """Get all enrollments for a learner."""
        return self.enrollment_repo.find_by_learner(user)
    
    def get_pending_enrollments(self, training_partner):
        """Get all pending enrollments for a training partner."""
        return self.enrollment_repo.find_pending_approval(training_partner)
    
    def get_enrollment_status(self, user, course: Course) -> dict:
        """Get enrollment status for a user and course."""
        enrollment = self.enrollment_repo.find_by_learner_and_course(user, course)
        
        if enrollment:
            return {
                'enrolled': True,
                'status': enrollment.status,
                'payment_status': enrollment.payment_status,
                'enrolled_at': enrollment.created_at,
                'can_access': enrollment.can_access_content
            }
        
        return {
            'enrolled': False,
            'status': 'not_enrolled',
            'payment_status': None,
            'enrolled_at': None,
            'can_access': False
        }

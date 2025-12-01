"""
Course Service - Business logic for Course operations.

Single Responsibility: ONLY business rules, NO HTTP handling, NO direct DB queries.
Uses repositories for database operations.
"""
from typing import Tuple, Optional
from django.utils import timezone
from django.db.models import Avg

from ..repositories.course_repository import CourseRepository
from ..models import Course


class CourseService:
    """
    Service for Course business logic.
    
    Views call this service → Service calls repositories.
    """
    
    def __init__(self):
        self.course_repo = CourseRepository()
    
    # ==================== COURSE RETRIEVAL ====================
    
    def get_published_courses(self):
        """Get all published courses."""
        return self.course_repo.get_published()
    
    def get_featured_courses(self):
        """Get featured courses."""
        return self.course_repo.get_featured()
    
    def get_course_by_slug(self, slug: str, published_only: bool = True) -> Optional[Course]:
        """Get a course by slug."""
        if published_only:
            return self.course_repo.find_by_slug_published(slug)
        return self.course_repo.find_by_slug(slug)
    
    def get_courses_by_tutor(self, user):
        """Get all courses created by a tutor."""
        return self.course_repo.find_by_tutor(user)
    
    def get_courses_by_training_partner(self, training_partner):
        """Get all courses for a training partner."""
        return self.course_repo.find_by_training_partner(training_partner)
    
    # ==================== COURSE CREATION ====================
    
    def create_course(self, data: dict, tutor) -> Tuple[bool, Optional[Course], Optional[str]]:
        """
        Create a new course.
        
        Args:
            data: Course data from serializer
            tutor: User creating the course
            
        Returns:
            Tuple: (success, course, error_message)
        """
        try:
            # Set tutor
            data['tutor'] = tutor
            
            # Set training partner from tutor if not provided
            if not data.get('training_partner') and hasattr(tutor, 'organization'):
                data['training_partner'] = tutor.organization
            
            course = self.course_repo.create(data)
            return True, course, None
            
        except Exception as e:
            return False, None, str(e)
    
    # ==================== COURSE APPROVAL ====================
    
    def approve_course(self, course: Course, admin_user, notes: str = None) -> Tuple[bool, Optional[str]]:
        """
        Approve a course by training partner admin.
        
        Business Rules:
        - Only admin role can approve
        - Admin must belong to same training partner as course
        - Course status changes to 'approved'
        
        Args:
            course: Course to approve
            admin_user: Admin performing approval
            notes: Optional approval notes
            
        Returns:
            Tuple: (success, error_message)
        """
        # Business Rule: Validate admin role
        if admin_user.role != 'admin':
            return False, "Only admins can approve courses."
        
        # Business Rule: Admin must be from same training partner
        if hasattr(admin_user, 'organization') and admin_user.organization != course.training_partner:
            return False, "You can only approve courses from your organization."
        
        # Perform approval
        course.is_approved_by_training_partner = True
        course.training_partner_admin_approved_by = admin_user
        course.approval_status = 'approved'
        
        if notes:
            course.approval_notes = notes
        
        course.save()
        
        return True, None
    
    def reject_course(self, course: Course, admin_user, reason: str = None) -> Tuple[bool, Optional[str]]:
        """
        Reject a course.
        
        Args:
            course: Course to reject
            admin_user: Admin performing rejection
            reason: Rejection reason
            
        Returns:
            Tuple: (success, error_message)
        """
        # Business Rule: Validate admin role
        if admin_user.role not in ['admin', 'super_admin']:
            return False, "Only admins can reject courses."
        
        # Perform rejection
        course.approval_status = 'rejected'
        
        if reason:
            course.approval_notes = reason
        
        course.save()
        
        return True, None
    
    # ==================== COURSE PUBLISHING ====================
    
    def publish_course(self, course: Course) -> Tuple[bool, Optional[str]]:
        """
        Publish an approved course.
        
        Business Rules:
        - Course must be approved first
        - Course must not be a draft
        
        Returns:
            Tuple: (success, error_message)
        """
        # Business Rule: Must be approved
        if not course.is_approved_by_training_partner:
            return False, "Course must be approved before publishing."
        
        # Business Rule: Must not be draft
        if course.is_draft:
            return False, "Cannot publish a draft course."
        
        course.is_published = True
        course.published_at = timezone.now()
        course.save()
        
        return True, None
    
    def unpublish_course(self, course: Course) -> Tuple[bool, Optional[str]]:
        """Unpublish a course."""
        course.is_published = False
        course.save()
        return True, None
    
    # ==================== COURSE STATISTICS ====================
    
    def get_stats_for_user(self, user) -> dict:
        """
        Get course statistics based on user role.
        
        Args:
            user: User requesting stats
            
        Returns:
            dict: Course statistics
        """
        if user.role == 'admin' and hasattr(user, 'organization') and user.organization:
            return self.course_repo.get_stats_for_training_partner(user.organization)
        elif user.role == 'tutor':
            return self.course_repo.get_stats_for_tutor(user)
        else:
            return {}
    
    # ==================== VIEW COUNT ====================
    
    def increment_view_count(self, course: Course) -> None:
        """Increment course view count."""
        self.course_repo.increment_view_count(course)
    
    # ==================== RATING ====================
    
    def update_rating(self, course: Course) -> None:
        """
        Update course rating based on approved reviews.
        
        Business Logic:
        - Calculate average rating from approved reviews
        - Update course.rating and course.total_reviews
        """
        reviews = self.course_repo.get_approved_reviews(course)
        
        if reviews.exists():
            avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
            total_reviews = reviews.count()
            
            self.course_repo.update_rating(
                course,
                round(avg_rating, 2),
                total_reviews
            )
        else:
            # No reviews, reset to defaults
            self.course_repo.update_rating(course, 0.00, 0)
    
    # ==================== ACCESS CONTROL ====================
    
    def can_user_view(self, course: Course, user) -> Tuple[bool, str]:
        """
        Check if a user can view this course.
        
        Business Rules:
        - Course must be published and approved
        - Public courses: anyone can view
        - Private courses: only users from same organization
        
        Returns:
            Tuple: (can_view, reason)
        """
        # Rule: Must be published and approved
        if not (course.is_published and course.is_approved_by_training_partner):
            return False, "Course is not published or not approved."
        
        # Rule: Public courses - anyone can view
        if not course.is_private:
            return True, "Public course"
        
        # Rule: Private courses - check organization match
        if not user.is_authenticated:
            return False, "Private course requires authentication."
        
        if hasattr(user, 'organization') and user.organization:
            if user.organization == course.training_partner:
                return True, "Same organization"
            else:
                return False, "Private course - organization mismatch"
        
        return False, "User organization not found"

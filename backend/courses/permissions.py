"""
Custom permissions for the courses app - using model methods for business logic.
"""
from rest_framework import permissions


class IsCourseOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow course owners to edit their courses.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the course owner (tutor)
        return obj.tutor == request.user


class IsTrainingPartnerAdmin(permissions.BasePermission):
    """
    Permission to allow only training partner admins to perform certain actions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'admin' and
            hasattr(request.user, 'organization') and
            request.user.organization is not None
        )


class IsTutorOrAdmin(permissions.BasePermission):
    """
    Permission to allow tutors and admins to perform certain actions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['tutor', 'admin']
        )


class IsStudent(permissions.BasePermission):
    """
    Permission to allow only students to perform certain actions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'student'
        )


class IsKnowledgePartnerInstructor(permissions.BasePermission):
    """
    Permission to allow only KP instructors to perform certain actions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'knowledge_partner_instructor'
        )


class CanApproveCourse(permissions.BasePermission):
    """
    Permission to allow course approval - only training partner admins can approve.
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Only training partner admin can approve courses from their organization
        return (
            request.user.role == 'admin' and
            hasattr(request.user, 'organization') and
            request.user.organization == obj.training_partner
        )


class CanViewCourse(permissions.BasePermission):
    """
    Permission to determine if user can view a course - uses model method.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.can_user_view(request.user)


class CanEnrollInCourse(permissions.BasePermission):
    """
    Permission to determine if user can request enrollment - uses model method.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.can_user_enroll(request.user)


class CanAccessCourseContent(permissions.BasePermission):
    """
    Permission to determine if user can access course content.
    """
    
    def has_object_permission(self, request, view, obj):
        # Course owner can access content
        if obj.tutor == request.user:
            return True
        
        # Training partner admin can access content from their organization
        if (request.user.is_authenticated and
            request.user.role == 'admin' and
            hasattr(request.user, 'organization') and
            request.user.organization == obj.training_partner):
            return True
        
        # For students, check if they have an approved enrollment
        if request.user.is_authenticated and request.user.role == 'student':
            from .models import Enrollment
            try:
                enrollment = Enrollment.objects.get(student=request.user, course=obj)
                return enrollment.can_access_content
            except Enrollment.DoesNotExist:
                return False
        
        return False


class CanManageEnrollment(permissions.BasePermission):
    """
    Permission to manage enrollments (approve, reject, create).
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only training partner admins can manage enrollments
        return (
            request.user.role == 'admin' and
            hasattr(request.user, 'organization')
        )
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Admin can only manage enrollments for courses from their training partner
        if hasattr(obj, 'course'):  # Enrollment object
            course = obj.course
        else:  # Course object
            course = obj
        
        return (
            request.user.role == 'admin' and
            hasattr(request.user, 'organization') and
            request.user.organization == course.training_partner
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'student'):  # For enrollment objects
            return obj.student == request.user
        return False


class CanManageCourse(permissions.BasePermission):
    """
    Permission to manage course (create, update, delete).
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Use model method for course creation permission
        return request.user.can_create_courses
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Course owner can manage their own courses
        if obj.tutor == request.user:
            return True
        
        # Training partner admin can manage courses from their organization
        if (request.user.role == 'admin' and
            hasattr(request.user, 'organization') and
            request.user.organization == obj.training_partner):
            return True
        
        return False


class CanCreateCourse(permissions.BasePermission):
    """
    Permission to create courses - uses model method.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Use the model method for course creation logic
        return request.user.can_create_courses


class CanManageOrganization(permissions.BasePermission):
    """
    Permission to manage training partner organization - uses model method.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Use the model method for organization management logic
        return request.user.can_manage_organization


# Utility permission mixins for common patterns
class OrganizationMemberOnly(permissions.BasePermission):
    """
    Base permission for organization-specific access.
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Get the training partner from the object
        training_partner = None
        if hasattr(obj, 'training_partner'):
            training_partner = obj.training_partner
        elif hasattr(obj, 'course'):
            training_partner = obj.course.training_partner
        elif hasattr(obj, 'organization'):
            training_partner = obj.organization
        
        if not training_partner:
            return False
        
        # Check if user belongs to the same organization
        return (
            hasattr(request.user, 'organization') and
            request.user.organization == training_partner
        )


class StudentEnrollmentAccess(permissions.BasePermission):
    """
    Permission for students to access their own enrollment data.
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Students can only access their own enrollments
        if request.user.role == 'student':
            if hasattr(obj, 'student'):  # Enrollment object
                return obj.student == request.user
            elif hasattr(obj, 'enrollment'):  # Related object
                return obj.enrollment.student == request.user
        
        # Admins can access enrollments from their organization
        if request.user.role == 'admin':
            if hasattr(obj, 'course'):
                return (
                    hasattr(request.user, 'organization') and
                    request.user.organization == obj.course.training_partner
                )
        
        return False
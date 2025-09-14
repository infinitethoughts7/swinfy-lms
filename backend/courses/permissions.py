"""
Custom permissions for the courses app.
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


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission to allow only super admins to perform certain actions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'super_admin'
        )


class IsTutorOrAdmin(permissions.BasePermission):
    """
    Permission to allow tutors and admins to perform certain actions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['tutor', 'admin', 'super_admin']
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


class CanApproveCourse(permissions.BasePermission):
    """
    Permission to allow course approval based on user role and course status.
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Super admin can approve any course
        if request.user.role == 'super_admin':
            return True
        
        # Training partner admin can approve courses from their organization
        if (request.user.role == 'admin' and 
            hasattr(request.user, 'organization') and
            request.user.organization == obj.training_partner):
            return True
        
        return False


class CanViewCourse(permissions.BasePermission):
    """
    Permission to determine if user can view a course.
    """
    
    def has_object_permission(self, request, view, obj):
        # Published courses can be viewed by anyone
        if obj.is_published:
            return True
        
        # Course owner can view their own courses
        if obj.tutor == request.user:
            return True
        
        # Training partner admin can view courses from their organization
        if (request.user.is_authenticated and
            request.user.role == 'admin' and
            hasattr(request.user, 'organization') and
            request.user.organization == obj.training_partner):
            return True
        
        # Super admin can view any course
        if (request.user.is_authenticated and
            request.user.role == 'super_admin'):
            return True
        
        return False


class CanEnrollInCourse(permissions.BasePermission):
    """
    Permission to determine if user can enroll in a course.
    """
    
    def has_object_permission(self, request, view, obj):
        # User must be authenticated and be a student
        if not (request.user.is_authenticated and request.user.role == 'student'):
            return False
        
        # Course must be published and approved
        if not (obj.is_published and obj.is_fully_approved):
            return False
        
        # Check if user is already enrolled
        from .models import Enrollment
        if Enrollment.objects.filter(student=request.user, course=obj).exists():
            return False
        
        return True


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
        
        # Super admin can access any content
        if (request.user.is_authenticated and
            request.user.role == 'super_admin'):
            return True
        
        # Check if user is enrolled in the course
        if request.user.is_authenticated and request.user.role == 'student':
            from .models import Enrollment
            return Enrollment.objects.filter(
                student=request.user, 
                course=obj, 
                status__in=['active', 'completed']
            ).exists()
        
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object
        return obj.user == request.user


class CanManageCourse(permissions.BasePermission):
    """
    Permission to manage course (create, update, delete).
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Tutors can manage their own courses
        if request.user.role == 'tutor':
            return True
        
        # Admins can manage courses from their training partner
        if request.user.role == 'admin':
            return hasattr(request.user, 'organization')
        
        # Super admins can manage any course
        if request.user.role == 'super_admin':
            return True
        
        return False
    
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
        
        # Super admin can manage any course
        if request.user.role == 'super_admin':
            return True
        
        return False

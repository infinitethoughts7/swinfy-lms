from rest_framework import permissions


class IsKnowledgePartnerAdmin(permissions.BasePermission):
    """
    Custom permission to only allow knowledge partner admins to access certain views.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'knowledge_partner_admin'
        )

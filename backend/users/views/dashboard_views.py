"""
Dashboard Views

Provides dashboard statistics for different user roles.
Uses services for business logic, NO direct database queries.
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from users.services import profile_service, kp_service


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics for different user roles.
    
    Returns role-specific stats:
    - Learners: enrollments, courses, progress
    - Instructors: courses created, students, revenue
    - Knowledge Partners: instructors, courses, students
    """
    user = request.user
    
    if user.role == 'knowledge_partner':
        # KP Admin dashboard stats
        kp_profile = profile_service.get_kp_profile(user)
        
        if not kp_profile:
            return Response({
                'role': 'knowledge_partner',
                'error': 'Knowledge Partner profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        stats = kp_service.get_kp_dashboard_stats(kp_profile)
        stats['role'] = 'knowledge_partner'
        
        return Response(stats)
    
    elif user.role == 'knowledge_partner_instructor':
        # Instructor dashboard stats
        # TODO: Implement after courses app refactoring
        return Response({
            'role': 'knowledge_partner_instructor',
            'message': 'Instructor dashboard will be implemented after courses app refactoring',
            'is_approved': user.is_approved,
        })
    
    elif user.role == 'learner':
        # Learner dashboard stats
        # TODO: Implement after courses app refactoring
        return Response({
            'role': 'learner',
            'message': 'Learner dashboard will be implemented after courses app refactoring',
        })
    
    else:
        return Response({
            'role': user.role,
            'message': 'Dashboard not available for this role'
        })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_knowledge_partners(request):
    """Get list of active knowledge partners for frontend dropdown."""
    from users.serializers import KPProfileSerializer
    
    # Get all active KPs via service
    knowledge_partners = profile_service.get_all_active_kps()
    
    # Serialize and return
    serializer = KPProfileSerializer(knowledge_partners, many=True)
    return Response(serializer.data)


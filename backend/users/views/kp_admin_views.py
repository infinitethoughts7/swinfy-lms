"""
Knowledge Partner Admin Views

Handles KP-specific operations: instructor management, learner tracking.
Uses services for business logic, NO direct database queries.
"""

import logging
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from users.models import User, KPProfile, KPInstructorProfile
from users.permissions import IsKnowledgePartnerAdmin
from users.services import kp_service, email_service, user_service, profile_service
from users.repositories import kp_profile_repository, instructor_profile_repository
from users.serializers import (
    KPInstructorCreateSerializer,
    KPInstructorListSerializer,
    KPInstructorDetailSerializer,
    KPInstructorUpdateSerializer,
)

logger = logging.getLogger(__name__)


class KPInstructorListCreateView(APIView):
    """List instructors and create new instructor (user + profile)."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]

    def get(self, request):
        """Get list of instructors for this KP."""
        # Get KP profile for current user
        kp_profile = profile_service.get_kp_profile(request.user)
        
        if not kp_profile:
            return Response({
                'detail': 'Knowledge Partner profile not found'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get instructors (with optional search)
        search = request.query_params.get('search')
        instructors = kp_service.get_instructors(kp_profile, search)
        
        # Filter by availability if requested
        is_available = request.query_params.get('is_available')
        if is_available in ['true', 'false']:
            instructors = instructors.filter(is_available=(is_available == 'true'))
        
        # Serialize and return
        serializer = KPInstructorListSerializer(instructors, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create new instructor via serializer."""
        # Validate input
        serializer = KPInstructorCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Create instructor (serializer handles user + profile creation)
        user = serializer.save()
        
        # Get the profile that was created by the serializer
        profile = instructor_profile_repository.get_by_user(user)
        
        # Send invitation email with login credentials
        # Always send email if temp_password is available (whether generated or provided)
        if hasattr(user, '_temp_password') and user._temp_password:
            kp_profile = profile.knowledge_partner if profile else None
            if kp_profile:
                try:
                    email_service.send_instructor_invitation(user, kp_profile.name, user._temp_password)
                    logger.info(f"Invitation email sent to instructor: {user.email}")
                except Exception as e:
                    # Log error but don't fail the creation
                    logger.error(f"Failed to send invitation email to {user.email}: {str(e)}")
        
        # Serialize and return
        detail_serializer = KPInstructorDetailSerializer(profile)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class KPInstructorDetailView(APIView):
    """Retrieve, update, or delete an instructor."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]

    def get_object(self, pk):
        """Get instructor profile, ensuring KP admin access."""
        # Get KP profile for current user
        kp_profile = profile_service.get_kp_profile(self.request.user)
        if not kp_profile:
            return None
        
        # Get instructor profile
        profile = instructor_profile_repository.get_by_id(pk)
        if not profile:
            return None
        
        # Verify access
        if not kp_service.verify_kp_admin_access(self.request.user, profile.knowledge_partner):
            return None
        
        return profile

    def get(self, request, id):
        """Get instructor details."""
        profile = self.get_object(id)
        if not profile:
            return Response({
                'detail': 'Instructor not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = KPInstructorDetailSerializer(profile)
        return Response(serializer.data)

    def patch(self, request, id):
        """Update instructor profile."""
        profile = self.get_object(id)
        if not profile:
            return Response({
                'detail': 'Instructor not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Validate input
        serializer = KPInstructorUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update via service
        success, message = kp_service.update_instructor(profile, **serializer.validated_data)
        
        if not success:
            return Response({
                'success': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Return updated data
        detail_serializer = KPInstructorDetailSerializer(profile)
        return Response(detail_serializer.data)

    def delete(self, request, id):
        """Delete instructor (both profile and user)."""
        profile = self.get_object(id)
        if not profile:
            return Response({
                'detail': 'Instructor not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Delete via service
        success, message = kp_service.delete_instructor(profile)
        
        if not success:
            return Response({
                'success': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class KPLearnerListView(APIView):
    """List learners enrolled in courses created by the Knowledge Partner."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]

    def get(self, request):
        """
        Get learners enrolled in KP courses.
        
        NOTE: This view depends on the courses app.
        Implementation deferred until courses models are refactored.
        """
        # Get KP profile
        kp_profile = profile_service.get_kp_profile(request.user)
        if not kp_profile:
            return Response({
                'detail': 'Knowledge Partner profile not found'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # TODO: Implement learner listing using courses app
        # This requires accessing Course and Enrollment models
        # which should also follow clean architecture
        
        return Response({
            'message': 'Learner listing will be implemented after courses app refactoring',
            'kp_name': kp_profile.name,
            'learners': []
        })


class KPDashboardView(APIView):
    """Get dashboard statistics for Knowledge Partner."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]
    
    def get(self, request):
        """Get KP dashboard stats."""
        # Get KP profile
        kp_profile = profile_service.get_kp_profile(request.user)
        if not kp_profile:
            return Response({
                'detail': 'Knowledge Partner profile not found'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get dashboard stats via service
        stats = kp_service.get_kp_dashboard_stats(kp_profile)
        
        return Response(stats)


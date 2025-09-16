from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import base64

from ..models import User, KPProfile
from ..permissions import IsKnowledgePartnerAdmin
from ..serializers.profile_serializers import KPProfileSerializer


class KPProfileView(generics.RetrieveUpdateAPIView):
    """Get and update KP profile for the authenticated admin."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]
    serializer_class = KPProfileSerializer
    
    def get_object(self):
        """Get or create KP profile for the authenticated user."""
        profile, created = KPProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'name': f"{self.request.user.full_name}'s Organization",
                'kp_admin_name': self.request.user.full_name,
                'kp_admin_email': self.request.user.email,
            }
        )
        return profile
    


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerAdmin])
def upload_logo(request):
    """Upload organization logo."""
    try:
        try:
            profile = KPProfile.objects.get(user=request.user)
        except KPProfile.DoesNotExist:
            return Response({'error': 'KP Profile not found. Please create a profile first.'}, status=status.HTTP_404_NOT_FOUND)
        
        if 'logo' not in request.FILES:
            return Response({'error': 'No logo file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        logo_file = request.FILES['logo']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if logo_file.content_type not in allowed_types:
            return Response({'error': 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 5MB)
        if logo_file.size > 5 * 1024 * 1024:
            return Response({'error': 'File too large. Maximum size is 5MB.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete old logo if exists
        if profile.logo:
            try:
                default_storage.delete(profile.logo.name)
            except:
                pass
        
        # Save new logo
        profile.logo = logo_file
        profile.save()
        
        return Response({
            'message': 'Logo uploaded successfully',
            'logo_url': profile.logo.url if profile.logo else None
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': f'Failed to upload logo: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerAdmin])
def remove_logo(request):
    """Remove organization logo."""
    try:
        try:
            profile = KPProfile.objects.get(user=request.user)
        except KPProfile.DoesNotExist:
            return Response({'error': 'KP Profile not found. Please create a profile first.'}, status=status.HTTP_404_NOT_FOUND)
        
        if profile.logo:
            try:
                default_storage.delete(profile.logo.name)
            except:
                pass
            
            profile.logo = None
            profile.save()
        
        return Response({'message': 'Logo removed successfully'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': f'Failed to remove logo: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerAdmin])
def profile_stats(request):
    """Get profile statistics for the KP admin."""
    try:
        profile = get_object_or_404(KPProfile, user=request.user)
        
        # Get basic stats
        from courses.models import Course
        from users.models import User
        
        total_courses = Course.objects.filter(training_partner=profile).count()
        approved_courses = Course.objects.filter(training_partner=profile, approval_status='approved').count()
        pending_courses = Course.objects.filter(training_partner=profile, approval_status='pending_approval').count()
        total_instructors = User.objects.filter(role='knowledge_partner_instructor').count()
        
        stats = {
            'organization_name': profile.name,
            'organization_type': profile.get_type_display(),
            'is_verified': profile.is_verified,
            'is_active': profile.is_active,
            'total_courses': total_courses,
            'approved_courses': approved_courses,
            'pending_courses': pending_courses,
            'total_instructors': total_instructors,
            'created_at': profile.created_at.isoformat(),
            'updated_at': profile.updated_at.isoformat(),
        }
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': f'Failed to fetch stats: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

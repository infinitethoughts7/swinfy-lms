"""
Profile Management Views - Clean Architecture

Handles user profile operations including viewing, updating, and completion.
Uses services for all business logic - NO direct database queries.
"""

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework.decorators import api_view, permission_classes

from users.models import User, LearnerProfile, KPInstructorProfile, KPProfile
from users.permissions import IsKnowledgePartnerAdmin
from users.services import email_service, user_service, profile_service, kp_service
from users.repositories import kp_profile_repository
from users.serializers import (
    UserProfileSerializer,
    ChangePasswordSerializer,
    ProfileCompletionSerializer,
    LearnerProfileSerializer,
    InstructorProfileSerializer,
    KPProfileSerializer,
)

class UserProfileView(APIView):
    """User profile management view."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user profile."""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update user profile."""
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change user password view."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Change user password via service."""
        serializer = ChangePasswordSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Change password via service
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        success, message = user_service.change_password(
            request.user, 
            old_password, 
            new_password
        )
        
        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send password changed email notification via service
        email_service.send_password_changed_email(request.user)
        
        return Response(
            {'message': message},
            status=status.HTTP_200_OK
        )


class ProfileCompletionView(APIView):
    """Handle profile completion after registration with skip option."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get profile completion form fields based on user role."""
        user = request.user
        
        # Check if user already has a profile
        has_profile = False
        profile_data = {}
        
        if user.role == 'learner':
            try:
                profile = user.learner_profile
                has_profile = True
                profile_data = LearnerProfileSerializer(profile).data
            except:
                has_profile = False
                
        elif user.role == 'knowledge_partner_instructor':
            try:
                profile = user.instructor_profile
                has_profile = True
                profile_data = InstructorProfileSerializer(profile).data
            except:
                has_profile = False
                
        elif user.role == 'knowledge_partner':
            has_profile = False
            profile_data = {}
        
        # Return role-specific form structure
        response_data = {
            'user_role': user.role,
            'has_profile': has_profile,
            'profile_data': profile_data if has_profile else {},
            'required_fields': self._get_required_fields(user.role),
            'optional_fields': self._get_optional_fields(user.role),
            'can_skip': True
        }
        
        return Response(response_data)
    
    def post(self, request):
        """Complete or skip profile completion."""
        serializer = ProfileCompletionSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            result = serializer.save()
            
            return Response({
                'success': True,
                'profile_created': result['profile_created'],
                'message': result['message'],
                'redirect_to_dashboard': True
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def _get_required_fields(self, role):
        """Get required fields for each role."""
        if role == 'learner':
            return []
        elif role == 'knowledge_partner_instructor':
            return ['bio', 'title', 'highest_education', 'specializations', 'technologies']
        elif role == 'knowledge_partner':
            return []
        return []
    
    def _get_optional_fields(self, role):
        """Get optional fields for each role."""
        if role == 'learner':
            return [
                'bio', 'profile_picture', 'date_of_birth', 'phone_number',
                'education_level', 'field_of_study', 'current_institution',
                'learning_goals'
            ]
        elif role == 'knowledge_partner_instructor':
            return [
                'profile_picture', 'date_of_birth', 'phone_number',
                'years_of_experience', 'hourly_rate', 'certifications',
                'languages_spoken', 'linkedin_url', 'github_url', 
                'portfolio_url', 'personal_website', 'is_available', 
                'availability_notes'
            ]
        elif role == 'knowledge_partner':
            return []
        return []


class UserProfileDetailView(APIView):
    """Get detailed user profile including role-specific profile data."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get complete user profile with role-specific data."""
        user = request.user
        
        # Get basic user data
        user_data = UserProfileSerializer(user).data
        
        # Get role-specific profile data
        profile_data = {}
        has_profile = False
        
        try:
            if user.role == 'learner':
                profile = user.learner_profile
                profile_data = LearnerProfileSerializer(profile).data
                has_profile = True
            elif user.role == 'knowledge_partner_instructor':
                profile = user.instructor_profile
                profile_data = InstructorProfileSerializer(profile).data
                has_profile = True
            elif user.role == 'knowledge_partner':
                has_profile = False
        except:
            has_profile = False
        
        return Response({
            'user': user_data,
            'profile': profile_data,
            'has_profile': has_profile
        })
    
    def patch(self, request):
        """Update user profile data."""
        try:
            user = request.user
            
            # Handle both JSON and FormData requests
            user_data = None
            profile_data = None
            
            if request.content_type and 'application/json' in request.content_type:
                if 'user_data' in request.data:
                    user_data = request.data['user_data']
                if 'profile_data' in request.data:
                    profile_data = request.data['profile_data']
            else:
                if 'user_data' in request.data:
                    import json
                    try:
                        user_data = json.loads(request.data['user_data'])
                    except (json.JSONDecodeError, TypeError):
                        user_data = request.data['user_data']
                if 'profile_data' in request.data:
                    import json
                    try:
                        profile_data = json.loads(request.data['profile_data'])
                    except (json.JSONDecodeError, TypeError):
                        profile_data = request.data['profile_data']
            
            # Update basic user data if provided
            if user_data:
                user_serializer = UserProfileSerializer(
                    user, 
                    data=user_data, 
                    partial=True
                )
                if user_serializer.is_valid():
                    user_serializer.save()
                else:
                    return Response({
                        'success': False,
                        'error': 'Failed to update user data',
                        'errors': {'user_data': user_serializer.errors}
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update role-specific profile data if provided
            if profile_data:
                try:
                    if user.role == 'learner':
                        try:
                            profile = LearnerProfile.objects.get(user=user)
                            created = False
                        except LearnerProfile.DoesNotExist:
                            profile = None
                            created = True
                        
                        serializer_data = profile_data.copy()
                        if 'profile_picture' in request.FILES:
                            serializer_data['profile_picture'] = request.FILES['profile_picture']
                        
                        if created:
                            profile_serializer = LearnerProfileSerializer(data=serializer_data)
                            if profile_serializer.is_valid():
                                profile_serializer.save(user=user)
                            else:
                                return Response({
                                    'success': False,
                                    'error': 'Failed to create profile data',
                                    'errors': {'profile_data': profile_serializer.errors}
                                }, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            profile_serializer = LearnerProfileSerializer(
                                profile,
                                data=serializer_data,
                                partial=True
                            )
                            if profile_serializer.is_valid():
                                profile_serializer.save()
                            else:
                                return Response({
                                    'success': False,
                                    'error': 'Failed to update profile data',
                                    'errors': {'profile_data': profile_serializer.errors}
                                }, status=status.HTTP_400_BAD_REQUEST)
                    
                    elif user.role == 'knowledge_partner_instructor':
                        try:
                            profile = user.instructor_profile
                            created = False
                        except:
                            profile = None
                            created = True
                        
                        if created:
                            profile_serializer = InstructorProfileSerializer(data=profile_data)
                            if profile_serializer.is_valid():
                                profile_serializer.save(user=user)
                            else:
                                return Response({
                                    'success': False,
                                    'error': 'Failed to update profile data',
                                    'errors': {'profile_data': profile_serializer.errors}
                                }, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            profile_serializer = InstructorProfileSerializer(
                                profile,
                                data=profile_data,
                                partial=True
                            )
                            if profile_serializer.is_valid():
                                profile_serializer.save()
                            else:
                                return Response({
                                    'success': False,
                                    'error': 'Failed to update profile data',
                                    'errors': {'profile_data': profile_serializer.errors}
                                }, status=status.HTTP_400_BAD_REQUEST)
                    
                except Exception as e:
                    import traceback
                    error_trace = traceback.format_exc()
                    print(f"Error updating profile data: {error_trace}")
                    return Response({
                        'success': False,
                        'error': 'Failed to update profile data',
                        'message': str(e),
                        'errors': {'profile_data': str(e)}
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'message': 'Profile updated successfully'
            })
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Error updating profile: {error_trace}")
            return Response({
                'success': False,
                'error': 'An error occurred while updating your profile',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ======================
# KP Profile Management Views
# ======================

class KPProfileView(APIView):
    """Knowledge Partner profile management view."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]
    
    def get(self, request):
        """Get KP profile for current user."""
        # Get KP profile via service
        kp_profile = profile_service.get_kp_profile(request.user)
        
        if not kp_profile:
            return Response({
                'success': False,
                'error': 'KP Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Serialize and return
        serializer = KPProfileSerializer(kp_profile)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update KP profile."""
        # Get KP profile via service
        kp_profile = profile_service.get_kp_profile(request.user)
        
        if not kp_profile:
            return Response({
                'success': False,
                'error': 'KP Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Validate input
        serializer = KPProfileSerializer(
            kp_profile,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save via serializer (handles user updates automatically)
        serializer.save()
        
        # Return updated profile
        updated_profile = profile_service.get_kp_profile(request.user)
        response_serializer = KPProfileSerializer(updated_profile)
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'profile': response_serializer.data
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerAdmin])
def upload_logo(request):
    """Upload logo for KP profile."""
    # Get KP profile via service
    kp_profile = profile_service.get_kp_profile(request.user)
    
    if not kp_profile:
        return Response({
            'success': False,
            'error': 'KP Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if logo file is provided
    if 'logo' not in request.FILES:
        return Response({
            'success': False,
            'error': 'No logo file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    logo_file = request.FILES['logo']
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if logo_file.content_type not in allowed_types:
        return Response({
            'success': False,
            'error': 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    if logo_file.size > max_size:
        return Response({
            'success': False,
            'error': 'File too large. Please upload an image smaller than 5MB.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Update logo via repository (direct file upload)
    try:
        kp_profile.logo = logo_file
        kp_profile.save(update_fields=['logo'])
        
        # Return updated profile
        serializer = KPProfileSerializer(kp_profile)
        return Response({
            'success': True,
            'message': 'Logo uploaded successfully',
            'profile': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to upload logo: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerAdmin])
def remove_logo(request):
    """Remove logo from KP profile."""
    # Get KP profile via service
    kp_profile = profile_service.get_kp_profile(request.user)
    
    if not kp_profile:
        return Response({
            'success': False,
            'error': 'KP Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Remove logo via repository
    try:
        if kp_profile.logo:
            kp_profile.logo.delete(save=False)  # Delete file from storage
        kp_profile.logo = None
        kp_profile.save(update_fields=['logo'])
        
        # Return updated profile
        serializer = KPProfileSerializer(kp_profile)
        return Response({
            'success': True,
            'message': 'Logo removed successfully',
            'profile': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to remove logo: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerAdmin])
def profile_stats(request):
    """Get profile statistics for KP."""
    # Get KP profile via service
    kp_profile = profile_service.get_kp_profile(request.user)
    
    if not kp_profile:
        return Response({
            'success': False,
            'error': 'KP Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get stats via service
    stats = kp_service.get_kp_dashboard_stats(kp_profile)
    
    # Add profile-specific stats
    stats.update({
        'profile': {
            'name': kp_profile.name,
            'type': kp_profile.get_type_display(),
            'is_verified': kp_profile.is_verified,
            'is_active': kp_profile.is_active,
            'has_logo': bool(kp_profile.logo),
            'created_at': kp_profile.created_at.isoformat(),
            'updated_at': kp_profile.updated_at.isoformat(),
        }
    })
    
    return Response(stats)
            
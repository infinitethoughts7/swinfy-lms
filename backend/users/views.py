from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from .models import User, TrainingPartner
from .serializers import (
    UserRegistrationSerializer, 
    UserProfileSerializer, 
    ChangePasswordSerializer,
    TrainingPartnerSerializer,
    ProfileCompletionSerializer,
    StudentProfileSerializer,
    TutorProfileSerializer,
    AdminProfileSerializer
)


class RegisterView(APIView):
    """User registration view that matches frontend form."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Handle user registration."""
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                # Generate tokens for immediate login (except for tutors waiting approval)
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                
                # Prepare response data
                response_data = {
                    'message': 'Registration successful!',
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'full_name': user.full_name,
                        'role': user.role,
                        'is_verified': user.is_verified,
                        'is_approved': user.is_approved,
                    }
                }
                
                # Add tokens for approved users
                if user.is_approved:
                    response_data['tokens'] = {
                        'access': str(access_token),
                        'refresh': str(refresh),
                    }
                else:
                    response_data['message'] = 'Registration successful! Waiting for admin approval.'
                
                # Add training partner info if applicable
                if user.training_partner:
                    response_data['user']['training_partner'] = {
                        'id': user.training_partner.id,
                        'name': user.training_partner.name,
                        'type': user.training_partner.type,
                    }
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
            except ValidationError as e:
                return Response(
                    {'error': 'Validation failed', 'details': e.message_dict},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {'error': 'Registration failed', 'details': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """Custom login view with additional user info."""
    
    def post(self, request, *args, **kwargs):
        """Handle login with email and password."""
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Account is disabled.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_approved:
            return Response(
                {'error': 'Account is pending approval.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Return user info with tokens
        return Response({
            'tokens': {
                'access': str(access_token),
                'refresh': str(refresh),
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'is_verified': user.is_verified,
                'training_partner': {
                    'id': user.training_partner.id,
                    'name': user.training_partner.name,
                    'type': user.training_partner.type,
                    } if user.training_partner else None,
                'can_create_courses': user.can_create_courses,
                'can_manage_training_partner': user.can_manage_training_partner,
            }
        }, status=status.HTTP_200_OK)


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
        """Change user password."""
        serializer = ChangePasswordSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {'message': 'Password changed successfully.'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_training_partners(request):
    """Get list of active training partners for frontend dropdown."""
    training_partners = TrainingPartner.objects.filter(is_active=True).order_by('name')
    serializer = TrainingPartnerSerializer(training_partners, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_email(request):
    """Verify user email (for future OTP implementation)."""
    user = request.user
    user.is_verified = True
    user.save()
    
    return Response(
        {'message': 'Email verified successfully.'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for different user roles."""
    user = request.user
    
    if user.role == 'admin' and user.training_partner:
        # Admin dashboard stats
        training_partner_users = user.training_partner.users.count()
        pending_tutors = user.training_partner.users.filter(
            role='tutor', 
            is_approved=False
        ).count()
        
        return Response({
            'role': 'admin',
            'training_partner': user.training_partner.name,
            'total_users': training_partner_users,
            'pending_tutors': pending_tutors,
        })
    
    elif user.role == 'tutor':
        # Tutor dashboard stats
        return Response({
            'role': 'tutor',
            'training_partner': user.training_partner.name if user.training_partner else None,
            'is_approved': user.is_approved,
        })
    
    else:
        # Student dashboard stats
        return Response({
            'role': 'student',
        })


class ProfileCompletionView(APIView):
    """Handle profile completion after registration with skip option."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get profile completion form fields based on user role."""
        user = request.user
        
        # Check if user already has a profile
        has_profile = False
        profile_data = {}
        
        if user.role == 'student':
            try:
                profile = user.student_profile
                has_profile = True
                profile_data = StudentProfileSerializer(profile).data
            except:
                has_profile = False
                
        elif user.role == 'tutor':
            try:
                profile = user.tutor_profile
                has_profile = True
                profile_data = TutorProfileSerializer(profile).data
            except:
                has_profile = False
                
        elif user.role == 'admin':
            try:
                profile = user.admin_profile
                has_profile = True
                profile_data = AdminProfileSerializer(profile).data
            except:
                has_profile = False
        
        # Return role-specific form structure
        response_data = {
            'user_role': user.role,
            'has_profile': has_profile,
            'profile_data': profile_data if has_profile else {},
            'required_fields': self._get_required_fields(user.role),
            'optional_fields': self._get_optional_fields(user.role),
            'can_skip': True  # Users can always skip and complete later
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
        if role == 'student':
            return []  # No required fields for students
        elif role == 'tutor':
            return ['bio', 'title', 'highest_education', 'specializations', 'technologies']
        elif role == 'admin':
            return ['job_title']
        return []
    
    def _get_optional_fields(self, role):
        """Get optional fields for each role."""
        if role == 'student':
            return [
                'bio', 'profile_picture', 'date_of_birth', 'phone_number',
                'education_level', 'field_of_study', 'current_institution',
                'learning_goals'
            ]
        elif role == 'tutor':
            return [
                'profile_picture', 'date_of_birth', 'phone_number',
                'years_of_experience', 'hourly_rate', 'certifications',
                'languages_spoken', 'linkedin_url', 'github_url', 
                'portfolio_url', 'personal_website', 'is_available', 
                'availability_notes'
            ]
        elif role == 'admin':
            return [
                'bio', 'profile_picture', 'phone_number', 'department',
                'office_location', 'office_phone', 'emergency_contact',
                'linkedin_url', 'professional_email'
            ]
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
            if user.role == 'student':
                profile = user.student_profile
                profile_data = StudentProfileSerializer(profile).data
                has_profile = True
            elif user.role == 'tutor':
                profile = user.tutor_profile
                profile_data = TutorProfileSerializer(profile).data
                has_profile = True
            elif user.role == 'admin':
                profile = user.admin_profile
                profile_data = AdminProfileSerializer(profile).data
                has_profile = True
        except:
            has_profile = False
        
        return Response({
            'user': user_data,
            'profile': profile_data,
            'has_profile': has_profile
        })
    
    def patch(self, request):
        """Update user profile data."""
        user = request.user
        
        # Update basic user data if provided
        if 'user_data' in request.data:
            user_serializer = UserProfileSerializer(
                user, 
                data=request.data['user_data'], 
                partial=True
            )
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response({
                    'success': False,
                    'errors': {'user_data': user_serializer.errors}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update role-specific profile data if provided
        if 'profile_data' in request.data:
            try:
                if user.role == 'student':
                    profile, created = user.student_profile, False
                    if not hasattr(user, 'student_profile'):
                        profile = None
                        created = True
                    
                    if created:
                        profile_serializer = StudentProfileSerializer(
                            data=request.data['profile_data']
                        )
                        if profile_serializer.is_valid():
                            profile_serializer.save(user=user)
                        else:
                            return Response({
                                'success': False,
                                'errors': {'profile_data': profile_serializer.errors}
                            }, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        profile_serializer = StudentProfileSerializer(
                            profile,
                            data=request.data['profile_data'],
                            partial=True
                        )
                        if profile_serializer.is_valid():
                            profile_serializer.save()
                        else:
                            return Response({
                                'success': False,
                                'errors': {'profile_data': profile_serializer.errors}
                            }, status=status.HTTP_400_BAD_REQUEST)
                
                # Similar logic for tutor and admin...
                elif user.role == 'tutor':
                    try:
                        profile = user.tutor_profile
                        created = False
                    except:
                        profile = None
                        created = True
                    
                    if created:
                        profile_serializer = TutorProfileSerializer(
                            data=request.data['profile_data']
                        )
                        if profile_serializer.is_valid():
                            profile_serializer.save(user=user)
                        else:
                            return Response({
                                'success': False,
                                'errors': {'profile_data': profile_serializer.errors}
                            }, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        profile_serializer = TutorProfileSerializer(
                            profile,
                            data=request.data['profile_data'],
                            partial=True
                        )
                        if profile_serializer.is_valid():
                            profile_serializer.save()
                        else:
                            return Response({
                                'success': False,
                                'errors': {'profile_data': profile_serializer.errors}
                            }, status=status.HTTP_400_BAD_REQUEST)
                
                elif user.role == 'admin':
                    try:
                        profile = user.admin_profile
                        created = False
                    except:
                        profile = None
                        created = True
                    
                    if created:
                        profile_serializer = AdminProfileSerializer(
                            data=request.data['profile_data']
                        )
                        if profile_serializer.is_valid():
                            profile_serializer.save(user=user)
                        else:
                            return Response({
                                'success': False,
                                'errors': {'profile_data': profile_serializer.errors}
                            }, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        profile_serializer = AdminProfileSerializer(
                            profile,
                            data=request.data['profile_data'],
                            partial=True
                        )
                        if profile_serializer.is_valid():
                            profile_serializer.save()
                        else:
                            return Response({
                                'success': False,
                                'errors': {'profile_data': profile_serializer.errors}
                            }, status=status.HTTP_400_BAD_REQUEST)
            
            except Exception as e:
                return Response({
                    'success': False,
                    'errors': {'profile_data': str(e)}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully'
        })

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from rest_framework import generics
from django.db.models import Q
from ..models import User, KPProfile, LearnerProfile, KPInstructorProfile
from ..permissions import IsKnowledgePartnerAdmin  

from ..serializers import (
    UserRegistrationSerializer, 
    UserProfileSerializer, 
    ChangePasswordSerializer,
    KPProfileSerializer,
    ProfileCompletionSerializer,
    LearnerProfileSerializer,
    InstructorProfileSerializer,
    KPInstructorCreateSerializer,
    KPInstructorListSerializer,
    KPInstructorDetailSerializer,
    KPInstructorUpdateSerializer
)



class RegisterView(generics.CreateAPIView):
    """User registration endpoint - learners only."""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Create a new learner account."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create user (role automatically set to 'learner')
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Send verification email (optional)
        try:
            self.send_verification_email(user)
        except Exception as e:
            # Log error but don't fail registration
            print(f"Failed to send verification email: {e}")
        
        # Response
        response_data = {
            'success': True,
            'message': 'Registration successful! Please check your email for verification.',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'organization': user.kp_profile.name if hasattr(user, 'kp_profile') and user.kp_profile else None,
                'is_verified': user.is_verified,
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    def send_verification_email(self, user):
        """Send email verification (implement as needed)."""
        #Todo : Implement email verification
        pass

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
                'knowledge_partner': {
                    'id': user.kp_profile.id,
                    'name': user.kp_profile.name,
                    'type': user.kp_profile.type,
                    } if hasattr(user, 'kp_profile') and user.kp_profile else None,
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Logout view that blacklists the refresh token."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


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
def get_knowledge_partners(request):
    """Get list of active knowledge partners for frontend dropdown."""
    knowledge_partners = KPProfile.objects.filter(is_active=True).order_by('name')
    serializer = KPProfileSerializer(knowledge_partners, many=True)
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
    from courses.models import Course, Enrollment
    from payments.models import Payment
    from django.db.models import Count, Sum, Avg
    from datetime import datetime, timedelta
    
    user = request.user
    
    if user.role == 'knowledge_partner_admin' and hasattr(user, 'kp_profile') and user.kp_profile:
        # Admin dashboard stats - simplified since organization model structure changed
        return Response({
            'role': 'knowledge_partner_admin',
            'organization': user.kp_profile.name,
            'message': 'Dashboard stats not fully implemented with current model structure'
        })
    
    elif user.role == 'knowledge_partner_instructor':
        # Instructor dashboard stats
        my_courses = Course.objects.filter(tutor=user)
        total_courses = my_courses.count()
        published_courses = my_courses.filter(is_published=True).count()
        
        # Enrollment statistics for my courses
        total_enrollments = Enrollment.objects.filter(course__tutor=user).count()
        active_enrollments = Enrollment.objects.filter(
            course__tutor=user,
            status='active'
        ).count()
        
        # Payment statistics for my courses
        total_payments = Payment.objects.filter(
            enrollment__course__tutor=user
        ).count()
        total_revenue = Payment.objects.filter(
            enrollment__course__tutor=user,
            status__in=['paid', 'verified']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_enrollments = Enrollment.objects.filter(
            course__tutor=user,
            enrollment_date__gte=thirty_days_ago
        ).count()
        
        return Response({
            'role': 'knowledge_partner_instructor',
            'organization': user.kp_profile.name if hasattr(user, 'kp_profile') and user.kp_profile else None,
            'is_approved': user.is_approved,
            'total_courses': total_courses,
            'published_courses': published_courses,
            'total_enrollments': total_enrollments,
            'active_enrollments': active_enrollments,
            'total_payments': total_payments,
            'total_revenue': float(total_revenue),
            'recent_enrollments': recent_enrollments,
        })
    
    else:
        # Learner dashboard stats
        my_enrollments = Enrollment.objects.filter(student=user)
        total_enrollments = my_enrollments.count()
        active_enrollments = my_enrollments.filter(status='active').count()
        completed_enrollments = my_enrollments.filter(status='completed').count()
        
        # Payment statistics
        total_payments = Payment.objects.filter(enrollment__student=user).count()
        total_spent = Payment.objects.filter(
            enrollment__student=user,
            status__in=['paid', 'verified']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'role': 'learner',
            'total_enrollments': total_enrollments,
            'active_enrollments': active_enrollments,
            'completed_enrollments': completed_enrollments,
            'total_payments': total_payments,
            'total_spent': float(total_spent),
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
                
        elif user.role == 'knowledge_partner_admin':
            # Admin profile not available with current model structure
            has_profile = False
            profile_data = {}
        
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
        if role == 'learner':
            return []  # No required fields for learners
        elif role == 'knowledge_partner_instructor':
            return ['bio', 'title', 'highest_education', 'specializations', 'technologies']
        elif role == 'knowledge_partner_admin':
            return []  # No required fields since admin profile model not available
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
        elif role == 'knowledge_partner_admin':
            return []  # No optional fields since admin profile model not available
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
            elif user.role == 'knowledge_partner_admin':
                # Admin profile not available with current model structure
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
                if user.role == 'learner':
                    profile, created = user.learner_profile, False
                    if not hasattr(user, 'learner_profile'):
                        profile = None
                        created = True
                    
                    if created:
                        profile_serializer = LearnerProfileSerializer(
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
                        profile_serializer = LearnerProfileSerializer(
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
                
                # Similar logic for instructor and admin...
                elif user.role == 'knowledge_partner_instructor':
                    try:
                        profile = user.instructor_profile
                        created = False
                    except:
                        profile = None
                        created = True
                    
                    if created:
                        profile_serializer = InstructorProfileSerializer(
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
                        profile_serializer = InstructorProfileSerializer(
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
                
                # Admin profile update removed - KPAProfile model not available
            
            except Exception as e:
                return Response({
                    'success': False,
                    'errors': {'profile_data': str(e)}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully'
        })


# =========================
# KP Instructor CRUD (KP Admin only)
# =========================

class KPAdminOnlyMixin:
    permission_classes = [permissions.IsAuthenticated]

    def _ensure_kp_admin(self, request):
        user = request.user
        if not user or user.role != 'knowledge_partner_admin':
            return Response({'detail': 'KP admin permission required.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class KPInstructorListCreateView(APIView):
    """List instructors and create new instructor (user + profile)."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]

    def get(self, request):
        # Filters: search by name/email/title, availability
        qs = KPInstructorProfile.objects.select_related('user').all().order_by('-created_at')

        search = request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(user__full_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(title__icontains=search)
            )

        is_available = request.query_params.get('is_available')
        if is_available in ['true', 'false']:
            qs = qs.filter(is_available=(is_available == 'true'))

        serializer = KPInstructorListSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = KPInstructorCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        profile = user.instructor_profile
        detail = KPInstructorDetailSerializer(profile).data
        return Response(detail, status=status.HTTP_201_CREATED)


class KPInstructorDetailView(APIView):
    """Retrieve, update, or delete an instructor."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]

    def get_object(self, pk):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(KPInstructorProfile.objects.select_related('user'), pk=pk)

    def get(self, request, id):
        profile = self.get_object(id)
        serializer = KPInstructorDetailSerializer(profile)
        return Response(serializer.data)

    def patch(self, request, id):
        profile = self.get_object(id)
        serializer = KPInstructorUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(KPInstructorDetailSerializer(profile).data)

    def delete(self, request, id):
        profile = self.get_object(id)
        # Delete both profile and linked user
        user = profile.user
        profile.delete()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

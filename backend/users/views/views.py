from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError, PermissionDenied
from rest_framework import generics
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from ..models import User, KPProfile, LearnerProfile, KPInstructorProfile, OTPVerification
from ..permissions import IsKnowledgePartnerAdmin
from users.services import otp_service, email_service

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
    KPInstructorUpdateSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer
)



class RegisterView(APIView):
    """User registration endpoint - learners only. Creates OTP verification without creating user."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        """Validate registration data and send OTP for verification."""
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        full_name = serializer.validated_data['full_name']
        password = serializer.validated_data['password']
        
        # Check if user with this email already exists and is verified
        try:
            existing_user = User.objects.get(email=email)
            if existing_user.is_verified:
                return Response({
                    'success': False,
                    'message': 'User with this Email Address already exists.',
                    'error_code': 'EMAIL_EXISTS'
                }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            pass  # Email doesn't exist, proceed with registration
        
        # Check rate limit for OTP requests
        rate_limit_check = check_rate_limit(email, 'email_verification')
        if not rate_limit_check['allowed']:
            return Response({
                'success': False,
                'message': rate_limit_check['message'],
                'error_code': 'RATE_LIMIT_EXCEEDED',
                'retry_after': rate_limit_check.get('retry_after', 600)
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Store user data temporarily in OTPVerification
        temp_user_data = {
            'email': email,
            'full_name': full_name,
            'password': password,  # Will be hashed when user is created
            'role': 'learner',
            'is_verified': False,
            'is_approved': True,  # Learners are auto-approved
            'is_active': True,
        }
        
        # Create OTP verification with temporary user data
        try:
            otp_verification = create_otp_verification(
                user=None,  # No user object yet
                email=email,
                purpose='email_verification',
                expiry_minutes=10,
                temp_user_data=temp_user_data
            )
            
            if not otp_verification:
                return Response({
                    'success': False,
                    'message': 'Failed to send verification email. Please try again.',
                    'error_code': 'EMAIL_SEND_FAILED'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Registration error for {email}: {str(e)}")
            
            return Response({
                'success': False,
                'message': 'Registration failed due to a server error. Please try again.',
                'error_code': 'REGISTRATION_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Increment rate limit counter
        increment_rate_limit(email, 'email_verification')
        
        # Response
        response_data = {
            'success': True,
            'message': 'Registration successful! Please check your email for the verification code.',
            'email': email,
            'otp_sent': True,
            'expires_in_minutes': 10
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
        
        if not user.is_verified:
            return Response(
                {'error': 'Please verify your email address before logging in. Check your email for the verification code.'},
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
                'role_display': user.get_role_display(),
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
            # Send password changed email notification
            try:
                subject = "Your password was changed successfully"
                message = (
                    f"Hello {user.full_name or 'User'},\n\n"
                    "This is a confirmation that the password for your account "
                    f"({user.email}) was changed successfully.\n\n"
                    "If you did not make this change, please reset your password immediately "
                    "using the 'Forgot password' option and contact support.\n\n"
                    "— Swinfy LMS"
                )
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                # Don't block the response on email errors
                pass
            
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
    
    if user.role == 'knowledge_partner' and hasattr(user, 'kp_profile') and user.kp_profile:
        # Admin dashboard stats - simplified since organization model structure changed
        return Response({
            'role': 'knowledge_partner',
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
        my_enrollments = Enrollment.objects.filter(learner=user)
        total_enrollments = my_enrollments.count()
        active_enrollments = my_enrollments.filter(status='active').count()
        completed_enrollments = my_enrollments.filter(status='completed').count()
        
        # Payment statistics
        total_payments = Payment.objects.filter(enrollment__learner=user).count()
        total_spent = Payment.objects.filter(
            enrollment__learner=user,
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
                
        elif user.role == 'knowledge_partner':
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
        elif role == 'knowledge_partner':
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
        elif role == 'knowledge_partner':
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
            elif user.role == 'knowledge_partner':
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
        try:
            user = request.user
            
            # Handle both JSON and FormData requests
            user_data = None
            profile_data = None
            
            if request.content_type and 'application/json' in request.content_type:
                # Handle JSON request
                if 'user_data' in request.data:
                    user_data = request.data['user_data']
                if 'profile_data' in request.data:
                    profile_data = request.data['profile_data']
            else:
                # Handle FormData request
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
                        # Properly check if learner_profile exists
                        # Use a direct query check which is more reliable than accessing the attribute
                        try:
                            profile = LearnerProfile.objects.get(user=user)
                            created = False
                        except LearnerProfile.DoesNotExist:
                            # Profile doesn't exist, create it
                            profile = None
                            created = True
                        except Exception as e:
                            # Catch any other exceptions and log them
                            print(f"Error checking learner_profile: {type(e).__name__}: {str(e)}")
                            profile = None
                            created = True
                        
                        # Prepare data for serializer
                        serializer_data = profile_data.copy()
                        
                        # Handle profile picture upload
                        if 'profile_picture' in request.FILES:
                            serializer_data['profile_picture'] = request.FILES['profile_picture']
                        
                        if created:
                            # Create new profile
                            profile_serializer = LearnerProfileSerializer(
                                data=serializer_data
                            )
                            if profile_serializer.is_valid():
                                profile_serializer.save(user=user)
                            else:
                                return Response({
                                    'success': False,
                                    'error': 'Failed to create profile data',
                                    'errors': {'profile_data': profile_serializer.errors}
                                }, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            # Update existing profile
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
                                data=profile_data
                            )
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
                    
                    # Admin profile update removed - KPAProfile model not available
                    
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


# =========================
# KP Instructor CRUD (KP Admin only)
# =========================

def send_instructor_invitation_email(instructor_user, kp_profile, password):
    """Send invitation email with credentials to newly created instructor."""
    subject = f"🎉 Welcome to {kp_profile.name} - Instructor Invitation"
    message = f"""
🎉 WELCOME TO {kp_profile.name.upper()}! 🎉

Dear {instructor_user.full_name},

We are thrilled to invite you to join {kp_profile.name} as an Instructor on the Swinfy Learning Platform!

You have been added to our team by the Knowledge Partner administrator. We're excited to have you on board to share your expertise and help transform the lives of learners worldwide.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 YOUR LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email: {instructor_user.email}
🔑 Temporary Password: {password}
🌐 Login URL: https://olla.co.in/

⚠️ IMPORTANT SECURITY NOTICE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is a TEMPORARY password that has been randomly generated for your security.

🔒 YOU MUST CHANGE THIS PASSWORD immediately after your first login!

To change your password:
1. Login with the credentials above
2. Go to your Profile Settings
3. Click on "Change Password"
4. Create a strong, unique password that you'll remember

Never share your password with anyone, including our support team.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NEXT STEPS TO GET STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Login to your Instructor Dashboard
2️⃣ Complete your instructor profile (add bio, qualifications, specializations)
3️⃣ Upload a professional profile photo
4️⃣ Start creating amazing courses to share your knowledge!
5️⃣ Engage with learners and track their progress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ WHAT YOU CAN DO AS AN INSTRUCTOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎓 Create and publish courses
📚 Upload course materials and resources
🎥 Add video lessons and interactive content
📝 Create quizzes and assessments
👥 Track learner progress and engagement
💬 Interact with learners through discussions
📊 View detailed analytics on your courses
🌟 Build your reputation as an expert educator

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 YOUR ORGANIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization: {kp_profile.name}
Type: {kp_profile.get_type_display()}
Website: {kp_profile.website or 'Not specified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤝 NEED HELP? WE'RE HERE FOR YOU!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email Support: rockyg.swinfy@gmail.com
📞 Phone Support: +91 7981313783
💬 We're here to help you succeed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to the team! We can't wait to see the incredible courses you'll create and the impact you'll make on learners' lives.

Let's make learning accessible, engaging, and transformative! 🌟

With warm regards,
{kp_profile.name} & Swinfy Learning Platform Team

P.S. Your expertise matters. Together, we'll empower thousands of learners! 🚀
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instructor_user.email],
            fail_silently=False,
        )
        print(f"✅ Invitation email sent successfully to {instructor_user.email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send invitation email to {instructor_user.email}: {e}")
        return False


class KPAdminOnlyMixin:
    permission_classes = [permissions.IsAuthenticated]

    def _ensure_kp_admin(self, request):
        user = request.user
        if not user or user.role != 'knowledge_partner':
            return Response({'detail': 'KP admin permission required.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class KPInstructorListCreateView(APIView):
    """List instructors and create new instructor (user + profile)."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]

    def get(self, request):
        # Get the Knowledge Partner user
        kp_user = request.user
        
        # Find the KPProfile where this user is the Knowledge Partner
        try:
            kp_profile = KPProfile.objects.get(user=kp_user)
        except KPProfile.DoesNotExist:
            return Response({'detail': 'Knowledge Partner must have an associated profile'}, status=status.HTTP_403_FORBIDDEN)
        
        # Only show instructors from the same KP organization
        qs = KPInstructorProfile.objects.select_related('user').filter(
            knowledge_partner=kp_profile
        ).order_by('-created_at')

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
        print(f"DEBUG VIEW: Received POST request to create instructor")
        print(f"DEBUG VIEW: Request user: {request.user.email} (role: {request.user.role})")
        print(f"DEBUG VIEW: Request data: {request.data}")
        print(f"DEBUG VIEW: Content type: {request.content_type}")
        
        serializer = KPInstructorCreateSerializer(data=request.data, context={'request': request})
        
        print(f"DEBUG VIEW: Serializer created, checking validity...")
        serializer.is_valid(raise_exception=True)
        
        print(f"DEBUG VIEW: Serializer valid, creating user...")
        user = serializer.save()
        profile = user.instructor_profile
        
        # Send invitation email with credentials if password was auto-generated
        if hasattr(user, '_password_was_generated') and user._password_was_generated:
            try:
                kp_profile = user._kp_profile
                password = user._temp_password
                send_instructor_invitation_email(user, kp_profile, password)
                print(f"DEBUG VIEW: Invitation email sent to {user.email}")
            except Exception as e:
                # Log error but don't fail the creation
                print(f"DEBUG VIEW: Failed to send invitation email: {e}")
        
        detail = KPInstructorDetailSerializer(profile).data
        
        print(f"DEBUG VIEW: Instructor created successfully: {user.email}")
        return Response(detail, status=status.HTTP_201_CREATED)


class KPInstructorDetailView(APIView):
    """Retrieve, update, or delete an instructor."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]

    def get_object(self, pk):
        from django.shortcuts import get_object_or_404
        # Only allow access to instructors from the same KP organization
        kp_user = self.request.user
        
        # Find the KPProfile where this user is the Knowledge Partner
        try:
            kp_profile = KPProfile.objects.get(user=kp_user)
        except KPProfile.DoesNotExist:
            raise PermissionDenied("Knowledge Partner must have an associated profile")
        
        return get_object_or_404(
            KPInstructorProfile.objects.select_related('user').filter(knowledge_partner=kp_profile), 
            pk=pk
        )

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


class KPLearnerListView(APIView):
    """List learners enrolled in courses created by the Knowledge Partner."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]

    def get(self, request):
        # Get the Knowledge Partner user
        kp_user = request.user
        
        # Find the KPProfile where this user is the Knowledge Partner
        try:
            kp_profile = KPProfile.objects.get(user=kp_user)
        except KPProfile.DoesNotExist:
            return Response({'detail': 'Knowledge Partner must have an associated profile'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get learners who are enrolled in courses created by this KP
        from courses.models.enrollment import Enrollment
        from courses.models.course import Course
        
        # Get all courses created by this KP
        kp_courses = Course.objects.filter(training_partner=kp_profile)
        
        # Get enrollments for these courses
        enrollments = Enrollment.objects.filter(
            course__in=kp_courses,
            learner__role='learner'
        ).select_related(
            'learner', 
            'learner__learner_profile', 
            'course',
            'course_progress'
        ).order_by('-enrollment_date')
        
        # Apply search filter if provided
        search = request.query_params.get('search')
        if search:
            enrollments = enrollments.filter(
                Q(learner__full_name__icontains=search) |
                Q(learner__email__icontains=search) |
                Q(learner__learner_profile__phone_number__icontains=search) |
                Q(course__title__icontains=search)
            )
        
        # Group enrollments by learner to avoid duplicates
        learner_enrollments = {}
        for enrollment in enrollments:
            learner_id = str(enrollment.learner.id)
            if learner_id not in learner_enrollments:
                learner_enrollments[learner_id] = {
                    'learner': enrollment.learner,
                    'enrollments': []
                }
            learner_enrollments[learner_id]['enrollments'].append(enrollment)
        
        # Serialize learner data with their enrollments
        learner_data = []
        for learner_id, data in learner_enrollments.items():
            learner = data['learner']
            enrollments = data['enrollments']
            
            try:
                profile = learner.learner_profile
                profile_data = {
                    'bio': profile.bio,
                    'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
                    'phone_number': profile.phone_number,
                    'learning_goals': profile.learning_goals,
                    'interests': profile.interests,
                    'created_at': profile.created_at.isoformat(),
                    'updated_at': profile.updated_at.isoformat(),
                }
            except:
                profile_data = {
                    'bio': None,
                    'profile_picture': None,
                    'phone_number': None,
                    'learning_goals': None,
                    'interests': None,
                    'created_at': None,
                    'updated_at': None,
                }
            
            # Prepare enrollment data
            enrollment_data = []
            for enrollment in enrollments:
                enrollment_info = {
                    'id': str(enrollment.id),
                    'course_title': enrollment.course.title,
                    'course_slug': enrollment.course.slug,
                    'status': enrollment.status,
                    'enrollment_date': enrollment.enrollment_date.isoformat(),
                    'progress_percentage': enrollment.progress_percentage,
                    'payment_status': enrollment.payment_status,
                    'amount_paid': str(enrollment.amount_paid),
                }
                
                # Add progress info if available
                if hasattr(enrollment, 'course_progress') and enrollment.course_progress:
                    enrollment_info.update({
                        'overall_progress': str(enrollment.course_progress.overall_progress),
                        'lessons_completed': enrollment.course_progress.lessons_completed,
                        'total_lessons': enrollment.course_progress.total_lessons,
                        'last_activity': enrollment.course_progress.last_activity.isoformat() if enrollment.course_progress.last_activity else None,
                    })
                
                enrollment_data.append(enrollment_info)
            
            learner_data.append({
                'id': str(learner.id),
                'email': learner.email,
                'full_name': learner.full_name,
                'is_verified': learner.is_verified,
                'is_approved': learner.is_approved,
                'created_at': learner.created_at.isoformat(),
                'updated_at': learner.updated_at.isoformat(),
                'profile': profile_data,
                'enrollments': enrollment_data,
                'total_enrollments': len(enrollments),
                'active_enrollments': len([e for e in enrollments if e.status == 'active']),
                'completed_enrollments': len([e for e in enrollments if e.status == 'completed']),
            })
        
        return Response(learner_data)


# =========================
# OTP Verification Views
# =========================

class VerifyOTPView(APIView):
    """Verify OTP code for email verification."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Verify OTP code and create user if this is a registration."""
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        purpose = serializer.validated_data['purpose']
        
        # Verify OTP
        result = verify_otp_code(email, otp_code, purpose)
        
        if result['success']:
            otp_verification = result['otp_verification']
            user = otp_verification.user
            
            # If this is a registration (no user exists yet), create the user
            if not user and purpose == 'email_verification' and otp_verification.temp_user_data:
                try:
                    # Create the user from temporary data
                    temp_data = otp_verification.temp_user_data
                    
                    user = User.objects.create_user(
                        email=temp_data['email'],
                        full_name=temp_data['full_name'],
                        password=temp_data['password'],  # Will be hashed automatically
                        role=temp_data['role'],
                        is_verified=True,  # Mark as verified since OTP is confirmed
                        is_approved=temp_data['is_approved'],
                        is_active=temp_data['is_active'],
                    )
                    
                    # Update the OTP verification to link it to the user
                    otp_verification.user = user
                    otp_verification.save()
                    
                    # User created successfully - profile can be updated later
                    
                except Exception as e:
                    return Response({
                        'success': False,
                        'message': f'Failed to create user account: {str(e)}',
                        'error_code': 'USER_CREATION_FAILED'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Generate tokens for the user
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': result['message'],
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role,
                    'is_verified': user.is_verified,
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': result['message'],
                'error_code': result.get('error_code', 'VERIFICATION_FAILED'),
                'remaining_attempts': result.get('remaining_attempts', 0)
            }, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """Send OTP for password reset."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Send OTP for password reset."""
        email = request.data.get('email')
        
        if not email:
            return Response({
                'success': False,
                'message': 'Email address is required.',
                'error_code': 'EMAIL_REQUIRED'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'No account found with this email address. Please register first.',
                'error_code': 'USER_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check rate limit
        rate_limit_check = check_rate_limit(email, 'password_reset')
        if not rate_limit_check['allowed']:
            return Response({
                'success': False,
                'message': rate_limit_check['message'],
                'error_code': 'RATE_LIMIT_EXCEEDED',
                'retry_after': rate_limit_check.get('retry_after', 600)
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Create and send OTP
        otp_verification = create_otp_verification(
            user=user,
            email=email,
            purpose='password_reset',
            expiry_minutes=10
        )
        
        if not otp_verification:
            return Response({
                'success': False,
                'message': 'Failed to send reset code. Please try again.',
                'error_code': 'EMAIL_SEND_FAILED'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Increment rate limit counter
        increment_rate_limit(email, 'password_reset')
        
        return Response({
            'success': True,
            'message': 'Password reset code sent to your email.',
            'email': email,
            'expires_in_minutes': 10
        }, status=status.HTTP_200_OK)


class VerifyResetOTPView(APIView):
    """Verify OTP for password reset."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Verify OTP for password reset."""
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        if not email or not otp_code:
            return Response({
                'success': False,
                'message': 'Email and OTP code are required.',
                'error_code': 'MISSING_FIELDS'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the most recent OTP for password reset
        try:
            otp_verification = OTPVerification.objects.filter(
                email__iexact=email,
                purpose='password_reset',
                is_verified=False
            ).order_by('-created_at').first()
            
            if not otp_verification:
                return Response({
                    'success': False,
                    'message': 'No reset code found for this email. Please request a new one.',
                    'error_code': 'NO_OTP_FOUND'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if OTP code matches
            if otp_verification.otp_code != otp_code:
                # Increment attempt count
                otp_verification.attempts += 1
                otp_verification.save()
                
                remaining_attempts = otp_verification.max_attempts - otp_verification.attempts
                
                if remaining_attempts > 0:
                    return Response({
                        'success': False,
                        'message': f'Invalid OTP code. {remaining_attempts} attempts remaining.',
                        'error_code': 'INVALID_OTP',
                        'remaining_attempts': remaining_attempts
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'success': False,
                        'message': 'Invalid OTP code. Maximum attempts exceeded. Please request a new OTP.',
                        'error_code': 'MAX_ATTEMPTS_EXCEEDED'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if OTP is still valid
            if otp_verification.is_expired():
                return Response({
                    'success': False,
                    'message': 'OTP has expired. Please request a new one.',
                    'error_code': 'OTP_EXPIRED'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if otp_verification.attempts >= otp_verification.max_attempts:
                return Response({
                    'success': False,
                    'message': 'Maximum verification attempts exceeded. Please request a new OTP.',
                    'error_code': 'MAX_ATTEMPTS_EXCEEDED'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark OTP as verified
            otp_verification.is_verified = True
            otp_verification.save()
            
            return Response({
                'success': True,
                'message': 'OTP verified successfully. You can now reset your password.',
                'email': email
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to verify OTP. Please try again.',
                'error_code': 'VERIFICATION_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(APIView):
    """Reset password with OTP verification."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Reset password with OTP verification."""
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        new_password = request.data.get('new_password')
        
        if not all([email, otp_code, new_password]):
            return Response({
                'success': False,
                'message': 'Email, OTP code, and new password are required.',
                'error_code': 'MISSING_FIELDS'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the verified OTP for password reset
        try:
            otp_verification = OTPVerification.objects.filter(
                email__iexact=email,
                purpose='password_reset',
                is_verified=True,
                otp_code=otp_code
            ).order_by('-created_at').first()
            
            if not otp_verification:
                return Response({
                    'success': False,
                    'message': 'Invalid or expired reset code. Please request a new one.',
                    'error_code': 'INVALID_OTP'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to verify reset code.',
                'error_code': 'VERIFICATION_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Get user and update password
        try:
            user = User.objects.get(email__iexact=email)
            user.set_password(new_password)
            user.save()
            # Send password reset success email
            try:
                subject = "Your password has been reset successfully"
                message = (
                    f"Hello {user.full_name or 'User'},\n\n"
                    "Your password was reset successfully using the verification code.\n\n"
                    f"Email: {user.email}\n\n"
                    "If you did not request this change, please contact support immediately.\n\n"
                    "— Swinfy LMS"
                )
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                pass
            
            return Response({
                'success': True,
                'message': 'Password updated successfully. You can now login with your new password.'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found.',
                'error_code': 'USER_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to update password: {str(e)}',
                'error_code': 'PASSWORD_UPDATE_FAILED'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendOTPView(APIView):
    """Resend OTP code."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Resend OTP code."""
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']
        
        # Check rate limit
        rate_limit_check = check_rate_limit(email, purpose)
        if not rate_limit_check['allowed']:
            return Response({
                'success': False,
                'message': rate_limit_check['message'],
                'error_code': 'RATE_LIMIT_EXCEEDED',
                'retry_after': rate_limit_check.get('retry_after', 600)
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # For email verification, check if there's a pending OTP with temp data
        if purpose == 'email_verification':
            try:
                # Look for existing OTP verification with temp data
                existing_otp = OTPVerification.objects.filter(
                    email=email,
                    purpose=purpose,
                    is_verified=False,
                    temp_user_data__isnull=False
                ).order_by('-created_at').first()
                
                if existing_otp:
                    # Resend OTP with existing temp data
                    otp_verification = create_otp_verification(
                        user=None,
                        email=email,
                        purpose=purpose,
                        expiry_minutes=10,
                        temp_user_data=existing_otp.temp_user_data
                    )
                    
                    if not otp_verification:
                        return Response({
                            'success': False,
                            'message': 'Failed to create new OTP. Please try again.',
                            'error_code': 'OTP_CREATION_FAILED'
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    return Response({
                        'success': False,
                        'message': 'No pending registration found for this email address.',
                        'error_code': 'NO_PENDING_REGISTRATION'
                    }, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'Failed to resend OTP: {str(e)}',
                    'error_code': 'RESEND_FAILED'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # For other purposes (password reset, etc.), user must exist
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'No user found with this email address.',
                    'error_code': 'USER_NOT_FOUND'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Create and send new OTP
            otp_verification = create_otp_verification(
                user=user,
                email=email,
                purpose=purpose,
                expiry_minutes=10
            )
        
        if not otp_verification:
            return Response({
                'success': False,
                'message': 'Failed to send verification email. Please try again.',
                'error_code': 'EMAIL_SEND_FAILED'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Increment rate limit counter
        increment_rate_limit(email, purpose)
        
        return Response({
            'success': True,
            'message': 'Verification code has been sent to your email.',
            'expires_in_minutes': 10
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_otp(request):
    """Send OTP for various purposes (email verification, password reset, etc.)."""
    serializer = SendOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    purpose = serializer.validated_data['purpose']
    
    # Check rate limit
    rate_limit_check = check_rate_limit(email, purpose)
    if not rate_limit_check['allowed']:
        return Response({
            'success': False,
            'message': rate_limit_check['message'],
            'error_code': 'RATE_LIMIT_EXCEEDED',
            'retry_after': rate_limit_check.get('retry_after', 600)
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    # Get user
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'No user found with this email address.',
            'error_code': 'USER_NOT_FOUND'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Create and send OTP
    otp_verification = create_otp_verification(
        user=user,
        email=email,
        purpose=purpose,
        expiry_minutes=10
    )
    
    if not otp_verification:
        return Response({
            'success': False,
            'message': 'Failed to send verification email. Please try again.',
            'error_code': 'EMAIL_SEND_FAILED'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Increment rate limit counter
    increment_rate_limit(email, purpose)
    
    return Response({
        'success': True,
        'message': 'Verification code has been sent to your email.',
        'expires_in_minutes': 10
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_contact_form_otp(request):
    """Send OTP for contact form email verification - doesn't require existing user."""
    email = request.data.get('email')
    purpose = request.data.get('purpose', 'email_verification')
    
    if not email:
        return Response({
            'success': False,
            'message': 'Email address is required.',
            'error_code': 'EMAIL_REQUIRED'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate email format
    try:
        from django.core.validators import validate_email
        validate_email(email)
    except:
        return Response({
            'success': False,
            'message': 'Invalid email address format.',
            'error_code': 'INVALID_EMAIL'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check rate limit
    rate_limit_check = check_rate_limit(email, purpose)
    if not rate_limit_check['allowed']:
        return Response({
            'success': False,
            'message': rate_limit_check['message'],
            'error_code': 'RATE_LIMIT_EXCEEDED',
            'retry_after': rate_limit_check.get('retry_after', 600)
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    # Create and send OTP (no user required for contact form verification)
    otp_verification = create_otp_verification(
        user=None,  # No user required for contact form
        email=email,
        purpose=purpose,
        expiry_minutes=10
    )
    
    if not otp_verification:
        return Response({
            'success': False,
            'message': 'Failed to send verification email. Please try again.',
            'error_code': 'EMAIL_SEND_FAILED'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Increment rate limit counter
    increment_rate_limit(email, purpose)
    
    return Response({
        'success': True,
        'message': 'Verification code has been sent to your email.',
        'expires_in_minutes': 10
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_contact_form_otp(request):
    """Verify OTP for contact form email verification - doesn't require existing user."""
    email = request.data.get('email')
    otp_code = request.data.get('otp_code')
    purpose = request.data.get('purpose', 'email_verification')
    
    if not email or not otp_code:
        return Response({
            'success': False,
            'message': 'Email and OTP code are required.',
            'error_code': 'MISSING_FIELDS'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify OTP
    result = verify_otp_code(email, otp_code, purpose)
    
    if result['success']:
        return Response({
            'success': True,
            'message': 'Email verified successfully.',
        }, status=status.HTTP_200_OK)
    else:
        status_code = status.HTTP_400_BAD_REQUEST
        if result.get('error_code') == 'OTP_EXPIRED':
            status_code = status.HTTP_410_GONE
        elif result.get('error_code') == 'MAX_ATTEMPTS_EXCEEDED':
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
            
        return Response({
            'success': False,
            'message': result['message'],
            'error_code': result.get('error_code')
        }, status=status_code)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cleanup_otps(request):
    """Clean up expired OTPs (admin utility)."""
    try:
        count = cleanup_expired_otps()
        return Response({
            'success': True,
            'message': f'Cleaned up {count} expired OTPs.',
            'cleaned_count': count
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to cleanup OTPs: {str(e)}',
            'error_code': 'CLEANUP_FAILED'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

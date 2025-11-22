"""
Authentication Views - Clean Architecture

Handles user registration, login, OTP verification, and password reset flows.
Uses services for all business logic - NO direct database queries.
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from users.services import otp_service, email_service, auth_service
from users.serializers import (
    UserRegistrationSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    SendOTPSerializer,
)


class RegisterView(APIView):
    """User registration endpoint - learners only. Creates OTP verification without creating user."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        """Validate registration data and send OTP for verification."""
        # Step 1: Validate input data
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        full_name = serializer.validated_data['full_name']
        password = serializer.validated_data['password']
        
        # Step 2: Check if user already exists
        if User.objects.filter(email=email, is_verified=True).exists():
            return Response({
                'success': False,
                'message': 'User with this Email Address already exists.',
                'error_code': 'EMAIL_EXISTS'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Step 3: Prepare temporary user data for OTP
        temp_user_data = {
            'email': email,
            'full_name': full_name,
            'password': password,
            'role': 'learner',
            'is_verified': False,
            'is_approved': True,
            'is_active': True,
        }
        
        # Step 4: Send OTP via service (handles rate limiting, email sending, etc.)
        success, message = otp_service.send_otp(
            email=email,
            purpose='email_verification',
            temp_user_data=temp_user_data
        )
        
        # Step 5: Return response based on result
        if success:
            return Response({
                'success': True,
                'message': message,
                'email': email,
                'otp_sent': True,
                'expires_in_minutes': 10
            }, status=status.HTTP_201_CREATED)
        else:
            status_code = status.HTTP_429_TOO_MANY_REQUESTS if 'Too many requests' in message else status.HTTP_400_BAD_REQUEST
            return Response({
                'success': False,
                'message': message,
                'error_code': 'OTP_SEND_FAILED'
            }, status=status_code)


class LoginView(APIView):
    """Custom login view using auth service."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        """Handle login with email and password via auth service."""
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate via service (handles all validation)
        from users.services import auth_service
        success, message, user, tokens = auth_service.validate_login(email, password)
        
        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get user info via service
        user_info = auth_service.get_user_info(user)
        
        # Return tokens and user info
        return Response({
            'tokens': tokens,
            'user': user_info
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Logout view that blacklists the refresh token via service."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Blacklist refresh token via auth service."""
        refresh_token = request.data.get("refresh")
        
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Blacklist token via service
        success, message = auth_service.blacklist_token(refresh_token)
        
        if success:
            return Response({"message": message}, status=status.HTTP_200_OK)
        else:
            return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)


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
        
        # Verify OTP via service
        success, message, otp_record = otp_service.verify_otp(email, otp_code, purpose)
        
        if not success:
            return Response({
                'success': False,
                'message': message,
                'error_code': 'VERIFICATION_FAILED'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # OTP verified successfully
        user = otp_record.user
        
        # If this is registration (no user yet), create user from temp data
        if not user and purpose == 'email_verification' and otp_record.temp_user_data:
            try:
                temp_data = otp_record.temp_user_data
                from users.services import user_service
                
                # Create user via service
                success, message, user = user_service.create_user(
                    email=temp_data['email'],
                    full_name=temp_data['full_name'],
                    password=temp_data['password'],
                    role=temp_data['role'],
                    is_verified=True,
                    is_approved=temp_data.get('is_approved', True),
                    is_active=temp_data.get('is_active', True),
                )
                
                if not success:
                    return Response({
                        'success': False,
                        'message': message,
                        'error_code': 'USER_CREATION_FAILED'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Link OTP to user
                otp_record.user = user
                otp_record.save()
                
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'Failed to create user account: {str(e)}',
                    'error_code': 'USER_CREATION_FAILED'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': message,
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
        
        # Check if user exists via service
        from users.services import user_service
        user = user_service.get_user_by_email(email)
        if not user:
            return Response({
                'success': False,
                'message': 'No account found with this email address.',
                'error_code': 'USER_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Send OTP via service (handles rate limiting, email sending, etc.)
        success, message = otp_service.send_otp(
            email=email,
            purpose='password_reset',
            user=user
        )
        
        if success:
            return Response({
                'success': True,
                'message': message,
                'email': email,
                'expires_in_minutes': 10
            }, status=status.HTTP_200_OK)
        else:
            status_code = status.HTTP_429_TOO_MANY_REQUESTS if 'Too many requests' in message else status.HTTP_500_INTERNAL_SERVER_ERROR
            return Response({
                'success': False,
                'message': message,
                'error_code': 'OTP_SEND_FAILED'
            }, status=status_code)


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
        
        # Verify OTP via service
        success, message, otp_record = otp_service.verify_otp(email, otp_code, 'password_reset')
        
        if success:
            return Response({
                'success': True,
                'message': 'OTP verified successfully. You can now reset your password.',
                'email': email
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': message,
                'error_code': 'VERIFICATION_FAILED'
            }, status=status.HTTP_400_BAD_REQUEST)


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
        
        # Verify OTP via service
        success, message, otp_record = otp_service.verify_otp(email, otp_code, 'password_reset')
        
        if not success:
            return Response({
                'success': False,
                'message': message,
                'error_code': 'INVALID_OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user and update password via service
        from users.services import user_service
        user = user_service.get_user_by_email(email)
        
        if not user:
            return Response({
                'success': False,
                'message': 'User not found.',
                'error_code': 'USER_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Reset password via service
        success, message = user_service.reset_password(user, new_password)
        
        if not success:
            return Response({
                'success': False,
                'message': message,
                'error_code': 'PASSWORD_UPDATE_FAILED'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Send confirmation email
        email_service.send_password_reset_confirmation(user)
        
        return Response({
            'success': True,
            'message': 'Password updated successfully. You can now login with your new password.'
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    """Resend OTP code."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Resend OTP code."""
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']
        
        # Use resend_otp service (handles all logic)
        success, message = otp_service.resend_otp(email, purpose)
        
        if success:
            return Response({
                'success': True,
                'message': message,
                'expires_in_minutes': 10
            }, status=status.HTTP_200_OK)
        else:
            # Determine appropriate status code
            if 'Too many requests' in message:
                status_code = status.HTTP_429_TOO_MANY_REQUESTS
            elif 'not found' in message.lower():
                status_code = status.HTTP_404_NOT_FOUND
            else:
                status_code = status.HTTP_400_BAD_REQUEST
                
            return Response({
                'success': False,
                'message': message,
                'error_code': 'RESEND_FAILED'
            }, status=status_code)


# Function-based views for contact form OTP

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_otp(request):
    """Send OTP for various purposes (email verification, password reset, etc.)."""
    serializer = SendOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    purpose = serializer.validated_data['purpose']
    
    # Get user via service
    from users.services import user_service
    user = user_service.get_user_by_email(email)
    if not user:
        return Response({
            'success': False,
            'message': 'No user found with this email address.',
            'error_code': 'USER_NOT_FOUND'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Send OTP via service
    success, message = otp_service.send_otp(
        email=email,
        purpose=purpose,
        user=user
    )
    
    if success:
        return Response({
            'success': True,
            'message': message,
            'expires_in_minutes': 10
        }, status=status.HTTP_200_OK)
    else:
        status_code = status.HTTP_429_TOO_MANY_REQUESTS if 'Too many requests' in message else status.HTTP_400_BAD_REQUEST
        return Response({
            'success': False,
            'message': message,
            'error_code': 'OTP_SEND_FAILED'
        }, status=status_code)


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
    if not email_service.is_valid_email(email):
        return Response({
            'success': False,
            'message': 'Invalid email address format.',
            'error_code': 'INVALID_EMAIL'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Send OTP via service (no user required for contact form)
    success, message = otp_service.send_otp(
        email=email,
        purpose=purpose,
        user=None
    )
    
    if success:
        return Response({
            'success': True,
            'message': message,
            'expires_in_minutes': 10
        }, status=status.HTTP_200_OK)
    else:
        status_code = status.HTTP_429_TOO_MANY_REQUESTS if 'Too many requests' in message else status.HTTP_400_BAD_REQUEST
        return Response({
            'success': False,
            'message': message,
            'error_code': 'OTP_SEND_FAILED'
        }, status=status_code)


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
    
    # Verify OTP via service
    success, message, otp_record = otp_service.verify_otp(email, otp_code, purpose)
    
    if success:
        return Response({
            'success': True,
            'message': 'Email verified successfully.',
        }, status=status.HTTP_200_OK)
    else:
        status_code = status.HTTP_400_BAD_REQUEST
        if 'expired' in message.lower():
            status_code = status.HTTP_410_GONE
        elif 'attempts' in message.lower():
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
            
        return Response({
            'success': False,
            'message': message,
            'error_code': 'VERIFICATION_FAILED'
        }, status=status_code)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_email(request):
    """Verify user email via service."""
    from users.services import user_service
    
    # Mark user as verified via service
    success, message = user_service.mark_as_verified(request.user)
    
    if success:
        return Response(
            {'message': message},
            status=status.HTTP_200_OK
        )
    else:
        return Response(
            {'error': message},
            status=status.HTTP_400_BAD_REQUEST
        )
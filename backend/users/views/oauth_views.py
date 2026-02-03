"""
OAuth Authentication Views

Handles OAuth authentication flows (Google OAuth, Apple Sign-In).
Uses OAuth service for all business logic.
"""

from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from users.services.oauth_service import oauth_service
from users.services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)


class OAuthRateThrottle(ScopedRateThrottle):
    """Custom throttle for OAuth endpoints to prevent abuse."""
    scope = 'oauth'


class GoogleOAuthView(APIView):
    """
    Google OAuth authentication endpoint.

    Accepts Google ID token from frontend, verifies it,
    and either creates a new user or logs in existing user.
    """

    permission_classes = [permissions.AllowAny]
    throttle_classes = [OAuthRateThrottle]

    def post(self, request, *args, **kwargs):
        """
        Authenticate user with Google OAuth token.

        Expected payload:
        {
            "token": "Google ID token from frontend"
        }

        Returns:
        {
            "success": true,
            "message": "Login successful",
            "user": {...},
            "tokens": {
                "access": "...",
                "refresh": "..."
            }
        }
        """
        token = request.data.get('token')

        if not token:
            return Response({
                'success': False,
                'message': 'Google token is required',
                'error_code': 'TOKEN_REQUIRED'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate via OAuth service
        success, message, user, tokens = oauth_service.authenticate_with_google(token)

        if not success:
            return Response({
                'success': False,
                'message': message,
                'error_code': 'OAUTH_AUTHENTICATION_FAILED'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Get user info
        user_info = AuthService.get_user_info(user)

        return Response({
            'success': True,
            'message': message,
            'user': user_info,
            'tokens': tokens
        }, status=status.HTTP_200_OK)


class GoogleOAuthConfigView(APIView):
    """
    Returns Google OAuth configuration for frontend.

    This endpoint provides the Google Client ID needed for
    frontend OAuth initialization.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        """
        Get Google OAuth configuration.

        Returns:
        {
            "client_id": "Google OAuth Client ID",
            "redirect_uri": "OAuth redirect URI"
        }
        """
        from decouple import config

        client_id = config('GOOGLE_CLIENT_ID', default='')

        if not client_id:
            return Response({
                'success': False,
                'message': 'Google OAuth is not configured',
                'error_code': 'OAUTH_NOT_CONFIGURED'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        redirect_uri = config('GOOGLE_REDIRECT_URI', default='http://localhost:3000/auth/google/callback')

        return Response({
            'success': True,
            'client_id': client_id,
            'redirect_uri': redirect_uri
        }, status=status.HTTP_200_OK)


class AppleOAuthView(APIView):
    """
    Apple Sign-In authentication endpoint.

    Accepts Apple ID token from frontend, verifies it,
    and either creates a new user or logs in existing user.
    """

    permission_classes = [permissions.AllowAny]
    throttle_classes = [OAuthRateThrottle]

    def post(self, request, *args, **kwargs):
        """
        Authenticate user with Apple Sign-In token.

        Expected payload:
        {
            "id_token": "Apple ID token from frontend",
            "authorization_code": "Optional authorization code",
            "user": {  // Optional, only sent on first authorization
                "email": "user@example.com",
                "name": {
                    "firstName": "John",
                    "lastName": "Doe"
                }
            }
        }

        Returns:
        {
            "success": true,
            "message": "Login successful",
            "user": {...},
            "tokens": {
                "access": "...",
                "refresh": "..."
            }
        }
        """
        id_token = request.data.get('id_token')
        user_data = request.data.get('user')  # Optional, only on first sign-in

        if not id_token:
            return Response({
                'success': False,
                'message': 'Apple ID token is required',
                'error_code': 'TOKEN_REQUIRED'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate via OAuth service
        success, message, user, tokens = oauth_service.authenticate_with_apple(id_token, user_data)

        if not success:
            return Response({
                'success': False,
                'message': message,
                'error_code': 'OAUTH_AUTHENTICATION_FAILED'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Get user info
        user_info = AuthService.get_user_info(user)

        return Response({
            'success': True,
            'message': message,
            'user': user_info,
            'tokens': tokens
        }, status=status.HTTP_200_OK)


class AppleOAuthConfigView(APIView):
    """
    Returns Apple Sign-In configuration for frontend.

    This endpoint provides the Apple Client ID (Service ID) needed for
    frontend OAuth initialization.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        """
        Get Apple Sign-In configuration.

        Returns:
        {
            "client_id": "Apple Service ID (Client ID)",
            "redirect_uri": "OAuth redirect URI"
        }
        """
        from decouple import config

        client_id = config('APPLE_CLIENT_ID', default='')

        if not client_id:
            return Response({
                'success': False,
                'message': 'Apple Sign-In is not configured',
                'error_code': 'OAUTH_NOT_CONFIGURED'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        redirect_uri = config('APPLE_REDIRECT_URI', default='http://localhost:3000/auth/apple/callback')

        return Response({
            'success': True,
            'client_id': client_id,
            'redirect_uri': redirect_uri
        }, status=status.HTTP_200_OK)

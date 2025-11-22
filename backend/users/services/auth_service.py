"""
Authentication Service - Business logic for authentication

Handles authentication workflows: login validation, token generation, etc.
Uses repositories for database operations.
NO direct database queries, NO HTTP handling.
"""

import logging
from typing import Tuple, Optional, Dict
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User
from users.repositories import user_repository

logger = logging.getLogger(__name__)


class AuthService:
    """
    Authentication business logic service.
    
    Orchestrates authentication workflows.
    Enforces security and validation rules.
    """
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> Tuple[bool, str, Optional[User]]:
        """
        Authenticate user with email and password.
        
        Business rules:
        - User must exist
        - Password must match
        - User must be active
        - User must be verified
        - User must be approved (role-specific)
        
        Args:
            email (str): User email
            password (str): User password
            
        Returns:
            Tuple[bool, str, User or None]: (success, message, user)
        """
        try:
            # Check if user exists
            user = user_repository.get_by_email(email)
            if not user:
                logger.warning(f"Login attempt with non-existent email: {email}")
                return False, "Invalid email or password", None
            
            # Verify password
            if not user.check_password(password):
                logger.warning(f"Invalid password attempt for user: {email}")
                return False, "Invalid email or password", None
            
            # Check if user is active
            if not user.is_active:
                logger.warning(f"Login attempt for inactive user: {email}")
                return False, "Account is disabled", None
            
            # Check if user is verified
            if not user.is_verified:
                logger.warning(f"Login attempt for unverified user: {email}")
                return False, "Please verify your email address before logging in", None
            
            # Check if user is approved (role-specific)
            if not user.is_approved:
                if user.role == 'knowledge_partner_instructor':
                    return False, "Your instructor account is pending approval by the Knowledge Partner admin", None
                elif user.role == 'knowledge_partner':
                    return False, "Your Knowledge Partner account is pending approval by the super admin", None
                else:
                    return False, "Account is pending approval", None
            
            logger.info(f"User authenticated successfully: {email}")
            return True, "Authentication successful", user
            
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return False, "Authentication failed", None
    
    @staticmethod
    def generate_tokens(user: User) -> Dict[str, str]:
        """
        Generate JWT access and refresh tokens for user.
        
        Args:
            user (User): User instance
            
        Returns:
            dict: {'access': access_token, 'refresh': refresh_token}
        """
        try:
            refresh = RefreshToken.for_user(user)
            return {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        except Exception as e:
            logger.error(f"Failed to generate tokens for user {user.email}: {str(e)}")
            return {}
    
    @staticmethod
    def validate_login(email: str, password: str) -> Tuple[bool, str, Optional[User], Dict]:
        """
        Complete login validation and token generation.
        
        This is the main method for login flow.
        Combines authentication and token generation.
        
        Args:
            email (str): User email
            password (str): User password
            
        Returns:
            Tuple[bool, str, User or None, dict]: (success, message, user, tokens)
        """
        # Authenticate user
        success, message, user = AuthService.authenticate_user(email, password)
        
        if not success:
            return False, message, None, {}
        
        # Generate tokens
        tokens = AuthService.generate_tokens(user)
        
        if not tokens:
            return False, "Failed to generate authentication tokens", user, {}
        
        return True, "Login successful", user, tokens
    
    @staticmethod
    def blacklist_token(refresh_token: str) -> Tuple[bool, str]:
        """
        Blacklist refresh token (logout).
        
        Args:
            refresh_token (str): Refresh token to blacklist
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info("Token blacklisted successfully")
            return True, "Logged out successfully"
        except Exception as e:
            logger.error(f"Failed to blacklist token: {str(e)}")
            return False, "Invalid token"
    
    @staticmethod
    def get_user_info(user: User) -> Dict:
        """
        Get user information for authentication response.
        
        Returns safe user info (no sensitive data).
        
        Args:
            user (User): User instance
            
        Returns:
            dict: User information
        """
        try:
            user_info = {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'role_display': user.get_role_display(),
                'is_verified': user.is_verified,
                'is_approved': user.is_approved,
                'knowledge_partner': None
            }
            
            # Add Knowledge Partner info if applicable
            if hasattr(user, 'kp_profile') and user.kp_profile:
                user_info['knowledge_partner'] = {
                    'id': str(user.kp_profile.id),
                    'name': user.kp_profile.name,
                    'type': user.kp_profile.type,
                }
            
            return user_info
            
        except Exception as e:
            logger.error(f"Error getting user info: {str(e)}")
            return {}


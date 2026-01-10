"""
OAuth Service - Business logic for OAuth authentication

Handles OAuth workflows: token verification, user creation/login via OAuth.
Uses repositories for database operations and OAuth adapters for provider-specific logic.
NO direct database queries, NO HTTP handling.
"""

import logging
from typing import Tuple, Optional, Dict
from users.models import User
from users.repositories import user_repository
from users.adapters.oauth import GoogleOAuthAdapter, AppleOAuthAdapter
from users.services.auth_service import AuthService

logger = logging.getLogger(__name__)


class OAuthService:
    """
    OAuth authentication business logic service.

    Orchestrates OAuth workflows for different providers.
    Enforces security and validation rules.
    """

    def __init__(self):
        self.google_adapter = GoogleOAuthAdapter()
        self.apple_adapter = AppleOAuthAdapter()

    def authenticate_with_google(self, token: str) -> Tuple[bool, str, Optional[User], Dict]:
        """
        Authenticate or register user with Google OAuth.

        Business logic:
        1. Verify Google token
        2. Check if user exists by google_id
        3. If exists, log them in
        4. If not exists, check by email
        5. If email exists, link accounts
        6. If new user, create account

        Args:
            token (str): Google ID token from frontend

        Returns:
            Tuple[bool, str, User or None, dict]: (success, message, user, tokens)
        """
        try:
            # Verify token with Google
            google_user_info = self.google_adapter.verify_token(token)

            google_id = google_user_info['google_id']
            email = google_user_info['email']
            email_verified = google_user_info['email_verified']
            full_name = google_user_info['full_name']

            # Security check: Google email must be verified
            if not email_verified:
                logger.warning(f"Google OAuth attempt with unverified email: {email}")
                return False, "Google email is not verified", None, {}

            # Try to find user by google_id first
            user = user_repository.get_by_google_id(google_id)

            if user:
                # User exists with this google_id, log them in
                logger.info(f"Existing Google OAuth user logging in: {email}")
                return self._login_oauth_user(user)

            # Check if user exists with this email
            user = user_repository.get_by_email(email)

            if user:
                # User exists with email but no google_id
                # Link Google account to existing user
                logger.info(f"Linking Google account to existing user: {email}")
                return self._link_google_account(user, google_id, google_user_info)

            # New user, create account
            logger.info(f"Creating new user from Google OAuth: {email}")
            return self._create_oauth_user(google_user_info)

        except ValueError as e:
            logger.error(f"Google token verification failed: {str(e)}")
            return False, str(e), None, {}
        except Exception as e:
            logger.error(f"Unexpected error in Google OAuth: {str(e)}")
            return False, "Authentication failed. Please try again.", None, {}

    def _login_oauth_user(self, user: User) -> Tuple[bool, str, User, Dict]:
        """
        Login existing OAuth user.

        Args:
            user (User): Existing user

        Returns:
            Tuple[bool, str, User, dict]: (success, message, user, tokens)
        """
        # Check if user is active
        if not user.is_active:
            logger.warning(f"Login attempt for inactive OAuth user: {user.email}")
            return False, "Account is disabled", None, {}

        # OAuth users are auto-verified, but check approval
        if not user.is_approved:
            if user.role == 'knowledge_partner_instructor':
                return False, "Your instructor account is pending approval by the Knowledge Partner admin", None, {}
            elif user.role == 'knowledge_partner':
                return False, "Your Knowledge Partner account is pending approval by the super admin", None, {}
            else:
                return False, "Account is pending approval", None, {}

        # Generate tokens
        tokens = AuthService.generate_tokens(user)

        if not tokens:
            return False, "Failed to generate authentication tokens", user, {}

        return True, "Login successful", user, tokens

    def _link_google_account(self, user: User, google_id: str, google_user_info: Dict) -> Tuple[bool, str, User, Dict]:
        """
        Link Google account to existing user.

        Args:
            user (User): Existing user
            google_id (str): Google user ID
            google_user_info (dict): Google user information

        Returns:
            Tuple[bool, str, User, dict]: (success, message, user, tokens)
        """
        try:
            # Update user with Google credentials
            user.google_id = google_id
            user.auth_provider = 'google'
            user.is_verified = True  # Google emails are pre-verified
            user.save()

            logger.info(f"Google account linked successfully: {user.email}")

            # Login the user
            return self._login_oauth_user(user)

        except Exception as e:
            logger.error(f"Failed to link Google account: {str(e)}")
            return False, "Failed to link Google account", None, {}

    def _create_oauth_user(self, google_user_info: Dict) -> Tuple[bool, str, User, Dict]:
        """
        Create new user from Google OAuth.

        Args:
            google_user_info (dict): Google user information

        Returns:
            Tuple[bool, str, User, dict]: (success, message, user, tokens)
        """
        try:
            # Create new user
            user = User.objects.create(
                email=google_user_info['email'],
                full_name=google_user_info['full_name'] or google_user_info['email'].split('@')[0],
                google_id=google_user_info['google_id'],
                auth_provider='google',
                role='learner',  # Default role
                is_verified=True,  # Google emails are pre-verified
                is_approved=True,  # Auto-approve learners
                is_active=True,
            )

            # Note: No password needed for OAuth users
            user.set_unusable_password()
            user.save()

            # Create learner profile
            from users.models import LearnerProfile
            LearnerProfile.objects.create(user=user)

            logger.info(f"New OAuth user created: {user.email}")

            # Generate tokens
            tokens = AuthService.generate_tokens(user)

            if not tokens:
                return False, "Failed to generate authentication tokens", user, {}

            return True, "Registration successful", user, tokens

        except Exception as e:
            logger.error(f"Failed to create OAuth user: {str(e)}")
            return False, "Failed to create user account", None, {}

    def authenticate_with_apple(self, id_token: str, user_data: Optional[Dict] = None) -> Tuple[bool, str, Optional[User], Dict]:
        """
        Authenticate or register user with Apple Sign-In.

        Business logic:
        1. Verify Apple ID token
        2. Check if user exists by apple_id
        3. If exists, log them in
        4. If not exists, check by email
        5. If email exists, link accounts
        6. If new user, create account

        Args:
            id_token (str): Apple ID token from frontend
            user_data (dict): Optional user data (name, email) from first sign-in

        Returns:
            Tuple[bool, str, User or None, dict]: (success, message, user, tokens)
        """
        try:
            # Verify token with Apple
            apple_user_info = self.apple_adapter.verify_token(id_token, user_data)

            apple_id = apple_user_info['apple_id']
            email = apple_user_info['email']
            email_verified = apple_user_info['email_verified']
            full_name = apple_user_info['full_name']

            # Security check: Apple email must be verified
            if not email_verified:
                logger.warning(f"Apple Sign-In attempt with unverified email: {email}")
                return False, "Apple email is not verified", None, {}

            # Email is required
            if not email:
                logger.warning("Apple Sign-In attempt without email")
                return False, "Email is required for registration", None, {}

            # Try to find user by apple_id first
            user = user_repository.get_by_apple_id(apple_id)

            if user:
                # User exists with this apple_id, log them in
                logger.info(f"Existing Apple Sign-In user logging in: {email}")
                return self._login_oauth_user(user)

            # Check if user exists with this email
            user = user_repository.get_by_email(email)

            if user:
                # User exists with email but no apple_id
                # Link Apple account to existing user
                logger.info(f"Linking Apple account to existing user: {email}")
                return self._link_apple_account(user, apple_id, apple_user_info)

            # New user, create account
            logger.info(f"Creating new user from Apple Sign-In: {email}")
            return self._create_apple_user(apple_user_info)

        except ValueError as e:
            logger.error(f"Apple token verification failed: {str(e)}")
            return False, str(e), None, {}
        except Exception as e:
            logger.error(f"Unexpected error in Apple Sign-In: {str(e)}")
            return False, "Authentication failed. Please try again.", None, {}

    def _link_apple_account(self, user: User, apple_id: str, apple_user_info: Dict) -> Tuple[bool, str, User, Dict]:
        """
        Link Apple account to existing user.

        Args:
            user (User): Existing user
            apple_id (str): Apple user ID
            apple_user_info (dict): Apple user information

        Returns:
            Tuple[bool, str, User, dict]: (success, message, user, tokens)
        """
        try:
            # Update user with Apple credentials
            user.apple_id = apple_id
            user.auth_provider = 'apple'
            user.is_verified = True  # Apple emails are pre-verified
            user.save()

            logger.info(f"Apple account linked successfully: {user.email}")

            # Login the user
            return self._login_oauth_user(user)

        except Exception as e:
            logger.error(f"Failed to link Apple account: {str(e)}")
            return False, "Failed to link Apple account", None, {}

    def _create_apple_user(self, apple_user_info: Dict) -> Tuple[bool, str, User, Dict]:
        """
        Create new user from Apple Sign-In.

        Args:
            apple_user_info (dict): Apple user information

        Returns:
            Tuple[bool, str, User, dict]: (success, message, user, tokens)
        """
        try:
            # Create new user
            # Use full_name from Apple if available, otherwise derive from email
            full_name = apple_user_info.get('full_name')
            if not full_name:
                full_name = apple_user_info['email'].split('@')[0]

            user = User.objects.create(
                email=apple_user_info['email'],
                full_name=full_name,
                apple_id=apple_user_info['apple_id'],
                auth_provider='apple',
                role='learner',  # Default role
                is_verified=True,  # Apple emails are pre-verified
                is_approved=True,  # Auto-approve learners
                is_active=True,
            )

            # Note: No password needed for OAuth users
            user.set_unusable_password()
            user.save()

            # Create learner profile
            from users.models import LearnerProfile
            LearnerProfile.objects.create(user=user)

            logger.info(f"New Apple Sign-In user created: {user.email}")

            # Generate tokens
            tokens = AuthService.generate_tokens(user)

            if not tokens:
                return False, "Failed to generate authentication tokens", user, {}

            return True, "Registration successful", user, tokens

        except Exception as e:
            logger.error(f"Failed to create Apple Sign-In user: {str(e)}")
            return False, "Failed to create user account", None, {}


oauth_service = OAuthService()

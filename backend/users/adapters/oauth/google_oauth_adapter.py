"""
Google OAuth Adapter for authentication.
"""
from google.oauth2 import id_token
from google.auth.transport import requests
from decouple import config
import logging

logger = logging.getLogger(__name__)


class GoogleOAuthAdapter:
    """
    Adapter for Google OAuth authentication.
    Handles verification of Google ID tokens and extraction of user information.
    """

    def __init__(self):
        self.client_id = config('GOOGLE_CLIENT_ID', default='')
        if not self.client_id:
            logger.warning("GOOGLE_CLIENT_ID not configured in environment")

    def verify_token(self, token: str) -> dict:
        """
        Verify Google OAuth token and extract user information.

        Args:
            token: Google ID token from frontend

        Returns:
            dict: User information from Google

        Raises:
            ValueError: If token is invalid or verification fails
        """
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                self.client_id
            )

            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Invalid token issuer')

            # Extract user information
            return {
                'google_id': idinfo['sub'],
                'email': idinfo['email'],
                'email_verified': idinfo.get('email_verified', False),
                'full_name': idinfo.get('name', ''),
                'first_name': idinfo.get('given_name', ''),
                'last_name': idinfo.get('family_name', ''),
                'picture': idinfo.get('picture', ''),
            }

        except ValueError as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise ValueError(f"Invalid Google token: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during token verification: {str(e)}")
            raise ValueError(f"Token verification failed: {str(e)}")

    def get_authorization_url(self) -> str:
        """
        Get the Google OAuth authorization URL.
        This is handled on the frontend, but provided for reference.

        Returns:
            str: Google OAuth authorization URL
        """
        redirect_uri = config('GOOGLE_REDIRECT_URI', default='http://localhost:3000/auth/google/callback')

        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'id_token',
            'scope': 'openid email profile',
            'nonce': 'random_nonce_value'  # Should be generated per request
        }

        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{query_string}"

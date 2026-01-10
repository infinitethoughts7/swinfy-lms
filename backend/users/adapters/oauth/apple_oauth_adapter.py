"""
Apple Sign-In Adapter for authentication.
"""
import jwt
import requests as http_requests
from typing import Dict, Optional
from decouple import config
import logging

logger = logging.getLogger(__name__)


class AppleOAuthAdapter:
    """
    Adapter for Apple Sign-In authentication.

    Apple's Sign-In uses JWT tokens that need to be verified
    against Apple's public keys.
    """

    APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys"
    APPLE_ISSUER = "https://appleid.apple.com"

    def __init__(self):
        self.client_id = config('APPLE_CLIENT_ID', default='')
        self.team_id = config('APPLE_TEAM_ID', default='')
        self.key_id = config('APPLE_KEY_ID', default='')
        self.private_key = config('APPLE_PRIVATE_KEY', default='').replace('\\n', '\n')

        if not self.client_id:
            logger.warning("APPLE_CLIENT_ID not configured in environment")

    def verify_token(self, id_token: str, user_data: Optional[Dict] = None) -> Dict:
        """
        Verify Apple Sign-In ID token and extract user information.

        Args:
            id_token (str): Apple ID token from frontend
            user_data (dict): Optional user data (name, email) from first sign-in
                             Apple only sends user info on the first authorization

        Returns:
            dict: User information extracted from token

        Raises:
            ValueError: If token verification fails
        """
        try:
            # Fetch Apple's public keys
            keys_response = http_requests.get(self.APPLE_KEYS_URL, timeout=10)
            keys_response.raise_for_status()
            keys = keys_response.json()['keys']

            # Get the key ID from the token header
            unverified_header = jwt.get_unverified_header(id_token)
            key_id = unverified_header.get('kid')

            if not key_id:
                raise ValueError("Token header missing key ID (kid)")

            # Find the matching key
            apple_key = None
            for key in keys:
                if key['kid'] == key_id:
                    apple_key = key
                    break

            if not apple_key:
                raise ValueError("Unable to find matching Apple public key")

            # Convert JWK to PEM format for verification
            from jwt.algorithms import RSAAlgorithm
            public_key = RSAAlgorithm.from_jwk(apple_key)

            # Verify and decode the token
            decoded = jwt.decode(
                id_token,
                public_key,
                algorithms=['RS256'],
                audience=self.client_id,
                issuer=self.APPLE_ISSUER,
            )

            # Extract user info from token
            apple_id = decoded['sub']
            email = decoded.get('email', '')
            email_verified = decoded.get('email_verified', False)

            # Apple only sends name on first sign-in via user_data parameter
            full_name = None
            if user_data and user_data.get('name'):
                first_name = user_data['name'].get('firstName', '')
                last_name = user_data['name'].get('lastName', '')
                full_name = f"{first_name} {last_name}".strip()

            # If email is from user_data (first sign-in), use it
            if not email and user_data and user_data.get('email'):
                email = user_data['email']

            return {
                'apple_id': apple_id,
                'email': email,
                'email_verified': email_verified in [True, 'true', 1],
                'full_name': full_name,
            }

        except jwt.ExpiredSignatureError:
            logger.error("Apple ID token has expired")
            raise ValueError("Apple ID token has expired")
        except jwt.InvalidAudienceError:
            logger.error("Apple ID token has invalid audience")
            raise ValueError("Apple ID token has invalid audience")
        except jwt.InvalidIssuerError:
            logger.error("Apple ID token has invalid issuer")
            raise ValueError("Apple ID token has invalid issuer")
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid Apple ID token: {str(e)}")
            raise ValueError(f"Invalid Apple ID token: {str(e)}")
        except http_requests.RequestException as e:
            logger.error(f"Failed to fetch Apple public keys: {str(e)}")
            raise ValueError("Failed to verify Apple token - could not fetch public keys")
        except Exception as e:
            logger.error(f"Apple token verification error: {str(e)}")
            raise ValueError(f"Failed to verify Apple ID token: {str(e)}")

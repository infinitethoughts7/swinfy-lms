#!/usr/bin/env python3
"""
Generate secure Django SECRET_KEY for production use.
Run this script to generate a new, secure secret key.
"""

import secrets
import string

def generate_secret_key(length=50):
    """Generate a secure random secret key."""
    # Use a mix of letters, digits, and special characters
    characters = string.ascii_letters + string.digits + string.punctuation
    # Remove characters that might cause issues in environment files
    characters = characters.replace('"', '').replace("'", '').replace('\\', '')
    
    # Generate the secret key
    secret_key = ''.join(secrets.choice(characters) for _ in range(length))
    return secret_key

def main():
    """Main function to generate and display secret keys."""
    print("🔐 Generating secure Django SECRET_KEY...")
    print("=" * 50)
    
    # Generate Django SECRET_KEY
    django_secret = generate_secret_key(50)
    print(f"DJANGO_SECRET_KEY:")
    print(f"SECRET_KEY={django_secret}")
    print()
    
    # Generate JWT SECRET_KEY
    jwt_secret = generate_secret_key(32)
    print(f"JWT_SECRET_KEY:")
    print(f"JWT_SECRET_KEY={jwt_secret}")
    print()
    
    print("=" * 50)
    print("📋 Instructions:")
    print("1. Copy these values to your .env file")
    print("2. NEVER commit .env files to Git")
    print("3. Use different keys for each environment")
    print("4. Keep these keys secure and private")
    print()
    print("⚠️  WARNING: These are example keys. Generate new ones for production!")

if __name__ == "__main__":
    main()

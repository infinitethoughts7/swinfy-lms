# Google OAuth Integration Setup Guide

This guide will walk you through setting up Google OAuth authentication for the Swinfy LMS.

## Overview

The traditional email/password registration has been replaced with Google OAuth for a streamlined authentication experience. Users can now sign up and sign in using their Google accounts.

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install the required Google OAuth libraries:
- `google-auth==2.36.0`
- `google-auth-oauthlib==1.2.1`
- `google-auth-httplib2==0.2.0`

### 2. Configure Google OAuth Credentials

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity Services)

#### Step 2: Create OAuth Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth Client ID**
3. Select **Web application**
4. Configure the OAuth consent screen if prompted
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://yourdomain.com`)
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - Your production callback URL
7. Click **Create** and copy the **Client ID**

### 3. Configure Environment Variables

Update your `backend/.env` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 4. Run Database Migrations

```bash
cd backend
python manage.py migrate
```

This will apply the migration that adds:
- `google_id` field to the User model
- `auth_provider` field to track authentication method

### 5. Start the Backend Server

```bash
python manage.py runserver
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `@react-oauth/google` - Google OAuth library for React

### 2. Start the Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Google OAuth Endpoints

1. **Get OAuth Config** (Public)
   ```
   GET /api/auth/oauth/google/config/
   ```
   Returns the Google Client ID for frontend initialization.

2. **Google OAuth Authentication** (Public)
   ```
   POST /api/auth/oauth/google/
   ```
   Accepts Google ID token and returns JWT tokens.

   **Request Body:**
   ```json
   {
     "token": "Google ID token from frontend"
   }
   ```

   **Response:**
   ```json
   {
     "success": true,
     "message": "Login successful",
     "user": {
       "id": "uuid",
       "email": "user@example.com",
       "full_name": "John Doe",
       "role": "learner",
       "is_verified": true,
       "is_approved": true
     },
     "tokens": {
       "access": "JWT access token",
       "refresh": "JWT refresh token"
     }
   }
   ```

## User Flow

### New User Registration

1. User clicks "Sign up with Google" on `/auth/register`
2. Google OAuth popup appears
3. User selects their Google account
4. Google returns ID token to frontend
5. Frontend sends token to backend `/api/auth/oauth/google/`
6. Backend verifies token with Google
7. Backend creates new user account with:
   - Email from Google
   - Full name from Google
   - Auto-verified email
   - Default role: learner
   - Learner profile created automatically
8. Backend returns JWT tokens
9. Frontend saves tokens and redirects to dashboard

### Existing User Login

1. User clicks "Sign in with Google" on `/auth/login`
2. Google OAuth popup appears
3. User selects their Google account
4. Google returns ID token to frontend
5. Frontend sends token to backend
6. Backend verifies token and finds existing user
7. Backend returns JWT tokens
8. Frontend saves tokens and redirects to dashboard

### Account Linking

If a user previously registered with email/password and later signs in with Google using the same email:
- The Google account is automatically linked to the existing user account
- The `google_id` is saved to the user record
- The `auth_provider` is updated to 'google'
- User can now sign in with Google

## Database Schema Changes

### User Model Updates

```python
class User(AbstractUser):
    # Existing fields...

    # New OAuth fields
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    auth_provider = models.CharField(max_length=50, default='email', choices=[
        ('email', 'Email/Password'),
        ('google', 'Google OAuth'),
    ])
```

## Security Features

1. **Token Verification**: All Google ID tokens are verified with Google's servers
2. **Email Verification**: Google accounts are pre-verified (no OTP needed)
3. **Auto-approval**: Learners are automatically approved upon registration
4. **Secure Token Storage**: JWT tokens are stored in localStorage (consider httpOnly cookies for production)
5. **No Password Storage**: OAuth users don't have passwords (unusable_password is set)

## Architecture

### Clean Architecture Pattern

The implementation follows the existing clean architecture:

```
┌─────────────────┐
│  Views Layer    │  HTTP handling (oauth_views.py)
└────────┬────────┘
         │
┌────────▼────────┐
│ Services Layer  │  Business logic (oauth_service.py)
└────────┬────────┘
         │
┌────────▼────────┐
│Repository Layer │  Database operations (user_repository.py)
└────────┬────────┘
         │
┌────────▼────────┐
│  Models Layer   │  Data structure (User model)
└─────────────────┘
```

### Backend Structure

```
backend/
├── users/
│   ├── adapters/
│   │   └── oauth/
│   │       ├── __init__.py
│   │       └── google_oauth_adapter.py   # Google token verification
│   ├── services/
│   │   └── oauth_service.py              # OAuth business logic
│   ├── views/
│   │   └── oauth_views.py                # OAuth endpoints
│   ├── repositories/
│   │   └── user_repository.py            # Added get_by_google_id()
│   └── migrations/
│       └── 0017_add_oauth_fields.py      # OAuth fields migration
```

### Frontend Structure

```
frontend/
├── app/
│   └── auth/
│       ├── register/
│       │   └── page.tsx                  # Google OAuth registration
│       └── login/
│           └── page.tsx                  # Google OAuth login
└── lib/
    └── api/
        └── auth.ts                       # Added OAuth API methods
```

## Testing

### Manual Testing Steps

1. **Test New User Registration**
   - Navigate to `http://localhost:3000/auth/register`
   - Click "Sign up with Google"
   - Select a Google account
   - Verify redirect to dashboard
   - Check that user is created in database

2. **Test Existing User Login**
   - Sign out
   - Navigate to `http://localhost:3000/auth/login`
   - Click "Sign in with Google"
   - Select the same Google account
   - Verify redirect to dashboard

3. **Test Account Linking**
   - Create a user with email/password (if traditional registration still exists)
   - Sign in with Google using the same email
   - Verify account is linked (check `google_id` in database)

### Database Verification

```sql
-- Check OAuth users
SELECT id, email, full_name, google_id, auth_provider, is_verified
FROM users_user
WHERE auth_provider = 'google';

-- Check account linking
SELECT id, email, google_id, auth_provider
FROM users_user
WHERE google_id IS NOT NULL;
```

## Troubleshooting

### Common Issues

1. **"Google OAuth is not configured" error**
   - Ensure `GOOGLE_CLIENT_ID` is set in backend `.env`
   - Restart the backend server after adding the environment variable

2. **"Invalid Google token" error**
   - Verify the Client ID matches in Google Cloud Console and `.env`
   - Check that the authorized JavaScript origins are correct
   - Ensure the Google+ API is enabled

3. **CORS errors**
   - Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL in backend `.env`
   - Check `CORS_ALLOW_CREDENTIALS=True` is set

4. **"Failed to fetch Google OAuth config" in frontend**
   - Ensure backend is running
   - Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
   - Verify the `/api/auth/oauth/google/config/` endpoint is accessible

5. **Users created but tokens not returned**
   - Check Django logs for errors
   - Verify JWT settings in `settings.py`
   - Ensure `djangorestframework-simplejwt` is installed

## Production Deployment

### Additional Steps for Production

1. **Update OAuth Settings**
   - Add production domain to Google Cloud Console authorized origins
   - Add production callback URL to authorized redirect URIs
   - Update `GOOGLE_REDIRECT_URI` in production `.env`

2. **Security Enhancements**
   - Use HTTPS for all OAuth flows
   - Consider using httpOnly cookies instead of localStorage for tokens
   - Implement CSRF protection
   - Add rate limiting to OAuth endpoints

3. **Environment Variables**
   ```bash
   # Production backend .env
   DEBUG=False
   GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   ```

## Migration Notes

### Migrating from Email/Password to OAuth

If you have existing users with email/password authentication:

1. OAuth users are auto-verified (no OTP needed)
2. Existing users can link their Google accounts by signing in with Google
3. Users with OAuth accounts cannot use password-based login
4. To re-enable password login for OAuth users, you would need to:
   - Add a "Link Password" feature
   - Allow users to set a password in their profile

### Rollback Plan

If you need to rollback to email/password authentication:

1. Keep the traditional registration endpoint active
2. Add a feature flag to toggle between OAuth and email/password
3. The OAuth fields are nullable, so they won't break existing functionality

## Support

For issues or questions:
- Check the Django logs: `backend/logs/` (if configured)
- Check the frontend console for errors
- Review Google Cloud Console OAuth logs
- Verify all environment variables are set correctly

## Future Enhancements

Potential improvements for the OAuth implementation:

1. **Multiple OAuth Providers**
   - Add GitHub OAuth
   - Add Microsoft OAuth
   - Add Apple Sign In

2. **Account Management**
   - Allow users to disconnect OAuth accounts
   - Allow users to add/remove authentication methods
   - Show linked accounts in user profile

3. **Enhanced Security**
   - Implement OAuth state parameter for CSRF protection
   - Add nonce verification
   - Implement token refresh logic
   - Add OAuth session management

4. **Better UX**
   - Remember user's preferred sign-in method
   - Add "Continue with Google" on landing page
   - Implement one-tap sign-in across the site
   - Add profile picture from Google account

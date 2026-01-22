# Feature: Google OAuth for Students

## Status: COMPLETE

Both backend and frontend implementations are complete and ready for testing.

## Overview

"Continue with Google" button for student registration/login. Uses Google Identity Services SDK on frontend with Django JWT authentication on backend.

## Implementation Summary

### Backend (Complete)

| Component | File | Status |
|-----------|------|--------|
| Google OAuth Adapter | `backend/users/adapters/oauth/google_oauth_adapter.py` | ✅ |
| Apple OAuth Adapter | `backend/users/adapters/oauth/apple_oauth_adapter.py` | ✅ |
| OAuth Service | `backend/users/services/oauth_service.py` | ✅ |
| Service Export | `backend/users/services/__init__.py` | ✅ |
| OAuth Views | `backend/users/views/oauth_views.py` | ✅ |
| URL Routes | `backend/users/urls.py` | ✅ |
| User Repository | `backend/users/repositories/user_repository.py` | ✅ |
| Dependencies | `backend/requirements.txt` | ✅ |

### Frontend (Complete)

| Component | File | Status |
|-----------|------|--------|
| AuthAPI methods | `frontend/lib/api/auth.ts` | ✅ |
| Login page | `frontend/app/auth/login/page.tsx` | ✅ |
| Register page | `frontend/app/auth/register/page.tsx` | ✅ |
| Auth utilities | `frontend/lib/auth.ts` | ✅ |
| Google SDK | Loaded dynamically | ✅ |
| Dependencies | `frontend/package.json` | ✅ |

## API Endpoints

### POST /api/auth/oauth/google/
Authenticate user with Google ID token.

**Request:**
```json
{
  "token": "google-id-token-from-frontend"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "full_name": "User Name",
    "role": "learner"
  },
  "tokens": {
    "access": "jwt-access-token",
    "refresh": "jwt-refresh-token"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid Google token",
  "error_code": "OAUTH_AUTHENTICATION_FAILED"
}
```

### GET /api/auth/oauth/google/config/
Get Google OAuth client configuration for frontend.

**Response:**
```json
{
  "success": true,
  "client_id": "your-google-client-id.apps.googleusercontent.com",
  "redirect_uri": "http://localhost:3000/auth/google/callback"
}
```

## Technical Architecture

### Frontend Flow
```
1. Page loads → Fetch config from /api/auth/oauth/google/config/
2. Load Google Identity Services SDK
3. User clicks "Continue with Google"
4. Google popup opens → User authenticates
5. Google returns ID token via callback
6. Frontend calls POST /api/auth/oauth/google/ with token
7. Backend verifies token, returns Django JWT
8. Frontend stores JWT in localStorage
9. Redirect to /dashboard
```

### Backend Flow
```
1. Receive Google ID token
2. GoogleOAuthAdapter.verify_token() → calls Google API
3. Extract user info (google_id, email, name)
4. Check if user exists by google_id → login
5. Check if user exists by email → link account
6. Otherwise → create new learner account
7. Generate Django JWT tokens
8. Return user info + tokens
```

### File Structure

```
backend/users/
├── adapters/oauth/
│   ├── __init__.py
│   ├── google_oauth_adapter.py    # Token verification
│   └── apple_oauth_adapter.py
├── services/
│   ├── __init__.py                # Exports oauth_service
│   └── oauth_service.py           # Business logic
├── views/
│   └── oauth_views.py             # HTTP handlers
├── repositories/
│   └── user_repository.py         # get_by_google_id()
└── urls.py                        # Route: oauth/google/

frontend/
├── lib/
│   ├── api/auth.ts                # AuthAPI.googleOAuth()
│   └── auth.ts                    # Token management
└── app/auth/
    ├── login/page.tsx             # Google button + handler
    └── register/page.tsx          # Google button + handler
```

## Environment Variables

### Backend (.env)
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# Note: Client ID is fetched from backend, not hardcoded
```

## Dependencies

### Backend (requirements.txt)
```
google-auth==2.36.0
google-auth-oauthlib==1.2.1
google-auth-httplib2==0.2.0
```

### Frontend (package.json)
```
"@react-oauth/google": "^0.12.1"
```
Note: Currently using Google Identity Services SDK directly, not @react-oauth/google.

## Security

1. **Email Verification**: Only Google accounts with verified emails accepted
2. **Token Validation**: Verifies issuer is `accounts.google.com`
3. **Client ID Check**: Token validated against configured GOOGLE_CLIENT_ID
4. **No Password**: OAuth users have unusable password (cannot use email login)
5. **Role Restriction**: OAuth creates only `learner` role accounts
6. **Auto-approve**: Learners auto-approved (`is_approved=True`)

## What's NOT Changing

- KP login flow (email + auto-password)
- Instructor login flow (email + auto-password)
- JWT system (Django still issues JWT)
- All existing APIs
- Admin flows

## Testing

### Prerequisites
1. Backend running: `python manage.py runserver`
2. Frontend running: `npm run dev`
3. Valid GOOGLE_CLIENT_ID in backend .env

### Test Cases

1. **New user registration via Google**
   - Click "Sign up with Google" on register page
   - Complete Google popup
   - Verify new user created with `role=learner`
   - Verify redirect to dashboard

2. **Existing user login via Google**
   - Register via Google first
   - Logout
   - Click "Login with Google" on login page
   - Verify same user logged in

3. **Account linking**
   - Register via email (learner)
   - Logout
   - Click "Login with Google" with same email
   - Verify google_id linked to existing account

4. **Error handling**
   - Invalid token → Error message displayed
   - Google popup closed → No error (silent fail)
   - Server error → Error message displayed

### Manual API Test
```bash
# Get config
curl http://localhost:8000/api/auth/oauth/google/config/

# Authenticate (requires valid token from Google)
curl -X POST http://localhost:8000/api/auth/oauth/google/ \
  -H "Content-Type: application/json" \
  -d '{"token": "valid-google-id-token"}'
```

## Rollback Plan

Google OAuth is additive. If issues occur:
1. Remove Google button from UI (frontend only change)
2. Users can still use email + OTP login
3. Existing OAuth users can request password reset

## Future Improvements

- [ ] Add Google One Tap sign-in
- [ ] Implement refresh token rotation
- [ ] Add account unlinking feature
- [ ] Support Google OAuth for other roles (optional)

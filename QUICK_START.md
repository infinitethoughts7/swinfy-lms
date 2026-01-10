# Quick Start Guide - Google OAuth Setup

Follow these steps to quickly set up Google OAuth authentication.

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ installed
- PostgreSQL database running
- Google Cloud account

---

## Step 1: Google Cloud Setup (5 minutes)

### 1.1 Create OAuth Credentials

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth Client ID**
5. Select **Web application**
6. Configure:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/auth/google/callback`
7. Copy the **Client ID** (you'll need this in Step 2)

---

## Step 2: Backend Setup (3 minutes)

### 2.1 Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2.2 Configure Environment

Create or update `backend/.env`:

```bash
# Copy from example
cp .env.example .env

# Edit .env and add:
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Also ensure these are set:
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/swinfy_lms
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 2.3 Run Migrations

```bash
python manage.py migrate
```

### 2.4 Start Backend Server

```bash
python manage.py runserver
```

Backend should now be running at `http://localhost:8000`

---

## Step 3: Frontend Setup (2 minutes)

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Environment

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3.3 Start Frontend Server

```bash
npm run dev
```

Frontend should now be running at `http://localhost:3000`

---

## Step 4: Test the Integration (2 minutes)

### 4.1 Test Registration

1. Open browser to `http://localhost:3000/auth/register`
2. Click "Sign up with Google"
3. Select a Google account
4. You should be redirected to `/dashboard`
5. Check your database to confirm user was created

### 4.2 Test Login

1. Sign out (if needed)
2. Go to `http://localhost:3000/auth/login`
3. Click "Sign in with Google"
4. Select the same Google account
5. You should be redirected to `/dashboard`

### 4.3 Verify in Database

```sql
-- Connect to your database
psql -U postgres -d swinfy_lms

-- Check the user was created
SELECT id, email, full_name, google_id, auth_provider, is_verified
FROM users_user
WHERE auth_provider = 'google';
```

---

## Troubleshooting

### Issue: "Google OAuth is not configured"

**Solution:**
- Verify `GOOGLE_CLIENT_ID` is set in `backend/.env`
- Restart the backend server: `python manage.py runserver`

### Issue: "Invalid token" error

**Solution:**
- Verify Client ID matches between Google Cloud Console and `.env`
- Check authorized JavaScript origins in Google Cloud Console
- Ensure `http://localhost:3000` is added

### Issue: CORS errors in browser console

**Solution:**
- Verify `CORS_ALLOWED_ORIGINS=http://localhost:3000` in `backend/.env`
- Ensure `CORS_ALLOW_CREDENTIALS=True` is set
- Restart backend server

### Issue: Frontend can't connect to backend

**Solution:**
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`
- Try accessing `http://localhost:8000/api/auth/oauth/google/config/` directly in browser

### Issue: Migration errors

**Solution:**
```bash
# Check current migrations
python manage.py showmigrations users

# If needed, run migrations again
python manage.py migrate users

# If still failing, check database connection:
python manage.py dbshell
```

---

## Verification Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Google OAuth Client ID created in Google Cloud Console
- [ ] Authorized origins added: `http://localhost:3000`
- [ ] Authorized redirect URIs added: `http://localhost:3000/auth/google/callback`
- [ ] `GOOGLE_CLIENT_ID` set in `backend/.env`
- [ ] Backend dependencies installed (`google-auth`, etc.)
- [ ] Database migrations completed
- [ ] Backend server running on port 8000
- [ ] Frontend dependencies installed (`@react-oauth/google`)
- [ ] Frontend server running on port 3000
- [ ] Can access registration page: `http://localhost:3000/auth/register`
- [ ] Google OAuth button appears on registration page
- [ ] Can successfully register with Google
- [ ] User created in database with `google_id` and `auth_provider='google'`
- [ ] Can successfully login with Google

---

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console:**
   - Add production domain to authorized origins
   - Add production callback URL to redirect URIs

2. **Update Backend `.env`:**
   ```bash
   DEBUG=False
   GOOGLE_CLIENT_ID=your-production-client-id
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   SECRET_KEY=use-a-strong-secret-key
   ```

3. **Update Frontend `.env.local`:**
   ```bash
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

4. **Security Considerations:**
   - Use HTTPS for all production URLs
   - Enable Django security middleware
   - Consider using httpOnly cookies for JWT tokens
   - Implement rate limiting
   - Set up proper logging and monitoring

---

## Next Steps

After successful setup:

1. Review `GOOGLE_OAUTH_SETUP.md` for detailed documentation
2. Review `OAUTH_IMPLEMENTATION_SUMMARY.md` for technical details
3. Consider additional OAuth providers (GitHub, Microsoft, etc.)
4. Implement profile picture import from Google
5. Add account management features

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check Django logs: `python manage.py runserver` output
4. Verify all environment variables are set correctly
5. Ensure Google OAuth credentials are correctly configured

---

## Summary

You should now have a fully functional Google OAuth authentication system:

- Users can register with Google
- Users can login with Google
- JWT tokens are issued and managed
- Account linking works for existing users
- Clean architecture is maintained

Total setup time: ~15 minutes

Enjoy your streamlined authentication! 🎉

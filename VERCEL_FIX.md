# Fix Google OAuth on Production (Vercel)

## Problem
The frontend deployed on Vercel is not configured with the correct production API URL. It's missing the environment variable `NEXT_PUBLIC_API_URL`.

## Solution

### Step 1: Configure Environment Variable in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (olla-lms frontend)
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://api.olla.co.in/api`
   - **Environment**: Select **Production** (and optionally Preview and Development)
5. Click **Save**

### Step 2: Redeploy the Application

After adding the environment variable, you need to trigger a new deployment:

**Option A: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **"⋯"** (three dots) menu
4. Select **Redeploy**

**Option B: Push a commit to trigger deployment**
```bash
git commit --allow-empty -m "Trigger redeployment for env vars"
git push
```

### Step 3: Verify the Fix

After redeployment:
1. Visit https://olla.co.in
2. Open browser DevTools → Console
3. Try clicking "Continue with Google"
4. You should no longer see 404 errors for the OAuth config endpoints

## What This Fixes

- ✅ Google OAuth config endpoint will be called at: `https://api.olla.co.in/api/auth/oauth/google/config/`
- ✅ Apple OAuth config endpoint will be called at: `https://api.olla.co.in/api/auth/oauth/apple/config/`
- ✅ All authentication API calls will use the correct production backend

## Additional: Google Cloud Console Configuration

Make sure your Google Cloud Console has the production redirect URI:

1. Go to https://console.cloud.google.com/
2. Navigate to: **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID: `1011533871556-in79sr2ktvou1u5pepcggud1qr6b47kg.apps.googleusercontent.com`
4. Under **Authorized redirect URIs**, ensure you have:
   - `https://olla.co.in/auth/google/callback` ✅ (production)
   - `http://localhost:3000/auth/google/callback` (for local development)
5. Click **Save**

## Backend Environment Variables (Droplet)

**IMPORTANT**: You need to manually update the `.env` file on your droplet. Your CI/CD pipeline excludes `.env` files (which is correct for security).

SSH into your droplet and update these variables:

```bash
ssh root@165.22.212.208
cd /var/www/olla-lms/backend
nano .env
```

Update these lines in `/var/www/olla-lms/backend/.env`:

```bash
# Change from localhost to production URL
GOOGLE_REDIRECT_URI=https://olla.co.in/auth/google/callback

# Add droplet IP if not present
ALLOWED_HOSTS=api.olla.co.in,165.22.212.208,localhost,127.0.0.1

# Ensure backend URL is set to production
BACKEND_URL=https://api.olla.co.in
```

After saving, restart services:
```bash
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

**Note**: I previously made these changes directly on the droplet. Since you prefer to manage changes through your process, you may want to verify/update them yourself.

## Test Endpoints

You can verify the backend is working:
```bash
curl https://api.olla.co.in/api/auth/oauth/google/config/
```

Expected response:
```json
{
  "success": true,
  "client_id": "1011533871556-in79sr2ktvou1u5pepcggud1qr6b47kg.apps.googleusercontent.com",
  "redirect_uri": "https://olla.co.in/auth/google/callback"
}
```

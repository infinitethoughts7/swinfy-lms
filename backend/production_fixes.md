# Production Backend Fixes Needed

## 🚨 CRITICAL: Fix User Role Issue First

**The main issue**: Your production database has users with role `knowledge_partner_admin` but the code expects `knowledge_partner`. This is causing the 403 Forbidden errors.

### Fix Option 1: Run Management Command (Recommended)

SSH into your DigitalOcean backend and run:

```bash
# Check what would be changed
python manage.py fix_kp_admin_roles --dry-run

# Apply the fix
python manage.py fix_kp_admin_roles
```

### Fix Option 2: Run Migration

```bash
python manage.py migrate users 0022_fix_knowledge_partner_admin_role
```

### Fix Option 3: Manual Database Update (if above doesn't work)

```sql
UPDATE users_user 
SET role = 'knowledge_partner' 
WHERE role = 'knowledge_partner_admin';
```

## 1. CORS Settings Update

Add your Vercel domain to CORS settings in `backend/lms_backend/settings.py`:

```python
# Add your Vercel domain to CORS_ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3005',
    'http://127.0.0.1:3005',
    'https://olla.co.in',  # Your production domain
    'https://your-vercel-app.vercel.app',  # Your Vercel domain
    # Add any other domains you need
]

# Also update CSRF_TRUSTED_ORIGINS
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3005',
    'http://127.0.0.1:3005',
    'https://olla.co.in',  # Your production domain
    'https://your-vercel-app.vercel.app',  # Your Vercel domain
]
```

## 2. Environment Variables Check

Make sure your DigitalOcean backend has these environment variables set:

```
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://olla.co.in,https://your-vercel-app.vercel.app
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://olla.co.in,https://your-vercel-app.vercel.app
```

## 3. Vercel Environment Variables

Set in your Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://urchin-app-3xb5n.ondigitalocean.app
```

## 4. Debug Steps

1. Deploy the updated frontend with debug panels
2. Check the debug panel in production
3. Verify tokens are being stored correctly
4. Check if the backend is receiving the Authorization header
5. Verify CORS is working

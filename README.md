# Swinfy LMS

Modern LMS with a Next.js (App Router) frontend and a Django REST backend on PostgreSQL. This guide is written for new collaborators to get running without guesswork.

## Tech Stack (current)
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 4, lucide-react
- Backend: Django 5.2, Django REST Framework, SimpleJWT
- Database: PostgreSQL 16
- Payments: Razorpay
- Email: Resend (default provider) with fallback-ready config
- Storage: Local filesystem by default; S3/Spaces supported via env flags
- AI/Moderation: OpenAI API key consumed in backend and moderation endpoints used by the frontend hook

## Repo Layout
```
frontend/   Next.js app (app router, Tailwind)
backend/    Django project (lms_backend, courses, users, payments, core)
scripts/    Helper scripts (e.g., setup.sh, env-setup.sh, generate-secret.py)
```

## Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 16 running locally (ensure `pg_isready` succeeds)
- `python3 -m venv` available
- macOS: add `/opt/homebrew/opt/postgresql@16/bin` to PATH if needed

## Environment Configuration
Create the env files before running anything. Do **not** commit secrets.

### Backend (`backend/.env`)
```
DEBUG=True
SECRET_KEY=change-me

# Database (use DATABASE_URL or individual fields)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/swinfy_lms
DB_NAME=swinfy_lms
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=True

# Storage (set USE_S3=true to enable Spaces/S3)
USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_ENDPOINT_URL=
AWS_S3_REGION_NAME=

# Email
EMAIL_PROVIDER=resend
DEFAULT_FROM_EMAIL=no-reply@swinfy.com
RESEND_API_KEY=

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# AI / Moderation
OPENAI_API_KEY=

# Static/Media (only if overriding defaults)
STATIC_URL=/static/
MEDIA_URL=/media/
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Setup: Backend
```bash
cd backend
python3 -m venv ../.venv
source ../.venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# ensure Postgres is running, then:
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # set admin creds
python manage.py runserver  # http://localhost:8000
```

## Setup: Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000 (uses Turbopack)
# Lint
npm run lint
```

## Scripts
- `scripts/setup.sh`: opinionated end-to-end setup; assumes Postgres 16 is up and a `.venv` exists at repo root. Use only if your local matches those expectations.

## Development Notes
- API base URL is driven by `NEXT_PUBLIC_API_URL`; keep it in sync with the backend host.
- Content moderation hooks call backend endpoints at `/api/core/moderation/*`; these require the backend running with a valid `OPENAI_API_KEY` if moderation is enforced.
- File storage defaults to local `MEDIA_ROOT`; set `USE_S3=true` and the AWS/Spaces vars for remote storage.
- Payments require Razorpay keys in the backend env.
- Email uses Resend by default; set `RESEND_API_KEY` and `DEFAULT_FROM_EMAIL`.

## Production Checklist (high level)
- Set strong `SECRET_KEY`, disable `DEBUG`, and lock down `ALLOWED_HOSTS`.
- Provide `DATABASE_URL` and storage/email/payment/AI secrets.
- Serve static/media via CDN or S3/Spaces when `USE_S3=true`.
- Run `npm run build` (frontend) and `python manage.py collectstatic` (if using Django static in prod).
- Configure HTTPS termination and CORS for your frontend domain.

## Support
Open an issue or start a discussion in the repo with clear repro steps and logs.

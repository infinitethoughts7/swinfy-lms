# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swinfy LMS is a Learning Management System with:
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Django 5.2, Django REST Framework, SimpleJWT
- **Database**: PostgreSQL 16
- **Payments**: Razorpay
- **Email**: Resend
- **Storage**: Local filesystem (default), S3/Spaces via `USE_S3=true`
- **AI/Moderation**: OpenAI API

## Development Commands

### Frontend (`frontend/`)
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000, Turbopack)
npm run build        # Production build
npm run lint         # Run ESLint
```

### Backend (`backend/`)
```bash
# Setup (run from backend/)
python3 -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt

# Development
python manage.py runserver         # Start server (localhost:8000)
python manage.py makemigrations    # Create migrations
python manage.py migrate           # Apply migrations
python manage.py createsuperuser   # Create admin user

# Load sample data
python manage.py create_ultimate_python_course
```

## Architecture

### Repository Structure
```
frontend/    # Next.js app (App Router)
backend/     # Django project
scripts/     # Setup scripts
```

### Frontend Structure
- `app/` - Next.js pages (file-based routing)
  - `dashboard/learner/`, `dashboard/instructor/`, `dashboard/kp/`, `dashboard/super-admin/` - Role-based dashboards
- `components/` - React components organized by feature (ui/, sections/, auth/, course/, dashboard/)
- `lib/api.ts` - Centralized API client (main file for all backend calls)
- `lib/api-config.ts` - API URL configuration
- Path alias: `@/*` maps to root

### Backend Structure
- `lms_backend/` - Django project settings
- `users/` - User management, authentication, profiles
- `courses/` - Course management, enrollment, progress, analytics
- `payments/` - Razorpay integration
- `core/` - Content moderation (OpenAI)

### Key Backend Patterns
- **Layered architecture**: Views → Serializers → Services → Repositories → Models
- **Course approval workflow**: draft → pending → approved/rejected → published
- **Role-based permissions**: Student, Tutor, Admin, SuperAdmin
- **Progress tracking**: LessonProgress → ModuleProgress → CourseProgress

### API Structure
- Auth: `/api/auth/` (register, login, profile)
- Courses: `/api/courses/` (CRUD, enrollment, progress, analytics)
- Payments: `/api/payments/` (Razorpay orders, webhooks)
- Moderation: `/api/core/moderation/`

Frontend rewrites `/api/*` to the backend URL via `next.config.ts`.

## Environment Variables

### Backend (`backend/.env`)
Required:
- `SECRET_KEY`, `DATABASE_URL` (or DB_NAME/USER/PASSWORD/HOST/PORT)
- `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`

Optional:
- `USE_S3=true` + AWS credentials for S3/Spaces storage
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` for payments
- `RESEND_API_KEY` for email
- `OPENAI_API_KEY` for content moderation
- `GOOGLE_CLIENT_ID` for OAuth

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Key Files Reference

| File | Purpose |
|------|---------|
| `frontend/lib/api.ts` | Main API client - add new endpoints here |
| `frontend/next.config.ts` | Rewrites, redirects, image optimization |
| `backend/lms_backend/settings.py` | Django configuration |
| `backend/courses/permissions.py` | Authorization rules |
| `backend/courses/views/course_view.py` | Main course endpoints |

## User Roles

- **Student/Learner**: Enroll in courses, track progress
- **Tutor/Instructor**: Create and manage courses
- **Admin/KP (Knowledge Partner)**: Manage training partner courses
- **SuperAdmin**: Platform-wide administration, course approval

## Code Style

- Use comments sparingly. Only comment complex code.

# 🚀 Quick Start Guide

## Prerequisites
- ✅ Node.js 18+ and npm
- ✅ Python 3.11+
- ✅ PostgreSQL 16+ (installed and running)

## 🏃‍♂️ Quick Start

### 1. Start PostgreSQL 16
```bash
brew services start postgresql@16
```

### 2. Setup Database
```bash
# Add PostgreSQL 16 to PATH
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

# Create database
createdb -U postgres swinfy_lms
```

### 3. Run Setup Script
```bash
./scripts/setup.sh
```

### 4. Start Development Servers

**Frontend (React):**
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

**Backend (Django):**
```bash
cd backend
source venv/bin/activate
# Make sure PostgreSQL 16 is in PATH
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
python manage.py runserver
# Open http://localhost:8000
```

## 🔑 Default Credentials
- **Admin Panel**: http://localhost:8000/admin
- **Username**: admin
- **Email**: admin@swinfy.com
- **Password**: (set during setup)

## 📱 What's Ready
- ✅ React + TypeScript + Vite frontend
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Django 5.2 backend with DRF
- ✅ PostgreSQL 16 database with custom models
- ✅ User management (Student/Instructor/Admin)
- ✅ Course and lesson management
- ✅ Progress tracking system
- ✅ Admin interface

## 🎯 Next Steps
1. Customize the UI components
2. Add authentication endpoints
3. Implement course enrollment
4. Add video upload functionality
5. Create student dashboard

## 🆘 Need Help?
- Check the main [README.md](README.md)
- Review Django logs in the terminal
- Check browser console for frontend errors
- Ensure PostgreSQL 16 is running: `brew services list | grep postgresql`

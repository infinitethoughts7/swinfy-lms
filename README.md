# Swinfy LMS - Learning Management System

A modern, feature-rich Learning Management System built with React, Django, and PostgreSQL.

## 🚀 Features

- **User Management**: Student, Instructor, and Admin roles
- **Course Management**: Create, edit, and manage courses with rich content
- **Video Lessons**: Support for video content and file uploads
- **Progress Tracking**: Monitor student progress and completion
- **Assignment System**: Create and grade assignments
- **Review System**: Course ratings and feedback
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible components
- **React Router** for navigation

### Backend
- **Django 5.2** (LTS)
- **Django REST Framework** for API
- **PostgreSQL 16** for database
- **Django CORS Headers** for cross-origin requests
- **Custom User Model** for enhanced user management

## 📁 Project Structure

```
swinfy-lms/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main application component
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Django backend application
│   ├── lms_backend/        # Django project settings
│   ├── courses/            # Courses app
│   ├── users/              # Users app
│   ├── requirements.txt    # Python dependencies
│   └── manage.py
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 16+

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up PostgreSQL 16 database:
   ```bash
   # Start PostgreSQL 16 service
   brew services start postgresql@16
   
   # Add to PATH
   export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
   
   # Create database
   createdb -U postgres swinfy_lms
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE swinfy_lms;
   \q
   ```

5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

8. Open [http://localhost:8000](http://localhost:8000) in your browser.

## 🗄️ Database Models

### Users
- Custom User model with email authentication
- Support for Student, Instructor, and Admin roles
- Profile information and preferences

### Courses
- Course categories and metadata
- Lesson management with video support
- Pricing and enrollment options

### Learning
- Student enrollment and progress tracking
- Assignment creation and submission
- Course reviews and ratings

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://postgres:1234@localhost:5432/swinfy_lms
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Database Configuration
The project is configured to use PostgreSQL 16 by default. Update the database settings in `backend/lms_backend/settings.py` if needed.

**Note**: PostgreSQL 16 is installed at `/opt/homebrew/opt/postgresql@16/bin` and should be added to your PATH.

## 🚀 Development

### Frontend Development
- Uses Vite for fast HMR (Hot Module Replacement)
- Tailwind CSS for utility-first styling
- shadcn/ui components for consistent design
- TypeScript for type safety

### Backend Development
- Django REST Framework for API endpoints
- Custom user model for enhanced authentication
- Comprehensive admin interface
- RESTful API design

## 📚 API Documentation

The API documentation will be available at `/api/docs/` when the backend is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

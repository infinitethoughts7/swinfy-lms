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


Clearing existing data...
Starting comprehensive data population...
Creating organizations...
  Created organization: Swinfy Technologies
  Created organization: TechEd Institute
  Created organization: SkillUp Academy
Creating users...
  Created admin user: test.tutor@gmail.com
  Created admin user: admin@teched.com
  Created student user: test.student@gmail.com
  Created student user: sarah.johnson@gmail.com
  Created student user: mike.chen@gmail.com
  Created student user: lisa.rodriguez@gmail.com
  Created student user: david.wilson@gmail.com
  Created student user: anna.kumar@gmail.com
Creating courses with comprehensive content...
  Created course: Complete Machine Learning Bootcamp
    Created module: Introduction to Machine Learning
    Created module: Data Preprocessing and Exploration
    Created module: Supervised Learning Algorithms
    Created module: Unsupervised Learning
    Created module: Deep Learning Fundamentals
    Created module: Model Evaluation and Deployment
      Created lesson: What is Machine Learning?
      Created lesson: Types of Machine Learning
      Created lesson: Setting up Python Environment
      Created lesson: Introduction to Jupyter Notebooks
      Created lesson: Your First ML Program
      Created lesson: Understanding Your Data
      Created lesson: Handling Missing Values
      Created lesson: Data Visualization with Matplotlib
      Created lesson: Feature Scaling and Normalization
      Created lesson: Exploratory Data Analysis Project
      Created lesson: Linear Regression Theory
      Created lesson: Implementing Linear Regression
      Created lesson: Logistic Regression
      Created lesson: Decision Trees
      Created lesson: Random Forest Algorithm
      Created lesson: Support Vector Machines
      Created lesson: Classification Project
      Created lesson: K-Means Clustering
      Created lesson: Hierarchical Clustering
      Created lesson: Principal Component Analysis
      Created lesson: Clustering Project
      Created lesson: Introduction to Neural Networks
      Created lesson: Building Your First Neural Network
      Created lesson: Convolutional Neural Networks
      Created lesson: Deep Learning with TensorFlow
      Created lesson: Image Classification Project
      Created lesson: Cross-Validation Techniques
      Created lesson: Hyperparameter Tuning
      Created lesson: Model Deployment with Flask
      Created lesson: Final Capstone Project
  Created course: Python Web Development with Django
  Created course: Data Science with Python
  Created course: Frontend Development with React
Creating enrollments...
  Created enrollment: Arjun Patel -> Frontend Development with React
  Created enrollment: Arjun Patel -> Complete Machine Learning Bootcamp
  Created enrollment: Sarah Johnson -> Python Web Development with Django
  Created enrollment: Mike Chen -> Frontend Development with React
  Created enrollment: Lisa Rodriguez -> Complete Machine Learning Bootcamp
  Created enrollment: David Wilson -> Complete Machine Learning Bootcamp
  Created enrollment: Anna Kumar -> Complete Machine Learning Bootcamp
Creating payments...
  Created payment: Mike Chen -> ₹11999.00 (verified)
  Created payment: Sarah Johnson -> ₹12999.00 (paid)
  Created payment: Arjun Patel -> ₹11999.00 (paid)
  Created payment: Lisa Rodriguez -> ₹15999.00 (paid)
  Created payment: David Wilson -> ₹15999.00 (paid)
  Created payment: Arjun Patel -> ₹15999.00 (paid)
  Created payment: Anna Kumar -> ₹15999.00 (verified)
Successfully populated database with comprehensive realistic data!
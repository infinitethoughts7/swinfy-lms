"""
Django management command to populate the database with realistic data.
This includes users, courses, modules, lessons with video URLs, progress, payments, and all related models.
"""

import os
import random
from decimal import Decimal
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

# Import models
from users.models import TrainingPartner
from courses.models import (
    Course, CourseModule, Lesson, LessonMaterial, CourseResource,
    Enrollment, CourseReview, CourseWishlist, CourseNotification,
    LessonProgress, ModuleProgress, CourseProgress, StudySession
)
from payments.models import Payment

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with realistic data including video URLs and content'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()

        self.stdout.write('Starting comprehensive data population...')
        
        # Create users and organizations
        self.create_organizations()
        self.create_users()
        
        # Create courses with comprehensive content
        self.create_courses()
        
        # Create enrollments (without progress for now due to DB schema issue)
        self.create_enrollments_only()
        # self.create_reviews_and_wishlists()  # Temporarily disabled due to DB schema mismatch
        
        # Create payments
        self.create_payments()
        
        # Create notifications
        # self.create_notifications()  # Temporarily disabled

        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with comprehensive realistic data!')
        )

    def clear_data(self):
        """Clear existing data."""
        Payment.objects.all().delete()
        CourseNotification.objects.all().delete()
        CourseWishlist.objects.all().delete()
        CourseReview.objects.all().delete()
        StudySession.objects.all().delete()
        CourseProgress.objects.all().delete()
        ModuleProgress.objects.all().delete()
        LessonProgress.objects.all().delete()
        Enrollment.objects.all().delete()
        LessonMaterial.objects.all().delete()
        CourseResource.objects.all().delete()
        Lesson.objects.all().delete()
        CourseModule.objects.all().delete()
        Course.objects.all().delete()
        # Keep users but clear course-related data
        User.objects.filter(role__in=['student', 'tutor']).delete()
        TrainingPartner.objects.all().delete()

    def create_organizations(self):
        """Create training partner organizations."""
        self.stdout.write('Creating organizations...')
        
        organizations_data = [
            {
                'name': 'Swinfy Technologies',
                'type': 'company',
                'location': 'Bangalore, India',
                'website': 'https://swinfy.com',
                'description': 'Leading technology training provider specializing in AI, ML, and software development.',
                'is_active': True
            },
            {
                'name': 'TechEd Institute',
                'type': 'institute',
                'location': 'Mumbai, India',
                'website': 'https://teched.in',
                'description': 'Premier educational institute offering comprehensive technology courses.',
                'is_active': True
            },
            {
                'name': 'SkillUp Academy',
                'type': 'bootcamp',
                'location': 'Delhi, India',
                'website': 'https://skillup.academy',
                'description': 'Professional skill development academy for working professionals.',
                'is_active': True
            }
        ]
        
        self.organizations = []
        for org_data in organizations_data:
            org, created = TrainingPartner.objects.get_or_create(
                name=org_data['name'],
                defaults=org_data
            )
            self.organizations.append(org)
            if created:
                self.stdout.write(f'  Created organization: {org.name}')

    def create_users(self):
        """Create test users."""
        self.stdout.write('Creating users...')
        
        # Create admin users for each organization
        admin_users_data = [
            {
                'email': 'test.tutor@gmail.com',
                'password': 'rockgyg07',
                'full_name': 'Rajesh Kumar',
                'role': 'tutor',
                'organization': self.organizations[0],  # Swinfy
                'is_approved': True
            },
            {
                'email': 'admin@teched.com',
                'password': 'rockgyg07',
                'full_name': 'Priya Sharma',
                'role': 'tutor',
                'organization': self.organizations[1],  # TechEd
                'is_approved': True
            }
        ]
        
        # Create student users
        student_users_data = [
            {
                'email': 'test.student@gmail.com',
                'password': 'rockgyg07',
                'full_name': 'Arjun Patel',
                'role': 'student'
            },
            {
                'email': 'sarah.johnson@gmail.com',
                'password': 'rockgyg07',
                'full_name': 'Sarah Johnson',
                'role': 'student'
            },
            {
                'email': 'mike.chen@gmail.com',
                'password': 'rockgyg07',
                'full_name': 'Mike Chen',
                'role': 'student'
            },
            {
                'email': 'lisa.rodriguez@gmail.com',
                'password': 'rockgyg07',
                'full_name': 'Lisa Rodriguez',
                'role': 'student'
            },
            {
                'email': 'david.wilson@gmail.com',
                'password': 'rockgyg07',
                'full_name': 'David Wilson',
                'role': 'student'
            },
            {
                'email': 'anna.kumar@gmail.com',
                'password': 'rockgyg07',
                'full_name': 'Anna Kumar',
                'role': 'student'
            }
        ]
        
        self.admin_users = []
        self.student_users = []
        
        # Create admin users
        for user_data in admin_users_data:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'username': user_data['email'],  # Use email as username
                    'full_name': user_data['full_name'],
                    'role': user_data['role'],
                    'organization': user_data['organization'],
                    'is_approved': user_data['is_approved']
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(f'  Created admin user: {user.email}')
            self.admin_users.append(user)
        
        # Create student users
        for user_data in student_users_data:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'username': user_data['email'],  # Use email as username
                    'full_name': user_data['full_name'],
                    'role': user_data['role']
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(f'  Created student user: {user.email}')
            self.student_users.append(user)

    def create_courses(self):
        """Create courses with comprehensive content including video URLs."""
        self.stdout.write('Creating courses with comprehensive content...')
        
        # Machine Learning Course
        ml_course_data = {
            'title': 'Complete Machine Learning Bootcamp',
            'slug': 'complete-machine-learning-bootcamp',
            'description': 'Master Machine Learning from basics to advanced concepts with hands-on projects and real-world applications. This comprehensive course covers supervised and unsupervised learning, deep learning, and deployment strategies.',
            'short_description': 'Learn ML algorithms, data preprocessing, model evaluation, and deployment techniques with practical projects.',
            'price': Decimal('15999.00'),
            'duration_weeks': 16,
            'category': 'data_science',
            'level': 'intermediate',
            'prerequisites': 'Basic Python programming knowledge, Mathematics fundamentals (linear algebra, statistics)',
            'learning_outcomes': '''By the end of this course, you will:
• Understand core ML algorithms and when to use them
• Master data preprocessing and feature engineering techniques
• Build and evaluate ML models using scikit-learn and TensorFlow
• Implement deep learning models for various applications
• Deploy ML models to production environments
• Work on real-world ML projects and case studies
• Understand model evaluation metrics and validation techniques''',
            'tags': 'machine learning, python, scikit-learn, tensorflow, data science, AI, deep learning, neural networks',
            'is_featured': True,
            'is_published': True,
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'is_draft': False,
            'training_partner': self.organizations[0],  # Swinfy
            'tutor': self.admin_users[0],
            'rating': Decimal('4.8'),
            'total_reviews': 156,
            'enrollment_count': 89
        }
        
        # Create the course
        ml_course, created = Course.objects.get_or_create(
            slug=ml_course_data['slug'],
            defaults=ml_course_data
        )
        if created:
            self.stdout.write(f'  Created course: {ml_course.title}')
        
        # Create modules for ML course
        ml_modules_data = [
            {
                'title': 'Introduction to Machine Learning',
                'description': 'Overview of ML concepts, types of learning, and setting up the development environment.',
                'order': 1,
                'duration_weeks': 2
            },
            {
                'title': 'Data Preprocessing and Exploration',
                'description': 'Learn data cleaning, transformation, visualization, and exploratory data analysis techniques.',
                'order': 2,
                'duration_weeks': 3
            },
            {
                'title': 'Supervised Learning Algorithms',
                'description': 'Master regression, classification algorithms including linear regression, decision trees, and SVM.',
                'order': 3,
                'duration_weeks': 4
            },
            {
                'title': 'Unsupervised Learning',
                'description': 'Explore clustering, dimensionality reduction, and association rule learning.',
                'order': 4,
                'duration_weeks': 3
            },
            {
                'title': 'Deep Learning Fundamentals',
                'description': 'Introduction to neural networks, backpropagation, and deep learning frameworks.',
                'order': 5,
                'duration_weeks': 3
            },
            {
                'title': 'Model Evaluation and Deployment',
                'description': 'Learn model validation, hyperparameter tuning, and deployment strategies.',
                'order': 6,
                'duration_weeks': 1
            }
        ]
        
        ml_modules = []
        for module_data in ml_modules_data:
            module_data['course'] = ml_course
            module, created = CourseModule.objects.get_or_create(
                course=ml_course,
                order=module_data['order'],
                defaults=module_data
            )
            if created:
                self.stdout.write(f'    Created module: {module.title}')
            ml_modules.append(module)
        
        # Create comprehensive lessons with real video URLs and content
        lessons_data = [
            # Module 1: Introduction to Machine Learning
            [
                {
                    'title': 'What is Machine Learning?',
                    'lesson_type': 'video',
                    'duration_minutes': 45,
                    'is_preview': True,
                    'video_url': 'https://www.youtube.com/watch?v=HcqpanDadyQ',
                    'description': 'Introduction to machine learning concepts and applications'
                },
                {
                    'title': 'Types of Machine Learning',
                    'lesson_type': 'video',
                    'duration_minutes': 35,
                    'video_url': 'https://www.youtube.com/watch?v=f_uwKZIAeM0',
                    'description': 'Supervised, unsupervised, and reinforcement learning explained'
                },
                {
                    'title': 'Setting up Python Environment',
                    'lesson_type': 'video',
                    'duration_minutes': 30,
                    'video_url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
                    'description': 'Installing Python, Anaconda, and essential ML libraries'
                },
                {
                    'title': 'Introduction to Jupyter Notebooks',
                    'lesson_type': 'text',
                    'duration_minutes': 25,
                    'description': 'Getting started with Jupyter notebooks for ML development'
                },
                {
                    'title': 'Your First ML Program',
                    'lesson_type': 'assignment',
                    'duration_minutes': 60,
                    'description': 'Build your first machine learning model using scikit-learn'
                }
            ],
            # Module 2: Data Preprocessing
            [
                {
                    'title': 'Understanding Your Data',
                    'lesson_type': 'video',
                    'duration_minutes': 40,
                    'video_url': 'https://www.youtube.com/watch?v=0xVqLJe9_CY',
                    'description': 'Data types, structure analysis, and initial exploration'
                },
                {
                    'title': 'Handling Missing Values',
                    'lesson_type': 'video',
                    'duration_minutes': 50,
                    'video_url': 'https://www.youtube.com/watch?v=fCMrO_VzeL8',
                    'description': 'Strategies for dealing with missing data in datasets'
                },
                {
                    'title': 'Data Visualization with Matplotlib',
                    'lesson_type': 'video',
                    'duration_minutes': 45,
                    'video_url': 'https://www.youtube.com/watch?v=UO98lJQ3QGI',
                    'description': 'Creating effective visualizations for data analysis'
                },
                {
                    'title': 'Feature Scaling and Normalization',
                    'lesson_type': 'video',
                    'duration_minutes': 35,
                    'video_url': 'https://www.youtube.com/watch?v=mnKm3YP56PY',
                    'description': 'Preprocessing techniques for better model performance'
                },
                {
                    'title': 'Exploratory Data Analysis Project',
                    'lesson_type': 'assignment',
                    'duration_minutes': 90,
                    'description': 'Complete EDA on a real-world dataset'
                }
            ],
            # Module 3: Supervised Learning
            [
                {
                    'title': 'Linear Regression Theory',
                    'lesson_type': 'video',
                    'duration_minutes': 50,
                    'video_url': 'https://www.youtube.com/watch?v=7ArmBVF2dCs',
                    'description': 'Mathematical foundations of linear regression'
                },
                {
                    'title': 'Implementing Linear Regression',
                    'lesson_type': 'video',
                    'duration_minutes': 40,
                    'video_url': 'https://www.youtube.com/watch?v=1BYu65vLKdA',
                    'description': 'Hands-on implementation using scikit-learn'
                },
                {
                    'title': 'Logistic Regression',
                    'lesson_type': 'video',
                    'duration_minutes': 45,
                    'video_url': 'https://www.youtube.com/watch?v=yIYKR4sgzI8',
                    'description': 'Classification using logistic regression'
                },
                {
                    'title': 'Decision Trees',
                    'lesson_type': 'video',
                    'duration_minutes': 55,
                    'video_url': 'https://www.youtube.com/watch?v=7VeUPuFGJHk',
                    'description': 'Understanding decision tree algorithms'
                },
                {
                    'title': 'Random Forest Algorithm',
                    'lesson_type': 'video',
                    'duration_minutes': 40,
                    'video_url': 'https://www.youtube.com/watch?v=J4Wdy0Wc_xQ',
                    'description': 'Ensemble methods and random forests'
                },
                {
                    'title': 'Support Vector Machines',
                    'lesson_type': 'video',
                    'duration_minutes': 50,
                    'video_url': 'https://www.youtube.com/watch?v=efR1C6CvhmE',
                    'description': 'SVM for classification and regression'
                },
                {
                    'title': 'Classification Project',
                    'lesson_type': 'assignment',
                    'duration_minutes': 120,
                    'description': 'Build a complete classification system'
                }
            ],
            # Module 4: Unsupervised Learning
            [
                {
                    'title': 'K-Means Clustering',
                    'lesson_type': 'video',
                    'duration_minutes': 45,
                    'video_url': 'https://www.youtube.com/watch?v=4b5d3muPQmA',
                    'description': 'Understanding and implementing K-means clustering'
                },
                {
                    'title': 'Hierarchical Clustering',
                    'lesson_type': 'video',
                    'duration_minutes': 40,
                    'video_url': 'https://www.youtube.com/watch?v=7xHsRkOdVwo',
                    'description': 'Agglomerative and divisive clustering techniques'
                },
                {
                    'title': 'Principal Component Analysis',
                    'lesson_type': 'video',
                    'duration_minutes': 50,
                    'video_url': 'https://www.youtube.com/watch?v=FgakZw6K1QQ',
                    'description': 'Dimensionality reduction using PCA'
                },
                {
                    'title': 'Clustering Project',
                    'lesson_type': 'assignment',
                    'duration_minutes': 90,
                    'description': 'Customer segmentation using clustering algorithms'
                }
            ],
            # Module 5: Deep Learning
            [
                {
                    'title': 'Introduction to Neural Networks',
                    'lesson_type': 'video',
                    'duration_minutes': 60,
                    'video_url': 'https://www.youtube.com/watch?v=aircAruvnKk',
                    'description': 'Understanding neural network architecture and concepts'
                },
                {
                    'title': 'Building Your First Neural Network',
                    'lesson_type': 'video',
                    'duration_minutes': 50,
                    'video_url': 'https://www.youtube.com/watch?v=CqOfi41LfDw',
                    'description': 'Implementing neural networks with TensorFlow'
                },
                {
                    'title': 'Convolutional Neural Networks',
                    'lesson_type': 'video',
                    'duration_minutes': 55,
                    'video_url': 'https://www.youtube.com/watch?v=YRhxdVk_sIs',
                    'description': 'CNNs for image processing and computer vision'
                },
                {
                    'title': 'Deep Learning with TensorFlow',
                    'lesson_type': 'video',
                    'duration_minutes': 65,
                    'video_url': 'https://www.youtube.com/watch?v=tPYj3fFJGjk',
                    'description': 'Advanced TensorFlow techniques and best practices'
                },
                {
                    'title': 'Image Classification Project',
                    'lesson_type': 'assignment',
                    'duration_minutes': 150,
                    'description': 'Build an image classifier using deep learning'
                }
            ],
            # Module 6: Model Evaluation
            [
                {
                    'title': 'Cross-Validation Techniques',
                    'lesson_type': 'video',
                    'duration_minutes': 40,
                    'video_url': 'https://www.youtube.com/watch?v=fSytzGwwBVw',
                    'description': 'Model validation and cross-validation strategies'
                },
                {
                    'title': 'Hyperparameter Tuning',
                    'lesson_type': 'video',
                    'duration_minutes': 45,
                    'video_url': 'https://www.youtube.com/watch?v=5nYqK-HaoKY',
                    'description': 'Optimizing model performance through parameter tuning'
                },
                {
                    'title': 'Model Deployment with Flask',
                    'lesson_type': 'video',
                    'duration_minutes': 60,
                    'video_url': 'https://www.youtube.com/watch?v=UbCWoMf80PY',
                    'description': 'Deploying ML models as web services'
                },
                {
                    'title': 'Final Capstone Project',
                    'lesson_type': 'assignment',
                    'duration_minutes': 180,
                    'description': 'End-to-end ML project from data to deployment'
                }
            ]
        ]
        
        all_lessons = []
        for module_idx, module_lessons in enumerate(lessons_data):
            module = ml_modules[module_idx]
            for lesson_idx, lesson_data in enumerate(module_lessons):
                lesson_data.update({
                    'module': module,
                    'order': lesson_idx + 1,
                    'content': self.get_lesson_content(lesson_data['lesson_type'], lesson_data['title'])
                })
                
                lesson, created = Lesson.objects.get_or_create(
                    module=module,
                    order=lesson_data['order'],
                    defaults=lesson_data
                )
                if created:
                    self.stdout.write(f'      Created lesson: {lesson.title}')
                    
                    # Create lesson materials for video and text lessons
                    if lesson.lesson_type == 'video':
                        self.create_lesson_materials(lesson, 'video')
                    elif lesson.lesson_type == 'text':
                        self.create_lesson_materials(lesson, 'text')
                    elif lesson.lesson_type == 'assignment':
                        self.create_lesson_materials(lesson, 'assignment')
                        
                all_lessons.append(lesson)
        
        # Create course resources
        self.create_course_resources(ml_course)
        
        # Create additional courses
        self.create_additional_courses()
        
        self.ml_course = ml_course
        self.all_lessons = all_lessons

    def create_lesson_materials(self, lesson, lesson_type):
        """Create realistic lesson materials."""
        if lesson_type == 'video':
            materials = [
                {
                    'title': f'{lesson.title} - Lecture Slides',
                    'description': 'PDF slides covering the video content',
                    'material_type': 'pdf',
                    'is_required': True
                },
                {
                    'title': f'{lesson.title} - Code Examples',
                    'description': 'Python code examples from the video',
                    'material_type': 'zip',
                    'is_required': False
                }
            ]
        elif lesson_type == 'text':
            materials = [
                {
                    'title': f'{lesson.title} - Reading Material',
                    'description': 'Additional reading material and references',
                    'material_type': 'pdf',
                    'is_required': True
                }
            ]
        else:  # assignment
            materials = [
                {
                    'title': f'{lesson.title} - Assignment Instructions',
                    'description': 'Detailed assignment requirements and rubric',
                    'material_type': 'pdf',
                    'is_required': True
                },
                {
                    'title': f'{lesson.title} - Starter Code',
                    'description': 'Template code to get started',
                    'material_type': 'zip',
                    'is_required': False
                },
                {
                    'title': f'{lesson.title} - Dataset',
                    'description': 'Dataset for the assignment',
                    'material_type': 'zip',
                    'is_required': True
                }
            ]
        
        for material_data in materials:
            material_data['lesson'] = lesson
            LessonMaterial.objects.get_or_create(
                lesson=lesson,
                title=material_data['title'],
                defaults=material_data
            )

    def create_course_resources(self, course):
        """Create course-level resources."""
        resources_data = [
            {
                'title': 'Course Syllabus',
                'description': 'Complete course syllabus and learning path',
                'resource_type': 'syllabus',
                'is_public': True
            },
            {
                'title': 'Course Schedule',
                'description': 'Week-by-week schedule and milestones',
                'resource_type': 'schedule',
                'is_public': True
            },
            {
                'title': 'Python Quick Reference',
                'description': 'Essential Python syntax and functions for ML',
                'resource_type': 'reference',
                'is_public': True
            },
            {
                'title': 'Anaconda Installation Guide',
                'description': 'Step-by-step guide to install Anaconda',
                'resource_type': 'tool',
                'is_public': True
            },
            {
                'title': 'Kaggle Competition Links',
                'description': 'Recommended Kaggle competitions for practice',
                'resource_type': 'link',
                'url': 'https://www.kaggle.com/competitions',
                'is_public': True
            }
        ]
        
        for resource_data in resources_data:
            resource_data['course'] = course
            CourseResource.objects.get_or_create(
                course=course,
                title=resource_data['title'],
                defaults=resource_data
            )

    def create_additional_courses(self):
        """Create additional courses for variety."""
        additional_courses = [
            {
                'title': 'Python Web Development with Django',
                'slug': 'python-web-development-django',
                'description': 'Build full-stack web applications using Django framework. Learn MVC architecture, database design, REST APIs, authentication, and deployment.',
                'short_description': 'Master Django framework, REST APIs, database design, and web deployment',
                'price': Decimal('12999.00'),
                'duration_weeks': 12,
                'category': 'backend_development',
                'level': 'intermediate',
                'prerequisites': 'Basic Python programming, HTML/CSS knowledge',
                'learning_outcomes': '''• Build full-stack web applications with Django
• Design and implement REST APIs
• Work with databases using Django ORM
• Implement user authentication and authorization
• Deploy applications to production servers''',
                'tags': 'django, python, web development, REST API, backend, database',
                'is_featured': True,
                'is_published': True,
                'is_approved_by_training_partner': True,
                'is_approved_by_super_admin': True,
                'is_draft': False,
                'training_partner': self.organizations[0],
                'tutor': self.admin_users[0],
                'rating': Decimal('4.6'),
                'total_reviews': 89,
                'enrollment_count': 67
            },
            {
                'title': 'Data Science with Python',
                'slug': 'data-science-python',
                'description': 'Complete data science course covering statistics, analysis, and visualization using Python libraries like pandas, numpy, and matplotlib.',
                'short_description': 'Master pandas, numpy, matplotlib, and statistical analysis for data science',
                'price': Decimal('13999.00'),
                'duration_weeks': 14,
                'category': 'data_science',
                'level': 'beginner',
                'prerequisites': 'Basic Python programming knowledge',
                'learning_outcomes': '''• Analyze data using pandas and numpy
• Create compelling visualizations with matplotlib and seaborn
• Perform statistical analysis and hypothesis testing
• Build predictive models using scikit-learn
• Work with real-world datasets''',
                'tags': 'data science, python, pandas, numpy, matplotlib, statistics, analysis',
                'is_featured': False,
                'is_published': True,
                'is_approved_by_training_partner': True,
                'is_approved_by_super_admin': True,
                'is_draft': False,
                'training_partner': self.organizations[1],
                'tutor': self.admin_users[1],
                'rating': Decimal('4.7'),
                'total_reviews': 124,
                'enrollment_count': 78
            },
            {
                'title': 'Frontend Development with React',
                'slug': 'frontend-development-react',
                'description': 'Modern frontend development using React, including hooks, state management, routing, and deployment.',
                'short_description': 'Build modern web interfaces with React, hooks, and state management',
                'price': Decimal('11999.00'),
                'duration_weeks': 10,
                'category': 'frontend_development',
                'level': 'intermediate',
                'prerequisites': 'JavaScript fundamentals, HTML/CSS knowledge',
                'learning_outcomes': '''• Build interactive UIs with React components
• Manage application state with hooks and context
• Implement client-side routing
• Connect to APIs and handle data
• Deploy React applications''',
                'tags': 'react, javascript, frontend, web development, UI, components',
                'is_featured': True,
                'is_published': True,
                'is_approved_by_training_partner': True,
                'is_approved_by_super_admin': True,
                'is_draft': False,
                'training_partner': self.organizations[0],
                'tutor': self.admin_users[0],
                'rating': Decimal('4.5'),
                'total_reviews': 67,
                'enrollment_count': 45
            }
        ]
        
        for course_data in additional_courses:
            course, created = Course.objects.get_or_create(
                slug=course_data['slug'],
                defaults=course_data
            )
            if created:
                self.stdout.write(f'  Created course: {course.title}')
                # Create basic modules for additional courses
                self.create_basic_modules_and_lessons(course)

    def create_basic_modules_and_lessons(self, course):
        """Create basic modules and lessons for additional courses."""
        if 'django' in course.slug:
            modules_data = [
                {'title': 'Django Fundamentals', 'order': 1, 'duration_weeks': 3},
                {'title': 'Models and Databases', 'order': 2, 'duration_weeks': 3},
                {'title': 'Views and Templates', 'order': 3, 'duration_weeks': 3},
                {'title': 'REST APIs', 'order': 4, 'duration_weeks': 3}
            ]
            lessons_per_module = [
                [
                    {'title': 'Introduction to Django', 'lesson_type': 'video', 'duration_minutes': 45, 'video_url': 'https://www.youtube.com/watch?v=rHux0gMZ3Eg'},
                    {'title': 'Setting up Django Project', 'lesson_type': 'video', 'duration_minutes': 30, 'video_url': 'https://www.youtube.com/watch?v=UmljXZIypDc'},
                    {'title': 'Django Project Structure', 'lesson_type': 'text', 'duration_minutes': 25}
                ],
                [
                    {'title': 'Django Models', 'lesson_type': 'video', 'duration_minutes': 50, 'video_url': 'https://www.youtube.com/watch?v=1PkNiYlkkjo'},
                    {'title': 'Database Migrations', 'lesson_type': 'video', 'duration_minutes': 35, 'video_url': 'https://www.youtube.com/watch?v=aHC3uTkT9r8'},
                    {'title': 'Django Admin', 'lesson_type': 'video', 'duration_minutes': 40, 'video_url': 'https://www.youtube.com/watch?v=1PkNiYlkkjo'}
                ],
                [
                    {'title': 'Django Views', 'lesson_type': 'video', 'duration_minutes': 45, 'video_url': 'https://www.youtube.com/watch?v=F5mRW0jo-U4'},
                    {'title': 'Django Templates', 'lesson_type': 'video', 'duration_minutes': 40, 'video_url': 'https://www.youtube.com/watch?v=qDwdMDQ8oX4'},
                    {'title': 'URL Routing', 'lesson_type': 'text', 'duration_minutes': 30}
                ],
                [
                    {'title': 'Django REST Framework', 'lesson_type': 'video', 'duration_minutes': 60, 'video_url': 'https://www.youtube.com/watch?v=c708Nf0cHrs'},
                    {'title': 'API Authentication', 'lesson_type': 'video', 'duration_minutes': 45, 'video_url': 'https://www.youtube.com/watch?v=PUzgZrS_piQ'},
                    {'title': 'Final Project', 'lesson_type': 'assignment', 'duration_minutes': 120}
                ]
            ]
        elif 'data-science' in course.slug:
            modules_data = [
                {'title': 'Python for Data Science', 'order': 1, 'duration_weeks': 4},
                {'title': 'Data Analysis with Pandas', 'order': 2, 'duration_weeks': 4},
                {'title': 'Data Visualization', 'order': 3, 'duration_weeks': 3},
                {'title': 'Statistical Analysis', 'order': 4, 'duration_weeks': 3}
            ]
            lessons_per_module = [
                [
                    {'title': 'Python Basics for Data Science', 'lesson_type': 'video', 'duration_minutes': 45, 'video_url': 'https://www.youtube.com/watch?v=LHBE6Q9XlzI'},
                    {'title': 'NumPy Fundamentals', 'lesson_type': 'video', 'duration_minutes': 50, 'video_url': 'https://www.youtube.com/watch?v=QUT1VHiLmmI'},
                    {'title': 'Working with Arrays', 'lesson_type': 'text', 'duration_minutes': 35}
                ],
                [
                    {'title': 'Introduction to Pandas', 'lesson_type': 'video', 'duration_minutes': 55, 'video_url': 'https://www.youtube.com/watch?v=vmEHCJofslg'},
                    {'title': 'Data Cleaning Techniques', 'lesson_type': 'video', 'duration_minutes': 60, 'video_url': 'https://www.youtube.com/watch?v=bDhvCp3_lYw'},
                    {'title': 'Data Transformation', 'lesson_type': 'assignment', 'duration_minutes': 90}
                ],
                [
                    {'title': 'Matplotlib Basics', 'lesson_type': 'video', 'duration_minutes': 45, 'video_url': 'https://www.youtube.com/watch?v=UO98lJQ3QGI'},
                    {'title': 'Seaborn for Statistical Plots', 'lesson_type': 'video', 'duration_minutes': 40, 'video_url': 'https://www.youtube.com/watch?v=6GUZXDef2U0'},
                    {'title': 'Interactive Visualizations', 'lesson_type': 'text', 'duration_minutes': 35}
                ],
                [
                    {'title': 'Descriptive Statistics', 'lesson_type': 'video', 'duration_minutes': 50, 'video_url': 'https://www.youtube.com/watch?v=MdHtK7CWpCQ'},
                    {'title': 'Hypothesis Testing', 'lesson_type': 'video', 'duration_minutes': 55, 'video_url': 'https://www.youtube.com/watch?v=0oc49DyA3hU'},
                    {'title': 'Final Data Science Project', 'lesson_type': 'assignment', 'duration_minutes': 150}
                ]
            ]
        else:  # React course
            modules_data = [
                {'title': 'React Fundamentals', 'order': 1, 'duration_weeks': 3},
                {'title': 'State Management', 'order': 2, 'duration_weeks': 2},
                {'title': 'React Router', 'order': 3, 'duration_weeks': 2},
                {'title': 'Advanced React', 'order': 4, 'duration_weeks': 3}
            ]
            lessons_per_module = [
                [
                    {'title': 'Introduction to React', 'lesson_type': 'video', 'duration_minutes': 45, 'video_url': 'https://www.youtube.com/watch?v=Ke90Tje7VS0'},
                    {'title': 'JSX and Components', 'lesson_type': 'video', 'duration_minutes': 40, 'video_url': 'https://www.youtube.com/watch?v=QFaFIcGhPoM'},
                    {'title': 'Props and Events', 'lesson_type': 'text', 'duration_minutes': 35}
                ],
                [
                    {'title': 'useState Hook', 'lesson_type': 'video', 'duration_minutes': 45, 'video_url': 'https://www.youtube.com/watch?v=O6P86uwfdR0'},
                    {'title': 'useEffect Hook', 'lesson_type': 'video', 'duration_minutes': 50, 'video_url': 'https://www.youtube.com/watch?v=0ZJgIjIuY7U'},
                    {'title': 'Context API', 'lesson_type': 'assignment', 'duration_minutes': 75}
                ],
                [
                    {'title': 'React Router Setup', 'lesson_type': 'video', 'duration_minutes': 40, 'video_url': 'https://www.youtube.com/watch?v=Law7wfdg_ls'},
                    {'title': 'Navigation and Links', 'lesson_type': 'video', 'duration_minutes': 35, 'video_url': 'https://www.youtube.com/watch?v=Jppuj6M1sJ4'},
                    {'title': 'Protected Routes', 'lesson_type': 'text', 'duration_minutes': 30}
                ],
                [
                    {'title': 'Custom Hooks', 'lesson_type': 'video', 'duration_minutes': 50, 'video_url': 'https://www.youtube.com/watch?v=6ThXsUwLWvc'},
                    {'title': 'Performance Optimization', 'lesson_type': 'video', 'duration_minutes': 45, 'video_url': 'https://www.youtube.com/watch?v=uojLJFt9SzY'},
                    {'title': 'React Portfolio Project', 'lesson_type': 'assignment', 'duration_minutes': 120}
                ]
            ]
        
        # Create modules and lessons
        for module_idx, module_data in enumerate(modules_data):
            module_data['course'] = course
            module, created = CourseModule.objects.get_or_create(
                course=course,
                order=module_data['order'],
                defaults=module_data
            )
            
            # Create lessons for this module
            for lesson_idx, lesson_data in enumerate(lessons_per_module[module_idx]):
                lesson_data.update({
                    'module': module,
                    'order': lesson_idx + 1,
                    'content': self.get_lesson_content(lesson_data['lesson_type'], lesson_data['title'])
                })
                
                Lesson.objects.get_or_create(
                    module=module,
                    order=lesson_data['order'],
                    defaults=lesson_data
                )

    def get_lesson_content(self, lesson_type, title):
        """Generate realistic lesson content based on type and title."""
        if lesson_type == 'video':
            return f"""
# {title}

## 📹 Video Lesson Overview
This comprehensive video lesson covers the fundamentals of {title.lower()}. You'll learn key concepts through practical demonstrations and real-world examples.

## 🎯 Learning Objectives
By the end of this video lesson, you will be able to:
- Understand the core principles and concepts
- Apply the techniques in practical scenarios
- Implement solutions using industry-standard tools
- Troubleshoot common issues and challenges

## 📚 Prerequisites
- Basic understanding of previous lessons
- Python programming fundamentals
- Access to development environment

## 🛠️ Tools and Resources
- Python 3.8+
- Jupyter Notebook
- Required libraries (see requirements.txt)
- Sample datasets provided

## 📖 Lesson Content
Watch the video carefully and take notes on key concepts. The video includes:
1. **Introduction** - Overview of the topic
2. **Theory** - Fundamental concepts explained
3. **Demo** - Live coding demonstration
4. **Practice** - Guided exercises
5. **Summary** - Key takeaways and next steps

## 📝 Notes Section
Use this space to take your own notes while watching the video:

[Your notes here]

## ❓ Questions for Review
1. What are the main concepts covered in this lesson?
2. How can you apply these concepts to real-world problems?
3. What are the common pitfalls to avoid?

## 🔗 Additional Resources
- Official documentation links
- Recommended reading materials
- Practice exercises and datasets

## ➡️ Next Steps
After completing this video lesson:
1. Review the provided materials
2. Complete the practice exercises
3. Move on to the next lesson
4. Ask questions in the discussion forum if needed
"""
        elif lesson_type == 'text':
            return f"""
# {title}

## 📖 Introduction
Welcome to this comprehensive text lesson on {title.lower()}. This lesson provides detailed explanations, examples, and practical insights that complement your learning journey.

## 🎯 Learning Objectives
After reading this lesson, you will understand:
- Key concepts and terminology
- Practical applications and use cases
- Best practices and common patterns
- How this topic fits into the broader curriculum

## 📚 Core Concepts

### Concept 1: Fundamentals
Understanding the basic principles is crucial for mastering {title.lower()}. These fundamentals form the foundation for more advanced topics.

**Key Points:**
- Definition and scope
- Historical context and evolution
- Current industry standards
- Future trends and developments

### Concept 2: Practical Applications
Real-world applications help bridge the gap between theory and practice:

1. **Industry Use Cases**: How professionals use these concepts
2. **Common Scenarios**: Typical problems and solutions
3. **Best Practices**: Proven approaches and methodologies
4. **Case Studies**: Real examples from successful projects

### Concept 3: Implementation Details
Technical implementation requires attention to:
- Setup and configuration requirements
- Step-by-step implementation process
- Common challenges and solutions
- Testing and validation approaches

## 💡 Examples and Demonstrations

### Example 1: Basic Implementation
```python
# Sample code demonstrating key concepts
def example_function():
    # Implementation details
    pass
```

### Example 2: Advanced Usage
```python
# More complex example showing advanced techniques
class ExampleClass:
    def __init__(self):
        self.data = []
    
    def process_data(self, input_data):
        # Advanced processing logic
        return processed_data
```

## ⚠️ Common Pitfalls and Solutions

### Pitfall 1: Misunderstanding Concepts
**Problem**: Students often confuse related concepts
**Solution**: Clear definitions and examples help distinguish between similar ideas

### Pitfall 2: Implementation Errors
**Problem**: Common coding mistakes and logic errors
**Solution**: Follow best practices and use proper testing

## 🔍 Deep Dive Topics

For those interested in exploring further:
- Advanced techniques and optimizations
- Integration with other technologies
- Performance considerations
- Scalability and maintenance

## 📊 Summary and Key Takeaways

### Main Points Covered:
1. Fundamental concepts and definitions
2. Practical applications and use cases
3. Implementation strategies and best practices
4. Common challenges and solutions

### Action Items:
- [ ] Review key concepts and terminology
- [ ] Practice with provided examples
- [ ] Apply concepts to your own projects
- [ ] Prepare for assessments and quizzes

## 🔗 References and Further Reading
- Official documentation and guides
- Academic papers and research
- Industry blogs and articles
- Community forums and discussions

## ❓ Self-Assessment Questions
1. Can you explain the main concepts in your own words?
2. How would you apply these concepts to solve a real problem?
3. What are the most important best practices to remember?
4. How does this topic relate to other lessons in the course?

---
*Continue to the next lesson when you feel confident about the material covered here.*
"""
        elif lesson_type == 'assignment':
            return f"""
# Assignment: {title}

## 🎯 Assignment Objective
This hands-on assignment is designed to reinforce your learning and demonstrate your understanding of the concepts covered in recent lessons.

## 📋 Assignment Overview
You will complete a practical project that involves:
- Applying theoretical concepts to real-world scenarios
- Implementing solutions using appropriate tools and techniques
- Documenting your approach and findings
- Presenting results in a clear and professional manner

## 🛠️ Requirements

### Technical Requirements:
- Python 3.8 or higher
- Required libraries (see requirements.txt)
- Jupyter Notebook or preferred IDE
- Access to provided datasets

### Deliverables:
1. **Code Implementation** - Well-documented Python code
2. **Analysis Report** - Written analysis of your approach and results
3. **Presentation** - Summary of key findings and insights
4. **Documentation** - Clear instructions for running your code

## 📝 Detailed Instructions

### Step 1: Setup and Preparation (15 minutes)
1. Download the provided dataset and starter code
2. Set up your development environment
3. Review the assignment requirements and rubric
4. Plan your approach and timeline

### Step 2: Data Exploration (30 minutes)
1. Load and examine the dataset
2. Identify key features and patterns
3. Perform initial data cleaning if necessary
4. Create visualizations to understand the data

### Step 3: Implementation (60-90 minutes)
1. Implement the required algorithms/techniques
2. Test your implementation with sample data
3. Optimize and refine your solution
4. Add proper error handling and validation

### Step 4: Analysis and Documentation (30 minutes)
1. Analyze your results and findings
2. Compare different approaches if applicable
3. Document your code with clear comments
4. Write a summary of your methodology

### Step 5: Presentation Preparation (15 minutes)
1. Create visualizations of your results
2. Prepare a brief presentation of key findings
3. Identify areas for improvement or future work
4. Review and finalize all deliverables

## 📊 Evaluation Criteria

Your assignment will be evaluated based on:

### Technical Implementation (40%)
- Correctness of the solution
- Code quality and organization
- Proper use of techniques and tools
- Error handling and edge cases

### Analysis and Insights (30%)
- Quality of data exploration
- Depth of analysis and interpretation
- Identification of patterns and trends
- Validity of conclusions drawn

### Documentation and Presentation (20%)
- Clarity of code comments and documentation
- Quality of written analysis report
- Effectiveness of visualizations
- Professional presentation of results

### Creativity and Innovation (10%)
- Original approaches or insights
- Additional features or improvements
- Creative problem-solving techniques
- Going beyond minimum requirements

## 📅 Submission Guidelines

### Submission Format:
- Submit all files in a single ZIP archive
- Include a README file with setup instructions
- Ensure all code runs without errors
- Include all necessary data files and dependencies

### Naming Convention:
- Use the format: `LastName_FirstName_Assignment_Title.zip`
- Individual files should be clearly named
- Include version numbers if submitting multiple drafts

### Deadline:
- **Due Date**: [Check course schedule]
- **Late Submission Policy**: Refer to course syllabus
- **Extension Requests**: Contact instructor at least 48 hours before deadline

## 💡 Tips for Success

### Before You Start:
- Read through the entire assignment before beginning
- Plan your time and break the work into manageable chunks
- Set up version control to track your progress
- Create backups of your work regularly

### During Implementation:
- Test your code frequently with small examples
- Use print statements or debugger to trace execution
- Don't hesitate to research and learn new techniques
- Keep your code clean and well-organized

### Before Submission:
- Test your complete solution from start to finish
- Review your documentation for clarity and completeness
- Check that all requirements have been met
- Proofread your written analysis for errors

## 🆘 Getting Help

### Resources Available:
- Course discussion forums
- Office hours with instructor or TAs
- Online documentation and tutorials
- Study groups and peer collaboration

### When to Ask for Help:
- If you're stuck on a technical issue for more than 30 minutes
- If you need clarification on assignment requirements
- If you encounter unexpected errors or problems
- If you want feedback on your approach before full implementation

## 🏆 Bonus Opportunities

Consider these optional enhancements for extra credit:
- Implement additional algorithms or techniques
- Create interactive visualizations or dashboards
- Perform comparative analysis of different approaches
- Extend the solution to handle additional use cases

---

**Good luck with your assignment! Remember, the goal is to learn and apply the concepts, so focus on understanding rather than just completing the tasks.**
"""
        else:
            return f"Comprehensive content for {title} - {lesson_type} lesson with detailed explanations and examples."

    def create_enrollments(self):
        """Create enrollments and progress data."""
        self.stdout.write('Creating enrollments and progress...')
        
        # Get all courses
        courses = Course.objects.all()
        
        # Create enrollments for students
        enrollments = []
        for student in self.student_users:
            # Each student enrolls in 1-3 courses
            num_courses = random.randint(1, min(3, len(courses)))
            student_courses = random.sample(list(courses), num_courses)
            
            for course in student_courses:
                enrollment_date = timezone.now() - timedelta(days=random.randint(1, 90))
                
                enrollment, created = Enrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        'enrollment_date': enrollment_date,
                        'status': random.choice(['active', 'active', 'active', 'completed']),
                        'payment_status': 'paid',
                        'amount_paid': course.price,
                        'payment_method': random.choice(['razorpay', 'credit_card', 'upi']),
                        'payment_reference': f'REF_{random.randint(100000, 999999)}'
                    }
                )
                if created:
                    self.stdout.write(f'  Created enrollment: {student.full_name} -> {course.title}')
                    enrollments.append(enrollment)
        
        # Create progress data
        self.create_progress_data(enrollments)

    def create_enrollments_only(self):
        """Create enrollments without progress data."""
        self.stdout.write('Creating enrollments...')
        
        # Get all courses
        courses = Course.objects.all()
        
        # Create enrollments for students
        enrollments = []
        for student in self.student_users:
            # Each student enrolls in 1-3 courses
            num_courses = random.randint(1, min(3, len(courses)))
            student_courses = random.sample(list(courses), num_courses)
            
            for course in student_courses:
                enrollment_date = timezone.now() - timedelta(days=random.randint(1, 90))
                
                enrollment, created = Enrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        'enrollment_date': enrollment_date,
                        'status': random.choice(['active', 'active', 'active', 'completed']),
                        'payment_status': 'paid',
                        'amount_paid': course.price,
                        'payment_method': random.choice(['razorpay', 'credit_card', 'upi']),
                        'payment_reference': f'REF_{random.randint(100000, 999999)}'
                    }
                )
                if created:
                    self.stdout.write(f'  Created enrollment: {student.full_name} -> {course.title}')
                    enrollments.append(enrollment)
        
        return enrollments

    def create_progress_data(self, enrollments):
        """Create realistic progress data for enrollments."""
        self.stdout.write('Creating progress data...')
        
        for enrollment in enrollments:
            # Create course progress
            course_progress, created = CourseProgress.objects.get_or_create(
                enrollment=enrollment,
                defaults={
                    'started_at': enrollment.enrollment_date,
                    'last_activity': timezone.now() - timedelta(days=random.randint(0, 7))
                }
            )
            
            # Get all modules for this course
            modules = enrollment.course.modules.all().order_by('order')
            
            # Determine how much progress to simulate
            if enrollment.status == 'completed':
                progress_factor = 1.0  # 100% complete
            else:
                progress_factor = random.uniform(0.1, 0.8)  # 10-80% complete
            
            modules_to_progress = int(len(modules) * progress_factor)
            
            for module_idx, module in enumerate(modules):
                # Create module progress
                module_progress, created = ModuleProgress.objects.get_or_create(
                    enrollment=enrollment,
                    module=module
                )
                
                # Get lessons for this module
                lessons = module.lessons.all().order_by('order')
                
                if module_idx < modules_to_progress:
                    # This module should have progress
                    if module_idx < modules_to_progress - 1:
                        # Completed modules
                        lessons_to_complete = len(lessons)
                    else:
                        # Partially completed module
                        lessons_to_complete = random.randint(1, len(lessons))
                    
                    for lesson_idx, lesson in enumerate(lessons):
                        if lesson_idx < lessons_to_complete:
                            # Create lesson progress
                            completion_percentage = 100 if lesson_idx < lessons_to_complete - 1 else random.randint(50, 100)
                            
                            lesson_progress, created = LessonProgress.objects.get_or_create(
                                enrollment=enrollment,
                                lesson=lesson,
                                defaults={
                                    'is_completed': completion_percentage == 100,
                                    'is_started': True,
                                    'completion_percentage': completion_percentage,
                                    'time_spent_minutes': random.randint(lesson.duration_minutes, lesson.duration_minutes + 30),
                                    'started_at': enrollment.enrollment_date + timedelta(days=lesson_idx),
                                    'completed_at': enrollment.enrollment_date + timedelta(days=lesson_idx + 1) if completion_percentage == 100 else None,
                                    'last_accessed': timezone.now() - timedelta(days=random.randint(0, 7))
                                }
                            )
                            
                            # Create study sessions
                            if random.random() < 0.7:  # 70% chance of having study sessions
                                num_sessions = random.randint(1, 3)
                                for session_idx in range(num_sessions):
                                    session_date = enrollment.enrollment_date + timedelta(days=lesson_idx) + timedelta(hours=session_idx * 2)
                                    duration = random.randint(20, 90)
                                    
                                    StudySession.objects.get_or_create(
                                        enrollment=enrollment,
                                        lesson=lesson,
                                        defaults={
                                            'started_at': session_date,
                                            'ended_at': session_date + timedelta(minutes=duration),
                                            'session_duration_minutes': duration,
                                            'progress_made': random.randint(10, 40)
                                        }
                                    )
                
                # Update module progress
                module_progress.update_progress()
            
            # Update course progress
            course_progress.update_progress()
            
            self.stdout.write(f'    Created progress for: {enrollment.student.full_name} -> {enrollment.course.title}')

    def create_reviews_and_wishlists(self):
        """Create course reviews and wishlists."""
        self.stdout.write('Creating reviews and wishlists...')
        
        # Create reviews for completed enrollments
        completed_enrollments = Enrollment.objects.filter(status='completed')
        
        for enrollment in completed_enrollments:
            if random.random() < 0.7:  # 70% chance of leaving a review
                rating = random.choices([4, 5, 3, 5, 4], weights=[30, 40, 10, 15, 5])[0]
                
                review_titles = {
                    5: ['Excellent course!', 'Highly recommended!', 'Outstanding content!', 'Perfect for learning!'],
                    4: ['Very good course', 'Great learning experience', 'Well structured', 'Informative and practical'],
                    3: ['Good course overall', 'Decent content', 'Could be better', 'Average experience']
                }
                
                review_contents = {
                    5: [
                        'This course exceeded my expectations. The content is well-structured, practical, and the instructor explains complex concepts clearly.',
                        'Amazing course with hands-on projects. I learned so much and can now apply these skills in my work.',
                        'Excellent teaching methodology. The combination of theory and practice is perfect.',
                        'One of the best online courses I have taken. Highly recommend to anyone interested in this field.'
                    ],
                    4: [
                        'Very good course with comprehensive content. Some sections could be explained in more detail.',
                        'Great learning experience overall. The projects are practical and relevant.',
                        'Well-organized course with good examples. The instructor is knowledgeable.',
                        'Good course content and structure. Would recommend to beginners and intermediate learners.'
                    ],
                    3: [
                        'The course covers the basics well but could use more advanced topics.',
                        'Decent course with good content, but the pace could be better.',
                        'Good for beginners, but experienced learners might find it too basic.',
                        'The course is okay, but there are better alternatives available.'
                    ]
                }
                
                CourseReview.objects.get_or_create(
                    enrollment=enrollment,
                    defaults={
                        'rating': rating,
                        'content': random.choice(review_contents[rating]),
                        'is_approved': True,
                        'is_anonymous': random.choice([True, False])
                    }
                )
        
        # Create wishlists for students
        all_courses = Course.objects.all()
        for student in self.student_users:
            # Students wishlist 1-4 courses they're not enrolled in
            enrolled_courses = set(student.enrollments.values_list('course', flat=True))
            available_courses = [c for c in all_courses if c.id not in enrolled_courses]
            
            if available_courses:
                num_wishlist = random.randint(1, min(4, len(available_courses)))
                wishlist_courses = random.sample(available_courses, num_wishlist)
                
                for course in wishlist_courses:
                    CourseWishlist.objects.get_or_create(
                        student=student,
                        course=course
                    )

    def create_payments(self):
        """Create payment records."""
        self.stdout.write('Creating payments...')
        
        # Get all enrollments
        enrollments = Enrollment.objects.all()
        
        for enrollment in enrollments:
            # Create payment for each enrollment
            payment_date = enrollment.enrollment_date + timedelta(minutes=random.randint(-30, 30))
            
            # Determine payment status
            status_choices = ['paid', 'verified', 'verified', 'paid']  # More verified than pending
            status = random.choice(status_choices)
            
            payment_data = {
                'user': enrollment.student,
                'enrollment': enrollment,
                'amount': enrollment.course.price,
                'currency': 'INR',
                'razorpay_order_id': f'order_{random.randint(100000, 999999)}',
                'razorpay_payment_id': f'pay_{random.randint(100000, 999999)}',
                'status': status,
                'created_at': payment_date,
                'paid_at': payment_date + timedelta(minutes=1) if status in ['paid', 'verified'] else None,
            }
            
            if status == 'verified':
                payment_data.update({
                    'verified_at': payment_date + timedelta(hours=random.randint(1, 48)),
                    'verified_by': enrollment.course.tutor,
                    'verification_notes': random.choice([
                        'Payment verified successfully',
                        'Valid payment confirmed',
                        'Student enrollment approved',
                        'Payment processed and verified'
                    ])
                })
            
            payment, created = Payment.objects.get_or_create(
                razorpay_payment_id=payment_data['razorpay_payment_id'],
                defaults=payment_data
            )
            
            if created:
                self.stdout.write(f'  Created payment: {payment.user.full_name} -> ₹{payment.amount} ({payment.status})')

    def create_notifications(self):
        """Create course notifications."""
        self.stdout.write('Creating notifications...')
        
        notification_types = [
            ('course_update', 'Course Update'),
            ('new_lesson', 'New Lesson Available'),
            ('assignment_due', 'Assignment Due Soon'),
            ('course_completion', 'Course Completed'),
            ('payment_confirmed', 'Payment Confirmed'),
        ]
        
        notification_messages = {
            'course_update': [
                'New content has been added to your course.',
                'Course materials have been updated.',
                'Important course announcement posted.'
            ],
            'new_lesson': [
                'A new lesson is now available in your course.',
                'New video lesson has been published.',
                'Fresh content added to your learning path.'
            ],
            'assignment_due': [
                'Your assignment is due in 3 days.',
                'Don\'t forget to submit your project.',
                'Assignment deadline approaching.'
            ],
            'course_completion': [
                'Congratulations! You have completed the course.',
                'Course completion certificate is now available.',
                'You have successfully finished all lessons.'
            ],
            'payment_confirmed': [
                'Your payment has been confirmed.',
                'Enrollment payment processed successfully.',
                'Payment verification completed.'
            ]
        }
        
        # Create notifications for enrolled students
        enrollments = Enrollment.objects.all()
        
        for enrollment in enrollments:
            # Create 2-5 notifications per enrollment
            num_notifications = random.randint(2, 5)
            
            for _ in range(num_notifications):
                notification_type, type_display = random.choice(notification_types)
                
                CourseNotification.objects.get_or_create(
                    user=enrollment.student,
                    course=enrollment.course,
                    notification_type=notification_type,
                    defaults={
                        'title': f'{type_display} - {enrollment.course.title}',
                        'message': random.choice(notification_messages[notification_type]),
                        'is_read': random.choice([True, False]),
                        'created_at': enrollment.enrollment_date + timedelta(days=random.randint(1, 30))
                    }
                )
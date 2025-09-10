#!/usr/bin/env python
"""
Script to populate the database with organizations, users, and courses.
"""

import os
import sys
import django
from django.utils.text import slugify
from django.utils import timezone
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from users.models import Organization, User
from courses.models import Course, CourseModule, Lesson


def create_organizations():
    """Create the specified organizations."""
    
    orgs_data = [
        {
            'id': '8184859d-0873-4e53-9692-e4d68bd80219',
            'name': 'Tata Consultancy Services',
            'type': 'company',
            'location': 'Mumbai, Maharashtra, India',
            'website': 'https://www.tcs.com',
            'description': 'Leading global IT services, consulting and business solutions organization that has been partnering with many of the world\'s largest businesses in their transformation journeys for over 55 years.'
        },
        {
            'id': '7aeabbe4-f580-406f-9f65-5ad0f46cdfce',
            'name': 'Indian Institute of Science',
            'type': 'university',
            'location': 'Bangalore, Karnataka, India',
            'website': 'https://www.iisc.ac.in',
            'description': 'Premier institute for advanced scientific and technological research and education in India, known for its cutting-edge research in science and engineering.'
        }
    ]
    
    organizations = []
    for org_data in orgs_data:
        org, created = Organization.objects.get_or_create(
            id=org_data['id'],
            defaults=org_data
        )
        organizations.append(org)
        print(f"{'Created' if created else 'Found'} organization: {org.name}")
    
    return organizations


def create_users(organizations):
    """Create additional tutors for organizations."""
    
    tcs, iisc = organizations
    
    # Get existing users
    existing_users = list(User.objects.filter(organization__in=[tcs, iisc]))
    
    users_data = [
        # Additional TCS Users (since admin already exists)
        {
            'email': 'priya.patel@tcs.com',
            'full_name': 'Priya Patel',
            'role': 'tutor',
            'organization': tcs,
            'password': 'tutor123'
        },
        {
            'email': 'amit.kumar@tcs.com',
            'full_name': 'Amit Kumar',
            'role': 'tutor',
            'organization': tcs,
            'password': 'tutor123'
        },
        # Additional IISc Users (since admin already exists)
        {
            'email': 'prof.meera@iisc.ac.in',
            'full_name': 'Prof. Meera Sundaram',
            'role': 'tutor',
            'organization': iisc,
            'password': 'tutor123'
        },
        {
            'email': 'dr.arjun@iisc.ac.in',
            'full_name': 'Dr. Arjun Mishra',
            'role': 'tutor',
            'organization': iisc,
            'password': 'tutor123'
        }
    ]
    
    new_users = []
    for user_data in users_data:
        password = user_data.pop('password')
        user_data['username'] = user_data['email']  # Set username to email
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults=user_data
        )
        if created:
            user.set_password(password)
            user.is_verified = True
            user.save()
        new_users.append(user)
        print(f"{'Created' if created else 'Found'} user: {user.full_name} ({user.role})")
    
    # Return all users for these organizations
    all_users = existing_users + new_users
    return all_users


def create_courses(organizations, users):
    """Create sample courses for organizations."""
    
    tcs, iisc = organizations
    
    # Get tutors for each organization
    tcs_tutors = [u for u in users if u.organization == tcs and u.role == 'tutor']
    iisc_tutors = [u for u in users if u.organization == iisc and u.role == 'tutor']
    
    courses_data = [
        # TCS Courses (Corporate/Professional)
        {
            'title': 'Full Stack Development with React & Django',
            'description': 'Complete full-stack development course covering React frontend and Django backend for enterprise applications.',
            'organization': tcs,
            'instructor': tcs_tutors[0] if tcs_tutors else None,
            'category': 'backend_development',
            'level': 'intermediate',
            'duration_weeks': 16,
            'price': Decimal('15999.00'),
            'objectives': 'Learn to build scalable web applications using React and Django. Master API development, database design, authentication, and deployment.',
            'prerequisites': 'Basic knowledge of JavaScript and Python. Understanding of HTML/CSS.',
            'icon': '/assets/courses/react.svg',
            'status': 'published',
            'is_featured': True
        },
        {
            'title': 'Enterprise Data Analytics with Python',
            'description': 'Advanced data analytics course designed for corporate professionals using Python, Pandas, and visualization tools.',
            'organization': tcs,
            'instructor': tcs_tutors[1] if len(tcs_tutors) > 1 else tcs_tutors[0] if tcs_tutors else None,
            'category': 'data_science',
            'level': 'advanced',
            'duration_weeks': 12,
            'price': Decimal('12999.00'),
            'objectives': 'Master enterprise-level data analysis, statistical modeling, and business intelligence reporting using Python ecosystem.',
            'prerequisites': 'Basic Python programming. Understanding of statistics and mathematics.',
            'icon': '/assets/courses/python.svg',
            'status': 'published',
            'is_featured': True
        },
        {
            'title': 'DevOps and Cloud Computing',
            'description': 'Comprehensive DevOps course covering AWS, Docker, Kubernetes, and CI/CD pipelines for enterprise deployment.',
            'organization': tcs,
            'instructor': tcs_tutors[0] if tcs_tutors else None,
            'category': 'devops',
            'level': 'advanced',
            'duration_weeks': 14,
            'price': Decimal('18999.00'),
            'objectives': 'Learn modern DevOps practices, cloud infrastructure management, containerization, and automated deployment strategies.',
            'prerequisites': 'Basic Linux knowledge. Understanding of software development lifecycle.',
            'icon': '/assets/courses/sql.png',
            'status': 'published',
            'is_featured': False
        },
        
        # IISc Courses (Academic/Research-oriented)
        {
            'title': 'AI for School Kids - Introduction to Machine Learning',
            'description': 'Fun and interactive introduction to artificial intelligence and machine learning concepts designed specifically for school children.',
            'organization': iisc,
            'instructor': iisc_tutors[0] if iisc_tutors else None,
            'category': 'ai_kids',
            'level': 'beginner',
            'duration_weeks': 8,
            'price': Decimal('4999.00'),
            'objectives': 'Introduce children to AI concepts through games, visual programming, and hands-on projects. Build logical thinking and problem-solving skills.',
            'prerequisites': 'Age 10-16. Basic computer usage. Curiosity about technology!',
            'icon': '/assets/courses/python.svg',
            'status': 'published',
            'is_featured': True
        },
        {
            'title': 'Programming for Kids - Python Adventures',
            'description': 'Engaging Python programming course for children with games, animations, and creative projects.',
            'organization': iisc,
            'instructor': iisc_tutors[1] if len(iisc_tutors) > 1 else iisc_tutors[0] if iisc_tutors else None,
            'category': 'programming_kids',
            'level': 'beginner',
            'duration_weeks': 10,
            'price': Decimal('6999.00'),
            'objectives': 'Learn Python programming through fun projects like games, animations, and interactive stories. Develop computational thinking skills.',
            'prerequisites': 'Age 12-18. Basic reading and math skills. Interest in technology and creativity.',
            'icon': '/assets/courses/python.svg',
            'status': 'published',
            'is_featured': True
        },
        {
            'title': 'Advanced Computer Science Research Methods',
            'description': 'Graduate-level course on advanced research methodologies in computer science and emerging technologies.',
            'organization': iisc,
            'instructor': iisc_tutors[0] if iisc_tutors else None,
            'category': 'data_science',
            'level': 'advanced',
            'duration_weeks': 16,
            'price': Decimal('25999.00'),
            'objectives': 'Master advanced research techniques, publish-quality paper writing, experimental design, and cutting-edge technology analysis.',
            'prerequisites': 'Masters degree in Computer Science or related field. Strong mathematical background.',
            'icon': '/assets/courses/Statistics.png',
            'status': 'published',
            'is_featured': False
        },
        {
            'title': 'Robotics and IoT for Young Innovators',
            'description': 'Hands-on robotics and Internet of Things course for teenagers to build real projects and understand modern technology.',
            'organization': iisc,
            'instructor': iisc_tutors[1] if len(iisc_tutors) > 1 else iisc_tutors[0] if iisc_tutors else None,
            'category': 'robotics',
            'level': 'intermediate',
            'duration_weeks': 12,
            'price': Decimal('9999.00'),
            'objectives': 'Build functional robots, understand IoT concepts, work with sensors and actuators, and create connected devices.',
            'prerequisites': 'Age 14-18. Basic programming knowledge helpful but not required. Interest in electronics and building things.',
            'icon': '/assets/courses/react.svg',
            'status': 'published',
            'is_featured': True
        }
    ]
    
    courses = []
    for course_data in courses_data:
        if not course_data['instructor']:
            print(f"Skipping course {course_data['title']} - no instructor available")
            continue
            
        course_data['slug'] = slugify(course_data['title'])
        course, created = Course.objects.get_or_create(
            slug=course_data['slug'],
            defaults=course_data
        )
        courses.append(course)
        print(f"{'Created' if created else 'Found'} course: {course.title} - {course.organization.name}")
        
        # Add sample modules and lessons
        if created:
            create_sample_modules(course)
    
    return courses


def create_sample_modules(course):
    """Create sample modules and lessons for a course."""
    
    if 'AI for School Kids' in course.title:
        modules_data = [
            {
                'title': 'What is Artificial Intelligence?',
                'description': 'Introduction to AI concepts through fun examples and games.',
                'lessons': [
                    {'title': 'AI All Around Us', 'lesson_type': 'video', 'is_preview': True},
                    {'title': 'Smart vs Regular Programs', 'lesson_type': 'text'},
                    {'title': 'AI Quiz Challenge', 'lesson_type': 'quiz'}
                ]
            },
            {
                'title': 'Machine Learning Magic',
                'description': 'Understanding how machines learn using simple visual examples.',
                'lessons': [
                    {'title': 'Teaching Computers to Recognize Pictures', 'lesson_type': 'video'},
                    {'title': 'Pattern Recognition Game', 'lesson_type': 'assignment'},
                    {'title': 'Build Your First AI Model', 'lesson_type': 'assignment'}
                ]
            }
        ]
    elif 'Programming for Kids' in course.title:
        modules_data = [
            {
                'title': 'Python Basics - Your First Programs',
                'description': 'Learn Python programming through fun, interactive exercises.',
                'lessons': [
                    {'title': 'Welcome to Python World', 'lesson_type': 'video', 'is_preview': True},
                    {'title': 'Variables and Data Types', 'lesson_type': 'text'},
                    {'title': 'Your First Python Program', 'lesson_type': 'assignment'}
                ]
            },
            {
                'title': 'Games and Graphics',
                'description': 'Create games and visual programs using Python.',
                'lessons': [
                    {'title': 'Drawing with Python Turtle', 'lesson_type': 'video'},
                    {'title': 'Build a Simple Game', 'lesson_type': 'assignment'},
                    {'title': 'Animation Projects', 'lesson_type': 'assignment'}
                ]
            }
        ]
    elif 'Full Stack Development' in course.title:
        modules_data = [
            {
                'title': 'Frontend Development with React',
                'description': 'Master React.js for building modern user interfaces.',
                'lessons': [
                    {'title': 'React Fundamentals', 'lesson_type': 'video', 'is_preview': True},
                    {'title': 'Components and JSX', 'lesson_type': 'text'},
                    {'title': 'State Management', 'lesson_type': 'video'},
                    {'title': 'Build a React App', 'lesson_type': 'assignment'}
                ]
            },
            {
                'title': 'Backend Development with Django',
                'description': 'Create robust APIs and backend services using Django.',
                'lessons': [
                    {'title': 'Django Setup and Models', 'lesson_type': 'video'},
                    {'title': 'REST API Development', 'lesson_type': 'text'},
                    {'title': 'Authentication and Security', 'lesson_type': 'video'},
                    {'title': 'Deploy Your Application', 'lesson_type': 'assignment'}
                ]
            }
        ]
    else:
        # Default modules for other courses
        modules_data = [
            {
                'title': 'Introduction and Fundamentals',
                'description': 'Core concepts and foundational knowledge.',
                'lessons': [
                    {'title': 'Course Overview', 'lesson_type': 'video', 'is_preview': True},
                    {'title': 'Getting Started', 'lesson_type': 'text'},
                    {'title': 'First Assignment', 'lesson_type': 'assignment'}
                ]
            },
            {
                'title': 'Advanced Topics',
                'description': 'Deep dive into advanced concepts and real-world applications.',
                'lessons': [
                    {'title': 'Advanced Concepts', 'lesson_type': 'video'},
                    {'title': 'Case Study Analysis', 'lesson_type': 'text'},
                    {'title': 'Final Project', 'lesson_type': 'assignment'}
                ]
            }
        ]
    
    for i, module_data in enumerate(modules_data, 1):
        lessons_data = module_data.pop('lessons')
        module = CourseModule.objects.create(
            course=course,
            title=module_data['title'],
            description=module_data['description'],
            order=i
        )
        
        for j, lesson_data in enumerate(lessons_data, 1):
            Lesson.objects.create(
                module=module,
                title=lesson_data['title'],
                lesson_type=lesson_data['lesson_type'],
                order=j,
                is_preview=lesson_data.get('is_preview', False),
                description=f"Learn about {lesson_data['title'].lower()}"
            )


def main():
    """Main function to populate the database."""
    
    print("Creating organizations...")
    organizations = create_organizations()
    
    print("\nCreating users...")
    users = create_users(organizations)
    
    print("\nCreating courses...")
    courses = create_courses(organizations, users)
    
    print(f"\nDatabase populated successfully!")
    print(f"Organizations: {len(organizations)}")
    print(f"Users: {len(users)}")
    print(f"Courses: {len(courses)}")
    
    print("\nTest credentials:")
    print("TCS Admin: rajesh.sharma@tcs.com / admin123")
    print("TCS Tutor: priya.patel@tcs.com / tutor123")
    print("IISc Admin: dr.krishnan@iisc.ac.in / admin123")
    print("IISc Tutor: prof.meera@iisc.ac.in / tutor123")


if __name__ == '__main__':
    main()

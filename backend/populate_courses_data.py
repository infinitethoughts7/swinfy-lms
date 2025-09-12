#!/usr/bin/env python
import os
import sys
import django
import json
from decimal import Decimal
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from courses.models import *
from users.models import *

def load_demo_data():
    """Load demo video data from JSON files"""
    demo_data = {}
    demos_dir = '/Users/Apple/Desktop/swinfy-projects/swinfy-lms/backend/media/courses/demos/'
    
    for filename in os.listdir(demos_dir):
        if filename.endswith('.json'):
            with open(os.path.join(demos_dir, filename), 'r') as f:
                data = json.load(f)
                course_slug = data['course_slug']
                demo_data[course_slug] = data
    
    return demo_data

def create_courses():
    """Create comprehensive course data with proper relationships"""
    
    # Get training partners and tutors
    byjus = TrainingPartner.objects.get(name="BYJU'S")
    iisc = TrainingPartner.objects.get(name="Indian Institute of Science")
    iit_delhi = TrainingPartner.objects.get(name="Indian Institute of Technology Delhi")
    infosys = TrainingPartner.objects.get(name="Infosys Limited")
    tcs = TrainingPartner.objects.get(name="Tata Consultancy Services")
    
    # Get tutors
    tutors = User.objects.filter(role='tutor')
    dr_arjun = tutors.get(email="dr.arjun@iisc.ac.in")
    prof_meera = tutors.get(email="prof.meera@iisc.ac.in")
    amit_kumar = tutors.get(email="amit.kumar@tcs.com")
    priya_patel = tutors.get(email="priya.patel@tcs.com")
    arjun_sharma = tutors.get(email="arjun.sharma@gmail.com")
    krishna_murthy = tutors.get(email="krishna.murthy@outlook.com")
    
    # Load demo data
    demo_data = load_demo_data()
    
    # Course data with proper relationships
    courses_data = [
        {
            'title': 'Data Analysis with Python',
            'slug': 'data-analysis-python',
            'description': 'Master data analysis using Python with pandas, NumPy, and matplotlib. Learn to clean, analyze, and visualize data for business insights.',
            'short_description': 'Complete Python data analysis course covering pandas, NumPy, and visualization.',
            'price': Decimal('12999.00'),
            'duration_weeks': 12,
            'category': 'data_science',
            'level': 'intermediate',
            'tags': 'Python, Data Analysis, Pandas, NumPy, Matplotlib, Statistics',
            'tutor': dr_arjun,
            'training_partner': iisc,
            'learning_outcomes': '• Master Python for data analysis\n• Learn pandas for data manipulation\n• Create compelling visualizations\n• Perform statistical analysis\n• Build data pipelines',
            'prerequisites': 'Basic Python knowledge, familiarity with data concepts',
            'thumbnail': 'courses/thumbnails/data-analysis-python.jpg',
            'banner_image': 'courses/banners/data-analysis-python.jpg',
            'demo_video': 'courses/demos/data-analysis-python-demo.json',
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'approval_status': 'approved',
            'is_published': True,
            'is_featured': True,
            'is_draft': False,
            'rating': Decimal('4.8'),
            'total_reviews': 156,
            'enrollment_count': 1247,
            'view_count': 8934
        },
        {
            'title': 'Machine Learning Fundamentals',
            'slug': 'machine-learning-basics',
            'description': 'Introduction to machine learning concepts, algorithms, and practical applications using Python and scikit-learn.',
            'short_description': 'Learn machine learning from scratch with hands-on Python projects.',
            'price': Decimal('15999.00'),
            'duration_weeks': 14,
            'category': 'data_science',
            'level': 'intermediate',
            'tags': 'Machine Learning, Python, Scikit-learn, Algorithms, AI',
            'tutor': prof_meera,
            'training_partner': iisc,
            'learning_outcomes': '• Understand ML algorithms\n• Implement models with scikit-learn\n• Evaluate model performance\n• Handle real-world datasets\n• Deploy ML models',
            'prerequisites': 'Python programming, basic statistics, linear algebra',
            'thumbnail': 'courses/thumbnails/machine-learning-basics.jpg',
            'banner_image': 'courses/banners/machine-learning-basics.jpg',
            'demo_video': 'courses/demos/machine-learning-basics-demo.json',
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'approval_status': 'approved',
            'is_published': True,
            'is_featured': True,
            'is_draft': False,
            'rating': Decimal('4.7'),
            'total_reviews': 203,
            'enrollment_count': 1892,
            'view_count': 12456
        },
        {
            'title': 'Full Stack Development with React & Django',
            'slug': 'full-stack-development-with-react-django',
            'description': 'Build complete web applications using React for frontend and Django for backend. Learn modern development practices.',
            'short_description': 'Master full-stack development with React and Django.',
            'price': Decimal('18999.00'),
            'duration_weeks': 16,
            'category': 'backend_development',
            'level': 'intermediate',
            'tags': 'React, Django, JavaScript, Python, Full Stack, Web Development',
            'tutor': amit_kumar,
            'training_partner': tcs,
            'learning_outcomes': '• Build React applications\n• Create Django APIs\n• Implement authentication\n• Deploy full-stack apps\n• Use modern tools',
            'prerequisites': 'JavaScript basics, Python fundamentals, HTML/CSS',
            'thumbnail': 'courses/thumbnails/react-development.jpg',
            'banner_image': 'courses/banners/react-development.jpg',
            'demo_video': 'courses/demos/react-development-demo.json',
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'approval_status': 'approved',
            'is_published': True,
            'is_featured': True,
            'is_draft': False,
            'rating': Decimal('4.6'),
            'total_reviews': 178,
            'enrollment_count': 1456,
            'view_count': 9876
        },
        {
            'title': 'JavaScript Fundamentals',
            'slug': 'javascript-fundamentals',
            'description': 'Learn JavaScript from basics to advanced concepts. Master ES6+, DOM manipulation, and modern JavaScript features.',
            'short_description': 'Complete JavaScript course from beginner to advanced level.',
            'price': Decimal('8999.00'),
            'duration_weeks': 10,
            'category': 'frontend_development',
            'level': 'beginner',
            'tags': 'JavaScript, ES6, DOM, Frontend, Programming',
            'tutor': priya_patel,
            'training_partner': tcs,
            'learning_outcomes': '• Master JavaScript syntax\n• Work with DOM\n• Use ES6+ features\n• Build interactive websites\n• Debug effectively',
            'prerequisites': 'HTML and CSS basics',
            'thumbnail': 'courses/thumbnails/javascript-fundamentals.jpg',
            'banner_image': 'courses/banners/javascript-fundamentals.jpg',
            'demo_video': 'courses/demos/javascript-fundamentals-demo.json',
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'approval_status': 'approved',
            'is_published': True,
            'is_featured': False,
            'is_draft': False,
            'rating': Decimal('4.5'),
            'total_reviews': 234,
            'enrollment_count': 2134,
            'view_count': 15678
        },
        {
            'title': 'Python Programming Basics',
            'slug': 'python-basics',
            'description': 'Learn Python programming from scratch. Perfect for beginners who want to start their programming journey.',
            'short_description': 'Complete Python course for absolute beginners.',
            'price': Decimal('5999.00'),
            'duration_weeks': 8,
            'category': 'programming_kids',
            'level': 'beginner',
            'tags': 'Python, Programming, Beginner, Kids, Coding',
            'tutor': arjun_sharma,
            'training_partner': infosys,
            'learning_outcomes': '• Learn Python syntax\n• Write your first programs\n• Understand data types\n• Use control structures\n• Build simple projects',
            'prerequisites': 'No prior programming experience required',
            'thumbnail': 'courses/thumbnails/python-basics.jpg',
            'banner_image': 'courses/banners/python-basics.jpg',
            'demo_video': 'courses/demos/python-basics-demo.json',
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'approval_status': 'approved',
            'is_published': True,
            'is_featured': False,
            'is_draft': False,
            'rating': Decimal('4.4'),
            'total_reviews': 312,
            'enrollment_count': 3456,
            'view_count': 23456
        },
        {
            'title': 'UI/UX Design Principles',
            'slug': 'ui-ux-design',
            'description': 'Master user interface and user experience design. Learn design thinking, wireframing, and prototyping.',
            'short_description': 'Complete UI/UX design course with hands-on projects.',
            'price': Decimal('11999.00'),
            'duration_weeks': 12,
            'category': 'frontend_development',
            'level': 'intermediate',
            'tags': 'UI/UX, Design, Figma, Prototyping, User Research',
            'tutor': krishna_murthy,
            'training_partner': iit_delhi,
            'learning_outcomes': '• Master design principles\n• Create wireframes and prototypes\n• Conduct user research\n• Use design tools\n• Build design systems',
            'prerequisites': 'Basic computer skills, creativity',
            'thumbnail': 'courses/thumbnails/ui-ux-design.jpg',
            'banner_image': 'courses/banners/ui-ux-design.jpg',
            'demo_video': 'courses/demos/ui-ux-design-demo.json',
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'approval_status': 'approved',
            'is_published': True,
            'is_featured': True,
            'is_draft': False,
            'rating': Decimal('4.7'),
            'total_reviews': 189,
            'enrollment_count': 1234,
            'view_count': 8765
        },
        {
            'title': 'DevOps and Cloud Computing',
            'slug': 'devops-and-cloud-computing',
            'description': 'Learn DevOps practices, cloud computing, and deployment strategies. Master Docker, Kubernetes, and AWS.',
            'short_description': 'Complete DevOps and cloud computing course.',
            'price': Decimal('19999.00'),
            'duration_weeks': 14,
            'category': 'devops',
            'level': 'advanced',
            'tags': 'DevOps, Cloud, Docker, Kubernetes, AWS, CI/CD',
            'tutor': dr_arjun,
            'training_partner': iisc,
            'learning_outcomes': '• Master DevOps practices\n• Use Docker and Kubernetes\n• Deploy on cloud platforms\n• Implement CI/CD pipelines\n• Monitor applications',
            'prerequisites': 'Linux basics, programming experience',
            'thumbnail': 'courses/thumbnails/devops-cloud.jpg',
            'banner_image': 'courses/banners/devops-cloud.jpg',
            'demo_video': 'courses/demos/devops-cloud-demo.json',
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'approval_status': 'approved',
            'is_published': True,
            'is_featured': True,
            'is_draft': False,
            'rating': Decimal('4.8'),
            'total_reviews': 145,
            'enrollment_count': 987,
            'view_count': 6543
        }
    ]
    
    # Clear existing courses
    Course.objects.all().delete()
    
    # Create courses
    created_courses = []
    for course_data in courses_data:
        course = Course.objects.create(**course_data)
        created_courses.append(course)
        print(f"Created course: {course.title}")
    
    return created_courses

def create_course_content(courses):
    """Create modules, lessons, and materials for courses"""
    
    # Module and lesson data for each course
    content_data = {
        'data-analysis-python': {
            'modules': [
                {
                    'title': 'Introduction to Data Analysis',
                    'description': 'Learn the fundamentals of data analysis and Python tools',
                    'order': 1,
                    'duration_weeks': 2,
                    'lessons': [
                        {
                            'title': 'Welcome to Data Analysis',
                            'description': 'Introduction to the course and data analysis concepts',
                            'lesson_type': 'video',
                            'order': 1,
                            'duration_minutes': 45,
                            'video_url': 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
                            'is_preview': True
                        },
                        {
                            'title': 'Setting up Python Environment',
                            'description': 'Install Python, Jupyter, and required libraries',
                            'lesson_type': 'text',
                            'order': 2,
                            'duration_minutes': 30,
                            'content': 'Learn how to set up your Python environment for data analysis...'
                        },
                        {
                            'title': 'Introduction to Pandas',
                            'description': 'Learn the basics of pandas library',
                            'lesson_type': 'video',
                            'order': 3,
                            'duration_minutes': 60,
                            'video_url': 'https://www.youtube.com/watch?v=vmEHCJofslg'
                        }
                    ]
                },
                {
                    'title': 'Data Manipulation with Pandas',
                    'description': 'Master data manipulation techniques using pandas',
                    'order': 2,
                    'duration_weeks': 3,
                    'lessons': [
                        {
                            'title': 'DataFrames and Series',
                            'description': 'Understanding the core data structures in pandas',
                            'lesson_type': 'video',
                            'order': 1,
                            'duration_minutes': 50,
                            'video_url': 'https://www.youtube.com/watch?v=5JnMutdy6Fw'
                        },
                        {
                            'title': 'Data Cleaning Techniques',
                            'description': 'Learn to clean and preprocess data',
                            'lesson_type': 'video',
                            'order': 2,
                            'duration_minutes': 55,
                            'video_url': 'https://www.youtube.com/watch?v=KdmPHEnPJd8'
                        },
                        {
                            'title': 'Data Filtering and Selection',
                            'description': 'Filter and select data based on conditions',
                            'lesson_type': 'video',
                            'order': 3,
                            'duration_minutes': 40,
                            'video_url': 'https://www.youtube.com/watch?v=2AFGPdNn4FM'
                        }
                    ]
                }
            ]
        },
        'machine-learning-basics': {
            'modules': [
                {
                    'title': 'Introduction to Machine Learning',
                    'description': 'Learn the fundamentals of machine learning',
                    'order': 1,
                    'duration_weeks': 3,
                    'lessons': [
                        {
                            'title': 'What is Machine Learning?',
                            'description': 'Introduction to ML concepts and applications',
                            'lesson_type': 'video',
                            'order': 1,
                            'duration_minutes': 50,
                            'video_url': 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
                            'is_preview': True
                        },
                        {
                            'title': 'Types of Machine Learning',
                            'description': 'Supervised, unsupervised, and reinforcement learning',
                            'lesson_type': 'video',
                            'order': 2,
                            'duration_minutes': 45,
                            'video_url': 'https://www.youtube.com/watch?v=Ar5-A7iE5T8'
                        }
                    ]
                }
            ]
        }
    }
    
    # Create modules and lessons for each course
    for course in courses:
        course_slug = course.slug
        if course_slug in content_data:
            print(f"\nCreating content for: {course.title}")
            
            for module_data in content_data[course_slug]['modules']:
                # Create module
                module = CourseModule.objects.create(
                    course=course,
                    title=module_data['title'],
                    description=module_data['description'],
                    order=module_data['order'],
                    duration_weeks=module_data['duration_weeks']
                )
                print(f"  Created module: {module.title}")
                
                # Create lessons for this module
                for lesson_data in module_data['lessons']:
                    lesson = Lesson.objects.create(
                        module=module,
                        title=lesson_data['title'],
                        description=lesson_data['description'],
                        lesson_type=lesson_data['lesson_type'],
                        order=lesson_data['order'],
                        duration_minutes=lesson_data['duration_minutes'],
                        video_url=lesson_data.get('video_url', ''),
                        content=lesson_data.get('content', ''),
                        is_preview=lesson_data.get('is_preview', False)
                    )
                    print(f"    Created lesson: {lesson.title}")

def create_enrollments():
    """Create sample enrollments for students"""
    
    # Get students
    students = User.objects.filter(role='student')
    courses = Course.objects.filter(is_published=True)
    
    # Create enrollments
    enrollment_count = 0
    for student in students:
        # Enroll in 2-3 random courses
        import random
        selected_courses = random.sample(list(courses), min(3, len(courses)))
        
        for course in selected_courses:
            enrollment, created = Enrollment.objects.get_or_create(
                student=student,
                course=course,
                defaults={
                    'status': 'active',
                    'enrollment_date': timezone.now(),
                    'progress_percentage': random.randint(10, 90)
                }
            )
            if created:
                enrollment_count += 1
                print(f"Enrolled {student.full_name} in {course.title}")
    
    print(f"\nCreated {enrollment_count} enrollments")

def main():
    print("Starting database population...")
    
    # Create courses
    courses = create_courses()
    
    # Create course content
    create_course_content(courses)
    
    # Create enrollments
    create_enrollments()
    
    print("\nDatabase population completed!")
    print(f"Created {len(courses)} courses")
    print(f"Total modules: {CourseModule.objects.count()}")
    print(f"Total lessons: {Lesson.objects.count()}")
    print(f"Total enrollments: {Enrollment.objects.count()}")

if __name__ == "__main__":
    main()

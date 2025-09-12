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

def update_existing_courses():
    """Update existing courses with proper data"""
    
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
    
    # Course updates
    course_updates = {
        'data-analysis-python': {
            'title': 'Data Analysis with Python',
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
        'machine-learning-basics': {
            'title': 'Machine Learning Fundamentals',
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
        'full-stack-development-with-react-django': {
            'title': 'Full Stack Development with React & Django',
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
        'programming-for-kids-python-adventures': {
            'title': 'Programming for Kids - Python Adventures',
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
        'ai-for-school-kids-introduction-to-machine-learning': {
            'title': 'AI for School Kids - Introduction to Machine Learning',
            'description': 'Introduction to AI and machine learning concepts designed specifically for young learners.',
            'short_description': 'Fun introduction to AI and machine learning for kids.',
            'price': Decimal('4999.00'),
            'duration_weeks': 8,
            'category': 'ai_kids',
            'level': 'beginner',
            'tags': 'AI, Machine Learning, Kids, Education, Technology',
            'tutor': krishna_murthy,
            'training_partner': iit_delhi,
            'learning_outcomes': '• Understand AI concepts\n• Learn about machine learning\n• Build simple AI projects\n• Explore AI applications\n• Develop computational thinking',
            'prerequisites': 'Basic computer skills, curiosity about technology',
            'thumbnail': 'courses/thumbnails/ai-kids.jpg',
            'banner_image': 'courses/banners/ai-kids.jpg',
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'approval_status': 'approved',
            'is_published': True,
            'is_featured': True,
            'is_draft': False,
            'rating': Decimal('4.5'),
            'total_reviews': 89,
            'enrollment_count': 567,
            'view_count': 3456
        },
        'devops-and-cloud-computing': {
            'title': 'DevOps and Cloud Computing',
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
        },
        'advanced-computer-science-research-methods': {
            'title': 'Advanced Computer Science Research Methods',
            'description': 'Advanced research methodologies and techniques for computer science students and professionals.',
            'short_description': 'Master research methods in computer science.',
            'price': Decimal('25999.00'),
            'duration_weeks': 16,
            'category': 'data_science',
            'level': 'advanced',
            'tags': 'Research, Computer Science, Methodology, Academic, Advanced',
            'tutor': prof_meera,
            'training_partner': iisc,
            'learning_outcomes': '• Master research methodologies\n• Design experiments\n• Analyze data scientifically\n• Write research papers\n• Present findings effectively',
            'prerequisites': 'Advanced programming, statistics, research interest',
            'thumbnail': 'courses/thumbnails/research-methods.jpg',
            'banner_image': 'courses/banners/research-methods.jpg',
            'is_approved_by_training_partner': True,
            'is_approved_by_super_admin': True,
            'approval_status': 'approved',
            'is_published': True,
            'is_featured': False,
            'is_draft': False,
            'rating': Decimal('4.9'),
            'total_reviews': 67,
            'enrollment_count': 234,
            'view_count': 1234
        }
    }
    
    # Update existing courses
    updated_count = 0
    for course in Course.objects.all():
        if course.slug in course_updates:
            update_data = course_updates[course.slug]
            
            # Update fields
            for field, value in update_data.items():
                setattr(course, field, value)
            
            course.save()
            updated_count += 1
            print(f"Updated course: {course.title}")
    
    print(f"\nUpdated {updated_count} courses")

def create_simple_modules_lessons():
    """Create basic modules and lessons for courses"""
    
    # Get some courses
    courses = Course.objects.filter(is_published=True)[:3]  # Limit to first 3 courses
    
    for course in courses:
        print(f"\nCreating content for: {course.title}")
        
        # Create 2-3 modules per course
        for i in range(1, 4):
            module = CourseModule.objects.create(
                course=course,
                title=f"Module {i}: {course.title.split()[0]} Fundamentals",
                description=f"Learn the fundamentals of {course.title.split()[0].lower()} in this comprehensive module.",
                order=i,
                duration_weeks=2
            )
            print(f"  Created module: {module.title}")
            
            # Create 2-3 lessons per module
            for j in range(1, 4):
                lesson = Lesson.objects.create(
                    module=module,
                    title=f"Lesson {j}: Introduction to {course.title.split()[0]}",
                    description=f"Learn the basics of {course.title.split()[0].lower()} in this lesson.",
                    lesson_type='video',
                    order=j,
                    duration_minutes=30 + (j * 10),
                    video_url=f'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t={j*60}s',
                    is_preview=(j == 1)  # First lesson is preview
                )
                print(f"    Created lesson: {lesson.title}")

def main():
    print("Starting course updates...")
    
    # Update existing courses
    update_existing_courses()
    
    # Create basic content
    create_simple_modules_lessons()
    
    print("\nCourse updates completed!")
    print(f"Total courses: {Course.objects.count()}")
    print(f"Published courses: {Course.objects.filter(is_published=True).count()}")
    print(f"Total modules: {CourseModule.objects.count()}")
    print(f"Total lessons: {Lesson.objects.count()}")

if __name__ == "__main__":
    main()

"""
Django management command to create the Ultimate Python Course with all components.
"""
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
from courses.models import (
    Course, CourseModule, Lesson, LessonMaterial, CourseResource,
    Enrollment, CourseProgress, ModuleProgress, LessonProgress
)
from users.models import TrainingPartner, User, TutorProfile
import uuid
import os
from PIL import Image, ImageDraw, ImageFont
import io

User = get_user_model()


class Command(BaseCommand):
    help = 'Create the Ultimate Python Course with all components'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset existing course data before creating new course',
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('Resetting existing course data...')
            self.reset_course_data()

        with transaction.atomic():
            # Create training partner
            training_partner = self.create_training_partner()
            
            # Create tutor
            tutor = self.create_tutor(training_partner)
            
            # Create course
            course = self.create_course(training_partner, tutor)
            
            # Create modules
            modules = self.create_modules(course)
            
            # Create lessons for each module
            self.create_lessons(modules)
            
            # Create course resources
            self.create_course_resources(course)
            
            # Generate and set course media
            self.generate_course_media(course)

        self.stdout.write(
            self.style.SUCCESS('Successfully created Ultimate Python Course!')
        )

    def reset_course_data(self):
        """Reset existing course data."""
        Course.objects.filter(slug='ultimate-python-course').delete()
        TrainingPartner.objects.filter(name='Swinfy').delete()
        User.objects.filter(email='rocky.ganji@swinfy.com').delete()

    def create_training_partner(self):
        """Create Swinfy training partner."""
        training_partner, created = TrainingPartner.objects.get_or_create(
            name='Swinfy',
            defaults={
                'type': 'institute',
                'location': 'Bangalore, India',
                'website': 'https://swinfy.com',
                'description': 'Leading technology education institute specializing in programming and data science courses.',
                'is_active': True,
            }
        )
        
        if created:
            self.stdout.write(f'Created training partner: {training_partner.name}')
        else:
            self.stdout.write(f'Using existing training partner: {training_partner.name}')
        
        return training_partner

    def create_tutor(self, training_partner):
        """Create Rocky Ganji tutor."""
        tutor, created = User.objects.get_or_create(
            email='rocky.ganji@swinfy.com',
            defaults={
                'username': 'rocky.ganji@swinfy.com',
                'full_name': 'Rocky Ganji',
                'role': 'tutor',
                'organization': training_partner,
                'is_verified': True,
                'is_approved': True,
                'is_active': True,
            }
        )
        
        if created:
            tutor.set_password('rockyg07')
            tutor.save()
            
            # Create tutor profile
            TutorProfile.objects.create(
                user=tutor,
                bio='Senior Python Developer with 8+ years of experience in web development, data science, and machine learning. Passionate about teaching and helping students master Python programming.',
                title='Senior Python Developer & Data Scientist',
                years_of_experience=8,
                hourly_rate=75.00,
                highest_education='master',
                certifications='AWS Certified Developer, Google Cloud Professional Data Engineer, Python Institute PCAP',
                specializations='Python Programming, Django/Flask, Data Science, Machine Learning, Web Scraping, API Development',
                technologies='Python, Django, Flask, FastAPI, Pandas, NumPy, Scikit-learn, TensorFlow, PostgreSQL, MongoDB, Redis, Docker, AWS',
                languages_spoken='English, Hindi, Telugu',
                linkedin_url='https://linkedin.com/in/rockyganji',
                github_url='https://github.com/rockyganji',
                portfolio_url='https://rockyganji.dev',
                is_available=True,
                availability_notes='Available for live sessions on weekends and evenings'
            )
            
            self.stdout.write(f'Created tutor: {tutor.full_name}')
        else:
            self.stdout.write(f'Using existing tutor: {tutor.full_name}')
        
        return tutor

    def create_course(self, training_partner, tutor):
        """Create the Ultimate Python Course."""
        course, created = Course.objects.get_or_create(
            slug='ultimate-python-course',
            defaults={
                'title': 'Ultimate Python Course: From Beginner to Expert',
                'description': '''Master Python programming from the ground up with this comprehensive course designed for complete beginners to advanced developers. This course covers everything from basic syntax to advanced topics like machine learning, web development, and data science.

What makes this course special:
• Hands-on projects and real-world applications
• Industry best practices and coding standards
• Live coding sessions and Q&A
• Career guidance and job placement assistance
• Lifetime access to course materials and updates

Perfect for:
• Complete beginners who want to learn programming
• Developers switching to Python from other languages
• Professionals looking to upskill in Python
• Students preparing for technical interviews
• Anyone interested in data science or web development''',
                'short_description': 'Master Python programming from beginner to expert with hands-on projects, real-world applications, and industry best practices.',
                'price': 299.99,
                'duration_weeks': 12,
                'category': 'backend_development',
                'level': 'beginner',
                'tags': 'python, programming, web development, data science, machine learning, django, flask, automation, scripting',
                'tutor': tutor,
                'training_partner': training_partner,
                'is_approved_by_training_partner': True,
                'is_approved_by_super_admin': True,
                'approval_status': 'approved',
                'is_published': True,
                'is_featured': True,
                'is_draft': False,
                'learning_outcomes': '''• Master Python fundamentals including variables, data types, control structures, and functions
• Understand object-oriented programming concepts and design patterns
• Build web applications using Django and Flask frameworks
• Work with databases using SQLAlchemy and Django ORM
• Implement data analysis and visualization using Pandas, NumPy, and Matplotlib
• Create machine learning models using Scikit-learn and TensorFlow
• Develop RESTful APIs and handle authentication
• Write clean, maintainable, and testable code
• Use version control with Git and GitHub
• Deploy applications to cloud platforms like AWS and Heroku
• Debug and optimize Python applications
• Follow industry best practices and coding standards''',
                'prerequisites': '''• No prior programming experience required
• Basic computer literacy
• Willingness to practice coding regularly
• Access to a computer with internet connection''',
                'enrollment_count': 0,
                'rating': 0.00,
                'total_reviews': 0,
                'view_count': 0,
            }
        )
        
        if created:
            self.stdout.write(f'Created course: {course.title}')
        else:
            self.stdout.write(f'Using existing course: {course.title}')
        
        return course

    def create_modules(self, course):
        """Create 10 course modules."""
        modules_data = [
            {
                'title': 'Python Fundamentals',
                'description': 'Learn the basics of Python programming including variables, data types, operators, and basic syntax.',
                'order': 1,
            },
            {
                'title': 'Control Structures and Functions',
                'description': 'Master conditional statements, loops, and function creation and usage.',
                'order': 2,
            },
            {
                'title': 'Data Structures and Collections',
                'description': 'Deep dive into lists, tuples, dictionaries, sets, and advanced data manipulation.',
                'order': 3,
            },
            {
                'title': 'Object-Oriented Programming',
                'description': 'Learn classes, objects, inheritance, polymorphism, and design patterns.',
                'order': 4,
            },
            {
                'title': 'File Handling and Error Management',
                'description': 'Work with files, handle exceptions, and implement robust error handling.',
                'order': 5,
            },
            {
                'title': 'Web Development with Django',
                'description': 'Build web applications using Django framework, models, views, and templates.',
                'order': 6,
            },
            {
                'title': 'API Development and Flask',
                'description': 'Create RESTful APIs using Flask and handle authentication and authorization.',
                'order': 7,
            },
            {
                'title': 'Data Science and Analysis',
                'description': 'Analyze data using Pandas, NumPy, and create visualizations with Matplotlib and Seaborn.',
                'order': 8,
            },
            {
                'title': 'Machine Learning Basics',
                'description': 'Introduction to machine learning using Scikit-learn and TensorFlow.',
                'order': 9,
            },
            {
                'title': 'Deployment and Best Practices',
                'description': 'Deploy applications, use Git, write tests, and follow industry best practices.',
                'order': 10,
            },
        ]
        
        modules = []
        for module_data in modules_data:
            module, created = CourseModule.objects.get_or_create(
                course=course,
                order=module_data['order'],
                defaults=module_data
            )
            modules.append(module)
            
            if created:
                self.stdout.write(f'Created module: {module.title}')
        
        return modules

    def create_lessons(self, modules):
        """Create lessons for each module."""
        lessons_data = {
            1: [  # Python Fundamentals
                {'title': 'Introduction to Python', 'type': 'video', 'duration': 45, 'order': 1, 'is_preview': True},
                {'title': 'Variables and Data Types', 'type': 'video', 'duration': 60, 'order': 2},
                {'title': 'Python Operators', 'type': 'video', 'duration': 50, 'order': 3},
                {'title': 'Input and Output', 'type': 'video', 'duration': 40, 'order': 4},
                {'title': 'Python Fundamentals Quiz', 'type': 'quiz', 'duration': 30, 'order': 5},
            ],
            2: [  # Control Structures and Functions
                {'title': 'Conditional Statements', 'type': 'video', 'duration': 55, 'order': 1},
                {'title': 'Loops in Python', 'type': 'video', 'duration': 70, 'order': 2},
                {'title': 'Function Basics', 'type': 'video', 'duration': 60, 'order': 3},
                {'title': 'Advanced Functions', 'type': 'video', 'duration': 65, 'order': 4},
                {'title': 'Control Structures Assignment', 'type': 'assignment', 'duration': 90, 'order': 5},
            ],
            3: [  # Data Structures and Collections
                {'title': 'Lists and List Methods', 'type': 'video', 'duration': 70, 'order': 1},
                {'title': 'Tuples and Sets', 'type': 'video', 'duration': 50, 'order': 2},
                {'title': 'Dictionaries Deep Dive', 'type': 'video', 'duration': 80, 'order': 3},
                {'title': 'List Comprehensions', 'type': 'video', 'duration': 45, 'order': 4},
                {'title': 'Data Structures Project', 'type': 'assignment', 'duration': 120, 'order': 5},
            ],
            4: [  # Object-Oriented Programming
                {'title': 'Classes and Objects', 'type': 'video', 'duration': 75, 'order': 1},
                {'title': 'Inheritance and Polymorphism', 'type': 'video', 'duration': 80, 'order': 2},
                {'title': 'Encapsulation and Abstraction', 'type': 'video', 'duration': 60, 'order': 3},
                {'title': 'Design Patterns', 'type': 'video', 'duration': 90, 'order': 4},
                {'title': 'OOP Project', 'type': 'assignment', 'duration': 150, 'order': 5},
            ],
            5: [  # File Handling and Error Management
                {'title': 'File Operations', 'type': 'video', 'duration': 60, 'order': 1},
                {'title': 'Exception Handling', 'type': 'video', 'duration': 55, 'order': 2},
                {'title': 'Working with CSV and JSON', 'type': 'video', 'duration': 50, 'order': 3},
                {'title': 'File Handling Assignment', 'type': 'assignment', 'duration': 90, 'order': 4},
            ],
            6: [  # Web Development with Django
                {'title': 'Django Introduction', 'type': 'video', 'duration': 60, 'order': 1},
                {'title': 'Django Models and Database', 'type': 'video', 'duration': 80, 'order': 2},
                {'title': 'Django Views and URLs', 'type': 'video', 'duration': 70, 'order': 3},
                {'title': 'Django Templates', 'type': 'video', 'duration': 65, 'order': 4},
                {'title': 'Django Forms and Admin', 'type': 'video', 'duration': 75, 'order': 5},
                {'title': 'Django Project', 'type': 'assignment', 'duration': 180, 'order': 6},
            ],
            7: [  # API Development and Flask
                {'title': 'Flask Introduction', 'type': 'video', 'duration': 50, 'order': 1},
                {'title': 'RESTful API Design', 'type': 'video', 'duration': 70, 'order': 2},
                {'title': 'Authentication and Authorization', 'type': 'video', 'duration': 80, 'order': 3},
                {'title': 'API Testing and Documentation', 'type': 'video', 'duration': 60, 'order': 4},
                {'title': 'Flask API Project', 'type': 'assignment', 'duration': 150, 'order': 5},
            ],
            8: [  # Data Science and Analysis
                {'title': 'NumPy Fundamentals', 'type': 'video', 'duration': 70, 'order': 1},
                {'title': 'Pandas Data Manipulation', 'type': 'video', 'duration': 90, 'order': 2},
                {'title': 'Data Visualization', 'type': 'video', 'duration': 80, 'order': 3},
                {'title': 'Data Analysis Project', 'type': 'assignment', 'duration': 200, 'order': 4},
            ],
            9: [  # Machine Learning Basics
                {'title': 'ML Introduction', 'type': 'video', 'duration': 60, 'order': 1},
                {'title': 'Scikit-learn Basics', 'type': 'video', 'duration': 80, 'order': 2},
                {'title': 'Model Training and Evaluation', 'type': 'video', 'duration': 90, 'order': 3},
                {'title': 'ML Project', 'type': 'assignment', 'duration': 180, 'order': 4},
            ],
            10: [  # Deployment and Best Practices
                {'title': 'Git and Version Control', 'type': 'video', 'duration': 60, 'order': 1},
                {'title': 'Testing in Python', 'type': 'video', 'duration': 70, 'order': 2},
                {'title': 'Deployment Strategies', 'type': 'video', 'duration': 80, 'order': 3},
                {'title': 'Code Quality and Best Practices', 'type': 'video', 'duration': 60, 'order': 4},
                {'title': 'Final Project', 'type': 'assignment', 'duration': 300, 'order': 5},
            ],
        }
        
        for module in modules:
            module_lessons = lessons_data.get(module.order, [])
            for lesson_data in module_lessons:
                lesson, created = Lesson.objects.get_or_create(
                    module=module,
                    order=lesson_data['order'],
                    defaults={
                        'title': lesson_data['title'],
                        'description': f"Learn {lesson_data['title'].lower()} in this comprehensive lesson.",
                        'lesson_type': lesson_data['type'],
                        'duration_minutes': lesson_data['duration'],
                        'content': self.get_lesson_content(lesson_data['title'], lesson_data['type']),
                    }
                )
                
                if created:
                    self.stdout.write(f'Created lesson: {lesson.title}')
                    
                    # Create lesson materials
                    self.create_lesson_materials(lesson)

    def get_lesson_content(self, title, lesson_type):
        """Generate lesson content based on title and type."""
        if lesson_type == 'video':
            return f"# {title}\n\nThis video lesson covers the fundamentals of {title.lower()}. Watch the video carefully and take notes.\n\n## Key Topics Covered:\n- Introduction to the concept\n- Practical examples\n- Common pitfalls to avoid\n- Best practices\n\n## Video Duration: {title.split()[-1] if title.split()[-1].isdigit() else '60'} minutes"
        elif lesson_type == 'quiz':
            return f"# {title}\n\nTest your understanding of the previous lessons with this comprehensive quiz.\n\n## Quiz Format:\n- Multiple choice questions\n- True/False questions\n- Code completion exercises\n- Practical problem solving\n\n## Passing Score: 70%"
        elif lesson_type == 'assignment':
            return f"# {title}\n\nApply what you've learned in a hands-on project.\n\n## Assignment Requirements:\n- Complete the given tasks\n- Follow coding best practices\n- Include proper documentation\n- Test your code thoroughly\n\n## Submission Guidelines:\n- Submit your code via GitHub\n- Include a README file\n- Provide screenshots if required"
        else:
            return f"# {title}\n\nLearn about {title.lower()} in this comprehensive lesson."

    def create_lesson_materials(self, lesson):
        """Create materials for each lesson."""
        materials_data = [
            {
                'title': f'{lesson.title} - Code Examples',
                'description': 'Downloadable code examples and snippets',
                'material_type': 'zip',
                'is_required': True,
            },
            {
                'title': f'{lesson.title} - Reference Guide',
                'description': 'Quick reference guide for the lesson topics',
                'material_type': 'pdf',
                'is_required': False,
            },
        ]
        
        for material_data in materials_data:
            LessonMaterial.objects.get_or_create(
                lesson=lesson,
                title=material_data['title'],
                defaults={
                    'description': material_data['description'],
                    'material_type': material_data['material_type'],
                    'is_required': material_data['is_required'],
                    'file_size': 1024,  # Placeholder size
                }
            )

    def create_course_resources(self, course):
        """Create course resources."""
        resources_data = [
            {
                'title': 'Python Installation Guide',
                'description': 'Step-by-step guide to install Python and required packages',
                'resource_type': 'pdf',
            },
            {
                'title': 'Course Syllabus',
                'description': 'Detailed course syllabus with learning objectives',
                'resource_type': 'syllabus',
            },
            {
                'title': 'Python Documentation',
                'description': 'Official Python documentation for reference',
                'resource_type': 'link',
                'url': 'https://docs.python.org/3/',
            },
            {
                'title': 'GitHub Repository',
                'description': 'Course code repository on GitHub',
                'resource_type': 'link',
                'url': 'https://github.com/swinfy/ultimate-python-course',
            },
            {
                'title': 'Python Cheat Sheet',
                'description': 'Quick reference for Python syntax and methods',
                'resource_type': 'pdf',
            },
        ]
        
        for resource_data in resources_data:
            CourseResource.objects.get_or_create(
                course=course,
                title=resource_data['title'],
                defaults={
                    'description': resource_data['description'],
                    'resource_type': resource_data['resource_type'],
                    'url': resource_data.get('url', ''),
                    'is_public': True,
                }
            )

    def generate_course_media(self, course):
        """Generate course thumbnail and banner images."""
        # Generate thumbnail
        thumbnail = self.create_course_thumbnail()
        if thumbnail:
            course.thumbnail.save('ultimate-python-thumbnail.png', thumbnail, save=True)
        
        # Generate banner
        banner = self.create_course_banner()
        if banner:
            course.banner_image.save('ultimate-python-banner.png', banner, save=True)
        
        self.stdout.write('Generated course media files')

    def create_course_thumbnail(self):
        """Create course thumbnail image."""
        try:
            # Create a 400x300 thumbnail
            img = Image.new('RGB', (400, 300), color='#1e40af')
            draw = ImageDraw.Draw(img)
            
            # Add Python logo (simplified)
            draw.ellipse([50, 50, 150, 150], fill='#fbbf24', outline='#f59e0b', width=3)
            draw.text((100, 100), 'Py', fill='#1e40af', anchor='mm')
            
            # Add course title
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
            except:
                font = ImageFont.load_default()
            
            draw.text((200, 100), 'Ultimate Python', fill='white', font=font)
            draw.text((200, 130), 'Course', fill='white', font=font)
            
            # Save to BytesIO
            img_io = io.BytesIO()
            img.save(img_io, format='PNG')
            img_io.seek(0)
            
            return ContentFile(img_io.getvalue(), name='thumbnail.png')
        except Exception as e:
            self.stdout.write(f'Error creating thumbnail: {e}')
            return None

    def create_course_banner(self):
        """Create course banner image."""
        try:
            # Create a 1200x400 banner
            img = Image.new('RGB', (1200, 400), color='#1e40af')
            draw = ImageDraw.Draw(img)
            
            # Add gradient effect
            for i in range(400):
                color_value = int(30 + (i / 400) * 50)
                draw.line([(0, i), (1200, i)], fill=(color_value, 64, 175))
            
            # Add Python logo
            draw.ellipse([100, 100, 200, 200], fill='#fbbf24', outline='#f59e0b', width=5)
            draw.text((150, 150), 'Py', fill='#1e40af', anchor='mm')
            
            # Add course title
            try:
                title_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 48)
                subtitle_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
            except:
                title_font = ImageFont.load_default()
                subtitle_font = ImageFont.load_default()
            
            draw.text((300, 150), 'Ultimate Python Course', fill='white', font=title_font)
            draw.text((300, 200), 'From Beginner to Expert', fill='#fbbf24', font=subtitle_font)
            draw.text((300, 230), 'Master Python Programming with Hands-on Projects', fill='#e5e7eb', font=subtitle_font)
            
            # Save to BytesIO
            img_io = io.BytesIO()
            img.save(img_io, format='PNG')
            img_io.seek(0)
            
            return ContentFile(img_io.getvalue(), name='banner.png')
        except Exception as e:
            self.stdout.write(f'Error creating banner: {e}')
            return None

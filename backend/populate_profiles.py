#!/usr/bin/env python
import os
import sys
import django
from decimal import Decimal
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from users.models import *
from courses.models import *

def populate_student_profiles():
    """Populate student profiles with realistic data and profile pictures"""
    
    print("=== POPULATING STUDENT PROFILES ===")
    
    # Get all students
    students = User.objects.filter(role='student')
    
    # Student profile data mapping
    student_data = {
        'anusha.reddy@hotmail.com': {
            'bio': 'Passionate about technology and eager to learn programming. Currently pursuing Computer Science and excited to explore the world of coding!',
            'profile_picture': 'profiles/students/student_01_alice_johnson.jpg',
            'date_of_birth': '2000-03-15',
            'phone_number': '+91-9876543210',
            'education_level': 'bachelor',
            'field_of_study': 'Computer Science',
            'current_institution': 'Delhi University',
            'learning_goals': 'Master Python programming, learn web development, and build real-world projects'
        },
        'meera.kumari@yahoo.com': {
            'bio': 'Creative mind with a love for design and technology. Always curious about how things work and passionate about creating beautiful digital experiences.',
            'profile_picture': 'profiles/students/student_02_bob_smith.jpg',
            'date_of_birth': '1999-07-22',
            'phone_number': '+91-9876543211',
            'education_level': 'master',
            'field_of_study': 'Information Technology',
            'current_institution': 'IIT Bombay',
            'learning_goals': 'Learn UI/UX design, master frontend development, and create innovative digital solutions'
        }
    }
    
    for student in students:
        print(f"Processing student: {student.full_name}")
        
        # Get or create student profile
        profile, created = StudentProfile.objects.get_or_create(
            user=student,
            defaults={
                'bio': student_data.get(student.email, {}).get('bio', 'Student passionate about learning new technologies.'),
                'profile_picture': student_data.get(student.email, {}).get('profile_picture', 'profiles/students/student_03_carol_davis.jpg'),
                'date_of_birth': student_data.get(student.email, {}).get('date_of_birth', '2000-01-01'),
                'phone_number': student_data.get(student.email, {}).get('phone_number', '+91-9876543212'),
                'education_level': student_data.get(student.email, {}).get('education_level', 'bachelor'),
                'field_of_study': student_data.get(student.email, {}).get('field_of_study', 'Computer Science'),
                'current_institution': student_data.get(student.email, {}).get('current_institution', 'University'),
                'learning_goals': student_data.get(student.email, {}).get('learning_goals', 'Learn new technologies and advance career')
            }
        )
        
        if created:
            print(f"  ✅ Created profile for {student.full_name}")
        else:
            print(f"  ℹ️  Profile already exists for {student.full_name}")

def populate_tutor_profiles():
    """Populate tutor profiles with realistic data and profile pictures"""
    
    print("\n=== POPULATING TUTOR PROFILES ===")
    
    # Get all tutors
    tutors = User.objects.filter(role='tutor')
    
    # Tutor profile data mapping
    tutor_data = {
        'dr.arjun@iisc.ac.in': {
            'bio': 'Senior Research Scientist at IISc with 15+ years of experience in Data Science and Machine Learning. Published 50+ research papers and mentored 100+ students.',
            'profile_picture': 'profiles/tutors/tutor_01_dr_sarah_williams.jpg',
            'date_of_birth': '1975-05-10',
            'phone_number': '+91-9876543220',
            'title': 'Senior Research Scientist',
            'years_of_experience': 15,
            'hourly_rate': Decimal('5000.00'),
            'highest_education': 'phd',
            'certifications': 'PhD in Computer Science, AWS Certified Machine Learning Specialist, Google Cloud Professional Data Engineer',
            'specializations': 'Machine Learning, Deep Learning, Data Science, Python, R, Statistics',
            'technologies': 'Python, R, TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy, Matplotlib, SQL, AWS, Google Cloud',
            'languages_spoken': 'English, Hindi, Kannada',
            'linkedin_url': 'https://linkedin.com/in/dr-arjun-mishra',
            'github_url': 'https://github.com/drarjunmishra',
            'portfolio_url': 'https://drarjunmishra.com',
            'is_available': True,
            'availability_notes': 'Available for consultation and mentoring. Prefers evening sessions.'
        },
        'prof.meera@iisc.ac.in': {
            'bio': 'Professor of Computer Science at IISc with expertise in Artificial Intelligence and Computer Vision. Led multiple research projects and received several awards for teaching excellence.',
            'profile_picture': 'profiles/tutors/tutor_02_prof_michael_johnson.jpg',
            'date_of_birth': '1970-08-15',
            'phone_number': '+91-98765-43221',
            'title': 'Professor of Computer Science',
            'years_of_experience': 20,
            'hourly_rate': Decimal('6000.00'),
            'highest_education': 'phd',
            'certifications': 'PhD in Computer Science, IEEE Fellow, ACM Distinguished Scientist',
            'specializations': 'Artificial Intelligence, Computer Vision, Machine Learning, Neural Networks',
            'technologies': 'Python, C++, OpenCV, TensorFlow, PyTorch, MATLAB, CUDA, OpenGL',
            'languages_spoken': 'English, Hindi, Tamil',
            'linkedin_url': 'https://linkedin.com/in/prof-meera-sundaram',
            'github_url': 'https://github.com/profmeera',
            'portfolio_url': 'https://profmeera.iisc.ac.in',
            'is_available': True,
            'availability_notes': 'Available for advanced AI courses and research mentoring.'
        },
        'amit.kumar@tcs.com': {
            'bio': 'Senior Software Architect at TCS with 12+ years of experience in Full Stack Development. Expert in modern web technologies and cloud platforms.',
            'profile_picture': 'profiles/tutors/tutor_03_dr_lisa_chen.jpg',
            'date_of_birth': '1985-12-03',
            'phone_number': '+91-98765-43222',
            'title': 'Senior Software Architect',
            'years_of_experience': 12,
            'hourly_rate': Decimal('4000.00'),
            'highest_education': 'master',
            'certifications': 'MSc Computer Science, AWS Solutions Architect, Microsoft Azure Developer',
            'specializations': 'Full Stack Development, Cloud Computing, Microservices, DevOps',
            'technologies': 'React, Node.js, Python, Django, JavaScript, TypeScript, AWS, Docker, Kubernetes',
            'languages_spoken': 'English, Hindi, Bengali',
            'linkedin_url': 'https://linkedin.com/in/amit-kumar-tcs',
            'github_url': 'https://github.com/amitkumar-tcs',
            'portfolio_url': 'https://amitkumar.dev',
            'is_available': True,
            'availability_notes': 'Available for full-stack development courses and project mentoring.'
        },
        'priya.patel@tcs.com': {
            'bio': 'Lead Frontend Developer at TCS with 10+ years of experience in modern web development. Passionate about creating beautiful and functional user interfaces.',
            'profile_picture': 'profiles/tutors/tutor_04_prof_robert_davis.jpg',
            'date_of_birth': '1988-04-20',
            'phone_number': '+91-98765-43223',
            'title': 'Lead Frontend Developer',
            'years_of_experience': 10,
            'hourly_rate': Decimal('3500.00'),
            'highest_education': 'bachelor',
            'certifications': 'BSc Computer Science, Google UX Design Certificate, Adobe Certified Expert',
            'specializations': 'Frontend Development, UI/UX Design, JavaScript, React, Vue.js',
            'technologies': 'JavaScript, TypeScript, React, Vue.js, HTML5, CSS3, Sass, Webpack, Figma',
            'languages_spoken': 'English, Hindi, Gujarati',
            'linkedin_url': 'https://linkedin.com/in/priya-patel-frontend',
            'github_url': 'https://github.com/priyapatel',
            'portfolio_url': 'https://priyapatel.design',
            'is_available': True,
            'availability_notes': 'Available for frontend development and design courses.'
        },
        'arjun.sharma@gmail.com': {
            'bio': 'Software Engineer at Infosys with 8+ years of experience in Python development and data analysis. Passionate about teaching programming to beginners.',
            'profile_picture': 'profiles/tutors/tutor_05_dr_maria_garcia.jpg',
            'date_of_birth': '1990-09-12',
            'phone_number': '+91-98765-43224',
            'title': 'Senior Software Engineer',
            'years_of_experience': 8,
            'hourly_rate': Decimal('3000.00'),
            'highest_education': 'bachelor',
            'certifications': 'BSc Computer Science, Python Institute PCAP, Data Science Certificate',
            'specializations': 'Python Programming, Data Analysis, Web Scraping, Automation',
            'technologies': 'Python, Django, Flask, Pandas, NumPy, Matplotlib, SQLite, PostgreSQL',
            'languages_spoken': 'English, Hindi, Punjabi',
            'linkedin_url': 'https://linkedin.com/in/arjun-sharma-python',
            'github_url': 'https://github.com/arjunsharma',
            'portfolio_url': 'https://arjunsharma.pythonanywhere.com',
            'is_available': True,
            'availability_notes': 'Available for Python programming courses, especially for beginners.'
        },
        'krishna.murthy@outlook.com': {
            'bio': 'UI/UX Designer and Frontend Developer with 7+ years of experience. Expert in creating intuitive user experiences and modern web interfaces.',
            'profile_picture': 'profiles/tutors/tutor_06_prof_james_wilson.jpg',
            'date_of_birth': '1992-11-25',
            'phone_number': '+91-98765-43225',
            'title': 'Senior UI/UX Designer',
            'years_of_experience': 7,
            'hourly_rate': Decimal('3200.00'),
            'highest_education': 'bachelor',
            'certifications': 'BSc Computer Science, Google UX Design Certificate, Adobe Creative Suite Expert',
            'specializations': 'UI/UX Design, Frontend Development, User Research, Prototyping',
            'technologies': 'Figma, Adobe XD, Sketch, HTML5, CSS3, JavaScript, React, Vue.js',
            'languages_spoken': 'English, Hindi, Telugu',
            'linkedin_url': 'https://linkedin.com/in/krishna-murthy-ux',
            'github_url': 'https://github.com/krishnamurthy',
            'portfolio_url': 'https://krishnamurthy.design',
            'is_available': True,
            'availability_notes': 'Available for UI/UX design and frontend development courses.'
        }
    }
    
    for tutor in tutors:
        print(f"Processing tutor: {tutor.full_name}")
        
        # Get or create tutor profile
        profile, created = TutorProfile.objects.get_or_create(
            user=tutor,
            defaults={
                'bio': tutor_data.get(tutor.email, {}).get('bio', 'Experienced tutor passionate about teaching and mentoring students.'),
                'profile_picture': tutor_data.get(tutor.email, {}).get('profile_picture', 'profiles/tutors/tutor_07_dr_jennifer_brown.jpg'),
                'date_of_birth': tutor_data.get(tutor.email, {}).get('date_of_birth', '1980-01-01'),
                'phone_number': tutor_data.get(tutor.email, {}).get('phone_number', '+91-98765-43226'),
                'title': tutor_data.get(tutor.email, {}).get('title', 'Software Engineer'),
                'years_of_experience': tutor_data.get(tutor.email, {}).get('years_of_experience', 5),
                'hourly_rate': tutor_data.get(tutor.email, {}).get('hourly_rate', Decimal('2500.00')),
                'highest_education': tutor_data.get(tutor.email, {}).get('highest_education', 'bachelor'),
                'certifications': tutor_data.get(tutor.email, {}).get('certifications', 'Bachelor in Computer Science'),
                'specializations': tutor_data.get(tutor.email, {}).get('specializations', 'Programming, Software Development'),
                'technologies': tutor_data.get(tutor.email, {}).get('technologies', 'Python, JavaScript, HTML, CSS'),
                'languages_spoken': tutor_data.get(tutor.email, {}).get('languages_spoken', 'English, Hindi'),
                'linkedin_url': tutor_data.get(tutor.email, {}).get('linkedin_url', ''),
                'github_url': tutor_data.get(tutor.email, {}).get('github_url', ''),
                'portfolio_url': tutor_data.get(tutor.email, {}).get('portfolio_url', ''),
                'is_available': tutor_data.get(tutor.email, {}).get('is_available', True),
                'availability_notes': tutor_data.get(tutor.email, {}).get('availability_notes', 'Available for tutoring and mentoring.')
            }
        )
        
        if created:
            print(f"  ✅ Created profile for {tutor.full_name}")
        else:
            print(f"  ℹ️  Profile already exists for {tutor.full_name}")

def populate_admin_profiles():
    """Populate admin profiles with realistic data and profile pictures"""
    
    print("\n=== POPULATING ADMIN PROFILES ===")
    
    # Get all admins
    admins = User.objects.filter(role='admin')
    
    # Admin profile data mapping
    admin_data = {
        'suresh.babu@gmail.com': {
            'bio': 'Training Manager at TCS with 15+ years of experience in corporate training and education management. Passionate about developing talent and creating learning opportunities.',
            'profile_picture': 'profiles/tutors/tutor_08_prof_david_miller.jpg',
            'phone_number': '+91-98765-43230',
            'job_title': 'Training Manager',
            'department': 'Human Resources',
            'office_location': 'TCS Mumbai Office',
            'office_phone': '+91-22-6778-9000',
            'emergency_contact': '+91-98765-43231',
            'linkedin_url': 'https://linkedin.com/in/suresh-babu-tcs',
            'professional_email': 'suresh.babu@tcs.com'
        },
        'sita.rama.lakshmi@outlook.com': {
            'bio': 'Learning & Development Head at Infosys with 12+ years of experience in educational technology and corporate training. Expert in curriculum development and learning analytics.',
            'profile_picture': 'profiles/tutors/tutor_09_dr_amanda_taylor.jpg',
            'phone_number': '+91-98765-43232',
            'job_title': 'Learning & Development Head',
            'department': 'Learning & Development',
            'office_location': 'Infosys Bangalore Campus',
            'office_phone': '+91-80-2852-0261',
            'emergency_contact': '+91-98765-43233',
            'linkedin_url': 'https://linkedin.com/in/sita-rama-lakshmi',
            'professional_email': 'sita.rama.lakshmi@infosys.com'
        },
        'ravi.teja.reddy@hotmail.com': {
            'bio': 'Academic Coordinator at IIT Delhi with 10+ years of experience in academic administration and student affairs. Dedicated to fostering academic excellence and student success.',
            'profile_picture': 'profiles/tutors/tutor_10_prof_christopher_lee.jpg',
            'phone_number': '+91-98765-43234',
            'job_title': 'Academic Coordinator',
            'department': 'Academic Affairs',
            'office_location': 'IIT Delhi Campus',
            'office_phone': '+91-11-2659-7135',
            'emergency_contact': '+91-98765-43235',
            'linkedin_url': 'https://linkedin.com/in/ravi-teja-reddy-iit',
            'professional_email': 'ravi.teja.reddy@iitd.ac.in'
        },
        'lakshmi.priya.devi@yahoo.com': {
            'bio': 'Research Coordinator at IISc with 8+ years of experience in research administration and academic coordination. Passionate about supporting research excellence and innovation.',
            'profile_picture': 'profiles/tutors/tutor_11_dr_rachel_green.jpg',
            'phone_number': '+91-98765-43236',
            'job_title': 'Research Coordinator',
            'department': 'Research & Development',
            'office_location': 'IISc Bangalore Campus',
            'office_phone': '+91-80-2293-2000',
            'emergency_contact': '+91-98765-43237',
            'linkedin_url': 'https://linkedin.com/in/lakshmi-priya-devi',
            'professional_email': 'lakshmi.priya.devi@iisc.ac.in'
        },
        'venkata.sai.krishna@gmail.com': {
            'bio': 'Educational Technology Manager at BYJU\'S with 6+ years of experience in edtech and digital learning. Expert in learning management systems and educational content development.',
            'profile_picture': 'profiles/tutors/tutor_12_prof_kevin_white.jpg',
            'phone_number': '+91-98765-43238',
            'job_title': 'Educational Technology Manager',
            'department': 'Product Development',
            'office_location': 'BYJU\'S Bangalore Office',
            'office_phone': '+91-80-4040-4040',
            'emergency_contact': '+91-98765-43239',
            'linkedin_url': 'https://linkedin.com/in/venkata-sai-krishna',
            'professional_email': 'venkata.sai.krishna@byjus.com'
        }
    }
    
    for admin in admins:
        print(f"Processing admin: {admin.full_name}")
        
        # Get or create admin profile
        profile, created = AdminProfile.objects.get_or_create(
            user=admin,
            defaults={
                'bio': admin_data.get(admin.email, {}).get('bio', 'Administrator with experience in educational management and student affairs.'),
                'profile_picture': admin_data.get(admin.email, {}).get('profile_picture', 'profiles/tutors/tutor_01_dr_sarah_williams.jpg'),
                'phone_number': admin_data.get(admin.email, {}).get('phone_number', '+91-98765-43240'),
                'job_title': admin_data.get(admin.email, {}).get('job_title', 'Administrator'),
                'department': admin_data.get(admin.email, {}).get('department', 'Administration'),
                'office_location': admin_data.get(admin.email, {}).get('office_location', 'Main Office'),
                'office_phone': admin_data.get(admin.email, {}).get('office_phone', '+91-98765-43241'),
                'emergency_contact': admin_data.get(admin.email, {}).get('emergency_contact', '+91-98765-43242'),
                'linkedin_url': admin_data.get(admin.email, {}).get('linkedin_url', ''),
                'professional_email': admin_data.get(admin.email, {}).get('professional_email', admin.email)
            }
        )
        
        if created:
            print(f"  ✅ Created profile for {admin.full_name}")
        else:
            print(f"  ℹ️  Profile already exists for {admin.full_name}")

def main():
    print("Starting profile population...")
    
    # Populate all profile types
    populate_student_profiles()
    populate_tutor_profiles()
    populate_admin_profiles()
    
    print("\n=== PROFILE POPULATION SUMMARY ===")
    print(f"Student profiles: {StudentProfile.objects.count()}")
    print(f"Tutor profiles: {TutorProfile.objects.count()}")
    print(f"Admin profiles: {AdminProfile.objects.count()}")
    print(f"Total profiles: {StudentProfile.objects.count() + TutorProfile.objects.count() + AdminProfile.objects.count()}")
    
    print("\n✅ Profile population completed successfully!")

if __name__ == "__main__":
    main()

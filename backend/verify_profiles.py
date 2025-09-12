#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from users.models import *
from courses.models import *

def verify_profiles():
    print("=== PROFILE VERIFICATION ===\n")
    
    # Student Profiles
    print("=== STUDENT PROFILES ===")
    for profile in StudentProfile.objects.all():
        print(f"👤 {profile.user.full_name} ({profile.user.email})")
        print(f"   Bio: {profile.bio[:100]}...")
        print(f"   Profile Picture: {profile.profile_picture}")
        print(f"   Education: {profile.get_education_level_display()} in {profile.field_of_study}")
        print(f"   Institution: {profile.current_institution}")
        print(f"   Phone: {profile.phone_number}")
        print(f"   Learning Goals: {profile.learning_goals[:100]}...")
        print()
    
    # Tutor Profiles
    print("=== TUTOR PROFILES ===")
    for profile in TutorProfile.objects.all():
        print(f"👨‍🏫 {profile.user.full_name} ({profile.user.email})")
        print(f"   Title: {profile.title}")
        print(f"   Experience: {profile.years_of_experience} years")
        print(f"   Hourly Rate: ₹{profile.hourly_rate}")
        print(f"   Education: {profile.get_highest_education_display()}")
        print(f"   Profile Picture: {profile.profile_picture}")
        print(f"   Specializations: {profile.specializations}")
        print(f"   Technologies: {profile.technologies}")
        print(f"   Languages: {profile.languages_spoken}")
        print(f"   LinkedIn: {profile.linkedin_url}")
        print(f"   GitHub: {profile.github_url}")
        print(f"   Portfolio: {profile.portfolio_url}")
        print(f"   Available: {'Yes' if profile.is_available else 'No'}")
        print()
    
    # Admin Profiles
    print("=== ADMIN PROFILES ===")
    for profile in AdminProfile.objects.all():
        print(f"👨‍💼 {profile.user.full_name} ({profile.user.email})")
        print(f"   Job Title: {profile.job_title}")
        print(f"   Department: {profile.department}")
        print(f"   Profile Picture: {profile.profile_picture}")
        print(f"   Office Location: {profile.office_location}")
        print(f"   Office Phone: {profile.office_phone}")
        print(f"   LinkedIn: {profile.linkedin_url}")
        print(f"   Professional Email: {profile.professional_email}")
        print()
    
    # Summary
    print("=== SUMMARY ===")
    print(f"✅ Student Profiles: {StudentProfile.objects.count()}")
    print(f"✅ Tutor Profiles: {TutorProfile.objects.count()}")
    print(f"✅ Admin Profiles: {AdminProfile.objects.count()}")
    print(f"✅ Total Profiles: {StudentProfile.objects.count() + TutorProfile.objects.count() + AdminProfile.objects.count()}")
    
    # Check profile pictures
    print("\n=== PROFILE PICTURE VERIFICATION ===")
    import os
    
    student_pics = 0
    tutor_pics = 0
    admin_pics = 0
    
    for profile in StudentProfile.objects.all():
        if profile.profile_picture:
            student_pics += 1
    
    for profile in TutorProfile.objects.all():
        if profile.profile_picture:
            tutor_pics += 1
    
    for profile in AdminProfile.objects.all():
        if profile.profile_picture:
            admin_pics += 1
    
    print(f"📸 Students with profile pictures: {student_pics}/{StudentProfile.objects.count()}")
    print(f"📸 Tutors with profile pictures: {tutor_pics}/{TutorProfile.objects.count()}")
    print(f"📸 Admins with profile pictures: {admin_pics}/{AdminProfile.objects.count()}")
    
    # Check media files exist
    media_dir = "/Users/Apple/Desktop/swinfy-projects/swinfy-lms/backend/media"
    student_media = len([f for f in os.listdir(f"{media_dir}/profiles/students") if f.endswith('.jpg')])
    tutor_media = len([f for f in os.listdir(f"{media_dir}/profiles/tutors") if f.endswith('.jpg')])
    
    print(f"\n📁 Available media files:")
    print(f"   Student profile images: {student_media}")
    print(f"   Tutor profile images: {tutor_media}")

if __name__ == "__main__":
    verify_profiles()

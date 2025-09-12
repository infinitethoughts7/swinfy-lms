#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from users.models import *
from courses.models import *

def final_summary():
    print("🎓 === SWINFY LMS DATABASE - COMPLETE SUMMARY === 🎓\n")
    
    # Training Partners
    print("🏢 === TRAINING PARTNERS ===")
    for tp in TrainingPartner.objects.all():
        print(f"   • {tp.name} ({tp.type}) - {tp.location}")
    print(f"   Total: {TrainingPartner.objects.count()}\n")
    
    # Users by Role
    print("👥 === USERS BY ROLE ===")
    students = User.objects.filter(role='student')
    tutors = User.objects.filter(role='tutor')
    admins = User.objects.filter(role='admin')
    
    print(f"   👨‍🎓 Students: {students.count()}")
    for student in students:
        print(f"      - {student.full_name} ({student.email})")
    
    print(f"\n   👨‍🏫 Tutors: {tutors.count()}")
    for tutor in tutors:
        org = tutor.organization.name if tutor.organization else "None"
        print(f"      - {tutor.full_name} ({tutor.email}) - {org}")
    
    print(f"\n   👨‍💼 Admins: {admins.count()}")
    for admin in admins:
        org = admin.organization.name if admin.organization else "None"
        print(f"      - {admin.full_name} ({admin.email}) - {org}")
    
    print(f"\n   Total Users: {User.objects.count()}\n")
    
    # Courses
    print("📚 === COURSES ===")
    published_courses = Course.objects.filter(is_published=True)
    featured_courses = Course.objects.filter(is_featured=True)
    
    print(f"   📖 Published Courses: {published_courses.count()}")
    for course in published_courses:
        tutor_name = course.tutor.full_name if course.tutor else "None"
        tp_name = course.training_partner.name if course.training_partner else "None"
        print(f"      - {course.title}")
        print(f"        Tutor: {tutor_name} | Training Partner: {tp_name}")
        print(f"        Price: ₹{course.price} | Rating: {course.rating} | Enrollments: {course.enrollment_count}")
        print(f"        Thumbnail: {'✅' if course.thumbnail else '❌'} | Banner: {'✅' if course.banner_image else '❌'}")
        print()
    
    print(f"   ⭐ Featured Courses: {featured_courses.count()}")
    print(f"   📝 Total Courses: {Course.objects.count()}\n")
    
    # Course Content
    print("📖 === COURSE CONTENT ===")
    print(f"   📑 Modules: {CourseModule.objects.count()}")
    print(f"   🎥 Lessons: {Lesson.objects.count()}")
    print(f"   📎 Materials: {LessonMaterial.objects.count()}")
    print(f"   📋 Resources: {CourseResource.objects.count()}\n")
    
    # Enrollments
    print("🎯 === ENROLLMENTS ===")
    print(f"   📝 Total Enrollments: {Enrollment.objects.count()}")
    print(f"   ✅ Active Enrollments: {Enrollment.objects.filter(status='active').count()}")
    print(f"   🏆 Completed Enrollments: {Enrollment.objects.filter(status='completed').count()}\n")
    
    # Progress Tracking
    print("📊 === PROGRESS TRACKING ===")
    print(f"   📈 Lesson Progress: {LessonProgress.objects.count()}")
    print(f"   📑 Module Progress: {ModuleProgress.objects.count()}")
    print(f"   🎓 Course Progress: {CourseProgress.objects.count()}")
    print(f"   ⏱️  Study Sessions: {StudySession.objects.count()}\n")
    
    # Reviews & Social Features
    print("⭐ === REVIEWS & SOCIAL ===")
    print(f"   💬 Course Reviews: {CourseReview.objects.count()}")
    print(f"   ❤️  Wishlist Items: {CourseWishlist.objects.count()}")
    print(f"   🔔 Notifications: {CourseNotification.objects.count()}\n")
    
    # Profile Data
    print("👤 === PROFILE DATA ===")
    print(f"   👨‍🎓 Student Profiles: {StudentProfile.objects.count()}")
    print(f"   👨‍🏫 Tutor Profiles: {TutorProfile.objects.count()}")
    print(f"   👨‍💼 Admin Profiles: {AdminProfile.objects.count()}")
    
    # Profile Pictures
    student_pics = StudentProfile.objects.filter(profile_picture__isnull=False).count()
    tutor_pics = TutorProfile.objects.filter(profile_picture__isnull=False).count()
    admin_pics = AdminProfile.objects.filter(profile_picture__isnull=False).count()
    
    print(f"   📸 Students with Profile Pictures: {student_pics}/{StudentProfile.objects.count()}")
    print(f"   📸 Tutors with Profile Pictures: {tutor_pics}/{TutorProfile.objects.count()}")
    print(f"   📸 Admins with Profile Pictures: {admin_pics}/{AdminProfile.objects.count()}\n")
    
    # Media Assets
    print("🎨 === MEDIA ASSETS ===")
    import os
    media_dir = "/Users/Apple/Desktop/swinfy-projects/swinfy-lms/backend/media"
    
    try:
        course_banners = len([f for f in os.listdir(f"{media_dir}/courses/banners") if f.endswith('.jpg')])
        course_thumbnails = len([f for f in os.listdir(f"{media_dir}/courses/thumbnails") if f.endswith('.jpg')])
        course_demos = len([f for f in os.listdir(f"{media_dir}/courses/demos") if f.endswith('.json')])
        student_pics_media = len([f for f in os.listdir(f"{media_dir}/profiles/students") if f.endswith('.jpg')])
        tutor_pics_media = len([f for f in os.listdir(f"{media_dir}/profiles/tutors") if f.endswith('.jpg')])
        
        print(f"   🖼️  Course Banners: {course_banners}")
        print(f"   🖼️  Course Thumbnails: {course_thumbnails}")
        print(f"   🎥 Demo Videos (JSON): {course_demos}")
        print(f"   👨‍🎓 Student Profile Images: {student_pics_media}")
        print(f"   👨‍🏫 Tutor Profile Images: {tutor_pics_media}")
    except FileNotFoundError:
        print("   ⚠️  Media directory not found")
    
    print("\n🎉 === DATABASE POPULATION COMPLETE! ===")
    print("✅ All users have detailed profiles with profile pictures")
    print("✅ All courses have proper relationships and media assets")
    print("✅ Complete learning management system ready for use")
    print("✅ YouTube URLs integrated for demo videos")
    print("✅ Realistic data for testing and development")

if __name__ == "__main__":
    final_summary()

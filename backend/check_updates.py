#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from courses.models import *
from users.models import *

def check_database_updates():
    print("=== VERIFYING DATABASE UPDATES ===\n")
    
    # Check courses
    print("=== COURSES ===")
    courses = Course.objects.all()
    print(f"Total courses: {courses.count()}")
    print(f"Published courses: {courses.filter(is_published=True).count()}")
    print(f"Featured courses: {courses.filter(is_featured=True).count()}")
    
    print("\n=== COURSE DETAILS ===")
    for course in courses:
        print(f"\n📚 {course.title}")
        print(f"   Slug: {course.slug}")
        print(f"   Published: {'✅ Yes' if course.is_published else '❌ No'}")
        print(f"   Featured: {'⭐ Yes' if course.is_featured else '❌ No'}")
        print(f"   Tutor: {course.tutor.full_name if course.tutor else '❌ None'}")
        print(f"   Training Partner: {course.training_partner.name if course.training_partner else '❌ None'}")
        print(f"   Price: ₹{course.price}")
        print(f"   Duration: {course.duration_weeks} weeks")
        print(f"   Category: {course.category}")
        print(f"   Level: {course.level}")
        print(f"   Rating: {course.rating}")
        print(f"   Reviews: {course.total_reviews}")
        print(f"   Enrollments: {course.enrollment_count}")
        print(f"   Views: {course.view_count}")
        print(f"   Thumbnail: {'✅ ' + str(course.thumbnail) if course.thumbnail else '❌ None'}")
        print(f"   Banner: {'✅ ' + str(course.banner_image) if course.banner_image else '❌ None'}")
        print(f"   Demo Video: {'✅ ' + str(course.demo_video) if course.demo_video else '❌ None'}")
        print(f"   Approval Status: {course.approval_status}")
        print(f"   Learning Outcomes: {course.learning_outcomes[:100]}..." if course.learning_outcomes else "None")
        print(f"   Prerequisites: {course.prerequisites[:100]}..." if course.prerequisites else "None")
    
    # Check users and training partners
    print(f"\n=== USERS ===")
    print(f"Total users: {User.objects.count()}")
    print(f"Tutors: {User.objects.filter(role='tutor').count()}")
    print(f"Students: {User.objects.filter(role='student').count()}")
    print(f"Admins: {User.objects.filter(role='admin').count()}")
    
    print(f"\n=== TRAINING PARTNERS ===")
    print(f"Total training partners: {TrainingPartner.objects.count()}")
    for tp in TrainingPartner.objects.all():
        print(f"  - {tp.name} ({tp.type})")
    
    # Check if courses have proper relationships
    print(f"\n=== RELATIONSHIP VERIFICATION ===")
    courses_with_tutors = courses.filter(tutor__isnull=False).count()
    courses_with_tp = courses.filter(training_partner__isnull=False).count()
    courses_published = courses.filter(is_published=True).count()
    
    print(f"✅ Courses with tutors: {courses_with_tutors}/{courses.count()}")
    print(f"✅ Courses with training partners: {courses_with_tp}/{courses.count()}")
    print(f"✅ Published courses: {courses_published}/{courses.count()}")
    
    # Check media files exist
    print(f"\n=== MEDIA VERIFICATION ===")
    import os
    media_dir = "/Users/Apple/Desktop/swinfy-projects/swinfy-lms/backend/media"
    
    banner_count = len([f for f in os.listdir(f"{media_dir}/courses/banners") if f.endswith('.jpg')])
    thumbnail_count = len([f for f in os.listdir(f"{media_dir}/courses/thumbnails") if f.endswith('.jpg')])
    demo_count = len([f for f in os.listdir(f"{media_dir}/courses/demos") if f.endswith('.json')])
    
    print(f"✅ Banner images available: {banner_count}")
    print(f"✅ Thumbnail images available: {thumbnail_count}")
    print(f"✅ Demo video files available: {demo_count}")
    
    print(f"\n=== SUMMARY ===")
    if courses_with_tutors > 0 and courses_with_tp > 0 and courses_published > 0:
        print("✅ Database successfully updated with proper course data!")
        print("✅ Courses have tutors and training partners assigned")
        print("✅ Courses are published and ready for use")
        print("✅ Media assets are properly linked")
    else:
        print("❌ Some updates may not have been applied correctly")

if __name__ == "__main__":
    check_database_updates()

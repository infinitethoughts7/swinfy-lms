#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from courses.models import *
from users.models import *

def examine_database():
    print("=== TRAINING PARTNERS ===")
    for tp in TrainingPartner.objects.all():
        print(f"ID: {tp.id}")
        print(f"Name: {tp.name}")
        print(f"Type: {tp.type}")
        print(f"Location: {tp.location}")
        print(f"Active: {tp.is_active}")
        print("---")
    
    print("\n=== USERS ===")
    for user in User.objects.all():
        print(f"ID: {user.id}")
        print(f"Name: {user.full_name}")
        print(f"Email: {user.email}")
        print(f"Role: {user.role}")
        print(f"Organization: {user.organization.name if user.organization else 'None'}")
        print(f"Verified: {user.is_verified}")
        print(f"Approved: {user.is_approved}")
        print("---")
    
    print("\n=== COURSES ===")
    for course in Course.objects.all():
        print(f"ID: {course.id}")
        print(f"Title: {course.title}")
        print(f"Slug: {course.slug}")
        print(f"Category: {course.category}")
        print(f"Level: {course.level}")
        print(f"Price: {course.price}")
        print(f"Duration: {course.duration_weeks} weeks")
        print(f"Tutor: {course.tutor.full_name if course.tutor else 'None'}")
        print(f"Training Partner: {course.training_partner.name if course.training_partner else 'None'}")
        print(f"Approval Status: {course.approval_status}")
        print(f"Published: {course.is_published}")
        print(f"Thumbnail: {course.thumbnail}")
        print(f"Banner: {course.banner_image}")
        print(f"Demo Video: {course.demo_video}")
        print("---")
    
    print("\n=== COURSE MODULES ===")
    for module in CourseModule.objects.all():
        print(f"ID: {module.id}")
        print(f"Title: {module.title}")
        print(f"Course: {module.course.title}")
        print(f"Order: {module.order}")
        print(f"Duration: {module.duration_weeks} weeks")
        print(f"Published: {module.is_published}")
        print("---")
    
    print("\n=== LESSONS ===")
    for lesson in Lesson.objects.all():
        print(f"ID: {lesson.id}")
        print(f"Title: {lesson.title}")
        print(f"Module: {lesson.module.title}")
        print(f"Course: {lesson.course.title}")
        print(f"Type: {lesson.lesson_type}")
        print(f"Order: {lesson.order}")
        print(f"Duration: {lesson.duration_minutes} minutes")
        print(f"Video URL: {lesson.video_url}")
        print(f"Video File: {lesson.video_file}")
        print(f"Published: {lesson.is_published}")
        print("---")
    
    print("\n=== ENROLLMENTS ===")
    for enrollment in Enrollment.objects.all():
        print(f"ID: {enrollment.id}")
        print(f"Student: {enrollment.student.full_name}")
        print(f"Course: {enrollment.course.title}")
        print(f"Status: {enrollment.status}")
        print(f"Enrollment Date: {enrollment.enrollment_date}")
        print("---")

if __name__ == "__main__":
    examine_database()

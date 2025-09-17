#!/usr/bin/env python3
"""
Debug script to check specific course fields that might be filtering out courses
"""

import os
import sys
import django

# Add the backend directory to the path
sys.path.append('/Users/Apple/Desktop/swinfy-projects/swinfy-lms/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')

# Setup Django
django.setup()

from courses.models.course import Course

def check_published_courses_details():
    """Check detailed fields of published courses."""
    
    print("🔍 PUBLISHED COURSES DETAILED CHECK")
    print("=" * 50)
    
    published_courses = Course.objects.filter(is_published=True)
    
    for course in published_courses:
        print(f"\n📚 COURSE: {course.title}")
        print(f"   ID: {course.id}")
        print(f"   Slug: {course.slug}")
        print(f"   is_published: {course.is_published}")
        print(f"   is_active: {course.is_active}")
        print(f"   is_private: {course.is_private}")
        print(f"   approval_status: {course.approval_status}")
        print(f"   is_draft: {course.is_draft}")
        print(f"   requires_admin_enrollment: {course.requires_admin_enrollment}")
        print(f"   training_partner: {course.training_partner}")
        print(f"   tutor: {course.tutor}")
        print(f"   created_at: {course.created_at}")
        print(f"   published_at: {course.published_at}")
    
    # Test the exact queryset used by the API
    print(f"\n🌐 TESTING API QUERYSET")
    print("=" * 30)
    
    api_queryset = Course.objects.filter(is_published=True).select_related('training_partner', 'tutor')
    print(f"Queryset count: {api_queryset.count()}")
    
    # Check if there are any issues with select_related
    for course in api_queryset:
        print(f"  - {course.title} | TP: {course.training_partner} | Tutor: {course.tutor}")
        
    # Test without select_related
    simple_queryset = Course.objects.filter(is_published=True)
    print(f"\nSimple queryset count: {simple_queryset.count()}")

if __name__ == "__main__":
    check_published_courses_details()

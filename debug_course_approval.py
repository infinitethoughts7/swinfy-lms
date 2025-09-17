#!/usr/bin/env python3
"""
Debug script to check course approval workflow
Run this to see the current state of courses and their approval status
"""

import os
import sys
import django
import requests
from datetime import datetime

# Add the backend directory to the path
sys.path.append('/Users/Apple/Desktop/swinfy-projects/swinfy-lms/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')

# Setup Django
django.setup()

from courses.models.course import Course
from users.models.models import User

def check_course_approval_status():
    """Check the current state of courses and their approval workflow."""
    
    print("🔍 COURSE APPROVAL STATUS DEBUG")
    print("=" * 50)
    
    # Check all courses
    all_courses = Course.objects.all()
    print(f"\n📊 TOTAL COURSES: {all_courses.count()}")
    
    # Group by approval status
    draft_courses = Course.objects.filter(approval_status='draft')
    pending_courses = Course.objects.filter(approval_status='pending_approval')
    approved_courses = Course.objects.filter(approval_status='approved')
    rejected_courses = Course.objects.filter(approval_status='rejected')
    
    print(f"\n📝 DRAFT COURSES: {draft_courses.count()}")
    for course in draft_courses:
        print(f"  - {course.title} (ID: {course.id}) | Published: {course.is_published}")
    
    print(f"\n⏳ PENDING APPROVAL: {pending_courses.count()}")
    for course in pending_courses:
        print(f"  - {course.title} (ID: {course.id}) | Published: {course.is_published} | Instructor: {course.tutor.full_name if course.tutor else 'N/A'}")
    
    print(f"\n✅ APPROVED COURSES: {approved_courses.count()}")
    for course in approved_courses:
        print(f"  - {course.title} (ID: {course.id}) | Published: {course.is_published} | Instructor: {course.tutor.full_name if course.tutor else 'N/A'}")
    
    print(f"\n❌ REJECTED COURSES: {rejected_courses.count()}")
    for course in rejected_courses:
        print(f"  - {course.title} (ID: {course.id}) | Published: {course.is_published}")
    
    # Check published courses
    published_courses = Course.objects.filter(is_published=True)
    print(f"\n🌐 PUBLISHED COURSES (visible on public page): {published_courses.count()}")
    for course in published_courses:
        print(f"  - {course.title} (Status: {course.approval_status}) | Instructor: {course.tutor.full_name if course.tutor else 'N/A'}")
    
    # Check for inconsistencies
    print(f"\n🚨 INCONSISTENCIES CHECK:")
    approved_not_published = Course.objects.filter(approval_status='approved', is_published=False)
    if approved_not_published.exists():
        print(f"  ❌ {approved_not_published.count()} approved courses are NOT published:")
        for course in approved_not_published:
            print(f"    - {course.title} (ID: {course.id})")
    else:
        print("  ✅ All approved courses are published")
    
    published_not_approved = Course.objects.filter(is_published=True).exclude(approval_status='approved')
    if published_not_approved.exists():
        print(f"  ⚠️  {published_not_approved.count()} published courses are NOT approved:")
        for course in published_not_approved:
            print(f"    - {course.title} (Status: {course.approval_status})")
    else:
        print("  ✅ All published courses are approved")

def check_api_endpoints():
    """Test the API endpoints to see what they return."""
    
    print(f"\n🌐 API ENDPOINTS TEST")
    print("=" * 30)
    
    base_url = "https://urchin-app-3xb5n.ondigitalocean.app"
    
    try:
        # Test public courses endpoint
        response = requests.get(f"{base_url}/api/courses/")
        if response.status_code == 200:
            data = response.json()
            courses_count = len(data.get('results', data))
            print(f"✅ Public courses API: {courses_count} courses returned")
        else:
            print(f"❌ Public courses API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Public courses API error: {e}")
    
    # You would need authentication for these endpoints
    print("  (KP admin endpoints require authentication - check manually)")

if __name__ == "__main__":
    try:
        check_course_approval_status()
        check_api_endpoints()
        
        print(f"\n💡 RECOMMENDATIONS:")
        print("1. Check if instructors are actually submitting courses for approval")
        print("2. Verify KP admin is logged in with correct permissions")
        print("3. Test the approval workflow step by step")
        print("4. Check if there are any JavaScript errors in the browser console")
        
    except Exception as e:
        print(f"❌ Error running debug script: {e}")
        print("Make sure you're running this from the correct directory with Django setup")

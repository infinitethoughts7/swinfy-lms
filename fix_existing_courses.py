#!/usr/bin/env python3
"""
Fix existing approved courses to make them public
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

def fix_approved_courses():
    """Make approved courses public so they appear in the course listing."""
    
    print("🔧 FIXING APPROVED COURSES")
    print("=" * 40)
    
    # Find approved courses that are private
    approved_private_courses = Course.objects.filter(
        approval_status='approved',
        is_private=True
    )
    
    print(f"Found {approved_private_courses.count()} approved private courses")
    
    for course in approved_private_courses:
        print(f"\n📚 Fixing course: {course.title}")
        print(f"   Before: is_private={course.is_private}, requires_admin_enrollment={course.requires_admin_enrollment}")
        
        # Make course public
        course.is_private = False
        course.requires_admin_enrollment = False
        course.save()
        
        print(f"   After:  is_private={course.is_private}, requires_admin_enrollment={course.requires_admin_enrollment}")
        print("   ✅ Fixed!")
    
    print(f"\n🎉 Updated {approved_private_courses.count()} courses to be public")
    
    # Verify the fix
    public_courses = Course.objects.filter(is_published=True, is_private=False)
    print(f"\n✅ Total public courses now: {public_courses.count()}")
    
    for course in public_courses:
        print(f"  - {course.title} (Status: {course.approval_status})")

if __name__ == "__main__":
    fix_approved_courses()

#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from courses.models import *

def create_minimal_content():
    """Create basic modules and lessons with minimal required fields"""
    
    # Get some courses
    courses = Course.objects.filter(is_published=True)[:3]  # Limit to first 3 courses
    
    for course in courses:
        print(f"\nCreating content for: {course.title}")
        
        # Create 2-3 modules per course
        for i in range(1, 4):
            # Create module with only required fields
            module = CourseModule(
                course=course,
                title=f"Module {i}: {course.title.split()[0]} Fundamentals",
                description=f"Learn the fundamentals of {course.title.split()[0].lower()} in this comprehensive module.",
                order=i
            )
            # Set slug manually to avoid database issues
            module.slug = f"module-{i}-{course.slug}"
            module.save()
            print(f"  Created module: {module.title}")
            
            # Create 2-3 lessons per module
            for j in range(1, 4):
                lesson = Lesson(
                    module=module,
                    title=f"Lesson {j}: Introduction to {course.title.split()[0]}",
                    description=f"Learn the basics of {course.title.split()[0].lower()} in this lesson.",
                    lesson_type='video',
                    order=j,
                    video_url=f'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t={j*60}s'
                )
                # Set slug manually
                lesson.slug = f"lesson-{j}-{module.slug}"
                lesson.save()
                print(f"    Created lesson: {lesson.title}")

def main():
    print("Creating minimal content...")
    
    # Create basic content
    create_minimal_content()
    
    print("\nContent creation completed!")
    print(f"Total courses: {Course.objects.count()}")
    print(f"Published courses: {Course.objects.filter(is_published=True).count()}")
    print(f"Total modules: {CourseModule.objects.count()}")
    print(f"Total lessons: {Lesson.objects.count()}")

if __name__ == "__main__":
    main()

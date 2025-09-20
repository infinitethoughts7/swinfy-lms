#!/usr/bin/env python3
"""
Check course structure and progress
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/Apple/Desktop/swinfy-projects/swinfy-lms/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from courses.models import Course, CourseModule, Lesson, Enrollment, CourseProgress, LessonProgress
from users.models import User

def check_course_structure():
    """Check the course structure and progress"""
    
    # Get the user
    try:
        user = User.objects.get(email="rakeshganji99@gmail.com")
        print(f"User: {user.full_name} ({user.email})")
    except User.DoesNotExist:
        print("User not found")
        return
    
    # Get enrollments
    enrollments = Enrollment.objects.filter(learner=user)
    print(f"Enrollments: {enrollments.count()}")
    
    for enrollment in enrollments:
        course = enrollment.course
        print(f"\nCourse: {course.title}")
        print(f"Course ID: {course.id}")
        
        # Get modules
        modules = CourseModule.objects.filter(course=course)
        print(f"Modules: {modules.count()}")
        
        total_lessons = 0
        for module in modules:
            lessons = Lesson.objects.filter(module=module)
            print(f"  Module '{module.title}': {lessons.count()} lessons")
            total_lessons += lessons.count()
            
            for lesson in lessons:
                print(f"    - {lesson.title} (ID: {lesson.id})")
        
        print(f"Total lessons in course: {total_lessons}")
        
        # Get course progress
        try:
            course_progress = CourseProgress.objects.get(enrollment=enrollment)
            print(f"Course Progress: {course_progress.overall_progress}%")
            print(f"Lessons completed: {course_progress.lessons_completed}/{course_progress.total_lessons}")
        except CourseProgress.DoesNotExist:
            print("No course progress found")
        
        # Get lesson progress
        lesson_progress = LessonProgress.objects.filter(enrollment=enrollment)
        print(f"Lesson progress records: {lesson_progress.count()}")
        
        for lp in lesson_progress:
            print(f"  - {lp.lesson.title}: {'✓' if lp.is_completed else '○'} (started: {lp.is_started})")

if __name__ == "__main__":
    check_course_structure()

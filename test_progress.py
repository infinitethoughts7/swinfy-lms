#!/usr/bin/env python3
"""
Test script for progress tracking functionality
"""
import requests
import json
import sys

# API base URL
BASE_URL = "http://localhost:8000/api"

def test_progress_flow():
    """Test the complete progress flow"""
    
    # Test credentials
    email = "rakeshganji99@gmail.com"
    password = "rockyg07"
    
    print("🚀 Testing Progress Flow")
    print("=" * 50)
    
    # Step 1: Login
    print("1. Logging in...")
    login_data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return False
    
    login_result = response.json()
    access_token = login_result['tokens']['access']
    headers = {"Authorization": f"Bearer {access_token}"}
    
    print(f"✅ Login successful: {login_result['user']['full_name']}")
    
    # Step 2: Get user's courses
    print("\n2. Getting enrolled courses...")
    response = requests.get(f"{BASE_URL}/courses/my-courses/", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to get courses: {response.status_code}")
        print(response.text)
        return False
    
    courses = response.json()
    print(f"✅ Found {len(courses.get('results', []))} enrolled courses")
    
    if not courses.get('results'):
        print("❌ No enrolled courses found")
        return False
    
    # Get first course
    course = courses['results'][0]
    course_slug = course['course']['slug']
    print(f"📚 Testing with course: {course['course']['title']}")
    
    # Step 3: Get course modules
    print(f"\n3. Getting course modules for {course_slug}...")
    response = requests.get(f"{BASE_URL}/courses/{course_slug}/modules/", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to get modules: {response.status_code}")
        print(response.text)
        return False
    
    modules = response.json()
    print(f"✅ Found {len(modules.get('results', []))} modules")
    
    if not modules.get('results'):
        print("❌ No modules found")
        return False
    
    # Get first module
    module = modules['results'][0]
    module_id = module['id']
    print(f"📖 Testing with module: {module['title']}")
    
    # Step 4: Get module lessons
    print(f"\n4. Getting lessons for module {module_id}...")
    response = requests.get(f"{BASE_URL}/courses/{course_slug}/modules/{module_id}/lessons/", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to get lessons: {response.status_code}")
        print(response.text)
        return False
    
    lessons = response.json()
    print(f"✅ Found {len(lessons.get('results', []))} lessons")
    
    if not lessons.get('results'):
        print("❌ No lessons found")
        return False
    
    # Get first lesson
    lesson = lessons['results'][0]
    lesson_id = lesson['id']
    print(f"🎯 Testing with lesson: {lesson['title']}")
    
    # Step 5: Get course progress (before)
    print(f"\n5. Getting course progress (before)...")
    response = requests.get(f"{BASE_URL}/courses/{course_slug}/progress/", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to get progress: {response.status_code}")
        print(response.text)
        return False
    
    progress_before = response.json()
    print(f"✅ Progress before: {progress_before.get('overall_progress', 0)}%")
    print(f"   Lessons completed: {progress_before.get('lessons_completed', 0)}/{progress_before.get('total_lessons', 0)}")
    
    # Step 6: Mark lesson as started
    print(f"\n6. Marking lesson {lesson_id} as started...")
    response = requests.patch(f"{BASE_URL}/courses/lessons/{lesson_id}/start/", 
                             json={"is_started": True}, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to start lesson: {response.status_code}")
        print(response.text)
        return False
    
    print("✅ Lesson marked as started")
    
    # Step 7: Mark lesson as completed
    print(f"\n7. Marking lesson {lesson_id} as completed...")
    response = requests.patch(f"{BASE_URL}/courses/lessons/{lesson_id}/complete/", 
                             json={"is_completed": True}, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to complete lesson: {response.status_code}")
        print(response.text)
        return False
    
    print("✅ Lesson marked as completed")
    
    # Step 8: Get course progress (after)
    print(f"\n8. Getting course progress (after)...")
    response = requests.get(f"{BASE_URL}/courses/{course_slug}/progress/", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to get progress: {response.status_code}")
        print(response.text)
        return False
    
    progress_after = response.json()
    print(f"✅ Progress after: {progress_after.get('overall_progress', 0)}%")
    print(f"   Lessons completed: {progress_after.get('lessons_completed', 0)}/{progress_after.get('total_lessons', 0)}")
    
    # Step 9: Verify progress increased
    if progress_after.get('lessons_completed', 0) > progress_before.get('lessons_completed', 0):
        print("✅ Progress tracking is working correctly!")
        return True
    else:
        print("❌ Progress did not increase as expected")
        return False

if __name__ == "__main__":
    success = test_progress_flow()
    sys.exit(0 if success else 1)

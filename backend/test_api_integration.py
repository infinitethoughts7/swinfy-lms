#!/usr/bin/env python
import requests
import json

def test_api_integration():
    print("🧪 Testing API Integration...")
    
    # Test courses list API
    print("\n1. Testing Courses List API...")
    try:
        response = requests.get("http://localhost:8000/api/courses/")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Courses API working - Found {data.get('count', 0)} courses")
            
            # Show first course details
            if data.get('results'):
                first_course = data['results'][0]
                print(f"   📚 First course: {first_course['title']}")
                print(f"   👨‍🏫 Instructor: {first_course['tutor']['full_name']}")
                print(f"   🏢 Organization: {first_course['training_partner']['name']}")
                print(f"   💰 Price: ₹{first_course['price']}")
                print(f"   ⭐ Rating: {first_course['rating']}")
        else:
            print(f"   ❌ Courses API failed - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Courses API error: {e}")
    
    # Test course detail API
    print("\n2. Testing Course Detail API...")
    try:
        response = requests.get("http://localhost:8000/api/courses/advanced-computer-science-research-methods/")
        if response.status_code == 200:
            course = response.json()
            print(f"   ✅ Course Detail API working")
            print(f"   📚 Course: {course['title']}")
            print(f"   📝 Description: {course['description'][:100]}...")
            print(f"   🏷️  Category: {course['category_display']}")
            print(f"   📊 Level: {course['level_display']}")
            print(f"   ⏱️  Duration: {course['duration_weeks']} weeks")
        else:
            print(f"   ❌ Course Detail API failed - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Course Detail API error: {e}")
    
    # Test frontend-backend integration
    print("\n3. Testing Frontend-Backend Integration...")
    try:
        response = requests.get("http://localhost:3000/courses")
        if response.status_code == 200:
            print("   ✅ Frontend is accessible")
            # Check if real course data is being displayed
            content = response.text
            if "Advanced Computer Science Research Methods" in content:
                print("   ✅ Real course data is being displayed on frontend")
            else:
                print("   ⚠️  Frontend might be using cached or mock data")
        else:
            print(f"   ❌ Frontend not accessible - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Frontend integration error: {e}")
    
    print("\n🎉 API Integration Test Complete!")

if __name__ == "__main__":
    test_api_integration()

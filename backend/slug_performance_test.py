#!/usr/bin/env python
import os
import sys
import django
import time
from django.utils.text import slugify

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from courses.models import Course

def test_stored_slug_performance():
    """Test performance of stored slugs"""
    print("=== STORED SLUG PERFORMANCE TEST ===")
    
    # Test database lookup by slug
    start_time = time.time()
    for i in range(1000):
        try:
            course = Course.objects.get(slug='python-for-beginners')
        except Course.DoesNotExist:
            pass
    end_time = time.time()
    
    print(f"1000 database lookups by stored slug: {end_time - start_time:.4f} seconds")
    return end_time - start_time

def test_generated_slug_performance():
    """Test performance of generated slugs"""
    print("\n=== GENERATED SLUG PERFORMANCE TEST ===")
    
    # Test slug generation
    start_time = time.time()
    for i in range(1000):
        course = Course.objects.first()
        if course:
            slug = slugify(course.title)
    end_time = time.time()
    
    print(f"1000 slug generations: {end_time - start_time:.4f} seconds")
    return end_time - start_time

def test_title_lookup_performance():
    """Test performance of title-based lookups"""
    print("\n=== TITLE LOOKUP PERFORMANCE TEST ===")
    
    # Test database lookup by title
    start_time = time.time()
    for i in range(1000):
        try:
            course = Course.objects.get(title__iexact='Python for Beginners')
        except Course.DoesNotExist:
            pass
    end_time = time.time()
    
    print(f"1000 database lookups by title: {end_time - start_time:.4f} seconds")
    return end_time - start_time

def main():
    print("Testing slug performance approaches...\n")
    
    # Run tests
    stored_time = test_stored_slug_performance()
    generated_time = test_generated_slug_performance()
    title_time = test_title_lookup_performance()
    
    print(f"\n=== PERFORMANCE COMPARISON ===")
    print(f"Stored slug lookup:     {stored_time:.4f}s")
    print(f"Generated slug:         {generated_time:.4f}s")
    print(f"Title lookup:           {title_time:.4f}s")
    
    if stored_time < generated_time:
        print(f"✅ Stored slugs are {generated_time/stored_time:.2f}x faster")
    else:
        print(f"❌ Generated slugs are {stored_time/generated_time:.2f}x faster")
    
    if stored_time < title_time:
        print(f"✅ Stored slugs are {title_time/stored_time:.2f}x faster than title lookup")
    else:
        print(f"❌ Title lookup is {stored_time/title_time:.2f}x faster")

if __name__ == "__main__":
    main()

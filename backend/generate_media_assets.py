#!/usr/bin/env python3
"""
Script to generate media assets for the LMS project.
Creates course thumbnails, banners, and sample materials.
"""

import os
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO

# Course categories and their colors
COURSE_CATEGORIES = {
    'programming': {
        'color': '#4A90E2',
        'icon': '💻',
        'courses': [
            {'title': 'Python Basics', 'slug': 'python-basics'},
            {'title': 'JavaScript Fundamentals', 'slug': 'javascript-fundamentals'},
            {'title': 'React Development', 'slug': 'react-development'},
            {'title': 'TypeScript Mastery', 'slug': 'typescript-mastery'},
        ]
    },
    'data-science': {
        'color': '#7ED321',
        'icon': '📊',
        'courses': [
            {'title': 'Data Analysis with Python', 'slug': 'data-analysis-python'},
            {'title': 'Machine Learning Basics', 'slug': 'machine-learning-basics'},
            {'title': 'Statistics for Data Science', 'slug': 'statistics-data-science'},
            {'title': 'Power BI Fundamentals', 'slug': 'power-bi-fundamentals'},
        ]
    },
    'business': {
        'color': '#F5A623',
        'icon': '💼',
        'courses': [
            {'title': 'Excel Advanced', 'slug': 'excel-advanced'},
            {'title': 'Google Sheets Mastery', 'slug': 'google-sheets-mastery'},
            {'title': 'Tableau Visualization', 'slug': 'tableau-visualization'},
            {'title': 'SQL for Business', 'slug': 'sql-business'},
        ]
    },
    'design': {
        'color': '#BD10E0',
        'icon': '🎨',
        'courses': [
            {'title': 'UI/UX Design', 'slug': 'ui-ux-design'},
            {'title': 'Adobe Creative Suite', 'slug': 'adobe-creative-suite'},
            {'title': 'Figma Mastery', 'slug': 'figma-mastery'},
            {'title': 'Web Design Principles', 'slug': 'web-design-principles'},
        ]
    }
}

def create_thumbnail(course_title, category, slug, size=(400, 300)):
    """Create a course thumbnail image."""
    # Create image with gradient background
    img = Image.new('RGBA', size, color=COURSE_CATEGORIES[category]['color'])
    draw = ImageDraw.Draw(img)
    
    # Add a subtle gradient effect
    for i in range(size[1]):
        alpha = int(255 * (1 - i / size[1] * 0.3))
        color = tuple(int(c * alpha / 255) for c in Image.new('RGB', (1, 1), COURSE_CATEGORIES[category]['color']).getpixel((0, 0)))
        draw.line([(0, i), (size[0], i)], fill=color)
    
    # Add category icon
    try:
        # Try to use a system font
        icon_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 60)
    except:
        icon_font = ImageFont.load_default()
    
    icon_text = COURSE_CATEGORIES[category]['icon']
    icon_bbox = draw.textbbox((0, 0), icon_text, font=icon_font)
    icon_width = icon_bbox[2] - icon_bbox[0]
    icon_height = icon_bbox[3] - icon_bbox[1]
    icon_x = (size[0] - icon_width) // 2
    icon_y = 50
    draw.text((icon_x, icon_y), icon_text, fill='white', font=icon_font)
    
    # Add course title
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # Split title into lines if too long
    words = course_title.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=title_font)
        if bbox[2] - bbox[0] <= size[0] - 40:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                lines.append(word)
    
    if current_line:
        lines.append(' '.join(current_line))
    
    # Draw title lines
    title_y = icon_y + icon_height + 20
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        line_width = bbox[2] - bbox[0]
        line_x = (size[0] - line_width) // 2
        draw.text((line_x, title_y), line, fill='white', font=title_font)
        title_y += 30
    
    # Add category label
    category_text = category.replace('-', ' ').title()
    cat_bbox = draw.textbbox((0, 0), category_text, font=subtitle_font)
    cat_width = cat_bbox[2] - cat_bbox[0]
    cat_x = (size[0] - cat_width) // 2
    cat_y = title_y + 10
    draw.text((cat_x, cat_y), category_text, fill=(255, 255, 255, 200), font=subtitle_font)
    
    # Add Swinfy branding
    branding_text = "Swinfy LMS"
    brand_bbox = draw.textbbox((0, 0), branding_text, font=subtitle_font)
    brand_width = brand_bbox[2] - brand_bbox[0]
    brand_x = (size[0] - brand_width) // 2
    brand_y = size[1] - 30
    draw.text((brand_x, brand_y), branding_text, fill=(255, 255, 255, 150), font=subtitle_font)
    
    return img

def create_banner(course_title, category, slug, size=(1200, 400)):
    """Create a course banner image."""
    # Create image with gradient background
    img = Image.new('RGBA', size, color=COURSE_CATEGORIES[category]['color'])
    draw = ImageDraw.Draw(img)
    
    # Add a more complex gradient effect
    for i in range(size[1]):
        alpha = int(255 * (1 - i / size[1] * 0.4))
        color = tuple(int(c * alpha / 255) for c in Image.new('RGB', (1, 1), COURSE_CATEGORIES[category]['color']).getpixel((0, 0)))
        draw.line([(0, i), (size[0], i)], fill=color)
    
    # Add decorative elements
    for i in range(0, size[0], 100):
        draw.ellipse([i, 50, i + 80, 130], fill=(255, 255, 255, 25), outline=None)
    
    # Add course title
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 48)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # Draw main title
    title_bbox = draw.textbbox((0, 0), course_title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (size[0] - title_width) // 2
    title_y = (size[1] - 100) // 2
    draw.text((title_x, title_y), course_title, fill='white', font=title_font)
    
    # Add category subtitle
    category_text = f"{COURSE_CATEGORIES[category]['icon']} {category.replace('-', ' ').title()}"
    cat_bbox = draw.textbbox((0, 0), category_text, font=subtitle_font)
    cat_width = cat_bbox[2] - cat_bbox[0]
    cat_x = (size[0] - cat_width) // 2
    cat_y = title_y + 60
    draw.text((cat_x, cat_y), category_text, fill=(255, 255, 255, 230), font=subtitle_font)
    
    return img

def create_sample_pdf_content(course_title, category, slug):
    """Create sample PDF content for course materials."""
    content = f"""
# {course_title}

## Course Overview
Welcome to {course_title}! This comprehensive course will take you from beginner to advanced level in {category.replace('-', ' ')}.

## Learning Objectives
By the end of this course, you will be able to:
- Understand the fundamental concepts
- Apply practical skills in real-world scenarios
- Build projects that demonstrate your knowledge
- Prepare for advanced topics

## Course Structure
1. **Introduction** - Getting started with the basics
2. **Core Concepts** - Understanding the fundamentals
3. **Practical Applications** - Hands-on exercises
4. **Advanced Topics** - Taking your skills further
5. **Project Work** - Building real-world applications
6. **Assessment** - Testing your knowledge

## Prerequisites
- Basic computer skills
- Eagerness to learn
- No prior experience required

## Course Materials
- Video lectures
- Reading materials
- Practice exercises
- Quizzes and assessments
- Project templates

## Instructor
Your course instructor is an experienced professional with years of industry experience.

## Support
- Discussion forums
- Office hours
- Email support
- Community chat

---
*This course is part of the Swinfy Learning Management System*
"""
    return content

def main():
    """Generate all media assets."""
    print("🎨 Generating media assets for Swinfy LMS...")
    
    # Create directories
    os.makedirs('media/courses/thumbnails', exist_ok=True)
    os.makedirs('media/courses/banners', exist_ok=True)
    os.makedirs('media/courses/materials', exist_ok=True)
    os.makedirs('media/courses/demos', exist_ok=True)
    
    # Generate assets for each category
    for category, data in COURSE_CATEGORIES.items():
        print(f"📚 Generating assets for {category} category...")
        
        for course in data['courses']:
            print(f"  📖 Creating assets for {course['title']}...")
            
            # Create thumbnail
            thumbnail = create_thumbnail(course['title'], category, course['slug'])
            thumbnail_rgb = Image.new('RGB', thumbnail.size, (255, 255, 255))
            thumbnail_rgb.paste(thumbnail, mask=thumbnail.split()[-1])
            thumbnail_path = f"media/courses/thumbnails/{course['slug']}.jpg"
            thumbnail_rgb.save(thumbnail_path, 'JPEG', quality=90)
            
            # Create banner
            banner = create_banner(course['title'], category, course['slug'])
            banner_rgb = Image.new('RGB', banner.size, (255, 255, 255))
            banner_rgb.paste(banner, mask=banner.split()[-1])
            banner_path = f"media/courses/banners/{course['slug']}.jpg"
            banner_rgb.save(banner_path, 'JPEG', quality=90)
            
            # Create sample PDF content
            pdf_content = create_sample_pdf_content(course['title'], category, course['slug'])
            pdf_path = f"media/courses/materials/{course['slug']}-outline.txt"
            with open(pdf_path, 'w', encoding='utf-8') as f:
                f.write(pdf_content)
            
            # Create demo video placeholder
            demo_path = f"media/courses/demos/{course['slug']}-demo.txt"
            with open(demo_path, 'w', encoding='utf-8') as f:
                f.write(f"Demo video placeholder for {course['title']}\n")
                f.write("In production, this would be a video file or YouTube embed URL\n")
                f.write(f"Example YouTube URL: https://youtube.com/watch?v=demo_{course['slug']}\n")
    
    print("✅ Media assets generated successfully!")
    print("\n📁 Generated files:")
    print("  - Course thumbnails: media/courses/thumbnails/")
    print("  - Course banners: media/courses/banners/")
    print("  - Course materials: media/courses/materials/")
    print("  - Demo placeholders: media/courses/demos/")

if __name__ == "__main__":
    main()

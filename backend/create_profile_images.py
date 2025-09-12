#!/usr/bin/env python3
"""
Script to create sample profile images for students and tutors.
"""

import os
from PIL import Image, ImageDraw, ImageFont
import random

def create_profile_image(name, role, size=(200, 200)):
    """Create a profile image with initials."""
    # Choose colors based on role
    if role == 'student':
        colors = [
            '#4A90E2',  # Blue
            '#7ED321',  # Green
            '#F5A623',  # Orange
            '#BD10E0',  # Purple
            '#50E3C2',  # Teal
        ]
    else:  # tutor
        colors = [
            '#D0021B',  # Red
            '#9013FE',  # Purple
            '#417505',  # Dark Green
            '#B8E986',  # Light Green
            '#4A4A4A',  # Dark Gray
        ]
    
    # Create image with random color
    bg_color = random.choice(colors)
    img = Image.new('RGBA', size, color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Add circular background
    margin = 10
    draw.ellipse([margin, margin, size[0]-margin, size[1]-margin], 
                fill=bg_color, outline='white', width=3)
    
    # Get initials
    initials = ''.join([word[0].upper() for word in name.split()[:2]])
    
    # Add initials
    try:
        font_size = min(size) // 3
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position
    bbox = draw.textbbox((0, 0), initials, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (size[0] - text_width) // 2
    text_y = (size[1] - text_height) // 2
    
    # Draw initials
    draw.text((text_x, text_y), initials, fill='white', font=font)
    
    # Add role indicator
    try:
        role_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 12)
    except:
        role_font = ImageFont.load_default()
    
    role_text = role.upper()
    role_bbox = draw.textbbox((0, 0), role_text, font=role_font)
    role_width = role_bbox[2] - role_bbox[0]
    role_x = (size[0] - role_width) // 2
    role_y = size[1] - 25
    
    draw.text((role_x, role_y), role_text, fill=(255, 255, 255, 200), font=role_font)
    
    return img

def main():
    """Generate profile images."""
    print("👥 Generating profile images for Swinfy LMS...")
    
    # Create directories
    os.makedirs('media/profiles/students', exist_ok=True)
    os.makedirs('media/profiles/tutors', exist_ok=True)
    
    # Sample students
    students = [
        'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson',
        'Emma Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor',
        'Ivy Chen', 'Jack Anderson', 'Kate Martinez', 'Liam O\'Brien'
    ]
    
    # Sample tutors
    tutors = [
        'Dr. Sarah Williams', 'Prof. Michael Johnson', 'Dr. Lisa Chen',
        'Prof. Robert Davis', 'Dr. Maria Garcia', 'Prof. James Wilson',
        'Dr. Jennifer Brown', 'Prof. David Miller', 'Dr. Amanda Taylor',
        'Prof. Christopher Lee', 'Dr. Rachel Green', 'Prof. Kevin White'
    ]
    
    # Generate student profile images
    print("🎓 Creating student profile images...")
    for i, student in enumerate(students):
        img = create_profile_image(student, 'student')
        filename = f"student_{i+1:02d}_{student.lower().replace(' ', '_')}.jpg"
        img_rgb = Image.new('RGB', img.size, (255, 255, 255))
        img_rgb.paste(img, mask=img.split()[-1])
        img_rgb.save(f"media/profiles/students/{filename}", 'JPEG', quality=90)
        print(f"  ✅ Created {filename}")
    
    # Generate tutor profile images
    print("👨‍🏫 Creating tutor profile images...")
    for i, tutor in enumerate(tutors):
        img = create_profile_image(tutor, 'tutor')
        filename = f"tutor_{i+1:02d}_{tutor.lower().replace(' ', '_').replace('.', '')}.jpg"
        img_rgb = Image.new('RGB', img.size, (255, 255, 255))
        img_rgb.paste(img, mask=img.split()[-1])
        img_rgb.save(f"media/profiles/tutors/{filename}", 'JPEG', quality=90)
        print(f"  ✅ Created {filename}")
    
    print("✅ Profile images generated successfully!")
    print(f"\n📁 Generated files:")
    print(f"  - Student profiles: media/profiles/students/ ({len(students)} images)")
    print(f"  - Tutor profiles: media/profiles/tutors/ ({len(tutors)} images)")

if __name__ == "__main__":
    main()

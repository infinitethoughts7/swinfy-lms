#!/usr/bin/env python3
"""
Script to create demo video placeholders and YouTube embed links.
"""

import os
import json

# Sample YouTube video IDs for different course categories
DEMO_VIDEOS = {
    'programming': [
        'dQw4w9WgXcQ',  # Sample video ID
        'jNQXAC9IVRw',
        'M7lc1UVf-VE',
        'fJ9rUzIMcZQ'
    ],
    'data-science': [
        'kJQP7kiw5Fk',
        'YQHsXMglC9A',
        'fJ9rUzIMcZQ',
        'dQw4w9WgXcQ'
    ],
    'business': [
        'M7lc1UVf-VE',
        'jNQXAC9IVRw',
        'YQHsXMglC9A',
        'kJQP7kiw5Fk'
    ],
    'design': [
        'fJ9rUzIMcZQ',
        'dQw4w9WgXcQ',
        'M7lc1UVf-VE',
        'jNQXAC9IVRw'
    ]
}

def create_demo_video_metadata(course_title, category, slug, video_id):
    """Create demo video metadata file."""
    metadata = {
        'course_title': course_title,
        'course_slug': slug,
        'category': category,
        'video_type': 'demo',
        'youtube_id': video_id,
        'youtube_url': f'https://www.youtube.com/watch?v={video_id}',
        'embed_url': f'https://www.youtube.com/embed/{video_id}',
        'thumbnail_url': f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg',
        'duration': '5:30',  # Placeholder duration
        'description': f'Demo video for {course_title} course',
        'created_at': '2024-01-01T00:00:00Z',
        'updated_at': '2024-01-01T00:00:00Z'
    }
    return metadata

def main():
    """Generate demo video placeholders."""
    print("🎬 Creating demo video placeholders for Swinfy LMS...")
    
    # Course data (same as in generate_media_assets.py)
    COURSE_CATEGORIES = {
        'programming': [
            {'title': 'Python Basics', 'slug': 'python-basics'},
            {'title': 'JavaScript Fundamentals', 'slug': 'javascript-fundamentals'},
            {'title': 'React Development', 'slug': 'react-development'},
            {'title': 'TypeScript Mastery', 'slug': 'typescript-mastery'},
        ],
        'data-science': [
            {'title': 'Data Analysis with Python', 'slug': 'data-analysis-python'},
            {'title': 'Machine Learning Basics', 'slug': 'machine-learning-basics'},
            {'title': 'Statistics for Data Science', 'slug': 'statistics-data-science'},
            {'title': 'Power BI Fundamentals', 'slug': 'power-bi-fundamentals'},
        ],
        'business': [
            {'title': 'Excel Advanced', 'slug': 'excel-advanced'},
            {'title': 'Google Sheets Mastery', 'slug': 'google-sheets-mastery'},
            {'title': 'Tableau Visualization', 'slug': 'tableau-visualization'},
            {'title': 'SQL for Business', 'slug': 'sql-business'},
        ],
        'design': [
            {'title': 'UI/UX Design', 'slug': 'ui-ux-design'},
            {'title': 'Adobe Creative Suite', 'slug': 'adobe-creative-suite'},
            {'title': 'Figma Mastery', 'slug': 'figma-mastery'},
            {'title': 'Web Design Principles', 'slug': 'web-design-principles'},
        ]
    }
    
    # Create demo videos directory
    os.makedirs('media/courses/demos', exist_ok=True)
    
    video_index = 0
    for category, courses in COURSE_CATEGORIES.items():
        print(f"🎥 Creating demo videos for {category} category...")
        
        for i, course in enumerate(courses):
            # Get video ID (cycle through available videos)
            video_id = DEMO_VIDEOS[category][i % len(DEMO_VIDEOS[category])]
            
            # Create metadata
            metadata = create_demo_video_metadata(
                course['title'], category, course['slug'], video_id
            )
            
            # Save metadata as JSON
            metadata_file = f"media/courses/demos/{course['slug']}-demo.json"
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2)
            
            # Create HTML embed file
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>{course['title']} - Demo Video</title>
    <style>
        body {{
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .video-container {{
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
            margin-bottom: 20px;
        }}
        .video-container iframe {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 8px;
        }}
        h1 {{
            color: #333;
            margin-bottom: 10px;
        }}
        .meta {{
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }}
        .description {{
            color: #555;
            line-height: 1.6;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{course['title']} - Demo Video</h1>
        <div class="meta">
            Category: {category.replace('-', ' ').title()} | 
            Duration: {metadata['duration']} | 
            Course: {course['slug']}
        </div>
        
        <div class="video-container">
            <iframe 
                src="{metadata['embed_url']}" 
                title="{course['title']} Demo Video"
                allowfullscreen>
            </iframe>
        </div>
        
        <div class="description">
            <h3>About this Demo</h3>
            <p>{metadata['description']}</p>
            <p>This is a sample demo video for the {course['title']} course. 
            In a production environment, this would be a custom-created demo video 
            showcasing the course content and learning outcomes.</p>
            
            <h3>Course Information</h3>
            <ul>
                <li><strong>Course Title:</strong> {course['title']}</li>
                <li><strong>Category:</strong> {category.replace('-', ' ').title()}</li>
                <li><strong>Slug:</strong> {course['slug']}</li>
                <li><strong>Video ID:</strong> {video_id}</li>
            </ul>
        </div>
    </div>
</body>
</html>
"""
            
            html_file = f"media/courses/demos/{course['slug']}-demo.html"
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"  ✅ Created demo for {course['title']}")
            video_index += 1
    
    print("✅ Demo video placeholders created successfully!")
    print(f"\n📁 Generated files:")
    print(f"  - Demo metadata: media/courses/demos/*.json")
    print(f"  - Demo HTML pages: media/courses/demos/*.html")
    print(f"  - Total demos created: {video_index}")

if __name__ == "__main__":
    main()

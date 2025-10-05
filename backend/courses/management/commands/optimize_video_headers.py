"""
Management command to update video file headers in S3 for better streaming.
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from courses.models import Course, Lesson
import boto3
from botocore.exceptions import ClientError


class Command(BaseCommand):
    help = 'Update video file headers in S3 for optimized streaming'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if not settings.USE_S3:
            self.stdout.write(self.style.WARNING('S3 is not enabled. Skipping optimization.'))
            return
        
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        video_files = []
        
        # Collect all video files from courses
        self.stdout.write('Scanning for video files...')
        
        # Course demo videos
        for course in Course.objects.exclude(demo_video=''):
            if course.demo_video:
                video_files.append({
                    'key': str(course.demo_video),
                    'type': 'course_demo',
                    'id': course.id,
                    'title': course.title
                })
        
        # Lesson videos
        for lesson in Lesson.objects.filter(lesson_type='video').exclude(video_file=''):
            if lesson.video_file:
                video_files.append({
                    'key': str(lesson.video_file),
                    'type': 'lesson_video',
                    'id': lesson.id,
                    'title': lesson.title
                })
        
        self.stdout.write(self.style.SUCCESS(f'Found {len(video_files)} video files'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        updated_count = 0
        error_count = 0
        
        for video in video_files:
            key = video['key']
            
            try:
                # Get current object metadata
                response = s3_client.head_object(Bucket=bucket_name, Key=key)
                
                # Prepare new metadata
                ext = key.lower().split('.')[-1] if '.' in key else 'mp4'
                content_type = 'video/mp4' if ext == 'mp4' else f'video/{ext}'
                
                new_metadata = {
                    'ContentType': content_type,
                    'ContentDisposition': 'inline',
                    'CacheControl': 'public, max-age=31536000',
                    'ACL': 'public-read',
                    'MetadataDirective': 'REPLACE',
                }
                
                if dry_run:
                    self.stdout.write(
                        f'Would update: {video["type"]} - {video["title"]} ({key})'
                    )
                else:
                    # Copy object to itself with new metadata
                    s3_client.copy_object(
                        Bucket=bucket_name,
                        CopySource={'Bucket': bucket_name, 'Key': key},
                        Key=key,
                        **new_metadata
                    )
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Updated: {video["type"]} - {video["title"]}'
                        )
                    )
                    updated_count += 1
                    
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', 'Unknown')
                if error_code == '404' or error_code == 'NoSuchKey':
                    self.stdout.write(
                        self.style.WARNING(
                            f'✗ File not found: {key}'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f'✗ Error updating {key}: {str(e)}'
                        )
                    )
                error_count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'✗ Unexpected error for {key}: {str(e)}'
                    )
                )
                error_count += 1
        
        # Summary
        self.stdout.write('\n' + '='*50)
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f'DRY RUN COMPLETE: Would update {len(video_files)} files'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'OPTIMIZATION COMPLETE:\n'
                    f'  ✓ Updated: {updated_count} files\n'
                    f'  ✗ Errors: {error_count} files'
                )
            )

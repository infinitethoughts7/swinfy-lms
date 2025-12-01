"""
Progress Repository - All database operations for Progress models.

Single Responsibility: ONLY database queries, NO business logic.
"""
from typing import Optional, Tuple
from django.db.models import QuerySet, Avg
from django.utils import timezone

from ..models import CourseProgress, LessonProgress, Enrollment, Lesson, CourseModule


class ProgressRepository:
    """
    Repository for CourseProgress and LessonProgress database operations.
    """
    
    # ==================== COURSE PROGRESS ====================
    
    @staticmethod
    def get_or_create_course_progress(enrollment: Enrollment) -> Tuple[CourseProgress, bool]:
        """Get or create course progress for an enrollment."""
        return CourseProgress.objects.get_or_create(
            enrollment=enrollment,
            defaults={'overall_progress': 0.0}
        )
    
    @staticmethod
    def find_course_progress_by_enrollment(enrollment: Enrollment) -> Optional[CourseProgress]:
        """Find course progress for a specific enrollment."""
        try:
            return CourseProgress.objects.get(enrollment=enrollment)
        except CourseProgress.DoesNotExist:
            return None
    
    @staticmethod
    def find_by_learner(user) -> QuerySet:
        """Get all course progress for a learner."""
        return CourseProgress.objects.filter(
            enrollment__learner=user
        ).select_related('enrollment', 'enrollment__course')
    
    @staticmethod
    def get_all() -> QuerySet:
        """Get all course progress records."""
        return CourseProgress.objects.all()
    
    @staticmethod
    def get_total_count() -> int:
        """Get total count of progress records."""
        return CourseProgress.objects.count()
    
    @staticmethod
    def get_completed_count() -> int:
        """Get count of completed courses (100% progress)."""
        return CourseProgress.objects.filter(overall_progress=100).count()
    
    @staticmethod
    def get_average_progress() -> float:
        """Get average progress across all enrollments."""
        result = CourseProgress.objects.aggregate(avg=Avg('overall_progress'))
        return result['avg'] or 0.0
    
    # ==================== LESSON PROGRESS ====================
    
    @staticmethod
    def get_or_create_lesson_progress(enrollment: Enrollment, lesson: Lesson) -> Tuple[LessonProgress, bool]:
        """Get or create lesson progress for an enrollment and lesson."""
        return LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson,
            defaults={'is_completed': False, 'is_started': False}
        )
    
    @staticmethod
    def find_lesson_progress(enrollment: Enrollment, lesson: Lesson) -> Optional[LessonProgress]:
        """Find lesson progress for specific enrollment and lesson."""
        try:
            return LessonProgress.objects.get(enrollment=enrollment, lesson=lesson)
        except LessonProgress.DoesNotExist:
            return None
    
    @staticmethod
    def find_by_enrollment(enrollment: Enrollment) -> QuerySet:
        """Get all lesson progress for an enrollment."""
        return LessonProgress.objects.filter(
            enrollment=enrollment
        ).select_related('lesson', 'lesson__module')
    
    @staticmethod
    def get_completed_lessons_count(enrollment: Enrollment) -> int:
        """Get count of completed lessons for an enrollment."""
        return LessonProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).count()
    
    @staticmethod
    def mark_lesson_started(lesson_progress: LessonProgress) -> LessonProgress:
        """Mark a lesson as started."""
        lesson_progress.is_started = True
        lesson_progress.started_at = timezone.now()
        lesson_progress.last_accessed = timezone.now()
        lesson_progress.save()
        return lesson_progress
    
    @staticmethod
    def mark_lesson_completed(lesson_progress: LessonProgress) -> LessonProgress:
        """Mark a lesson as completed."""
        lesson_progress.is_completed = True
        lesson_progress.completed_at = timezone.now()
        lesson_progress.save()
        return lesson_progress
    
    @staticmethod
    def update_last_accessed(lesson_progress: LessonProgress) -> LessonProgress:
        """Update last accessed timestamp."""
        lesson_progress.last_accessed = timezone.now()
        lesson_progress.save(update_fields=['last_accessed'])
        return lesson_progress
    
    # ==================== LESSON QUERIES ====================
    
    @staticmethod
    def get_total_lessons_count(enrollment: Enrollment) -> int:
        """Get total number of lessons in the course."""
        return Lesson.objects.filter(
            module__course=enrollment.course
        ).count()
    
    @staticmethod
    def get_lessons_by_module(module: CourseModule) -> QuerySet:
        """Get all lessons for a module."""
        return Lesson.objects.filter(
            module=module
        ).order_by('order')
    
    @staticmethod
    def get_next_incomplete_lesson(enrollment: Enrollment) -> Optional[Lesson]:
        """Get the next incomplete lesson for an enrollment."""
        # Get all lessons in course ordered by module and lesson order
        all_lessons = Lesson.objects.filter(
            module__course=enrollment.course
        ).order_by('module__order', 'order')
        
        # Get completed lesson IDs
        completed_lesson_ids = LessonProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).values_list('lesson_id', flat=True)
        
        # Find first lesson that's not completed
        for lesson in all_lessons:
            if lesson.id not in completed_lesson_ids:
                return lesson
        
        return None
    
    @staticmethod
    def get_module_lessons_count(enrollment: Enrollment, module: CourseModule) -> Tuple[int, int]:
        """Get total and completed lessons count for a module.
        
        Returns:
            Tuple: (total_lessons, completed_lessons)
        """
        total = Lesson.objects.filter(module=module).count()
        completed = LessonProgress.objects.filter(
            enrollment=enrollment,
            lesson__module=module,
            is_completed=True
        ).count()
        
        return total, completed

"""
Progress Service - Business logic for tracking learner progress.

Single Responsibility: Progress tracking only.
"""
from typing import Tuple, Optional, Dict
from django.utils import timezone

from ..repositories.progress_repository import ProgressRepository
from ..repositories.enrollment_repository import EnrollmentRepository
from ..models import Enrollment, Lesson, CourseProgress, LessonProgress, CourseModule


class ProgressService:
    """
    Service for Progress business logic.
    
    Handles: track progress, mark lessons complete, calculate stats.
    """
    
    def __init__(self):
        self.progress_repo = ProgressRepository()
        self.enrollment_repo = EnrollmentRepository()
    
    # ==================== LESSON PROGRESS ====================
    
    def start_lesson(self, enrollment: Enrollment, lesson: Lesson) -> Tuple[bool, Optional[LessonProgress], Optional[str]]:
        """
        Mark a lesson as started.
        
        Returns:
            Tuple: (success, lesson_progress, error_message)
        """
        # Get or create lesson progress
        lesson_progress, created = self.progress_repo.get_or_create_lesson_progress(
            enrollment, lesson
        )
        
        # Mark as started
        if not lesson_progress.is_started:
            self.progress_repo.mark_lesson_started(lesson_progress)
        else:
            # Just update last accessed
            self.progress_repo.update_last_accessed(lesson_progress)
        
        # Update course progress
        self._update_course_progress(enrollment)
        
        return True, lesson_progress, None
    
    def complete_lesson(self, enrollment: Enrollment, lesson: Lesson) -> Tuple[bool, Optional[LessonProgress], Optional[str]]:
        """
        Mark a lesson as completed.
        
        Returns:
            Tuple: (success, lesson_progress, error_message)
        """
        # Get or create lesson progress
        lesson_progress, created = self.progress_repo.get_or_create_lesson_progress(
            enrollment, lesson
        )
        
        # Mark as completed
        if not lesson_progress.is_completed:
            self.progress_repo.mark_lesson_completed(lesson_progress)
        
        # Update course progress
        self._update_course_progress(enrollment)
        
        return True, lesson_progress, None
    
    def get_lesson_progress(self, enrollment: Enrollment, lesson: Lesson) -> Optional[LessonProgress]:
        """Get progress for a specific lesson."""
        return self.progress_repo.find_lesson_progress(enrollment, lesson)
    
    # ==================== COURSE PROGRESS ====================
    
    def get_course_progress(self, enrollment: Enrollment) -> CourseProgress:
        """Get or create course progress for an enrollment."""
        course_progress, created = self.progress_repo.get_or_create_course_progress(enrollment)
        
        if created:
            self._update_course_progress(enrollment)
        
        return course_progress
    
    def _update_course_progress(self, enrollment: Enrollment) -> None:
        """
        Update overall course progress based on completed lessons.
        
        Business Logic:
        - Calculate percentage of completed lessons
        - Update enrollment status if needed
        - Mark as completed if 100%
        """
        # Get total lessons in course
        from ..models import Lesson
        total_lessons = Lesson.objects.filter(
            module__course=enrollment.course
        ).count()
        
        if total_lessons == 0:
            return
        
        # Get completed lessons count
        completed_count = self.progress_repo.get_completed_lessons_count(enrollment)
        
        # Calculate percentage
        progress_percentage = round((completed_count / total_lessons) * 100, 2)
        
        # Update enrollment progress
        enrollment.progress_percentage = progress_percentage
        
        # Update status based on progress
        if enrollment.status == 'approved' and completed_count > 0:
            enrollment.status = 'active'
        
        if progress_percentage >= 100 and enrollment.status != 'completed':
            enrollment.status = 'completed'
            enrollment.completion_date = timezone.now()
        
        enrollment.save(update_fields=['progress_percentage', 'status', 'completion_date'])
        
        # Update CourseProgress record
        course_progress, _ = self.progress_repo.get_or_create_course_progress(enrollment)
        course_progress.overall_progress = progress_percentage
        course_progress.save(update_fields=['overall_progress'])
    
    # ==================== ANALYTICS ====================
    
    def get_learner_analytics(self, user) -> dict:
        """
        Get progress analytics for a learner.
        
        Returns:
            dict: Analytics data
        """
        progress_records = self.progress_repo.find_by_learner(user)
        
        total = progress_records.count()
        completed = progress_records.filter(overall_progress=100).count()
        in_progress = progress_records.filter(overall_progress__gt=0, overall_progress__lt=100).count()
        not_started = progress_records.filter(overall_progress=0).count()
        
        avg_progress = self.progress_repo.get_average_progress() if total > 0 else 0
        
        return {
            'total_courses': total,
            'completed_courses': completed,
            'in_progress_courses': in_progress,
            'not_started_courses': not_started,
            'average_progress': round(avg_progress, 2),
            'completion_rate': round((completed / total * 100), 2) if total > 0 else 0
        }
    
    def get_course_analytics(self) -> dict:
        """
        Get overall course progress analytics.
        
        Returns:
            dict: Analytics data
        """
        total_records = self.progress_repo.get_total_count()
        completed = self.progress_repo.get_completed_count()
        
        return {
            'total_progress_records': total_records,
            'completed_courses': completed,
            'completion_rate': round((completed / total_records * 100), 2) if total_records > 0 else 0
        }
    
    # ==================== MODULE PROGRESS ====================
    
    def get_module_progress(self, enrollment: Enrollment, module: CourseModule) -> Dict:
        """
        Get progress for a specific module.
        
        Returns:
            dict: {
                'total_lessons': int,
                'completed_lessons': int,
                'percentage': float
            }
        """
        total, completed = self.progress_repo.get_module_lessons_count(enrollment, module)
        
        percentage = round((completed / total * 100), 2) if total > 0 else 0.0
        
        return {
            'total_lessons': total,
            'completed_lessons': completed,
            'percentage': percentage
        }
    
    # ==================== NEXT LESSON ====================
    
    def get_next_lesson(self, enrollment: Enrollment) -> Optional[Lesson]:
        """
        Find the next uncompleted lesson for an enrollment.
        
        Returns:
            Lesson or None if all lessons are completed
        """
        return self.progress_repo.get_next_incomplete_lesson(enrollment)
    
    # ==================== PROGRESS SUMMARY ====================
    
    def get_learner_progress_summary(self, enrollment: Enrollment) -> Dict:
        """
        Get comprehensive progress summary for a learner.
        
        Returns:
            dict: {
                'overall_progress': float,
                'lessons_completed': int,
                'total_lessons': int,
                'is_completed': bool,
                'next_lesson': Optional[Lesson],
                'current_module': Optional[CourseModule],
                'module_progress': List[dict],
                'days_since_started': int,
                'completion_rate_per_day': float
            }
        """
        # Get or create course progress
        course_progress, created = self.progress_repo.get_or_create_course_progress(enrollment)
        
        if created:
            self._update_course_progress(enrollment)
            course_progress.refresh_from_db()
        
        # Get total lessons
        total_lessons = self.progress_repo.get_total_lessons_count(enrollment)
        
        # Get completed lessons
        completed_lessons = self.progress_repo.get_completed_lessons_count(enrollment)
        
        # Get next lesson
        next_lesson = self.get_next_lesson(enrollment)
        
        # Get current module (from next lesson)
        current_module = next_lesson.module if next_lesson else None
        
        # Get module progress for all modules
        modules = CourseModule.objects.filter(
            course=enrollment.course
        ).order_by('order')
        
        module_progress_list = []
        for module in modules:
            module_progress = self.get_module_progress(enrollment, module)
            module_progress_list.append({
                'module_id': str(module.id),
                'module_title': module.title,
                'total_lessons': module_progress['total_lessons'],
                'completed_lessons': module_progress['completed_lessons'],
                'progress_percentage': module_progress['percentage'],
                'is_completed': module_progress['percentage'] >= 100
            })
        
        # Calculate time metrics
        days_since_started = 0
        if enrollment.start_date:
            days_since_started = (timezone.now() - enrollment.start_date).days
        
        completion_rate_per_day = 0.0
        if days_since_started > 0 and completed_lessons > 0:
            completion_rate_per_day = round(completed_lessons / days_since_started, 2)
        
        return {
            'overall_progress': float(course_progress.overall_progress),
            'lessons_completed': completed_lessons,
            'total_lessons': total_lessons,
            'is_completed': course_progress.overall_progress >= 100,
            'next_lesson': next_lesson,
            'current_module': current_module,
            'module_progress': module_progress_list,
            'days_since_started': days_since_started,
            'completion_rate_per_day': completion_rate_per_day
        }

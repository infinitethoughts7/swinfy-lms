"""
Analytics Views for Instructor and KP Dashboards.

Provides comprehensive analytics data for dashboard charts and statistics.
"""

from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta

from courses.models import Course, CourseModule, Lesson
from courses.models.enrollment import Enrollment
from courses.models.progress import LessonProgress, CourseProgress
from courses.permissions import IsKnowledgePartnerInstructor
from users.models import User, KPProfile, KPInstructorProfile
from payments.models import Payment


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerInstructor])
def instructor_analytics(request):
    """
    Get comprehensive analytics for instructor dashboard.
    
    Returns data matching the instructorAnalyticsData.json structure:
    - instructor_courses: Detailed course stats
    - student_progress_by_course: Progress breakdown
    - course_performance_metrics: Performance data
    - recent_student_activity: Recent lesson completions
    - summary: Aggregated statistics
    """
    user = request.user
    
    # Get all courses by this instructor
    courses = Course.objects.filter(tutor=user).order_by('-created_at')
    
    # Build instructor_courses data
    instructor_courses = []
    student_progress_by_course = []
    course_performance_metrics = []
    
    total_enrollments = 0
    total_students_active = 0
    total_students_completed = 0
    overall_progress_sum = 0
    
    for course in courses:
        enrollments = Enrollment.objects.filter(course=course)
        course_enrollments = enrollments.count()
        total_enrollments += course_enrollments
        
        # Count students by status
        not_started = enrollments.filter(progress_percentage=0).count()
        in_progress = enrollments.filter(progress_percentage__gt=0, progress_percentage__lt=100).count()
        completed = enrollments.filter(progress_percentage__gte=100).count()
        
        total_students_active += in_progress
        total_students_completed += completed
        
        # Calculate average progress
        avg_progress = enrollments.aggregate(avg=Avg('progress_percentage'))['avg'] or 0
        overall_progress_sum += avg_progress * course_enrollments if course_enrollments > 0 else 0
        
        # Completion rate
        completion_rate = (completed / course_enrollments * 100) if course_enrollments > 0 else 0
        
        # Get lesson count
        total_lessons = Lesson.objects.filter(module__course=course).count()
        
        instructor_courses.append({
            'id': str(course.id),
            'title': course.title,
            'slug': course.slug,
            'total_enrollments': course_enrollments,
            'total_lessons': total_lessons,
            'duration_weeks': course.duration_weeks,
            'students_not_started': not_started,
            'students_in_progress': in_progress,
            'students_completed': completed,
            'avg_progress_percentage': round(avg_progress, 1),
            'completion_rate': round(completion_rate, 1),
            'created_at': course.created_at.strftime('%Y-%m-%d')
        })
        
        # Student progress by course
        student_progress_by_course.append({
            'course': course.title,
            'not_started': not_started,
            'in_progress': in_progress,
            'completed': completed,
            'total': course_enrollments
        })
        
        # Course performance metrics
        course_performance_metrics.append({
            'course': course.title,
            'enrollments': course_enrollments,
            'avg_progress': round(avg_progress, 1),
            'completion_rate': round(completion_rate, 1)
        })
    
    # Get recent student activity
    recent_progress = LessonProgress.objects.filter(
        lesson__module__course__tutor=user,
        is_completed=True
    ).select_related(
        'enrollment__learner', 
        'lesson', 
        'lesson__module__course'
    ).order_by('-completed_at')[:10]
    
    recent_student_activity = []
    for progress in recent_progress:
        recent_student_activity.append({
            'student_name': progress.enrollment.learner.full_name,
            'course': progress.lesson.module.course.title,
            'lesson_completed': progress.lesson.title,
            'progress_percentage': float(progress.enrollment.progress_percentage),
            'completed_at': progress.completed_at.isoformat() if progress.completed_at else None
        })
    
    # Calculate overall stats
    total_courses = courses.count()
    overall_completion_rate = (total_students_completed / total_enrollments * 100) if total_enrollments > 0 else 0
    overall_avg_progress = (overall_progress_sum / total_enrollments) if total_enrollments > 0 else 0
    
    # Find best performing course
    most_popular_course = instructor_courses[0]['title'] if instructor_courses else None
    best_performing_course = None
    if instructor_courses:
        best_performing = max(instructor_courses, key=lambda x: x['completion_rate'])
        best_performing_course = best_performing['title']
    
    summary = {
        'total_courses': total_courses,
        'total_enrollments': total_enrollments,
        'total_students_active': total_students_active,
        'total_students_completed': total_students_completed,
        'overall_completion_rate': round(overall_completion_rate, 1),
        'overall_avg_progress': round(overall_avg_progress, 1),
        'most_popular_course': most_popular_course,
        'best_performing_course': best_performing_course
    }
    
    return Response({
        'instructor_courses': instructor_courses,
        'student_progress_by_course': student_progress_by_course,
        'course_performance_metrics': course_performance_metrics,
        'recent_student_activity': recent_student_activity,
        'summary': summary
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def kp_analytics(request):
    """
    Get comprehensive analytics for Knowledge Partner dashboard.
    
    Returns data matching the mockAnalyticsData.json structure:
    - instructors: List with courses count and students
    - courses: Course details with enrollments and revenue
    - monthly_enrollment_trends: Monthly enrollment data
    - course_popularity: Course ranking by students
    - enrollment_vs_revenue: Enrollment and revenue comparison
    - summary: Aggregated statistics
    """
    user = request.user
    
    # Verify user is a KP
    if user.role != 'knowledge_partner':
        return Response(
            {'error': 'Only Knowledge Partners can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get KP profile
    try:
        kp_profile = user.kp_profile
    except KPProfile.DoesNotExist:
        return Response(
            {'error': 'Knowledge Partner profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get instructors data
    instructors_data = []
    instructor_profiles = KPInstructorProfile.objects.filter(knowledge_partner=kp_profile)
    
    for instructor in instructor_profiles:
        instructor_courses = Course.objects.filter(tutor=instructor.user)
        courses_count = instructor_courses.count()
        total_students = Enrollment.objects.filter(course__in=instructor_courses).count()
        
        instructors_data.append({
            'id': str(instructor.id),
            'name': instructor.user.full_name,
            'specialization': instructor.specializations[:50] if instructor.specializations else '',
            'courses_count': courses_count,
            'total_students': total_students
        })
    
    # Get all courses for this KP
    courses = Course.objects.filter(training_partner=kp_profile).order_by('-created_at')
    
    # Build courses data with revenue
    courses_data = []
    course_popularity = []
    enrollment_vs_revenue = []
    
    total_revenue = 0
    total_students = 0
    
    for course in courses:
        enrollments = Enrollment.objects.filter(course=course)
        enrollment_count = enrollments.count()
        total_students += enrollment_count
        
        # Calculate revenue from payments
        course_revenue = Payment.objects.filter(
            enrollment__course=course,
            status__in=['paid', 'verified']
        ).aggregate(total=Sum('amount'))['total'] or 0
        total_revenue += float(course_revenue)
        
        # Get instructor name
        instructor_name = course.tutor.full_name if course.tutor else 'Unknown'
        
        courses_data.append({
            'id': str(course.id),
            'title': course.title,
            'instructor': instructor_name,
            'instructor_id': str(course.tutor.id) if course.tutor else None,
            'category': course.get_category_display(),
            'price': float(course.price),
            'enrollments': enrollment_count,
            'revenue': float(course_revenue),
            'created_month': course.created_at.strftime('%B')
        })
        
        course_popularity.append({
            'course': course.title,
            'students': enrollment_count,
            'category': course.get_category_display()
        })
        
        enrollment_vs_revenue.append({
            'course': course.title,
            'enrollments': enrollment_count,
            'revenue': float(course_revenue)
        })
    
    # Sort course_popularity by students
    course_popularity.sort(key=lambda x: x['students'], reverse=True)
    
    # Get monthly enrollment trends (last 6 months)
    six_months_ago = timezone.now() - timedelta(days=180)
    monthly_trends = {}
    
    # Get top 5 courses for trend tracking
    top_courses = courses.order_by('-enrollment_count')[:5]
    
    for month_offset in range(6):
        month_date = timezone.now() - timedelta(days=30 * month_offset)
        month_name = month_date.strftime('%B')
        monthly_trends[month_name] = {}
        
        for course in top_courses:
            # Count enrollments in this month
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if month_offset > 0:
                next_month = month_start + timedelta(days=32)
                month_end = next_month.replace(day=1)
            else:
                month_end = timezone.now()
            
            count = Enrollment.objects.filter(
                course=course,
                enrollment_date__gte=month_start,
                enrollment_date__lt=month_end
            ).count()
            
            monthly_trends[month_name][course.title] = count
    
    # Calculate summary
    total_courses = courses.count()
    total_instructors = instructor_profiles.count()
    
    # Find most popular and highest revenue course
    most_popular_course = course_popularity[0]['course'] if course_popularity else None
    highest_revenue_course = None
    if enrollment_vs_revenue:
        highest_revenue = max(enrollment_vs_revenue, key=lambda x: x['revenue'])
        highest_revenue_course = highest_revenue['course']
    
    # Average course price
    avg_price = courses.aggregate(avg=Avg('price'))['avg'] or 0
    
    summary = {
        'total_students': total_students,
        'total_courses': total_courses,
        'total_instructors': total_instructors,
        'total_revenue': round(total_revenue, 2),
        'most_popular_course': most_popular_course,
        'highest_revenue_course': highest_revenue_course,
        'average_course_price': round(float(avg_price), 2)
    }
    
    return Response({
        'instructors': instructors_data,
        'courses': courses_data,
        'monthly_enrollment_trends': monthly_trends,
        'course_popularity': course_popularity,
        'enrollment_vs_revenue': enrollment_vs_revenue,
        'summary': summary
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def learner_analytics(request):
    """
    Get analytics for learner dashboard.
    
    Returns:
    - enrolled_courses: List of enrolled courses with progress
    - recent_activity: Recent learning activity
    - summary: Aggregated stats
    """
    user = request.user
    
    if user.role != 'learner':
        return Response(
            {'error': 'Only learners can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get enrollments
    enrollments = Enrollment.objects.filter(learner=user).select_related('course')
    
    enrolled_courses = []
    total_completed = 0
    total_in_progress = 0
    
    for enrollment in enrollments:
        course = enrollment.course
        
        # Get lesson progress
        total_lessons = Lesson.objects.filter(module__course=course).count()
        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).count()
        
        is_completed = enrollment.progress_percentage >= 100
        if is_completed:
            total_completed += 1
        elif enrollment.progress_percentage > 0:
            total_in_progress += 1
        
        enrolled_courses.append({
            'id': str(course.id),
            'title': course.title,
            'slug': course.slug,
            'progress_percentage': float(enrollment.progress_percentage),
            'status': enrollment.status,
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'enrollment_date': enrollment.enrollment_date.isoformat(),
            'last_accessed': enrollment.last_accessed.isoformat() if enrollment.last_accessed else None
        })
    
    # Get recent activity
    recent_progress = LessonProgress.objects.filter(
        enrollment__learner=user
    ).select_related('lesson', 'lesson__module__course').order_by('-updated_at')[:10]
    
    recent_activity = []
    for progress in recent_progress:
        recent_activity.append({
            'lesson_title': progress.lesson.title,
            'course_title': progress.lesson.module.course.title,
            'action': 'completed' if progress.is_completed else 'started',
            'timestamp': progress.updated_at.isoformat()
        })
    
    summary = {
        'total_enrollments': enrollments.count(),
        'courses_completed': total_completed,
        'courses_in_progress': total_in_progress,
        'courses_not_started': enrollments.count() - total_completed - total_in_progress
    }
    
    return Response({
        'enrolled_courses': enrolled_courses,
        'recent_activity': recent_activity,
        'summary': summary
    })

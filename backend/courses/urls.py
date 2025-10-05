from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views.instructor_views import (
    InstructorCourseListCreateView,
    InstructorCourseDetailView,
    InstructorModuleListCreateView,
    InstructorModuleDetailView,
    InstructorLessonListCreateView,
    InstructorLessonDetailView,
    InstructorLessonMaterialListCreateView,
    InstructorLessonMaterialDetailView,
    InstructorCourseResourceListCreateView,
    InstructorCourseResourceDetailView,
    instructor_dashboard_stats,
    instructor_learner_progress,
    submit_course_for_approval,
    course_analytics
)


# Create router for API views
router = DefaultRouter()

urlpatterns = [
    # KP Instructor Management
    path('instructor/dashboard/stats/', instructor_dashboard_stats, name='instructor-dashboard-stats'),
    path('instructor/dashboard/learner-progress/', instructor_learner_progress, name='instructor-learner-progress'),
    path('instructor/courses/', InstructorCourseListCreateView.as_view(), name='instructor-course-list-create'),
    path('instructor/courses/<slug:slug>/', InstructorCourseDetailView.as_view(), name='instructor-course-detail'),
    path('instructor/courses/<slug:course_slug>/submit-approval/', submit_course_for_approval, name='instructor-submit-course-approval'),
    path('instructor/courses/<slug:course_slug>/analytics/', course_analytics, name='instructor-course-analytics'),
    path('instructor/courses/<slug:course_slug>/modules/', InstructorModuleListCreateView.as_view(), name='instructor-module-list-create'),
    path('instructor/modules/<uuid:id>/', InstructorModuleDetailView.as_view(), name='instructor-module-detail'),
    path('instructor/courses/<slug:course_slug>/modules/<uuid:module_id>/lessons/', InstructorLessonListCreateView.as_view(), name='instructor-lesson-list-create'),
    path('instructor/lessons/<uuid:id>/', InstructorLessonDetailView.as_view(), name='instructor-lesson-detail'),
    path('instructor/lessons/<uuid:lesson_id>/materials/', InstructorLessonMaterialListCreateView.as_view(), name='instructor-material-list-create'),
    path('instructor/materials/<uuid:id>/', InstructorLessonMaterialDetailView.as_view(), name='instructor-material-detail'),
    path('instructor/courses/<slug:course_slug>/resources/', InstructorCourseResourceListCreateView.as_view(), name='instructor-resource-list-create'),
    path('instructor/resources/<uuid:id>/', InstructorCourseResourceDetailView.as_view(), name='instructor-resource-detail'),
    
    # Course endpoints
    path('', views.CourseListView.as_view(), name='course-list'),
    path('search/', views.CourseSearchView.as_view(), name='course-search'),
    path('featured/', views.FeaturedCoursesView.as_view(), name='featured-courses'),
    path('my-courses/', views.MyCoursesView.as_view(), name='my-courses'),
    path('stats/', views.CourseStatsView.as_view(), name='course-stats'),
    
    # Analytics endpoints
    path('analytics/weekly-activity/', views.weekly_activity_analytics, name='weekly-activity-analytics'),
    path('analytics/learner-distribution/', views.learner_distribution_analytics, name='learner-distribution-analytics'),
    
    # Notifications (must be before catch-all slug pattern)
    path('notifications/', views.notification_list, name='notifications'),
    path('notifications-class/', views.NotificationView.as_view(), name='notifications-class'),
    path('notifications/<int:notification_id>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    
    # Course CRUD operations
    path('create/', views.CourseCreateView.as_view(), name='course-create'),
    path('<slug:slug>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('<slug:slug>/update/', views.CourseUpdateView.as_view(), name='course-update'),
    path('<slug:slug>/delete/', views.CourseDeleteView.as_view(), name='course-delete'),
    path('<slug:slug>/approve/', views.CourseApprovalView.as_view(), name='course-approve'),
    
    # Course Learning Endpoints
    path('<slug:slug>/enroll/', views.CourseEnrollView.as_view(), name='course-enroll'),
    path('<slug:slug>/enrollment-status/', views.enrollment_status, name='enrollment-status'),
    path('<slug:slug>/modules/', views.CourseModulesView.as_view(), name='course-modules'),
    path('<slug:slug>/progress/', views.CourseProgressView.as_view(), name='course-progress'),
    path('<slug:slug>/modules/<uuid:module_id>/lessons/', views.ModuleLessonsView.as_view(), name='module-lessons'),
    
    # Public Course Preview Endpoints
    path('<slug:slug>/preview/modules/', views.PublicCourseModulesView.as_view(), name='public-course-modules'),
    path('<slug:slug>/preview/modules/<uuid:module_id>/lessons/', views.PublicModuleLessonsView.as_view(), name='public-module-lessons'),
    
    # Lesson Endpoints
    path('lessons/<uuid:lesson_id>/complete/', views.LessonCompleteView.as_view(), name='lesson-complete'),
    path('lessons/<uuid:lesson_id>/start/', views.LessonStartView.as_view(), name='lesson-start'),
    path('lessons/<uuid:lesson_id>/materials/', views.LessonMaterialsView.as_view(), name='lesson-materials'),
    path('lessons/<uuid:lesson_id>/video/', views.LessonVideoView.as_view(), name='lesson-video'),
    path('lessons/<uuid:lesson_id>/progress/', views.LessonProgressView.as_view(), name='lesson-progress'),
    path('lessons/<uuid:lesson_id>/materials/upload/', views.LessonMaterialUploadView.as_view(), name='lesson-material-upload'),
    
    # Content Management Endpoints (Tutor/Admin)
    path('<slug:slug>/modules/create/', views.CourseModuleCreateView.as_view(), name='course-module-create'),
    path('modules/<uuid:module_id>/lessons/create/', views.LessonCreateView.as_view(), name='lesson-create'),
    path('<slug:slug>/resources/', views.CourseResourceView.as_view(), name='course-resources'),
    
    # Learner Content Access Endpoints
    path('<slug:slug>/learner-resources/', views.LearnerCourseResourceView.as_view(), name='learner-course-resources'),
    path('<slug:slug>/learner-content/', views.LearnerCourseContentView.as_view(), name='learner-course-content'),
    
    # Analytics Endpoints
    path('analytics/learner-progress/', views.LearnerProgressAnalyticsView.as_view(), name='learner-progress-analytics'),
    path('analytics/course-performance/', views.CoursePerformanceAnalyticsView.as_view(), name='course-performance-analytics'),
    
    # Attendance Endpoints
    path('attendance/', views.AttendanceListView.as_view(), name='attendance-list'),
    path('attendance/mark/', views.AttendanceMarkView.as_view(), name='attendance-mark'),
    path('attendance/instructor-courses/', views.instructor_courses_with_learners, name='instructor-courses-attendance'),
    path('attendance/stats/', views.attendance_stats, name='attendance-stats'),
    
    # Knowledge partner endpoints
    path('knowledge-partners/', views.KnowledgePartnerListView.as_view(), name='knowledge-partner-list'),
    path('knowledge-partners/<int:pk>/', views.KnowledgePartnerDetailView.as_view(), name='knowledge-partner-detail'),
    
    # Live Session endpoints
    path('live-sessions/', include('courses.urls_live_sessions')),
    
    # Legacy endpoints for backward compatibility
    path('legacy/list/', views.course_list, name='course-list-legacy'),
    path('legacy/stats/', views.course_stats, name='course-stats-legacy'),
    path('legacy/featured/', views.featured_courses, name='featured-courses-legacy'),
]
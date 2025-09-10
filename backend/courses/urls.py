from django.urls import path
from . import views

urlpatterns = [
    # Course listing and details
    path('', views.CourseListView.as_view(), name='course-list'),
    path('stats/', views.course_stats, name='course-stats'),
    path('featured/', views.featured_courses, name='featured-courses'),
    path('my-courses/', views.MyCoursesList.as_view(), name='my-courses'),
    path('create/', views.CourseCreateView.as_view(), name='course-create'),
    path('<slug:slug>/', views.CourseDetailView.as_view(), name='course-detail'),
    
    # Enrollment
    path('<slug:course_slug>/enroll/', views.enroll_in_course, name='course-enroll'),
    path('<slug:course_slug>/drop/', views.drop_course, name='course-drop'),
    path('enrollments/my/', views.StudentEnrollmentsView.as_view(), name='my-enrollments'),
    
    # Reviews
    path('<slug:course_slug>/reviews/', views.CourseReviewListCreateView.as_view(), name='course-reviews'),
]

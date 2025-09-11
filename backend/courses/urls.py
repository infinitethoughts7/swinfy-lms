from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for API views
router = DefaultRouter()

urlpatterns = [
    # Course endpoints
    path('', views.CourseListView.as_view(), name='course-list'),
    path('search/', views.CourseSearchView.as_view(), name='course-search'),
    path('featured/', views.FeaturedCoursesView.as_view(), name='featured-courses'),
    path('my-courses/', views.MyCoursesView.as_view(), name='my-courses'),
    path('stats/', views.CourseStatsView.as_view(), name='course-stats'),
    
    # Course CRUD operations
    path('create/', views.CourseCreateView.as_view(), name='course-create'),
    path('<slug:slug>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('<slug:slug>/update/', views.CourseUpdateView.as_view(), name='course-update'),
    path('<slug:slug>/delete/', views.CourseDeleteView.as_view(), name='course-delete'),
    path('<slug:slug>/approve/', views.CourseApprovalView.as_view(), name='course-approve'),
    
    # Training partner endpoints
    path('training-partners/', views.TrainingPartnerListView.as_view(), name='training-partner-list'),
    path('training-partners/<int:pk>/', views.TrainingPartnerDetailView.as_view(), name='training-partner-detail'),
    
    # Legacy endpoints for backward compatibility
    path('legacy/list/', views.course_list, name='course-list-legacy'),
    path('legacy/stats/', views.course_stats, name='course-stats-legacy'),
    path('legacy/featured/', views.featured_courses, name='featured-courses-legacy'),
    path('legacy/training-partners/', views.training_partner_list, name='training-partner-list-legacy'),
]

# backend/users/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import views

# Import only essential application views
from .views.application_views import (
    KnowledgePartnerApplicationCreateView,
    KnowledgePartnerApplicationListView,
    approve_application,
    reject_application,
)

# Import course review views
from .views.course_review_views import (
    CourseReviewListView,
    CourseReviewDetailView,
    ApprovedCoursesListView,
    approve_course,
    reject_course,
    course_review_stats,
)

# Import profile views
from .views.profile_views import (
    KPProfileView,
    upload_logo,
    remove_logo,
    profile_stats,
)

# Import super admin views
from .views.super_admin_views import (
    DashboardStatsView,
    KnowledgePartnerApplicationListView as SuperAdminKPApplicationListView,
    UserListView,
    approve_kp_application,
    reject_kp_application,
)

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # OTP Verification endpoints
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify_otp'),
    path('resend-otp/', views.ResendOTPView.as_view(), name='resend_otp'),
    
    # Contact Form OTP endpoints (no user account required)
    path('send-contact-form-otp/', views.send_contact_form_otp, name='send_contact_form_otp'),
    path('verify-contact-form-otp/', views.verify_contact_form_otp, name='verify_contact_form_otp'),
    
    # Password reset endpoints
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-reset-otp/', views.VerifyResetOTPView.as_view(), name='verify_reset_otp'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),
    path('send-otp/', views.send_otp, name='send_otp'),
    path('cleanup-otps/', views.cleanup_otps, name='cleanup_otps'),
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/complete/', views.ProfileCompletionView.as_view(), name='profile_completion'),
    path('profile/detail/', views.UserProfileDetailView.as_view(), name='profile_detail'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('verify-email/', views.verify_email, name='verify_email'),
    
    # Utility endpoints
    path('knowledge-partners/', views.get_knowledge_partners, name='knowledge_partners'),
    path('dashboard/', views.dashboard_stats, name='dashboard'),
    
    # KP Instructor management (KP Admin only)
    path('kp/instructors/', views.KPInstructorListCreateView.as_view(), name='kp_instructor_list_create'),
    path('kp/instructors/<uuid:id>/', views.KPInstructorDetailView.as_view(), name='kp_instructor_detail'),
    
    # ==========================================
    # KNOWLEDGE PARTNER APPLICATION - SIMPLIFIED
    # ==========================================
    
    # 1. Submit application from homepage
    path('knowledge-partner/apply/', 
         KnowledgePartnerApplicationCreateView.as_view(), 
         name='kp_application_create'),
    
    # 2. Super admin views pending applications  
    path('admin/applications/', 
         KnowledgePartnerApplicationListView.as_view(), 
         name='kp_application_list'),
    
    # 3. Super admin approves application
    path('admin/applications/<uuid:application_id>/approve/', 
         approve_application, 
         name='kp_application_approve'),
    
    # 4. Super admin rejects application
    path('admin/applications/<uuid:application_id>/reject/', 
         reject_application, 
         name='kp_application_reject'),
    
    # Course Review endpoints (KP Admin only)
    path('admin/course-review/', CourseReviewListView.as_view(), name='course_review_list'),
    path('admin/course-review/stats/', course_review_stats, name='course_review_stats'),
    path('admin/course-review/<uuid:course_id>/', CourseReviewDetailView.as_view(), name='course_review_detail'),
    path('admin/course-review/<uuid:course_id>/approve/', approve_course, name='course_approve'),
    path('admin/course-review/<uuid:course_id>/reject/', reject_course, name='course_reject'),
    
    # Approved Courses endpoints (KP Admin only)
    path('admin/courses/', ApprovedCoursesListView.as_view(), name='approved_courses_list'),
    
    # Profile Management endpoints (KP Admin only)
    path('admin/profile/', KPProfileView.as_view(), name='kp_profile'),
    path('admin/profile/upload-logo/', upload_logo, name='upload_logo'),
    path('admin/profile/remove-logo/', remove_logo, name='remove_logo'),
    path('admin/profile/stats/', profile_stats, name='profile_stats'),
    
    # Super Admin endpoints
    path('super-admin/dashboard/stats/', DashboardStatsView.as_view(), name='super_admin_dashboard_stats'),
    path('super-admin/applications/', SuperAdminKPApplicationListView.as_view(), name='super_admin_applications'),
    path('super-admin/applications/<uuid:application_id>/approve/', approve_kp_application, name='super_admin_approve_application'),
    path('super-admin/applications/<uuid:application_id>/reject/', reject_kp_application, name='super_admin_reject_application'),
    path('super-admin/users/', UserListView.as_view(), name='super_admin_users'),
]
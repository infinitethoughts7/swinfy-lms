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

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/complete/', views.ProfileCompletionView.as_view(), name='profile_completion'),
    path('profile/detail/', views.UserProfileDetailView.as_view(), name='profile_detail'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('verify-email/', views.verify_email, name='verify_email'),
    
    # Utility endpoints
    path('knowledge-partners/', views.get_knowledge_partners, name='knowledge_partners'),
    path('dashboard/', views.dashboard_stats, name='dashboard'),
    
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
]
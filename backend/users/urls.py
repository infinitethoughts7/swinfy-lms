from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

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
]

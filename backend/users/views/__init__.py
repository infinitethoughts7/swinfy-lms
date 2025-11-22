"""
Views module - HTTP handling ONLY

All views follow clean architecture:
- Validate input with serializers
- Call services for business logic
- Return responses
- NO database queries, NO business logic, NO email sending
"""

# Auth views
from .auth_views import (
    RegisterView,
    LoginView,
    LogoutView,
    VerifyOTPView,
    ForgotPasswordView,
    VerifyResetOTPView,
    ResetPasswordView,
    ResendOTPView,
    send_otp,
    send_contact_form_otp,
    verify_contact_form_otp,
    verify_email,
)

# Profile views
from .profile_views import (
    UserProfileView,
    ChangePasswordView,
    ProfileCompletionView,
    UserProfileDetailView,
    KPProfileView,
    upload_logo,
    remove_logo,
    profile_stats,
)

# KP Admin views
from .kp_admin_views import (
    KPInstructorListCreateView,
    KPInstructorDetailView,
    KPLearnerListView,
    KPDashboardView,
)

# Dashboard views
from .dashboard_views import (
    dashboard_stats,
    get_knowledge_partners,
)

# Application views (KP application process)
from .application_views import (
    KnowledgePartnerApplicationCreateView,
    KnowledgePartnerApplicationListView,
    approve_application,
    reject_application,
)

# Course review views
from .course_review_views import (
    CourseReviewListView,
    CourseReviewDetailView,
    ApprovedCoursesListView,
    AllCoursesListView,
    approve_course,
    reject_course,
    course_review_stats,
)

# Super admin views
from .super_admin_views import (
    DashboardStatsView,
    KnowledgePartnerApplicationListView as SuperAdminKPApplicationListView,
    UserListView,
    approve_kp_application,
    reject_kp_application,
)

__all__ = [
    # Auth
    'RegisterView',
    'LoginView',
    'LogoutView',
    'VerifyOTPView',
    'ForgotPasswordView',
    'VerifyResetOTPView',
    'ResetPasswordView',
    'ResendOTPView',
    'send_otp',
    'send_contact_form_otp',
    'verify_contact_form_otp',
    'verify_email',
    # Profile
    'UserProfileView',
    'ChangePasswordView',
    'ProfileCompletionView',
    'UserProfileDetailView',
    'KPProfileView',
    'upload_logo',
    'remove_logo',
    'profile_stats',
    # KP Admin
    'KPInstructorListCreateView',
    'KPInstructorDetailView',
    'KPLearnerListView',
    'KPDashboardView',
    # Dashboard
    'dashboard_stats',
    'get_knowledge_partners',
    # Application
    'KnowledgePartnerApplicationCreateView',
    'KnowledgePartnerApplicationListView',
    'approve_application',
    'reject_application',
    # Course Review
    'CourseReviewListView',
    'CourseReviewDetailView',
    'ApprovedCoursesListView',
    'AllCoursesListView',
    'approve_course',
    'reject_course',
    'course_review_stats',
    # Super Admin
    'DashboardStatsView',
    'SuperAdminKPApplicationListView',
    'UserListView',
    'approve_kp_application',
    'reject_kp_application',
]

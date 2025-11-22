# Auth & OTP serializers
from .auth_serializers import (
    UserRegistrationSerializer,
    ChangePasswordSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer
)

# Profile serializers
from .profile_serializers import (
    UserProfileSerializer,
    KPProfileSerializer,
    LearnerProfileSerializer,
    InstructorProfileSerializer,
    ProfileCompletionSerializer
)

# KP Instructor management serializers
from .kp_instructor_serializers import (
    KPInstructorUserSerializer,
    KPInstructorCreateSerializer,
    KPInstructorListSerializer,
    KPInstructorDetailSerializer,
    KPInstructorUpdateSerializer
)

# Application serializers
from .application_serializer import (
    KnowledgePartnerApplicationCreateSerializer,
    KnowledgePartnerApplicationListSerializer,
    ApplicationApprovalSerializer,
    ApplicationRejectionSerializer
)

__all__ = [
    # Auth
    'UserRegistrationSerializer',
    'ChangePasswordSerializer',
    'SendOTPSerializer',
    'VerifyOTPSerializer',
    'ResendOTPSerializer',
    
    # Profile
    'UserProfileSerializer',
    'KPProfileSerializer',
    'LearnerProfileSerializer',
    'InstructorProfileSerializer',
    'ProfileCompletionSerializer',
    
    # KP Instructor
    'KPInstructorUserSerializer',
    'KPInstructorCreateSerializer',
    'KPInstructorListSerializer',
    'KPInstructorDetailSerializer',
    'KPInstructorUpdateSerializer',
    
    # Application
    'KnowledgePartnerApplicationCreateSerializer',
    'KnowledgePartnerApplicationListSerializer',
    'ApplicationApprovalSerializer',
    'ApplicationRejectionSerializer'
]


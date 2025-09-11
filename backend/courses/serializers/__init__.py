from .course_serializer import (
    CourseSerializer, CourseListSerializer, CourseDetailSerializer, CourseCreateSerializer, 
    CourseUpdateSerializer, CourseApprovalSerializer, CourseAdminSerializer, CourseStatsSerializer
)
from .training_partner_serializer import TrainingPartnerSerializer, TrainingPartnerListSerializer
from .enrollment_serializers import (
    EnrollmentSerializer, EnrollmentCreateSerializer, CourseReviewSerializer,
    CourseWishlistSerializer, CourseNotificationSerializer, LessonProgressSerializer,
    ModuleProgressSerializer, CourseProgressSerializer, StudySessionSerializer,
    EnrollmentStatsSerializer
)
from .content_serializers import (
    CourseModuleSerializer, CourseModuleCreateSerializer, LessonSerializer,
    LessonCreateSerializer, LessonMaterialSerializer, LessonMaterialCreateSerializer,
    CourseResourceSerializer, CourseResourceCreateSerializer, CourseContentSerializer,
    ModuleContentSerializer
)

__all__ = [
    # Course serializers
    'CourseSerializer',
    'CourseListSerializer',
    'CourseDetailSerializer', 
    'CourseCreateSerializer',
    'CourseUpdateSerializer',
    'CourseApprovalSerializer',
    'CourseAdminSerializer',
    'CourseStatsSerializer',
    
    # Training partner serializers
    'TrainingPartnerSerializer',
    'TrainingPartnerListSerializer',
    
    # Enrollment serializers
    'EnrollmentSerializer',
    'EnrollmentCreateSerializer',
    'CourseReviewSerializer',
    'CourseWishlistSerializer',
    'CourseNotificationSerializer',
    'LessonProgressSerializer',
    'ModuleProgressSerializer',
    'CourseProgressSerializer',
    'StudySessionSerializer',
    'EnrollmentStatsSerializer',
    
    # Content serializers
    'CourseModuleSerializer',
    'CourseModuleCreateSerializer',
    'LessonSerializer',
    'LessonCreateSerializer',
    'LessonMaterialSerializer',
    'LessonMaterialCreateSerializer',
    'CourseResourceSerializer',
    'CourseResourceCreateSerializer',
    'CourseContentSerializer',
    'ModuleContentSerializer'
]

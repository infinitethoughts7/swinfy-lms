from .course_serializer import (
    CourseSerializer, CourseListSerializer, CourseDetailSerializer, CourseCreateSerializer, 
    CourseUpdateSerializer, CourseApprovalSerializer, CourseAdminSerializer, CourseStatsSerializer
)
from .training_partner_serializer import KnowledgePartnerSerializer, KnowledgePartnerListSerializer
from .enrollment_serializers import (
    EnrollmentSerializer, EnrollmentCreateSerializer, CourseReviewSerializer,
    CourseWishlistSerializer, CourseNotificationSerializer, LessonProgressSerializer,
    CourseProgressSerializer, EnrollmentStatsSerializer
)
from .content_serializers import (
    CourseModuleSerializer, CourseModuleCreateSerializer, LessonSerializer,
    LessonCreateSerializer, LessonMaterialSerializer, LessonMaterialCreateSerializer,
    CourseResourceSerializer, CourseResourceCreateSerializer, CourseContentSerializer,
    ModuleContentSerializer
)
from .instructor_serializers import (
    InstructorCourseCreateSerializer, InstructorCourseListSerializer, InstructorCourseDetailSerializer,
    InstructorModuleCreateSerializer, InstructorModuleListSerializer,
    InstructorLessonCreateSerializer, InstructorLessonListSerializer, InstructorLessonDetailSerializer,
    InstructorLessonMaterialCreateSerializer, InstructorLessonMaterialListSerializer,
    InstructorCourseResourceCreateSerializer, InstructorCourseResourceListSerializer,
    InstructorCourseStatsSerializer, StudentProgressSummarySerializer
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
    
    # Knowledge partner serializers
    'KnowledgePartnerSerializer',
    'KnowledgePartnerListSerializer',
    
    # Enrollment serializers
    'EnrollmentSerializer',
    'EnrollmentCreateSerializer',
    'CourseReviewSerializer',
    'CourseWishlistSerializer',
    'CourseNotificationSerializer',
    'LessonProgressSerializer',
    'CourseProgressSerializer',
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
    'ModuleContentSerializer',
    
    # Instructor serializers
    'InstructorCourseCreateSerializer',
    'InstructorCourseListSerializer', 
    'InstructorCourseDetailSerializer',
    'InstructorModuleCreateSerializer',
    'InstructorModuleListSerializer',
    'InstructorLessonCreateSerializer',
    'InstructorLessonListSerializer',
    'InstructorLessonDetailSerializer',
    'InstructorLessonMaterialCreateSerializer',
    'InstructorLessonMaterialListSerializer',
    'InstructorCourseResourceCreateSerializer',
    'InstructorCourseResourceListSerializer',
    'InstructorCourseStatsSerializer',
    'StudentProgressSummarySerializer'
]

from .course import (
    CourseSerializer, CourseListSerializer, CourseCreateSerializer, 
    CourseUpdateSerializer, CourseApprovalSerializer, CourseStatsSerializer
)
from .training_partner import TrainingPartnerSerializer, TrainingPartnerListSerializer

__all__ = [
    'CourseSerializer',
    'CourseListSerializer', 
    'CourseCreateSerializer',
    'CourseUpdateSerializer',
    'CourseApprovalSerializer',
    'CourseStatsSerializer',
    'TrainingPartnerSerializer',
    'TrainingPartnerListSerializer'
]

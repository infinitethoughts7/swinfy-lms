"""
Repositories module - Database operations ONLY

All database CRUD operations go here.
NO business logic allowed.
"""

from .otp_repository import OTPRepository
from .user_repository import UserRepository
from .profile_repository import (
    LearnerProfileRepository,
    KPInstructorProfileRepository,
    KPProfileRepository
)

# Create singleton instances
otp_repository = OTPRepository()
user_repository = UserRepository()
learner_profile_repository = LearnerProfileRepository()
instructor_profile_repository = KPInstructorProfileRepository()
kp_profile_repository = KPProfileRepository()

__all__ = [
    'OTPRepository',
    'UserRepository',
    'LearnerProfileRepository',
    'KPInstructorProfileRepository',
    'KPProfileRepository',
    'otp_repository',
    'user_repository',
    'learner_profile_repository',
    'instructor_profile_repository',
    'kp_profile_repository',
]

"""
Profile Service - Business logic for profile operations

Handles profile management workflows: creation, update, validation.
Uses repositories for database operations.
NO direct database queries, NO HTTP handling.
"""

import logging
from typing import Tuple, Optional, Dict
from users.models import User, LearnerProfile, KPInstructorProfile, KPProfile
from users.repositories import (
    learner_profile_repository,
    instructor_profile_repository,
    kp_profile_repository
)

logger = logging.getLogger(__name__)


class ProfileService:
    """
    Profile business logic service.
    
    Orchestrates profile operations using repositories.
    Enforces business rules for profile management.
    """
    
    # ======================
    # LEARNER PROFILE
    # ======================
    
    @staticmethod
    def get_learner_profile(user: User) -> Optional[LearnerProfile]:
        """
        Get learner profile for user.
        
        Args:
            user (User): User instance
            
        Returns:
            LearnerProfile or None
        """
        if user.role != 'learner':
            logger.warning(f"Attempt to get learner profile for non-learner: {user.email}")
            return None
        
        return learner_profile_repository.get_by_user(user)
    
    @staticmethod
    def create_learner_profile(user: User, **profile_data) -> Tuple[bool, str, Optional[LearnerProfile]]:
        """
        Create learner profile.
        
        Business rules:
        - User must be a learner
        - Profile must not already exist
        
        Args:
            user (User): User instance
            **profile_data: Profile fields
            
        Returns:
            Tuple[bool, str, LearnerProfile or None]: (success, message, profile)
        """
        try:
            # Business rule: User must be learner
            if user.role != 'learner':
                return False, "Only learners can have learner profiles", None
            
            # Business rule: Profile must not exist
            if learner_profile_repository.exists_for_user(user):
                return False, "Learner profile already exists", None
            
            # Create profile via repository
            profile = learner_profile_repository.create(user, **profile_data)
            
            logger.info(f"Learner profile created for user: {user.email}")
            return True, "Profile created successfully", profile
            
        except Exception as e:
            logger.error(f"Failed to create learner profile: {str(e)}")
            return False, f"Failed to create profile: {str(e)}", None
    
    @staticmethod
    def update_learner_profile(profile: LearnerProfile, **profile_data) -> Tuple[bool, str]:
        """
        Update learner profile.
        
        Args:
            profile (LearnerProfile): Profile instance
            **profile_data: Fields to update
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            learner_profile_repository.update(profile, **profile_data)
            return True, "Profile updated successfully"
        except Exception as e:
            logger.error(f"Failed to update learner profile: {str(e)}")
            return False, f"Failed to update profile: {str(e)}"
    
    @staticmethod
    def get_or_create_learner_profile(user: User, **profile_data) -> Tuple[bool, str, Optional[LearnerProfile], bool]:
        """
        Get existing learner profile or create new one.
        
        Args:
            user (User): User instance
            **profile_data: Profile fields for creation
            
        Returns:
            Tuple[bool, str, LearnerProfile or None, bool]: (success, message, profile, created)
        """
        # Try to get existing profile
        profile = ProfileService.get_learner_profile(user)
        
        if profile:
            return True, "Profile retrieved", profile, False
        
        # Create new profile
        success, message, profile = ProfileService.create_learner_profile(user, **profile_data)
        return success, message, profile, success
    
    # ======================
    # INSTRUCTOR PROFILE
    # ======================
    
    @staticmethod
    def get_instructor_profile(user: User) -> Optional[KPInstructorProfile]:
        """
        Get instructor profile for user.
        
        Args:
            user (User): User instance
            
        Returns:
            KPInstructorProfile or None
        """
        if user.role != 'knowledge_partner_instructor':
            logger.warning(f"Attempt to get instructor profile for non-instructor: {user.email}")
            return None
        
        return instructor_profile_repository.get_by_user(user)
    
    @staticmethod
    def create_instructor_profile(user: User, knowledge_partner: KPProfile, 
                                  **profile_data) -> Tuple[bool, str, Optional[KPInstructorProfile]]:
        """
        Create instructor profile.
        
        Business rules:
        - User must be an instructor
        - Must have a Knowledge Partner association
        - Required fields: bio, title, highest_education, specializations, technologies
        
        Args:
            user (User): User instance
            knowledge_partner (KPProfile): KP profile instance
            **profile_data: Profile fields
            
        Returns:
            Tuple[bool, str, KPInstructorProfile or None]: (success, message, profile)
        """
        try:
            # Business rule: User must be instructor
            if user.role != 'knowledge_partner_instructor':
                return False, "Only instructors can have instructor profiles", None
            
            # Business rule: Must have KP association
            if not knowledge_partner:
                return False, "Instructor must be associated with a Knowledge Partner", None
            
            # Business rule: Check required fields
            required_fields = ['bio', 'title', 'highest_education', 'specializations', 'technologies']
            missing_fields = [field for field in required_fields if field not in profile_data]
            if missing_fields:
                return False, f"Missing required fields: {', '.join(missing_fields)}", None
            
            # Create profile via repository
            profile = instructor_profile_repository.create(
                user=user,
                knowledge_partner=knowledge_partner,
                **profile_data
            )
            
            logger.info(f"Instructor profile created for user: {user.email}")
            return True, "Profile created successfully", profile
            
        except Exception as e:
            logger.error(f"Failed to create instructor profile: {str(e)}")
            return False, f"Failed to create profile: {str(e)}", None
    
    @staticmethod
    def update_instructor_profile(profile: KPInstructorProfile, **profile_data) -> Tuple[bool, str]:
        """
        Update instructor profile.
        
        Args:
            profile (KPInstructorProfile): Profile instance
            **profile_data: Fields to update
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            instructor_profile_repository.update(profile, **profile_data)
            return True, "Profile updated successfully"
        except Exception as e:
            logger.error(f"Failed to update instructor profile: {str(e)}")
            return False, f"Failed to update profile: {str(e)}"
    
    @staticmethod
    def delete_instructor_profile(profile: KPInstructorProfile) -> Tuple[bool, str]:
        """
        Delete instructor profile.
        
        Args:
            profile (KPInstructorProfile): Profile instance
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            success = instructor_profile_repository.delete(profile)
            if success:
                return True, "Profile deleted successfully"
            else:
                return False, "Failed to delete profile"
        except Exception as e:
            logger.error(f"Failed to delete instructor profile: {str(e)}")
            return False, f"Failed to delete profile: {str(e)}"
    
    # ======================
    # KP PROFILE
    # ======================
    
    @staticmethod
    def get_kp_profile(user: User) -> Optional[KPProfile]:
        """
        Get KP profile for user.
        
        Args:
            user (User): User instance
            
        Returns:
            KPProfile or None
        """
        if user.role != 'knowledge_partner':
            logger.warning(f"Attempt to get KP profile for non-KP: {user.email}")
            return None
        
        return kp_profile_repository.get_by_user(user)
    
    @staticmethod
    def create_kp_profile(user: User, name: str, **profile_data) -> Tuple[bool, str, Optional[KPProfile]]:
        """
        Create KP profile.
        
        Business rules:
        - User must be a knowledge partner
        - Organization name must be unique
        - Required fields: type, description, location
        
        Args:
            user (User): User instance
            name (str): Organization name
            **profile_data: Profile fields
            
        Returns:
            Tuple[bool, str, KPProfile or None]: (success, message, profile)
        """
        try:
            # Business rule: User must be knowledge partner
            if user.role != 'knowledge_partner':
                return False, "Only knowledge partners can have KP profiles", None
            
            # Business rule: Check required fields
            required_fields = ['type', 'description', 'location']
            missing_fields = [field for field in required_fields if field not in profile_data]
            if missing_fields:
                return False, f"Missing required fields: {', '.join(missing_fields)}", None
            
            # Create profile via repository
            profile = kp_profile_repository.create(user=user, name=name, **profile_data)
            
            logger.info(f"KP profile created: {name}")
            return True, "Profile created successfully", profile
            
        except Exception as e:
            logger.error(f"Failed to create KP profile: {str(e)}")
            return False, f"Failed to create profile: {str(e)}", None
    
    @staticmethod
    def update_kp_profile(profile: KPProfile, **profile_data) -> Tuple[bool, str]:
        """
        Update KP profile.
        
        Args:
            profile (KPProfile): Profile instance
            **profile_data: Fields to update
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            kp_profile_repository.update(profile, **profile_data)
            return True, "Profile updated successfully"
        except Exception as e:
            logger.error(f"Failed to update KP profile: {str(e)}")
            return False, f"Failed to update profile: {str(e)}"
    
    @staticmethod
    def get_all_active_kps():
        """
        Get all active Knowledge Partner profiles.
        
        Returns:
            QuerySet: Active KP profiles
        """
        return kp_profile_repository.get_all_active()
    
    # ======================
    # GENERAL PROFILE OPERATIONS
    # ======================
    
    @staticmethod
    def get_profile_for_user(user: User) -> Tuple[bool, Optional[any], str]:
        """
        Get profile for any user (role-specific).
        
        Args:
            user (User): User instance
            
        Returns:
            Tuple[bool, Profile or None, str]: (has_profile, profile, profile_type)
        """
        if user.role == 'learner':
            profile = ProfileService.get_learner_profile(user)
            return (profile is not None, profile, 'learner')
        elif user.role == 'knowledge_partner_instructor':
            profile = ProfileService.get_instructor_profile(user)
            return (profile is not None, profile, 'instructor')
        elif user.role == 'knowledge_partner':
            profile = ProfileService.get_kp_profile(user)
            return (profile is not None, profile, 'kp')
        else:
            return False, None, 'unknown'


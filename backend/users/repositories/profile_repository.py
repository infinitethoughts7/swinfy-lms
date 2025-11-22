"""
Profile Repository - Database operations ONLY

Handles ALL database operations for profile models.
NO business logic, NO email sending, NO validation beyond database constraints.
"""

import logging
from typing import Optional
from django.db.models import QuerySet
from users.models import LearnerProfile, KPInstructorProfile, KPProfile

logger = logging.getLogger(__name__)


class LearnerProfileRepository:
    """Repository for LearnerProfile database operations."""
    
    @staticmethod
    def get_by_user(user) -> Optional[LearnerProfile]:
        """
        Get learner profile by user.
        
        Args:
            user: User instance
            
        Returns:
            LearnerProfile or None
        """
        try:
            return LearnerProfile.objects.get(user=user)
        except LearnerProfile.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error fetching learner profile: {str(e)}")
            return None
    
    @staticmethod
    def create(user, **fields) -> LearnerProfile:
        """
        Create learner profile.
        
        Args:
            user: User instance
            **fields: Profile fields
            
        Returns:
            LearnerProfile: Created profile
        """
        try:
            profile = LearnerProfile.objects.create(user=user, **fields)
            logger.info(f"Learner profile created for user: {user.email}")
            return profile
        except Exception as e:
            logger.error(f"Failed to create learner profile: {str(e)}")
            raise
    
    @staticmethod
    def update(profile: LearnerProfile, **fields) -> LearnerProfile:
        """
        Update learner profile.
        
        Args:
            profile: LearnerProfile instance
            **fields: Fields to update
            
        Returns:
            LearnerProfile: Updated profile
        """
        try:
            for field, value in fields.items():
                setattr(profile, field, value)
            profile.save()
            logger.info(f"Learner profile updated: {profile.user.email}")
            return profile
        except Exception as e:
            logger.error(f"Failed to update learner profile: {str(e)}")
            raise
    
    @staticmethod
    def delete(profile: LearnerProfile) -> bool:
        """
        Delete learner profile.
        
        Args:
            profile: LearnerProfile instance
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            profile.delete()
            logger.info(f"Learner profile deleted")
            return True
        except Exception as e:
            logger.error(f"Failed to delete learner profile: {str(e)}")
            return False
    
    @staticmethod
    def exists_for_user(user) -> bool:
        """
        Check if learner profile exists for user.
        
        Args:
            user: User instance
            
        Returns:
            bool: True if profile exists
        """
        try:
            return LearnerProfile.objects.filter(user=user).exists()
        except Exception as e:
            logger.error(f"Error checking learner profile existence: {str(e)}")
            return False


class KPInstructorProfileRepository:
    """Repository for KPInstructorProfile database operations."""
    
    @staticmethod
    def get_by_user(user) -> Optional[KPInstructorProfile]:
        """
        Get instructor profile by user.
        
        Args:
            user: User instance
            
        Returns:
            KPInstructorProfile or None
        """
        try:
            return KPInstructorProfile.objects.select_related('knowledge_partner').get(user=user)
        except KPInstructorProfile.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error fetching instructor profile: {str(e)}")
            return None
    
    @staticmethod
    def get_by_id(profile_id) -> Optional[KPInstructorProfile]:
        """
        Get instructor profile by ID.
        
        Args:
            profile_id: Profile UUID
            
        Returns:
            KPInstructorProfile or None
        """
        try:
            return KPInstructorProfile.objects.select_related('user', 'knowledge_partner').get(id=profile_id)
        except KPInstructorProfile.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error fetching instructor profile by ID: {str(e)}")
            return None
    
    @staticmethod
    def create(user, knowledge_partner, **fields) -> KPInstructorProfile:
        """
        Create instructor profile.
        
        Args:
            user: User instance
            knowledge_partner: KPProfile instance
            **fields: Profile fields
            
        Returns:
            KPInstructorProfile: Created profile
        """
        try:
            profile = KPInstructorProfile.objects.create(
                user=user,
                knowledge_partner=knowledge_partner,
                **fields
            )
            logger.info(f"Instructor profile created for user: {user.email}")
            return profile
        except Exception as e:
            logger.error(f"Failed to create instructor profile: {str(e)}")
            raise
    
    @staticmethod
    def update(profile: KPInstructorProfile, **fields) -> KPInstructorProfile:
        """
        Update instructor profile.
        
        Args:
            profile: KPInstructorProfile instance
            **fields: Fields to update
            
        Returns:
            KPInstructorProfile: Updated profile
        """
        try:
            for field, value in fields.items():
                setattr(profile, field, value)
            profile.save()
            logger.info(f"Instructor profile updated: {profile.user.email}")
            return profile
        except Exception as e:
            logger.error(f"Failed to update instructor profile: {str(e)}")
            raise
    
    @staticmethod
    def delete(profile: KPInstructorProfile) -> bool:
        """
        Delete instructor profile.
        
        Args:
            profile: KPInstructorProfile instance
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            profile.delete()
            logger.info(f"Instructor profile deleted")
            return True
        except Exception as e:
            logger.error(f"Failed to delete instructor profile: {str(e)}")
            return False
    
    @staticmethod
    def get_by_knowledge_partner(kp_profile) -> QuerySet:
        """
        Get all instructors for a Knowledge Partner.
        
        Args:
            kp_profile: KPProfile instance
            
        Returns:
            QuerySet: Instructor profiles
        """
        try:
            return KPInstructorProfile.objects.filter(
                knowledge_partner=kp_profile
            ).select_related('user').order_by('-created_at')
        except Exception as e:
            logger.error(f"Error fetching instructors by KP: {str(e)}")
            return KPInstructorProfile.objects.none()
    
    @staticmethod
    def search_instructors(kp_profile, search_term: str) -> QuerySet:
        """
        Search instructors within a Knowledge Partner.
        
        Args:
            kp_profile: KPProfile instance
            search_term (str): Search query
            
        Returns:
            QuerySet: Matching instructor profiles
        """
        try:
            from django.db.models import Q
            return KPInstructorProfile.objects.filter(
                knowledge_partner=kp_profile
            ).filter(
                Q(user__full_name__icontains=search_term) |
                Q(user__email__icontains=search_term) |
                Q(title__icontains=search_term)
            ).select_related('user').order_by('-created_at')
        except Exception as e:
            logger.error(f"Error searching instructors: {str(e)}")
            return KPInstructorProfile.objects.none()


class KPProfileRepository:
    """Repository for KPProfile database operations."""
    
    @staticmethod
    def get_by_user(user) -> Optional[KPProfile]:
        """
        Get KP profile by user.
        
        Args:
            user: User instance
            
        Returns:
            KPProfile or None
        """
        try:
            return KPProfile.objects.get(user=user)
        except KPProfile.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error fetching KP profile: {str(e)}")
            return None
    
    @staticmethod
    def get_by_id(profile_id) -> Optional[KPProfile]:
        """
        Get KP profile by ID.
        
        Args:
            profile_id: Profile UUID
            
        Returns:
            KPProfile or None
        """
        try:
            return KPProfile.objects.get(id=profile_id)
        except KPProfile.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error fetching KP profile by ID: {str(e)}")
            return None
    
    @staticmethod
    def create(user, name: str, **fields) -> KPProfile:
        """
        Create KP profile.
        
        Args:
            user: User instance
            name (str): Organization name
            **fields: Profile fields
            
        Returns:
            KPProfile: Created profile
        """
        try:
            profile = KPProfile.objects.create(user=user, name=name, **fields)
            logger.info(f"KP profile created: {name}")
            return profile
        except Exception as e:
            logger.error(f"Failed to create KP profile: {str(e)}")
            raise
    
    @staticmethod
    def update(profile: KPProfile, **fields) -> KPProfile:
        """
        Update KP profile.
        
        Args:
            profile: KPProfile instance
            **fields: Fields to update
            
        Returns:
            KPProfile: Updated profile
        """
        try:
            for field, value in fields.items():
                setattr(profile, field, value)
            profile.save()
            logger.info(f"KP profile updated: {profile.name}")
            return profile
        except Exception as e:
            logger.error(f"Failed to update KP profile: {str(e)}")
            raise
    
    @staticmethod
    def delete(profile: KPProfile) -> bool:
        """
        Delete KP profile.
        
        Args:
            profile: KPProfile instance
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            profile.delete()
            logger.info(f"KP profile deleted")
            return True
        except Exception as e:
            logger.error(f"Failed to delete KP profile: {str(e)}")
            return False
    
    @staticmethod
    def get_all_active() -> QuerySet:
        """
        Get all active KP profiles.
        
        Returns:
            QuerySet: Active KP profiles
        """
        try:
            return KPProfile.objects.filter(is_active=True).order_by('name')
        except Exception as e:
            logger.error(f"Error fetching active KP profiles: {str(e)}")
            return KPProfile.objects.none()
    
    @staticmethod
    def get_pending_verification() -> QuerySet:
        """
        Get all KP profiles pending verification.
        
        Returns:
            QuerySet: Pending KP profiles
        """
        try:
            return KPProfile.objects.filter(is_verified=False).order_by('-created_at')
        except Exception as e:
            logger.error(f"Error fetching pending KP profiles: {str(e)}")
            return KPProfile.objects.none()


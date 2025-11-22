"""
Knowledge Partner Service - Business logic for KP operations

Handles KP-specific workflows: instructor management, learner access, etc.
Uses repositories for database operations, services for complex operations.
NO direct database queries, NO HTTP handling.
"""

import logging
import secrets
import string
from typing import Tuple, Optional, Dict
from users.models import User, KPProfile, KPInstructorProfile
from users.repositories import (
    user_repository,
    instructor_profile_repository,
    kp_profile_repository
)

logger = logging.getLogger(__name__)


class KPService:
    """
    Knowledge Partner business logic service.
    
    Orchestrates KP-specific operations.
    Handles instructor management, learner tracking, etc.
    """
    
    @staticmethod
    def generate_temp_password(length: int = 12) -> str:
        """
        Generate temporary password for new instructors.
        
        Args:
            length (int): Password length
            
        Returns:
            str: Random password
        """
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        return password
    
    @staticmethod
    def create_instructor(kp_profile: KPProfile, email: str, full_name: str,
                         bio: str, title: str, highest_education: str,
                         specializations: str, technologies: str,
                         **additional_fields) -> Tuple[bool, str, Optional[User], Optional[str]]:
        """
        Create instructor user and profile.
        
        Business rules:
        - Email must be unique
        - Creates both User and KPInstructorProfile
        - Generates temporary password
        - User needs KP admin approval
        
        Args:
            kp_profile (KPProfile): Knowledge Partner profile
            email (str): Instructor email
            full_name (str): Instructor full name
            bio (str): Instructor bio
            title (str): Job title
            highest_education (str): Education level
            specializations (str): Areas of expertise
            technologies (str): Technologies they teach
            **additional_fields: Additional profile fields
            
        Returns:
            Tuple[bool, str, User or None, temp_password or None]: 
                (success, message, user, temp_password)
        """
        try:
            # Business rule: Check if email already exists
            if user_repository.exists_by_email(email):
                logger.warning(f"Attempt to create instructor with existing email: {email}")
                return False, "User with this email already exists", None, None
            
            # Generate temporary password
            temp_password = KPService.generate_temp_password()
            
            # Create user
            user = user_repository.create_user(
                email=email,
                full_name=full_name,
                password=temp_password,
                role='knowledge_partner_instructor',
                is_verified=True,  # Pre-verified by KP admin
                is_approved=False,  # Needs KP admin approval
                is_active=True
            )
            
            # Create instructor profile
            profile = instructor_profile_repository.create(
                user=user,
                knowledge_partner=kp_profile,
                bio=bio,
                title=title,
                highest_education=highest_education,
                specializations=specializations,
                technologies=technologies,
                **additional_fields
            )
            
            logger.info(f"Instructor created: {email} for KP: {kp_profile.name}")
            return True, "Instructor created successfully", user, temp_password
            
        except Exception as e:
            logger.error(f"Failed to create instructor: {str(e)}")
            return False, f"Failed to create instructor: {str(e)}", None, None
    
    @staticmethod
    def update_instructor(profile: KPInstructorProfile, 
                         **profile_data) -> Tuple[bool, str]:
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
            logger.info(f"Instructor updated: {profile.user.email}")
            return True, "Instructor updated successfully"
        except Exception as e:
            logger.error(f"Failed to update instructor: {str(e)}")
            return False, f"Failed to update instructor: {str(e)}"
    
    @staticmethod
    def delete_instructor(profile: KPInstructorProfile) -> Tuple[bool, str]:
        """
        Delete instructor (both profile and user).
        
        Args:
            profile (KPInstructorProfile): Profile instance
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            user = profile.user
            
            # Delete profile
            instructor_profile_repository.delete(profile)
            
            # Delete user
            user_repository.delete_user(user)
            
            logger.info(f"Instructor deleted: {user.email}")
            return True, "Instructor deleted successfully"
            
        except Exception as e:
            logger.error(f"Failed to delete instructor: {str(e)}")
            return False, f"Failed to delete instructor: {str(e)}"
    
    @staticmethod
    def get_instructors(kp_profile: KPProfile, search_term: Optional[str] = None):
        """
        Get instructors for a Knowledge Partner.
        
        Args:
            kp_profile (KPProfile): Knowledge Partner profile
            search_term (str, optional): Search query
            
        Returns:
            QuerySet: Instructor profiles
        """
        if search_term:
            return instructor_profile_repository.search_instructors(kp_profile, search_term)
        else:
            return instructor_profile_repository.get_by_knowledge_partner(kp_profile)
    
    @staticmethod
    def approve_instructor(profile: KPInstructorProfile) -> Tuple[bool, str]:
        """
        Approve instructor (KP admin approval).
        
        Args:
            profile (KPInstructorProfile): Profile instance
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            user = profile.user
            success = user_repository.mark_as_approved(user)
            
            if success:
                logger.info(f"Instructor approved: {user.email}")
                return True, "Instructor approved successfully"
            else:
                return False, "Failed to approve instructor"
                
        except Exception as e:
            logger.error(f"Failed to approve instructor: {str(e)}")
            return False, f"Failed to approve instructor: {str(e)}"
    
    @staticmethod
    def reject_instructor(profile: KPInstructorProfile) -> Tuple[bool, str]:
        """
        Reject instructor (delete user and profile).
        
        Args:
            profile (KPInstructorProfile): Profile instance
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        # Rejecting = deleting
        return KPService.delete_instructor(profile)
    
    @staticmethod
    def get_instructor_stats(kp_profile: KPProfile) -> Dict:
        """
        Get instructor statistics for a Knowledge Partner.
        
        Args:
            kp_profile (KPProfile): Knowledge Partner profile
            
        Returns:
            dict: Statistics
        """
        try:
            instructors = instructor_profile_repository.get_by_knowledge_partner(kp_profile)
            
            total_instructors = instructors.count()
            available_instructors = instructors.filter(is_available=True).count()
            approved_instructors = instructors.filter(user__is_approved=True).count()
            pending_instructors = instructors.filter(user__is_approved=False).count()
            
            return {
                'total_instructors': total_instructors,
                'available_instructors': available_instructors,
                'approved_instructors': approved_instructors,
                'pending_instructors': pending_instructors,
            }
            
        except Exception as e:
            logger.error(f"Failed to get instructor stats: {str(e)}")
            return {
                'total_instructors': 0,
                'available_instructors': 0,
                'approved_instructors': 0,
                'pending_instructors': 0,
            }
    
    @staticmethod
    def verify_kp_admin_access(user: User, kp_profile: KPProfile) -> bool:
        """
        Verify that user is the admin of the given KP.
        
        Args:
            user (User): User instance
            kp_profile (KPProfile): KP profile instance
            
        Returns:
            bool: True if user is admin of this KP
        """
        if user.role != 'knowledge_partner':
            return False
        
        user_kp = kp_profile_repository.get_by_user(user)
        if not user_kp:
            return False
        
        return user_kp.id == kp_profile.id
    
    @staticmethod
    def get_kp_dashboard_stats(kp_profile: KPProfile) -> Dict:
        """
        Get dashboard statistics for Knowledge Partner.
        
        Args:
            kp_profile (KPProfile): Knowledge Partner profile
            
        Returns:
            dict: Dashboard statistics
        """
        try:
            # Get instructor stats
            instructor_stats = KPService.get_instructor_stats(kp_profile)
            
            # TODO: Add course stats, enrollment stats when course models are available
            
            return {
                **instructor_stats,
                'kp_name': kp_profile.name,
                'kp_type': kp_profile.get_type_display(),
                'is_verified': kp_profile.is_verified,
                'is_active': kp_profile.is_active,
            }
            
        except Exception as e:
            logger.error(f"Failed to get KP dashboard stats: {str(e)}")
            return {}


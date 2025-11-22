"""
User Repository - Database operations ONLY

Handles ALL database operations for User model.
NO business logic, NO email sending, NO validation beyond database constraints.
"""

import logging
from typing import Optional, List
from django.db.models import Q, QuerySet
from users.models import User

logger = logging.getLogger(__name__)


class UserRepository:
    """
    Repository for User database operations.
    
    Follows Single Responsibility Principle (SRP) - ONLY data access.
    All business logic belongs in services layer.
    """
    
    @staticmethod
    def get_by_id(user_id) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            user_id: User UUID
            
        Returns:
            User or None
        """
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error fetching user by ID {user_id}: {str(e)}")
            return None
    
    @staticmethod
    def get_by_email(email: str) -> Optional[User]:
        """
        Get user by email (case-insensitive).
        
        Args:
            email (str): Email address
            
        Returns:
            User or None
        """
        try:
            return User.objects.filter(email__iexact=email).first()
        except Exception as e:
            logger.error(f"Error fetching user by email {email}: {str(e)}")
            return None
    
    @staticmethod
    def exists_by_email(email: str) -> bool:
        """
        Check if user exists with given email.
        
        Args:
            email (str): Email address
            
        Returns:
            bool: True if user exists
        """
        try:
            return User.objects.filter(email__iexact=email).exists()
        except Exception as e:
            logger.error(f"Error checking user existence for {email}: {str(e)}")
            return False
    
    @staticmethod
    def create_user(email: str, full_name: str, password: str, role: str, 
                   is_verified: bool = False, is_approved: bool = True,
                   is_active: bool = True, **extra_fields) -> User:
        """
        Create a new user.
        
        Args:
            email (str): User email
            full_name (str): User full name
            password (str): User password (will be hashed)
            role (str): User role (learner, knowledge_partner, etc.)
            is_verified (bool): Email verification status
            is_approved (bool): Admin approval status
            is_active (bool): Account active status
            **extra_fields: Additional fields
            
        Returns:
            User: Created user instance
            
        Raises:
            Exception: If user creation fails
        """
        try:
            user = User.objects.create_user(
                email=email,
                full_name=full_name,
                password=password,
                role=role,
                is_verified=is_verified,
                is_approved=is_approved,
                is_active=is_active,
                **extra_fields
            )
            logger.info(f"User created: {email} (role: {role})")
            return user
        except Exception as e:
            logger.error(f"Failed to create user {email}: {str(e)}")
            raise
    
    @staticmethod
    def update_user(user: User, **fields) -> User:
        """
        Update user fields.
        
        Args:
            user (User): User instance to update
            **fields: Fields to update
            
        Returns:
            User: Updated user instance
        """
        try:
            for field, value in fields.items():
                setattr(user, field, value)
            user.save()
            logger.info(f"User updated: {user.email}")
            return user
        except Exception as e:
            logger.error(f"Failed to update user {user.email}: {str(e)}")
            raise
    
    @staticmethod
    def delete_user(user: User) -> bool:
        """
        Delete a user.
        
        Args:
            user (User): User instance to delete
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            email = user.email
            user.delete()
            logger.info(f"User deleted: {email}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete user: {str(e)}")
            return False
    
    @staticmethod
    def set_password(user: User, password: str) -> bool:
        """
        Set user password (hashed).
        
        Args:
            user (User): User instance
            password (str): New password (will be hashed)
            
        Returns:
            bool: True if password set successfully
        """
        try:
            user.set_password(password)
            user.save(update_fields=['password'])
            logger.info(f"Password updated for user: {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to set password for {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def mark_as_verified(user: User) -> bool:
        """
        Mark user as verified.
        
        Args:
            user (User): User instance
            
        Returns:
            bool: True if marked successfully
        """
        try:
            user.is_verified = True
            user.save(update_fields=['is_verified'])
            logger.info(f"User marked as verified: {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to mark user as verified: {str(e)}")
            return False
    
    @staticmethod
    def mark_as_approved(user: User) -> bool:
        """
        Mark user as approved.
        
        Args:
            user (User): User instance
            
        Returns:
            bool: True if marked successfully
        """
        try:
            user.is_approved = True
            user.save(update_fields=['is_approved'])
            logger.info(f"User marked as approved: {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to mark user as approved: {str(e)}")
            return False
    
    @staticmethod
    def get_all_by_role(role: str) -> QuerySet:
        """
        Get all users with a specific role.
        
        Args:
            role (str): User role
            
        Returns:
            QuerySet: Users with the specified role
        """
        try:
            return User.objects.filter(role=role).order_by('-created_at')
        except Exception as e:
            logger.error(f"Error fetching users by role {role}: {str(e)}")
            return User.objects.none()
    
    @staticmethod
    def search_users(search_term: str, role: Optional[str] = None) -> QuerySet:
        """
        Search users by name or email.
        
        Args:
            search_term (str): Search query
            role (str, optional): Filter by role
            
        Returns:
            QuerySet: Matching users
        """
        try:
            queryset = User.objects.filter(
                Q(full_name__icontains=search_term) |
                Q(email__icontains=search_term)
            )
            
            if role:
                queryset = queryset.filter(role=role)
            
            return queryset.order_by('-created_at')
        except Exception as e:
            logger.error(f"Error searching users: {str(e)}")
            return User.objects.none()
    
    @staticmethod
    def get_by_knowledge_partner(kp_profile) -> QuerySet:
        """
        Get all users associated with a Knowledge Partner.
        
        Args:
            kp_profile: KPProfile instance
            
        Returns:
            QuerySet: Users associated with the KP
        """
        try:
            return User.objects.filter(knowledge_partner=kp_profile).order_by('-created_at')
        except Exception as e:
            logger.error(f"Error fetching users by KP: {str(e)}")
            return User.objects.none()
    
    @staticmethod
    def count_by_role(role: str) -> int:
        """
        Count users with a specific role.
        
        Args:
            role (str): User role
            
        Returns:
            int: Count of users
        """
        try:
            return User.objects.filter(role=role).count()
        except Exception as e:
            logger.error(f"Error counting users by role: {str(e)}")
            return 0
    
    @staticmethod
    def get_pending_approvals() -> QuerySet:
        """
        Get all users pending approval.
        
        Returns:
            QuerySet: Users with is_approved=False
        """
        try:
            return User.objects.filter(is_approved=False, is_verified=True).order_by('-created_at')
        except Exception as e:
            logger.error(f"Error fetching pending approvals: {str(e)}")
            return User.objects.none()


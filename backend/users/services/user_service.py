"""
User Service - Business logic for user operations

Handles user-related business logic: registration, verification, approval.
Uses repositories for database operations, services for external operations.
NO direct database queries, NO HTTP handling.
"""

import logging
from typing import Tuple, Optional
from users.models import User
from users.repositories import user_repository

logger = logging.getLogger(__name__)


class UserService:
    """
    User business logic service.
    
    Orchestrates user operations using repositories.
    Enforces business rules and workflows.
    """
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """
        Get user by email.
        
        Args:
            email (str): User email
            
        Returns:
            User or None
        """
        return user_repository.get_by_email(email)
    
    @staticmethod
    def get_user_by_id(user_id) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            user_id: User UUID
            
        Returns:
            User or None
        """
        return user_repository.get_by_id(user_id)
    
    @staticmethod
    def user_exists(email: str) -> bool:
        """
        Check if user exists with given email.
        
        Args:
            email (str): Email address
            
        Returns:
            bool: True if user exists
        """
        return user_repository.exists_by_email(email)
    
    @staticmethod
    def create_user(email: str, full_name: str, password: str, role: str,
                   is_verified: bool = False, is_approved: bool = True,
                   **extra_fields) -> Tuple[bool, str, Optional[User]]:
        """
        Create a new user with business logic validation.
        
        Business rules:
        - Email must be unique
        - Learners are auto-approved
        - Instructors need KP admin approval
        - Knowledge partners need super admin approval
        
        Args:
            email (str): User email
            full_name (str): User full name
            password (str): User password
            role (str): User role
            is_verified (bool): Email verification status
            is_approved (bool): Admin approval status
            **extra_fields: Additional fields
            
        Returns:
            Tuple[bool, str, User or None]: (success, message, user)
        """
        try:
            # Business rule: Check if email already exists
            if user_repository.exists_by_email(email):
                logger.warning(f"Attempt to create user with existing email: {email}")
                return False, "User with this email already exists", None
            
            # Business rule: Role-specific approval logic
            if role == 'learner':
                is_approved = True  # Learners auto-approved
            elif role == 'knowledge_partner_instructor':
                is_approved = extra_fields.get('is_approved', False)  # Needs KP admin approval
            elif role == 'knowledge_partner':
                is_approved = extra_fields.get('is_approved', False)  # Needs super admin approval
            
            # Create user via repository
            user = user_repository.create_user(
                email=email,
                full_name=full_name,
                password=password,
                role=role,
                is_verified=is_verified,
                is_approved=is_approved,
                **extra_fields
            )
            
            logger.info(f"User created successfully: {email} (role: {role})")
            return True, "User created successfully", user
            
        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            return False, f"Failed to create user: {str(e)}", None
    
    @staticmethod
    def update_user(user: User, **fields) -> Tuple[bool, str]:
        """
        Update user fields.
        
        Args:
            user (User): User instance
            **fields: Fields to update
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            user_repository.update_user(user, **fields)
            return True, "User updated successfully"
        except Exception as e:
            logger.error(f"Failed to update user: {str(e)}")
            return False, f"Failed to update user: {str(e)}"
    
    @staticmethod
    def delete_user(user: User) -> Tuple[bool, str]:
        """
        Delete a user.
        
        Args:
            user (User): User instance
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            success = user_repository.delete_user(user)
            if success:
                return True, "User deleted successfully"
            else:
                return False, "Failed to delete user"
        except Exception as e:
            logger.error(f"Failed to delete user: {str(e)}")
            return False, f"Failed to delete user: {str(e)}"
    
    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> Tuple[bool, str]:
        """
        Change user password with validation.
        
        Business rules:
        - Old password must match
        - New password must be different from old
        
        Args:
            user (User): User instance
            old_password (str): Current password
            new_password (str): New password
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            # Business rule: Verify old password
            if not user.check_password(old_password):
                logger.warning(f"Invalid old password for user: {user.email}")
                return False, "Current password is incorrect"
            
            # Business rule: New password must be different
            if old_password == new_password:
                return False, "New password must be different from current password"
            
            # Update password via repository
            success = user_repository.set_password(user, new_password)
            
            if success:
                logger.info(f"Password changed for user: {user.email}")
                return True, "Password changed successfully"
            else:
                return False, "Failed to change password"
                
        except Exception as e:
            logger.error(f"Failed to change password: {str(e)}")
            return False, f"Failed to change password: {str(e)}"
    
    @staticmethod
    def reset_password(user: User, new_password: str) -> Tuple[bool, str]:
        """
        Reset user password (no old password verification).
        
        Used after OTP verification in forgot password flow.
        
        Args:
            user (User): User instance
            new_password (str): New password
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            success = user_repository.set_password(user, new_password)
            
            if success:
                logger.info(f"Password reset for user: {user.email}")
                return True, "Password reset successfully"
            else:
                return False, "Failed to reset password"
                
        except Exception as e:
            logger.error(f"Failed to reset password: {str(e)}")
            return False, f"Failed to reset password: {str(e)}"
    
    @staticmethod
    def mark_as_verified(user: User) -> Tuple[bool, str]:
        """
        Mark user as email verified.
        
        Args:
            user (User): User instance
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            success = user_repository.mark_as_verified(user)
            if success:
                return True, "User verified successfully"
            else:
                return False, "Failed to verify user"
        except Exception as e:
            logger.error(f"Failed to verify user: {str(e)}")
            return False, f"Failed to verify user: {str(e)}"
    
    @staticmethod
    def mark_as_approved(user: User) -> Tuple[bool, str]:
        """
        Mark user as admin approved.
        
        Args:
            user (User): User instance
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            success = user_repository.mark_as_approved(user)
            if success:
                return True, "User approved successfully"
            else:
                return False, "Failed to approve user"
        except Exception as e:
            logger.error(f"Failed to approve user: {str(e)}")
            return False, f"Failed to approve user: {str(e)}"
    
    @staticmethod
    def can_user_login(user: User) -> Tuple[bool, str]:
        """
        Check if user can log in (business rule validation).
        
        Business rules:
        - Must be active
        - Must be verified
        - Must be approved (except learners)
        
        Args:
            user (User): User instance
            
        Returns:
            Tuple[bool, str]: (can_login, reason_if_not)
        """
        if not user.is_active:
            return False, "Account is disabled"
        
        if not user.is_verified:
            return False, "Please verify your email address before logging in"
        
        if not user.is_approved and user.role != 'learner':
            return False, "Account is pending approval"
        
        return True, ""
    
    @staticmethod
    def get_users_by_role(role: str):
        """
        Get all users with a specific role.
        
        Args:
            role (str): User role
            
        Returns:
            QuerySet: Users with the specified role
        """
        return user_repository.get_all_by_role(role)
    
    @staticmethod
    def search_users(search_term: str, role: Optional[str] = None):
        """
        Search users by name or email.
        
        Args:
            search_term (str): Search query
            role (str, optional): Filter by role
            
        Returns:
            QuerySet: Matching users
        """
        return user_repository.search_users(search_term, role)
    
    @staticmethod
    def get_pending_approvals():
        """
        Get all users pending approval.
        
        Returns:
            QuerySet: Users pending approval
        """
        return user_repository.get_pending_approvals()


"""
Pure utility functions for users app.

ONLY contains helper functions with NO business logic, NO database operations, NO email sending.
All OTP, email, and user management logic has been moved to:
- services/ (business logic)
- repositories/ (database operations)
- adapters/ (external services)

This file is now deprecated and should only contain truly pure helper functions.
"""

# NOTE: All OTP-related functions have been moved to:
# - services/otp_service.py (business logic)
# - repositories/otp_repository.py (database operations)
# - adapters/email/ (email sending)

# If you need OTP functionality, import from:
# from users.services import otp_service
# from users.repositories import otp_repository
# from users.services import email_service

# Pure helper functions can be added here if needed in the future
# Examples: string formatting, data parsing, etc.
# NO database queries, NO API calls, NO business logic

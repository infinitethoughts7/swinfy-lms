# Create new file: backend/users/views/application_views.py

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.db import models

from ..models import KnowledgePartner, KnowledgePartnerApplication
from ..serializers.application_serializer import (
    KnowledgePartnerApplicationCreateSerializer,
    KnowledgePartnerApplicationListSerializer,
    KnowledgePartnerApplicationDetailSerializer,
    ApplicationApprovalSerializer,
    ApplicationRejectionSerializer,
    ApplicationUpdateNotesSerializer,
    ApplicationActionResponseSerializer,
)

User = get_user_model()


class ApplicationPagination(PageNumberPagination):
    """Custom pagination for applications."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class KnowledgePartnerApplicationCreateView(generics.CreateAPIView):
    """Create a new knowledge partner application."""
    
    serializer_class = KnowledgePartnerApplicationCreateSerializer
    permission_classes = [permissions.AllowAny]  # Public endpoint
    
    def create(self, request, *args, **kwargs):
        """Create application and send confirmation email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create application
        application = serializer.save()
        
        # Send confirmation email to applicant
        try:
            self.send_application_confirmation_email(application)
        except Exception as e:
            # Log error but don't fail the application creation
            print(f"Failed to send confirmation email: {e}")
        
        # Send notification email to admin
        try:
            self.send_admin_notification_email(application)
        except Exception as e:
            print(f"Failed to send admin notification: {e}")
        
        return Response({
            'success': True,
            'message': 'Application submitted successfully! We will call you within 24-48 hours.',
            'application_id': application.id,
            'organization_name': application.organization_name,
        }, status=status.HTTP_201_CREATED)
    
    def send_application_confirmation_email(self, application):
        """Send confirmation email to applicant."""
        subject = f"Knowledge Partner Application Received - {application.organization_name}"
        message = f"""
Dear {application.organization_name} Team,

Thank you for applying to become a Knowledge Partner with our platform!

We have received your application with the following details:
- Organization: {application.organization_name}
- Type: {application.get_organization_type_display()}
- Website: {application.website_url}
- Contact: {application.contact_number}

Next Steps:
1. Our team will review your application within 24-48 hours
2. We'll call you at {application.contact_number} to discuss the partnership
3. If approved, you'll receive login credentials to access your dashboard

If you have any questions, please contact us at:
📧 rockyg.swinfy@gmail.com
📞 +91 7981313783

Best regards,
Knowledge Partnership Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.organization_email],
            fail_silently=False,
        )
    
    def send_admin_notification_email(self, application):
        """Send notification email to admin."""
        subject = f"New Knowledge Partner Application: {application.organization_name}"
        message = f"""
New Knowledge Partner Application Received!

Organization Details:
- Name: {application.organization_name}
- Type: {application.get_organization_type_display()}
- Website: {application.website_url}
- Email: {application.organization_email}
- Phone: {application.contact_number}

Course Interest: {application.courses_interested_display}
Experience: {application.experience_display}
Expected Tutors: {application.tutors_display}

Message from Applicant:
{application.partner_message or 'No additional message'}

Review this application in the admin dashboard:
Application ID: {application.id}

Created: {application.created_at.strftime('%Y-%m-%d %H:%M:%S')}
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['rockyg.swinfy@gmail.com'],  # Your admin email
            fail_silently=False,
        )


class KnowledgePartnerApplicationListView(generics.ListAPIView):
    """List all knowledge partner applications (admin only)."""
    
    serializer_class = KnowledgePartnerApplicationListSerializer
    permission_classes = [permissions.IsAdminUser]  # Only superusers
    pagination_class = ApplicationPagination
    
    def get_queryset(self):
        """Get applications with filtering."""
        queryset = KnowledgePartnerApplication.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by organization type
        org_type = self.request.query_params.get('org_type', None)
        if org_type:
            queryset = queryset.filter(organization_type=org_type)
        
        # Search by organization name or email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(organization_name__icontains=search) |
                models.Q(organization_email__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class KnowledgePartnerApplicationDetailView(generics.RetrieveAPIView):
    """Get detailed view of a knowledge partner application (admin only)."""
    
    queryset = KnowledgePartnerApplication.objects.all()
    serializer_class = KnowledgePartnerApplicationDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def approve_application(request, application_id):
    """Approve a knowledge partner application and create accounts."""
    
    application = get_object_or_404(KnowledgePartnerApplication, id=application_id)
    
    if not application.can_be_approved:
        return Response({
            'success': False,
            'message': f'Application cannot be approved. Current status: {application.get_status_display()}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate request data
    serializer = ApplicationApprovalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        with transaction.atomic():
            # Approve application and create KP + Admin user
            knowledge_partner, admin_user, temp_password = application.approve_and_create_kp(
                admin_user=request.user,
                admin_notes=serializer.validated_data.get('admin_notes', '')
            )
            
            # Send welcome email to new admin
            send_welcome_email(admin_user, knowledge_partner, temp_password)
            
            return Response({
                'success': True,
                'message': f'Application approved successfully! {knowledge_partner.name} has been created.',
                'application_id': application.id,
                'knowledge_partner_id': knowledge_partner.id,
                'admin_email': admin_user.email,
                'organization_name': knowledge_partner.name,
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error approving application: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def reject_application(request, application_id):
    """Reject a knowledge partner application."""
    
    application = get_object_or_404(KnowledgePartnerApplication, id=application_id)
    
    if not application.can_be_rejected:
        return Response({
            'success': False,
            'message': f'Application cannot be rejected. Current status: {application.get_status_display()}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate request data
    serializer = ApplicationRejectionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        # Reject application
        application.reject_application(
            admin_user=request.user,
            rejection_reason=serializer.validated_data['rejection_reason']
        )
        
        # Send rejection email
        send_rejection_email(application)
        
        return Response({
            'success': True,
            'message': f'Application for {application.organization_name} has been rejected.',
            'application_id': application.id,
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error rejecting application: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def update_application_notes(request, application_id):
    """Update admin notes for an application."""
    
    application = get_object_or_404(KnowledgePartnerApplication, id=application_id)
    
    serializer = ApplicationUpdateNotesSerializer(
        instance=application,
        data=request.data,
        partial=True
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    
    return Response({
        'success': True,
        'message': 'Notes updated successfully.',
        'application_id': application.id,
        'admin_notes': application.admin_notes,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def mark_under_review(request, application_id):
    """Mark application as under review."""
    
    application = get_object_or_404(KnowledgePartnerApplication, id=application_id)
    
    if application.status != 'pending':
        return Response({
            'success': False,
            'message': f'Application is not pending. Current status: {application.get_status_display()}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    application.mark_under_review(request.user)
    
    return Response({
        'success': True,
        'message': f'Application for {application.organization_name} marked as under review.',
        'application_id': application.id,
    }, status=status.HTTP_200_OK)


def send_welcome_email(admin_user, knowledge_partner, temp_password):
    """Send welcome email with login credentials to new Knowledge Partner Admin."""
    subject = f"Welcome to Knowledge Partner Platform - {knowledge_partner.name}"
    message = f"""
Dear {knowledge_partner.name} Team,

Congratulations! Your Knowledge Partner application has been approved.

Your organization "{knowledge_partner.name}" is now part of our learning platform!

LOGIN CREDENTIALS:
📧 Email: {admin_user.email}
🔑 Temporary Password: {temp_password}

🔗 Login URL: {settings.FRONTEND_URL}/login

IMPORTANT NEXT STEPS:
1. Login with the credentials above
2. Change your password immediately
3. Complete your organization profile (logo, description, etc.)
4. Update your personal admin profile
5. Start creating your first course!

WHAT YOU CAN DO:
✅ Create and manage courses
✅ Add instructors to your organization
✅ Track student enrollments and progress
✅ Access detailed analytics
✅ Create both public and private courses

Need help? Contact us:
📧 rockyg.swinfy@gmail.com
📞 +91 7981313783

Welcome aboard!
Knowledge Partnership Team
    """
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[admin_user.email],
        fail_silently=False,
    )


def send_rejection_email(application):
    """Send rejection email to applicant."""
    subject = f"Knowledge Partner Application Update - {application.organization_name}"
    message = f"""
Dear {application.organization_name} Team,

Thank you for your interest in becoming a Knowledge Partner with our platform.

After careful review, we regret to inform you that we cannot approve your application at this time.

Reason for decision:
{application.admin_notes}

We encourage you to:
- Address the concerns mentioned above
- Reapply in the future when ready
- Contact us if you have any questions

For questions or clarification, please contact us:
📧 rockyg.swinfy@gmail.com
📞 +91 7981313783

Thank you for your understanding.

Best regards,
Knowledge Partnership Team
    """
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[application.organization_email],
        fail_silently=False,
    )


# Stats endpoint for admin dashboard
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def application_stats(request):
    """Get application statistics for admin dashboard."""
    
    from django.db.models import Count
    
    # Basic counts
    total_applications = KnowledgePartnerApplication.objects.count()
    pending_count = KnowledgePartnerApplication.objects.filter(status='pending').count()
    under_review_count = KnowledgePartnerApplication.objects.filter(status='under_review').count()
    approved_count = KnowledgePartnerApplication.objects.filter(status='approved').count()
    rejected_count = KnowledgePartnerApplication.objects.filter(status='rejected').count()
    
    # Applications by organization type
    org_type_stats = KnowledgePartnerApplication.objects.values('organization_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Applications by course interest
    course_interest_stats = KnowledgePartnerApplication.objects.values('courses_interested_in').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Recent applications (last 7 days)
    from datetime import timedelta
    recent_date = timezone.now() - timedelta(days=7)
    recent_applications = KnowledgePartnerApplication.objects.filter(
        created_at__gte=recent_date
    ).count()
    
    return Response({
        'total_applications': total_applications,
        'pending_applications': pending_count,
        'under_review_applications': under_review_count,
        'approved_applications': approved_count,
        'rejected_applications': rejected_count,
        'recent_applications': recent_applications,
        'organization_type_distribution': org_type_stats,
        'course_interest_distribution': course_interest_stats,
        'total_knowledge_partners': KnowledgePartner.objects.filter(is_active=True).count(),
    }, status=status.HTTP_200_OK)
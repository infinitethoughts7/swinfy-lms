from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
import secrets
import string

from ..models import KnowledgePartnerApplication, User, KPProfile
from ..serializers import (
    KnowledgePartnerApplicationCreateSerializer,
    KnowledgePartnerApplicationListSerializer,
    ApplicationApprovalSerializer,
    ApplicationRejectionSerializer,
)


def generate_secure_password(length=12):
    """Generate a secure random password with letters, digits, and special characters."""
    # Define character sets
    letters = string.ascii_letters
    digits = string.digits
    special_chars = '@#$%&*!'
    
    # Ensure password has at least one of each type
    password = [
        secrets.choice(string.ascii_uppercase),  # At least one uppercase
        secrets.choice(string.ascii_lowercase),  # At least one lowercase
        secrets.choice(digits),                   # At least one digit
        secrets.choice(special_chars),           # At least one special char
    ]
    
    # Fill the rest randomly
    all_chars = letters + digits + special_chars
    password += [secrets.choice(all_chars) for _ in range(length - 4)]
    
    # Shuffle to avoid predictable patterns
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)


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
            'knowledge_partner_name': application.knowledge_partner_name,
        }, status=status.HTTP_201_CREATED)
    
    def send_application_confirmation_email(self, application):
        """Send confirmation email to applicant."""
        subject = f"Knowledge Partner Application Received - {application.knowledge_partner_name}"
        message = f"""
Dear {application.knowledge_partner_name} Team,

Thank you for applying to become a Knowledge Partner with our platform!

We have received your application with the following details:
- Knowledge Partner: {application.knowledge_partner_name}
- Type: {application.get_knowledge_partner_type_display()}
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
            recipient_list=[application.knowledge_partner_email],
            fail_silently=False,
        )
    
    def send_admin_notification_email(self, application):
        """Send notification email to admin."""
        subject = f"New Knowledge Partner Application: {application.knowledge_partner_name}"
        message = f"""
New Knowledge Partner Application Received!

Organization Details:
- Name: {application.knowledge_partner_name}
- Type: {application.get_knowledge_partner_type_display()}
- Website: {application.website_url}
- Email: {application.knowledge_partner_email}
- Phone: {application.contact_number}

Areas of Focus: {application.courses_interested_in or 'Not specified'}
Experience: {application.get_experience_years_display()}
Expected Tutors: {application.get_expected_tutors_display()}

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
            from django.db.models import Q
            queryset = queryset.filter(
                Q(organization_name__icontains=search) |
                Q(organization_email__icontains=search)
            )
        
        return queryset.order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def approve_application(request, application_id):
    """Approve a knowledge partner application and create accounts."""
    
    application = get_object_or_404(KnowledgePartnerApplication, id=application_id)
    
    if application.status != 'pending':
        return Response({
            'success': False,
            'message': f'Application is not pending. Current status: {application.get_status_display()}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate request data
    serializer = ApplicationApprovalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        with transaction.atomic():
            # Only superusers can approve applications
            if not request.user.is_superuser:
                return Response({'success': False, 'message': 'Only superusers can approve applications.'}, status=status.HTTP_403_FORBIDDEN)

            # Check if user with this email already exists
            if User.objects.filter(email=application.knowledge_partner_email).exists():
                return Response({
                    'success': False,
                    'message': f'A user with email {application.knowledge_partner_email} already exists.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Generate a secure random password
            generated_password = generate_secure_password(length=12)
            
            admin_user = User.objects.create_user(
                email=application.knowledge_partner_email,
                full_name=f"{application.knowledge_partner_name} Admin",
                password=generated_password,
                role='knowledge_partner',
                is_verified=True,
                is_approved=True
            )

            # Create Knowledge Partner Profile and link to admin user
            areas = application.courses_interested_in or 'Various areas'
            knowledge_partner = KPProfile.objects.create(
                user=admin_user,
                name=application.knowledge_partner_name,
                type=application.knowledge_partner_type,
                description=f"Knowledge Partner specializing in {areas}.",
                location="To be updated",
                website=application.website_url or '',
                kp_admin_name=admin_user.full_name,
                kp_admin_email=application.knowledge_partner_email,
                kp_admin_phone=application.contact_number,
                is_verified=True,
                is_active=True
            )

            # Update application
            application.status = 'approved'
            application.reviewed_by = request.user
            application.reviewed_at = timezone.now()
            application.created_knowledge_partner = knowledge_partner
            application.created_admin_user = admin_user
            application.save()

            # Send congratulatory email with credentials
            try:
                send_congratulations_email(application, admin_user, knowledge_partner, generated_password)
            except Exception as e:
                # Log error but don't fail the approval
                print(f"Failed to send congratulations email: {e}")

            return Response({
                'success': True,
                'message': f'🎉 Application approved successfully! {knowledge_partner.name} has been created and credentials have been sent to {admin_user.email}.',
                'application_id': application.id,
                'knowledge_partner_id': knowledge_partner.id,
                'knowledge_partner_name': knowledge_partner.name,
                'admin_email': admin_user.email,
                'login_url': 'http://localhost:3000/auth/login'
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
    
    if application.status != 'pending':
        return Response({
            'success': False,
            'message': f'Application is not pending. Current status: {application.get_status_display()}'
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
            'message': f'Application for {application.knowledge_partner_name} has been rejected.',
            'application_id': application.id,
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error rejecting application: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def send_congratulations_email(application, admin_user, knowledge_partner, password):
    """Send congratulatory email with login credentials to approved Knowledge Partner."""
    subject = f"🎉 Congratulations! Welcome to Swinfy Learning Platform - {knowledge_partner.name}"
    message = f"""
🎉 CONGRATULATIONS! YOUR APPLICATION HAS BEEN APPROVED! 🎉

Dear {knowledge_partner.name} Team,

We are thrilled to welcome you to the Swinfy Learning Platform family! 

Your Knowledge Partner application has been successfully approved, and we're excited to have you join our mission of transforming education and empowering learners worldwide.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 YOUR LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email: {admin_user.email}
🔑 Temporary Password: {password}
🌐 Login URL: https://olla.co.in/

⚠️ IMPORTANT SECURITY NOTICE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is a TEMPORARY password that has been randomly generated for your security.

🔒 YOU MUST CHANGE THIS PASSWORD immediately after your first login!

To change your password:
1. Login with the credentials above
2. Go to your Profile Settings
3. Click on "Change Password"
4. Create a strong, unique password that you'll remember

Never share your password with anyone, including our support team.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NEXT STEPS TO GET STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Login to your Knowledge Partner Dashboard
2️⃣ Complete your organization profile (add logo, description, etc.)
3️⃣ Update your personal admin profile
4️⃣ Create your first course and start making an impact!
5️⃣ Create instructors to join your organization

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ WHAT YOU CAN DO NOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎓 Create and manage unlimited courses
👨‍🏫 Add instructors to your organization  
📊 Track learner enrollments and progress
📈 Access detailed performance analytics
🌟 Create both public and private courses
💼 Manage your organization's learning ecosystem
🏆 Build your reputation as a quality education provider

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR ORGANIZATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 Organization: {knowledge_partner.name}
🔗 Website: {knowledge_partner.website or 'Not provided'}
📧 Contact Email: {knowledge_partner.kp_admin_email}
📱 Phone: {knowledge_partner.kp_admin_phone}
🎯 Focus Area: {application.courses_interested_in or 'Not specified'}
⭐ Experience: {application.get_experience_years_display()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤝 NEED HELP? WE'RE HERE FOR YOU!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email Support: rockyg.swinfy@gmail.com
📞 Phone Support: +91 7981313783
💬 We're here to help you succeed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to the future of learning! Together, we'll create amazing educational experiences that will impact thousands of learners.

Let's make learning accessible, engaging, and transformative! 🌟

With warm regards and excitement,
The Swinfy Learning Platform Team

P.S. We can't wait to see the incredible courses you'll create! 🚀
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
    subject = f"Knowledge Partner Application Update - {application.knowledge_partner_name}"
    message = f"""
Dear {application.knowledge_partner_name} Team,

Thank you for your interest in becoming a Knowledge Partner with our platform.

After careful review, we regret to inform you that we cannot approve your application at this time.

Reason for decision:
{application.admin_notes or 'Please contact us for more details.'}

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
        recipient_list=[application.knowledge_partner_email],
        fail_silently=False,
    )
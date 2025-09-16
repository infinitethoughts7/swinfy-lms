# backend/users/views/super_admin_views.py

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone

from ..models.models import User, KPProfile, LearnerProfile, KPInstructorProfile
from ..models.kp_application import KnowledgePartnerApplication
from ..serializers.super_admin_serializers import (
    KnowledgePartnerApplicationSerializer,
    UserListSerializer,
    DashboardStatsSerializer
)
from ..permissions import IsSuperAdmin


class DashboardStatsView(generics.GenericAPIView):
    """Get dashboard stats for Super Admin."""
    
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    
    def get(self, request):
        # Get basic counts
        total_users = User.objects.count()
        total_learners = User.objects.filter(role='learner').count()
        total_kp_admins = User.objects.filter(role='knowledge_partner_admin').count()
        total_kp_instructors = User.objects.filter(role='knowledge_partner_instructor').count()
        
        # Get application stats
        pending_applications = KnowledgePartnerApplication.objects.filter(status='pending').count()
        approved_applications = KnowledgePartnerApplication.objects.filter(status='approved').count()
        rejected_applications = KnowledgePartnerApplication.objects.filter(status='rejected').count()
        
        # Get KP stats
        total_kps = KPProfile.objects.count()
        active_kps = KPProfile.objects.filter(is_active=True).count()
        verified_kps = KPProfile.objects.filter(is_verified=True).count()
        
        # Recent activity - last 30 days
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        recent_users = User.objects.filter(created_at__gte=thirty_days_ago).count()
        recent_applications = KnowledgePartnerApplication.objects.filter(created_at__gte=thirty_days_ago).count()
        
        data = {
            'users': {
                'total': total_users,
                'learners': total_learners,
                'kp_admins': total_kp_admins,
                'kp_instructors': total_kp_instructors,
                'recent_new_users': recent_users,
            },
            'applications': {
                'pending': pending_applications,
                'approved': approved_applications,
                'rejected': rejected_applications,
                'recent_applications': recent_applications,
            },
            'knowledge_partners': {
                'total': total_kps,
                'active': active_kps,
                'verified': verified_kps,
            }
        }
        
        return Response(data)


class KnowledgePartnerApplicationListView(generics.ListAPIView):
    """List all KP applications for Super Admin."""
    
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    serializer_class = KnowledgePartnerApplicationSerializer
    
    def get_queryset(self):
        queryset = KnowledgePartnerApplication.objects.all().select_related(
            'reviewed_by', 'created_knowledge_partner', 'created_admin_user'
        )
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')


class UserListView(generics.ListAPIView):
    """List all users for Super Admin (read-only)."""
    
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    serializer_class = UserListSerializer
    
    def get_queryset(self):
        queryset = User.objects.all().select_related('kp_profile')
        
        # Filter by role if provided
        role_filter = self.request.query_params.get('role', None)
        if role_filter:
            queryset = queryset.filter(role=role_filter)
        
        # Search by name or email if provided
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) | Q(email__icontains=search)
            )
        
        return queryset.order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsSuperAdmin])
def approve_kp_application(request, application_id):
    """Approve a KP application and create KP Admin user."""
    
    try:
        application = KnowledgePartnerApplication.objects.get(id=application_id)
        
        if application.status != 'pending':
            return Response(
                {'error': 'Application is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email already exists
        if User.objects.filter(email=application.knowledge_partner_email).exists():
            return Response(
                {'error': f'User with email {application.knowledge_partner_email} already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if Knowledge Partner name already exists
        if KPProfile.objects.filter(name=application.knowledge_partner_name).exists():
            return Response(
                {'error': f'Knowledge Partner with name "{application.knowledge_partner_name}" already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create KP Admin User Account with default password
        kp_admin_user = User.objects.create_user(
            email=application.knowledge_partner_email,
            password='rockyg07',  # Default password as requested
            full_name=f"{application.knowledge_partner_name} Admin",
            role='knowledge_partner_admin',
            is_verified=True,
            is_approved=True,
        )
        
        # Create KPProfile linked to the user
        kp_profile = KPProfile.objects.create(
            user=kp_admin_user,
            name=application.knowledge_partner_name,
            type=application.knowledge_partner_type,
            description=application.partner_message or f'{application.knowledge_partner_name} - Knowledge Partner',
            location='',  # Can be updated later by KP Admin
            website=application.website_url or '',
            kp_admin_name=f"{application.knowledge_partner_name} Admin",
            kp_admin_email=application.knowledge_partner_email,
            kp_admin_phone='',  # Can be updated later
            is_active=True,
            is_verified=False,  # Will be verified by super admin later
        )
        
        # Update Application Status
        application.status = 'approved'
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.created_knowledge_partner = kp_profile
        application.created_admin_user = kp_admin_user
        application.save()
        
        return Response({
            'message': 'Application approved successfully',
            'kp_admin_email': application.knowledge_partner_email,
            'default_password': 'rockyg07',
            'kp_profile_id': str(kp_profile.id),
            'admin_user_id': str(kp_admin_user.id),
        })
        
    except KnowledgePartnerApplication.DoesNotExist:
        return Response(
            {'error': 'Application not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsSuperAdmin])
def reject_kp_application(request, application_id):
    """Reject a KP application."""
    
    try:
        application = KnowledgePartnerApplication.objects.get(id=application_id)
        
        if application.status != 'pending':
            return Response(
                {'error': 'Application is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rejection_reason = request.data.get('reason', '')
        if not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update Application Status
        application.status = 'rejected'
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.admin_notes = rejection_reason
        application.save()
        
        return Response({
            'message': 'Application rejected successfully',
            'reason': rejection_reason
        })
        
    except KnowledgePartnerApplication.DoesNotExist:
        return Response(
            {'error': 'Application not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

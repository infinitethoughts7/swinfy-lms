from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Payment, PaymentNotification
from .serializers import (
    PendingPaymentSerializer, 
    PaymentVerificationSerializer,
    PaymentNotificationSerializer
)
from courses.permissions import IsTrainingPartnerAdmin


class PaymentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTrainingPartnerAdmin])
def pending_payments(request):
    """Get pending payments for training partner admin"""
    
    # Get payments for courses belonging to admin's training partner
    training_partner = request.user.organization
    
    pending_payments = Payment.objects.filter(
        enrollment__course__training_partner=training_partner,
        status='paid'  # Payments that need verification
    ).select_related(
        'user', 'enrollment__course'
    ).order_by('-paid_at')
    
    paginator = PaymentPagination()
    page = paginator.paginate_queryset(pending_payments, request)
    
    if page is not None:
        serializer = PendingPaymentSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = PendingPaymentSerializer(pending_payments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTrainingPartnerAdmin])
def verify_payment(request, payment_id):
    """Approve or reject a payment"""
    
    serializer = PaymentVerificationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    action = serializer.validated_data['action']
    notes = serializer.validated_data.get('notes', '')
    
    try:
        # Get payment for admin's training partner only
        payment = get_object_or_404(
            Payment,
            id=payment_id,
            enrollment__course__training_partner=request.user.organization,
            status='paid'
        )
        
        if action == 'approve':
            # Approve payment and activate enrollment
            payment.status = 'verified'
            payment.verified_by = request.user
            payment.verification_notes = notes
            payment.verified_at = timezone.now()
            payment.save()
            
            # Activate enrollment
            payment.enrollment.status = 'active'
            payment.enrollment.save()
            
            # Create notification for user
            PaymentNotification.objects.create(
                recipient=payment.user,
                recipient_type='user',
                notification_type='payment_approved',
                title='Enrollment Approved!',
                message=f'Your enrollment for {payment.enrollment.course.title} has been approved. You can now access the course.',
                payment=payment,
                course_title=payment.enrollment.course.title
            )
            
            message = 'Payment approved and enrollment activated successfully.'
            
        elif action == 'reject':
            # Reject payment
            payment.status = 'rejected'
            payment.verified_by = request.user
            payment.verification_notes = notes
            payment.verified_at = timezone.now()
            payment.save()
            
            # Update enrollment status
            payment.enrollment.status = 'rejected'
            payment.enrollment.save()
            
            # Create notification for user
            PaymentNotification.objects.create(
                recipient=payment.user,
                recipient_type='user',
                notification_type='payment_rejected',
                title='Enrollment Rejected',
                message=f'Your enrollment for {payment.enrollment.course.title} has been rejected. Reason: {notes or "No reason provided"}',
                payment=payment,
                course_title=payment.enrollment.course.title
            )
            
            message = 'Payment rejected successfully.'
        
        # Log the verification action
        from .payment_views import create_payment_log
        create_payment_log(
            payment=payment,
            level='info',
            event_type='admin_verification',
            message=f'Payment {action}ed by admin: {request.user.full_name}',
            data={
                'action': action,
                'notes': notes,
                'admin_id': str(request.user.id)
            },
            request=request
        )
        
        return Response({
            'message': message,
            'payment_status': payment.status,
            'enrollment_status': payment.enrollment.status
        }, status=status.HTTP_200_OK)
        
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found or not accessible'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTrainingPartnerAdmin])
def payment_history(request):
    """Get all payments for training partner admin"""
    
    training_partner = request.user.organization
    
    payments = Payment.objects.filter(
        enrollment__course__training_partner=training_partner
    ).select_related(
        'user', 'enrollment__course', 'verified_by'
    ).order_by('-created_at')
    
    # Filter by status if provided
    status_filter = request.query_params.get('status')
    if status_filter:
        payments = payments.filter(status=status_filter)
    
    paginator = PaymentPagination()
    page = paginator.paginate_queryset(payments, request)
    
    if page is not None:
        serializer = PendingPaymentSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = PendingPaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_notifications(request):
    """Get payment notifications for user"""
    
    notifications = PaymentNotification.objects.filter(
        recipient=request.user
    ).order_by('-created_at')
    
    # Mark as read if specified
    mark_read = request.query_params.get('mark_read')
    if mark_read:
        notifications.filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
    
    paginator = PaymentPagination()
    page = paginator.paginate_queryset(notifications, request)
    
    if page is not None:
        serializer = PaymentNotificationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = PaymentNotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read"""
    
    try:
        notification = get_object_or_404(
            PaymentNotification,
            id=notification_id,
            recipient=request.user
        )
        
        notification.mark_as_read()
        
        return Response({
            'message': 'Notification marked as read'
        }, status=status.HTTP_200_OK)
        
    except PaymentNotification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTrainingPartnerAdmin])
def payment_analytics(request):
    """Get payment analytics for training partner"""
    
    from django.db.models import Count, Sum, Q
    from datetime import datetime, timedelta
    
    training_partner = request.user.organization
    
    # Get payments for the last 30 days
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    payments = Payment.objects.filter(
        enrollment__course__training_partner=training_partner,
        created_at__gte=thirty_days_ago
    )
    
    analytics = {
        'total_payments': payments.count(),
        'successful_payments': payments.filter(status__in=['paid', 'verified']).count(),
        'pending_verification': payments.filter(status='paid').count(),
        'rejected_payments': payments.filter(status='rejected').count(),
        'total_revenue': payments.filter(
            status__in=['paid', 'verified']
        ).aggregate(Sum('amount'))['amount__sum'] or 0,
        'payment_status_breakdown': list(
            payments.values('status').annotate(count=Count('status'))
        )
    }
    
    return Response(analytics, status=status.HTTP_200_OK)
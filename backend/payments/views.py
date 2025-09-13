# backend/courses/views/payment_views.py
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import razorpay
import hmac
import hashlib
import json
import logging

from courses.models import Course, Enrollment
from .models import Payment, PaymentWebhook, PaymentNotification, PaymentLog
from .serializers import PaymentSerializer, PaymentCreateSerializer

# Setup logging
logger = logging.getLogger(__name__)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


def create_payment_log(payment, level, event_type, message, data=None, request=None):
    """Utility function to create payment logs"""
    log_data = {
        'payment': payment,
        'level': level,
        'event_type': event_type,
        'message': message,
        'data': data or {}
    }
    
    if request:
        log_data.update({
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'ip_address': request.META.get('REMOTE_ADDR', '')
        })
    
    PaymentLog.objects.create(**log_data)


def create_payment_notification(payment, notification_type, recipient, title, message):
    """Utility function to create payment notifications"""
    PaymentNotification.objects.create(
        recipient=recipient,
        recipient_type='admin' if recipient.role == 'admin' else 'user',
        notification_type=notification_type,
        title=title,
        message=message,
        payment=payment,
        course_title=payment.enrollment.course.title
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_order(request):
    """Create Razorpay order for course enrollment"""
    
    serializer = PaymentCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    course_slug = serializer.validated_data['course_slug']
    course = get_object_or_404(Course, slug=course_slug, is_published=True)
    
    # Check if user already enrolled
    existing_enrollment = Enrollment.objects.filter(
        student=request.user, 
        course=course
    ).first()
    
    if existing_enrollment:
        # If already enrolled and active, return error
        if existing_enrollment.status == 'active':
            return Response(
                {'error': 'You are already enrolled in this course'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        # If pending, return existing payment info
        elif existing_enrollment.status == 'pending':
            existing_payment = Payment.objects.filter(enrollment=existing_enrollment).first()
            if existing_payment:
                return Response({
                    'order_id': existing_payment.razorpay_order_id,
                    'amount': int(existing_payment.amount * 100),  # Convert to paise
                    'currency': 'INR',
                    'key': settings.RAZORPAY_KEY_ID,
                    'enrollment_id': str(existing_enrollment.id),
                    'message': 'Payment order already exists'
                })
    
    try:
        # Create or update enrollment
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
            defaults={'status': 'pending'}
        )
        
        if not created:
            enrollment.status = 'pending'
            enrollment.save()
        
        # Check if payment already exists for this enrollment
        existing_payment = Payment.objects.filter(enrollment=enrollment).first()
        
        if existing_payment:
            # If payment exists and is still pending/initiated, return existing order
            if existing_payment.status in ['pending', 'initiated']:
                return Response({
                    'order_id': existing_payment.razorpay_order_id,
                    'amount': int(existing_payment.amount * 100),  # Convert to paise
                    'currency': 'INR',
                    'key': settings.RAZORPAY_KEY_ID,
                    'course_title': course.title,
                    'user_name': request.user.full_name,
                    'user_email': request.user.email,
                    'description': f'Enrollment for {course.title}',
                    'prefill': {
                        'name': request.user.full_name,
                        'email': request.user.email,
                    },
                    'theme': {
                        'color': '#3399cc'
                    }
                }, status=status.HTTP_200_OK)
            else:
                # If payment is completed, return error
                return Response(
                    {'error': 'Payment already completed for this course'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            'amount': int(course.price * 100),  # Convert to paise (₹1 = 100 paise)
            'currency': 'INR',
            'payment_capture': 1,  # Auto capture
            'notes': {
                'course_id': str(course.id),
                'user_id': str(request.user.id),
                'course_title': course.title,
                'training_partner': course.training_partner.name
            }
        })
        
        # Create payment record
        payment = Payment.objects.create(
            enrollment=enrollment,
            user=request.user,
            razorpay_order_id=razorpay_order['id'],
            amount=course.price,
            status='initiated'
        )
        
        # Log the order creation
        create_payment_log(
            payment=payment,
            level='info',
            event_type='order_created',
            message=f'Payment order created for course: {course.title}',
            data=razorpay_order,
            request=request
        )
        
        return Response({
            'order_id': razorpay_order['id'],
            'amount': razorpay_order['amount'],
            'currency': razorpay_order['currency'],
            'key': settings.RAZORPAY_KEY_ID,
            'course_title': course.title,
            'user_name': request.user.full_name,
            'user_email': request.user.email,
            'description': f'Enrollment for {course.title}',
            'prefill': {
                'name': request.user.full_name,
                'email': request.user.email,
            },
            'theme': {
                'color': '#3399cc'
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Payment order creation failed: {str(e)}")
        create_payment_log(
            payment=None,
            level='error',
            event_type='order_creation_failed',
            message=f'Failed to create payment order: {str(e)}',
            data={'course_id': str(course.id), 'user_id': str(request.user.id)},
            request=request
        )
        return Response(
            {'error': 'Failed to create payment order. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """Verify payment after successful payment from frontend"""
    
    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_signature = request.data.get('razorpay_signature')
    
    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
        return Response(
            {'error': 'Missing payment details'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        payment = get_object_or_404(
            Payment, 
            razorpay_order_id=razorpay_order_id,
            user=request.user
        )
        
        # Verify signature
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != razorpay_signature:
            payment.status = 'failed'
            payment.save()
            
            create_payment_log(
                payment=payment,
                level='error',
                event_type='signature_verification_failed',
                message='Payment signature verification failed',
                data=request.data,
                request=request
            )
            
            return Response(
                {'error': 'Payment verification failed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update payment details
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = 'paid'
        payment.save()
        
        # Update enrollment status
        payment.enrollment.status = 'payment_verification'
        payment.enrollment.save()
        
        # Create notification for admin
        admin_user = payment.enrollment.course.training_partner.users.filter(role='admin').first()
        if admin_user:
            create_payment_notification(
                payment=payment,
                notification_type='verification_needed',
                recipient=admin_user,
                title='New Payment Verification Required',
                message=f'{payment.user.full_name} has paid ₹{payment.amount} for {payment.enrollment.course.title}. Please verify and approve the enrollment.'
            )
        
        # Create notification for user
        create_payment_notification(
            payment=payment,
            notification_type='payment_received',
            recipient=payment.user,
            title='Payment Successful',
            message=f'Your payment of ₹{payment.amount} for {payment.enrollment.course.title} has been received. Waiting for admin approval.'
        )
        
        # Log successful verification
        create_payment_log(
            payment=payment,
            level='info',
            event_type='payment_verified',
            message='Payment verified successfully',
            data=request.data,
            request=request
        )
        
        return Response({
            'message': 'Payment verified successfully. Waiting for admin approval.',
            'status': 'payment_verification',
            'payment_id': str(payment.id),
            'enrollment_status': payment.enrollment.status
        }, status=status.HTTP_200_OK)
        
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Payment verification failed: {str(e)}")
        create_payment_log(
            payment=None,
            level='error',
            event_type='verification_error',
            message=f'Payment verification error: {str(e)}',
            data={'request_data': request.data}
        )
        return Response(
            {'error': 'Payment verification failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def webhook_test(request):
    """Test endpoint for webhook"""
    return Response({
        'message': 'Webhook endpoint is working',
        'status': 'success',
        'timestamp': timezone.now().isoformat()
    })


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    """Handle Razorpay webhooks"""
    
    try:
        # Get webhook signature
        webhook_signature = request.META.get('HTTP_X_RAZORPAY_SIGNATURE')
        webhook_body = request.body
        
        # Parse webhook data
        webhook_data = json.loads(webhook_body)
        event_type = webhook_data.get('event')
        
        # Verify webhook signature (if webhook secret is configured)
        signature_verified = True
        if settings.RAZORPAY_WEBHOOK_SECRET:
            expected_signature = hmac.new(
                settings.RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
                webhook_body,
                hashlib.sha256
            ).hexdigest()
            signature_verified = hmac.compare_digest(expected_signature, webhook_signature or '')
        
        # Store webhook
        webhook = PaymentWebhook.objects.create(
            event_type=event_type,
            webhook_id=webhook_data.get('payload', {}).get('payment', {}).get('entity', {}).get('id', ''),
            raw_data=webhook_data,
            signature=webhook_signature,
            signature_verified=signature_verified
        )
        
        # Process webhook if signature is verified
        if signature_verified:
            process_webhook(webhook)
        
        return HttpResponse(status=200)
        
    except Exception as e:
        logger.error(f"Webhook processing failed: {str(e)}")
        PaymentLog.objects.create(
            level='error',
            event_type='webhook_error',
            message=f'Webhook processing failed: {str(e)}',
            data={'error': str(e), 'raw_body': request.body.decode('utf-8', errors='ignore')}
        )
        return HttpResponse(status=500)


def process_webhook(webhook):
    """Process verified webhook"""
    try:
        event_type = webhook.event_type
        payload = webhook.raw_data.get('payload', {})
        payment_entity = payload.get('payment', {}).get('entity', {})
        
        if event_type == 'payment.captured':
            # Payment was successful
            razorpay_payment_id = payment_entity.get('id')
            razorpay_order_id = payment_entity.get('order_id')
            
            # Find payment record
            payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).first()
            if payment:
                payment.webhook_received = True
                payment.webhook_verified = True
                payment.last_webhook_at = timezone.now()
                
                if payment.status == 'initiated':
                    payment.status = 'paid'
                    payment.razorpay_payment_id = razorpay_payment_id
                    payment.enrollment.status = 'payment_verification'
                    payment.enrollment.save()
                
                payment.save()
                webhook.payment = payment
                webhook.processed = True
                webhook.processed_at = timezone.now()
                webhook.save()
                
                create_payment_log(
                    payment=payment,
                    level='info',
                    event_type='webhook_processed',
                    message=f'Webhook {event_type} processed successfully',
                    data=webhook.raw_data
                )
        
        elif event_type == 'payment.failed':
            # Payment failed
            razorpay_order_id = payment_entity.get('order_id')
            payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).first()
            
            if payment:
                payment.status = 'failed'
                payment.webhook_received = True
                payment.last_webhook_at = timezone.now()
                payment.save()
                
                webhook.payment = payment
                webhook.processed = True
                webhook.processed_at = timezone.now()
                webhook.save()
                
                # Notify user of failed payment
                create_payment_notification(
                    payment=payment,
                    notification_type='payment_failed',
                    recipient=payment.user,
                    title='Payment Failed',
                    message=f'Your payment for {payment.enrollment.course.title} has failed. Please try again.'
                )
        
    except Exception as e:
        webhook.processing_error = str(e)
        webhook.save()
        logger.error(f"Webhook processing error: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, order_id):
    """Get payment status for an order"""
    
    try:
        payment = get_object_or_404(
            Payment, 
            razorpay_order_id=order_id,
            user=request.user
        )
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_payment_history(request):
    """Get user's payment history"""
    
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
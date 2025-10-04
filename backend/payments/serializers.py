# backend/payments/serializers.py
from rest_framework import serializers
from .models import Payment, PaymentNotification, PaymentWebhook
from users.serializers import UserProfileSerializer


class PaymentCreateSerializer(serializers.Serializer):
    """Serializer for creating payment orders"""
    course_slug = serializers.CharField(max_length=220)
    
    def validate_course_slug(self, value):
        # Additional validation can be added here
        return value


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment details"""
    
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    course_title = serializers.CharField(source='enrollment.course.title', read_only=True)
    course_slug = serializers.CharField(source='enrollment.course.slug', read_only=True)
    training_partner = serializers.CharField(source='enrollment.course.training_partner.name', read_only=True)
    enrollment_status = serializers.CharField(source='enrollment.status', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'razorpay_order_id', 'razorpay_payment_id', 
            'amount', 'currency', 'status', 'created_at', 
            'paid_at', 'verified_at', 'verification_notes',
            'user_name', 'user_email', 'course_title', 
            'course_slug', 'training_partner', 'enrollment_status',
            'webhook_received', 'webhook_verified'
        ]
        read_only_fields = ['id', 'created_at', 'paid_at', 'verified_at']


class PaymentNotificationSerializer(serializers.ModelSerializer):
    """Serializer for payment notifications"""
    
    class Meta:
        model = PaymentNotification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'course_title', 'is_read', 'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'created_at']


class PaymentVerificationSerializer(serializers.Serializer):
    """Serializer for admin payment verification"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)


class PendingPaymentSerializer(serializers.ModelSerializer):
    """Serializer for admin pending payments list"""
    
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    course_title = serializers.CharField(source='enrollment.course.title', read_only=True)
    course_slug = serializers.CharField(source='enrollment.course.slug', read_only=True)
    verified_by = serializers.CharField(source='verified_by.full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'razorpay_order_id', 'razorpay_payment_id',
            'amount', 'status', 'created_at', 'paid_at', 'verified_at',
            'verification_notes', 'user_name', 'user_email', 
            'course_title', 'course_slug', 'verified_by'
        ]


class WebhookSerializer(serializers.ModelSerializer):
    """Serializer for webhook data"""
    
    class Meta:
        model = PaymentWebhook
        fields = [
            'id', 'event_type', 'webhook_id', 'signature_verified',
            'processed', 'processing_error', 'created_at', 'processed_at'
        ]
        read_only_fields = ['id', 'created_at']

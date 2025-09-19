# backend/payments/models.py
from django.db import models
from django.utils import timezone
from courses.models.enrollment import Enrollment
from users.models import User
import uuid


class Payment(models.Model):
    """Enhanced payment tracking model"""
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('initiated', 'Payment Initiated'),
        ('paid', 'Payment Successful'),
        ('failed', 'Payment Failed'),
        ('verified', 'Admin Verified'),
        ('rejected', 'Admin Rejected'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    enrollment = models.OneToOneField(
        Enrollment, 
        on_delete=models.CASCADE, 
        related_name='payment'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='payments'
    )
    
    # Razorpay Details
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=500, null=True, blank=True)
    
    # Payment Details
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Admin Verification
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='verified_payments',
        limit_choices_to={'role': 'admin'}
    )
    verification_notes = models.TextField(blank=True, null=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # NEW: Webhook tracking
    webhook_received = models.BooleanField(default=False)
    webhook_verified = models.BooleanField(default=False)
    last_webhook_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['razorpay_order_id']),
            models.Index(fields=['webhook_received']),
        ]
        
    def save(self, *args, **kwargs):
        if self.status == 'paid' and not self.paid_at:
            self.paid_at = timezone.now()
        if self.status == 'verified' and not self.verified_at:
            self.verified_at = timezone.now()
        super().save(*args, **kwargs)
    
    @property
    def is_successful(self):
        return self.status in ['paid', 'verified']
    
    @property
    def needs_verification(self):
        return self.status == 'paid'
    
    def __str__(self):
        return f"Payment {self.razorpay_order_id} - {self.user.full_name}"


class PaymentWebhook(models.Model):
    """Store all webhook events from Razorpay"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Webhook Details
    event_type = models.CharField(max_length=100)  # payment.captured, payment.failed, etc.
    webhook_id = models.CharField(max_length=100, unique=True)  # Razorpay webhook ID
    
    # Payment Reference
    payment = models.ForeignKey(
        Payment, 
        on_delete=models.CASCADE, 
        related_name='webhooks',
        null=True, 
        blank=True
    )
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    
    # Raw Data
    raw_data = models.JSONField()  # Complete webhook payload
    signature = models.CharField(max_length=500, null=True, blank=True)
    signature_verified = models.BooleanField(default=False)
    
    # Processing Status
    processed = models.BooleanField(default=False)
    processing_error = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Payment Webhook'
        verbose_name_plural = 'Payment Webhooks'
        ordering = ['-created_at']


class PaymentNotification(models.Model):
    """Notifications for payment-related events"""
    
    NOTIFICATION_TYPES = [
        ('payment_received', 'Payment Received'),
        ('payment_failed', 'Payment Failed'),
        ('verification_needed', 'Admin Verification Needed'),
        ('payment_approved', 'Payment Approved'),
        ('payment_rejected', 'Payment Rejected'),
        ('enrollment_activated', 'Enrollment Activated'),
    ]
    
    RECIPIENT_TYPES = [
        ('user', 'Learner'),
        ('admin', 'Knowledge Partner Admin'),
        ('super_admin', 'Super Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Recipients
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_notifications')
    recipient_type = models.CharField(max_length=20, choices=RECIPIENT_TYPES)
    
    # Notification Details
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Related Objects
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='notifications')
    course_title = models.CharField(max_length=200)  # Denormalized for quick access
    
    # Status
    is_read = models.BooleanField(default=False)
    is_email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Payment Notification'
        verbose_name_plural = 'Payment Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
        ]
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class PaymentLog(models.Model):
    """Detailed logging for debugging"""
    
    LOG_LEVELS = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('debug', 'Debug'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Reference
    payment = models.ForeignKey(
        Payment, 
        on_delete=models.CASCADE, 
        related_name='logs',
        null=True, 
        blank=True
    )
    
    # Log Details
    level = models.CharField(max_length=10, choices=LOG_LEVELS, default='info')
    event_type = models.CharField(max_length=50)
    message = models.TextField()
    data = models.JSONField(null=True, blank=True)
    
    # Context
    user_agent = models.TextField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Payment Log'
        verbose_name_plural = 'Payment Logs'
        ordering = ['-created_at']
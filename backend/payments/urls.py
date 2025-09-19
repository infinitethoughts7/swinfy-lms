# backend/payments/urls.py
from django.urls import path
from . import views
from .admin_views import (
    pending_payments,
    verify_payment as admin_verify_payment,
    payment_history as admin_payment_history,
    user_notifications,
    mark_notification_read,
    payment_analytics
)

urlpatterns = [
    # User payment endpoints
    path('create-order/', views.create_payment_order, name='create_payment_order'),
    path('verify/', views.verify_payment, name='verify_payment'),
    path('status/<str:order_id>/', views.payment_status, name='payment_status'),
    path('history/', views.user_payment_history, name='user_payment_history'),
    
    # Admin payment endpoints
    path('admin/pending/', pending_payments, name='pending_payments'),
    path('admin/verify/<uuid:payment_id>/', admin_verify_payment, name='admin_verify_payment'),
    path('admin/history/', admin_payment_history, name='admin_payment_history'),
    path('admin/analytics/', payment_analytics, name='payment_analytics'),
    
    # Notification endpoints
    path('notifications/', user_notifications, name='user_notifications'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='mark_notification_read'),
    
    # Webhook endpoints
    path('webhook/', views.razorpay_webhook, name='razorpay_webhook'),
    path('webhook/test/', views.webhook_test, name='webhook_test'),
]

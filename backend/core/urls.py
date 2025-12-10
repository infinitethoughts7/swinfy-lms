"""
Core app URLs - Content moderation and utility endpoints.
"""
from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Content Moderation
    path('moderation/check/', views.check_content, name='check-content'),
    path('moderation/check-batch/', views.check_content_batch, name='check-content-batch'),
]

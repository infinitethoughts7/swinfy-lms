from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses.views.live_session_views import (
    LiveSessionViewSet,
    InstructorLiveSessionViewSet,
    TrainingPartnerLiveSessionViewSet,
    LearnerLiveSessionViewSet
)

# Create router for live session viewsets
router = DefaultRouter()
router.register(r'live-sessions', LiveSessionViewSet, basename='live-sessions')
router.register(r'instructor/live-sessions', InstructorLiveSessionViewSet, basename='instructor-live-sessions')
router.register(r'training-partner/live-sessions', TrainingPartnerLiveSessionViewSet, basename='training-partner-live-sessions')
router.register(r'learner/live-sessions', LearnerLiveSessionViewSet, basename='learner-live-sessions')

urlpatterns = [
    path('', include(router.urls)),
]

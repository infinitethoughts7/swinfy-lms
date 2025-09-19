from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db.models import Q, Prefetch
from django.utils import timezone

from courses.models import Course, CourseModule, Lesson, LessonMaterial, CourseResource
from courses.serializers.instructor_serializers import InstructorCourseListSerializer, InstructorCourseDetailSerializer
from users.permissions import IsKnowledgePartnerAdmin


class CourseReviewListView(generics.ListAPIView):
    """List courses pending review for KP admins."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]
    serializer_class = InstructorCourseListSerializer
    
    def get_queryset(self):
        """Return courses that need review by the KP admin."""
        # Get the Knowledge Partner user
        kp_user = self.request.user
        
        # Find the KPProfile where this user is the Knowledge Partner
        try:
            from users.models import KPProfile
            kp_profile = KPProfile.objects.get(user=kp_user)
        except KPProfile.DoesNotExist:
            return Course.objects.none()
        
        # Return courses that are pending approval AND belong to the same KP organization
        return Course.objects.filter(
            approval_status='pending_approval',
            training_partner=kp_profile
        ).select_related('tutor', 'training_partner').prefetch_related(
            Prefetch('modules', queryset=CourseModule.objects.all()),
            Prefetch('modules__lessons', queryset=Lesson.objects.all()),
            Prefetch('modules__lessons__materials', queryset=LessonMaterial.objects.all())
        ).order_by('-created_at')


class ApprovedCoursesListView(generics.ListAPIView):
    """List approved courses for KP admins."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]
    serializer_class = InstructorCourseListSerializer
    
    def get_queryset(self):
        """Return approved courses for the KP admin."""
        # Get the Knowledge Partner user
        kp_user = self.request.user
        
        # Find the KPProfile where this user is the Knowledge Partner
        try:
            from users.models import KPProfile
            kp_profile = KPProfile.objects.get(user=kp_user)
        except KPProfile.DoesNotExist:
            return Course.objects.none()
        
        # Return approved courses that belong to the same KP organization
        return Course.objects.filter(
            approval_status='approved',
            training_partner=kp_profile
        ).select_related('tutor', 'training_partner').prefetch_related(
            Prefetch('modules', queryset=CourseModule.objects.all()),
            Prefetch('modules__lessons', queryset=Lesson.objects.all()),
            Prefetch('modules__lessons__materials', queryset=LessonMaterial.objects.all())
        ).order_by('-created_at')


class CourseReviewDetailView(generics.RetrieveAPIView):
    """Get detailed course information for review."""
    
    permission_classes = [permissions.IsAuthenticated, IsKnowledgePartnerAdmin]
    serializer_class = InstructorCourseDetailSerializer
    
    def get_queryset(self):
        """Return courses that can be reviewed by the KP admin."""
        # Get the Knowledge Partner user
        kp_user = self.request.user
        
        # Find the KPProfile where this user is the Knowledge Partner
        try:
            from users.models import KPProfile
            kp_profile = KPProfile.objects.get(user=kp_user)
        except KPProfile.DoesNotExist:
            return Course.objects.none()
        
        # Return pending courses that belong to the same KP organization
        return Course.objects.filter(
            approval_status='pending_approval',
            training_partner=kp_profile
        ).select_related('tutor', 'training_partner').prefetch_related(
            Prefetch('modules', queryset=CourseModule.objects.all()),
            Prefetch('modules__lessons', queryset=Lesson.objects.all()),
            Prefetch('modules__lessons__materials', queryset=LessonMaterial.objects.all())
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerAdmin])
def approve_course(request, course_id):
    """Approve a course for publication."""
    try:
        course = get_object_or_404(Course, id=course_id, approval_status='pending_approval')
        
        # Update course status
        course.approval_status = 'approved'
        course.is_approved_by_training_partner = True
        course.training_partner_admin_approved_by = request.user
        course.approval_notes = request.data.get('notes', '')
        course.is_published = True
        course.is_draft = False
        
        # Make approved courses public and accessible
        course.is_private = False  # Make course public
        course.requires_admin_enrollment = False  # Allow direct enrollment
        
        course.save()
        
        return Response({
            'message': 'Course approved successfully',
            'course_id': str(course.id),
            'status': course.approval_status
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to approve course: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerAdmin])
def reject_course(request, course_id):
    """Reject a course and provide feedback."""
    try:
        course = get_object_or_404(Course, id=course_id, approval_status='pending_approval')
        
        # Get rejection notes from request
        rejection_notes = request.data.get('notes', '')
        if not rejection_notes:
            return Response({
                'error': 'Rejection notes are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update course status
        course.approval_status = 'rejected'
        course.is_approved_by_training_partner = False
        course.training_partner_admin_approved_by = request.user
        course.approval_notes = rejection_notes
        course.is_published = False
        course.is_draft = True
        course.save()
        
        return Response({
            'message': 'Course rejected successfully',
            'course_id': str(course.id),
            'status': course.approval_status,
            'notes': rejection_notes
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to reject course: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsKnowledgePartnerAdmin])
def course_review_stats(request):
    """Get statistics for course review dashboard."""
    try:
        # Count courses by status
        total_pending = Course.objects.filter(approval_status='pending_approval').count()
        total_approved = Course.objects.filter(approval_status='approved').count()
        total_rejected = Course.objects.filter(approval_status='rejected').count()
        total_draft = Course.objects.filter(approval_status='draft').count()
        
        # Recent activity
        recent_courses = Course.objects.filter(
            approval_status='pending_approval'
        ).select_related('tutor').order_by('-created_at')[:5]
        
        recent_activity = []
        for course in recent_courses:
            recent_activity.append({
                'id': str(course.id),
                'title': course.title,
                'instructor': course.tutor.full_name if course.tutor else 'Unknown',
                'created_at': course.created_at.isoformat(),
                'status': course.approval_status
            })
        
        return Response({
            'stats': {
                'total_pending': total_pending,
                'total_approved': total_approved,
                'total_rejected': total_rejected,
                'total_draft': total_draft
            },
            'recent_activity': recent_activity
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to fetch review stats: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from datetime import datetime

from ..models import AttendanceRecord, Course, Enrollment
from ..serializers.attendance_serializers import (
    AttendanceRecordSerializer,
    AttendanceMarkSerializer,
    AttendanceListSerializer
)
from ..permissions import IsKnowledgePartnerInstructor


class AttendanceListView(generics.ListAPIView):
    """List attendance records for a course and date."""
    
    serializer_class = AttendanceListSerializer
    permission_classes = [IsAuthenticated, IsKnowledgePartnerInstructor]
    
    def get_queryset(self):
        course_id = self.request.query_params.get('course')
        date = self.request.query_params.get('date')
        
        queryset = AttendanceRecord.objects.all()
        
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(session_date=date_obj)
            except ValueError:
                pass
        
        return queryset.order_by('-session_date', 'learner__full_name')


class AttendanceMarkView(generics.CreateAPIView):
    """Mark attendance for multiple learners."""
    
    serializer_class = AttendanceMarkSerializer
    permission_classes = [IsAuthenticated, IsKnowledgePartnerInstructor]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        course_id = serializer.validated_data['course_id']
        session_date = serializer.validated_data['session_date']
        attendance_records = serializer.validated_data['attendance_records']
        
        try:
            with transaction.atomic():
                # Delete existing records for this course and date
                AttendanceRecord.objects.filter(
                    course_id=course_id,
                    session_date=session_date
                ).delete()
                
                # Create new records
                created_records = []
                for record_data in attendance_records:
                    record = AttendanceRecord.objects.create(
                        learner_id=record_data['learner_id'],
                        course_id=course_id,
                        session_date=session_date,
                        status=record_data['status'],
                        notes=record_data.get('notes', ''),
                        marked_by=request.user
                    )
                    created_records.append(record)
                
                # Serialize the created records
                response_serializer = AttendanceListSerializer(created_records, many=True)
                
                return Response({
                    'success': True,
                    'message': f'Attendance marked for {len(created_records)} learners',
                    'data': response_serializer.data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error marking attendance: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsKnowledgePartnerInstructor])
def instructor_courses_with_learners(request):
    """Get courses with enrolled learners for attendance marking."""
    
    # Get courses where the user is an instructor
    courses = Course.objects.filter(
        instructors=request.user,
        is_published=True
    ).prefetch_related('enrollments__learner')
    
    courses_data = []
    for course in courses:
        # Get enrolled learners
        enrollments = course.enrollments.filter(
            status__in=['approved', 'active', 'completed']
        ).select_related('learner')
        
        learners_data = []
        for enrollment in enrollments:
            learners_data.append({
                'id': enrollment.learner.id,
                'full_name': enrollment.learner.full_name,
                'email': enrollment.learner.email,
                'profile_picture': enrollment.learner.profile_picture.url if enrollment.learner.profile_picture else None,
                'enrollment_date': enrollment.created_at.isoformat(),
                'progress_percentage': enrollment.progress_percentage
            })
        
        courses_data.append({
            'id': course.id,
            'title': course.title,
            'slug': course.slug,
            'enrolled_learners': learners_data
        })
    
    return Response({
        'success': True,
        'data': courses_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsKnowledgePartnerInstructor])
def attendance_stats(request):
    """Get attendance statistics for a course."""
    
    course_id = request.query_params.get('course')
    if not course_id:
        return Response({
            'success': False,
            'message': 'Course ID is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Check if user is instructor for this course
        if not course.instructors.filter(id=request.user.id).exists():
            return Response({
                'success': False,
                'message': 'You don\'t have permission to view attendance for this course'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get attendance records for the course
        attendance_records = AttendanceRecord.objects.filter(course=course)
        
        # Calculate statistics
        total_records = attendance_records.count()
        present_count = attendance_records.filter(status='present').count()
        absent_count = attendance_records.filter(status='absent').count()
        late_count = attendance_records.filter(status='late').count()
        
        # Get unique session dates
        session_dates = attendance_records.values_list('session_date', flat=True).distinct().order_by('-session_date')
        
        stats = {
            'total_records': total_records,
            'present_count': present_count,
            'absent_count': absent_count,
            'late_count': late_count,
            'attendance_rate': round((present_count + late_count) / total_records * 100, 2) if total_records > 0 else 0,
            'session_dates': list(session_dates)
        }
        
        return Response({
            'success': True,
            'data': stats
        })
        
    except Course.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Course not found'
        }, status=status.HTTP_404_NOT_FOUND)

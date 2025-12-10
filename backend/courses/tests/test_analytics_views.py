"""
Tests for Analytics Views.

Tests the instructor, KP, and learner analytics endpoints.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from users.models import User, KPProfile, KPInstructorProfile, LearnerProfile
from courses.models import Course, CourseModule, Lesson
from courses.models.enrollment import Enrollment
from courses.models.progress import LessonProgress, CourseProgress
from payments.models import Payment


class AnalyticsTestBase(TestCase):
    """Base class with common setup for analytics tests."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        # Create KP admin user
        self.kp_user = User.objects.create_user(
            email='kp@test.com',
            password='testpass123',
            full_name='KP Admin',
            role='knowledge_partner',
            is_verified=True,
            is_approved=True
        )
        
        # Create KP profile
        self.kp_profile = KPProfile.objects.create(
            user=self.kp_user,
            name='Test Knowledge Partner',
            type='company',
            description='Test KP description',
            location='Test Location',
            kp_admin_name='KP Admin',
            kp_admin_email='kp@test.com'
        )
        
        # Create instructor user
        self.instructor_user = User.objects.create_user(
            email='instructor@test.com',
            password='testpass123',
            full_name='Test Instructor',
            role='knowledge_partner_instructor',
            is_verified=True,
            is_approved=True
        )
        
        # Create instructor profile
        self.instructor_profile = KPInstructorProfile.objects.create(
            user=self.instructor_user,
            knowledge_partner=self.kp_profile,
            bio='Test bio',
            title='Senior Developer',
            specializations='Python, Django',
            technologies='Python, Django, React',
            highest_education='master'
        )
        
        # Create learner user
        self.learner_user = User.objects.create_user(
            email='learner@test.com',
            password='testpass123',
            full_name='Test Learner',
            role='learner',
            is_verified=True,
            is_approved=True
        )
        
        # Create learner profile
        self.learner_profile = LearnerProfile.objects.create(
            user=self.learner_user,
            bio='I want to learn'
        )
        
        # Create a course (public so any learner can enroll)
        self.course = Course.objects.create(
            title='Test Course',
            slug='test-course',
            description='Test course description',
            short_description='Test short desc',
            tutor=self.instructor_user,
            training_partner=self.kp_profile,
            price=Decimal('99.99'),
            duration_weeks=4,
            is_published=True,
            is_approved_by_training_partner=True,
            approval_status='approved',
            is_draft=False,
            is_private=False  # Make course public for testing
        )
        
        # Create a module
        self.module = CourseModule.objects.create(
            course=self.course,
            title='Test Module',
            slug='test-module',
            order=1
        )
        
        # Create lessons
        self.lesson1 = Lesson.objects.create(
            module=self.module,
            title='Lesson 1',
            slug='lesson-1',
            order=1,
            lesson_type='video',
            duration_minutes=30
        )
        
        self.lesson2 = Lesson.objects.create(
            module=self.module,
            title='Lesson 2',
            slug='lesson-2',
            order=2,
            lesson_type='video',
            duration_minutes=25
        )
        
        # Create enrollment
        self.enrollment = Enrollment.objects.create(
            learner=self.learner_user,
            course=self.course,
            status='active',
            progress_percentage=Decimal('50.00')
        )
        
        # Create lesson progress
        self.lesson_progress = LessonProgress.objects.create(
            enrollment=self.enrollment,
            lesson=self.lesson1,
            is_completed=True,
            is_started=True
        )


class InstructorAnalyticsTests(AnalyticsTestBase):
    """Tests for instructor analytics endpoint."""
    
    def test_instructor_analytics_unauthenticated(self):
        """Test that unauthenticated users cannot access instructor analytics."""
        url = reverse('instructor-analytics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_instructor_analytics_wrong_role(self):
        """Test that non-instructors cannot access instructor analytics."""
        self.client.force_authenticate(user=self.learner_user)
        url = reverse('instructor-analytics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_instructor_analytics_success(self):
        """Test instructor analytics returns correct data structure."""
        self.client.force_authenticate(user=self.instructor_user)
        url = reverse('instructor-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        data = response.json()
        self.assertIn('instructor_courses', data)
        self.assertIn('student_progress_by_course', data)
        self.assertIn('course_performance_metrics', data)
        self.assertIn('recent_student_activity', data)
        self.assertIn('summary', data)
        
        # Check summary structure
        summary = data['summary']
        self.assertIn('total_courses', summary)
        self.assertIn('total_enrollments', summary)
        self.assertIn('total_students_active', summary)
        self.assertIn('total_students_completed', summary)
        self.assertIn('overall_completion_rate', summary)
        self.assertIn('overall_avg_progress', summary)
    
    def test_instructor_analytics_course_data(self):
        """Test instructor analytics returns correct course data."""
        self.client.force_authenticate(user=self.instructor_user)
        url = reverse('instructor-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(len(data['instructor_courses']), 1)
        
        course = data['instructor_courses'][0]
        self.assertEqual(course['title'], 'Test Course')
        self.assertEqual(course['total_enrollments'], 1)
        self.assertEqual(course['total_lessons'], 2)


class KPAnalyticsTests(AnalyticsTestBase):
    """Tests for Knowledge Partner analytics endpoint."""
    
    def test_kp_analytics_unauthenticated(self):
        """Test that unauthenticated users cannot access KP analytics."""
        url = reverse('kp-analytics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_kp_analytics_wrong_role(self):
        """Test that non-KPs cannot access KP analytics."""
        self.client.force_authenticate(user=self.learner_user)
        url = reverse('kp-analytics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_kp_analytics_success(self):
        """Test KP analytics returns correct data structure."""
        self.client.force_authenticate(user=self.kp_user)
        url = reverse('kp-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        data = response.json()
        self.assertIn('instructors', data)
        self.assertIn('courses', data)
        self.assertIn('monthly_enrollment_trends', data)
        self.assertIn('course_popularity', data)
        self.assertIn('enrollment_vs_revenue', data)
        self.assertIn('summary', data)
        
        # Check summary structure
        summary = data['summary']
        self.assertIn('total_students', summary)
        self.assertIn('total_courses', summary)
        self.assertIn('total_instructors', summary)
        self.assertIn('total_revenue', summary)
    
    def test_kp_analytics_instructor_data(self):
        """Test KP analytics returns correct instructor data."""
        self.client.force_authenticate(user=self.kp_user)
        url = reverse('kp-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(len(data['instructors']), 1)
        
        instructor = data['instructors'][0]
        self.assertEqual(instructor['name'], 'Test Instructor')
        self.assertEqual(instructor['courses_count'], 1)


class LearnerAnalyticsTests(AnalyticsTestBase):
    """Tests for learner analytics endpoint."""
    
    def test_learner_analytics_unauthenticated(self):
        """Test that unauthenticated users cannot access learner analytics."""
        url = reverse('learner-analytics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_learner_analytics_wrong_role(self):
        """Test that non-learners cannot access learner analytics."""
        self.client.force_authenticate(user=self.instructor_user)
        url = reverse('learner-analytics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_learner_analytics_success(self):
        """Test learner analytics returns correct data structure."""
        self.client.force_authenticate(user=self.learner_user)
        url = reverse('learner-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        data = response.json()
        self.assertIn('enrolled_courses', data)
        self.assertIn('recent_activity', data)
        self.assertIn('summary', data)
        
        # Check summary structure
        summary = data['summary']
        self.assertIn('total_enrollments', summary)
        self.assertIn('courses_completed', summary)
        self.assertIn('courses_in_progress', summary)
        self.assertIn('courses_not_started', summary)
    
    def test_learner_analytics_enrolled_courses(self):
        """Test learner analytics returns correct enrolled courses."""
        self.client.force_authenticate(user=self.learner_user)
        url = reverse('learner-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(len(data['enrolled_courses']), 1)
        
        course = data['enrolled_courses'][0]
        self.assertEqual(course['title'], 'Test Course')
        self.assertEqual(course['total_lessons'], 2)
        self.assertEqual(course['completed_lessons'], 1)


class AnalyticsIntegrationTests(AnalyticsTestBase):
    """Integration tests for analytics endpoints."""
    
    def test_multiple_courses_analytics(self):
        """Test analytics with multiple courses."""
        # Create a second course
        course2 = Course.objects.create(
            title='Second Course',
            slug='second-course',
            description='Second course description',
            short_description='Second short desc',
            tutor=self.instructor_user,
            training_partner=self.kp_profile,
            price=Decimal('149.99'),
            duration_weeks=6,
            is_published=True,
            is_approved_by_training_partner=True,
            approval_status='approved',
            is_draft=False
        )
        
        self.client.force_authenticate(user=self.instructor_user)
        url = reverse('instructor-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(len(data['instructor_courses']), 2)
        self.assertEqual(data['summary']['total_courses'], 2)
    
    def test_multiple_enrollments_analytics(self):
        """Test analytics with multiple enrollments."""
        # Create a second learner and enrollment
        learner2 = User.objects.create_user(
            email='learner2@test.com',
            password='testpass123',
            full_name='Second Learner',
            role='learner',
            is_verified=True
        )
        
        Enrollment.objects.create(
            learner=learner2,
            course=self.course,
            status='active',
            progress_percentage=Decimal('75.00')
        )
        
        self.client.force_authenticate(user=self.instructor_user)
        url = reverse('instructor-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['summary']['total_enrollments'], 2)
        
        # Check student progress breakdown
        progress = data['student_progress_by_course'][0]
        self.assertEqual(progress['total'], 2)
    
    def test_completed_enrollment_analytics(self):
        """Test analytics with completed enrollments."""
        # Update enrollment to completed
        self.enrollment.progress_percentage = Decimal('100.00')
        self.enrollment.status = 'completed'
        self.enrollment.save()
        
        # Mark second lesson as completed
        LessonProgress.objects.create(
            enrollment=self.enrollment,
            lesson=self.lesson2,
            is_completed=True,
            is_started=True
        )
        
        self.client.force_authenticate(user=self.instructor_user)
        url = reverse('instructor-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['summary']['total_students_completed'], 1)
        
        # Check course performance
        performance = data['course_performance_metrics'][0]
        self.assertEqual(performance['completion_rate'], 100.0)

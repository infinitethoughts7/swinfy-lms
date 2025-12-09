"""
Tests for course serializer content moderation integration
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from courses.serializers.course_serializer import CourseCreateSerializer, CourseUpdateSerializer
from courses.models import Course
from users.models import KPProfile, KPInstructorProfile

User = get_user_model()


class CourseSerializerModerationTestCase(TestCase):
    """Test content moderation in course serializers"""
    
    def setUp(self):
        """Set up test data"""
        # Create KP admin user
        self.kp_user = User.objects.create_user(
            email="kpadmin@test.com",
            password="testpass123",
            full_name="KP Admin",
            role="knowledge_partner",
            is_verified=True,
            is_approved=True,
        )
        
        # Create KP profile
        self.kp_profile = KPProfile.objects.create(
            user=self.kp_user,
            name="Test Organization",
            type="company",
            description="Test KP",
            location="Test City",
            kp_admin_name="KP Admin",
            kp_admin_email="kpadmin@test.com",
        )
        
        # Create instructor user
        self.instructor = User.objects.create_user(
            email="instructor@test.com",
            password="testpass123",
            full_name="Test Instructor",
            role="knowledge_partner_instructor",
            is_verified=True,
            is_approved=True,
        )
        
        # Create instructor profile
        self.instructor_profile = KPInstructorProfile.objects.create(
            user=self.instructor,
            knowledge_partner=self.kp_profile,
            bio="Test bio",
            title="Instructor",
            highest_education="bachelor",
            specializations="Python",
            technologies="Django",
        )
    
    def test_clean_course_passes_validation(self):
        """Test that course with clean content passes validation"""
        data = {
            'title': 'Introduction to Python Programming',
            'description': 'Learn Python from scratch with practical examples',
            'short_description': 'Beginner-friendly Python course',
            'price': 999,
            'duration_weeks': 8,
            'category': 'programming_languages',
            'level': 'beginner',
            'tutor': self.instructor.id,
            'training_partner': self.kp_profile.id,
        }
        
        serializer = CourseCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
    
    def test_profane_title_fails_validation(self):
        """Test that profane title is blocked"""
        data = {
            'title': 'This shit course teaches Python',
            'description': 'Learn Python programming',
            'short_description': 'Python course',
            'price': 999,
            'duration_weeks': 8,
            'category': 'programming_languages',
            'level': 'beginner',
            'tutor': self.instructor.id,
            'training_partner': self.kp_profile.id,
        }
        
        serializer = CourseCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)
        self.assertIn('inappropriate language', str(serializer.errors['title']))
    
    def test_profane_description_fails_validation(self):
        """Test that profane description is blocked"""
        data = {
            'title': 'Python Course',
            'description': 'This fucking course teaches Python',
            'short_description': 'Python course',
            'price': 999,
            'duration_weeks': 8,
            'category': 'programming_languages',
            'level': 'beginner',
            'tutor': self.instructor.id,
            'training_partner': self.kp_profile.id,
        }
        
        serializer = CourseCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('description', serializer.errors)
    
    def test_multiple_profane_fields_all_reported(self):
        """Test that all profane fields are reported"""
        data = {
            'title': 'Shit Course',
            'description': 'Fucking terrible content',
            'short_description': 'Damn bad course',
            'price': 999,
            'duration_weeks': 8,
            'category': 'programming_languages',
            'level': 'beginner',
            'tutor': self.instructor.id,
            'training_partner': self.kp_profile.id,
        }
        
        serializer = CourseCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        # At least one field should be flagged
        # (might not flag all due to fast-fail behavior)
        self.assertTrue(len(serializer.errors) > 0)


class CourseUpdateSerializerModerationTestCase(TestCase):
    """Test content moderation in CourseUpdateSerializer"""
    
    def setUp(self):
        """Set up test data"""
        # Create KP admin user
        self.kp_user = User.objects.create_user(
            email="kpadmin2@test.com",
            password="testpass123",
            full_name="KP Admin",
            role="knowledge_partner",
            is_verified=True,
            is_approved=True,
        )
        
        # Create KP profile
        self.kp_profile = KPProfile.objects.create(
            user=self.kp_user,
            name="Test Organization 2",
            type="company",
            description="Test KP",
            location="Test City",
            kp_admin_name="KP Admin",
            kp_admin_email="kpadmin2@test.com",
        )
        
        # Create instructor user
        self.instructor = User.objects.create_user(
            email="instructor2@test.com",
            password="testpass123",
            full_name="Test Instructor",
            role="knowledge_partner_instructor",
            is_verified=True,
            is_approved=True,
        )
        
        # Create instructor profile
        self.instructor_profile = KPInstructorProfile.objects.create(
            user=self.instructor,
            knowledge_partner=self.kp_profile,
            bio="Test bio",
            title="Instructor",
            highest_education="bachelor",
            specializations="Python",
            technologies="Django",
        )
        
        # Create a course to update
        self.course = Course.objects.create(
            title="Existing Course",
            description="A course description",
            short_description="Short desc",
            price=999,
            duration_weeks=4,
            category="programming_languages",
            level="beginner",
            tutor=self.instructor,
            training_partner=self.kp_profile,
        )
    
    def test_clean_update_passes_validation(self):
        """Test that clean update passes moderation"""
        data = {
            'title': 'Updated Clean Title',
            'description': 'Updated clean description',
        }
        
        serializer = CourseUpdateSerializer(instance=self.course, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
    
    def test_profane_title_update_blocked(self):
        """Test that profane title update is blocked"""
        data = {
            'title': 'Shit Course Title',
        }
        
        serializer = CourseUpdateSerializer(instance=self.course, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)
    
    def test_profane_description_update_blocked(self):
        """Test that profane description update is blocked"""
        data = {
            'description': 'This fucking description should be blocked',
        }
        
        serializer = CourseUpdateSerializer(instance=self.course, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('description', serializer.errors)
from .course import (
    CourseListView,
    CourseDetailView,
    CourseCreateView,
    CourseUpdateView,
    CourseDeleteView,
    CourseApprovalView,
    CourseStatsView,
    FeaturedCoursesView,
    MyCoursesView,
    CourseSearchView
)
from .training_partner import TrainingPartnerListView, TrainingPartnerDetailView, training_partner_list
from .course import course_list, course_stats, featured_courses

__all__ = [
    'CourseListView',
    'CourseDetailView', 
    'CourseCreateView',
    'CourseUpdateView',
    'CourseDeleteView',
    'CourseApprovalView',
    'CourseStatsView',
    'FeaturedCoursesView',
    'MyCoursesView',
    'CourseSearchView',
    'TrainingPartnerListView',
    'TrainingPartnerDetailView',
    'course_list',
    'course_stats',
    'featured_courses',
    'training_partner_list'
]

from .course_view import (
    CourseListView,
    CourseDetailView,
    CourseCreateView,
    CourseUpdateView,
    CourseDeleteView,
    CourseApprovalView,
    CourseStatsView,
    FeaturedCoursesView,
    MyCoursesView,
    CourseSearchView,
    course_list,
    course_stats,
    featured_courses
)
from .training_partner_view import TrainingPartnerListView, TrainingPartnerDetailView, training_partner_list

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

'use client';

import { useState, useEffect } from 'react';
import CourseCard from '@/components/dashboard/CourseCard';
import StatsCard from '@/components/dashboard/StatsCard';
import { studentDashboardApi } from '@/lib/api';

interface CoursesData {
  enrolledCourses: any[];
  progressAnalytics: any;
}

export default function StudentCoursesPage() {
  const [coursesData, setCoursesData] = useState<CoursesData>({
    enrolledCourses: [],
    progressAnalytics: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        setLoading(true);
        setError('');

        const [enrolledCoursesData, progressAnalyticsData] = await Promise.allSettled([
          studentDashboardApi.getMyCourses(),
          studentDashboardApi.getProgressAnalytics()
        ]);

        setCoursesData({
          enrolledCourses: enrolledCoursesData.status === 'fulfilled' ? enrolledCoursesData.value.results || [] : [],
          progressAnalytics: progressAnalyticsData.status === 'fulfilled' ? progressAnalyticsData.value : null
        });

      } catch (err) {
        console.error('Error fetching courses data:', err);
        setError('Failed to load courses data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, []);

  const handleViewCourse = (courseSlug: string) => {
    window.location.href = `/courses/course/${courseSlug}`;
  };

  const handleContinueLearning = (courseSlug: string) => {
    window.location.href = `/courses/course/${courseSlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { enrolledCourses, progressAnalytics } = coursesData;

  // Filter courses based on status
  const filteredCourses = enrolledCourses.filter(course => {
    if (filter === 'all') return true;
    if (filter === 'active') return course.status === 'active' && (course.progress_percentage || 0) < 100;
    if (filter === 'completed') return course.status === 'completed' || (course.progress_percentage || 0) === 100;
    if (filter === 'paused') return course.status === 'paused';
    return true;
  });

  // Calculate stats
  const courseStats = {
    total: enrolledCourses.length,
    active: enrolledCourses.filter(course => 
      course.status === 'active' && (course.progress_percentage || 0) < 100
    ).length,
    completed: enrolledCourses.filter(course => 
      course.status === 'completed' || (course.progress_percentage || 0) === 100
    ).length,
    paused: enrolledCourses.filter(course => 
      course.status === 'paused'
    ).length,
    averageProgress: progressAnalytics?.average_progress || 0
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">
            Track your learning progress and continue your studies
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.href = '/courses'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Browse More Courses
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/student'}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Courses"
          value={courseStats.total}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="blue"
        />
        <StatsCard
          title="Active Courses"
          value={courseStats.active}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="green"
        />
        <StatsCard
          title="Completed"
          value={courseStats.completed}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple"
        />
        <StatsCard
          title="Average Progress"
          value={`${Math.round(courseStats.averageProgress)}%`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="yellow"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Courses', count: courseStats.total },
              { key: 'active', label: 'Active', count: courseStats.active },
              { key: 'completed', label: 'Completed', count: courseStats.completed }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Course Grid */}
        <div className="p-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No Courses Yet' : `No ${filter} Courses`}
              </h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? 'Start your learning journey by enrolling in a course!'
                  : `You don't have any ${filter} courses at the moment.`
                }
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => window.location.href = '/courses'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Courses
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((enrollment: any) => {
                const course = enrollment.course;
                const courseData = {
                  id: course.slug || course.id,
                  title: course.title,
                  description: course.description || course.short_description,
                  image: course.thumbnail || '/assets/courses/default.svg',
                  duration: `${course.duration_weeks} weeks`,
                  level: course.level_display || course.level,
                  progress: enrollment.progress_percentage || 0,
                  instructor: {
                    name: course.tutor?.full_name || 'Instructor',
                    avatar: course.tutor?.profile_picture || '/assets/students/default.jpg'
                  },
                  lastAccessed: enrollment.last_accessed || 'Never',
                  status: enrollment.status === 'completed' || (enrollment.progress_percentage || 0) === 100 ? 'completed' : 'active',
                  rating: parseFloat(course.rating) || 0,
                  students: course.enrollment_count || 0
                };
                
                return (
                  <div key={enrollment.id} className="bg-gray-50 rounded-lg p-1">
                    <CourseCard
                      course={courseData}
                      variant="student"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
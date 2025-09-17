"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { instructorApi, type InstructorStats, type Course } from '@/lib/api';
import { BookOpen, Users, Clock, Star, TrendingUp, Calendar, Plus, Eye, Edit, Trash2, Video, FileText, Award } from 'lucide-react';

export default function InstructorDashboard() {
  const [user, setUser] = useState(getCurrentUser());
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard stats and courses in parallel
      const [statsData, coursesData] = await Promise.all([
        instructorApi.getDashboardStats(),
        instructorApi.courses.list()
      ]);
      
      setStats(statsData);
      setCourses(Array.isArray(coursesData) ? coursesData : coursesData?.results || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Mock data for demo
      setStats({
        total_courses: 0,
        published_courses: 0,
        draft_courses: 0,
        pending_approval_courses: 0,
        total_enrollments: 0,
        total_modules: 0,
        total_lessons: 0,
        total_duration_hours: 0,
        avg_course_rating: 0,
        recent_courses: []
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseSlug: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await instructorApi.courses.delete(courseSlug);
      setCourses(prev => prev.filter(course => course.slug !== courseSlug));
      // Refresh stats
      const updatedStats = await instructorApi.getDashboardStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              Welcome back, {user?.full_name || 'Instructor'}! 👋
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Ready to create amazing courses? Manage your content and track student progress.
            </p>
          </div>
          <Link
            href="/dashboard/instructor/courses/create"
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/20 text-white rounded-lg sm:rounded-xl hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm sm:text-base w-fit"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Create Course
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Courses */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.total_courses || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Total Courses</h3>
          <p className="text-xs sm:text-sm text-gray-600">All your courses</p>
        </div>

        {/* Published Courses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.published_courses || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Published</h3>
          <p className="text-sm text-gray-600">Live courses</p>
        </div>

        {/* Total Enrollments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.total_enrollments || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Enrollments</h3>
          <p className="text-sm text-gray-600">Total students</p>
        </div>

        {/* Content Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Video className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.total_lessons || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Lessons</h3>
          <p className="text-sm text-gray-600">{Math.round(stats?.total_duration_hours || 0)}h content</p>
        </div>
      </div>

      {/* Course Management Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
            <p className="text-gray-600 mt-1">Manage your course content and track progress</p>
          </div>
          <Link
            href="/dashboard/instructor/courses"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View All Courses
            <TrendingUp className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {(Array.isArray(courses) ? courses : []).length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Create your first course to start teaching students</p>
            <Link
              href="/dashboard/instructor/courses/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(courses) ? courses : []).slice(0, 6).map((course) => (
              <div key={course.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                {/* Course Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {course.thumbnail ? (
                    <Image 
                      src={course.thumbnail} 
                      alt={course.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="h-8 w-8 text-white" />
                  )}
                </div>

                {/* Course Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.short_description}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>{course.modules_count} modules</span>
                      <span>{course.lessons_count} lessons</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                      course.approval_status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.approval_status_display}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/instructor/courses/${course.slug}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="View Course"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/instructor/courses/${course.slug}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Edit Course"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.slug)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm font-medium text-gray-900">₹{course.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/instructor/courses/create"
          className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Create New Course</h3>
          <p className="text-gray-600 text-sm">Start building your next course with our easy-to-use tools</p>
        </Link>

        <Link
          href="/dashboard/instructor/courses"
          className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors duration-200">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Manage Courses</h3>
          <p className="text-gray-600 text-sm">Edit content, track progress, and manage enrollments</p>
        </Link>

        <Link
          href="/dashboard/instructor/analytics"
          className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-200">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
          <p className="text-gray-600 text-sm">View detailed insights about your courses and students</p>
        </Link>
      </div>
    </div>
  );
}
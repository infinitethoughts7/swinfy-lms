"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { instructorApi, type InstructorStats, type Course } from '@/lib/api';
import { BookOpen, Users, TrendingUp, Plus, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import instructorAnalyticsData from '@/lib/instructorAnalyticsData.json';

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
      
      const [statsData, coursesData] = await Promise.all([
        instructorApi.getDashboardStats(),
        instructorApi.courses.list()
      ]);
      
      setStats(statsData);
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Fallback to empty data
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
      const updatedStats = await instructorApi.getDashboardStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course. Please try again.');
    }
  };

  // Chart Data
  const studentProgressData = instructorAnalyticsData.student_progress_by_course;
  const coursePerformanceData = instructorAnalyticsData.course_performance_metrics;

  // Colors for charts
  const progressColors = {
    not_started: '#EF4444', // Red
    in_progress: '#F59E0B', // Orange
    completed: '#10B981'    // Green
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
              Track your student progress and manage your courses effectively
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
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.published_courses || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Published</h3>
          <p className="text-xs sm:text-sm text-gray-600">Live courses</p>
        </div>

        {/* Total Enrollments */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.total_enrollments || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Total Students</h3>
          <p className="text-xs sm:text-sm text-gray-600">Active learners</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {instructorAnalyticsData.summary.overall_completion_rate}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Completion Rate</h3>
          <p className="text-xs sm:text-sm text-gray-600">Avg across courses</p>
        </div>
      </div>

      {/* Chart 1: Student Progress by Course - Full Width */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-6 sm:p-2 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Student Progress by Course</h2>
            <p className="text-sm text-gray-600">Track how students are progressing across all your courses</p>
          </div>
          {/* Legend in top right */}
          <div className="flex items-center gap-4 text-xs sm:text-sm flex-shrink-0 ml-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: progressColors.completed }}></div>
              <span className="text-gray-700 font-medium whitespace-nowrap">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: progressColors.in_progress }}></div>
              <span className="text-gray-700 font-medium whitespace-nowrap">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: progressColors.not_started }}></div>
              <span className="text-gray-700 font-medium whitespace-nowrap">Not Started</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={studentProgressData}
            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="course" 
              angle={0}
              textAnchor="middle"
              height={100}
              tick={{ fontSize: 12 }}
              interval={0}
              style={{ wordWrap: 'break-word' }}
            />
            <YAxis tick={{ fontSize: 10 }} label={{ value: 'Number of Students', angle: -90, position: 'insideMiddle' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
            />
            <Bar dataKey="completed" stackId="a" fill={progressColors.completed} name="Completed" radius={[0, 0, 0, 0]} />
            <Bar dataKey="in_progress" stackId="a" fill={progressColors.in_progress} name="In Progress" radius={[0, 0, 0, 0]} />
            <Bar dataKey="not_started" stackId="a" fill={progressColors.not_started} name="Not Started" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* Chart 2: Course Performance Metrics - Full Width */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-2 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Course Performance Overview</h2>
            <p className="text-sm text-gray-600">Compare enrollments, progress, and completion rates across courses</p>
          </div>
          {/* Legend in top right */}
          <div className="flex items-center gap-4 text-xs sm:text-sm flex-shrink-0 ml-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-700 font-medium whitespace-nowrap">Enrollments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-700 font-medium whitespace-nowrap">Avg Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700 font-medium whitespace-nowrap">Completion Rate</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={coursePerformanceData}
            margin={{ top: 10, right: 50, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="course" 
              angle={0}
              textAnchor="middle"
              height={100}
              tick={{ fontSize: 12 }}
              interval={0}
              style={{ wordWrap: 'break-word' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              label={{ value: 'Enrollments', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ value: 'Percentage (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Enrollments') return [value, name];
                return [`${value}%`, name];
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
            />
            <Bar yAxisId="left" dataKey="enrollments" fill="#3B82F6" name="Enrollments" radius={[8, 8, 0, 0]} barSize={60} />
            <Bar yAxisId="right" dataKey="avg_progress" fill="#8B5CF6" name="Avg Progress" radius={[8, 8, 0, 0]} barSize={60} />
            <Bar yAxisId="right" dataKey="completion_rate" fill="#10B981" name="Completion Rate" radius={[8, 8, 0, 0]} barSize={60} />
          </BarChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}
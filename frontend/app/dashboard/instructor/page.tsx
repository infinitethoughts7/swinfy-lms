"use client";

import { useState, useEffect } from 'react';
import { getCurrentUser, authenticatedFetch } from '@/lib/auth/token';
import { instructorApi } from '@/features/courses/services/course-management';
import type { InstructorStats, Course } from '@/shared/types';
import { BookOpen, Users, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface InstructorAnalytics {
  instructor_courses: Array<{
    id: string;
    title: string;
    slug: string;
    total_enrollments: number;
    total_lessons: number;
    duration_weeks: number;
    students_not_started: number;
    students_in_progress: number;
    students_completed: number;
    avg_progress_percentage: number;
    completion_rate: number;
    created_at: string;
  }>;
  student_progress_by_course: Array<{
    course: string;
    not_started: number;
    in_progress: number;
    completed: number;
    total: number;
  }>;
  course_performance_metrics: Array<{
    course: string;
    enrollments: number;
    avg_progress: number;
    completion_rate: number;
  }>;
  recent_student_activity: Array<{
    student_name: string;
    course: string;
    lesson_completed: string;
    progress_percentage: number;
    completed_at: string | null;
  }>;
  summary: {
    total_courses: number;
    total_enrollments: number;
    total_students_active: number;
    total_students_completed: number;
    overall_completion_rate: number;
    overall_avg_progress: number;
    most_popular_course: string | null;
    best_performing_course: string | null;
  };
}

export default function InstructorDashboard() {
  const [user, setUser] = useState(getCurrentUser());
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
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

      const [statsData, coursesData, analyticsResponse] = await Promise.all([
        instructorApi.getDashboardStats(),
        instructorApi.courses.list(),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/analytics/instructor/`)
      ]);

      setStats(statsData);
      setCourses(coursesData);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');

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
      setAnalytics(null);
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

  const studentProgressData = analytics?.student_progress_by_course || [];
  const coursePerformanceData = analytics?.course_performance_metrics || [];

  const progressColors = {
    not_started: '#EF4444',
    in_progress: '#F59E0B',
    completed: '#10B981'
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
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
              Welcome back, {user?.full_name || 'Instructor'}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Track your student progress and manage your courses effectively
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.total_courses || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Total Courses</h3>
            <p className="text-xs sm:text-sm text-gray-600">All your courses</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.published_courses || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Published</h3>
            <p className="text-xs sm:text-sm text-gray-600">Live courses</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.total_enrollments || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Total Students</h3>
            <p className="text-xs sm:text-sm text-gray-600">Active learners</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {analytics?.summary?.overall_completion_rate || 0}%
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Completion Rate</h3>
            <p className="text-xs sm:text-sm text-gray-600">Avg across courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart 1: Student Progress by Course */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Student Progress by Course</CardTitle>
              <CardDescription>Track how students are progressing across all your courses</CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          {studentProgressData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <p>No student progress data available yet. Create courses and get enrollments to see progress.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart 2: Course Performance Metrics */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Course Performance Overview</CardTitle>
              <CardDescription>Compare enrollments, progress, and completion rates across courses</CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          {coursePerformanceData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <p>No course performance data available yet. Create courses and get enrollments to see metrics.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

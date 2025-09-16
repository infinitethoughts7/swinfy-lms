'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { userApi, studentDashboardApi, paymentsApi } from '@/lib/api';
import { WeeklyActivityChart } from '@/components/dashboard/ProgressChart';
import { BookOpen, Clock, Award, TrendingUp, Users } from 'lucide-react';

interface DashboardStats {
  total_enrollments?: number;
  active_enrollments?: number;
  completed_enrollments?: number;
  total_spent?: number;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description?: string;
  thumbnail?: string;
  duration_weeks?: number;
  level?: string;
  level_display?: string;
  enrollment_count?: number;
  rating?: number;
  average_rating?: number;
  category?: string;
  category_display?: string;
  tutor?: {
    full_name: string;
    avatar?: string;
  };
}

interface Enrollment {
  id: string;
  course: Course;
  progress_percentage?: number;
  status: string;
}

interface WeeklyActivity {
  day: string;
  hours: number;
}

interface StudentDistribution {
  level: string;
  count: number;
}

interface StudySession {
  id: string;
  duration_minutes: number;
  created_at: string;
}

interface Payment {
  id: string;
  amount: string;
  status: string;
  created_at: string;
}

interface StudentHomeData {
  dashboardStats: DashboardStats | null;
  enrolledCourses: Enrollment[];
  weeklyActivity: WeeklyActivity[];
  studentDistribution: StudentDistribution[];
  studySessions: StudySession[];
  recentPayments: Payment[];
}

export default function StudentHomePage() {
  const [data, setData] = useState<StudentHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          dashboardStatsData,
          enrolledCoursesData,
          weeklyActivityData,
          studentDistributionData,
          studySessionsData,
          recentPaymentsData
        ] = await Promise.allSettled([
          userApi.getDashboardStats(),
          studentDashboardApi.getMyCourses(),
          studentDashboardApi.getWeeklyActivity(),
          studentDashboardApi.getStudentDistribution(),
          studentDashboardApi.getStudySessions(),
          paymentsApi.getPaymentHistory()
        ]);

        setData({
          dashboardStats: dashboardStatsData.status === 'fulfilled' ? dashboardStatsData.value : null,
          enrolledCourses: enrolledCoursesData.status === 'fulfilled' ? (enrolledCoursesData.value.results || enrolledCoursesData.value || []) : [],
          weeklyActivity: weeklyActivityData.status === 'fulfilled' ? weeklyActivityData.value.weekly_activity || [] : [],
          studentDistribution: studentDistributionData.status === 'fulfilled' ? studentDistributionData.value.student_distribution || [] : [],
          studySessions: studySessionsData.status === 'fulfilled' ? (studySessionsData.value.results || studySessionsData.value || []) : [],
          recentPayments: recentPaymentsData.status === 'fulfilled' ? (recentPaymentsData.value.results || recentPaymentsData.value || []) : []
        });
      } catch (err) {
        console.error('Error fetching student home data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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

  const stats = data?.dashboardStats || {};
  const enrolledCourses = data?.enrolledCourses || [];
  const recentCourses = enrolledCourses.slice(0, 3);
  const weeklyActivity = data?.weeklyActivity || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome back!</h1>
        <p className="text-blue-100 text-sm sm:text-base">
          Continue your learning journey and explore new opportunities.
        </p>
      </div>


      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-lg font-bold text-gray-900">{stats.total_enrollments || 0}</p>
            </div>
          </div>
      </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-lg font-bold text-gray-900">{stats.active_enrollments || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-lg font-bold text-gray-900">{stats.completed_enrollments || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-lg font-bold text-gray-900">₹{stats.total_spent || 0}</p>
                </div>
              </div>
                </div>
              </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Weekly Activity Chart - Compact */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Weekly Activity</h2>
            </div>
            <WeeklyActivityChart 
              activities={weeklyActivity}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recent Courses - Expanded */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
              <Link 
                href="/courses" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            
            {recentCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No courses enrolled yet</p>
                <Link 
                  href="/courses" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCourses.slice(0, 6).map((enrollment) => (
                  <div key={enrollment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start space-x-3 mb-3">
                      {(enrollment.course?.thumbnail || '/assets/courses/default.svg').endsWith('.svg') ? (
                        <img
                          src={enrollment.course?.thumbnail || '/assets/courses/default.svg'}
                          alt={enrollment.course?.title || 'Course'}
                          className="w-15 h-15 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <Image
                          src={enrollment.course?.thumbnail || '/assets/courses/default.svg'}
                          alt={enrollment.course?.title || 'Course'}
                          width={60}
                          height={60}
                          className="w-15 h-15 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                          {enrollment.course?.title || 'Untitled Course'}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {enrollment.progress_percentage || 0}% complete
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              enrollment.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {enrollment.status === 'active' ? 'Active' : 'Upcoming'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progress_percentage || 0}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{enrollment.course?.level_display || 'Beginner'}</span>
                            <span>{enrollment.course?.duration_weeks || 0} weeks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="pt-3 border-t border-gray-100">
                      <Link
                        href={`/courses/${enrollment.course?.slug || enrollment.course?.id || enrollment.id}`}
                        className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        {(enrollment.progress_percentage || 0) > 0 ? 'Continue Learning' : 'Start Learning'}
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
              <Link 
                href="/courses" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {/* Sample recommended courses - you can replace with real data */}
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">Advanced React Patterns</h4>
                  <p className="text-xs text-gray-500">Learn advanced React concepts and patterns</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-blue-600 font-medium">Free</span>
                    <span className="text-xs text-gray-400 mx-2">•</span>
                    <span className="text-xs text-gray-500">8 weeks</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                  Start
                </button>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">Python for Data Science</h4>
                  <p className="text-xs text-gray-500">Master Python for data analysis and visualization</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-blue-600 font-medium">₹2,999</span>
                    <span className="text-xs text-gray-400 mx-2">•</span>
                    <span className="text-xs text-gray-500">12 weeks</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                  Start
                </button>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">UI/UX Design Fundamentals</h4>
                  <p className="text-xs text-gray-500">Learn design principles and user experience</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-blue-600 font-medium">₹1,999</span>
                    <span className="text-xs text-gray-400 mx-2">•</span>
                    <span className="text-xs text-gray-500">6 weeks</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                  Start
                </button>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">Machine Learning Basics</h4>
                  <p className="text-xs text-gray-500">Introduction to ML algorithms and applications</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-blue-600 font-medium">₹4,999</span>
                    <span className="text-xs text-gray-400 mx-2">•</span>
                    <span className="text-xs text-gray-500">10 weeks</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                  Start
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/courses"
                className="flex items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-700 font-medium">Browse All Courses</span>
              </Link>
              <a 
                href="/dashboard/student/sessions"
                className="flex items-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              >
                <Users className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-700 font-medium">Join Live Sessions</span>
              </a>
              <a 
                href="/dashboard/student/payments"
                className="flex items-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Clock className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-purple-700 font-medium">View Payments</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
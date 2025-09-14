'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { studentDashboardApi, paymentsApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  duration_weeks: number;
  level: string;
  category: string;
  thumbnail?: string;
  rating: string;
  total_reviews: number;
  enrollment_count: number;
  tutor: {
    id: string;
    full_name: string;
    email: string;
  };
  training_partner: {
    id: string;
    name: string;
  };
  is_featured: boolean;
}

interface Enrollment {
  id: string;
  course: Course;
  enrollment_date: string;
  status: 'active' | 'completed' | 'paused';
  payment_status: 'pending' | 'paid' | 'failed';
  progress_percentage: number;
  amount_paid: string;
  completion_date?: string;
  last_accessed?: string;
}

interface Payment {
  id: string;
  course_title: string;
  amount: string;
  status: 'pending' | 'paid' | 'verified' | 'failed';
  created_at: string;
  paid_at?: string;
  payment_method?: string;
}

interface StudySession {
  id: string;
  lesson_title: string;
  course_title: string;
  session_duration_minutes: number;
  started_at: string;
  progress_made: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  course?: {
    title: string;
    slug: string;
  };
}

export default function StudentDashboard() {
  const [user] = useState(getCurrentUser());
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    activeCourses: 0,
    totalHoursStudied: 0,
    averageProgress: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        enrollmentsResponse,
        paymentsResponse,
        sessionsResponse,
        notificationsResponse
      ] = await Promise.all([
        studentDashboardApi.getMyCourses(),
        paymentsApi.getPaymentHistory(),
        studentDashboardApi.getStudySessions(),
        studentDashboardApi.getNotifications()
      ]);

      setEnrollments(enrollmentsResponse.results || []);
      setPayments(paymentsResponse.results || []);
      setRecentSessions(sessionsResponse.results?.slice(0, 5) || []);
      setNotifications(notificationsResponse.results?.slice(0, 10) || []);

      // Calculate stats
      const enrollmentsData = enrollmentsResponse.results || [];
      const totalCourses = enrollmentsData.length;
      const completedCourses = enrollmentsData.filter((e: Enrollment) => e.status === 'completed').length;
      const activeCourses = enrollmentsData.filter((e: Enrollment) => e.status === 'active').length;
      const totalProgress = enrollmentsData.reduce((sum: number, e: Enrollment) => sum + e.progress_percentage, 0);
      const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
      const totalHoursStudied = (sessionsResponse.results || []).reduce(
        (sum: number, session: StudySession) => sum + (session.session_duration_minutes / 60), 
        0
      );

      setStats({
        totalCourses,
        completedCourses,
        activeCourses,
        totalHoursStudied: Math.round(totalHoursStudied),
        averageProgress
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await studentDashboardApi.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getStatusBadge = (status: string, type: 'enrollment' | 'payment' = 'enrollment') => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    if (type === 'payment') {
      switch (status) {
        case 'paid':
        case 'verified':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'failed':
          return `${baseClasses} bg-red-100 text-red-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case 'completed':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'active':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'paused':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchDashboardData}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
      <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Student'}! 👋</h1>
            <p className="text-blue-100 mt-1">Ready to continue your learning journey?</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.averageProgress}%</div>
                <div className="text-xs text-blue-100">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hours Studied</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalHoursStudied}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
              <a
                href="/dashboard/student/courses"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses enrolled</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by enrolling in a course.</p>
                <div className="mt-6">
                  <Link
                    href="/courses"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Courses
                  </Link>
                </div>
            </div>
            ) : (
            <div className="space-y-4">
                {enrollments.slice(0, 3).map((enrollment) => (
                  <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          <a 
                            href={`/courses/${enrollment.course.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {enrollment.course.title}
                          </a>
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{enrollment.course.short_description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Enrolled: {formatDate(enrollment.enrollment_date)}</span>
                          <span>•</span>
                          <span>{enrollment.course.duration_weeks} weeks</span>
                          <span>•</span>
                          <span className="capitalize">{enrollment.course.level}</span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={getStatusBadge(enrollment.status)}>
                            {enrollment.status}
                          </span>
                          <span className={getStatusBadge(enrollment.payment_status, 'payment')}>
                            {enrollment.payment_status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {enrollment.progress_percentage}% Complete
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                </div>
          <div className="p-6">
            {notifications.length === 0 ? (
              <div className="text-center py-4">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      notification.is_read 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-blue-200 bg-blue-50'
                    }`}
                    onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                        notification.is_read ? 'bg-gray-300' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                </div>
              </div>
                </div>
                ))}
              </div>
            )}
                </div>
              </div>
            </div>

      {/* Recent Activity & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Study Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Study Sessions</h2>
          </div>
          <div className="p-6">
            {recentSessions.length === 0 ? (
              <div className="text-center py-4">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No study sessions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{session.lesson_title}</p>
                      <p className="text-xs text-gray-500">{session.course_title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{session.session_duration_minutes}m</p>
                      <p className="text-xs text-gray-500">{formatDate(session.started_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
          </div>
          <div className="p-6">
            {payments.length === 0 ? (
              <div className="text-center py-4">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No payments made</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{payment.course_title}</p>
                      <p className="text-xs text-gray-500">{formatDate(payment.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                      <span className={getStatusBadge(payment.status, 'payment')}>
                        {payment.status}
                </span>
              </div>
            </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

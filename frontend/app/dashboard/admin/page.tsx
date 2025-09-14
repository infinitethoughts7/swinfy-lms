'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { AdminQuickActions } from '@/components/dashboard/QuickActions';
import { StudentDistributionChart, WeeklyActivityChart } from '@/components/dashboard/ProgressChart';
import { adminDashboardApi, userApi } from '@/lib/api';

interface AdminDashboardData {
  dashboardStats: any;
  pendingPayments: any[];
  paymentAnalytics: any;
  paymentHistory: any[];
  coursePerformance: any;
  trainingPartnerCourses: any[];
  userProfile: any;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>({
    dashboardStats: null,
    pendingPayments: [],
    paymentAnalytics: null,
    paymentHistory: [],
    coursePerformance: null,
    trainingPartnerCourses: [],
    userProfile: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all admin dashboard data in parallel
        const [
          dashboardStatsData,
          pendingPaymentsData,
          paymentAnalyticsData,
          paymentHistoryData,
          coursePerformanceData,
          trainingPartnerCoursesData,
          userProfileData
        ] = await Promise.allSettled([
          adminDashboardApi.getDashboardStats(),
          adminDashboardApi.getPendingPayments(),
          adminDashboardApi.getPaymentAnalytics(),
          adminDashboardApi.getPaymentHistory(),
          adminDashboardApi.getCoursePerformanceAnalytics(),
          adminDashboardApi.getTrainingPartnerCourses(),
          userApi.getProfile()
        ]);

        setDashboardData({
          dashboardStats: dashboardStatsData.status === 'fulfilled' ? dashboardStatsData.value : null,
          pendingPayments: pendingPaymentsData.status === 'fulfilled' ? pendingPaymentsData.value : [],
          paymentAnalytics: paymentAnalyticsData.status === 'fulfilled' ? paymentAnalyticsData.value : null,
          paymentHistory: paymentHistoryData.status === 'fulfilled' ? paymentHistoryData.value : [],
          coursePerformance: coursePerformanceData.status === 'fulfilled' ? coursePerformanceData.value : null,
          trainingPartnerCourses: trainingPartnerCoursesData.status === 'fulfilled' ? trainingPartnerCoursesData.value : [],
          userProfile: userProfileData.status === 'fulfilled' ? userProfileData.value : null
        });

      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  const handleManageUsers = () => {
    window.location.href = '/dashboard/admin/users';
  };

  const handleSystemSettings = () => {
    window.location.href = '/dashboard/admin/settings';
  };

  const handleViewReports = () => {
    console.log('Viewing reports...');
  };

  const handleBackupSystem = () => {
    console.log('Backing up system...');
  };

  const handleApprovePayment = async (paymentId: number) => {
    try {
      await adminDashboardApi.verifyPayment(paymentId, 'approve');
      // Refresh pending payments
      const updatedPendingPayments = await adminDashboardApi.getPendingPayments();
      setDashboardData(prev => ({
        ...prev,
        pendingPayments: updatedPendingPayments
      }));
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment. Please try again.');
    }
  };

  const handleRejectPayment = async (paymentId: number, notes: string = '') => {
    try {
      await adminDashboardApi.verifyPayment(paymentId, 'reject', notes);
      // Refresh pending payments
      const updatedPendingPayments = await adminDashboardApi.getPendingPayments();
      setDashboardData(prev => ({
        ...prev,
        pendingPayments: updatedPendingPayments
      }));
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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

  const { dashboardStats, pendingPayments, paymentAnalytics, paymentHistory, coursePerformance, trainingPartnerCourses, userProfile } = dashboardData;

  // Calculate system stats from real data
  const systemStats = {
    totalUsers: dashboardStats?.total_users || 0,
    activeCourses: trainingPartnerCourses.length || 0,
    totalRevenue: paymentAnalytics?.total_revenue || 0,
    pendingApprovals: pendingPayments.length || 0
  };

  // Recent activity from payment history and course activity
  const recentActivity = [
    ...pendingPayments.slice(0, 3).map((payment: any) => ({
      id: `payment-${payment.id}`,
      type: 'payment',
      user: payment.user?.first_name || 'Student',
      action: `submitted payment for ${payment.course_title || payment.enrollment?.course?.title}`,
      timestamp: new Date(payment.created_at).toLocaleDateString(),
      icon: '💳',
      color: 'bg-yellow-100 text-yellow-800'
    })),
    ...paymentHistory.slice(0, 2).map((payment: any) => ({
      id: `history-${payment.id}`,
      type: 'payment_verified',
      user: payment.user?.first_name || 'Student',
      action: `payment verified for ${payment.course_title || payment.enrollment?.course?.title}`,
      timestamp: new Date(payment.verified_at || payment.created_at).toLocaleDateString(),
      icon: '✅',
      color: 'bg-green-100 text-green-800'
    }))
  ].slice(0, 5);

  // User distribution data
  const userDistribution = [
    { level: 'Students', count: dashboardStats?.total_users || 0 },
    { level: 'Courses', count: trainingPartnerCourses.length || 0 },
    { level: 'Payments', count: paymentHistory.length || 0 }
  ];

  // Weekly revenue data from payment analytics
  const weeklyRevenue = paymentAnalytics?.weekly_revenue || [
    { day: 'No Data', hours: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Training Partner Dashboard 🚀
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome, {userProfile?.organization_name || userProfile?.first_name || 'Admin'}! Monitor your courses and manage enrollments
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.href = '/dashboard/admin/courses/create'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Course
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/admin/courses'}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Manage Courses
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <AdminQuickActions
        onManageUsers={handleManageUsers}
        onSystemSettings={handleSystemSettings}
        onViewReports={handleViewReports}
        onBackupSystem={handleBackupSystem}
        pendingApprovals={systemStats.pendingApprovals}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={systemStats.totalUsers.toLocaleString()}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          color="blue"
        />
        <StatsCard
          title="Active Courses"
          value={systemStats.activeCourses}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="green"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${systemStats.totalRevenue.toLocaleString()}`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="yellow"
        />
        <StatsCard
          title="Pending Approvals"
          value={systemStats.pendingApprovals}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Payment Approvals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Pending Payment Approvals</h2>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {pendingPayments.length} pending
              </span>
            </div>
            
            {pendingPayments.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">No pending payment approvals at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.slice(0, 5).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {(payment.user?.first_name || 'S')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.user?.first_name} {payment.user?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.course_title || payment.enrollment?.course?.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{payment.amount}</p>
                        <p className="text-sm text-gray-500">Payment ID: {payment.razorpay_payment_id}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprovePayment(payment.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Reason for rejection (optional):');
                            handleRejectPayment(payment.id, notes || '');
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
              <button
                onClick={() => window.location.href = '/dashboard/admin/courses'}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            
            {trainingPartnerCourses.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Yet</h3>
                <p className="text-gray-500 mb-4">Start creating courses for your students!</p>
                <button
                  onClick={() => window.location.href = '/dashboard/admin/courses/create'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create First Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainingPartnerCourses.slice(0, 4).map((course: any) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={course.thumbnail || '/assets/courses/default.svg'}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.level_display} • {course.duration_weeks} weeks</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">Enrollments: </span>
                        <span className="font-medium">{course.enrollment_count || 0}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Price: </span>
                        <span className="font-medium">₹{course.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Analytics and Activity */}
        <div className="space-y-6">
          {/* Distribution Chart */}
          <StudentDistributionChart data={userDistribution} />

          {/* Weekly Revenue Chart */}
          <WeeklyActivityChart activities={weeklyRevenue} />

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`px-2 py-1 rounded-full text-xs ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Analytics Summary */}
          {paymentAnalytics && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Analytics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payments:</span>
                  <span className="font-medium">{paymentAnalytics.total_payments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Successful:</span>
                  <span className="font-medium text-green-600">{paymentAnalytics.successful_payments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-yellow-600">{paymentAnalytics.pending_verification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected:</span>
                  <span className="font-medium text-red-600">{paymentAnalytics.rejected_payments}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Revenue:</span>
                  <span className="font-bold text-green-600">₹{paymentAnalytics.total_revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
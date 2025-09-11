'use client';

import StatsCard from '@/components/dashboard/StatsCard';
import { AdminQuickActions } from '@/components/dashboard/QuickActions';
import { StudentDistributionChart, WeeklyActivityChart } from '@/components/dashboard/ProgressChart';

// Mock data for admin dashboard
const systemStats = {
  totalUsers: 1247,
  activeCourses: 23,
  totalRevenue: 45600,
  systemUptime: 99.9
};

const recentActivity = [
  {
    id: 1,
    type: 'user_registration',
    user: 'Sarah Johnson',
    action: 'registered as a student',
    timestamp: '2 minutes ago',
    icon: '👤',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 2,
    type: 'course_creation',
    user: 'Dr. Michael Chen',
    action: 'created a new course "Advanced Python"',
    timestamp: '15 minutes ago',
    icon: '📚',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 3,
    type: 'payment',
    user: 'Emily Rodriguez',
    action: 'completed payment for React course',
    timestamp: '1 hour ago',
    icon: '💳',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 4,
    type: 'support_ticket',
    user: 'John Davis',
    action: 'submitted a support ticket',
    timestamp: '2 hours ago',
    icon: '🎫',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 5,
    type: 'course_completion',
    user: 'Maria Garcia',
    action: 'completed JavaScript Fundamentals',
    timestamp: '3 hours ago',
    icon: '🎓',
    color: 'bg-purple-100 text-purple-800'
  }
];

const userDistribution = [
  { level: 'Students', count: 1089 },
  { level: 'Tutors', count: 47 },
  { level: 'Admins', count: 5 }
];

const weeklyRevenue = [
  { day: 'Mon', hours: 2400 },
  { day: 'Tue', hours: 3200 },
  { day: 'Wed', hours: 2800 },
  { day: 'Thu', hours: 3600 },
  { day: 'Fri', hours: 4200 },
  { day: 'Sat', hours: 1800 },
  { day: 'Sun', hours: 1600 }
];

export default function AdminDashboard() {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            System Overview 🚀
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor platform performance and manage system operations
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
        pendingApprovals={3}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={systemStats.totalUsers.toLocaleString()}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          color="blue"
          change={{ value: 12, type: 'increase', timeframe: 'this month' }}
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
          change={{ value: 5, type: 'increase', timeframe: 'this month' }}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${systemStats.totalRevenue.toLocaleString()}`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="yellow"
          change={{ value: 18, type: 'increase', timeframe: 'vs last month' }}
        />
        <StatsCard
          title="System Uptime"
          value={`${systemStats.systemUptime}%`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          change={{ value: 0.1, type: 'increase', timeframe: 'this month' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity and Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">High Server Load</p>
                  <p className="text-sm text-yellow-700">Server CPU usage is at 85%. Consider scaling resources.</p>
                  <p className="text-xs text-yellow-600 mt-1">5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Scheduled Maintenance</p>
                  <p className="text-sm text-blue-700">System maintenance scheduled for Sunday 2:00 AM.</p>
                  <p className="text-xs text-blue-600 mt-1">Scheduled for Jun 30</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Backup Completed</p>
                  <p className="text-sm text-green-700">Daily backup completed successfully.</p>
                  <p className="text-xs text-green-600 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Admin Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Review tutor applications</p>
                    <p className="text-xs text-gray-500">3 applications pending review</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  High Priority
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Update privacy policy</p>
                    <p className="text-xs text-gray-500">Legal team requested updates</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Medium
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analyze user feedback</p>
                    <p className="text-xs text-gray-500">Review monthly feedback reports</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Low
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Analytics and Quick Stats */}
        <div className="space-y-6">
          {/* User Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
            <div className="space-y-3">
              {userDistribution.map((user, index) => {
                const total = userDistribution.reduce((sum, u) => sum + u.count, 0);
                const percentage = Math.round((user.count / total) * 100);
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                
                return (
                  <div key={user.level} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{user.level}</span>
                      <span className="font-medium text-gray-900">{user.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Chart */}
          <WeeklyActivityChart activities={weeklyRevenue.map(item => ({ day: item.day, hours: item.hours / 100 }))} />

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Services</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">File Storage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-600">Warning</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">CDN</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Optimal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Numbers</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Registrations</span>
                <span className="font-semibold text-green-600">+24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Course Enrollments</span>
                <span className="font-semibold text-blue-600">+67</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Support Tickets</span>
                <span className="font-semibold text-yellow-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Server Requests</span>
                <span className="font-semibold text-gray-900">1.2M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

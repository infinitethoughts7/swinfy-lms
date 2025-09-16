"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth';

interface DashboardStats {
  users: {
    total: number;
    learners: number;
    kp_admins: number;
    kp_instructors: number;
    recent_new_users: number;
  };
  applications: {
    pending: number;
    approved: number;
    rejected: number;
    recent_applications: number;
  };
  knowledge_partners: {
    total: number;
    active: number;
    verified: number;
  };
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated before making API calls
    if (!isAuthenticated()) {
      logout();
      return;
    }
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/super-admin/dashboard/stats/`, {
        method: 'GET',
      });

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      
      // Fallback to mock data
      setStats({
        users: {
          total: 0,
          learners: 0,
          kp_admins: 0,
          kp_instructors: 0,
          recent_new_users: 0,
        },
        applications: {
          pending: 0,
          approved: 0,
          rejected: 0,
          recent_applications: 0,
        },
        knowledge_partners: {
          total: 0,
          active: 0,
          verified: 0,
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              Super Admin Dashboard 👑
            </h1>
            <p className="text-purple-100 text-sm sm:text-base">
              Manage Knowledge Partner applications and oversee the entire platform.
            </p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end sm:text-right space-x-2 sm:space-x-0">
            <div className="text-xl sm:text-2xl font-bold">{stats?.applications.pending || 0}</div>
            <div className="text-xs sm:text-sm text-purple-100">Pending Applications</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.users.total || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Total Users</h3>
          <p className="text-xs sm:text-sm text-gray-600">+{stats?.users.recent_new_users || 0} this month</p>
        </div>

        {/* Pending Applications */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.applications.pending || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Pending Applications</h3>
          <p className="text-xs sm:text-sm text-gray-600">Require review</p>
        </div>

        {/* Approved KPs */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.applications.approved || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Approved Applications</h3>
          <p className="text-xs sm:text-sm text-gray-600">Active KPs</p>
        </div>

        {/* Knowledge Partners */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <Building className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.knowledge_partners.total || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Knowledge Partners</h3>
          <p className="text-xs sm:text-sm text-gray-600">{stats?.knowledge_partners.verified || 0} verified</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* KP Applications Management */}
        <Link
          href="/dashboard/super-admin/applications"
          className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg sm:rounded-xl group-hover:bg-yellow-200 transition-colors duration-200 flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Review KP Applications</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Approve or reject Knowledge Partner applications</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{stats?.applications.pending || 0}</div>
              <div className="text-xs sm:text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </Link>

        {/* Users Management */}
        <Link
          href="/dashboard/super-admin/users"
          className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl group-hover:bg-blue-200 transition-colors duration-200 flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">View All Users</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Browse all users in the system (read-only)</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{stats?.users.total || 0}</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 lg:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">User Breakdown</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
                <span className="text-gray-700 text-sm sm:text-base">Learners</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats?.users.learners || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                <span className="text-gray-700 text-sm sm:text-base">KP Admins</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats?.users.kp_admins || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full mr-2 sm:mr-3"></div>
                <span className="text-gray-700 text-sm sm:text-base">KP Instructors</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats?.users.kp_instructors || 0}</span>
            </div>
          </div>
        </div>

        {/* Application Stats */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 lg:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Application Status</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mr-2 sm:mr-3" />
                <span className="text-gray-700 text-sm sm:text-base">Pending Review</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats?.applications.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3" />
                <span className="text-gray-700 text-sm sm:text-base">Approved</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats?.applications.approved || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3" />
                <span className="text-gray-700 text-sm sm:text-base">Rejected</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats?.applications.rejected || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <p className="text-red-600 text-xs sm:text-sm">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-2 text-red-600 hover:text-red-800 text-xs sm:text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

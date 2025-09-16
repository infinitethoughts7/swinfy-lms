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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Super Admin Dashboard 👑
            </h1>
            <p className="text-purple-100">
              Manage Knowledge Partner applications and oversee the entire platform.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats?.applications.pending || 0}</div>
            <div className="text-sm text-purple-100">Pending Applications</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.users.total || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Total Users</h3>
          <p className="text-sm text-gray-600">+{stats?.users.recent_new_users || 0} this month</p>
        </div>

        {/* Pending Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.applications.pending || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Pending Applications</h3>
          <p className="text-sm text-gray-600">Require review</p>
        </div>

        {/* Approved KPs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.applications.approved || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Approved Applications</h3>
          <p className="text-sm text-gray-600">Active KPs</p>
        </div>

        {/* Knowledge Partners */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats?.knowledge_partners.total || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Knowledge Partners</h3>
          <p className="text-sm text-gray-600">{stats?.knowledge_partners.verified || 0} verified</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KP Applications Management */}
        <Link
          href="/dashboard/super-admin/applications"
          className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors duration-200">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Review KP Applications</h3>
              <p className="text-gray-600 text-sm">Approve or reject Knowledge Partner applications</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">{stats?.applications.pending || 0}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </Link>

        {/* Users Management */}
        <Link
          href="/dashboard/super-admin/users"
          className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">View All Users</h3>
              <p className="text-gray-600 text-sm">Browse all users in the system (read-only)</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{stats?.users.total || 0}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Learners</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.users.learners || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">KP Admins</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.users.kp_admins || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-700">KP Instructors</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.users.kp_instructors || 0}</span>
            </div>
          </div>
        </div>

        {/* Application Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Application Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                <span className="text-gray-700">Pending Review</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.applications.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Approved</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.applications.approved || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-gray-700">Rejected</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.applications.rejected || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

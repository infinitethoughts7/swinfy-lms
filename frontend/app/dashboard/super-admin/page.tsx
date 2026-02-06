"use client";

import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth/token';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-32 w-full rounded-xl sm:rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header - Keep gradient banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              Super Admin Dashboard
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
        <Card className="hover:shadow-lg transition-shadow duration-200 py-0">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.users.total || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Total Users</h3>
            <p className="text-xs sm:text-sm text-gray-600">+{stats?.users.recent_new_users || 0} this month</p>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card className="hover:shadow-lg transition-shadow duration-200 py-0">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.applications.pending || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Pending Applications</h3>
            <p className="text-xs sm:text-sm text-gray-600">Require review</p>
          </CardContent>
        </Card>

        {/* Approved KPs */}
        <Card className="hover:shadow-lg transition-shadow duration-200 py-0">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.applications.approved || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Approved Applications</h3>
            <p className="text-xs sm:text-sm text-gray-600">Active KPs</p>
          </CardContent>
        </Card>

        {/* Knowledge Partners */}
        <Card className="hover:shadow-lg transition-shadow duration-200 py-0">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.knowledge_partners.total || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Knowledge Partners</h3>
            <p className="text-xs sm:text-sm text-gray-600">{stats?.knowledge_partners.verified || 0} verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* KP Applications Management */}
        <Link href="/dashboard/super-admin/applications">
          <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer py-0">
            <CardContent className="p-4 sm:p-5 lg:p-6">
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
            </CardContent>
          </Card>
        </Link>

        {/* Users Management */}
        <Link href="/dashboard/super-admin/users">
          <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer py-0">
            <CardContent className="p-4 sm:p-5 lg:p-6">
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
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* User Breakdown */}
        <Card className="py-0">
          <CardHeader className="p-4 sm:p-5 lg:p-6 pb-0">
            <CardTitle className="text-base sm:text-lg">User Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 lg:p-6 pt-3 sm:pt-4">
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
          </CardContent>
        </Card>

        {/* Application Stats */}
        <Card className="py-0">
          <CardHeader className="p-4 sm:p-5 lg:p-6 pb-0">
            <CardTitle className="text-base sm:text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 lg:p-6 pt-3 sm:pt-4">
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
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xs sm:text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDashboardStats}
              className="text-destructive hover:text-destructive/80"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

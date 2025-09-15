"use client";

import { useState, useEffect } from 'react';
import { Users, UserPlus, BookOpen, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  total_instructors: number;
  active_instructors: number;
  available_instructors: number;
  total_courses: number;
  active_courses: number;
  total_students: number;
  recent_activity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export default function KPDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the dashboard stats endpoint might not be fully implemented
      // In production, you would call: const data = await api.dashboard.getStats();
      
      // Mock data based on our test instructor
      const mockStats: DashboardStats = {
        total_instructors: 1,
        active_instructors: 1,
        available_instructors: 1,
        total_courses: 0,
        active_courses: 0,
        total_students: 0,
        recent_activity: [
          {
            id: '1',
            type: 'instructor_created',
            message: 'New instructor "Test Instructor Updated" was created',
            timestamp: new Date().toISOString(),
          }
        ]
      };
      
      setStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Partner Dashboard</h1>
          <p className="text-gray-600">Manage your instructors and track performance</p>
        </div>
        <Link
          href="/dashboard/kp/instructors/add"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Instructor
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Instructors</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_instructors || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Instructors</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats?.active_instructors || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Courses</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats?.active_courses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_students || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instructor Management */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor Management</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/kp/instructors"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View All Instructors</p>
                <p className="text-sm text-gray-600">Manage your instructor team</p>
              </div>
            </Link>
            <Link
              href="/dashboard/kp/instructors/add"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <UserPlus className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Add New Instructor</p>
                <p className="text-sm text-gray-600">Invite a new instructor to your team</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats?.recent_activity && stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="p-1 bg-blue-100 rounded-full mr-3 mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <TrendingUp className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Activity will appear here as you manage your instructors</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Instructors Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Instructor Availability</h3>
          <Link
            href="/dashboard/kp/instructors"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              {stats?.available_instructors || 0} instructor(s) available for new assignments
            </span>
          </div>
          <Link
            href="/dashboard/kp/instructors/add"
            className="text-green-700 hover:text-green-800 text-sm font-medium"
          >
            Add More →
          </Link>
        </div>
      </div>
    </div>
  );
}

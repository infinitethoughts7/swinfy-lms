"use client";

import { useState, useEffect } from 'react';
import { Users, UserPlus, BookOpen, TrendingUp, Plus, ArrowRight } from 'lucide-react';
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
      // Mock data since getDashboardStats is not implemented
      const data = {
        total_instructors: 12,
        active_instructors: 10,
        available_instructors: 8,
        total_courses: 25,
        active_courses: 20,
        total_students: 156,
        recent_activity: [
          { id: '1', type: 'instructor', message: 'New instructor joined', timestamp: '2 hours ago' },
          { id: '2', type: 'course', message: 'Course "React Basics" published', timestamp: '4 hours ago' },
          { id: '3', type: 'student', message: '5 new student enrollments', timestamp: '6 hours ago' },
        ]
      };
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      // Mock data for demo
      setStats({
        total_instructors: 12,
        active_instructors: 10,
        available_instructors: 8,
        total_courses: 25,
        active_courses: 20,
        total_students: 156,
        recent_activity: [
          { id: '1', type: 'instructor', message: 'New instructor joined', timestamp: '2 hours ago' },
          { id: '2', type: 'course', message: 'Course "React Basics" published', timestamp: '4 hours ago' },
          { id: '3', type: 'student', message: '5 new student enrollments', timestamp: '6 hours ago' },
        ]
      });
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your knowledge partner organization</p>
        </div>
        <Link
          href="/dashboard/kp/instructors/add"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Instructor
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Instructors */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <Link 
              href="/dashboard/kp/instructors"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructors</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{stats?.total_instructors || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{stats?.active_instructors || 0}</span>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <Link 
              href="/dashboard/kp/courses"
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Courses</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{stats?.total_courses || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Published</span>
              <span className="font-semibold text-green-600">{stats?.active_courses || 0}</span>
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
            <Link 
              href="/dashboard/kp/students"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Enrolled</span>
              <span className="font-semibold">{stats?.total_students || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This month</span>
              <span className="font-semibold text-purple-600">+24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/kp/instructors/add"
            className="group p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Add Instructor</p>
                <p className="text-sm text-gray-600">Create new account</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/kp/courses"
            className="group p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Manage Courses</p>
                <p className="text-sm text-gray-600">View and edit</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/kp/students"
            className="group p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">View Students</p>
                <p className="text-sm text-gray-600">Track progress</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/kp/analytics"
            className="group p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View insights</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recent_activity && stats.recent_activity.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recent_activity.map((activity) => (
              <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-gray-900 font-medium">{activity.message}</p>
                  <p className="text-gray-600 text-sm">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
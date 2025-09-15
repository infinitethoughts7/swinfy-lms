"use client";

import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

interface InstructorStats {
  total_courses: number;
  active_courses: number;
  total_students: number;
  upcoming_sessions: number;
  completed_sessions: number;
  average_rating: number;
}

export default function InstructorDashboard() {
  const [user, setUser] = useState(getCurrentUser());
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock instructor stats for now
    setTimeout(() => {
      setStats({
        total_courses: 0,
        active_courses: 0,
        total_students: 0,
        upcoming_sessions: 0,
        completed_sessions: 0,
        average_rating: 0,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.full_name || 'Instructor'}! 👋
        </h1>
        <p className="text-blue-100">
          Ready to inspire and educate? Your dashboard shows your teaching activity and progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_courses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_students || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Upcoming Sessions</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats?.upcoming_sessions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Account Active</p>
                <p className="text-sm text-gray-600">Your instructor account is active and ready</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Profile Complete</p>
                <p className="text-sm text-gray-600">All required information is filled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
              <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Create New Course</p>
                <p className="text-sm text-gray-600">Start building your next course</p>
              </div>
            </button>
            <button className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
              <Calendar className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Schedule Session</p>
                <p className="text-sm text-gray-600">Plan your next teaching session</p>
              </div>
            </button>
            <button className="w-full flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Track your teaching performance</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started as an Instructor</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Create Your First Course</h4>
            <p className="text-sm text-gray-600">Design and structure your course content to engage students effectively.</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Connect with Students</h4>
            <p className="text-sm text-gray-600">Build relationships and provide personalized learning experiences.</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Track Progress</h4>
            <p className="text-sm text-gray-600">Monitor student progress and adjust your teaching approach accordingly.</p>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Welcome to the Knowledge Partner Platform!</h3>
            <p className="mt-1 text-sm text-blue-700">
              Your account has been successfully created with the password <strong>rockyg07</strong>. 
              You can now start creating courses and connecting with students. 
              Don't forget to update your profile with additional information about your expertise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { Users, UserPlus, BookOpen, TrendingUp, Plus, ArrowRight, X, Save } from 'lucide-react';
import Link from 'next/link';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth';

interface Instructor {
  id: string;
  full_name: string;
  email: string;
  title: string;
  bio: string;
  specializations: string;
  technologies: string;
  years_of_experience: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

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
  instructors: Instructor[];
}

export default function KPDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: 'rockyg07' // Default password as requested
  });

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
      
      // Fetch instructor list and approved courses in parallel
      const [instructorsResponse, coursesResponse] = await Promise.all([
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/kp/instructors/`, {
          method: 'GET',
        }),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/courses/`, {
          method: 'GET',
        })
      ]);

      if (!instructorsResponse.ok) {
        throw new Error('Failed to fetch instructor data');
      }

      const instructors = await instructorsResponse.json();
      
      // Calculate stats from instructor data
      const total_instructors = instructors.length;
      const active_instructors = instructors.filter((instructor: Instructor) => instructor.is_available).length;
      const available_instructors = instructors.filter((instructor: Instructor) => instructor.is_available).length;
      
      // Calculate course stats
      let total_courses = 0;
      let active_courses = 0;
      
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        const courses = coursesData.results || coursesData;
        total_courses = courses.length;
        active_courses = courses.filter((course: { is_published: boolean; is_active: boolean }) => course.is_published && course.is_active).length;
      }
      
      const data = {
        total_instructors,
        active_instructors,
        available_instructors,
        total_courses,
        active_courses,
        total_students: 156, // Mock data - will need student API later
        recent_activity: [
          { id: '1', type: 'instructor', message: 'New instructor joined', timestamp: '2 hours ago' },
          { id: '2', type: 'course', message: 'Course "React Basics" published', timestamp: '4 hours ago' },
          { id: '3', type: 'student', message: '5 new student enrollments', timestamp: '6 hours ago' },
        ],
        instructors // Store instructor list for display
      };
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Fallback to mock data
      setStats({
        total_instructors: 0,
        active_instructors: 0,
        available_instructors: 0,
        total_courses: 0,
        active_courses: 0,
        total_students: 0,
        recent_activity: [],
        instructors: []
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setAddForm({
      full_name: '',
      email: '',
      password: 'rockyg07'
    });
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
    setAddForm({
      full_name: '',
      email: '',
      password: 'rockyg07'
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.full_name.trim() || !addForm.email.trim()) return;

    try {
      setSaving(true);
      
      // Call the API to create instructor
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/kp/instructors/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: addForm.full_name,
          email: addForm.email,
          password: addForm.password,
          confirm_password: addForm.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || 'Failed to create instructor');
      }

      const newInstructor = await response.json();
      console.log('Instructor created successfully:', newInstructor);
      
      alert('Instructor added successfully! Profile information will be updated by the instructor.');
      closeAddModal();
      fetchDashboardStats(); // Refresh the dashboard data
    } catch (err) {
      console.error('Error adding instructor:', err);
      setError(err instanceof Error ? err.message : 'Failed to add instructor');
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm">Manage your knowledge partner organization</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Instructor
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Instructors */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <Link 
              href="/dashboard/kp/instructors"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Instructors</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{stats?.total_instructors || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{stats?.active_instructors || 0}</span>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <Link 
              href="/dashboard/kp/courses"
              className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Courses</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{stats?.total_courses || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Published</span>
              <span className="font-semibold text-green-600">{stats?.active_courses || 0}</span>
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>
            <Link 
              href="/dashboard/kp/students"
              className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Students</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Enrolled</span>
              <span className="font-semibold">{stats?.total_students || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">This month</span>
              <span className="font-semibold text-purple-600">+24</span>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <Link 
              href="/dashboard/kp/analytics"
              className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Analytics</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Revenue</span>
              <span className="font-semibold">₹2.4L</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Growth</span>
              <span className="font-semibold text-green-600">+12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={openAddModal}
            className="group p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 w-full text-left"
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
          </button>

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

      {/* Instructors List */}
      {stats?.instructors && stats.instructors.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Instructors</h2>
            <Link 
              href="/dashboard/kp/instructors"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.instructors.slice(0, 6).map((instructor) => (
              <div key={instructor.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {instructor.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{instructor.full_name}</h3>
                      <p className="text-sm text-gray-600">{instructor.title}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    instructor.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {instructor.is_available ? 'Available' : 'Busy'}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{instructor.email}</p>
                  {instructor.specializations && (
                    <div className="flex flex-wrap gap-1">
                      {instructor.specializations.split(',').slice(0, 2).map((spec, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {spec.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{instructor.years_of_experience} years exp</span>
                    <span>{new Date(instructor.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Add Instructor Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Instructor</h3>
              <button
                onClick={closeAddModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-4 space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={addForm.full_name}
                    onChange={(e) => setAddForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="text"
                    value={addForm.password}
                    onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Default password"
                  />
                  <p className="text-xs text-gray-500 mt-1">A secure password will be generated automatically</p>
                </div>
              </div>

              {/* Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Profile information will be updated by the instructor after login.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !addForm.full_name.trim() || !addForm.email.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Instructor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
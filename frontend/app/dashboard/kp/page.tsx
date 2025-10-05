"use client";

import { useState, useEffect } from 'react';
import { Users, UserPlus, BookOpen, TrendingUp, Plus, ArrowRight, X, Save, LineChart as LineChartIcon } from 'lucide-react';
import Link from 'next/link';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth';
import { 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import mockData from '@/lib/mockAnalyticsData.json';

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
  pending_payments_count: number;
  pending_payments_amount: number;
  total_learners: number;
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
      const [instructorsResponse, coursesResponse, pendingPaymentsResponse] = await Promise.all([
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/kp/instructors/`, {
          method: 'GET',
        }),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/courses/`, {
          method: 'GET',
        }),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payments/admin/pending/`, {
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
      
      let pending_payments_count = 0;
      let pending_payments_amount = 0;

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        const courses = coursesData.results || coursesData;
        total_courses = courses.length;
        active_courses = courses.filter((course: { is_published: boolean; is_active: boolean }) => course.is_published && course.is_active).length;
      }

      if (pendingPaymentsResponse.ok) {
        const pendingData = await pendingPaymentsResponse.json();
        const payments = pendingData.results || pendingData;
        pending_payments_count = payments.length;
        pending_payments_amount = payments.reduce((sum: number, p: { amount: number }) => sum + (Number(p.amount) || 0), 0);
      }
      
      const data = {
        total_instructors,
        active_instructors,
        available_instructors,
        total_courses,
        active_courses,
        pending_payments_count,
        pending_payments_amount,
        total_learners: 156, // Mock data - will need learner API later
        recent_activity: [
          { id: '1', type: 'instructor', message: 'New instructor joined', timestamp: '2 hours ago' },
          { id: '2', type: 'course', message: 'Course "React Basics" published', timestamp: '4 hours ago' },
          { id: '3', type: 'learner', message: '5 new learner enrollments', timestamp: '6 hours ago' },
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
        pending_payments_count: 0,
        pending_payments_amount: 0,
        total_learners: 0,
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
    
    // Basic validation
    if (!addForm.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!addForm.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!addForm.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (addForm.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setSaving(true);
      
      const requestData = {
        full_name: addForm.full_name,
        email: addForm.email,
        password: addForm.password,
        confirm_password: addForm.password
      };
      
      console.log('=== FRONTEND DEBUG: Instructor Creation Request ===');
      console.log('Form data:', addForm);
      console.log('Request payload:', requestData);
      console.log('Request URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/kp/instructors/`);
      console.log('Expected backend fields: email, full_name, password, confirm_password');
      console.log('===============================================');
      
      // Use authenticatedFetch instead of plain fetch for proper token handling
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/kp/instructors/`, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error data:', errorData);
        } catch (jsonError) {
          console.error('Could not parse error JSON:', jsonError);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        // Handle validation errors
        if (errorData.email && Array.isArray(errorData.email)) {
          const emailError = errorData.email.join(', ');
          if (emailError.includes('already exists')) {
            throw new Error('⚠️ This email address is already registered. Please use a different email address.');
          }
          throw new Error(`📧 Email error: ${emailError}`);
        }
        if (errorData.password && Array.isArray(errorData.password)) {
          throw new Error(`🔐 Password error: ${errorData.password.join(', ')}`);
        }
        if (errorData.full_name && Array.isArray(errorData.full_name)) {
          throw new Error(`👤 Name error: ${errorData.full_name.join(', ')}`);
        }
        
        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}: Failed to create instructor`);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-xs sm:text-sm">Manage your knowledge partner organization</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium w-fit"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Add Instructor
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Instructors */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <Link 
              href="/dashboard/kp/instructors"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Instructors</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{stats?.total_instructors || 0}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{stats?.active_instructors || 0}</span>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <Link 
              href="/dashboard/kp/courses"
              className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Courses</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{stats?.total_courses || 0}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Published</span>
              <span className="font-semibold text-green-600">{stats?.active_courses || 0}</span>
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <Link 
              href="/dashboard/kp/learners"
              className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Learners</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Enrolled</span>
              <span className="font-semibold">{stats?.total_learners || 0}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">This month</span>
              <span className="font-semibold text-purple-600">+24</span>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl mb-2 sm:mb-0 w-fit">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
            </div>
            <Link 
              href="/dashboard/kp/analytics"
              className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Analytics</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Revenue</span>
              <span className="font-semibold">₹2.4L</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Growth</span>
              <span className="font-semibold text-green-600">+12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Enrollment Trends - Full Width */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Course Enrollment Trends</h3>
            <p className="text-xs text-gray-600">Monthly enrollment tracking for top courses</p>
          </div>
          <LineChartIcon className="h-4 w-4 text-blue-600" />
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={Object.entries(mockData.monthly_enrollment_trends).map(([month, courses]) => ({
              month,
              'Python Programming': courses['Complete Python Programming'],
              'ML with Python': courses['Machine Learning with Python'],
              'Data Science': courses['Data Science Fundamentals'],
              'Deep Learning': courses['Deep Learning & Neural Networks'],
              'React.js Dev': courses['React.js Development']
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: '11px' }} />
              <Legend 
                align="right" 
                verticalAlign="top" 
                wrapperStyle={{ fontSize: '10px', paddingBottom: '8px' }}
              />
              <Line 
                type="monotone" 
                dataKey="Python Programming" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="ML with Python" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="Data Science" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="Deep Learning" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="React.js Dev" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrollment vs Revenue Chart - Full Width */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Enrollment vs Revenue Analysis</h3>
            <p className="text-xs text-gray-600">Compare student volume with earnings performance</p>
          </div>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </div>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <ComposedChart 
              data={mockData.enrollment_vs_revenue.map(item => ({
                course: item.course.length > 18 ? item.course.substring(0, 18) + '...' : item.course,
                enrollments: item.enrollments,
                revenue: item.revenue / 1000 // Convert to thousands
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="course" 
                angle={-40}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 9 }}
              />
              <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Revenue (₹K)') {
                    return [`₹${(value as number * 1000).toLocaleString('en-IN')}`, name];
                  }
                  return [value, name];
                }}
                contentStyle={{ fontSize: '11px' }}
              />
              <Legend 
                align="right" 
                verticalAlign="top" 
                wrapperStyle={{ fontSize: '10px', paddingBottom: '8px' }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="enrollments" 
                fill="#3B82F6" 
                name="Enrollments"
                radius={[3, 3, 0, 0]}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="revenue" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Revenue (₹K)"
                dot={{ fill: '#EF4444', r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
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
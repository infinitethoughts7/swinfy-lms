"use client";

import { useState, useEffect } from 'react';
import { Users, UserPlus, BookOpen, TrendingUp, ArrowRight, Save, LineChart as LineChartIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth/token';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface KPAnalytics {
  instructors: Array<{
    id: string;
    name: string;
    specialization: string;
    courses_count: number;
    total_students: number;
  }>;
  courses: Array<{
    id: string;
    title: string;
    instructor: string;
    instructor_id: string | null;
    category: string;
    price: number;
    enrollments: number;
    revenue: number;
    created_month: string;
  }>;
  monthly_enrollment_trends: Record<string, Record<string, number>>;
  course_popularity: Array<{
    course: string;
    students: number;
    category: string;
  }>;
  enrollment_vs_revenue: Array<{
    course: string;
    enrollments: number;
    revenue: number;
  }>;
  summary: {
    total_students: number;
    total_courses: number;
    total_instructors: number;
    total_revenue: number;
    most_popular_course: string | null;
    highest_revenue_course: string | null;
    average_course_price: number;
  };
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
  const [analytics, setAnalytics] = useState<KPAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: ''
  });

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

      const [instructorsResponse, coursesResponse, pendingPaymentsResponse, analyticsResponse] = await Promise.all([
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/kp/instructors/`, {
          method: 'GET',
        }),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/courses/`, {
          method: 'GET',
        }),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payments/admin/pending/`, {
          method: 'GET',
        }),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/analytics/kp/`, {
          method: 'GET',
        })
      ]);

      if (!instructorsResponse.ok) {
        throw new Error('Failed to fetch instructor data');
      }

      const instructors = await instructorsResponse.json();

      const total_instructors = instructors.length;
      const active_instructors = instructors.filter((instructor: Instructor) => instructor.is_available).length;
      const available_instructors = instructors.filter((instructor: Instructor) => instructor.is_available).length;

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

      let analyticsData: KPAnalytics | null = null;
      if (analyticsResponse.ok) {
        analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      const data = {
        total_instructors,
        active_instructors,
        available_instructors,
        total_courses,
        active_courses,
        pending_payments_count,
        pending_payments_amount,
        total_learners: analyticsData?.summary?.total_students || 0,
        recent_activity: [],
        instructors
      };
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');

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
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setAddForm({
      full_name: '',
      email: ''
    });
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
    setAddForm({
      full_name: '',
      email: ''
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      setSaving(true);

      const requestData = {
        full_name: addForm.full_name,
        email: addForm.email,
        password: '',
        confirm_password: ''
      };

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
        if (errorData.email && Array.isArray(errorData.email)) {
          const emailError = errorData.email.join(', ');
          if (emailError.includes('already exists')) {
            throw new Error('This email address is already registered. Please use a different email address.');
          }
          throw new Error(`Email error: ${emailError}`);
        }
        if (errorData.password && Array.isArray(errorData.password)) {
          throw new Error(`Password error: ${errorData.password.join(', ')}`);
        }
        if (errorData.full_name && Array.isArray(errorData.full_name)) {
          throw new Error(`Name error: ${errorData.full_name.join(', ')}`);
        }

        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}: Failed to create instructor`);
      }

      await response.json();

      alert('Instructor added successfully! An invitation email with login credentials has been sent to their email address. They will be prompted to change their password upon first login.');
      closeAddModal();
      fetchDashboardStats();
    } catch (err) {
      console.error('Error adding instructor:', err);
      setError(err instanceof Error ? err.message : 'Failed to add instructor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="h-auto p-1"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-xs sm:text-sm">Manage your knowledge partner organization</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-6">
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
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-6">
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
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3 sm:p-4 lg:p-6">
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
                <span className="text-gray-600">Total Enrolled</span>
                <span className="font-semibold">{stats?.total_learners || 0}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold text-purple-600">{analytics?.summary?.total_revenue?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Course Enrollment Trends</CardTitle>
              <CardDescription className="text-xs">Monthly enrollment tracking for top courses</CardDescription>
            </div>
            <LineChartIcon className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            {analytics?.monthly_enrollment_trends && Object.keys(analytics.monthly_enrollment_trends).length > 0 ? (
            <ResponsiveContainer>
                <LineChart data={Object.entries(analytics.monthly_enrollment_trends).map(([month, courses]) => {
                  const courseNames = Object.keys(courses);
                  const dataPoint: Record<string, string | number> = { month };
                  courseNames.forEach((courseName) => {
                    const shortName = courseName.length > 15 ? courseName.substring(0, 15) + '...' : courseName;
                    dataPoint[shortName] = courses[courseName];
                  });
                  return dataPoint;
                })}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Legend
                  align="right"
                  verticalAlign="top"
                  wrapperStyle={{ fontSize: '10px', paddingBottom: '8px' }}
                />
                  {analytics.courses.slice(0, 5).map((course, index) => {
                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
                    const shortName = course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title;
                    return (
                <Line
                        key={course.id}
                  type="monotone"
                        dataKey={shortName}
                        stroke={colors[index % colors.length]}
                  strokeWidth={2}
                        dot={{ fill: colors[index % colors.length], r: 3 }}
                />
                    );
                  })}
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No enrollment trend data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Course Enrollment vs Revenue Analysis</CardTitle>
              <CardDescription className="text-xs">Compare student volume with earnings performance</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 400 }}>
            {analytics?.enrollment_vs_revenue && analytics.enrollment_vs_revenue.length > 0 ? (
            <ResponsiveContainer>
              <ComposedChart
                  data={analytics.enrollment_vs_revenue.map(item => ({
                  course: item.course.length > 18 ? item.course.substring(0, 18) + '...' : item.course,
                  enrollments: item.enrollments,
                  revenue: item.revenue / 1000
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
                    if (name === 'Revenue (K)') {
                      return [`${(value as number * 1000).toLocaleString('en-IN')}`, name];
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
                  name="Revenue (K)"
                  dot={{ fill: '#EF4444', r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No enrollment and revenue data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {stats?.recent_activity && stats.recent_activity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Instructor</DialogTitle>
            <DialogDescription>
              Enter the instructor details below. They will receive an email with login credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-xs space-y-1">
                <p><strong>Secure Password:</strong> A randomly-generated temporary password will be created automatically.</p>
                <p><strong>Email Invitation:</strong> The instructor will receive an invitation email with their login credentials.</p>
                <p><strong>Password Change:</strong> They must change their password after first login for security.</p>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeAddModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !addForm.full_name.trim() || !addForm.email.trim()}
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
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

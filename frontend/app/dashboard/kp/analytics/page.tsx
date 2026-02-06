"use client";

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import {
  Users,
  BookOpen,
  DollarSign,
  Award,
  Target,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
} from 'lucide-react';
import mockData from '@/lib/mockAnalyticsData.json';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const enrollmentVsRevenueData = mockData.enrollment_vs_revenue.map(item => ({
    course: item.course.length > 20 ? item.course.substring(0, 20) + '...' : item.course,
    enrollments: item.enrollments,
    revenue: item.revenue / 1000
  }));

  const monthlyTrendData = Object.entries(mockData.monthly_enrollment_trends).map(([month, courses]) => ({
    month,
    'Complete Python Programming': courses['Complete Python Programming'],
    'Machine Learning with Python': courses['Machine Learning with Python'],
    'Data Science Fundamentals': courses['Data Science Fundamentals'],
    'Deep Learning & Neural Networks': courses['Deep Learning & Neural Networks'],
    'React.js Development': courses['React.js Development']
  }));

  const coursePopularityData = mockData.course_popularity.map(item => ({
    course: item.course.length > 25 ? item.course.substring(0, 25) + '...' : item.course,
    students: item.students,
    category: item.category
  }));

  const formatTooltipCurrency = (value: number) => {
    return [`₹${(value * 1000).toLocaleString('en-IN')}`, 'Revenue'];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 text-sm">Comprehensive insights into course performance and student engagement</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <BarChart3 className="h-5 w-5" />
          <span className="font-medium">Student Analytics</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{mockData.summary.total_students}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-green-600">{mockData.summary.total_courses}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">₹{mockData.summary.total_revenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Course</p>
                <p className="text-lg font-bold text-orange-600">{mockData.summary.most_popular_course}</p>
                <p className="text-xs text-gray-500">{mockData.course_popularity[0].students} students</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Chart 2: Course Enrollment Trends (Line Chart) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Course Enrollment Trends</CardTitle>
                <CardDescription>Monthly enrollment tracking for top 5 courses</CardDescription>
              </div>
              <LineChartIcon className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Complete Python Programming"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Machine Learning with Python"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Data Science Fundamentals"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Deep Learning & Neural Networks"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="React.js Development"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Total Students by Course (Horizontal Bar Chart) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Students by Course</CardTitle>
                <CardDescription>Course popularity comparison</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={coursePopularityData}
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="course"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="students" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart 9: Enrollment vs Revenue (Dual-Axis Chart) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enrollment vs Revenue Analysis</CardTitle>
              <CardDescription>Compare student volume with earnings performance</CardDescription>
            </div>
            <PieChart className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <ComposedChart data={enrollmentVsRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="course"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'Revenue (₹ thousands)') {
                      return formatTooltipCurrency(value as number);
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="enrollments"
                  fill="#3B82F6"
                  name="Enrollments"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#EF4444"
                  strokeWidth={3}
                  name="Revenue (₹ thousands)"
                  dot={{ fill: '#EF4444', r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Course Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Python Dominance */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-900">Python Courses Dominance</CardTitle>
                <CardDescription className="text-blue-700">Leading in both enrollment and engagement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-800">Python-related courses:</span>
              <span className="font-bold text-blue-900">{mockData.summary.python_related_courses}/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">Students in Python courses:</span>
              <span className="font-bold text-blue-900">{mockData.summary.python_students}/100</span>
            </div>
            <Progress value={(mockData.summary.python_students / 100) * 100} className="h-2 bg-blue-200" />
          </CardContent>
        </Card>

        {/* Instructor Performance */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-900">Top Instructor Performance</CardTitle>
                <CardDescription className="text-green-700">Dr. Rajesh Kumar leading with Python expertise</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockData.instructors.map((instructor) => (
              <div key={instructor.id} className="flex justify-between items-center">
                <span className="text-green-800 text-sm">{instructor.name}:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-green-900">{instructor.total_students}</span>
                  <div className="w-16">
                    <Progress value={(instructor.total_students / 52) * 100} className="h-2 bg-green-200" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Data Source Note */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertDescription className="flex items-center">
          <div className="text-yellow-400 text-xl mr-3">📊</div>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Analytics Data</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This dashboard shows comprehensive analytics based on enrollment data from 100 students across 10 courses taught by 3 instructors.
              Python-related courses show the highest engagement with 40% of total enrollments.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

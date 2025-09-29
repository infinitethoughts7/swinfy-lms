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
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign,
  Award,
  Target,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  Calendar
} from 'lucide-react';
import mockData from '@/lib/mockAnalyticsData.json';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Prepare data for enrollment vs revenue chart
  const enrollmentVsRevenueData = mockData.enrollment_vs_revenue.map(item => ({
    course: item.course.length > 20 ? item.course.substring(0, 20) + '...' : item.course,
    enrollments: item.enrollments,
    revenue: item.revenue / 1000 // Convert to thousands for readability
  }));

  // Prepare data for monthly trends
  const monthlyTrendData = Object.entries(mockData.monthly_enrollment_trends).map(([month, courses]) => ({
    month,
    'Complete Python Programming': courses['Complete Python Programming'],
    'Machine Learning with Python': courses['Machine Learning with Python'],
    'Data Science Fundamentals': courses['Data Science Fundamentals'],
    'Deep Learning & Neural Networks': courses['Deep Learning & Neural Networks'],
    'React.js Development': courses['React.js Development']
  }));

  // Prepare data for course popularity (horizontal bar chart)
  const coursePopularityData = mockData.course_popularity.map(item => ({
    course: item.course.length > 25 ? item.course.substring(0, 25) + '...' : item.course,
    students: item.students,
    category: item.category
  }));

  const formatCurrency = (value: number) => {
    return `₹${(value * 1000).toLocaleString('en-IN')}`;
  };

  const formatTooltipCurrency = (value: number) => {
    return [`₹${(value * 1000).toLocaleString('en-IN')}`, 'Revenue'];
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{mockData.summary.total_students}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-green-600">{mockData.summary.total_courses}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₹{mockData.summary.total_revenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
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
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Chart 2: Course Enrollment Trends (Line Chart) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Course Enrollment Trends</h3>
              <p className="text-sm text-gray-600">Monthly enrollment tracking for top 5 courses</p>
            </div>
            <LineChartIcon className="h-5 w-5 text-blue-600" />
          </div>
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
        </div>

        {/* Chart 3: Total Students by Course (Horizontal Bar Chart) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Students by Course</h3>
              <p className="text-sm text-gray-600">Course popularity comparison</p>
            </div>
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
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
        </div>
      </div>

      {/* Chart 9: Enrollment vs Revenue (Dual-Axis Chart) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Enrollment vs Revenue Analysis</h3>
            <p className="text-sm text-gray-600">Compare student volume with earnings performance</p>
          </div>
          <PieChart className="h-5 w-5 text-purple-600" />
        </div>
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
      </div>

      {/* Course Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Python Dominance */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Python Courses Dominance</h3>
              <p className="text-sm text-blue-700">Leading in both enrollment and engagement</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-800">Python-related courses:</span>
              <span className="font-bold text-blue-900">{mockData.summary.python_related_courses}/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">Students in Python courses:</span>
              <span className="font-bold text-blue-900">{mockData.summary.python_students}/100</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(mockData.summary.python_students / 100) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Instructor Performance */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Top Instructor Performance</h3>
              <p className="text-sm text-green-700">Dr. Rajesh Kumar leading with Python expertise</p>
            </div>
          </div>
          <div className="space-y-3">
            {mockData.instructors.map((instructor, index) => (
              <div key={instructor.id} className="flex justify-between items-center">
                <span className="text-green-800 text-sm">{instructor.name}:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-green-900">{instructor.total_students}</span>
                  <div className="w-16 bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(instructor.total_students / 52) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Source Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-yellow-400 text-xl mr-3">📊</div>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Analytics Data</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This dashboard shows comprehensive analytics based on enrollment data from 100 students across 10 courses taught by 3 instructors. 
              Python-related courses show the highest engagement with 40% of total enrollments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

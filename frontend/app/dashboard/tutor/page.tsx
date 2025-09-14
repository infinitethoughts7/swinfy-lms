'use client';

import { useState, useEffect } from 'react';
import StatsCard, { StudentStatsCard, SessionStatsCard } from '@/components/dashboard/StatsCard';
import CourseCard from '@/components/dashboard/CourseCard';
import StudentCard from '@/components/dashboard/StudentCard';
import LiveSessionCard from '@/components/dashboard/LiveSessionCard';
import { TutorQuickActions } from '@/components/dashboard/QuickActions';
import { StudentDistributionChart, WeeklyActivityChart } from '@/components/dashboard/ProgressChart';
import { userApi, studentDashboardApi } from '@/lib/api';

// Type definitions
interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledCourses: number;
  completedCourses: number;
  progress: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  performance?: {
    score: number;
    rank?: number;
  };
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description?: string;
  thumbnail?: string;
  duration_weeks?: number;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  level_display?: string;
  enrollment_count?: number;
  rating?: number;
  average_rating?: number;
  category?: string;
  category_display?: string;
  is_published?: boolean;
  tutor?: {
    full_name: string;
    avatar?: string;
  };
}

interface LiveSession {
  id: string;
  title: string;
  course: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  startTime: string;
  duration: number; // in minutes
  participants?: number;
  maxParticipants?: number;
  status: 'upcoming' | 'live' | 'ended';
  description?: string;
  meetingLink?: string;
  recordingAvailable?: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'student' | 'tutor' | 'admin';
  is_verified: boolean;
  date_joined: string;
  phone?: string;
  bio?: string;
  goals?: string[];
  profile_picture?: string;
  organization?: {
    id: string;
    name: string;
    type: string;
  };
  can_create_courses: boolean;
  can_manage_organization: boolean;
}

interface WeeklyActivity {
  day: string;
  hours: number;
}

interface StudentDistribution {
  level: string;
  count: number;
}

interface DashboardStats {
  total_enrollments: number;
  active_enrollments: number;
  recent_enrollments: number;
  published_courses: number;
  total_revenue: number;
}

interface TutorDashboardData {
  dashboardStats: DashboardStats | null;
  myCourses: Course[];
  recentStudents: Student[];
  upcomingSessions: LiveSession[];
  userProfile: UserProfile | null;
  weeklyActivity: WeeklyActivity[];
  studentDistribution: StudentDistribution[];
}

export default function TutorDashboard() {
  const [dashboardData, setDashboardData] = useState<TutorDashboardData>({
    dashboardStats: null,
    myCourses: [],
    recentStudents: [],
    upcomingSessions: [],
    userProfile: null,
    weeklyActivity: [],
    studentDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTutorDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all tutor dashboard data in parallel
        const [
          dashboardStatsData,
          myCoursesData,
          userProfileData,
          weeklyActivityData,
          studentDistributionData
        ] = await Promise.allSettled([
          userApi.getDashboardStats(),
          studentDashboardApi.getMyCourses(), // This will return courses taught by the tutor
          userApi.getProfile(),
          studentDashboardApi.getWeeklyActivity(),
          studentDashboardApi.getStudentDistribution()
        ]);

        setDashboardData({
          dashboardStats: dashboardStatsData.status === 'fulfilled' ? dashboardStatsData.value : null,
          myCourses: myCoursesData.status === 'fulfilled' ? myCoursesData.value.results || [] : [],
          recentStudents: [], // TODO: Implement recent students API
          upcomingSessions: [], // TODO: Implement upcoming sessions API
          userProfile: userProfileData.status === 'fulfilled' ? userProfileData.value : null,
          weeklyActivity: weeklyActivityData.status === 'fulfilled' ? weeklyActivityData.value.weekly_activity || [] : [],
          studentDistribution: studentDistributionData.status === 'fulfilled' ? studentDistributionData.value.student_distribution || [] : []
        });

      } catch (err) {
        console.error('Error fetching tutor dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorDashboardData();
  }, []);

  const handleCreateCourse = () => {
    window.location.href = '/dashboard/tutor/courses/create';
  };

  const handleManageCourses = () => {
    window.location.href = '/dashboard/tutor/courses';
  };

  const handleViewStudents = () => {
    window.location.href = '/dashboard/tutor/students';
  };

  const handleScheduleSession = () => {
    console.log('Scheduling session...');
  };

  const handleStartSession = () => {
    console.log('Starting session...');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tutor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { dashboardStats, myCourses, recentStudents, upcomingSessions, userProfile, weeklyActivity, studentDistribution } = dashboardData;

  // Calculate tutor stats from real data
  const tutorStats = {
    totalStudents: dashboardStats?.total_enrollments || 0,
    activeCourses: dashboardStats?.published_courses || 0,
    upcomingSessions: upcomingSessions.length,
    monthlyEarnings: dashboardStats?.total_revenue || 0
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tutor Dashboard 🎓
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {userProfile?.first_name || 'Tutor'}! Manage your courses and track student progress
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateCourse}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Course
          </button>
          <button
            onClick={handleManageCourses}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Manage Courses
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <TutorQuickActions
        onStartSession={handleStartSession}
        onCreateCourse={handleCreateCourse}
        onViewStudents={handleViewStudents}
        onScheduleSession={handleScheduleSession}
        liveStudents={tutorStats.totalStudents}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StudentStatsCard
          count={tutorStats.totalStudents}
        />
        <StatsCard
          title="Published Courses"
          value={tutorStats.activeCourses}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="green"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${tutorStats.monthlyEarnings.toLocaleString()}`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="yellow"
        />
        <SessionStatsCard
          upcoming={tutorStats.upcomingSessions}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
              <button
                onClick={handleManageCourses}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            
            {myCourses.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">Create your first course to start teaching</p>
                <button
                  onClick={handleCreateCourse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCourses.slice(0, 4).map((course) => (
                  <CourseCard
                    key={course.id || course.slug}
                    course={{
                      id: course.id || course.slug,
                      title: course.title,
                      description: course.description,
                      image: course.thumbnail || '/assets/courses/default.svg',
                      duration: course.duration_weeks ? `${course.duration_weeks} weeks` : 'N/A',
                      level: (course.level as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner',
                      students: course.enrollment_count || 0,
                      rating: course.average_rating || 0,
                      status: course.is_published ? 'active' : 'draft'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Students */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Students</h2>
              <button
                onClick={handleViewStudents}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            
            {recentStudents.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
                <p className="text-gray-600">Students will appear here once they enroll in your courses</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentStudents.slice(0, 3).map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
              <button
                onClick={handleScheduleSession}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Schedule
              </button>
            </div>
            
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions scheduled</h3>
                <p className="text-gray-600 mb-4">Schedule your first live session</p>
                <button
                  onClick={handleScheduleSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule Session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <LiveSessionCard
                    key={session.id}
                    session={session}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Activity</h2>
            <WeeklyActivityChart activities={weeklyActivity} />
          </div>

          {/* Student Distribution Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Distribution</h2>
            <StudentDistributionChart students={studentDistribution} />
          </div>
        </div>
      </div>
    </div>
  );
}
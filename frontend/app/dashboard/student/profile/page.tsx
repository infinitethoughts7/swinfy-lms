'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import StatsCard from '@/components/dashboard/StatsCard';
import { PerformanceChart, WeeklyActivityChart } from '@/components/dashboard/ProgressChart';
import { userApi, studentDashboardApi, paymentsApi } from '@/lib/api';

// User Profile Types
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

// Progress Analytics Types
interface ProgressAnalytics {
  completed_courses: number;
  average_progress: number;
  monthly_progress: Array<{
    month: string;
    score: number;
  }>;
}

// Payment History Types
interface PaymentHistory {
  id: string;
  amount: string;
  status: 'pending' | 'initiated' | 'paid' | 'failed' | 'verified' | 'rejected';
  created_at: string;
  course_title?: string;
  enrollment?: {
    course: {
      title: string;
    };
  };
}

// Study Session Types
interface StudySession {
  id: string;
  session_duration_minutes: number;
  progress_made: number;
  started_at: string;
  ended_at?: string;
  course?: {
    title: string;
  };
}

// Weekly Activity Types
interface WeeklyActivity {
  week: string;
  sessions: number;
  hours_studied: number;
  lessons_completed: number;
}

// Student Distribution Types
interface StudentDistribution {
  category: string;
  count: number;
  percentage: number;
}

interface ProfileData {
  userProfile: UserProfile | null;
  progressAnalytics: ProgressAnalytics | null;
  paymentHistory: PaymentHistory[];
  studySessions: StudySession[];
  weeklyActivity: WeeklyActivity[];
  studentDistribution: StudentDistribution[];
}

export default function StudentProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>({
    userProfile: null,
    progressAnalytics: null,
    paymentHistory: [],
    studySessions: [],
    weeklyActivity: [],
    studentDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    goals: [] as string[]
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          userProfileData,
          progressAnalyticsData,
          paymentHistoryData,
          studySessionsData,
          weeklyActivityData,
          studentDistributionData
        ] = await Promise.allSettled([
          userApi.getProfile(),
          studentDashboardApi.getProgressAnalytics(),
          paymentsApi.getPaymentHistory(),
          studentDashboardApi.getStudySessions(),
          studentDashboardApi.getWeeklyActivity(),
          studentDashboardApi.getStudentDistribution()
        ]);

        const profile = userProfileData.status === 'fulfilled' ? userProfileData.value : null;
        
        setProfileData({
          userProfile: profile,
          progressAnalytics: progressAnalyticsData.status === 'fulfilled' ? progressAnalyticsData.value : null,
          paymentHistory: paymentHistoryData.status === 'fulfilled' ? paymentHistoryData.value : [],
          studySessions: studySessionsData.status === 'fulfilled' ? studySessionsData.value.results || [] : [],
          weeklyActivity: weeklyActivityData.status === 'fulfilled' ? weeklyActivityData.value.weekly_activity || [] : [],
          studentDistribution: studentDistributionData.status === 'fulfilled' ? studentDistributionData.value.student_distribution || [] : []
        });

        // Initialize form data
        if (profile) {
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            bio: profile.bio || '',
            goals: profile.goals || []
          });
        }

      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = await userApi.updateProfile(formData);
      setProfileData(prev => ({ ...prev, userProfile: updatedProfile }));
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    const { userProfile } = profileData;
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        bio: userProfile.bio || '',
        goals: userProfile.goals || []
      });
    }
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
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

  const { userProfile, progressAnalytics, paymentHistory, studySessions, weeklyActivity } = profileData;
  
  // Calculate stats from available data
  const enrolledCourses = profileData.studySessions?.map((session: StudySession) => session.course?.title).filter(Boolean) || [];
  const uniqueCourses = [...new Set(enrolledCourses)];
  const totalCourses = uniqueCourses.length;
  const completedCourses = 0; // No progress data available yet

  // Calculate achievements based on real data
const achievements = [
  {
    id: 1,
      title: 'First Course Enrolled',
      description: 'Started your learning journey',
    icon: '🎓',
      earned: paymentHistory.length > 0,
      earnedDate: paymentHistory.length > 0 ? new Date(paymentHistory[0].created_at).toLocaleDateString() : null
  },
  {
    id: 2,
      title: 'Course Completed',
      description: 'Completed your first course',
      icon: '✅',
      earned: (progressAnalytics?.completed_courses || 0) > 0,
      earnedDate: null
  },
  {
    id: 3,
      title: 'Study Streak',
      description: 'Studied for 7 consecutive days',
      icon: '🔥',
      earned: studySessions.length >= 7,
      earnedDate: null
  },
  {
    id: 4,
      title: 'High Achiever',
      description: 'Maintained 90%+ average score',
      icon: '⭐',
      earned: (progressAnalytics?.average_progress || 0) >= 90,
      earnedDate: null
    }
  ];

  // Performance data from analytics
  const performanceData = progressAnalytics?.monthly_progress || [
    { month: 'No Data', score: 0 }
  ];

  // Weekly activity is now fetched from backend analytics

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and track your learning progress
          </p>
        </div>
        <div className="flex space-x-3">
          {editMode ? (
            <>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        <button
            onClick={() => window.location.href = '/dashboard/student'}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
            Back to Dashboard
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  {userProfile?.profile_picture ? (
                    <Image
                      src={userProfile.profile_picture}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {((userProfile?.first_name || 'S')[0] + (userProfile?.last_name || '')[0]).toUpperCase()}
                      </span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-700">
                  📷
                </button>
              </div>
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
            </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </h2>
                    <p className="text-gray-600">{userProfile?.email}</p>
                    <p className="text-gray-500 text-sm">
                      Student • Joined {userProfile?.date_joined ? new Date(userProfile.date_joined).toLocaleDateString() : 'Unknown'}
                    </p>
                    {userProfile?.phone && (
                      <p className="text-gray-500 text-sm">📞 {userProfile.phone}</p>
                    )}
                  </>
                )}
              </div>
      </div>

            {/* Bio Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
              {editMode ? (
                <textarea
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-600">
                  {userProfile?.bio || 'No bio provided yet. Click "Edit Profile" to add one!'}
                </p>
              )}
            </div>

            {/* Learning Goals */}
                <div>
              <h3 className="font-semibold text-gray-900 mb-3">Learning Goals</h3>
              {userProfile?.goals && userProfile.goals.length > 0 ? (
                <ul className="space-y-2">
                  {userProfile.goals.map((goal: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      {goal}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No learning goals set yet.</p>
                  )}
                </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.earned
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-green-800' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.earnedDate && (
                        <p className="text-xs text-green-500 mt-1">
                          Earned on {achievement.earnedDate}
                        </p>
                  )}
                </div>
                    {achievement.earned && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                  )}
                </div>
                </div>
              ))}
            </div>
              </div>
          </div>

          {/* Right Column - Stats and Analytics */}
          <div className="space-y-6">
          {/* Learning Stats */}
            <div className="grid grid-cols-1 gap-4">
              <StatsCard
              title="Courses Enrolled"
              value={totalCourses}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              color="blue"
            />
            <StatsCard
              title="Completed"
              value={completedCourses}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
              />
              <StatsCard
              title="Total Spent"
              value={`₹${paymentHistory
                .filter((payment: PaymentHistory) => payment.status === 'paid' || payment.status === 'verified')
                .reduce((sum: number, payment: PaymentHistory) => sum + parseFloat(payment.amount || '0'), 0)
                .toLocaleString()}`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              color="yellow"
              />
            </div>

            {/* Performance Chart */}
            <PerformanceChart data={performanceData} />

            {/* Weekly Activity */}
            <WeeklyActivityChart activities={weeklyActivity.map(activity => ({
              day: activity.week,
              hours: activity.hours_studied
            }))} />

          {/* Recent Payments */}
          {paymentHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
              <div className="space-y-3">
                {paymentHistory.slice(0, 5).map((payment: PaymentHistory) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.course_title || payment.enrollment?.course?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
          </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{payment.amount}
                      </p>
                      <p className={`text-xs ${
                        payment.status === 'verified' ? 'text-green-600' :
                        payment.status === 'paid' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {payment.status}
                      </p>
              </div>
            </div>
          ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
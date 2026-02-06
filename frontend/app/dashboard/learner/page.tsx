'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { userApi } from '@/features/users/services/user';
import { learnerDashboardApi } from '@/features/dashboard/services/learner';
import { paymentsApi } from '@/features/payments/services/payments';
import { liveSessionApi } from '@/features/live-sessions/services/live-session';
import type { LiveSession } from '@/shared/types';
import { getCourseThumbnailUrl } from '@/lib/utils/image';
import { BookOpen, Clock, Award, TrendingUp, Video, Calendar, Flame, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardStats {
  total_enrollments?: number;
  active_enrollments?: number;
  completed_enrollments?: number;
  total_spent?: number;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description?: string;
  thumbnail?: string;
  duration_weeks?: number;
  level?: string;
  level_display?: string;
  enrollment_count?: number;
  rating?: number;
  average_rating?: number;
  category?: string;
  category_display?: string;
  tutor?: {
    full_name: string;
    avatar?: string;
  };
}

interface Enrollment {
  id: string;
  course: Course;
  progress_percentage?: number;
  status: string;
}

interface WeeklyActivity {
  day: string;
  activity_count?: number;
  hours?: number;
}

interface LearnerDistribution {
  level: string;
  count: number;
}


interface Payment {
  id: string;
  amount: string;
  status: string;
  created_at: string;
}

interface LearnerHomeData {
  dashboardStats: DashboardStats | null;
  enrolledCourses: Enrollment[];
  weeklyActivity: WeeklyActivity[];
  learnerDistribution: LearnerDistribution[];
  recentPayments: Payment[];
  liveSessions: LiveSession[];
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 rounded-xl" />
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function LearnerHomePage() {
  const [data, setData] = useState<LearnerHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          dashboardStatsData,
          enrolledCoursesData,
          weeklyActivityData,
          learnerDistributionData,
          recentPaymentsData,
          liveSessionsData
        ] = await Promise.allSettled([
          userApi.getDashboardStats(),
          learnerDashboardApi.getMyCourses(),
          learnerDashboardApi.getWeeklyActivity(),
          learnerDashboardApi.getLearnerDistribution(),
          paymentsApi.getPaymentHistory(),
          liveSessionApi.upcoming()
        ]);

        setData({
          dashboardStats: dashboardStatsData.status === 'fulfilled' ? dashboardStatsData.value : null,
          enrolledCourses: enrolledCoursesData.status === 'fulfilled' ? (enrolledCoursesData.value.results || enrolledCoursesData.value || []) : [],
          weeklyActivity: weeklyActivityData.status === 'fulfilled' ? weeklyActivityData.value.weekly_activity || [] : [],
          learnerDistribution: learnerDistributionData.status === 'fulfilled' ? learnerDistributionData.value.learner_distribution || [] : [],
          recentPayments: recentPaymentsData.status === 'fulfilled' ? (recentPaymentsData.value.results || recentPaymentsData.value || []) : [],
          liveSessions: liveSessionsData.status === 'fulfilled' ? liveSessionsData.value || [] : []
        });
      } catch (err) {
        console.error('Error fetching learner home data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const stats = data?.dashboardStats || {};
  const enrolledCourses = data?.enrolledCourses || [];
  const recentCourses = enrolledCourses.slice(0, 3);
  const weeklyActivity = data?.weeklyActivity || [];
  const liveSessions = data?.liveSessions || [];
  const isNewLearner = (
    (!stats || Object.keys(stats).length === 0) &&
    enrolledCourses.length === 0 &&
    weeklyActivity.length === 0
  );

  if (isNewLearner) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome</h1>
          <p className="text-blue-100 text-sm sm:text-base">
            Your learner dashboard will appear here after you enroll in a course.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Get Started</h2>
            <p className="text-sm text-gray-600 mb-4">Browse courses and enroll to see your progress here.</p>
            <Button asChild>
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome back!</h1>
        <p className="text-blue-100 text-sm sm:text-base">
          Continue your learning journey and explore new opportunities.
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-lg font-bold text-gray-900">{stats.total_enrollments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-lg font-bold text-gray-900">{stats.active_enrollments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg font-bold text-gray-900">{stats.completed_enrollments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-lg font-bold text-gray-900">{stats.total_spent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity - Modern Design */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Weekly Activity</h2>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Target className="w-3 h-3" />
                  <span>Last 7 days</span>
                </div>
              </div>

              {/* Activity Stats Summary */}
              <div className="mb-5 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Activities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {weeklyActivity.reduce((sum, day) => sum + (day.activity_count || day.hours || 0), 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-1">Avg per day</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {weeklyActivity.length > 0
                        ? Math.round(weeklyActivity.reduce((sum, day) => sum + (day.activity_count || day.hours || 0), 0) / 7)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity Bars */}
              <div className="space-y-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                  const dayData = weeklyActivity.find(d => d.day === day);
                  const count = dayData?.activity_count || dayData?.hours || 0;
                  const maxCount = Math.max(...weeklyActivity.map(d => d.activity_count || d.hours || 0), 1);
                  const percentage = (count / maxCount) * 100;
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }) === day;

                  return (
                    <div key={day} className="flex items-center gap-3">
                      <span className={`w-8 text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                        {day}
                      </span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isToday
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : count > 0
                                ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                                : 'bg-gray-200'
                          }`}
                          style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                        />
                        {isToday && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <span className="text-[10px] font-medium text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">Today</span>
                          </div>
                        )}
                      </div>
                      <span className={`w-6 text-xs font-semibold text-right ${count > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Streak/Motivation Footer */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-sm">
                  {weeklyActivity.filter(d => (d.activity_count || d.hours || 0) > 0).length >= 5 ? (
                    <>
                      <span className="text-orange-500">Fire</span>
                      <span className="text-gray-600">Great week! Keep it up!</span>
                    </>
                  ) : weeklyActivity.filter(d => (d.activity_count || d.hours || 0) > 0).length >= 3 ? (
                    <>
                      <span>Strong</span>
                      <span className="text-gray-600">Good progress this week!</span>
                    </>
                  ) : (
                    <>
                      <span>Books</span>
                      <span className="text-gray-600">Start learning today!</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Courses - Expanded */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Courses</CardTitle>
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/dashboard/learner/courses">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No courses enrolled yet</p>
                  <Button asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentCourses.slice(0, 6).map((enrollment) => {
                    const courseUrl = `/dashboard/learner/courses/${enrollment.course?.slug || enrollment.course?.id || enrollment.id}`;

                    return (
                      <Card key={enrollment.id} className="hover:shadow-md transition-all duration-200">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start space-x-3 mb-3">
                            {(enrollment.course?.thumbnail || '/assets/courses/default.svg').endsWith('.svg') ? (
                              <img
                                src={getCourseThumbnailUrl(enrollment.course?.thumbnail)}
                                alt={enrollment.course?.title || 'Course'}
                                className="w-15 h-15 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <Image
                                src={getCourseThumbnailUrl(enrollment.course?.thumbnail)}
                                alt={enrollment.course?.title || 'Course'}
                                width={60}
                                height={60}
                                className="w-15 h-15 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                                {enrollment.course?.title || 'Untitled Course'}
                              </h3>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {enrollment.progress_percentage || 0}% complete
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={
                                      enrollment.status === 'active'
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                    }
                                  >
                                    {enrollment.status === 'active' ? 'Active' : 'Upcoming'}
                                  </Badge>
                                </div>
                                <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>{enrollment.course?.level_display || 'Beginner'}</span>
                                  <span>{enrollment.course?.duration_weeks || 0} weeks</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 border-t border-gray-100">
                            <Button asChild size="sm" className="w-full">
                              <Link href={courseUrl}>
                                {(enrollment.progress_percentage || 0) > 0 ? 'Continue Learning' : 'Start Learning'}
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Live Sessions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Live Sessions</CardTitle>
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/dashboard/learner/live-sessions">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {liveSessions.length === 0 ? (
                <div className="text-center py-6">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No upcoming live sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveSessions.slice(0, 3).map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{session.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{session.course_title}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(session.scheduled_datetime).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(session.scheduled_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                {session.meeting_platform_display}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                              {session.formatted_duration}
                            </Badge>
                            {session.is_live_now && (
                              <Badge variant="destructive" className="animate-pulse">
                                Live Now
                              </Badge>
                            )}
                          </div>
                        </div>
                        {session.meeting_link && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <Button asChild size="sm">
                              <a
                                href={session.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Join Session
                              </a>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

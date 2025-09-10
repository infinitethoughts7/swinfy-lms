'use client';

import StatsCard, { CourseStatsCard, StudentStatsCard, SessionStatsCard, PerformanceStatsCard } from '@/components/dashboard/StatsCard';
import CourseCard from '@/components/dashboard/CourseCard';
import LiveSessionCard from '@/components/dashboard/LiveSessionCard';
import { StudentQuickActions } from '@/components/dashboard/QuickActions';
import { CourseProgressChart, PerformanceChart } from '@/components/dashboard/ProgressChart';

// Mock data - in a real app this would come from API
const studentStats = {
  enrolledCourses: 5,
  completedCourses: 2,
  upcomingSessions: 3,
  averageScore: 87
};

const enrolledCourses = [
  {
    id: 'react-advanced',
    title: 'Advanced React Development',
    description: 'Master advanced React concepts including hooks, context, and performance optimization',
    image: '/assets/courses/react.svg',
    duration: '12 weeks',
    level: 'Advanced' as const,
    progress: 65,
    instructor: {
      name: 'Dr. Sarah Wilson',
      avatar: '/assets/students/s4.jpg'
    },
    lastAccessed: '2 hours ago',
    status: 'active' as const
  },
  {
    id: 'python-basics',
    title: 'Python Fundamentals',
    description: 'Learn Python programming from scratch with hands-on projects',
    image: '/assets/courses/python.svg',
    duration: '8 weeks',
    level: 'Beginner' as const,
    progress: 100,
    instructor: {
      name: 'Prof. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    lastAccessed: '1 day ago',
    status: 'completed' as const
  },
  {
    id: 'sql-database',
    title: 'SQL Database Management',
    description: 'Master SQL queries and database design principles',
    image: '/assets/courses/sql.png',
    duration: '10 weeks',
    level: 'Intermediate' as const,
    progress: 30,
    instructor: {
      name: 'Dr. Lisa Rodriguez',
      avatar: '/assets/students/s6.jpg'
    },
    lastAccessed: '3 days ago',
    status: 'active' as const
  }
];

const upcomingSessions = [
  {
    id: 'session-1',
    title: 'React Performance Optimization',
    course: 'Advanced React Development',
    instructor: {
      name: 'Dr. Sarah Wilson',
      avatar: '/assets/students/s4.jpg'
    },
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    duration: 90,
    participants: 15,
    maxParticipants: 25,
    status: 'upcoming' as const,
    description: 'Learn advanced techniques for optimizing React application performance'
  },
  {
    id: 'session-2',
    title: 'SQL Joins and Subqueries',
    course: 'SQL Database Management',
    instructor: {
      name: 'Dr. Lisa Rodriguez',
      avatar: '/assets/students/s6.jpg'
    },
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    duration: 60,
    participants: 0,
    maxParticipants: 30,
    status: 'upcoming' as const,
    description: 'Master complex SQL queries with joins and subqueries'
  }
];

const performanceData = [
  { month: 'Jan', score: 75 },
  { month: 'Feb', score: 82 },
  { month: 'Mar', score: 78 },
  { month: 'Apr', score: 85 },
  { month: 'May', score: 87 },
  { month: 'Jun', score: 90 }
];

export default function StudentDashboard() {
  const handleJoinSession = () => {
    console.log('Joining session...');
  };

  const handleViewCourses = () => {
    window.location.href = '/dashboard/student/courses';
  };

  const handleCheckAssignments = () => {
    console.log('Checking assignments...');
  };

  const handleViewProgress = () => {
    console.log('Viewing progress...');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, Sarah! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your learning journey today.
        </p>
      </div>

      {/* Quick Actions */}
      <StudentQuickActions
        onJoinSession={handleJoinSession}
        onViewCourses={handleViewCourses}
        onCheckAssignments={handleCheckAssignments}
        onViewProgress={handleViewProgress}
        upcomingSessions={studentStats.upcomingSessions}
        pendingAssignments={4}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CourseStatsCard 
          completed={studentStats.completedCourses} 
          total={studentStats.enrolledCourses}
          change={{ value: 15, type: 'increase', timeframe: 'this month' }}
        />
        <SessionStatsCard 
          upcoming={studentStats.upcomingSessions}
          change={{ value: 2, type: 'increase', timeframe: 'this week' }}
        />
        <PerformanceStatsCard 
          percentage={studentStats.averageScore}
          change={{ value: 5, type: 'increase', timeframe: 'this month' }}
        />
        <StatsCard
          title="Study Streak"
          value="12 days"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 0 0 .5 2 1.5 5C14.5 6.5 17 4 19 7c0 0-1 2-2 3 0 0 .5 2.5-.343 8.657z" />
            </svg>
          }
          color="red"
          change={{ value: 3, type: 'increase', timeframe: 'vs last week' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Courses and Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Current Courses</h2>
              <button 
                onClick={handleViewCourses}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.slice(0, 4).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  variant="student"
                  showProgress={true}
                />
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <LiveSessionCard
                  key={session.id}
                  session={session}
                  variant="student"
                  onJoin={(sessionId) => console.log('Joining session:', sessionId)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Progress and Analytics */}
        <div className="space-y-6">
          {/* Overall Progress */}
          <CourseProgressChart progress={75} />

          {/* Performance Chart */}
          <PerformanceChart data={performanceData} />

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Completed lesson: "React Hooks Fundamentals"
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Submitted assignment: "Python Data Structures"
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Joined live session: "SQL Best Practices"
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Earned certificate: "Python Fundamentals"
                  </p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Goals</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked 
                  readOnly
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-600 line-through">
                  Complete React Performance module
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked 
                  readOnly
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-600 line-through">
                  Submit SQL assignment
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-900">
                  Attend 2 live sessions
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-900">
                  Start new Python project
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

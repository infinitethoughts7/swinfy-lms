'use client';

import StatsCard, { StudentStatsCard, SessionStatsCard } from '@/components/dashboard/StatsCard';
import CourseCard from '@/components/dashboard/CourseCard';
import StudentCard from '@/components/dashboard/StudentCard';
import LiveSessionCard from '@/components/dashboard/LiveSessionCard';
import { TutorQuickActions } from '@/components/dashboard/QuickActions';
import { StudentDistributionChart, WeeklyActivityChart } from '@/components/dashboard/ProgressChart';

// Mock data for tutor dashboard
const tutorStats = {
  totalStudents: 47,
  activeCourses: 3,
  upcomingSessions: 2,
  monthlyEarnings: 3200
};

const myCourses = [
  {
    id: 'react-advanced',
    title: 'Advanced React Development',
    description: 'Master advanced React concepts including hooks, context, and performance optimization',
    image: '/assets/courses/react.svg',
    duration: '12 weeks',
    level: 'Advanced' as const,
    students: 25,
    rating: 4.8,
    status: 'active' as const
  },
  {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Learn core JavaScript concepts from beginner to intermediate level',
    image: '/assets/courses/javascript.svg',
    duration: '8 weeks',
    level: 'Beginner' as const,
    students: 32,
    rating: 4.9,
    status: 'active' as const
  },
  {
    id: 'web-performance',
    title: 'Web Performance Optimization',
    description: 'Optimize website performance using modern techniques and tools',
    image: '/assets/courses/react.svg',
    duration: '6 weeks',
    level: 'Intermediate' as const,
    students: 18,
    rating: 4.7,
    status: 'draft' as const
  }
];

const recentStudents = [
  {
    id: 'student-1',
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    avatar: '/assets/students/s1.jpg',
    enrolledCourses: 2,
    completedCourses: 1,
    progress: 75,
    lastActive: '2 hours ago',
    status: 'active' as const,
    joinDate: 'March 2024',
    performance: { score: 88 }
  },
  {
    id: 'student-2',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    avatar: '/assets/students/s2.jpg',
    enrolledCourses: 1,
    completedCourses: 0,
    progress: 45,
    lastActive: '1 day ago',
    status: 'active' as const,
    joinDate: 'April 2024',
    performance: { score: 92 }
  },
  {
    id: 'student-3',
    name: 'Sofia Rodriguez',
    email: 'sofia.r@email.com',
    avatar: '/assets/students/s3.jpg',
    enrolledCourses: 3,
    completedCourses: 2,
    progress: 90,
    lastActive: '3 hours ago',
    status: 'active' as const,
    joinDate: 'February 2024',
    performance: { score: 95 }
  }
];

const upcomingSessions = [
  {
    id: 'session-1',
    title: 'React Hooks Deep Dive',
    course: 'Advanced React Development',
    instructor: {
      name: 'Dr. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    duration: 90,
    participants: 18,
    maxParticipants: 25,
    status: 'upcoming' as const,
    description: 'Deep dive into React hooks patterns and custom hooks development'
  },
  {
    id: 'session-2',
    title: 'JavaScript ES6+ Features',
    course: 'JavaScript Fundamentals',
    instructor: {
      name: 'Dr. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // tomorrow
    duration: 60,
    participants: 0,
    maxParticipants: 30,
    status: 'upcoming' as const,
    description: 'Explore modern JavaScript features including arrow functions, destructuring, and async/await'
  }
];

const studentDistribution = [
  { level: 'Beginner', count: 20 },
  { level: 'Intermediate', count: 18 },
  { level: 'Advanced', count: 9 }
];

const weeklyActivity = [
  { day: 'Mon', hours: 4 },
  { day: 'Tue', hours: 6 },
  { day: 'Wed', hours: 3 },
  { day: 'Thu', hours: 5 },
  { day: 'Fri', hours: 7 },
  { day: 'Sat', hours: 2 },
  { day: 'Sun', hours: 1 }
];

export default function TutorDashboard() {
  const handleStartSession = () => {
    console.log('Starting live session...');
  };

  const handleCreateCourse = () => {
    console.log('Creating new course...');
  };

  const handleViewStudents = () => {
    window.location.href = '/dashboard/tutor/students';
  };

  const handleScheduleSession = () => {
    console.log('Scheduling session...');
  };

  const handleViewProfile = (studentId: string) => {
    console.log('Viewing student profile:', studentId);
  };

  const handleSendMessage = (studentId: string) => {
    console.log('Sending message to student:', studentId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, Dr. Chen! 👨‍🏫
        </h1>
        <p className="text-gray-600 mt-1">
          Ready to inspire and educate your students today?
        </p>
      </div>

      {/* Quick Actions */}
      <TutorQuickActions
        onStartSession={handleStartSession}
        onCreateCourse={handleCreateCourse}
        onViewStudents={handleViewStudents}
        onScheduleSession={handleScheduleSession}
        liveStudents={0}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StudentStatsCard 
          count={tutorStats.totalStudents}
          change={{ value: 12, type: 'increase', timeframe: 'this month' }}
        />
        <StatsCard
          title="Active Courses"
          value={tutorStats.activeCourses}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="blue"
          change={{ value: 1, type: 'increase', timeframe: 'this month' }}
        />
        <SessionStatsCard 
          upcoming={tutorStats.upcomingSessions}
          change={{ value: 0, type: 'increase', timeframe: 'this week' }}
        />
        <StatsCard
          title="Monthly Earnings"
          value={`$${tutorStats.monthlyEarnings.toLocaleString()}`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="green"
          change={{ value: 15, type: 'increase', timeframe: 'vs last month' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Courses and Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
              <button 
                onClick={handleCreateCourse}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Create New →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  variant="tutor"
                  showProgress={false}
                  onEdit={(courseId) => console.log('Editing course:', courseId)}
                />
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
              <button 
                onClick={handleScheduleSession}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Schedule New →
              </button>
            </div>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <LiveSessionCard
                  key={session.id}
                  session={session}
                  variant="tutor"
                  onJoin={(sessionId) => console.log('Starting session:', sessionId)}
                  onEdit={(sessionId) => console.log('Editing session:', sessionId)}
                />
              ))}
            </div>
          </div>

          {/* Recent Students Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Student Activity</h2>
              <button 
                onClick={handleViewStudents}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  variant="list"
                  onViewProfile={handleViewProfile}
                  onSendMessage={handleSendMessage}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Analytics and Quick Info */}
        <div className="space-y-6">
          {/* Student Distribution */}
          <StudentDistributionChart students={studentDistribution} />

          {/* Weekly Teaching Hours */}
          <WeeklyActivityChart activities={weeklyActivity} />

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sessions Completed</span>
                <span className="font-semibold text-gray-900">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hours Taught</span>
                <span className="font-semibold text-gray-900">28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Students</span>
                <span className="font-semibold text-green-600">+5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Rating</span>
                <span className="font-semibold text-yellow-600">4.8 ⭐</span>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <input type="checkbox" className="rounded text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Grade React assignments</p>
                  <p className="text-xs text-gray-500">15 submissions pending</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <input type="checkbox" className="rounded text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Update course materials</p>
                  <p className="text-xs text-gray-500">Add new ES6 examples</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <input type="checkbox" className="rounded text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Respond to student messages</p>
                  <p className="text-xs text-gray-500">3 unread messages</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <input type="checkbox" className="rounded text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Prepare next week's sessions</p>
                  <p className="text-xs text-gray-500">2 sessions to plan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-sm text-gray-600 italic">
                  "Dr. Chen's explanations are so clear and easy to follow!"
                </p>
                <p className="text-xs text-gray-500 mt-1">- Sarah M., React Course</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-sm text-gray-600 italic">
                  "Love the hands-on approach and real-world examples."
                </p>
                <p className="text-xs text-gray-500 mt-1">- Mike J., JavaScript Course</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-sm text-gray-600 italic">
                  "Best programming instructor I've had!"
                </p>
                <p className="text-xs text-gray-500 mt-1">- Lisa K., Web Performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

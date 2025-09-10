'use client';

import { useState } from 'react';
import Image from 'next/image';
import StatsCard from '@/components/dashboard/StatsCard';
import { PerformanceChart, WeeklyActivityChart } from '@/components/dashboard/ProgressChart';

// Mock student profile data
const studentProfile = {
  id: 'student-1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  avatar: '/assets/students/s1.jpg',
  bio: 'Passionate about web development and data science. Currently pursuing a career transition from marketing to full-stack development.',
  joinDate: 'March 2024',
  location: 'San Francisco, CA',
  timezone: 'PST (UTC-8)',
  phone: '+1 (555) 123-4567',
  linkedIn: 'https://linkedin.com/in/sarahjohnson',
  github: 'https://github.com/sarahjohnson',
  goals: [
    'Complete React certification by year end',
    'Build 3 full-stack projects',
    'Land a junior developer role',
    'Master Python for data analysis'
  ],
  preferences: {
    notifications: {
      email: true,
      sms: false,
      push: true,
      sessionReminders: true,
      assignmentDeadlines: true,
      courseUpdates: false
    },
    learning: {
      preferredSchedule: 'evenings',
      studyTime: '2-3 hours',
      difficulty: 'intermediate',
      topics: ['Web Development', 'Data Science', 'Python', 'JavaScript']
    }
  }
};

const achievements = [
  {
    id: 1,
    title: 'First Course Completed',
    description: 'Completed your first course: Python Fundamentals',
    icon: '🎓',
    earnedDate: '2024-05-15',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 2,
    title: 'Perfect Attendance',
    description: 'Attended 10 consecutive live sessions',
    icon: '🏆',
    earnedDate: '2024-06-01',
    color: 'bg-gold-100 text-gold-800'
  },
  {
    id: 3,
    title: 'Quick Learner',
    description: 'Completed a course 2 weeks ahead of schedule',
    icon: '⚡',
    earnedDate: '2024-06-10',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 4,
    title: 'Code Warrior',
    description: 'Submitted 25 coding assignments',
    icon: '💻',
    earnedDate: '2024-06-20',
    color: 'bg-green-100 text-green-800'
  }
];

const performanceData = [
  { month: 'Jan', score: 0 },
  { month: 'Feb', score: 0 },
  { month: 'Mar', score: 75 },
  { month: 'Apr', score: 82 },
  { month: 'May', score: 78 },
  { month: 'Jun', score: 87 }
];

const weeklyActivity = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.0 },
  { day: 'Wed', hours: 1.5 },
  { day: 'Thu', hours: 2.0 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 4.0 },
  { day: 'Sun', hours: 2.5 }
];

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'achievements'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(studentProfile);

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your profile information and learning preferences
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div className="relative px-6 pb-6">
          <div className="flex items-end space-x-4 -mt-16">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white p-1">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {studentProfile.avatar ? (
                    <Image
                      src={studentProfile.avatar}
                      alt={studentProfile.name}
                      width={88}
                      height={88}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">
                        {studentProfile.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900">{studentProfile.name}</h2>
              <p className="text-gray-600">{studentProfile.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>📍 {studentProfile.location}</span>
                <span>📅 Joined {studentProfile.joinDate}</span>
                <span>🕐 {studentProfile.timezone}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600">{studentProfile.bio}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-600">{studentProfile.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-600">{studentProfile.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.linkedIn}
                      onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <a href={studentProfile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {studentProfile.linkedIn}
                    </a>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <a href={studentProfile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {studentProfile.github}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Goals</h3>
              <div className="space-y-3">
                {studentProfile.goals.map((goal, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Stats and Analytics */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4">
              <StatsCard
                title="Courses Completed"
                value="2"
                color="green"
                size="sm"
              />
              <StatsCard
                title="Hours Studied"
                value="147"
                color="blue"
                size="sm"
              />
              <StatsCard
                title="Current Streak"
                value="12 days"
                color="purple"
                size="sm"
              />
            </div>

            {/* Performance Chart */}
            <PerformanceChart data={performanceData} />

            {/* Weekly Activity */}
            <WeeklyActivityChart activities={weeklyActivity} />
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-4xl mb-3">{achievement.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${achievement.color}`}>
                  Earned {achievement.earnedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive course updates via email</p>
                </div>
                <input type="checkbox" defaultChecked={studentProfile.preferences.notifications.email} className="rounded text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive urgent notifications via SMS</p>
                </div>
                <input type="checkbox" defaultChecked={studentProfile.preferences.notifications.sms} className="rounded text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                  <p className="text-sm text-gray-500">Receive browser push notifications</p>
                </div>
                <input type="checkbox" defaultChecked={studentProfile.preferences.notifications.push} className="rounded text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Session Reminders</label>
                  <p className="text-sm text-gray-500">Get reminded about upcoming sessions</p>
                </div>
                <input type="checkbox" defaultChecked={studentProfile.preferences.notifications.sessionReminders} className="rounded text-blue-600" />
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Study Time</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="mornings">Mornings</option>
                  <option value="afternoons">Afternoons</option>
                  <option value="evenings" selected>Evenings</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Study Duration</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="1-2">1-2 hours</option>
                  <option value="2-3" selected>2-3 hours</option>
                  <option value="3-4">3-4 hours</option>
                  <option value="4+">4+ hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Export Data</p>
                    <p className="text-sm text-gray-500">Download your learning data</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-red-500">Permanently delete your account</p>
                  </div>
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

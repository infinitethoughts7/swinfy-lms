'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

interface Learner {
  id: string;
  full_name: string;
  email: string;
  profile_picture?: string;
  enrollment_date: string;
  progress_percentage: number;
  phone?: string;
  city?: string;
}

interface AttendanceRecord {
  id: string;
  learner: Learner;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  session_date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  marked_at: string;
  marked_by: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  enrolled_learners: Learner[];
}

// Mock data for Telugu students
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Full Stack Web Development with React & Node.js',
    slug: 'full-stack-web-development',
    enrolled_learners: [
      {
        id: '1',
        full_name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+91 98765 43210',
        city: 'Hyderabad',
        enrollment_date: '2024-01-15',
        progress_percentage: 75
      },
      {
        id: '2',
        full_name: 'Sumitra',
        email: 'sumitra@email.com',
        phone: '+91 87654 32109',
        city: 'Vijayawada',
        enrollment_date: '2024-01-20',
        progress_percentage: 60
      },
      {
        id: '3',
        full_name: 'Venkatesh Reddy',
        email: 'venkatesh.reddy@email.com',
        phone: '+91 76543 21098',
        city: 'Guntur',
        enrollment_date: '2024-02-01',
        progress_percentage: 45
      },
      {
        id: '4',
        full_name: 'Priyanka',
        email: 'priyanka@email.com',
        phone: '+91 65432 10987',
        city: 'Tirupati',
        enrollment_date: '2024-02-10',
        progress_percentage: 80
      },
      {
        id: '5',
        full_name: 'Suresh Babu',
        email: 'suresh.babu@email.com',
        phone: '+91 54321 09876',
        city: 'Visakhapatnam',
        enrollment_date: '2024-02-15',
        progress_percentage: 30
      },
      {
        id: '6',
        full_name: 'Lakshmi Devi',
        email: 'lakshmi.devi@email.com',
        phone: '+91 43210 98765',
        city: 'Nellore',
        enrollment_date: '2024-02-20',
        progress_percentage: 90
      },
      {
        id: '7',
        full_name: 'Mahesh Kumar',
        email: 'mahesh.kumar@email.com',
        phone: '+91 32109 87654',
        city: 'Kadapa',
        enrollment_date: '2024-03-01',
        progress_percentage: 55
      },
      {
        id: '8',
        full_name: 'Swathi',
        email: 'swathi@email.com',
        phone: '+91 21098 76543',
        city: 'Anantapur',
        enrollment_date: '2024-03-05',
        progress_percentage: 70
      }
    ]
  },
  {
    id: '2',
    title: 'Python Programming & Data Science',
    slug: 'python-data-science',
    enrolled_learners: [
      {
        id: '9',
        full_name: 'Ravi Teja',
        email: 'ravi.teja@email.com',
        phone: '+91 10987 65432',
        city: 'Kurnool',
        enrollment_date: '2024-01-25',
        progress_percentage: 65
      },
      {
        id: '10',
        full_name: 'Anusha',
        email: 'anusha@email.com',
        phone: '+91 09876 54321',
        city: 'Chittoor',
        enrollment_date: '2024-02-05',
        progress_percentage: 40
      }
    ]
  }
];

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize with mock data
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setCourses(mockCourses);
      if (mockCourses.length > 0) {
        setSelectedCourse(mockCourses[0].id);
      }
      setIsLoading(false);
    }, 500);
  }, [user, router]);

  // Generate mock attendance records when course or date changes
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        const mockRecords: AttendanceRecord[] = course.enrolled_learners.map(learner => ({
          id: `attendance_${learner.id}_${selectedDate}`,
          learner,
          course: {
            id: course.id,
            title: course.title,
            slug: course.slug
          },
          session_date: selectedDate,
          status: Math.random() > 0.2 ? 'present' : Math.random() > 0.5 ? 'late' : 'absent',
          notes: '',
          marked_at: new Date().toISOString(),
          marked_by: user?.full_name || 'Instructor'
        }));
        setAttendanceRecords(mockRecords);
      }
    }
  }, [selectedCourse, selectedDate, courses, user]);

  const handleAttendanceChange = (learnerId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.learner.id === learnerId 
          ? { ...record, status }
          : record
      )
    );
  };

  const handleNotesChange = (learnerId: string, notes: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.learner.id === learnerId 
          ? { ...record, notes }
          : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setMessage(null);

    // Simulate API call
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Attendance saved successfully' });
      setIsSaving(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✓';
      case 'late': return '⏰';
      case 'absent': return '✗';
      default: return '?';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading attendance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-2">Track and manage student attendance for your courses</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a course...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.enrolled_learners.length} students)
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        {selectedCourse && attendanceRecords.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Attendance Records - {new Date(selectedDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <p className="text-gray-600 mt-1">
                {attendanceRecords.length} students enrolled
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {record.learner.full_name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.learner.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.learner.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.learner.phone}</div>
                        <div className="text-sm text-gray-500">{record.learner.city}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${record.learner.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {record.learner.progress_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {['present', 'late', 'absent'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleAttendanceChange(record.learner.id, status as any)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                record.status === status
                                  ? getStatusColor(status)
                                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={record.notes || ''}
                          onChange={(e) => handleNotesChange(record.learner.id, e.target.value)}
                          placeholder="Add notes..."
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    {attendanceRecords.filter(r => r.status === 'present').length} Present
                  </span>
                  <span className="mx-2">•</span>
                  <span className="font-medium">
                    {attendanceRecords.filter(r => r.status === 'late').length} Late
                  </span>
                  <span className="mx-2">•</span>
                  <span className="font-medium">
                    {attendanceRecords.filter(r => r.status === 'absent').length} Absent
                  </span>
                </div>
                <button
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Attendance</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {selectedCourse && attendanceRecords.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
            <p className="text-gray-600">This course doesn't have any enrolled students yet.</p>
          </div>
        )}

        {/* No Course Selected */}
        {!selectedCourse && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
            <p className="text-gray-600">Choose a course from the dropdown above to view attendance records.</p>
          </div>
        )}

        {/* Prototype Notice */}
        {/* <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-400 text-xl mr-3">⚠️</div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Prototype Mode</h4>
              <p className="text-sm text-yellow-700 mt-1">
                This is a prototype version with mock data. All student information and attendance records are simulated for demonstration purposes.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
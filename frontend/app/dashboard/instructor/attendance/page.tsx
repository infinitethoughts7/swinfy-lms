'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { api } from '@/lib/api';

interface Learner {
  id: string;
  full_name: string;
  email: string;
  profile_picture?: string;
  enrollment_date: string;
  progress_percentage: number;
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

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'knowledge_partner_instructor') {
      router.push('/');
      return;
    }
    fetchCourses();
  }, [user, router]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/courses/instructor-courses/');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
        if (data.data.length > 0) {
          setSelectedCourse(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage({ type: 'error', text: 'Failed to fetch courses' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await api.get(`/courses/attendance/?course=${selectedCourse}&date=${selectedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      const data = await response.json();
      if (data.success) {
        setAttendanceRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setMessage({ type: 'error', text: 'Failed to fetch attendance records' });
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchAttendanceRecords();
    }
  }, [selectedCourse, selectedDate]);

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

  const saveAttendance = async () => {
    if (!selectedCourse) return;
    
    try {
      setIsSaving(true);
      const attendanceData = attendanceRecords.map(record => ({
        learner_id: record.learner.id,
        course_id: selectedCourse,
        session_date: selectedDate,
        status: record.status,
        notes: record.notes || ''
      }));

      const response = await api.post('/courses/attendance/mark/', {
        course_id: selectedCourse,
        session_date: selectedDate,
        attendance_records: attendanceData
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to save attendance' });
        return;
      }

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Attendance saved successfully!' });
        fetchAttendanceRecords(); // Refresh the data
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save attendance' });
      }
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save attendance' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'absent':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'late':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="mt-2 text-gray-600">Mark and manage learner attendance for your courses</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={saveAttendance}
                disabled={isSaving || !selectedCourse}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        {selectedCourse && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Attendance for {courses.find(c => c.id === selectedCourse)?.title}
              </h2>
              <p className="text-sm text-gray-600">
                Session Date: {new Date(selectedDate).toLocaleDateString()}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Learner
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
                  {courses.find(c => c.id === selectedCourse)?.enrolled_learners.map((learner) => {
                    const record = attendanceRecords.find(r => r.learner.id === learner.id);
                    const status = record?.status || 'present';
                    
                    return (
                      <tr key={learner.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {learner.profile_picture ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={learner.profile_picture}
                                  alt={learner.full_name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {learner.full_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {learner.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {learner.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${learner.progress_percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {learner.progress_percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {['present', 'late', 'absent'].map((statusOption) => (
                              <button
                                key={statusOption}
                                onClick={() => handleAttendanceChange(learner.id, statusOption as any)}
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 transition-colors ${
                                  status === statusOption
                                    ? getStatusColor(statusOption)
                                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {getStatusIcon(statusOption)}
                                <span className="capitalize">{statusOption}</span>
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            placeholder="Add notes..."
                            value={record?.notes || ''}
                            onChange={(e) => handleNotesChange(learner.id, e.target.value)}
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedCourse && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No course selected</h3>
            <p className="mt-1 text-sm text-gray-500">Select a course to manage attendance</p>
          </div>
        )}
      </div>
    </div>
  );
}

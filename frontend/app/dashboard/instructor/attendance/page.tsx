'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/token';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return 'V';
      case 'late': return 'L';
      case 'absent': return 'X';
      default: return '?';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <Skeleton className="h-10 w-96 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Session Attendance Management</h1>
          <p className="text-gray-600 mt-2">Track and manage student attendance for your courses</p>
        </div>

        {/* Message */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success'
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
            }`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Selection */}
              <div>
                <Label className="mb-2 block">Select Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} ({course.enrolled_learners.length} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div>
                <Label className="mb-2 block">Session Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        {selectedCourse && attendanceRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Attendance Records - {new Date(selectedDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {attendanceRecords.length} students enrolled
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                                {record.learner.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {record.learner.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.learner.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{record.learner.phone}</div>
                          <div className="text-sm text-gray-500">{record.learner.city}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress value={record.learner.progress_percentage} className="w-16 h-2 mr-2" />
                            <span className="text-sm text-gray-600">
                              {record.learner.progress_percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {(['present', 'late', 'absent'] as const).map((status) => (
                              <Button
                                key={status}
                                variant="outline"
                                size="sm"
                                onClick={() => handleAttendanceChange(record.learner.id, status)}
                                className={record.status === status
                                  ? getStatusBadgeClass(status)
                                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                }
                              >
                                {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={record.notes || ''}
                            onChange={(e) => handleNotesChange(record.learner.id, e.target.value)}
                            placeholder="Add notes..."
                            className="w-full"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Save Button */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-4 -mx-6 -mb-6 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">
                      {attendanceRecords.filter(r => r.status === 'present').length} Present
                    </span>
                    <span className="mx-2">|</span>
                    <span className="font-medium">
                      {attendanceRecords.filter(r => r.status === 'late').length} Late
                    </span>
                    <span className="mx-2">|</span>
                    <span className="font-medium">
                      {attendanceRecords.filter(r => r.status === 'absent').length} Absent
                    </span>
                  </div>
                  <Button
                    onClick={handleSaveAttendance}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Attendance'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {selectedCourse && attendanceRecords.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">*</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
              <p className="text-gray-600">This course does not have any enrolled students yet.</p>
            </CardContent>
          </Card>
        )}

        {/* No Course Selected */}
        {!selectedCourse && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">*</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
              <p className="text-gray-600">Choose a course from the dropdown above to view attendance records.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

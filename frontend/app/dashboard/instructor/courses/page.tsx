"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { instructorApi, type Course } from '@/lib/api';
import { BookOpen, Plus, Eye, Edit, Trash2, Search, Video, Users, Clock } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorApi.courses.list();
      setCourses(Array.isArray(data) ? data : (data as { results?: Course[] })?.results || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseSlug: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await instructorApi.courses.delete(courseSlug);
      setCourses(prev => prev.filter(course => course.slug !== courseSlug));
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course. Please try again.');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || course.approval_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Manage your course content and track performance</p>
        </div>
        <Link
          href="/dashboard/instructor/courses/create"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Course
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {courses.filter(c => c.approval_status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {courses.filter(c => c.approval_status === 'pending_approval').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {courses.filter(c => c.approval_status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {courses.length === 0 ? 'No courses yet' : 'No courses match your search'}
          </h3>
          <p className="text-gray-600 mb-6">
            {courses.length === 0 
              ? 'Create your first course to start teaching students'
              : 'Try adjusting your search terms or filters'
            }
          </p>
          {courses.length === 0 && (
            <Link
              href="/dashboard/instructor/courses/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
              {/* Course Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                {(course.thumbnail_url || course.thumbnail) ? (
                  <img 
                    src={course.thumbnail_url || course.thumbnail || ''} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                    course.approval_status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                    course.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.approval_status_display || course.approval_status || 'Draft'}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{course.short_description || course.description || 'No description available'}</p>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Video className="h-4 w-4 mr-1" />
                    <span>{course.lessons_count || 0} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.enrollment_count || 0} students</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.total_duration_minutes ? Math.round(course.total_duration_minutes / 60) : 0}h total</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-600">₹{course.price || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/instructor/courses/${course.slug}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="View Course"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/instructor/courses/${course.slug}/edit`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="Edit Course"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteCourse(course.slug)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
              
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

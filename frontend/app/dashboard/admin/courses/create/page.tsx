'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, CheckCircle, Clock, Users } from 'lucide-react';
import CourseCreationWorkflow from '@/components/course-management/CourseCreationWorkflow';

export default function CreateCoursePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createdCourse, setCreatedCourse] = useState(null);

  const handleCourseCreated = (course: any) => {
    setIsCreating(true);
    setCreatedCourse(course);
    
    // Simulate course creation API call
    setTimeout(() => {
      setIsCreating(false);
      // Redirect to courses list or show success message
      router.push('/dashboard/admin/courses');
    }, 2000);
  };

  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Creating Course...</h3>
          <p className="text-gray-600">Please wait while we set up your course</p>
        </div>
      </div>
    );
  }

  if (createdCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course Created Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Your course "{createdCourse.title}" has been created and published.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/admin/courses')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Courses
            </button>
            <button
              onClick={() => {
                setCreatedCourse(null);
                router.push('/dashboard/admin/courses/create');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Create Another Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-gray-600 mt-1">
                Follow the step-by-step workflow to create and publish your course
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">New Course</p>
                  <p className="text-lg font-semibold text-gray-900">1</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-lg font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-lg font-semibold text-gray-900">3</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-lg font-semibold text-gray-900">1,247</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Component */}
        <CourseCreationWorkflow onCourseCreated={handleCourseCreated} />
      </div>
    </div>
  );
}

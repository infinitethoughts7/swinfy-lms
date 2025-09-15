"use client";

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Mail, Calendar, Globe, Clock, CheckCircle, XCircle, Edit } from 'lucide-react';
import { userApi, InstructorDetail } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function InstructorDetailPage() {
  const params = useParams();
  const instructorId = params.id as string;
  
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructorDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.instructors.get(instructorId);
      setInstructor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instructor details');
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    fetchInstructorDetails();
  }, [fetchInstructorDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/kp/instructors"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Details</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/kp/instructors"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/kp/instructors"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instructor Details</h1>
            <p className="text-gray-600">View and manage instructor information</p>
          </div>
        </div>
        
        <Link
          href={`/dashboard/kp/instructors/${instructorId}/edit`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Instructor
        </Link>
      </div>

      {/* Instructor Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  instructor.user.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {instructor.user.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  instructor.user.is_approved 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {instructor.user.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <p className="text-lg font-semibold text-gray-900">{instructor.user.full_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{instructor.user.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <p className="text-gray-900">{instructor.phone_number || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <p className="text-gray-900">{instructor.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{instructor.years_of_experience} years</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                <p className="text-gray-900 capitalize">{instructor.highest_education.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Professional Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <p className="text-gray-900 leading-relaxed">{instructor.bio}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {instructor.specializations.split(',').map((spec, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                <div className="flex flex-wrap gap-2">
                  {instructor.technologies.split(',').map((tech, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              {instructor.certifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                  <p className="text-gray-900">{instructor.certifications}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
                <p className="text-gray-900">{instructor.languages_spoken}</p>
              </div>
              
              {instructor.linkedin_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                  <a 
                    href={instructor.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    View LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Availability Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  instructor.is_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {instructor.is_available ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Busy
                    </>
                  )}
                </span>
              </div>
              
              {instructor.availability_notes && (
                <div>
                  <span className="text-sm text-gray-600">Notes</span>
                  <p className="text-sm text-gray-900 mt-1">{instructor.availability_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User ID</span>
                <span className="text-sm text-gray-900 font-mono">{instructor.user.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profile Created</span>
                <span className="text-sm text-gray-900">
                  {new Date(instructor.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className={`text-sm font-medium ${
                  instructor.user.is_active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {instructor.user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approval Status</span>
                <span className={`text-sm font-medium ${
                  instructor.user.is_approved ? 'text-blue-600' : 'text-yellow-600'
                }`}>
                  {instructor.user.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

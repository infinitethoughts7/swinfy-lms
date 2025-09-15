"use client";

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Mail, Calendar, Globe, CheckCircle, Clock, Edit, User } from 'lucide-react';
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

  if (error || !instructor) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/kp/instructors"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Details</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-700 ml-2">{error || 'Instructor not found'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/kp/instructors"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{instructor.user.full_name}</h1>
            <p className="text-gray-600 mt-1">{instructor.title}</p>
          </div>
        </div>
        
        <Link
          href={`/dashboard/kp/instructors/${instructorId}/edit`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Link>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Account Status</p>
              <p className={`font-semibold ${instructor.user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {instructor.user.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${instructor.user.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
              <CheckCircle className={`h-6 w-6 ${instructor.user.is_active ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Availability</p>
              <p className={`font-semibold ${instructor.is_available ? 'text-green-600' : 'text-orange-600'}`}>
                {instructor.is_available ? 'Available' : 'Busy'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${instructor.is_available ? 'bg-green-100' : 'bg-orange-100'}`}>
              {instructor.is_available ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Clock className="h-6 w-6 text-orange-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Experience</p>
              <p className="font-semibold text-gray-900">{instructor.years_of_experience} years</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{instructor.user.email}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{instructor.phone_number || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Profile</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">About</label>
                <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-xl">{instructor.bio}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Education</label>
                  <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-xl font-medium capitalize">
                    {instructor.highest_education.replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Languages</label>
                  <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-xl font-medium">
                    {instructor.languages_spoken}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {instructor.specializations.split(',').map((spec, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-medium"
                    >
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Technologies</label>
                <div className="flex flex-wrap gap-2">
                  {instructor.technologies.split(',').map((tech, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-xl font-medium"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              {instructor.certifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Certifications</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-xl">{instructor.certifications}</p>
                </div>
              )}
              
              {instructor.linkedin_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">LinkedIn</label>
                  <a 
                    href={instructor.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Availability */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  instructor.is_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {instructor.is_available ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">User ID</span>
                <span className="text-gray-900 font-mono text-xs">{instructor.user.id.slice(0, 8)}...</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">
                  {new Date(instructor.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Approved</span>
                <span className={`font-medium ${
                  instructor.user.is_approved ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {instructor.user.is_approved ? 'Yes' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
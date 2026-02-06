"use client";

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Mail, Calendar, Globe, CheckCircle, Clock, Edit, User, AlertCircle } from 'lucide-react';
import { userApi } from '@/features/users/services/user';
import type { InstructorDetail } from '@/shared/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link href="/dashboard/kp/instructors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Details</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Instructor not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link href="/dashboard/kp/instructors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{instructor.user.full_name}</h1>
            <p className="text-gray-600 mt-1">{instructor.title}</p>
          </div>
        </div>

        <Button asChild>
          <Link href={`/dashboard/kp/instructors/${instructorId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Experience</p>
                <p className="font-semibold text-gray-900">{instructor.years_of_experience} years</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">About</label>
                <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-xl">{instructor.bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Education</label>
                  <Badge className="bg-purple-100 text-purple-800 text-sm px-4 py-2">
                    {instructor.highest_education.replace('_', ' ')}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Languages</label>
                  <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
                    {instructor.languages_spoken}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {instructor.specializations.split(',').map((spec, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-100 text-blue-800 px-4 py-2"
                    >
                      {spec.trim()}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Technologies</label>
                <div className="flex flex-wrap gap-2">
                  {instructor.technologies.split(',').map((tech, index) => (
                    <Badge
                      key={index}
                      className="bg-green-100 text-green-800 px-4 py-2"
                    >
                      {tech.trim()}
                    </Badge>
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
                  <Button asChild>
                    <a
                      href={instructor.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      View Profile
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <Badge className={
                  instructor.is_available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }>
                  {instructor.is_available ? 'Available' : 'Busy'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Star, Users, BookOpen, Award, Linkedin, Github, Globe } from 'lucide-react';

interface InstructorProfile {
  bio: string;
  title: string;
  years_of_experience: number;
  highest_education: string;
  specializations: string;
  technologies: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

interface Tutor {
  id: string;
  full_name: string;
  email: string;
  instructor_profile?: InstructorProfile;
}

interface TrainingPartner {
  id: string;
  name: string;
  type: string;
  location: string;
  website?: string;
}

interface InstructorTabProps {
  tutor: Tutor;
  trainingPartner: TrainingPartner;
  courseRating: string;
  totalStudents: number;
  totalCourses?: number;
}

// Mock courses for demonstration
const mockCourses = [
  {
    id: '1',
    title: 'Advanced JavaScript Masterclass',
    thumbnail: null,
    price: '4999',
    rating: '4.7',
    students: 1250,
    duration: '8 weeks',
    level: 'Advanced'
  },
  {
    id: '2',
    title: 'React & Next.js Complete Guide',
    thumbnail: null,
    price: '3999',
    rating: '4.8',
    students: 2100,
    duration: '10 weeks',
    level: 'Intermediate'
  }
];

export default function InstructorTab({
  tutor,
  trainingPartner,
  courseRating,
  totalStudents,
  totalCourses = 2
}: InstructorTabProps) {
  const profile = tutor.instructor_profile;

  return (
    <div className="space-y-8">
      {/* Instructor Profile Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-5xl font-bold text-white">
                {tutor.full_name.charAt(0)}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {tutor.full_name}
            </h2>
            {profile?.title && (
              <p className="text-lg text-gray-700 font-medium mb-3">
                {profile.title}
              </p>
            )}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium text-blue-600">
                {trainingPartner.name}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">
                {trainingPartner.type}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">
                {trainingPartner.location}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-xs font-medium">Rating</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{courseRating}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Students</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{totalStudents.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-medium">Courses</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{totalCourses}</p>
              </div>
              {profile?.years_of_experience && (
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-medium">Experience</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{profile.years_of_experience}+ yrs</p>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(profile?.linkedin_url || profile?.github_url || profile?.portfolio_url) && (
              <div className="flex space-x-3">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-lg hover:bg-blue-100 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-lg hover:bg-gray-200 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5 text-gray-700" />
                  </a>
                )}
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-lg hover:bg-purple-100 transition-colors"
                    aria-label="Portfolio"
                  >
                    <Globe className="w-5 h-5 text-purple-600" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About Instructor */}
      {profile?.bio && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">About the Instructor</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Education & Expertise */}
      {(profile?.highest_education || profile?.specializations || profile?.technologies) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education */}
          {profile.highest_education && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                Education
              </h4>
              <p className="text-gray-700 capitalize">
                {profile.highest_education.replace('_', ' ')}
              </p>
            </div>
          )}

          {/* Experience */}
          {profile.years_of_experience && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                Teaching Experience
              </h4>
              <p className="text-gray-700">
                {profile.years_of_experience}+ years of professional experience
              </p>
            </div>
          )}
        </div>
      )}

      {/* Specializations */}
      {profile?.specializations && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {profile.specializations.split(',').map((spec, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
              >
                {spec.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Technologies */}
      {profile?.technologies && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Technologies & Tools</h3>
          <div className="flex flex-wrap gap-2">
            {profile.technologies.split(',').map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* More Courses from Instructor */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          More Courses by {tutor.full_name}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
            >
              {/* Course Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                <BookOpen className="w-16 h-16 text-white/30" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Course Info */}
              <div className="p-5">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                    {course.level}
                  </span>
                  <span className="text-xs text-gray-500">{course.duration}</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{course.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    ₹{parseFloat(course.price).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
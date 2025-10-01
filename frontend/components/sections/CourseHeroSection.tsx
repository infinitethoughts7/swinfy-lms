import Link from 'next/link';
import { Tag, BarChart3, Clock, Star, Users, Eye, Award } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  duration_weeks: number;
  category: string;
  category_display: string;
  level: string;
  level_display: string;
  rating: string;
  total_reviews: number;
  enrollment_count: number;
  view_count: number;
  thumbnail: string | null;
  banner_image: string | null;
  demo_video?: string | null;
  training_partner: {
    id: string;
    name: string;
    type: string;
    location: string;
  };
  tutor: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function CourseHeroSection({ course }: { course: Course }) {
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(59, 130, 246) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-4">
          <Link 
            href="/courses" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            All Courses
          </Link>
          <span className="text-gray-400">/</span>
          <Link 
            href={`/courses?category=${course.category}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {course.category_display}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 truncate max-w-xs">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Info */}
          <div className="lg:col-span-2">
            {/* Category Badge - Above title */}
            <div className="mb-3">
              <span className="inline-flex items-center px-3 py-1.5 bg-white rounded-full border border-gray-200 text-sm font-semibold text-gray-900">
                <Tag className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
                {course.category_display}
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              {course.title}
            </h1>

            {/* Short Description */}
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              {course.short_description}
            </p>

            {/* ALL Stats in ONE line - Icon + Value only */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Rating */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-900">{course.rating}</span>
              </div>

              {/* Students */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">{course.enrollment_count.toLocaleString()} students</span>
              </div>

              {/* Duration */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">{course.duration_weeks} weeks</span>
              </div>

              {/* Level */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200">
                <Award className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">{course.level_display}</span>
              </div>
            </div>

            {/* Instructor Info - Compact rounded box */}
            <div className="inline-flex items-center space-x-3 px-4 py-3 bg-white rounded-full border border-gray-200 shadow-sm">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-gray-700">
                  {course.tutor.full_name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created by</p>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {course.tutor.full_name}, {course.training_partner.name}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Placeholder */}
          <div className="lg:col-span-1">
            {/* Space for sidebar */}
          </div>
        </div>
      </div>
    </div>
  );
}
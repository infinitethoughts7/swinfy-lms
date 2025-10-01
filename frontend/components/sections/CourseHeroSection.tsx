import Link from 'next/link';
import { Tag, Clock, Star, Users, Award } from 'lucide-react';

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
    <div className="relative">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-6">
        <Link 
          href="/courses" 
          className="text-white/70 hover:text-white transition-colors"
        >
          All Courses
        </Link>
        <span className="text-white/40">/</span>
        <Link 
          href={`/courses?category=${course.category}`}
          className="text-white/70 hover:text-white transition-colors"
        >
          {course.category_display}
        </Link>
        <span className="text-white/40">/</span>
        <span className="text-white/50 truncate max-w-xs">{course.title}</span>
      </nav>

      {/* Course Info */}
      <div>
            {/* Category Badge - Glass Effect */}
            <div className="mb-3">
              <span className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-semibold text-white">
                <Tag className="w-3.5 h-3.5 mr-1.5 text-white/80" />
                {course.category_display}
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              {course.title}
            </h1>

            {/* Short Description */}
            <p className="text-base text-white/80 mb-6 leading-relaxed">
              {course.short_description}
            </p>

            {/* ALL Stats in ONE line - Glass Effect Cards */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Rating */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-white">{course.rating}</span>
              </div>

              {/* Students */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Users className="w-4 h-4 text-white/70" />
                <span className="text-sm font-semibold text-white">{course.enrollment_count.toLocaleString()} learners</span>
              </div>

              {/* Duration */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-sm font-semibold text-white">{course.duration_weeks} weeks</span>
              </div>

              {/* Level */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Award className="w-4 h-4 text-white/70" />
                <span className="text-sm font-semibold text-white">{course.level_display}</span>
              </div>
            </div>

        {/* Instructor Info - Glass Effect */}
        <div className="inline-flex items-center space-x-3 px-4 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-white">
              {course.tutor.full_name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-xs text-white/60">Created by</p>
            <p className="text-sm font-semibold text-white whitespace-nowrap">
              {course.tutor.full_name}, {course.training_partner.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
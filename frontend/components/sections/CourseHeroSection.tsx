import Link from 'next/link';
import { 
  Database, 
  BarChart3, 
  TrendingUp, 
  Code,
  FileSpreadsheet,
  Brain,
  LucideIcon
} from 'lucide-react';

interface Course {
  category: string;
  title: string;
  rating: number;
  students: number;
  duration: string;
  instructor: string;
  price: string;
  highlights: string[];
}

interface FloatingIconProps {
  Icon: LucideIcon;
  className: string;
  delay?: number;
}

// Function to get course-specific icons based on category
const getCourseIcons = (category: string): LucideIcon[] => {
  switch (category.toLowerCase()) {
    case 'backend development':
      return [Database, Code, BarChart3, TrendingUp];
    case 'data analyst':
      return [BarChart3, FileSpreadsheet, TrendingUp, Database];
    case 'frontend development':
      return [Code, Brain, BarChart3];
    default:
      return [Database, BarChart3, Code, TrendingUp];
  }
};

const FloatingIcon = ({ Icon, className, delay = 0 }: FloatingIconProps) => (
  <div 
    className={`absolute text-white/8 animate-float drop-shadow-lg ${className}`}
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: `${25 + Math.random() * 15}s`,
      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
    }}
  >
    <Icon size={48} strokeWidth={1} />
  </div>
);

export default function CourseHeroSection({ course }: { course: Course }) {
  const courseIcons = getCourseIcons(course.category);
  
  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(40px, -40px) rotate(15deg);
          }
          66% {
            transform: translate(-30px, 30px) rotate(-10deg);
          }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
      
      {/* Course Hero */}
      <div className="relative overflow-hidden bg-gray-900">
        {/* Floating Background Icons - Course Specific (Right Side Only) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top right area icons */}
          <FloatingIcon Icon={courseIcons[0]} className="top-[12%] right-[8%]" delay={0} />
          <FloatingIcon Icon={courseIcons[1]} className="top-[25%] right-[15%]" delay={4} />
          
          {/* Middle right area icons */}
          <FloatingIcon Icon={courseIcons[2]} className="top-[45%] right-[5%]" delay={2} />
          
          {/* Bottom right area icons */}
          <FloatingIcon Icon={courseIcons[3] || courseIcons[0]} className="bottom-[15%] right-[12%]" delay={6} />
          
          {/* Additional icon for courses with more specific icons */}
          {courseIcons.length > 4 && (
            <FloatingIcon Icon={courseIcons[4]} className="bottom-[30%] right-[20%]" delay={8} />
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Link 
                href="/courses" 
                className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-6"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Courses
              </Link>
              
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-inter rounded-full border border-white/30">
                  {course.category}
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-sora font-black text-white mb-6 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 font-inter max-w-4xl mb-6 leading-relaxed">
                Master technical skills, ace interviews, and land your dream job with our proven curriculum
              </p>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 mb-8 border border-white/30 inline-block">
                <p className="text-white font-inter font-semibold text-lg">
                  2,847 students got hired in the last 6 months
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-8 text-blue-200 mb-8">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-inter font-semibold">{course.rating} ({course.students.toLocaleString()} students)</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-inter font-semibold">{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-inter font-semibold">{course.instructor}</span>
                </div>
              </div>
              
              <button className="bg-white text-blue-600 hover:bg-blue-50 font-sora font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm">
                Enroll Now - {course.price}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

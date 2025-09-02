import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// This would typically come from a database or API
const courseDetails = {
  'advanced-excel': {
    title: 'Advanced Excel',
    description: 'Master advanced Excel functions, pivot tables, and data analysis techniques used by professionals worldwide.',
    longDescription: 'This comprehensive course covers everything from basic Excel functions to advanced data analysis techniques. You\'ll learn pivot tables, VLOOKUP, INDEX/MATCH, data visualization, and automation with macros. Perfect for professionals looking to enhance their data analysis skills.',
    image: '/assets/images/courses/4by3/01.jpg',
    duration: '8 weeks',
    level: 'Intermediate',
    price: '$99',
    category: 'Technical Skills',
    instructor: 'Dr. Sarah Johnson',
    rating: 4.8,
    students: 1250,
    lessons: 24,
    language: 'English',
    features: [
      '24 Video Lessons',
      'Hands-on Projects',
      'Certificate of Completion',
      'Lifetime Access',
      'Mobile & Desktop Access',
      'Community Support'
    ],
    curriculum: [
      { week: 1, title: 'Excel Fundamentals Review', lessons: 3 },
      { week: 2, title: 'Advanced Functions & Formulas', lessons: 4 },
      { week: 3, title: 'Pivot Tables & Data Analysis', lessons: 3 },
      { week: 4, title: 'Data Visualization & Charts', lessons: 3 },
      { week: 5, title: 'VLOOKUP & INDEX/MATCH', lessons: 3 },
      { week: 6, title: 'Conditional Formatting', lessons: 2 },
      { week: 7, title: 'Macros & Automation', lessons: 3 },
      { week: 8, title: 'Final Project & Assessment', lessons: 3 }
    ]
  },
  'python': {
    title: 'Python Programming',
    description: 'Learn Python programming for data science and automation from scratch.',
    longDescription: 'Start your journey into Python programming with this comprehensive course. Covering everything from basic syntax to advanced concepts like object-oriented programming, data structures, and working with APIs. Perfect for beginners and those looking to transition into data science.',
    image: '/assets/images/courses/4by3/python.jpg',
    duration: '16 weeks',
    level: 'Beginner',
    price: '$249',
    category: 'Technical Skills',
    instructor: 'Prof. Michael Chen',
    rating: 4.9,
    students: 2100,
    lessons: 48,
    language: 'English',
    features: [
      '48 Video Lessons',
      'Coding Exercises',
      'Real-world Projects',
      'Certificate of Completion',
      'Lifetime Access',
      'Code Review Sessions'
    ],
    curriculum: [
      { week: 1, title: 'Python Basics & Setup', lessons: 6 },
      { week: 2, title: 'Variables & Data Types', lessons: 6 },
      { week: 3, title: 'Control Structures', lessons: 6 },
      { week: 4, title: 'Functions & Modules', lessons: 6 },
      { week: 5, title: 'Data Structures', lessons: 6 },
      { week: 6, title: 'Object-Oriented Programming', lessons: 6 },
      { week: 7, title: 'File Handling & APIs', lessons: 6 },
      { week: 8, title: 'Final Project', lessons: 6 }
    ]
  },
  'communication-skills': {
    title: 'Communication Skills',
    description: 'Enhance your verbal and written communication abilities for personal and professional success.',
    longDescription: 'Master the art of effective communication in both personal and professional settings. Learn presentation skills, business writing, active listening, and conflict resolution. This course will boost your confidence and help you build stronger relationships.',
    image: '/assets/images/courses/4by3/18.jpg',
    duration: '6 weeks',
    level: 'Beginner',
    price: '$89',
    category: 'Life Skills',
    instructor: 'Dr. Emily Rodriguez',
    rating: 4.7,
    students: 890,
    lessons: 18,
    language: 'English',
    features: [
      '18 Video Lessons',
      'Practice Exercises',
      'Peer Feedback Sessions',
      'Certificate of Completion',
      'Lifetime Access',
      'Communication Templates'
    ],
    curriculum: [
      { week: 1, title: 'Communication Fundamentals', lessons: 3 },
      { week: 2, title: 'Verbal Communication', lessons: 3 },
      { week: 3, title: 'Written Communication', lessons: 3 },
      { week: 4, title: 'Presentation Skills', lessons: 3 },
      { week: 5, title: 'Active Listening', lessons: 3 },
      { week: 6, title: 'Conflict Resolution', lessons: 3 }
    ]
  }
};

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = courseDetails[id as keyof typeof courseDetails];
  
  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Course Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <Link 
                href="/courses" 
                className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-4"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Courses
              </Link>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-200 text-sm font-inter rounded-full">
                  {course.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-sora font-black text-white mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-blue-100 font-inter max-w-3xl mb-6">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-blue-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {course.rating} ({course.students} students)
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {course.instructor}
                </div>
              </div>
            </div>
            <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Course Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-sora font-bold text-text-primary mb-4">
                About This Course
              </h2>
              <p className="text-text-secondary font-inter leading-relaxed">
                {course.longDescription}
              </p>
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-sora font-bold text-text-primary mb-6">
                Course Curriculum
              </h2>
              <div className="space-y-4">
                {course.curriculum.map((week, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-sora font-semibold text-text-primary">
                          Week {week.week}: {week.title}
                        </h3>
                        <p className="text-text-secondary font-inter text-sm">
                          {week.lessons} lessons
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-sora font-bold text-blue-600 mb-2">
                  {course.price}
                </div>
                <div className="text-text-secondary font-inter">
                  One-time payment
                </div>
              </div>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-inter font-semibold py-3 px-6 rounded-lg transition-colors mb-4">
                Enroll Now
              </button>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-text-secondary">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Lifetime access
                </div>
                <div className="flex items-center text-text-secondary">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Certificate of completion
                </div>
                <div className="flex items-center text-text-secondary">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mobile & desktop access
                </div>
                <div className="flex items-center text-text-secondary">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  30-day money-back guarantee
                </div>
              </div>
            </div>

            {/* Course Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-sora font-bold text-text-primary mb-4">
                What's Included
              </h3>
              <div className="space-y-3">
                {course.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-text-secondary">
                    <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-sora font-bold text-text-primary mb-4">
                Course Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Level:</span>
                  <span className="font-inter font-medium text-text-primary">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Duration:</span>
                  <span className="font-inter font-medium text-text-primary">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Lessons:</span>
                  <span className="font-inter font-medium text-text-primary">{course.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Language:</span>
                  <span className="font-inter font-medium text-text-primary">{course.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Students:</span>
                  <span className="font-inter font-medium text-text-primary">{course.students.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

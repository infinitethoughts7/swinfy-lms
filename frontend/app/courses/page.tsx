'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';


// All courses data with proper images from the courses folder
const allCourses = [
  // Top Priority Courses
  {
    id: 'sql',
    title: 'SQL',
    description: 'Master SQL for database management and data querying',
    image: '/assets/courses/sql.png',
    duration: '10 weeks',
    level: 'Intermediate',
    price: '$149',
    category: 'Backend Development',
    rating: 4.9,
    students: 2100
  },
  {
    id: 'python',
    title: 'Python',
    description: 'Learn Python programming for backend development and automation',
    image: '/assets/courses/python.svg',
    duration: '16 weeks',
    level: 'Beginner',
    price: '$249',
    category: 'Backend Development',
    rating: 4.9,
    students: 3200
  },
  {
    id: 'advanced-excel',
    title: 'Advanced Excel',
    description: 'Master advanced Excel functions, pivot tables, and data analysis techniques',
    image: '/assets/courses/excel.svg',
    duration: '8 weeks',
    level: 'Intermediate',
    price: '$99',
    category: 'Data Analyst',
    rating: 4.8,
    students: 1250
  },
  {
    id: 'react',
    title: 'React',
    description: 'Build modern web applications with React framework',
    image: '/assets/courses/react.svg',
    duration: '12 weeks',
    level: 'Intermediate',
    price: '$179',
    category: 'Frontend Development',
    rating: 4.7,
    students: 1900
  },
  {
    id: 'django',
    title: 'Django',
    description: 'Master Django framework for rapid web development',
    image: '/assets/courses/python.svg',
    duration: '14 weeks',
    level: 'Intermediate',
    price: '$199',
    category: 'Backend Development',
    rating: 4.8,
    students: 1800
  },
  {
    id: 'next-js',
    title: 'Next.js',
    description: 'Build full-stack React applications with Next.js framework',
    image: '/assets/courses/react.svg',
    duration: '14 weeks',
    level: 'Intermediate',
    price: '$189',
    category: 'Frontend Development',
    rating: 4.7,
    students: 1600
  },

  // Frontend Development
  {
    id: 'html-css',
    title: 'HTML & CSS',
    description: 'Master the fundamentals of web development with HTML and CSS',
    image: '/assets/courses/excel.svg',
    duration: '6 weeks',
    level: 'Beginner',
    price: '$99',
    category: 'Frontend Development',
    rating: 4.8,
    students: 2500
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Master JavaScript for web development and interactive applications',
    image: '/assets/courses/javascript.svg',
    duration: '14 weeks',
    level: 'Intermediate',
    price: '$199',
    category: 'Frontend Development',
    rating: 4.8,
    students: 2800
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    description: 'Learn TypeScript for scalable JavaScript applications',
    image: '/assets/courses/typescript.svg',
    duration: '8 weeks',
    level: 'Intermediate',
    price: '$149',
    category: 'Frontend Development',
    rating: 4.6,
    students: 1100
  },
  {
    id: 'vue-js',
    title: 'Vue.js',
    description: 'Build reactive user interfaces with Vue.js framework',
    image: '/assets/courses/python.svg',
    duration: '10 weeks',
    level: 'Intermediate',
    price: '$169',
    category: 'Frontend Development',
    rating: 4.5,
    students: 1200
  },
  {
    id: 'angular',
    title: 'Angular',
    description: 'Develop enterprise-grade applications with Angular',
    image: '/assets/courses/tableau.svg',
    duration: '16 weeks',
    level: 'Advanced',
    price: '$229',
    category: 'Frontend Development',
    rating: 4.6,
    students: 1400
  },

  // Backend Development
  {
    id: 'node-js',
    title: 'Node.js',
    description: 'Build scalable server-side applications with Node.js',
    image: '/assets/courses/javascript.svg',
    duration: '12 weeks',
    level: 'Intermediate',
    price: '$189',
    category: 'Backend Development',
    rating: 4.7,
    students: 2100
  },
  {
    id: 'express-js',
    title: 'Express.js',
    description: 'Build web applications with Express.js framework',
    image: '/assets/courses/javascript.svg',
    duration: '10 weeks',
    level: 'Intermediate',
    price: '$159',
    category: 'Backend Development',
    rating: 4.6,
    students: 1500
  },
  {
    id: 'mongodb',
    title: 'MongoDB',
    description: 'Learn NoSQL database management with MongoDB',
    image: '/assets/courses/sql.png',
    duration: '8 weeks',
    level: 'Intermediate',
    price: '$139',
    category: 'Backend Development',
    rating: 4.5,
    students: 1300
  },

  // Data Analyst
  {
    id: 'google-sheets',
    title: 'Google Sheets',
    description: 'Learn Google Sheets for collaborative data management and analysis',
    image: '/assets/courses/google-sheets.svg',
    duration: '6 weeks',
    level: 'Beginner',
    price: '$79',
    category: 'Data Analyst',
    rating: 4.6,
    students: 890
  },
  {
    id: 'tableau',
    title: 'Tableau',
    description: 'Create stunning data visualizations and interactive dashboards',
    image: '/assets/courses/tableau.svg',
    duration: '12 weeks',
    level: 'Advanced',
    price: '$199',
    category: 'Data Analyst',
    rating: 4.7,
    students: 1450
  },
  {
    id: 'power-bi',
    title: 'Power BI',
    description: 'Build powerful business intelligence solutions with Microsoft Power BI',
    image: '/assets/courses/power-bi.svg',
    duration: '10 weeks',
    level: 'Intermediate',
    price: '$179',
    category: 'Data Analyst',
    rating: 4.8,
    students: 1200
  },
  {
    id: 'sql-analyst',
    title: 'SQL for Data Analysis',
    description: 'Master SQL specifically for data analysis and reporting',
    image: '/assets/courses/sql.png',
    duration: '8 weeks',
    level: 'Intermediate',
    price: '$149',
    category: 'Data Analyst',
    rating: 4.8,
    students: 1800
  },
  {
    id: 'looker-studio',
    title: 'Looker Studio',
    description: 'Create beautiful reports and dashboards with Google Looker Studio',
    image: '/assets/courses/google-sheets.svg',
    duration: '6 weeks',
    level: 'Beginner',
    price: '$129',
    category: 'Data Analyst',
    rating: 4.6,
    students: 1100
  },

  // Data Science
  {
    id: 'python-ds',
    title: 'Python for Data Science',
    description: 'Learn Python programming specifically for data science applications',
    image: '/assets/courses/python.svg',
    duration: '16 weeks',
    level: 'Beginner',
    price: '$249',
    category: 'Data Science',
    rating: 4.9,
    students: 3200
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    description: 'Master machine learning algorithms and implementation',
    image: '/assets/courses/python.svg',
    duration: '20 weeks',
    level: 'Advanced',
    price: '$299',
    category: 'Data Science',
    rating: 4.8,
    students: 2500
  },
  {
    id: 'statistics',
    title: 'Statistics',
    description: 'Learn statistical concepts and their practical applications',
    image: '/assets/courses/Statistics.png',
    duration: '12 weeks',
    level: 'Intermediate',
    price: '$179',
    category: 'Data Science',
    rating: 4.5,
    students: 950
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    description: 'Explore neural networks and deep learning frameworks',
    image: '/assets/courses/python.svg',
    duration: '18 weeks',
    level: 'Advanced',
    price: '$279',
    category: 'Data Science',
    rating: 4.7,
    students: 1800
  },
  {
    id: 'data-visualization',
    title: 'Data Visualization',
    description: 'Create compelling data visualizations and storytelling',
    image: '/assets/courses/tableau.svg',
    duration: '10 weeks',
    level: 'Intermediate',
    price: '$169',
    category: 'Data Science',
    rating: 4.6,
    students: 1400
  },
  {
    id: 'big-data',
    title: 'Big Data Analytics',
    description: 'Handle and analyze large datasets with modern tools',
    image: '/assets/courses/sql.png',
    duration: '14 weeks',
    level: 'Advanced',
    price: '$229',
    category: 'Data Science',
    rating: 4.5,
    students: 1200
  },
  
  // Interview Preparation
  {
    id: 'interview-prep',
    title: 'Interview Preparation',
    description: 'Comprehensive guide to ace any interview with confidence',
    image: '/assets/courses/sql.png',
    duration: '6 weeks',
    level: 'Beginner',
    price: '$99',
    category: 'Interview Preparation',
    rating: 4.8,
    students: 1500
  },
  {
    id: 'resume-building',
    title: 'Resume Building',
    description: 'Create compelling resumes that get you noticed by employers',
    image: '/assets/courses/Statistics.png',
    duration: '4 weeks',
    level: 'Beginner',
    price: '$79',
    category: 'Interview Preparation',
    rating: 4.7,
    students: 1100
  },
  {
    id: 'job-portals',
    title: 'Job Portals Updation',
    description: 'Optimize your profiles on LinkedIn, Indeed, and other job portals',
    image: '/assets/courses/google-sheets.svg',
    duration: '3 weeks',
    level: 'Beginner',
    price: '$59',
    category: 'Interview Preparation',
    rating: 4.5,
    students: 800
  },
  {
    id: 'career-guidance',
    title: 'Career Guidance',
    description: 'Get personalized career guidance and mentorship',
    image: '/assets/courses/typescript.svg',
    duration: '8 weeks',
    level: 'All Levels',
    price: '$149',
    category: 'Interview Preparation',
    rating: 4.9,
    students: 1800
  },
  {
    id: 'coding-interviews',
    title: 'Coding Interviews',
    description: 'Master technical coding interviews and problem-solving',
    image: '/assets/courses/javascript.svg',
    duration: '10 weeks',
    level: 'Intermediate',
    price: '$179',
    category: 'Interview Preparation',
    rating: 4.7,
    students: 1600
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Learn system design principles for technical interviews',
    image: '/assets/courses/python.svg',
    duration: '12 weeks',
    level: 'Advanced',
    price: '$199',
    category: 'Interview Preparation',
    rating: 4.8,
    students: 1400
  }
];

const categories = ['All', 'Frontend Development', 'Backend Development', 'Data Analyst', 'Data Science', 'Interview Preparation'];

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter courses based on search term and category
  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-700">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-sora font-black text-white mb-6">
              Bridge the Gap Between Learning and Landing Jobs
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-inter max-w-4xl mx-auto mb-8">
              Master technical skills, ace interviews, and land your dream job with our proven curriculum
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-inter font-semibold">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              2,847 students got hired in the last 6 months
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent font-inter text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent font-inter text-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-300 font-inter">
            Showing {filteredCourses.length} of {allCourses.length} courses
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => {
            // Different dark gradient backgrounds for variety
            const gradients = [
              'bg-gradient-to-br from-gray-800 via-blue-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-emerald-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-purple-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-orange-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-violet-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-green-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-sky-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-rose-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-yellow-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-indigo-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-cyan-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-lime-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-red-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-purple-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-teal-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-pink-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-amber-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-blue-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-rose-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-indigo-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-purple-900 to-gray-700',
              'bg-gradient-to-br from-gray-800 via-emerald-900 to-gray-700'
            ];
            
            const gradientClass = gradients[index % gradients.length];
            
            return (
            <Link
              key={course.id}
              href={`/courses/course/${course.id}`}
              className="group block bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-700"
            >
              {/* Course Icon with Gradient Background */}
              <div className={`relative h-48 overflow-hidden ${gradientClass} flex items-center justify-center`}>
                <div className="w-32 h-32 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                
                {/* Level Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${
                    course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    course.level === 'Advanced' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {course.level}
                  </span>
                </div>
                
                {/* Category Badge */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-text-primary text-xs font-inter rounded-lg shadow-sm">
                    {course.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-sora font-bold text-white mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-300 font-inter text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {course.rating}
                  </div>
                  <div className="text-gray-400">
                    {course.students.toLocaleString()} students
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration}
                  </div>
                  <div className="text-blue-300 font-inter font-medium text-sm group-hover:text-blue-200 transition-colors">
                    View Details →
                  </div>
                </div>
              </div>
            </Link>
            );
          })}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-sora font-bold text-text-primary mb-2">
              No courses found
            </h3>
            <p className="text-text-secondary font-inter mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-inter"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>



      {/* Stats Section */}
      <div className="bg-gray-50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-sora font-bold text-blue-600 mb-2">{allCourses.length}</div>
              <div className="text-text-secondary font-inter">Total Courses</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-sora font-bold text-green-600 mb-2">{categories.length - 1}</div>
              <div className="text-text-secondary font-inter">Categories</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-sora font-bold text-purple-600 mb-2">
                {allCourses.reduce((sum, course) => sum + course.students, 0).toLocaleString()}
              </div>
              <div className="text-text-secondary font-inter">Total Students</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-sora font-bold text-orange-600 mb-2">
                {(allCourses.reduce((sum, course) => sum + course.rating, 0) / allCourses.length).toFixed(1)}
              </div>
              <div className="text-text-secondary font-inter">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

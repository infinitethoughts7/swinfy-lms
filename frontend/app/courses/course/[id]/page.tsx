import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// This would typically come from a database or API
const courseDetails = {
  'sql': {
    title: 'SQL Mastery',
    description: 'Master SQL for database management and data querying - the foundation of data-driven careers.',
    longDescription: 'SQL is the backbone of data analysis and database management. This comprehensive course will transform you from a beginner to a SQL expert, covering everything from basic queries to advanced database optimization. Learn from industry experts and work with real-world datasets to build practical skills that employers demand.',
    image: '/assets/courses/sql.png',
    duration: '6 weeks',
    level: 'Intermediate',
    price: '₹12,499',
    category: 'Backend Development',
    instructor: 'Rani Guntikadi',
    instructorTitle: 'Senior Database Architect',
    instructorExperience: '8+ years in database design and optimization',
    instructorPhoto: '/assets/students/s2.jpg',
    instructorDescription: 'Rani has been teaching SQL and database management for over 8 years, impacting 20,000+ students worldwide. Her expertise in database optimization and real-world applications has helped countless professionals advance their careers in data analytics and backend development.',
    rating: 4.9,
    students: 2100,
    lessons: 24,
    language: 'English',
    features: [
      '24 Video Lessons',
      'Real-world Database Projects',
      'Certificate of Completion',
      'Lifetime Access',
      'Mentor Support',
      'Job Placement Assistance'
    ],
    highlights: [
      'Master complex queries and joins',
      'Learn database optimization techniques',
      'Work with real business datasets',
      'Get personalized mentor feedback',
      'Build a portfolio of SQL projects'
    ],
    curriculum: [
      { 
        week: 1, 
        title: 'SQL Fundamentals & Database Design', 
        lessons: 4,
        topics: ['Database concepts', 'SELECT statements', 'WHERE clauses', 'Data types'],
        duration: 'Week 1'
      },
      { 
        week: 2, 
        title: 'Advanced Querying & Joins', 
        lessons: 4,
        topics: ['INNER, LEFT, RIGHT joins', 'Subqueries', 'UNION operations', 'Set theory'],
        duration: 'Week 2'
      },
      { 
        week: 3, 
        title: 'Data Manipulation & Functions', 
        lessons: 4,
        topics: ['INSERT, UPDATE, DELETE', 'Aggregate functions', 'String functions', 'Date functions'],
        duration: 'Week 3'
      },
      { 
        week: 4, 
        title: 'Advanced SQL Concepts', 
        lessons: 4,
        topics: ['Window functions', 'CTEs', 'Indexes', 'Views'],
        duration: 'Week 4'
      },
      { 
        week: 5, 
        title: 'Performance Optimization', 
        lessons: 4,
        topics: ['Query optimization', 'Execution plans', 'Indexing strategies', 'Performance tuning'],
        duration: 'Week 5'
      },
      { 
        week: 6, 
        title: 'Real-world Projects & Portfolio', 
        lessons: 4,
        topics: ['E-commerce database project', 'Analytics dashboard', 'Portfolio presentation', 'Career guidance'],
        duration: 'Week 6'
      }
    ],
    reviews: [
      {
        name: 'Sarah Johnson',
        rating: 5,
        text: 'Rani\'s teaching style is exceptional. I landed a data analyst job within 2 months of completing this course!',
        role: 'Data Analyst at Microsoft'
      },
      {
        name: 'Michael Chen',
        rating: 5,
        text: 'The real-world projects were game-changers. I could immediately apply what I learned in my current role.',
        role: 'Business Intelligence Developer'
      },
      {
        name: 'Emily Rodriguez',
        rating: 5,
        text: 'Best SQL course I\'ve taken. The mentor support and community made all the difference.',
        role: 'Database Administrator'
      }
    ]
  },
  'python': {
    title: 'Python Programming Excellence',
    description: 'Master Python programming for backend development and automation - your gateway to tech success.',
    longDescription: 'Python is the most versatile programming language in the world. This comprehensive course will take you from absolute beginner to Python expert, covering everything from basic syntax to advanced frameworks. Learn from industry veterans and build real-world applications that showcase your skills to potential employers.',
    image: '/assets/courses/python.svg',
    duration: '6 weeks',
    level: 'Beginner',
    price: '₹19,999',
    category: 'Backend Development',
    instructor: 'Rakesh Ganji',
    instructorTitle: 'Senior Python Developer',
    instructorExperience: '10+ years building scalable applications',
    instructorPhoto: '/assets/students/s11.jpg',
    instructorDescription: 'Rakesh has been teaching Python programming for over 10 years, impacting 25,000+ students globally. His expertise in full-stack development and real-world project implementation has helped thousands of learners transition into successful tech careers.',
    rating: 4.9,
    students: 3200,
    lessons: 30,
    language: 'English',
    features: [
      '30 Video Lessons',
      'Hands-on Coding Projects',
      'Certificate of Completion',
      'Lifetime Access',
      'Mentor Support',
      'Job Placement Assistance'
    ],
    highlights: [
      'Build 5+ real-world applications',
      'Master object-oriented programming',
      'Learn web development with Django',
      'Get personalized code reviews',
      'Join our exclusive Python community'
    ],
    curriculum: [
      { 
        week: 1, 
        title: 'Python Fundamentals & Setup', 
        lessons: 5,
        topics: ['Python installation', 'Variables & data types', 'Control structures', 'Functions basics', 'Error handling'],
        duration: 'Week 1'
      },
      { 
        week: 2, 
        title: 'Data Structures & Algorithms', 
        lessons: 5,
        topics: ['Lists, tuples, dictionaries', 'List comprehensions', 'Basic algorithms', 'File I/O', 'JSON handling'],
        duration: 'Week 2'
      },
      { 
        week: 3, 
        title: 'Object-Oriented Programming', 
        lessons: 5,
        topics: ['Classes & objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Design patterns'],
        duration: 'Week 3'
      },
      { 
        week: 4, 
        title: 'Web Development with Django', 
        lessons: 5,
        topics: ['Django framework', 'Models & databases', 'Views & templates', 'URL routing', 'Admin interface'],
        duration: 'Week 4'
      },
      { 
        week: 5, 
        title: 'APIs & Database Integration', 
        lessons: 5,
        topics: ['REST APIs', 'Database ORM', 'Authentication', 'Testing', 'Deployment basics'],
        duration: 'Week 5'
      },
      { 
        week: 6, 
        title: 'Final Project & Career Prep', 
        lessons: 5,
        topics: ['Full-stack project', 'Code optimization', 'Portfolio building', 'Interview prep', 'Career guidance'],
        duration: 'Week 6'
      }
    ],
    reviews: [
      {
        name: 'David Kim',
        rating: 5,
        text: 'Rakesh is an amazing instructor. His real-world experience really shows in his teaching approach.',
        role: 'Full-Stack Developer at Google'
      },
      {
        name: 'Lisa Wang',
        rating: 5,
        text: 'I went from zero programming knowledge to building my own web app. This course changed my life!',
        role: 'Python Developer at Amazon'
      },
      {
        name: 'James Wilson',
        rating: 5,
        text: 'The projects were challenging but rewarding. I got hired as a Python developer within 3 months.',
        role: 'Backend Developer at Netflix'
      }
    ]
  },
  'advanced-excel': {
    title: 'Advanced Excel Mastery',
    description: 'Master advanced Excel functions, pivot tables, and data analysis techniques - become the Excel expert your company needs.',
    longDescription: 'Excel is the most powerful tool in business analytics. This comprehensive course will transform you into an Excel expert, covering advanced functions, data visualization, automation, and business intelligence. Learn from industry professionals and master techniques that will make you indispensable in any data-driven role.',
    image: '/assets/courses/excel.svg',
    duration: '6 weeks',
    level: 'Intermediate',
    price: '₹8,499',
    category: 'Data Analyst',
    instructor: 'Sumasri Vallapu',
    instructorTitle: 'Excel & Business Intelligence Expert',
    instructorExperience: '12+ years in financial modeling and analytics',
    instructorPhoto: '/assets/students/s3.jpg',
    instructorDescription: 'Sumasri has been teaching Excel and business intelligence for over 12 years, impacting 18,000+ students worldwide. Her expertise in financial modeling and data visualization has helped countless professionals excel in their analytical careers.',
    rating: 4.8,
    students: 1250,
    lessons: 24,
    language: 'English',
    features: [
      '24 Video Lessons',
      'Real Business Case Studies',
      'Certificate of Completion',
      'Lifetime Access',
      'Mentor Support',
      'Job Placement Assistance'
    ],
    highlights: [
      'Master advanced formulas and functions',
      'Create stunning dashboards and reports',
      'Automate repetitive tasks with VBA',
      'Get personalized business insights',
      'Build a portfolio of Excel solutions'
    ],
    curriculum: [
      { 
        week: 1, 
        title: 'Advanced Functions & Formulas', 
        lessons: 4,
        topics: ['VLOOKUP, INDEX/MATCH', 'Array formulas', 'Logical functions', 'Text manipulation'],
        duration: 'Week 1'
      },
      { 
        week: 2, 
        title: 'Pivot Tables & Data Analysis', 
        lessons: 4,
        topics: ['Pivot table mastery', 'Data modeling', 'Slicers & timelines', 'Advanced filtering'],
        duration: 'Week 2'
      },
      { 
        week: 3, 
        title: 'Data Visualization & Dashboards', 
        lessons: 4,
        topics: ['Advanced charts', 'Conditional formatting', 'Dashboard design', 'Interactive reports'],
        duration: 'Week 3'
      },
      { 
        week: 4, 
        title: 'Power Query & Data Transformation', 
        lessons: 4,
        topics: ['Power Query basics', 'Data cleaning', 'Merging datasets', 'Automated data refresh'],
        duration: 'Week 4'
      },
      { 
        week: 5, 
        title: 'VBA & Automation', 
        lessons: 4,
        topics: ['VBA fundamentals', 'Macro recording', 'Custom functions', 'Workflow automation'],
        duration: 'Week 5'
      },
      { 
        week: 6, 
        title: 'Business Intelligence & Portfolio', 
        lessons: 4,
        topics: ['Financial modeling', 'KPI dashboards', 'Portfolio presentation', 'Career advancement'],
        duration: 'Week 6'
      }
    ],
    reviews: [
      {
        name: 'Jennifer Martinez',
        rating: 5,
        text: 'Sumasri\'s expertise in Excel is unmatched. I got promoted to Senior Analyst after completing this course!',
        role: 'Senior Financial Analyst at Goldman Sachs'
      },
      {
        name: 'Robert Taylor',
        rating: 5,
        text: 'The business case studies were incredibly valuable. I could immediately apply the techniques at work.',
        role: 'Business Intelligence Manager at Deloitte'
      },
      {
        name: 'Amanda Lee',
        rating: 5,
        text: 'Best Excel course available. The VBA section alone was worth the entire course price.',
        role: 'Data Analyst at McKinsey'
      }
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
              
              <button className="bg-white text-blue-600 hover:bg-blue-50 font-sora font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                Enroll Now - {course.price}
              </button>
            </div>
            

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Course Highlights */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                What You'll Master
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-text-secondary font-inter">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                About This Course
              </h2>
              <p className="text-text-secondary font-inter leading-relaxed text-lg">
                {course.longDescription}
              </p>
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                Course Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-text-secondary font-inter">Level:</span>
                    <span className="font-sora font-semibold text-text-primary">{course.level}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-text-secondary font-inter">Duration:</span>
                    <span className="font-sora font-semibold text-text-primary">{course.duration}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-text-secondary font-inter">Lessons:</span>
                    <span className="font-sora font-semibold text-text-primary">{course.lessons}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-text-secondary font-inter">Language:</span>
                    <span className="font-sora font-semibold text-text-primary">{course.language}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-text-secondary font-inter">Students:</span>
                    <span className="font-sora font-semibold text-text-primary">{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-text-secondary font-inter">Rating:</span>
                    <span className="font-sora font-semibold text-text-primary">{course.rating} ⭐</span>
                  </div>
                </div>
              </div>
            </div>



            {/* Curriculum Roadmap */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-8">
                Learning Roadmap
              </h2>
              <div className="space-y-6">
                {course.curriculum.map((week, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-sora font-bold">{week.week}</span>
                        </div>
                        {index < course.curriculum.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-blue-300 to-indigo-300"></div>
                        )}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-sora font-bold text-text-primary">
                            {week.title}
                          </h3>
                          <span className="text-sm font-inter text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            {week.duration}
                          </span>
                        </div>
                        <p className="text-text-secondary font-inter mb-4">
                          {week.lessons} lessons
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {week.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-text-secondary font-inter">{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Reviews */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-8">
                What Our Students Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {course.reviews.map((review, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-text-secondary font-inter mb-4 italic">"{review.text}"</p>
                    <div>
                      <p className="font-sora font-semibold text-text-primary">{review.name}</p>
                      <p className="text-sm text-text-secondary font-inter">{review.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mentor Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-20 border border-gray-100">
              {/* Mentor Section */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-100">
                  <Image
                    src={course.instructorPhoto}
                    alt={course.instructor}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-sora font-bold text-text-primary mb-1">
                  {course.instructor}
                </h3>
                <p className="text-blue-600 font-inter font-semibold text-base mb-1">
                  {course.instructorTitle}
                </p>
                <p className="text-text-secondary font-inter text-xs mb-3">
                  {course.instructorExperience}
                </p>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-text-primary font-inter font-semibold text-sm">Expert Mentor</span>
                </div>
                <p className="text-text-secondary font-inter text-xs leading-relaxed mb-4">
                  {course.instructorDescription}
                </p>
              </div>
              
              {/* Pricing Section */}
              <div className="text-center mb-6">
                <div className="text-3xl font-sora font-black text-blue-600 mb-1">
                  {course.price}
                </div>
                <div className="text-text-secondary font-inter text-sm">
                  One-time payment • Lifetime access
                </div>
              </div>
              
              {/* Enroll Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sora font-bold text-base py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-4">
                Enroll Now
              </button>
              
              {/* Features */}
              <div className="border border-gray-200 rounded-lg p-3 space-y-2 text-xs">
                {course.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-text-secondary">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-inter">{feature}</span>
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

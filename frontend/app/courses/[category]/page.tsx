import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const courseData = {
  'technical-skills': {
    title: 'Technical Skills',
    description: 'Master in-demand technical skills with our comprehensive courses designed by industry experts',
    image: '/assets/images/courses/4by3/python.jpg',
    courses: [
      {
        id: 'advanced-excel',
        title: 'Advanced Excel',
        description: 'Master advanced Excel functions, pivot tables, and data analysis techniques',
        image: '/assets/images/courses/4by3/01.jpg',
        duration: '8 weeks',
        level: 'Intermediate',
        price: '$99'
      },
      {
        id: 'google-sheets',
        title: 'Google Sheets',
        description: 'Learn Google Sheets for collaborative data management and analysis',
        image: '/assets/images/courses/4by3/02.jpg',
        duration: '6 weeks',
        level: 'Beginner',
        price: '$79'
      },
      {
        id: 'sql',
        title: 'SQL',
        description: 'Master SQL for database management and data querying',
        image: '/assets/images/courses/4by3/04.jpg',
        duration: '10 weeks',
        level: 'Intermediate',
        price: '$149'
      },
      {
        id: 'tableau',
        title: 'Tableau',
        description: 'Create stunning data visualizations and interactive dashboards',
        image: '/assets/images/courses/4by3/08.jpg',
        duration: '12 weeks',
        level: 'Advanced',
        price: '$199'
      },
      {
        id: 'power-bi',
        title: 'Power BI',
        description: 'Build powerful business intelligence solutions with Microsoft Power BI',
        image: '/assets/images/courses/4by3/10.jpg',
        duration: '10 weeks',
        level: 'Intermediate',
        price: '$179'
      },
      {
        id: 'looker-studio',
        title: 'Looker Studio',
        description: 'Create beautiful reports and dashboards with Google Looker Studio',
        image: '/assets/images/courses/4by3/14.jpg',
        duration: '8 weeks',
        level: 'Beginner',
        price: '$129'
      },
      {
        id: 'python',
        title: 'Python',
        description: 'Learn Python programming for data science and automation',
        image: '/assets/images/courses/4by3/python.jpg',
        duration: '16 weeks',
        level: 'Beginner',
        price: '$249'
      },
      {
        id: 'sas',
        title: 'SAS',
        description: 'Master SAS for statistical analysis and business intelligence',
        image: '/assets/images/courses/4by3/15.jpg',
        duration: '14 weeks',
        level: 'Advanced',
        price: '$299'
      },
      {
        id: 'statistics',
        title: 'Statistics',
        description: 'Learn statistical concepts and their practical applications',
        image: '/assets/images/courses/4by3/16.jpg',
        duration: '12 weeks',
        level: 'Intermediate',
        price: '$179'
      },
      {
        id: 'r',
        title: 'R',
        description: 'Master R programming for statistical computing and data analysis',
        image: '/assets/images/courses/4by3/17.jpg',
        duration: '14 weeks',
        level: 'Intermediate',
        price: '$199'
      }
    ]
  },
  'life-skills': {
    title: 'Life Skills',
    description: 'Develop essential life skills for personal and professional growth',
    image: '/assets/images/courses/4by3/01.jpg',
    courses: [
      {
        id: 'communication-skills',
        title: 'Communication Skills',
        description: 'Enhance your verbal and written communication abilities',
        image: '/assets/images/courses/4by3/18.jpg',
        duration: '6 weeks',
        level: 'Beginner',
        price: '$89'
      },
      {
        id: 'leadership-skills',
        title: 'Leadership Skills',
        description: 'Develop leadership qualities and team management skills',
        image: '/assets/images/courses/4by3/19.jpg',
        duration: '8 weeks',
        level: 'Intermediate',
        price: '$129'
      },
      {
        id: 'time-management',
        title: 'Time Management',
        description: 'Master productivity techniques and time management strategies',
        image: '/assets/images/courses/4by3/20.jpg',
        duration: '4 weeks',
        level: 'Beginner',
        price: '$69'
      }
    ]
  },
  'interview-preparation': {
    title: 'Interview Preparation',
    description: 'Get ready for interviews with our comprehensive preparation courses',
    image: '/assets/images/courses/4by3/02.jpg',
    courses: [
      {
        id: 'interview-prep',
        title: 'Interview Preparation',
        description: 'Comprehensive guide to ace any interview with confidence',
        image: '/assets/images/courses/4by3/21.jpg',
        duration: '6 weeks',
        level: 'Beginner',
        price: '$99'
      },
      {
        id: 'resume-building',
        title: 'Resume Building',
        description: 'Create compelling resumes that get you noticed by employers',
        image: '/assets/images/courses/4by3/22.jpg',
        duration: '4 weeks',
        level: 'Beginner',
        price: '$79'
      },
      {
        id: 'job-portals',
        title: 'Job Portals Updation',
        description: 'Optimize your profiles on LinkedIn, Indeed, and other job portals',
        image: '/assets/images/courses/4by3/angular.jpg',
        duration: '3 weeks',
        level: 'Beginner',
        price: '$59'
      },
      {
        id: 'career-guidance',
        title: 'Career Guidance',
        description: 'Get personalized career guidance and mentorship',
        image: '/assets/images/courses/4by3/css.jpg',
        duration: '8 weeks',
        level: 'All Levels',
        price: '$149'
      }
    ]
  },
  'webinars': {
    title: 'Webinars',
    description: 'Join our expert-led webinars on trending topics and industry insights',
    image: '/assets/images/courses/4by3/04.jpg',
    courses: [
      {
        id: 'excel-webinar',
        title: 'Data Analysis using Microsoft Excel',
        description: 'Live webinar on advanced Excel techniques for data analysis',
        image: '/assets/images/courses/4by3/figma.jpg',
        duration: '2 hours',
        level: 'All Levels',
        price: 'Free'
      },
      {
        id: 'data-management',
        title: 'Data Management & Importance',
        description: 'Understanding the importance of proper data management practices',
        image: '/assets/images/courses/4by3/html.jpg',
        duration: '1.5 hours',
        level: 'All Levels',
        price: 'Free'
      },
      {
        id: 'dashboard-webinar',
        title: 'Dashboard & Its importance',
        description: 'Learn best practices for creating effective dashboards',
        image: '/assets/images/courses/4by3/javascript.jpg',
        duration: '2 hours',
        level: 'All Levels',
        price: 'Free'
      },
      {
        id: 'frontend-webinar',
        title: 'Front End Development',
        description: 'Introduction to modern frontend development technologies',
        image: '/assets/images/courses/4by3/react.jpg',
        duration: '2.5 hours',
        level: 'All Levels',
        price: 'Free'
      },
      {
        id: 'data-science-webinar',
        title: 'Importance of Data Science',
        description: 'Explore the growing importance of data science in business',
        image: '/assets/images/courses/4by3/01.jpg',
        duration: '1.5 hours',
        level: 'All Levels',
        price: 'Free'
      }
    ]
  }
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = courseData[categorySlug as keyof typeof courseData];
  
  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Category Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <Link 
                href="/courses" 
                className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-4"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Courses
              </Link>
              <h1 className="text-4xl md:text-5xl font-sora font-black text-white mb-4">
                {category.title}
              </h1>
              <p className="text-xl text-blue-100 font-inter max-w-2xl">
                {category.description}
              </p>
            </div>
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-sora font-bold text-text-primary mb-4">
            Available Courses
          </h2>
          <p className="text-lg text-text-secondary font-inter">
            {category.courses.length} courses available in this category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {category.courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/course/${course.id}`}
              className="group block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
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
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-sora font-bold text-text-primary mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-text-secondary font-inter text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-text-secondary font-inter mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration}
                  </div>
                  <div className="font-sora font-bold text-lg text-blue-600">
                    {course.price}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-inter font-medium group-hover:text-blue-600 transition-colors">
                    View Course →
                  </span>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

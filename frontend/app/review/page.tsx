'use client';

import { useState } from 'react';
import Image from 'next/image';
import StaticNavbar from '@/components/layout/StaticNavbar';
import Footer from '@/components/layout/Footer';

const ReviewPage = () => {
  const [visibleReviews, setVisibleReviews] = useState(12);
  const reviewsPerPage = 12;

  const allReviews = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Data Analyst',
      company: 'Microsoft',
      achievement: 'Got promoted to Senior Analyst',
      review: 'Rani\'s SQL course transformed my career! I went from basic Excel to advanced database management. The real-world projects were game-changers.',
      image: '/assets/students/s1.jpg',
      linkedin: 'https://linkedin.com/in/priya-sharma',
      course: 'SQL Mastery',
      duration: '6 months ago'
    },
    {
      id: 2,
      name: 'Arjun Patel',
      role: 'Full-Stack Developer',
      company: 'Google',
      achievement: 'Landed first tech job',
      review: 'Rakesh\'s Python course was incredible! I had zero programming experience but now I\'m building web applications at Google.',
      image: '/assets/students/s2.jpg',
      linkedin: 'https://linkedin.com/in/arjun-patel',
      course: 'Python Programming',
      duration: '4 months ago'
    },
    {
      id: 3,
      name: 'Kavya Reddy',
      role: 'Business Intelligence Manager',
      company: 'Deloitte',
      achievement: 'Got promoted to Manager',
      review: 'Sumasri\'s Excel course was a career game-changer! I automated processes that saved our team 20 hours per week.',
      image: '/assets/students/s3.jpg',
      linkedin: 'https://linkedin.com/in/kavya-reddy',
      course: 'Advanced Excel',
      duration: '8 months ago'
    },
    {
      id: 4,
      name: 'Rahul Kumar',
      role: 'Backend Developer',
      company: 'Amazon',
      achievement: 'Landed first tech job',
      review: 'The Python course structure was perfect for beginners. Rakesh\'s mentorship helped me understand complex concepts easily.',
      image: '/assets/students/s4.jpg',
      linkedin: 'https://linkedin.com/in/rahul-kumar',
      course: 'Python Programming',
      duration: '5 months ago'
    },
    {
      id: 5,
      name: 'Sneha Gupta',
      role: 'Data Scientist',
      company: 'Netflix',
      achievement: 'Got promoted to Senior Data Scientist',
      review: 'Rani\'s SQL expertise is unmatched! The advanced optimization techniques I learned directly improved our data pipeline performance.',
      image: '/assets/students/s5.jpg',
      linkedin: 'https://linkedin.com/in/sneha-gupta',
      course: 'SQL Mastery',
      duration: '7 months ago'
    },
    {
      id: 6,
      name: 'Vikram Singh',
      role: 'Financial Analyst',
      company: 'Goldman Sachs',
      achievement: 'Got promoted to Senior Analyst',
      review: 'Sumasri\'s Excel course revolutionized my financial modeling. I can now create complex dashboards in minutes instead of hours.',
      image: '/assets/students/s6.jpg',
      linkedin: 'https://linkedin.com/in/vikram-singh',
      course: 'Advanced Excel',
      duration: '6 months ago'
    },
    {
      id: 7,
      name: 'Ananya Joshi',
      role: 'Software Engineer',
      company: 'Meta',
      achievement: 'Landed first tech job',
      review: 'Python course was my gateway to tech! Rakesh\'s teaching style made complex programming concepts simple and fun to learn.',
      image: '/assets/students/s7.jpg',
      linkedin: 'https://linkedin.com/in/ananya-joshi',
      course: 'Python Programming',
      duration: '3 months ago'
    },
    {
      id: 8,
      name: 'Rajesh Verma',
      role: 'Database Administrator',
      company: 'Oracle',
      achievement: 'Got promoted to Lead DBA',
      review: 'Rani\'s SQL course gave me the skills to optimize our entire database infrastructure. Performance improved by 40%!',
      image: '/assets/students/s8.jpg',
      linkedin: 'https://linkedin.com/in/rajesh-verma',
      course: 'SQL Mastery',
      duration: '9 months ago'
    },
    {
      id: 9,
      name: 'Meera Iyer',
      role: 'Business Analyst',
      company: 'McKinsey',
      achievement: 'Got promoted to Senior Business Analyst',
      review: 'Excel course transformed my analytical capabilities! Sumasri\'s VBA training alone saved me 15 hours per week.',
      image: '/assets/students/s9.jpg',
      linkedin: 'https://linkedin.com/in/meera-iyer',
      course: 'Advanced Excel',
      duration: '5 months ago'
    },
    {
      id: 10,
      name: 'Karthik Nair',
      role: 'Data Engineer',
      company: 'Uber',
      achievement: 'Landed first tech job',
      review: 'The SQL course gave me the foundation I needed. Rani\'s real-world examples made complex queries easy to understand.',
      image: '/assets/students/s10.jpg',
      linkedin: 'https://linkedin.com/in/karthik-nair',
      course: 'SQL Mastery',
      duration: '4 months ago'
    },
    {
      id: 11,
      name: 'Divya Agarwal',
      role: 'Product Manager',
      company: 'Flipkart',
      achievement: 'Got promoted to Senior PM',
      review: 'Python course helped me understand technical concepts better. Rakesh\'s teaching made me a better product manager.',
      image: '/assets/students/s11.jpg',
      linkedin: 'https://linkedin.com/in/divya-agarwal',
      course: 'Python Programming',
      duration: '6 months ago'
    },
    {
      id: 12,
      name: 'Suresh Menon',
      role: 'Financial Controller',
      company: 'TCS',
      achievement: 'Got promoted to Senior Controller',
      review: 'Excel course was a game-changer for my financial reporting. Sumasri\'s advanced techniques saved me hours of work.',
      image: '/assets/students/s1.jpg',
      linkedin: 'https://linkedin.com/in/suresh-menon',
      course: 'Advanced Excel',
      duration: '7 months ago'
    },
    {
      id: 13,
      name: 'Aishwarya Nair',
      role: 'Data Scientist',
      company: 'IBM',
      achievement: 'Landed first tech job',
      review: 'Python course opened doors I never knew existed. Rakesh\'s teaching style made complex algorithms simple.',
      image: '/assets/students/s2.jpg',
      linkedin: 'https://linkedin.com/in/aishwarya-nair',
      course: 'Python Programming',
      duration: '5 months ago'
    },
    {
      id: 14,
      name: 'Rohit Agarwal',
      role: 'Business Intelligence Analyst',
      company: 'Accenture',
      achievement: 'Got promoted to Senior Analyst',
      review: 'SQL course transformed my data analysis skills. Rani\'s real-world examples were incredibly helpful.',
      image: '/assets/students/s3.jpg',
      linkedin: 'https://linkedin.com/in/rohit-agarwal',
      course: 'SQL Mastery',
      duration: '6 months ago'
    },
    {
      id: 15,
      name: 'Deepika Singh',
      role: 'Financial Analyst',
      company: 'JP Morgan',
      achievement: 'Got promoted to Senior Analyst',
      review: 'Excel course revolutionized my financial modeling. Sumasri\'s VBA training was a game-changer.',
      image: '/assets/students/s4.jpg',
      linkedin: 'https://linkedin.com/in/deepika-singh',
      course: 'Advanced Excel',
      duration: '8 months ago'
    },
    {
      id: 16,
      name: 'Vishal Kumar',
      role: 'Software Developer',
      company: 'Infosys',
      achievement: 'Landed first tech job',
      review: 'Python course gave me the confidence to switch careers. Rakesh\'s mentorship was invaluable.',
      image: '/assets/students/s5.jpg',
      linkedin: 'https://linkedin.com/in/vishal-kumar',
      course: 'Python Programming',
      duration: '4 months ago'
    },
    {
      id: 17,
      name: 'Shreya Reddy',
      role: 'Database Administrator',
      company: 'Wipro',
      achievement: 'Got promoted to Lead DBA',
      review: 'SQL course provided the foundation for my database career. Rani\'s expertise is unmatched.',
      image: '/assets/students/s6.jpg',
      linkedin: 'https://linkedin.com/in/shreya-reddy',
      course: 'SQL Mastery',
      duration: '9 months ago'
    },
    {
      id: 18,
      name: 'Amit Joshi',
      role: 'Business Analyst',
      company: 'Cognizant',
      achievement: 'Got promoted to Senior BA',
      review: 'Excel course enhanced my analytical capabilities. Sumasri\'s dashboard techniques are brilliant.',
      image: '/assets/students/s7.jpg',
      linkedin: 'https://linkedin.com/in/amit-joshi',
      course: 'Advanced Excel',
      duration: '7 months ago'
    },
    {
      id: 19,
      name: 'Pooja Gupta',
      role: 'Data Engineer',
      company: 'Tech Mahindra',
      achievement: 'Landed first tech job',
      review: 'Python course was my gateway to data engineering. Rakesh\'s project-based learning was perfect.',
      image: '/assets/students/s8.jpg',
      linkedin: 'https://linkedin.com/in/pooja-gupta',
      course: 'Python Programming',
      duration: '3 months ago'
    },
    {
      id: 20,
      name: 'Rajesh Iyer',
      role: 'Financial Controller',
      company: 'HCL',
      achievement: 'Got promoted to Senior Controller',
      review: 'Excel course streamlined our financial processes. Sumasri\'s automation techniques saved us days.',
      image: '/assets/students/s9.jpg',
      linkedin: 'https://linkedin.com/in/rajesh-iyer',
      course: 'Advanced Excel',
      duration: '6 months ago'
    },
    {
      id: 21,
      name: 'Neha Patel',
      role: 'Product Analyst',
      company: 'Zomato',
      achievement: 'Landed first tech job',
      review: 'SQL course helped me understand data better. Rani\'s teaching made complex queries simple.',
      image: '/assets/students/s10.jpg',
      linkedin: 'https://linkedin.com/in/neha-patel',
      course: 'SQL Mastery',
      duration: '5 months ago'
    },
    {
      id: 22,
      name: 'Siddharth Verma',
      role: 'Backend Developer',
      company: 'Swiggy',
      achievement: 'Got promoted to Senior Developer',
      review: 'Python course accelerated my development skills. Rakesh\'s code reviews were incredibly helpful.',
      image: '/assets/students/s11.jpg',
      linkedin: 'https://linkedin.com/in/siddharth-verma',
      course: 'Python Programming',
      duration: '8 months ago'
    },
    {
      id: 23,
      name: 'Kavya Menon',
      role: 'Data Analyst',
      company: 'Paytm',
      achievement: 'Got promoted to Senior Analyst',
      review: 'Excel course transformed my reporting capabilities. Sumasri\'s pivot table mastery was amazing.',
      image: '/assets/students/s1.jpg',
      linkedin: 'https://linkedin.com/in/kavya-menon',
      course: 'Advanced Excel',
      duration: '7 months ago'
    }
  ];

  const reviews = allReviews.slice(0, visibleReviews);

  const loadMoreReviews = () => {
    setVisibleReviews(prev => Math.min(prev + reviewsPerPage, allReviews.length));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <StaticNavbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 pt-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-sora font-black text-white mb-6">
              Success Stories That Inspire
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-inter max-w-4xl mx-auto mb-8">
              Join thousands of students who transformed their careers with our expert-led courses. 
              From first-time job seekers to career changers, see how our mentors helped them achieve their dreams.
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

      {/* Reviews Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300">
              {/* Student Info */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100">
                  <Image
                    src={review.image}
                    alt={review.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-sora font-bold text-text-primary text-lg mb-1">
                    {review.name}
                  </h3>
                  <p className="text-blue-600 font-inter font-semibold text-sm mb-1">
                    {review.role} at {review.company}
                  </p>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-600 font-inter font-medium text-sm">
                      {review.achievement}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <blockquote className="text-text-secondary font-inter leading-relaxed mb-4 italic">
                &ldquo;{review.review}&rdquo;
              </blockquote>

              {/* Course and LinkedIn */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-text-secondary font-inter">
                    {review.course} • {review.duration}
                  </span>
                </div>
                <a
                  href={review.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm font-inter">LinkedIn</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        {visibleReviews < allReviews.length && (
          <div className="text-center mt-12">
            <button
              onClick={loadMoreReviews}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sora font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              See More Reviews ({allReviews.length - visibleReviews} remaining)
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-sora font-black text-white mb-2">2,847</div>
              <div className="text-blue-100 font-inter">Students Got Hired</div>
            </div>
            <div>
              <div className="text-4xl font-sora font-black text-white mb-2">₹2.5Cr+</div>
              <div className="text-blue-100 font-inter">Average Salary Increase</div>
            </div>
            <div>
              <div className="text-4xl font-sora font-black text-white mb-2">94%</div>
              <div className="text-blue-100 font-inter">Career Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReviewPage;

import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, GraduationCap, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-8 lg:py-12 bg-gradient-to-br from-white via-blue-50/30 to-white">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="relative z-20 order-2 lg:order-1">
            <h1 className="font-sora font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-gray-900 leading-tight mb-4">
              Launch Your{' '}
              <span className="inline-block text-blue-600 relative">
                Tech Career.
                <svg className="absolute w-full h-2 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 font-inter leading-relaxed mb-6 max-w-lg">
              Master AI, Data Science, and Life Skills with a curriculum designed to help you land your dream job.
            </p>

            {/* Feature Elements */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
              {[
                { text: "Learn with experts", color: "text-blue-500" },
                { text: "Get certificate", color: "text-green-500" },
                { text: "Get membership", color: "text-purple-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <CheckCircle2 className={`w-4 h-4 ${item.color}`} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href="/courses"
                className="group inline-flex items-center justify-center bg-gray-900 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5"
              >
                Start Learning
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center bg-white border-2 border-gray-200 text-gray-900 font-semibold text-sm px-6 py-3 rounded-lg transition-all duration-300 hover:border-gray-900 hover:-translate-y-0.5"
              >
                Browse Courses
              </Link>
            </div>

            {/* Inline Stats */}
            <div className="flex flex-wrap items-center gap-8 pt-5 border-t border-gray-100">
              <StatItem icon={<BookOpen className="w-5 h-5 text-amber-600" />} value="21+" label="Courses" />
              <StatItem icon={<GraduationCap className="w-5 h-5 text-blue-600" />} value="19+" label="Tutors" />
              <StatItem icon={<Users className="w-5 h-5 text-purple-600" />} value="10K+" label="Students" />
              <StatItem icon={<Award className="w-5 h-5 text-teal-600" />} value="15 Yrs" label="Avg. Exp." />
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative z-10 order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Background Blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] z-0">
                <svg viewBox="0 0 200 200" className="absolute w-full h-full text-blue-600 opacity-10 animate-[spin_60s_linear_infinite]">
                  <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.6,9.5,82.4,23.3,70.8,35.2C59.1,47.1,47,57.1,33.5,65.2C20,73.3,5.1,79.5,-9.3,78.2C-23.7,76.9,-37.6,68.1,-49.9,58.8C-62.2,49.5,-72.9,39.7,-80.3,27.5C-87.7,15.3,-91.8,0.7,-88.7,-12.8C-85.6,-26.3,-75.3,-38.7,-63.5,-48.3C-51.7,-57.9,-38.4,-64.7,-25.2,-69.6C-12,-74.5,1.1,-77.5,14.2,-77.4L44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
                <svg viewBox="0 0 200 200" className="absolute w-[90%] h-[90%] top-[5%] left-[5%] text-green-200 opacity-60 animate-[spin_40s_linear_infinite_reverse]">
                  <path fill="currentColor" d="M41.4,-70.6C52.5,-63.4,59.6,-48.6,66.1,-34.7C72.6,-20.8,78.5,-7.8,76.3,4.1C74.1,16,63.8,26.8,54.7,37.3C45.6,47.8,37.7,58,27.3,64.3C16.9,70.6,4,73,-8.6,71.8C-21.2,70.6,-33.5,65.8,-44.7,58.4C-55.9,51,-66,41,-71.4,28.8C-76.8,16.6,-77.5,2.2,-73.4,-10.5C-69.3,-23.2,-60.4,-34.2,-50.2,-41.7C-40,-49.2,-28.5,-53.2,-17.1,-56.3C-5.7,-59.4,5.6,-61.6,17.4,-62.4L41.4,-70.6Z" transform="translate(100 100)" />
                </svg>
              </div>

              {/* Main Image */}
              <div className="relative z-10">
                <Image
                  src="/assets/students/banner.png"
                  alt="Happy student using OLLA platform"
                  width={500}
                  height={420}
                  className="w-full h-auto drop-shadow-xl"
                  priority
                />

                {/* Floating Badge */}
                <div className="absolute top-4 -right-2 md:right-0 z-20 animate-[bounce_3s_infinite]">
                  <div className="bg-white p-2.5 shadow-lg rounded-xl border border-green-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-[10px] font-bold text-gray-800">New Enrollments</p>
                    </div>
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-6 h-6 border-2 border-white rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={`/assets/students/s${i}.jpg`}
                            alt="Student"
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-[8px] font-bold">
                        1k+
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Compact inline stat component
import { ReactNode } from 'react';

interface StatItemProps {
  icon: ReactNode;
  value: string;
  label: string;
}

const StatItem = ({ icon, value, label }: StatItemProps) => (
  <div className="flex items-center gap-3">
    <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <div>
      <div className="text-lg font-bold text-gray-900 leading-tight">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);

export default HeroSection;

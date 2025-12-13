'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, GraduationCap, Award, Sparkles, Star, Zap } from 'lucide-react';
import Image from 'next/image';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden py-12 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Enhanced Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary blob - large and slow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>

        {/* Secondary blob - medium */}
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Accent blob - small and fast */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-bl from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '1s' }}></div>

        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-blue-500/30 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-32 left-20 w-6 h-6 bg-purple-500/20 rounded-full animate-ping" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-cyan-500/40 rounded-full animate-pulse" style={{ animationDelay: '5s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column - Text Content */}
          <div className={`relative z-20 order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200/50">
              <Sparkles className="w-4 h-4" />
              <span>Transform Your Future</span>
              <Star className="w-4 h-4 animate-pulse" />
            </div>

            {/* Animated Title */}
            <h1 className="font-sora font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-gray-900 leading-[1.1] mb-6">
              <span className={`inline-block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Launch Your{' '}
              </span>
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
                Tech Career
                <svg className="absolute w-full h-3 -bottom-2 left-0 text-blue-300/60 -z-10 animate-pulse" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0 6 Q 50 12 100 6 Q 150 0 200 6" stroke="currentColor" strokeWidth="6" fill="none" />
                </svg>
              </span>
              <span className={`inline-block transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                .
              </span>
            </h1>

            {/* Animated Subtitle */}
            <p className={`text-lg sm:text-xl text-gray-600 font-inter leading-relaxed mb-8 max-w-lg transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Master <span className="font-semibold text-blue-600">AI</span>, <span className="font-semibold text-purple-600">Data Science</span>, and <span className="font-semibold text-indigo-600">Life Skills</span> with a curriculum designed to help you land your dream job.
            </p>

            {/* Enhanced Feature Elements */}
            <div className={`flex flex-wrap gap-x-6 gap-y-3 mb-8 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {[
                { text: "Learn with industry experts", color: "text-blue-600", icon: "👨‍🏫" },
                { text: "Earn verified certificates", color: "text-green-600", icon: "🏆" },
                { text: "Join premium community", color: "text-purple-600", icon: "👥" },
                { text: "Lifetime access", color: "text-orange-600", icon: "∞" }
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-2 text-sm font-medium text-gray-700 transition-all duration-500 hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${800 + idx * 100}ms` }}>
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Enhanced CTAs */}
            <div className={`flex flex-col sm:flex-row gap-3 mb-10 transition-all duration-700 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                href="/courses"
                className="group relative inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-base px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Learning Today
                  <Zap className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                href="/courses"
                className="group inline-flex items-center justify-center bg-white border-2 border-gray-200 text-gray-900 font-semibold text-base px-6 py-3 rounded-xl transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105"
              >
                <BookOpen className="mr-2 w-4 h-4 group-hover:rotate-6 transition-transform duration-300" />
                Explore Courses
              </Link>
            </div>

            {/* Enhanced Stats */}
            <div className={`flex items-center justify-between gap-6 pt-6 border-t border-gray-200 transition-all duration-700 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <StatItem icon={<BookOpen className="w-6 h-6 text-amber-600" />} value="21+" label="Courses" />
              <StatItem icon={<GraduationCap className="w-6 h-6 text-blue-600" />} value="19+" label="Expert Tutors" />
              <StatItem icon={<Users className="w-6 h-6 text-purple-600" />} value="10K+" label="Students" />
              <StatItem icon={<Award className="w-6 h-6 text-teal-600" />} value="15 Yrs" label="Avg. Experience" />
            </div>
          </div>

          {/* Right Column - Enhanced Image */}
          <div className={`relative z-10 order-1 lg:order-2 flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Enhanced Background Blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] z-0">
                <svg viewBox="0 0 200 200" className="absolute w-full h-full text-blue-500/20 animate-spin" style={{ animationDuration: '80s' }}>
                  <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.6,9.5,82.4,23.3,70.8,35.2C59.1,47.1,47,57.1,33.5,65.2C20,73.3,5.1,79.5,-9.3,78.2C-23.7,76.9,-37.6,68.1,-49.9,58.8C-62.2,49.5,-72.9,39.7,-80.3,27.5C-87.7,15.3,-91.8,0.7,-88.7,-12.8C-85.6,-26.3,-75.3,-38.7,-63.5,-48.3C-51.7,-57.9,-38.4,-64.7,-25.2,-69.6C-12,-74.5,1.1,-77.5,14.2,-77.4L44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
                <svg viewBox="0 0 200 200" className="absolute w-[85%] h-[85%] top-[7.5%] left-[7.5%] text-green-400/30 animate-spin" style={{ animationDuration: '60s', animationDirection: 'reverse' }}>
                  <path fill="currentColor" d="M41.4,-70.6C52.5,-63.4,59.6,-48.6,66.1,-34.7C72.6,-20.8,78.5,-7.8,76.3,4.1C74.1,16,63.8,26.8,54.7,37.3C45.6,47.8,37.7,58,27.3,64.3C16.9,70.6,4,73,-8.6,71.8C-21.2,70.6,-33.5,65.8,-44.7,58.4C-55.9,51,-66,41,-71.4,28.8C-76.8,16.6,-77.5,2.2,-73.4,-10.5C-69.3,-23.2,-60.4,-34.2,-50.2,-41.7C-40,-49.2,-28.5,-53.2,-17.1,-56.3C-5.7,-59.4,5.6,-61.6,17.4,-62.4L41.4,-70.6Z" transform="translate(100 100)" />
                </svg>
                <svg viewBox="0 0 200 200" className="absolute w-[70%] h-[70%] top-[15%] left-[15%] text-purple-400/20 animate-spin" style={{ animationDuration: '40s' }}>
                  <path fill="currentColor" d="M39.5,-65.8C51.1,-58.7,59.9,-46.2,66.8,-32.8C73.7,-19.4,78.7,-4.9,76.5,8.6C74.3,22.1,64.9,34.6,54.5,45.7C44.1,56.8,32.8,66.5,19.4,71.7C6,76.9,-8.4,77.6,-22.3,73.5C-36.2,69.4,-49.6,60.4,-59.9,49.4C-70.2,38.4,-77.4,25.4,-80.1,11.5C-82.8,-2.4,-81,-17.2,-74.2,-30.2C-67.4,-43.2,-55.6,-54.4,-42.6,-61.7C-29.6,-69,-14.8,-72.4,0.7,-73.4L39.5,-65.8Z" transform="translate(100 100)" />
                </svg>
              </div>

              {/* Main Image with Enhanced Effects */}
              <div className="relative z-10 group">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-blue-500/10 group-hover:shadow-blue-500/20 transition-shadow duration-500">
                  <Image
                    src="/assets/students/banner.png"
                    alt="Happy student using OLLA platform"
                    width={500}
                    height={420}
                    className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                    priority
                  />

                  {/* Image overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Enhanced Floating Badge */}
                <div className="absolute -top-4 -right-4 z-20 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 shadow-xl rounded-2xl border-2 border-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      <p className="text-xs font-bold text-white">New Enrollments</p>
                    </div>
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-7 h-7 border-2 border-white rounded-full overflow-hidden bg-gray-200 ring-2 ring-green-200">
                          <Image
                            src={`/assets/students/s${i}.jpg`}
                            alt="Student"
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold ring-2 ring-green-200">
                        1k+
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional floating elements */}
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Star className="w-6 h-6 text-white" />
                </div>

                <div className="absolute top-1/4 -left-6 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
                  <Sparkles className="w-4 h-4 text-white" />
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

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, Play, Pause } from 'lucide-react';
import Image from 'next/image';

const TestimonialsCarousel = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // 🎯 LMS-optimized testimonials with more details
  const testimonials = useMemo(() => [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Data Scientist",
      company: "Google",
      avatar: "/assets/images/avatar/avatar-01.jpg",
      rating: 5,
      courseTaken: "AI & Machine Learning Bootcamp",
      timeToJob: "4 months",
      salaryIncrease: "180%",
      feedback: "OLLA's AI bootcamp completely transformed my career! The hands-on projects and mentorship helped me land my dream role at Google. From zero ML knowledge to deploying models in production.",
      achievement: "Landed $160K role at Google",
      beforeRole: "Marketing Coordinator",
      location: "San Francisco, CA"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Senior ML Engineer", 
      company: "Microsoft",
      avatar: "/assets/images/avatar/avatar-02.jpg",
      rating: 5,
      courseTaken: "Advanced Deep Learning",
      timeToJob: "3 months",
      salaryIncrease: "145%",
      feedback: "The curriculum is incredibly practical. Every concept was reinforced with industry projects. The career support team helped me negotiate my Microsoft offer. Best investment I've made!",
      achievement: "Promoted to Senior ML Engineer",
      beforeRole: "Junior Developer",
      location: "Seattle, WA"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "AI Research Lead",
      company: "Netflix", 
      avatar: "/assets/images/avatar/avatar-03.jpg",
      rating: 5,
      courseTaken: "AI Research & Development",
      timeToJob: "5 months",
      salaryIncrease: "200%",
      feedback: "OLLA's research track prepared me for the cutting-edge work at Netflix. The mentorship from industry experts and access to GPU clusters made all the difference.",
      achievement: "Leading Netflix's recommendation AI team",
      beforeRole: "Data Analyst",
      location: "Los Angeles, CA"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Product Manager",
      company: "LinkedIn",
      avatar: "/assets/images/avatar/avatar-04.jpg",
      rating: 5,
      courseTaken: "AI Product Management",
      timeToJob: "6 months",
      salaryIncrease: "120%",
      feedback: "Perfect blend of technical depth and business strategy. OLLA taught me how to bridge the gap between AI teams and business stakeholders. LinkedIn hired me immediately after graduation.",
      achievement: "Managing LinkedIn's AI-powered features",
      beforeRole: "Business Analyst", 
      location: "Mountain View, CA"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "AI Consultant",
      company: "Independent",
      avatar: "/assets/images/avatar/avatar-05.jpg",
      rating: 5,
      courseTaken: "Full-Stack AI Development",
      timeToJob: "2 months",
      salaryIncrease: "250%",
      feedback: "OLLA gave me the confidence to start my own AI consulting firm. The business skills and technical expertise I gained help me serve Fortune 500 clients. Revenue hit $300K in year one!",
      achievement: "$300K+ consulting business in first year",
      beforeRole: "Project Manager",
      location: "Austin, TX"
    }
  ], []);

  // 🚀 Optimized auto-advance with variable timing based on content length
  const getAutoAdvanceDelay = useCallback((testimonial: typeof testimonials[0]) => {
    const baseDelay = 6000; // 6 seconds base
    const wordsCount = testimonial.feedback.split(' ').length;
    const readingTime = Math.max(baseDelay, wordsCount * 80); // ~80ms per word
    return Math.min(readingTime, 10000); // Max 10 seconds
  }, []);

  useEffect(() => {
    if (!isAutoPlay || isPaused) return;

    const currentDelay = getAutoAdvanceDelay(testimonials[currentTestimonial]);
    const timer = setTimeout(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, currentDelay);

    return () => clearTimeout(timer);
  }, [currentTestimonial, isAutoPlay, isPaused, testimonials, getAutoAdvanceDelay]);

  // 🎯 Smooth navigation functions
  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goToTestimonial = useCallback((index: number) => {
    setCurrentTestimonial(index);
  }, []);

  // ⏸️ Pause on hover for better UX
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const currentData = testimonials[currentTestimonial];

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* 🎮 Auto-play Controls */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-sm font-medium text-blue-700"
        >
          {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isAutoPlay ? 'Pause Stories' : 'Play Stories'}
        </button>
      </div>

      {/* 📋 Main Testimonial Card */}
      <div 
        className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 relative overflow-hidden transform transition-all duration-500 hover:shadow-3xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 🎨 Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-50"></div>
        
        {/* 💬 Quote Icon */}
        <div className="absolute top-6 right-6 text-blue-100">
          <Quote className="w-16 h-16" />
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* 👤 Student Profile */}
          <div className="lg:col-span-1 text-center lg:text-left">
            <div className="relative inline-block mb-6">
              <Image 
                src={currentData.avatar} 
                alt={currentData.name}
                width={120}
                height={120}
                className="w-24 h-24 lg:w-30 lg:h-30 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {/* 🏆 Success Badge */}
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                ✨ Success
              </div>
            </div>
            
            <h4 className="font-sora font-bold text-xl text-gray-900 mb-2">
              {currentData.name}
            </h4>
            <p className="text-blue-600 font-semibold mb-1">
              {currentData.role}
            </p>
            <p className="text-gray-600 mb-2">
              {currentData.company} • {currentData.location}
            </p>
            
            {/* ⭐ Rating */}
            <div className="flex justify-center lg:justify-start mb-4">
              {[...Array(currentData.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>

          {/* 💬 Testimonial Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <p className="text-lg lg:text-xl text-gray-700 font-inter leading-relaxed mb-4 italic">
                "{currentData.feedback}"
              </p>
              
              {/* 🎯 Key Achievement */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-4">
                <p className="text-green-700 font-semibold text-lg">
                  🎉 {currentData.achievement}
                </p>
              </div>
            </div>

            {/* 📊 Success Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{currentData.timeToJob}</p>
                <p className="text-xs text-gray-600">Time to Job</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-green-600">+{currentData.salaryIncrease}</p>
                <p className="text-xs text-gray-600">Salary Increase</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg col-span-2">
                <p className="text-sm font-semibold text-purple-600">{currentData.courseTaken}</p>
                <p className="text-xs text-gray-600">Course Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎮 Navigation Controls */}
      <div className="flex items-center justify-between mt-8">
        <button 
          onClick={prevTestimonial}
          className="bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
        </button>
        
        {/* 📍 Dots Navigation with Preview */}
        <div className="flex items-center space-x-3">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              onClick={() => goToTestimonial(index)}
              className={`relative group transition-all duration-300 ${
                index === currentTestimonial 
                  ? 'w-12 h-4 bg-blue-500 rounded-full' 
                  : 'w-4 h-4 bg-gray-300 hover:bg-gray-400 rounded-full'
              }`}
              aria-label={`Go to ${testimonial.name}'s testimonial`}
            >
              {/* 👀 Hover Preview */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {testimonial.name} - {testimonial.company}
              </div>
            </button>
          ))}
        </div>
        
        <button 
          onClick={nextTestimonial}
          className="bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
        </button>
      </div>

      {/* 📈 Progress Indicator */}
      {isAutoPlay && !isPaused && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${((currentTestimonial + 1) / testimonials.length) * 100}%`
              }}
            />
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            {currentTestimonial + 1} of {testimonials.length} success stories
          </p>
        </div>
      )}
    </div>
  );
};

export default TestimonialsCarousel;
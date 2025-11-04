"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const TestimonialsCarousel = () => {
  // 🎯 LMS-optimized testimonials with more details
  const testimonials = useMemo(() => [
    {
      id: 1,
      name: "Mahesh",
      role: "Data Scientist",
      company: "Google",
      avatar: "/assets/students/s1.jpg",
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
      name: "Nikitha Reddy",
      role: "Senior ML Engineer", 
      company: "Microsoft",
      avatar: "/assets/students/s2.jpg",
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
      name: "Narmada Sanki",
      role: "AI Research Lead",
      company: "Netflix", 
      avatar: "/assets/students/s3.jpg",
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
      name: "Rakesh Ganji",
      role: "Product Manager",
      company: "LinkedIn",
      avatar: "/assets/students/s4.jpg",
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
      name: "Raju Vadlamudi",
      role: "AI Consultant",
      company: "Independent",
      avatar: "/assets/students/s5.jpg",
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const currentTestimonial = wrap(0, testimonials.length, currentIndex);

  const goToSlide = useCallback((newIndex: number, newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex(newIndex);
    // Reset auto-slide timer
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex((prev) => wrap(0, testimonials.length, prev + 1));
      setDirection(1);
    }, 5000);
  }, [testimonials.length]);

  const paginate = useCallback((newDirection: number) => {
    const newIndex = wrap(0, testimonials.length, currentIndex + newDirection);
    goToSlide(newIndex, newDirection);
  }, [currentIndex, testimonials.length, goToSlide]);

  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex((prev) => wrap(0, testimonials.length, prev + 1));
      setDirection(1);
    }, 5000);
    
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [testimonials.length]);

  const variants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? '100%' : '-100%',
      scale: 0.95,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      },
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? '100%' : '-100%',
      scale: 0.95,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      },
    }),
  };

  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="relative min-h-[400px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <Image
                src={testimonials[currentTestimonial].avatar}
                alt={testimonials[currentTestimonial].name}
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-full mx-auto"
                priority
                unoptimized
              />
            </div>
            <p className="text-lg lg:text-xl text-gray-700 font-inter leading-relaxed mb-8 italic">
              &ldquo;{testimonials[currentTestimonial].feedback}&rdquo;
            </p>
            <h4 className="font-sora font-bold text-xl text-gray-900 mb-2">
              {testimonials[currentTestimonial].name}
            </h4>
            <p className="text-blue-600 font-semibold">
              {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => paginate(-1)}
        className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600 hover:text-blue-600" />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-6 h-6 text-gray-600 hover:text-blue-600" />
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center space-x-2 mt-8">
        {testimonials.map((_, index) => {
          const isActive = currentTestimonial === index;
          return (
            <button
              key={index}
              onClick={() => goToSlide(index, index > currentTestimonial ? 1 : -1)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-500 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
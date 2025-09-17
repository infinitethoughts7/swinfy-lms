// frontend/components/sections/FeaturedCoursesSlider.tsx
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const featuredCourses = [
  {
    id: 1,
    title: "Complete Python Programming Bootcamp",
    partner: "T-HUB",
    category: "Programming",
    level: "Beginner to Advanced",
    rating: 4.8,
    totalReviews: 1250,
    thumbnail: "/assets/images /default.svg",
    slug: "python-programming-bootcamp"
  },
  {
    id: 2,
    title: "Data Science with Machine Learning",
    partner: "DataMind Institute",
    category: "Data Science",
    level: "Intermediate",
    rating: 4.9,
    totalReviews: 890,
    thumbnail: "/assets/images /default.svg",
    slug: "data-science-machine-learning"
  },
  {
    id: 3,
    title: "Full Stack Web Development",
    partner: "Swinfy",
    category: "Web Development",
    level: "Beginner",
    rating: 4.7,
    totalReviews: 2100,
    thumbnail: "/assets/images /default.svg",
    slug: "full-stack-web-development"
  },
  {
    id: 4,
    title: "Digital Marketing Mastery",
    partner: "Marketing Hub",
    category: "Marketing",
    level: "All Levels",
    rating: 4.6,
    totalReviews: 750,
    thumbnail: "/assets/images /default.svg",
    slug: "digital-marketing-mastery"
  },
  {
    id: 5,
    title: "Cloud Computing with AWS",
    partner: "TSKC",
    category: "Cloud Computing",
    level: "Intermediate",
    rating: 4.8,
    totalReviews: 650,
    thumbnail: "/assets/images /default.svg",
    slug: "cloud-computing-aws"
  },
  {
    id: 6,
    title: "UI/UX Design Fundamentals",
    partner: "T-HUB",
    category: "Design",
    level: "Beginner",
    rating: 4.7,
    totalReviews: 980,
    thumbnail: "/assets/images /default.svg",
    slug: "ui-ux-design-fundamentals"
  }
];

const FeaturedCoursesSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const coursesPerView = 3;
  const maxIndex = Math.max(0, featuredCourses.length - coursesPerView);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? maxIndex : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };


  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Featured Courses</h2>
        
        <div className="relative max-w-7xl mx-auto">
          {/* Slider controls */}
          <button 
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-gray-200"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className={`w-6 h-6 ${currentIndex === 0 ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <button
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-gray-200"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className={`w-6 h-6 ${currentIndex >= maxIndex ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>

          {/* Course cards container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / coursesPerView)}%)` }}
            >
              {featuredCourses.map((course) => (
                <div key={course.id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3">
                  <a 
                    href={`/courses/${course.slug}`}
                    className="block"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md cursor-pointer group">
                      <CardHeader className="p-0">
                        <div className="relative h-40 overflow-hidden rounded-t-lg">
                          <img 
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                              {course.level}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-base font-bold mb-2 text-gray-900 line-clamp-2 leading-tight">
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-blue-600">
                            {course.partner}
                          </span>
                          <span className="text-sm text-gray-800 font-medium">
                            {course.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="flex text-yellow-400">
                              {[...Array(Math.floor(course.rating))].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                              {course.rating % 1 !== 0 && (
                                <Star className="w-3 h-3 fill-current opacity-50" />
                              )}
                            </div>
                            <span className="text-xs text-gray-600 ml-1">
                              {course.rating}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({course.totalReviews})
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-blue-600 scale-110' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSlider;
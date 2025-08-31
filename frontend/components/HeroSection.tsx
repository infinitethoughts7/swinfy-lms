import { Card } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, Award } from 'lucide-react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <>
      <section className="relative overflow-hidden pt-0 pb-8 bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-15">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'url(/assets/images/pattern/01.png)',
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px'
            }}
          ></div>
        </div>
        
        {/* Background Decorative Elements Container */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Top-Right Blue Circle */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20"></div>
          
          {/* Bottom-Left Indigo Circle */}
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20"></div>
        </div>

        {/* Hero Content Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-center">
            {/* Left Column - Text Content */}
            <div className="relative z-20">
              <div className="relative">
                {/* Content */}
                <div className="relative z-10">
                  <h1 className="font-sora font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-text-primary leading-tight mb-4 lg:mb-6">
                    Future Learning.
                    <br />
                    <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 shadow-lg transform rotate-2 hover:rotate-0 hover:scale-110 hover:shadow-2xl transition-all duration-500 ease-out font-bold animate-bounce hover:animate-none hover:-translate-y-1 cursor-pointer relative overflow-hidden mt-2">
                      <span className="relative z-10">Today.</span>
                      {/* Paint brush stroke effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 opacity-90"></div>
                      <div className="absolute -top-3 -left-3 w-6 h-6 bg-green-300 rounded-full opacity-40"></div>
                      <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-emerald-400 rounded-full opacity-50"></div>
                      <div className="absolute top-0 -right-3 w-3 h-3 bg-green-200 rounded-full opacity-30"></div>
                      <div className="absolute -bottom-3 left-1 w-4 h-4 bg-emerald-300 rounded-full opacity-40"></div>
                      <div className="absolute top-2 left-0 w-2 h-2 bg-green-100 rounded-full opacity-20"></div>
                      <div className="absolute -top-1 right-1 w-2 h-2 bg-emerald-200 rounded-full opacity-25"></div>
                    </span>
                  </h1>
              
                  <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-text-secondary font-inter font-normal leading-relaxed mb-6 lg:mb-8 max-w-2xl lg:max-w-3xl">
                    Master AI, Data Science, and Life Skills that power tomorrow&apos;s world.
                  </p>
                  
                  {/* Feature Elements */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mb-6">
                    <div className="flex items-center gap-3 text-sm sm:text-base lg:text-lg text-text-secondary">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold">Learn with experts</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm sm:text-base lg:text-lg text-text-secondary">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold">Get certificate</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm sm:text-base lg:text-lg text-text-secondary">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold">Get membership</span>
                    </div>
                  </div>
                  
                  {/* CTAs - Simple anchor tags for better performance */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 mb-6">
                    <a
                      href="/courses"
                      className="inline-flex items-center justify-center bg-text-primary text-white hover:bg-text-primary/90 font-inter font-semibold text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:ring-4 focus:ring-text-primary/20 active:scale-95 rounded-md"
                    >
                      Start Learning →
                    </a>
                    
                    <a
                      href="/courses"
                      className="inline-flex items-center justify-center border-2 border-text-primary/20 text-text-primary hover:bg-text-primary hover:text-white font-inter font-semibold text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus:ring-4 focus:ring-text-primary/20 active:scale-95 rounded-md"
                    >
                      Browse Courses →
                    </a>
                  </div>
              
                  {/* Stats Section */}
                  <div className="mt-8 lg:mt-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {/* Online Courses */}
                      <Card className='bg-amber-50 border-0 shadow-sm p-4'>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex flex-col">
                            <div className="text-2xl font-bold text-gray-800">21+</div>
                            <div className="text-sm text-gray-600">Online Courses</div>
                          </div>
                        </div>
                      </Card>
                      
                      {/* Expert Tutors */}
                      <Card className='bg-gray-50 border-0 shadow-sm p-4'>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <div className="text-2xl font-bold text-gray-800">19+</div>
                            <div className="text-sm text-gray-600">Expert Tutors</div>
                          </div>
                        </div>
                      </Card>
                      
                      {/* Online Students */}
                      <Card className='bg-purple-50 border-0 shadow-sm p-4'>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex flex-col">
                            <div className="text-2xl font-bold text-gray-800">10K +</div>
                            <div className="text-sm text-gray-600">Online Students</div>
                          </div>
                        </div>
                      </Card>
                      
                      {/* Years Experience */}
                      <Card className='bg-teal-50 border-0 shadow-sm p-4'>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex flex-col">
                            <div className="text-2xl font-bold text-gray-800">15+</div>
                            <div className="text-sm text-gray-600"> Years Experience</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Banner Image with Floating Elements */}
            <div className="block relative z-10 mt-8 lg:mt-0">
              <div className="relative">
                {/* Main Banner Image */}
                <Image 
                  src="/assets/images/banner.png" 
                  alt="LMS Platform Preview"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-2xl"
                  priority
                />
                
                {/* Top-Right Active Students Card */}
                <div className="absolute top-1/2 -right-2 lg:-right-4 transform -translate-y-1/2">
                  <div className="bg-green-600 text-white p-2 sm:p-3 shadow-lg rounded-lg max-w-32 sm:max-w-48">
                    <p className="text-xs sm:text-sm mb-2">Our daily new students</p>
                    <div className="flex -space-x-1 sm:-space-x-2 mb-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white rounded-full overflow-hidden">
                          <Image 
                            src={`/assets/images/avatars/avatar-0${i}.jpg`} 
                            alt={`Student ${i}`}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {/* "1K+" Avatar (Last Element) */}
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-medium">1K+</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom-Right Figma Logo */}
                <div className="absolute -bottom-2 lg:-bottom-4 -right-2 lg:-right-4">
                  <div className="p-2 sm:p-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg">
                    <Image 
                      src="/assets/images/logos/figma.svg" 
                      alt="Figma" 
                      width={32}
                      height={32}
                      className="w-6 h-6 sm:w-8 sm:h-8" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;

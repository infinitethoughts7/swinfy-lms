import  { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Data Scientist",
      company: "Google",
      avatar: "/src/assets/images/avatar/avatar-01.jpg",
      rating: 5,
      feedback: "OLLA transformed my career! The AI and Data Science courses were incredibly comprehensive. I went from knowing nothing to landing my dream job at Google within 6 months. The instructors are world-class experts who truly care about your success.",
      achievement: "Hired by Google as Senior Data Scientist"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Machine Learning Engineer",
      company: "Microsoft",
      avatar: "/src/assets/images/avatar/avatar-02.jpg",
      rating: 5,
      feedback: "The practical approach to learning at OLLA is unmatched. Every concept was reinforced with real-world projects. The community support and mentorship helped me build confidence and skills that directly led to my role at Microsoft.",
      achievement: "Secured position at Microsoft as ML Engineer"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "AI Research Lead",
      company: "Netflix",
      avatar: "/src/assets/images/avatar/avatar-03.jpg",
      rating: 5,
      feedback: "OLLA's curriculum is cutting-edge and industry-relevant. The hands-on projects and industry connections opened doors I never thought possible. Now I'm leading AI research at Netflix, and I owe it all to OLLA!",
      achievement: "Leading AI Research at Netflix"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Software Engineer",
      company: "LinkedIn",
      avatar: "/src/assets/images/avatar/avatar-04.jpg",
      rating: 5,
      feedback: "The life skills courses at OLLA were just as valuable as the technical ones. Learning communication, leadership, and problem-solving alongside coding made me a well-rounded professional. LinkedIn recognized this immediately.",
      achievement: "Joined LinkedIn as Senior Software Engineer"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "Product Manager",
      company: "Mastercard",
      avatar: "/src/assets/images/avatar/avatar-05.jpg",
      rating: 5,
      feedback: "OLLA's holistic approach to education is revolutionary. They don't just teach you skills; they teach you how to think strategically and lead teams. This mindset shift propelled me into product management at Mastercard.",
      achievement: "Promoted to Product Manager at Mastercard"
    }
  ];

  const clientTestimonials = [
    {
      company: "Google",
      logo: "/src/assets/client/google.svg",
      feedback: "OLLA graduates consistently demonstrate exceptional technical skills and innovative thinking. They're our go-to source for top AI and ML talent."
    },
    {
      company: "Microsoft",
      logo: "/src/assets/client/microsoft.svg",
      feedback: "The quality of OLLA learners is outstanding. They bring both technical expertise and strong problem-solving abilities to our teams."
    },
    {
      company: "Netflix",
      logo: "/src/assets/client/netflix.svg",
      feedback: "OLLA's focus on practical skills and real-world applications produces candidates who can hit the ground running."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="font-sora font-bold text-3xl sm:text-4xl lg:text-5xl text-text-primary mb-6">
            What Our Community Says
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary font-inter max-w-3xl mx-auto">
            Discover how OLLA has transformed careers and empowered learners worldwide
          </p>
        </div>

        {/* Main Testimonials Carousel */}
        <div className="mb-20 lg:mb-24">
          <div className="relative max-w-4xl mx-auto">
            {/* Testimonial Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 relative overflow-hidden">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-green-100">
                <Quote className="w-16 h-16" />
              </div>
              
              {/* Testimonial Content */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-lg lg:text-xl text-text-secondary font-inter leading-relaxed mb-8 italic">
                  "{testimonials[currentTestimonial].feedback}"
                </p>
                
                <div className="flex items-center justify-center space-x-4">
                  <img 
                    src={testimonials[currentTestimonial].avatar} 
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="text-left">
                    <h4 className="font-sora font-bold text-lg text-text-primary">
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className="text-text-secondary font-inter">
                      {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                    </p>
                    <p className="text-green-600 font-semibold text-sm">
                      {testimonials[currentTestimonial].achievement}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-text-primary" />
            </button>
            
            <button 
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-text-primary" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-green-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>


        {/* Client Testimonials */}
        <div>
          <h3 className="font-sora font-bold text-2xl sm:text-3xl text-text-primary text-center mb-12">
            What Our Clients Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {clientTestimonials.map((client, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="flex justify-center mb-6">
                  <img 
                    src={client.logo} 
                    alt={`${client.company} Logo`}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <h4 className="font-sora font-bold text-xl text-text-primary mb-4">
                  {client.company}
                </h4>
                <p className="text-text-secondary font-inter leading-relaxed">
                  "{client.feedback}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* View All Reviews CTA */}
        <div className="text-center mt-16 lg:mt-20">
          <button className="bg-text-primary text-white px-8 py-4 rounded-lg font-inter font-semibold text-lg hover:bg-text-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            View All Reviews & Testimonials
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

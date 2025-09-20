'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  FileText, 
  Phone, 
  CheckCircle, 
  Users, 
  BarChart3, 
  BookOpen, 
  Shield,
  ArrowRight,
  Star,
  X
} from 'lucide-react';
import ContactForm from '../shared/ContactForm';

const KnowledgePartnerSection = () => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate steps one by one
          const steps = [0, 1, 2, 3];
          steps.forEach((step, index) => {
            setTimeout(() => {
              setVisibleSteps(prev => [...prev, step]);
            }, index * 500);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: 1,
      title: 'Submit Application',
      description: 'Fill out the form with your organization details',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      number: 2,
      title: 'Application Review',
      description: 'Our team reviews your application and organization details',
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      number: 3,
      title: 'Phone Interview',
      description: 'We\'ll call you to discuss your goals and answer questions',
      icon: Phone,
      color: 'bg-purple-500',
    },
    {
      number: 4,
      title: 'Get Access',
      description: 'Receive login credentials and access your dashboard',
      icon: CheckCircle,
      color: 'bg-orange-500',
    },
  ];

  const benefits = [
    {
      icon: Users,
      title: 'Reach more learners',
      description: 'Expand your audience and impact'
    },
    {
      icon: BarChart3,
      title: 'Track progress easily',
      description: 'Monitor learner engagement and success'
    },
    {
      icon: BookOpen,
      title: 'Flexible course types',
      description: 'Create various learning experiences'
    },
    {
      icon: Shield,
      title: 'Professional platform',
      description: 'Built for serious education providers'
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-2" />
            Knowledge Partner Program
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Become a Knowledge Partner
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our network of educational institutions and organizations to deliver 
            high-quality courses to learners worldwide.
          </p>
        </div>

        {/* Why Apply Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Apply?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h4>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Application Process
          </h3>
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-orange-200"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`relative ${
                    visibleSteps.includes(index) 
                      ? 'animate-fade-in-up opacity-100' 
                      : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 500}ms` }}
                >
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center relative z-10">
                    {/* Step Number */}
                    <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 relative`}>
                      <step.icon className="w-8 h-8 text-white" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold text-gray-900">{step.number}</span>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h4>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button 
            onClick={() => setShowApplicationForm(true)}
            className="group inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            Apply for Knowledge Partner
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <p className="text-gray-500 text-sm mt-4">
            Join hundreds of organizations already using our platform
          </p>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold mb-2">Apply as Knowledge Partner</h3>
                  <p className="text-blue-100 text-lg">Join our network of educational institutions</p>
                </div>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default KnowledgePartnerSection;

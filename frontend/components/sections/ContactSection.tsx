// File: components/ContactSection.tsx (Server Component)
import { Phone, Mail, Building2, Clock, Award, Target, TrendingUp, Shield } from 'lucide-react';
import ContactForm from '../shared/ContactForm';

const ContactSection = () => {
  const benefits = [
    {
      icon: Building2,
      title: "Create & Manage Courses",
      description: "Build your own curriculum and manage student enrollments"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Track student progress and course performance metrics"
    },
    {
      icon: Target,
      title: "Public & Private Courses",
      description: "Offer courses to everyone or keep them exclusive to your organization"
    },
    {
      icon: Shield,
      title: "Trusted Platform",
      description: "Secure, reliable infrastructure with 24/7 support"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-text-primary to-blue-800 text-white py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-sora font-bold text-3xl sm:text-4xl lg:text-5xl mb-6">
            Become a Knowledge Partner
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 font-inter max-w-3xl mx-auto leading-relaxed">
            Join our platform and transform how you deliver education. Share your expertise, 
            reach more learners, and grow your educational impact.
          </p>
        </div>

        {/* Partner Benefits Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-sora font-bold text-center mb-8">
            Why Partner With Us?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-sora font-semibold text-lg mb-2">{benefit.title}</h4>
                <p className="text-blue-100 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form - Full Width Horizontal */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 mb-12">
            <div className="text-center mb-8">
              <h3 className="font-sora font-bold text-2xl lg:text-3xl mb-4">
                Apply as Knowledge Partner
              </h3>
              <p className="text-blue-100 text-lg">
                Fill out the application below. We&apos;ll review and call you within 24-48 hours.
              </p>
            </div>
            
            {/* Contact Form Component - Client Component */}
            <ContactForm />
          </div>
        </div>

        {/* Contact Information & Process */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Contact Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h4 className="font-sora font-bold text-xl mb-6 text-center">
                Prefer Direct Contact?
              </h4>
              
              <div className="space-y-4">
                <a 
                  href="tel:+917981313783"
                  className="flex items-center space-x-4 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-sora font-semibold text-sm text-blue-100">Phone</h5>
                    <p className="font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                      +91 7981313783
                    </p>
                  </div>
                </a>

                <a 
                  href="mailto:rockyg.swinfy@gmail.com?subject=Knowledge Partner Application"
                  className="flex items-center space-x-4 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-sora font-semibold text-sm text-blue-100">Email</h5>
                    <p className="font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                      rockyg.swinfy@gmail.com
                    </p>
                  </div>
                </a>
              </div>

              <div className="mt-6 p-4 bg-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-white mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Business Hours</span>
                </div>
                <p className="text-blue-100 text-sm">Mon-Fri: 9:00 AM - 6:00 PM IST</p>
                <p className="text-blue-100 text-sm">We&apos;ll call you within 24-48 hours</p>
              </div>
            </div>

            {/* Application Process */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h4 className="font-sora font-bold text-xl mb-6 text-center">
                Application Process
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">Submit Application</h5>
                    <p className="text-blue-100 text-sm">Fill out the form with your organization details</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">Application Review</h5>
                    <p className="text-blue-100 text-sm">Our team reviews your application and organization details</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">Phone Interview</h5>
                    <p className="text-blue-100 text-sm">We&apos;ll call you to discuss your goals and answer questions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">Get Access</h5>
                    <p className="text-blue-100 text-sm">Receive login credentials and access your dashboard</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h6 className="text-white font-semibold text-sm mb-2">Why Apply?</h6>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-100">
                  <div>• Reach more learners</div>
                  <div>• Track progress easily</div>
                  <div>• Flexible course types</div>
                  <div>• Professional platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto">
            <h4 className="font-sora font-bold text-xl mb-3">
              Ready to Transform Education?
            </h4>
            <p className="text-blue-100 mb-6">
              Join successful knowledge partners who are already making an impact through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:rockyg.swinfy@gmail.com?subject=Knowledge Partner Application&body=Hi,%0D%0A%0D%0AI would like to apply as a Knowledge Partner for our organization.%0D%0A%0D%0APlease find our details:%0D%0AOrganization: %0D%0AWebsite: %0D%0AContact: %0D%0A%0D%0AThank you!"
                className="inline-flex items-center gap-2 bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Email Us Directly
              </a>
              <a 
                href="tel:+917981313783"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-800 transition-all duration-300 hover:scale-105"
              >
                <Phone className="w-5 h-5" />
                Call Us Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
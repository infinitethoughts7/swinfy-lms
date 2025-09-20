// File: components/ContactSection.tsx (Server Component)
import { Phone, Mail, Clock } from 'lucide-react';

const ContactSection = () => {

  return (
    <section className="bg-gradient-to-br from-text-primary to-blue-800 text-white py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-sora font-bold text-3xl sm:text-4xl lg:text-5xl mb-6">
            Contact Us
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 font-inter max-w-3xl mx-auto leading-relaxed">
            Get in touch with us for any questions or support. We&apos;re here to help!
          </p>
        </div>

        {/* Contact Information */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12">
            <h3 className="font-sora font-bold text-2xl lg:text-3xl mb-8 text-center">
              Prefer Direct Contact?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Phone Contact */}
              <a 
                href="tel:+917981313783"
                className="flex items-center space-x-6 p-6 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-sora font-semibold text-lg text-blue-100 mb-2">Phone</h4>
                  <p className="font-bold text-white text-xl group-hover:text-blue-200 transition-colors duration-300">
                    +91 7981313783
                  </p>
                  <p className="text-blue-100 text-sm mt-1">Call us anytime</p>
                </div>
              </a>

              {/* Email Contact */}
              <a 
                href="mailto:rockyg.swinfy@gmail.com?subject=Knowledge Partner Application"
                className="flex items-center space-x-6 p-6 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-sora font-semibold text-lg text-blue-100 mb-2">Email</h4>
                  <p className="font-bold text-white text-lg group-hover:text-blue-200 transition-colors duration-300">
                    rockyg.swinfy@gmail.com
                  </p>
                  <p className="text-blue-100 text-sm mt-1">Send us an email</p>
                </div>
              </a>
            </div>

            {/* Business Hours */}
            <div className="mt-8 p-6 bg-blue-500/20 rounded-xl">
              <div className="flex items-center gap-3 text-white mb-4">
                <Clock className="w-6 h-6" />
                <h4 className="font-sora font-bold text-xl">Business Hours</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
                <div>
                  <p className="font-semibold">Monday - Friday</p>
                  <p className="text-sm">9:00 AM - 6:00 PM IST</p>
                </div>
                <div>
                  <p className="font-semibold">Response Time</p>
                  <p className="text-sm">We&apos;ll call you within 24-48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
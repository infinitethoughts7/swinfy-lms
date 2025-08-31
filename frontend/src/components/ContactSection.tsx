import React from 'react';
import { Phone, Mail, Globe, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

const ContactSection = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: Mail,
      title: "Email",
      value: "hello@olla.com",
      link: "mailto:hello@olla.com"
    },
    {
      icon: Globe,
      title: "Website",
      value: "www.olla.com",
      link: "https://www.olla.com"
    }
  ];

  const quickInfo = [
    {
      icon: MapPin,
      text: "123 Innovation Drive, Tech City, TC 12345"
    },
    {
      icon: Clock,
      text: "Mon-Fri: 9:00 AM - 6:00 PM EST"
    },
    {
      icon: MessageCircle,
      text: "Live Chat: 24/7 Available"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-text-primary to-blue-800 text-white py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="font-sora font-bold text-2xl sm:text-3xl lg:text-4xl mb-4">
            Contact Us
          </h2>
          <p className="text-base sm:text-lg text-blue-100 font-inter max-w-2xl mx-auto">
            Get in touch with our team. We're here to help you on your learning journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Form & Info Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 lg:p-8">
              <h3 className="font-sora font-bold text-xl lg:text-2xl mb-6 text-center">
                Send us a Message
              </h3>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                  />
                </div>
                
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                />
                
                <select className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300">
                  <option value="" className="bg-blue-800 text-white">Select Inquiry Type</option>
                  <option value="courses" className="bg-blue-800 text-white">Course Information</option>
                  <option value="support" className="bg-blue-800 text-white">Technical Support</option>
                  <option value="partnership" className="bg-blue-800 text-white">Partnership</option>
                  <option value="other" className="bg-blue-800 text-white">Other</option>
                </select>
                
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300 resize-none"
                ></textarea>
                
                <button
                  type="submit"
                  className="w-full bg-white text-text-primary py-3 px-6 rounded-lg font-inter font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Main Contact Methods */}
              <div className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <a 
                    key={index}
                    href={contact.link}
                    className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <contact.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-sora font-semibold text-sm text-blue-100">
                        {contact.title}
                      </h4>
                      <p className="font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                        {contact.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Quick Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-sora font-semibold text-lg mb-4 text-center">
                  Quick Info
                </h4>
                <div className="space-y-3">
                  {quickInfo.map((info, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <info.icon className="w-4 h-4 text-blue-200 flex-shrink-0" />
                      <span className="text-blue-100">{info.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-white/20 text-white py-3 px-6 rounded-lg font-inter font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/30">
                  Start Live Chat
                </button>
                <button className="w-full border-2 border-white text-white py-3 px-6 rounded-lg font-inter font-semibold hover:bg-white hover:text-text-primary transition-all duration-300 hover:scale-105">
                  Schedule a Call
                </button>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center mt-8">
            <p className="text-blue-100 text-sm mb-4">
              Follow us on social media
            </p>
            <div className="flex justify-center space-x-4">
              {['f', 'in', 't', 'yt'].map((platform, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                >
                  <span className="text-white font-bold text-sm">{platform}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

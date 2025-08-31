"use client";

import { useState } from 'react';
import { Send } from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    inquiryType: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    // You can add API call here later
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
        />
      </div>
      
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
      />
      
      <select 
        name="inquiryType"
        value={formData.inquiryType}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
      >
        <option value="" className="bg-blue-800 text-white">Select Inquiry Type</option>
        <option value="courses" className="bg-blue-800 text-white">Course Information</option>
        <option value="support" className="bg-blue-800 text-white">Technical Support</option>
        <option value="partnership" className="bg-blue-800 text-white">Partnership</option>
        <option value="other" className="bg-blue-800 text-white">Other</option>
      </select>
      
      <textarea
        name="message"
        placeholder="Your Message"
        rows={4}
        value={formData.message}
        onChange={handleChange}
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
  );
};

export default ContactForm;

// File: components/shared/ContactForm.tsx (Client Component)
"use client";
import { useState } from 'react';
import { Send, Building2, Clock } from 'lucide-react';

interface FormData {
  organizationName: string;
  organizationType: string;
  organizationEmail: string;
  contactNumber: string;
  websiteUrl: string;
  coursesInterestedIn: string;
  experienceYears: string;
  expectedTutors: string;
  partnerMessage: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    organizationType: '',
    organizationEmail: '',
    contactNumber: '',
    websiteUrl: '',
    coursesInterestedIn: '',
    experienceYears: '',
    expectedTutors: '',
    partnerMessage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const KP_TYPE_CHOICES = [
    { value: 'company', label: 'Company' },
    { value: 'university', label: 'University' },
    { value: 'institute', label: 'Institute' },
    { value: 'bootcamp', label: 'Bootcamp' },
    { value: 'other', label: 'Other' }
  ];

  const COURSE_CATEGORIES = [
    'AI & Machine Learning',
    'Programming & Development',
    'Data Science & Analytics',
    'Cybersecurity',
    'Cloud Computing',
    'Digital Marketing',
    'Soft Skills',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/knowledge-partner-application', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Knowledge Partner Application submitted:', formData);
      alert('Application submitted successfully! We will call you within 24-48 hours.');
      
      // Reset form
      setFormData({
        organizationName: '',
        organizationType: '',
        organizationEmail: '',
        contactNumber: '',
        websiteUrl: '',
        coursesInterestedIn: '',
        experienceYears: '',
        expectedTutors: '',
        partnerMessage: ''
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Process Info Header */}
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Knowledge Partner Application
        </h4>
        <p className="text-white/80 text-sm leading-relaxed mb-3">
          Join our platform as a Knowledge Partner! Fill out the application below and we&apos;ll call you within 24-48 hours to discuss the partnership.
        </p>
        <div className="bg-blue-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-white">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Next Steps:</span>
          </div>
          <ul className="text-sm text-white/90 mt-1 ml-6 space-y-1">
            <li>• Submit this application</li>
            <li>• We&apos;ll review and call you within 24-48 hours</li>
            <li>• After approval, receive login credentials via email</li>
            <li>• Access your Knowledge Partner dashboard</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Organization Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="text-white font-medium text-sm border-b border-white/20 pb-2">
              Organization Details
            </h5>
            
            <input
              type="text"
              name="organizationName"
              placeholder="Organization Name *"
              value={formData.organizationName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select 
                name="organizationType"
                value={formData.organizationType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
              >
                <option value="" className="bg-blue-800 text-white">Organization Type *</option>
                {KP_TYPE_CHOICES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-blue-800 text-white">
                    {type.label}
                  </option>
                ))}
              </select>

              <input
                type="url"
                name="websiteUrl"
                placeholder="Website URL *"
                value={formData.websiteUrl}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-white font-medium text-sm border-b border-white/20 pb-2">
              Contact Information
            </h5>
            
            <input
              type="email"
              name="organizationEmail"
              placeholder="Official Email Address *"
              value={formData.organizationEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
            />

            <input
              type="tel"
              name="contactNumber"
              placeholder="Contact Number (for callback) *"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
            />
            
            <div className="text-xs text-white/60 bg-white/10 p-2 rounded">
              📞 <strong>Important:</strong> We&apos;ll call this number within 24-48 hours for verification
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="space-y-4 bg-white/5 rounded-lg p-6">
          <h5 className="text-white font-medium text-sm border-b border-white/20 pb-2">
            Quick Questions
          </h5>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <select 
              name="coursesInterestedIn"
              value={formData.coursesInterestedIn}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
            >
              <option value="" className="bg-blue-800 text-white">Primary course category *</option>
              {COURSE_CATEGORIES.map((category) => (
                <option key={category} value={category} className="bg-blue-800 text-white">
                  {category}
                </option>
              ))}
            </select>

            <select 
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
            >
              <option value="" className="bg-blue-800 text-white">Years in education/training *</option>
              <option value="0-1" className="bg-blue-800 text-white">0-1 years</option>
              <option value="2-5" className="bg-blue-800 text-white">2-5 years</option>
              <option value="6-10" className="bg-blue-800 text-white">6-10 years</option>
              <option value="10+" className="bg-blue-800 text-white">10+ years</option>
            </select>

            <select 
              name="expectedTutors"
              value={formData.expectedTutors}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300"
            >
              <option value="" className="bg-blue-800 text-white">Expected tutors *</option>
              <option value="1-2" className="bg-blue-800 text-white">1-2 tutors</option>
              <option value="3-5" className="bg-blue-800 text-white">3-5 tutors</option>
              <option value="6-10" className="bg-blue-800 text-white">6-10 tutors</option>
              <option value="10+" className="bg-blue-800 text-white">10+ tutors</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <textarea
            name="partnerMessage"
            placeholder="Tell us more about your organization and goals... (optional)"
            rows={4}
            value={formData.partnerMessage}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300 resize-none"
          ></textarea>
          <div className="text-white/60 text-xs">
            <p>💡 <strong>Optional:</strong> Share any specific requirements, goals, or questions you have</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-blue-800 py-4 px-8 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
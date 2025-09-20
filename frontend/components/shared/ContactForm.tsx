// File: components/shared/ContactForm.tsx (Client Component)
"use client";
import { useEffect, useState } from 'react';
import { Send, Building2, Clock } from 'lucide-react';

interface FormData {
  knowledge_partner_name: string;
  knowledge_partner_type: string;
  knowledge_partner_email: string;
  contact_number: string;
  website_url: string;
  courses_interested_in: string;
  experience_years: string;
  expected_tutors: string;
  partner_message: string;
}

interface ApiError {
  [key: string]: string[];
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    knowledge_partner_name: '',
    knowledge_partner_type: '',
    knowledge_partner_email: '',
    contact_number: '',
    website_url: '',
    courses_interested_in: '',
    experience_years: '',
    expected_tutors: '',
    partner_message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ApiError>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load previously saved details for auto-fill (dev UX)
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kpApplicationForm') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic shape guard
        if (parsed && typeof parsed === 'object') {
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const KP_TYPE_CHOICES = [
    { value: 'company', label: 'Company' },
    { value: 'organization', label: 'Organization' },
    { value: 'university', label: 'University' },
    { value: 'institute', label: 'Institute' },
    { value: 'bootcamp', label: 'Bootcamp' },
    { value: 'other', label: 'Other' }
  ];

  const COURSE_CATEGORIES = [
    { value: 'ai_ml', label: 'AI & Machine Learning' },
    { value: 'programming', label: 'Programming & Development' },
    { value: 'data_science', label: 'Data Science & Analytics' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'cloud_computing', label: 'Cloud Computing' },
    { value: 'digital_marketing', label: 'Digital Marketing' },
    { value: 'soft_skills', label: 'Soft Skills' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    // Persist as-you-type to enable auto-fill next time
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('kpApplicationForm', JSON.stringify(next));
      }
    } catch {
      // ignore storage errors
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/auth/knowledge-partner/apply/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubmitSuccess(true);
        // Keep localStorage so subsequent visits can be auto-filled.
        // Optionally clear in-memory form for a clean confirmation screen.
        setFormData(prev => ({ ...prev }));
        
        // Show success message for 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
        
      } else {
        // Handle validation errors
        if (data.errors || response.status === 400) {
          setErrors(data.errors || data);
        } else {
          alert('Error: ' + (data.message || 'Something went wrong'));
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message if submission was successful
  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-2xl mb-4">✅</div>
          <h4 className="text-green-800 font-semibold text-lg mb-2">
            Application Submitted Successfully!
          </h4>
          <p className="text-green-700 text-sm mb-4">
            Thank you for applying to become a Knowledge Partner. We have received your application and will review it within 24-48 hours.
          </p>
          <div className="bg-green-100 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              📞 <strong>Next Steps:</strong> We&apos;ll call you at {formData.contact_number} to discuss the partnership opportunity.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setSubmitSuccess(false)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Process Info Header - Only show in modal context */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-800 mb-3">
          <Building2 className="w-5 h-5" />
          <span className="font-semibold text-lg">Application Process</span>
        </div>
        <div className="bg-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Next Steps:</span>
          </div>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• Submit this application</li>
            <li>• We&apos;ll review and call you within 24-48 hours</li>
            <li>• After approval, receive login credentials via email</li>
            <li>• Access your Knowledge Partner dashboard</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Knowledge Partner Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="text-gray-800 font-medium text-sm border-b border-gray-200 pb-2">
              Knowledge Partner Details
            </h5>
            
            <div>
              <input
                type="text"
                name="knowledge_partner_name"
                placeholder="Knowledge Partner Name *"
                value={formData.knowledge_partner_name}
                autoComplete="organization"
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                  errors.knowledge_partner_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.knowledge_partner_name && (
                <p className="mt-1 text-sm text-red-500">{errors.knowledge_partner_name[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <select 
                  name="knowledge_partner_type"
                  value={formData.knowledge_partner_type}
                  onChange={handleChange}
                  required
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                  errors.knowledge_partner_type ? 'border-red-500' : 'border-gray-300'
                }`}
                >
                  <option value="" className="bg-gray-100 text-gray-500">Knowledge Partner Type *</option>
                  {KP_TYPE_CHOICES.map((type) => (
                    <option key={type.value} value={type.value} className="bg-white text-gray-900">
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.knowledge_partner_type && (
                  <p className="mt-1 text-sm text-red-500">{errors.knowledge_partner_type[0]}</p>
                )}
              </div>

              <div>
                <input
                  type="url"
                  name="website_url"
                  placeholder="Website URL *"
                  value={formData.website_url}
                  autoComplete="url"
                  onChange={handleChange}
                  required
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                  errors.website_url ? 'border-red-500' : 'border-gray-300'
                }`}
                />
                {errors.website_url && (
                  <p className="mt-1 text-sm text-red-500">{errors.website_url[0]}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-gray-800 font-medium text-sm border-b border-gray-200 pb-2">
              Contact Information
            </h5>
            
            <div>
              <input
                type="email"
                name="knowledge_partner_email"
                placeholder="Official Email Address *"
                value={formData.knowledge_partner_email}
                autoComplete="email"
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                  errors.knowledge_partner_email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.knowledge_partner_email && (
                <p className="mt-1 text-sm text-red-500">{errors.knowledge_partner_email[0]}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                name="contact_number"
                placeholder="Contact Number (for callback) *"
                value={formData.contact_number}
                autoComplete="tel"
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                  errors.contact_number ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contact_number && (
                <p className="mt-1 text-sm text-red-500">{errors.contact_number[0]}</p>
              )}
            </div>
            
            <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
              📞 <strong>Important:</strong> We&apos;ll call this number within 24-48 hours for verification
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="space-y-4 bg-gray-50 rounded-lg p-6">
          <h5 className="text-gray-800 font-medium text-sm border-b border-gray-200 pb-2">
            Quick Questions
          </h5>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <select 
                name="courses_interested_in"
                value={formData.courses_interested_in}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                  errors.courses_interested_in ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="" className="bg-gray-100 text-gray-500">Primary course category *</option>
                {COURSE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value} className="bg-white text-gray-900">
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.courses_interested_in && (
                <p className="mt-1 text-sm text-red-500">{errors.courses_interested_in[0]}</p>
              )}
            </div>

            <div>
              <select 
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                  errors.experience_years ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="" className="bg-gray-100 text-gray-500">Years in education/training *</option>
                <option value="0-1" className="bg-white text-gray-900">0-1 years</option>
                <option value="2-5" className="bg-white text-gray-900">2-5 years</option>
                <option value="6-10" className="bg-white text-gray-900">6-10 years</option>
                <option value="10+" className="bg-white text-gray-900">10+ years</option>
              </select>
              {errors.experience_years && (
                <p className="mt-1 text-sm text-red-500">{errors.experience_years[0]}</p>
              )}
            </div>

            <div>
              <select 
                name="expected_tutors"
                value={formData.expected_tutors}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                  errors.expected_tutors ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="" className="bg-gray-100 text-gray-500">Expected tutors *</option>
                <option value="1-2" className="bg-white text-gray-900">1-2 tutors</option>
                <option value="3-5" className="bg-white text-gray-900">3-5 tutors</option>
                <option value="6-10" className="bg-white text-gray-900">6-10 tutors</option>
                <option value="10+" className="bg-white text-gray-900">10+ tutors</option>
              </select>
              {errors.expected_tutors && (
                <p className="mt-1 text-sm text-red-500">{errors.expected_tutors[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <textarea
            name="partner_message"
            placeholder="Tell us more about your organization and goals... (optional)"
            rows={4}
            value={formData.partner_message}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none ${
              errors.partner_message ? 'border-red-500' : 'border-gray-300'
            }`}
          ></textarea>
          {errors.partner_message && (
            <p className="mt-1 text-sm text-red-500">{errors.partner_message[0]}</p>
          )}
          <div className="text-gray-600 text-xs">
            <p>💡 <strong>Optional:</strong> Share any specific requirements, goals, or questions you have</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px] shadow-lg hover:shadow-xl"
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

      {/* Contact Fallback */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-gray-800 font-semibold mb-3 text-center">
          Need Help?
        </h4>
        <div className="flex justify-center space-x-6">
          <a 
            href="mailto:rockyg.swinfy@gmail.com?subject=Knowledge Partner Application"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span>📧</span>
            rockyg.swinfy@gmail.com
          </a>
          <a 
            href="tel:+917981313783"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span>📞</span>
            +91 7981313783
          </a>
        </div>
        <div className="text-xs text-gray-500 text-center mt-2">
          📞 <strong>We&apos;ll call you within 24-48 hours</strong> after form submission
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
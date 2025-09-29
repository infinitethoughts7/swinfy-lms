// File: components/shared/ContactForm.tsx (Client Component)
"use client";
import { useEffect, useState } from 'react';
import { Send, Building2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import OTPVerification from './OTPVerification';

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
  
  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOTPSection, setShowOTPSection] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');

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

  // OTP API methods for contact form (doesn't require existing user)
  const sendOTPForEmail = async (email: string): Promise<void> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/auth/send-contact-form-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email,
        purpose: 'email_verification'
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }
  };

  const verifyOTPForEmail = async (email: string, otpCode: string): Promise<void> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-contact-form-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email,
        otp_code: otpCode,
        purpose: 'email_verification'
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    
    // Reset email verification if email changed
    if (name === 'knowledge_partner_email' && value !== formData.knowledge_partner_email) {
      setIsEmailVerified(false);
      setShowOTPSection(false);
      setEmailVerificationError('');
    }
    
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

  const handleEmailVerified = () => {
    setIsEmailVerified(true);
    setShowOTPSection(false);
    setEmailVerificationError('');
  };

  const handleSendOTP = () => {
    if (formData.knowledge_partner_email) {
      setShowOTPSection(true);
      setEmailVerificationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if email is verified before allowing submission
    if (!isEmailVerified) {
      setEmailVerificationError('Please verify your email address before submitting the application.');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    setEmailVerificationError('');
    
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
    <div className="space-y-4">
      {/* Compact Process Info Header */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
          <Building2 className="w-4 h-4" />
          <span className="font-medium text-sm">Quick Application Process</span>
        </div>
        <p className="text-xs text-blue-600">
          📧 Verify email → Submit application → Get callback within 24-48 hours → Receive dashboard access
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Compact Knowledge Partner Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h5 className="text-gray-800 font-medium text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Organization Details
          </h5>
            
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                name="knowledge_partner_name"
                placeholder="Organization Name *"
                value={formData.knowledge_partner_name}
                autoComplete="organization"
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.knowledge_partner_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.knowledge_partner_name && (
                <p className="mt-1 text-xs text-red-500">{errors.knowledge_partner_name[0]}</p>
              )}
            </div>

            <div>
              <select 
                name="knowledge_partner_type"
                value={formData.knowledge_partner_type}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.knowledge_partner_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Organization Type *</option>
                {KP_TYPE_CHOICES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.knowledge_partner_type && (
                <p className="mt-1 text-xs text-red-500">{errors.knowledge_partner_type[0]}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="url"
              name="website_url"
              placeholder="Official Website URL *"
              value={formData.website_url}
              autoComplete="url"
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                errors.website_url ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.website_url && (
              <p className="mt-1 text-xs text-red-500">{errors.website_url[0]}</p>
            )}
          </div>
        </div>

        {/* Email Verification Section */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h5 className="text-gray-800 font-medium text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact & Verification
          </h5>
            
          <div className="space-y-3">
            <div className="relative">
              <input
                type="email"
                name="knowledge_partner_email"
                placeholder="Official Email Address *"
                value={formData.knowledge_partner_email}
                autoComplete="email"
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.knowledge_partner_email ? 'border-red-500' : 'border-gray-300'
                } ${isEmailVerified ? 'border-green-500 bg-green-50' : ''}`}
              />
              {isEmailVerified && (
                <div className="absolute right-3 top-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
              {errors.knowledge_partner_email && (
                <p className="mt-1 text-xs text-red-500">{errors.knowledge_partner_email[0]}</p>
              )}
            </div>

            {/* Email Verification Status */}
            {!isEmailVerified && formData.knowledge_partner_email && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Send verification code
                </button>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Email verification required
                </span>
              </div>
            )}

            {isEmailVerified && (
              <div className="flex items-center gap-2 text-green-600 text-xs">
                <CheckCircle className="w-3 h-3" />
                <span>Email verified successfully</span>
              </div>
            )}

            {/* OTP Verification Component */}
            {showOTPSection && (
              <div className="bg-white rounded-md border border-blue-200 p-3">
                <OTPVerification
                  email={formData.knowledge_partner_email}
                  onVerified={handleEmailVerified}
                  onSendOTP={sendOTPForEmail}
                  onVerifyOTP={verifyOTPForEmail}
                  isVerified={isEmailVerified}
                />
              </div>
            )}

            <div>
              <input
                type="tel"
                name="contact_number"
                placeholder="Contact Number (for callback) *"
                value={formData.contact_number}
                autoComplete="tel"
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.contact_number ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contact_number && (
                <p className="mt-1 text-xs text-red-500">{errors.contact_number[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h5 className="text-gray-800 font-medium text-sm">
            Quick Questions
          </h5>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <select 
                name="courses_interested_in"
                value={formData.courses_interested_in}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.courses_interested_in ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Course category *</option>
                {COURSE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.courses_interested_in && (
                <p className="mt-1 text-xs text-red-500">{errors.courses_interested_in[0]}</p>
              )}
            </div>

            <div>
              <select 
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.experience_years ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Experience *</option>
                <option value="0-1">0-1 years</option>
                <option value="2-5">2-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>
              {errors.experience_years && (
                <p className="mt-1 text-xs text-red-500">{errors.experience_years[0]}</p>
              )}
            </div>

            <div>
              <select 
                name="expected_tutors"
                value={formData.expected_tutors}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.expected_tutors ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Expected tutors *</option>
                <option value="1-2">1-2 tutors</option>
                <option value="3-5">3-5 tutors</option>
                <option value="6-10">6-10 tutors</option>
                <option value="10+">10+ tutors</option>
              </select>
              {errors.expected_tutors && (
                <p className="mt-1 text-xs text-red-500">{errors.expected_tutors[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <textarea
            name="partner_message"
            placeholder="Additional message (optional)"
            rows={3}
            value={formData.partner_message}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all resize-none ${
              errors.partner_message ? 'border-red-500' : 'border-gray-300'
            }`}
          ></textarea>
          {errors.partner_message && (
            <p className="mt-1 text-xs text-red-500">{errors.partner_message[0]}</p>
          )}
        </div>

        {/* Email Verification Error */}
        {emailVerificationError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-700 text-sm">{emailVerificationError}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isEmailVerified}
            className={`py-3 px-6 rounded-md font-medium text-sm flex items-center justify-center gap-2 min-w-[180px] transition-all ${
              isEmailVerified 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>

      {/* Compact Contact Fallback */}
      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500 mb-2">Need help?</p>
        <div className="flex justify-center space-x-4 text-xs">
          <a 
            href="mailto:rockyg.swinfy@gmail.com?subject=Knowledge Partner Application"
            className="text-blue-600 hover:text-blue-800"
          >
            📧 Email Support
          </a>
          <a 
            href="tel:+917981313783"
            className="text-blue-600 hover:text-blue-800"
          >
            📞 Call Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
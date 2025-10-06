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

type FormStep = 'filling' | 'verifying_email' | 'submitting';

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

  const [currentStep, setCurrentStep] = useState<FormStep>('filling');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ApiError>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  // Load previously saved details for auto-fill (dev UX)
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kpApplicationForm') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Auto-close success message after 5 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
        setCurrentStep('filling');
        setIsEmailVerified(false);
        // Reset form data
        setFormData({
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
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kpApplicationForm');
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

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

  // OTP API methods for contact form
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
      setCurrentStep('filling');
      setEmailVerificationError('');
    }
    
    // Persist as-you-type
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('kpApplicationForm', JSON.stringify(next));
      }
    } catch {
      // ignore storage errors
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleEmailVerified = () => {
    setIsEmailVerified(true);
    setCurrentStep('submitting');
    setEmailVerificationError('');
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before sending OTP
    if (!formData.knowledge_partner_name || !formData.knowledge_partner_type || 
        !formData.knowledge_partner_email || !formData.contact_number || 
        !formData.website_url || !formData.courses_interested_in || 
        !formData.experience_years || !formData.expected_tutors) {
      setEmailVerificationError('Please fill in all required fields before verifying email.');
      return;
    }
    
    setOtpSending(true);
    setEmailVerificationError('');
    
    try {
      await sendOTPForEmail(formData.knowledge_partner_email);
      setCurrentStep('verifying_email');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      setEmailVerificationError(errorMessage);
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEmailVerified) {
      setEmailVerificationError('Please verify your email address first.');
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
      } else {
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
      <div className="space-y-6 animate-fadeIn">
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
          <div className="mt-4 text-xs text-green-600">
            This window will close automatically in a few seconds...
          </div>
        </div>
      </div>
    );
  }

  const isFormComplete = formData.knowledge_partner_name && 
                         formData.knowledge_partner_type && 
                         formData.knowledge_partner_email && 
                         formData.contact_number && 
                         formData.website_url && 
                         formData.courses_interested_in && 
                         formData.experience_years && 
                         formData.expected_tutors;

  return (
    <div className="space-y-4">
      {/* Compact Process Info Header */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
          <Building2 className="w-4 h-4" />
          <span className="font-medium text-sm">Quick Application Process</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <span className={currentStep === 'filling' ? 'font-semibold' : ''}>
            1️⃣ Fill Form
          </span>
          <span>→</span>
          <span className={currentStep === 'verifying_email' ? 'font-semibold' : ''}>
            2️⃣ Verify Email
          </span>
          <span>→</span>
          <span className={currentStep === 'submitting' ? 'font-semibold' : ''}>
            3️⃣ Submit
          </span>
        </div>
      </div>

      <form onSubmit={currentStep === 'submitting' ? handleSubmit : handleVerifyEmail} className="space-y-4">
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
                disabled={currentStep !== 'filling'}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.knowledge_partner_name ? 'border-red-500' : 'border-gray-300'
                } ${currentStep !== 'filling' ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                disabled={currentStep !== 'filling'}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.knowledge_partner_type ? 'border-red-500' : 'border-gray-300'
                } ${currentStep !== 'filling' ? 'opacity-60 cursor-not-allowed' : ''}`}
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
              disabled={currentStep !== 'filling'}
              className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                errors.website_url ? 'border-red-500' : 'border-gray-300'
              } ${currentStep !== 'filling' ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                disabled={currentStep !== 'filling'}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.knowledge_partner_email ? 'border-red-500' : 'border-gray-300'
                } ${isEmailVerified ? 'border-green-500 bg-green-50' : ''} ${currentStep !== 'filling' ? 'opacity-60 cursor-not-allowed' : ''}`}
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

            {isEmailVerified && (
              <div className="flex items-center gap-2 text-green-600 text-xs">
                <CheckCircle className="w-3 h-3" />
                <span>Email verified successfully</span>
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
                disabled={currentStep !== 'filling'}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.contact_number ? 'border-red-500' : 'border-gray-300'
                } ${currentStep !== 'filling' ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              {errors.contact_number && (
                <p className="mt-1 text-xs text-red-500">{errors.contact_number[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* OTP Verification Component - Shows when in verifying_email step */}
        {currentStep === 'verifying_email' && (
          <div className="bg-white rounded-lg border-2 border-blue-200 p-4 animate-slideDown">
            <div className="flex items-center gap-2 mb-3 text-blue-700">
              <Mail className="w-5 h-5" />
              <h5 className="font-medium text-sm">Email Verification</h5>
            </div>
            <OTPVerification
              email={formData.knowledge_partner_email}
              onVerified={handleEmailVerified}
              onSendOTP={sendOTPForEmail}
              onVerifyOTP={verifyOTPForEmail}
              isVerified={isEmailVerified}
            />
          </div>
        )}

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
                disabled={currentStep !== 'filling'}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.courses_interested_in ? 'border-red-500' : 'border-gray-300'
                } ${currentStep !== 'filling' ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                disabled={currentStep !== 'filling'}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.experience_years ? 'border-red-500' : 'border-gray-300'
                } ${currentStep !== 'filling' ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                disabled={currentStep !== 'filling'}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${
                  errors.expected_tutors ? 'border-red-500' : 'border-gray-300'
                } ${currentStep !== 'filling' ? 'opacity-60 cursor-not-allowed' : ''}`}
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
            disabled={currentStep !== 'filling'}
            className={`w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all resize-none ${
              errors.partner_message ? 'border-red-500' : 'border-gray-300'
            } ${currentStep !== 'filling' ? 'opacity-60 cursor-not-allowed' : ''}`}
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

        {/* Action Button - Changes based on step */}
        <div className="flex justify-center pt-2">
          {currentStep === 'filling' && (
            <button
              type="submit"
              disabled={!isFormComplete || otpSending}
              className={`py-3 px-6 rounded-md font-medium text-sm flex items-center justify-center gap-2 min-w-[180px] transition-all ${
                isFormComplete && !otpSending
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {otpSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Verify Email
                </>
              )}
            </button>
          )}

          {currentStep === 'submitting' && (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`py-3 px-6 rounded-md font-medium text-sm flex items-center justify-center gap-2 min-w-[180px] transition-all ${
                !isSubmitting
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          )}
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
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockOrganizations } from '@/lib/mock-organizations';
// import { AuthAPI, RegisterRequest } from '@/lib/api/auth';

import OrganizationDetailsForm from './OrganizationDetailsForm';

type UserRole = 'student' | 'tutor' | 'admin';

interface OrganizationDetails {
  name: string;
  type: 'company' | 'organization' | 'university' | 'institute' | 'bootcamp';
  location: string;
  website: string;
  description: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  logo?: File | null;
  linkedin_url?: string;
}

interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: UserRole;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

const validationRules = {
  full_name: {
    required: true,
    minLength: 2,
    message: "Name must be at least 2 characters"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email"
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
    message: "8+ characters with at least 1 letter and 1 number"
  },
  confirm_password: {
    required: true,
    message: "Passwords must match"
  }
};

interface RegistrationFormProps {
  onSuccess?: (email: string, role: 'student' | 'tutor' | 'admin') => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps = {}) {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student',
    organization_id: '',
    organization_details: {
      name: '',
      type: 'university',
      location: '',
      website: '',
      description: '',
      address: '',
      contact_email: '',
      contact_phone: '',
      logo: null,
      linkedin_url: ''
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'full_name':
        if (!value) return validationRules.full_name.message;
        if (value.length < validationRules.full_name.minLength) return validationRules.full_name.message;
        break;
      
      case 'email':
        if (!value) return validationRules.email.message;
        if (!validationRules.email.pattern.test(value)) return validationRules.email.message;
        break;
      
      case 'password':
        if (!value) return validationRules.password.message;
        if (value.length < validationRules.password.minLength) return validationRules.password.message;
        if (!validationRules.password.pattern.test(value)) return validationRules.password.message;
        break;
      
      case 'confirm_password':
        if (!value) return validationRules.confirm_password.message;
        if (value !== formData.password) return validationRules.confirm_password.message;
        break;
      
      case 'organization_id':
        if (formData.role === 'tutor' && !value) {
          return 'Please select an organization';
        }
        break;
    }
    return undefined;
  };

  const validateOrganizationDetails = (details: OrganizationDetails): Partial<Record<keyof OrganizationDetails, string>> => {
    const orgErrors: Partial<Record<keyof OrganizationDetails, string>> = {};
    
    if (!details.name) orgErrors.name = 'Organization name is required';
    if (!details.type) orgErrors.type = 'Organization type is required';
    if (!details.location) orgErrors.location = 'Location is required';
    if (!details.description) orgErrors.description = 'Description is required';
    if (details.website && !/^https?:\/\/.+/.test(details.website)) {
      orgErrors.website = 'Please enter a valid URL';
    }
    if (!details.address) orgErrors.address = 'Address is required';
    if (!details.contact_email) orgErrors.contact_email = 'Contact email is required';
    if (details.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.contact_email)) {
      orgErrors.contact_email = 'Please enter a valid contact email';
    }
    if (!details.contact_phone) orgErrors.contact_phone = 'Contact phone is required';
    if (details.linkedin_url && !/^https?:\/\/.+/.test(details.linkedin_url)) {
      orgErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }
    
    return orgErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ 
      ...prev, 
      role, 
      organization_id: role === 'student' ? '' : prev.organization_id,
      organization_details: {
        name: '',
        type: 'university',
        location: '',
        website: '',
        description: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        logo: null,
        linkedin_url: ''
      }
    }));
    
    // Clear relevant errors when switching roles
    if (role === 'student') {
      setErrors(prev => ({ 
        ...prev, 
        organization_id: undefined,
        organization_details: undefined
      }));
    }
  };

  const handleOrganizationDetailsChange = (details: OrganizationDetails) => {
    setFormData(prev => ({ ...prev, organization_details: details }));
    
    // Clear organization details errors when user starts typing
    if (errors.organization_details) {
      setErrors(prev => ({ ...prev, organization_details: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate basic fields
    const basicFields = ['full_name', 'email', 'password', 'confirm_password', 'organization_id'] as const;
    basicFields.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Validate organization details for admin role
    if (formData.role === 'admin') {
      const orgErrors = validateOrganizationDetails(formData.organization_details);
      if (Object.keys(orgErrors).length > 0) {
        newErrors.organization_details = orgErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Registration data:', formData);
      
      // Different messages based on role
      let successMessage = 'Registration successful! (Demo mode)';
      
      if (formData.role === 'admin') {
        successMessage = 'Admin registration successful! Your organization has been created.';
      } else if (formData.role === 'tutor') {
        successMessage = 'Tutor registration submitted! Waiting for organization admin approval.';
      } else {
        successMessage = 'Registration successful!';
      }
      
      console.log(successMessage);
      
      // Call onSuccess callback with email and role to proceed to OTP verification
      if (onSuccess) {
        onSuccess(formData.email, formData.role);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiresOrganizationSelection = formData.role === 'tutor';
  const requiresOrganizationCreation = formData.role === 'admin';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.full_name ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your full name"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Role Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I want to join as a
        </label>
        <div className="grid grid-cols-1 gap-3">
          {([
            { role: 'student', label: 'Student', description: 'Access courses and learn' },
            { role: 'tutor', label: 'Tutor', description: 'Join existing organization (requires approval)' },
            { role: 'admin', label: 'Admin', description: 'Create and manage new organization' }
          ] as const).map(({ role, label, description }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleChange(role)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                formData.role === role
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{label}</div>
              <div className="text-sm opacity-75 mt-1">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Organization Selection for Tutors */}
      <div className={`transition-all duration-300 ${
        requiresOrganizationSelection ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
      }`}>
        {requiresOrganizationSelection && (
          <>
            <label htmlFor="organization_id" className="block text-sm font-medium text-gray-700 mb-2">
              Select Organization to Join
            </label>
            <select
              id="organization_id"
              name="organization_id"
              value={formData.organization_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
                errors.organization_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Choose organization to request access...</option>
              {mockOrganizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.type})
                </option>
              ))}
            </select>
            {errors.organization_id && (
              <p className="mt-1 text-sm text-red-600">{errors.organization_id}</p>
            )}
            <p className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              💡 Your request will be sent to the organization admin for approval
            </p>
          </>
        )}
      </div>

      {/* Organization Creation for Admins */}
      <div className={`transition-all duration-300 ${
        requiresOrganizationCreation ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden'
      }`}>
        {requiresOrganizationCreation && (
          <OrganizationDetailsForm
            organizationDetails={formData.organization_details}
            onChange={handleOrganizationDetailsChange}
            errors={errors.organization_details}
          />
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Create a strong password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Must be 8+ characters with at least 1 letter and 1 number
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
              errors.confirm_password 
                ? 'border-red-500 focus:border-red-500' 
                : formData.confirm_password && formData.password === formData.confirm_password
                  ? 'border-green-500 focus:border-green-600' 
                  : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          {/* Password Match Indicator */}
          {formData.confirm_password && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {formData.password === formData.confirm_password ? (
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>
        {errors.confirm_password && (
          <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
        )}
        {formData.confirm_password && formData.password === formData.confirm_password && !errors.confirm_password && (
          <p className="mt-1 text-sm text-green-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Passwords match
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Creating Account...
          </div>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
}

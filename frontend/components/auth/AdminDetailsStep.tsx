'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AdminDetails {
  bio: string;
  profile_picture?: File | null;
  phone_number: string;
  job_title: string;
  department: string;
  office_location: string;
  office_phone: string;
  emergency_contact: string;
  linkedin_url: string;
  professional_email: string;
}

interface AdminDetailsStepProps {
  adminDetails: AdminDetails;
  onChange: (details: AdminDetails) => void;
  onNext: () => void;
  onBack: () => void;
  errors?: Partial<Record<keyof AdminDetails, string>>;
}

export default function AdminDetailsStep({
  adminDetails,
  onChange,
  onNext,
  onBack,
  errors
}: AdminDetailsStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...adminDetails, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange({ ...adminDetails, profile_picture: file });
  };

  const validateAdminDetails = (details: AdminDetails): Partial<Record<keyof AdminDetails, string>> => {
    const adminErrors: Partial<Record<keyof AdminDetails, string>> = {};
    
    if (!details.job_title) adminErrors.job_title = 'Job title is required';
    if (details.professional_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.professional_email)) {
      adminErrors.professional_email = 'Please enter a valid professional email';
    }
    if (details.linkedin_url && !/^https?:\/\/.+/.test(details.linkedin_url)) {
      adminErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }
    
    return adminErrors;
  };

  const handleNext = () => {
    const validationErrors = validateAdminDetails(adminDetails);
    if (Object.keys(validationErrors).length === 0) {
      onNext();
    } else {
      // Handle validation errors - you might want to show them in the UI
      console.error('Validation errors:', validationErrors);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Admin Profile Details
        </h3>
        <p className="text-sm text-gray-600">
          Complete your admin profile information
        </p>
      </div>

      <div className="space-y-4">
        {/* Job Title */}
        <div>
          <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            id="job_title"
            name="job_title"
            value={adminDetails.job_title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
              errors?.job_title ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., CEO, Director, Manager"
          />
          {errors?.job_title && (
            <p className="mt-1 text-sm text-red-600">{errors.job_title}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <input
            type="text"
            id="department"
            name="department"
            value={adminDetails.department}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
            placeholder="e.g., Education, Technology, Operations"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={adminDetails.bio}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
            placeholder="Tell us about yourself and your role in the organization"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={adminDetails.phone_number}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Office Location */}
        <div>
          <label htmlFor="office_location" className="block text-sm font-medium text-gray-700 mb-2">
            Office Location
          </label>
          <input
            type="text"
            id="office_location"
            name="office_location"
            value={adminDetails.office_location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
            placeholder="City, State, Country"
          />
        </div>

        {/* Office Phone */}
        <div>
          <label htmlFor="office_phone" className="block text-sm font-medium text-gray-700 mb-2">
            Office Phone
          </label>
          <input
            type="tel"
            id="office_phone"
            name="office_phone"
            value={adminDetails.office_phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Professional Email */}
        <div>
          <label htmlFor="professional_email" className="block text-sm font-medium text-gray-700 mb-2">
            Professional Email
          </label>
          <input
            type="email"
            id="professional_email"
            name="professional_email"
            value={adminDetails.professional_email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
              errors?.professional_email ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
            }`}
            placeholder="admin@organization.com"
          />
          {errors?.professional_email && (
            <p className="mt-1 text-sm text-red-600">{errors.professional_email}</p>
          )}
        </div>

        {/* LinkedIn URL */}
        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            id="linkedin_url"
            name="linkedin_url"
            value={adminDetails.linkedin_url}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
              errors?.linkedin_url ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          {errors?.linkedin_url && (
            <p className="mt-1 text-sm text-red-600">{errors.linkedin_url}</p>
          )}
        </div>

        {/* Emergency Contact */}
        <div>
          <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact
          </label>
          <input
            type="text"
            id="emergency_contact"
            name="emergency_contact"
            value={adminDetails.emergency_contact}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
            placeholder="Name and phone number"
          />
        </div>

        {/* Profile Picture */}
        <div>
          <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            id="profile_picture"
            name="profile_picture"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="px-6"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-6"
        >
          {isSubmitting ? 'Processing...' : 'Complete Registration'}
        </Button>
      </div>
    </div>
  );
}

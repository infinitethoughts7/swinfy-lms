'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AdminDetails {
  bio: string;
  profile_picture?: File | null;
  phone_number: string;
  job_title: string;
  office_location: string;
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
  const [isSubmitting] = useState(false);

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

      <div className="space-y-6">
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 ${
              errors?.job_title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., CEO, Director, Manager"
          />
          {errors?.job_title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.job_title}
            </p>
          )}
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
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
            placeholder="City, State, Country"
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 ${
              errors?.professional_email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="admin@organization.com"
          />
          {errors?.professional_email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.professional_email}
            </p>
          )}
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
          />
          <p className="mt-1 text-xs text-gray-500">Optional: Upload a profile picture (JPG, PNG, GIF)</p>
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

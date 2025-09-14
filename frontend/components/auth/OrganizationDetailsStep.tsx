'use client';

import { Button } from '@/components/ui/button';
import OrganizationDetailsForm from './OrganizationDetailsForm';

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

interface OrganizationDetailsStepProps {
  organizationDetails: OrganizationDetails;
  onChange: (details: OrganizationDetails) => void;
  onNext: () => void;
  onBack: () => void;
  errors?: Partial<Record<keyof OrganizationDetails, string>>;
}

export default function OrganizationDetailsStep({
  organizationDetails,
  onChange,
  onNext,
  onBack,
  errors
}: OrganizationDetailsStepProps) {

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

  const handleNext = () => {
    const validationErrors = validateOrganizationDetails(organizationDetails);
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
          Organization Details
        </h3>
        <p className="text-sm text-gray-600">
          Please provide details about your organization
        </p>
      </div>

      <OrganizationDetailsForm
        organizationDetails={organizationDetails}
        onChange={onChange}
        errors={errors}
      />

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
          className="px-6"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

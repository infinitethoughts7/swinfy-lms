export interface Organization {
  id: string;
  name: string;
  type: 'university' | 'company' | 'institute' | 'bootcamp';
  description: string;
  location: string;
}

export const mockOrganizations: Organization[] = [
  // Universities
  {
    id: 'uni-001',
    name: 'Stanford University',
    type: 'university',
    description: 'Leading research university in California',
    location: 'Stanford, CA, USA'
  },
  {
    id: 'uni-002',
    name: 'MIT - Massachusetts Institute of Technology',
    type: 'university',
    description: 'Premier technology and engineering university',
    location: 'Cambridge, MA, USA'
  },
  {
    id: 'uni-003',
    name: 'IIT Madras',
    type: 'university',
    description: 'Indian Institute of Technology Madras',
    location: 'Chennai, India'
  },
  {
    id: 'uni-004',
    name: 'University of California, Berkeley',
    type: 'university',
    description: 'Top public research university',
    location: 'Berkeley, CA, USA'
  },

  // Companies
  {
    id: 'comp-001',
    name: 'Google',
    type: 'company',
    description: 'Technology and internet services company',
    location: 'Mountain View, CA, USA'
  },
  {
    id: 'comp-002',
    name: 'Microsoft',
    type: 'company',
    description: 'Software and cloud computing company',
    location: 'Redmond, WA, USA'
  },
  {
    id: 'comp-003',
    name: 'Amazon',
    type: 'company',
    description: 'E-commerce and cloud computing company',
    location: 'Seattle, WA, USA'
  },
  {
    id: 'comp-004',
    name: 'Meta',
    type: 'company',
    description: 'Social media and virtual reality company',
    location: 'Menlo Park, CA, USA'
  },

  // Institutes
  {
    id: 'inst-001',
    name: 'Khan Academy',
    type: 'institute',
    description: 'Non-profit educational organization',
    location: 'Mountain View, CA, USA'
  },
  {
    id: 'inst-002',
    name: 'Coursera Learning Institute',
    type: 'institute',
    description: 'Online learning platform',
    location: 'Mountain View, CA, USA'
  },
  {
    id: 'inst-003',
    name: 'DataCamp Institute',
    type: 'institute',
    description: 'Data science education platform',
    location: 'New York, NY, USA'
  },

  // Bootcamps
  {
    id: 'boot-001',
    name: 'App Academy',
    type: 'bootcamp',
    description: 'Intensive coding bootcamp',
    location: 'San Francisco, CA, USA'
  },
  {
    id: 'boot-002',
    name: 'General Assembly',
    type: 'bootcamp',
    description: 'Technology and design bootcamp',
    location: 'New York, NY, USA'
  },
  {
    id: 'boot-003',
    name: 'Lambda School',
    type: 'bootcamp',
    description: 'Full-stack development bootcamp',
    location: 'San Francisco, CA, USA'
  },
  {
    id: 'boot-004',
    name: 'Le Wagon',
    type: 'bootcamp',
    description: 'Web development and data science bootcamp',
    location: 'Paris, France'
  }
];

export const getOrganizationsByType = (type: Organization['type']) => {
  return mockOrganizations.filter(org => org.type === type);
};

export const getOrganizationById = (id: string) => {
  return mockOrganizations.find(org => org.id === id);
};

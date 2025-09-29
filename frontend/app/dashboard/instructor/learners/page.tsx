"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar,
  BookOpen,
  Target,
  User,
  Eye,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth';

interface Learner {
  id: string;
  full_name: string;
  email: string;
  profile_picture: string | null;
  enrollment_date: string;
  progress_percentage: number;
  course_title?: string;
  course_slug?: string;
}

interface CourseWithLearners {
  id: string;
  title: string;
  slug: string;
  enrolled_learners: Learner[];
}

export default function InstructorLearnersPage() {
  const [allLearners, setAllLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      return;
    }
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data since the backend endpoints require specific permissions
      // In a real implementation, you would need to create an endpoint for regular instructors
      const mockLearners: Learner[] = [
        {
          id: '1',
          full_name: 'John Doe',
          email: 'john.doe@example.com',
          profile_picture: null,
          enrollment_date: '2024-01-15T10:30:00Z',
          progress_percentage: 75,
          course_title: 'Complete Python Programming',
          course_slug: 'complete-python-programming'
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          email: 'jane.smith@example.com',
          profile_picture: null,
          enrollment_date: '2024-01-20T14:15:00Z',
          progress_percentage: 45,
          course_title: 'Machine Learning with Python',
          course_slug: 'machine-learning-python'
        },
        {
          id: '3',
          full_name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          profile_picture: null,
          enrollment_date: '2024-02-01T09:00:00Z',
          progress_percentage: 90,
          course_title: 'Complete Python Programming',
          course_slug: 'complete-python-programming'
        },
        {
          id: '4',
          full_name: 'Sarah Wilson',
          email: 'sarah.wilson@example.com',
          profile_picture: null,
          enrollment_date: '2024-02-05T16:45:00Z',
          progress_percentage: 30,
          course_title: 'Data Science Fundamentals',
          course_slug: 'data-science-fundamentals'
        },
        {
          id: '5',
          full_name: 'David Brown',
          email: 'david.brown@example.com',
          profile_picture: null,
          enrollment_date: '2024-02-10T11:20:00Z',
          progress_percentage: 100,
          course_title: 'React.js Development',
          course_slug: 'react-js-development'
        }
      ];
      
      setAllLearners(mockLearners);
      
      // TODO: Replace with actual API call when backend endpoint is available
      // const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/instructor/learners/`, {
      //   method: 'GET',
      // });
      // if (response.ok) {
      //   const data = await response.json();
      //   setAllLearners(data);
      // } else {
      //   throw new Error('Failed to fetch learners');
      // }
    } catch (err) {
      console.error('Error fetching learners:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch learners');
    } finally {
      setLoading(false);
    }
  };

  const filteredLearners = allLearners.filter(learner =>
    learner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (learner.course_title && learner.course_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openModal = (learner: Learner) => {
    setSelectedLearner(learner);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLearner(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatProgress = (progress: number) => {
    return Math.round(progress || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchLearners}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learners</h1>
          <p className="text-gray-600 text-sm">View learners enrolled in your courses</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-5 w-5" />
          <span className="font-medium">{filteredLearners.length} learners</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Learners Grid - Horizontal Cards */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {filteredLearners.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {allLearners.length === 0 ? 'No learners found' : 'No learners match your search'}
            </p>
            <p className="text-gray-400 text-sm">
              {allLearners.length === 0 
                ? 'Learners will appear here once they enroll in your courses'
                : 'Try adjusting your search terms'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLearners.map((learner) => (
              <div key={learner.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {learner.profile_picture ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={learner.profile_picture}
                          alt={learner.full_name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Learner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {learner.full_name}
                      </h3>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{learner.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-3 w-3" />
                        <span className="truncate">{learner.course_title}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Enrolled {formatDate(learner.enrollment_date)}</span>
                      </div>
                    </div>

                    {/* Progress Info */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{formatProgress(learner.progress_percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${formatProgress(learner.progress_percentage)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-3">
                      <button
                        onClick={() => openModal(learner)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {showModal && selectedLearner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                {selectedLearner.profile_picture ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={selectedLearner.profile_picture}
                      alt={selectedLearner.full_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedLearner.full_name}
                  </h3>
                  <p className="text-gray-600">{selectedLearner.email}</p>
                  <p className="text-sm text-blue-600">{selectedLearner.course_title}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Course Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Course Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span>{selectedLearner.course_title}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(selectedLearner.enrollment_date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Learning Progress</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                      <span>Overall Progress</span>
                      <span className="font-semibold">{formatProgress(selectedLearner.progress_percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${formatProgress(selectedLearner.progress_percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Course Progress</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        {formatProgress(selectedLearner.progress_percentage)}% completed
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Status</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        {formatProgress(selectedLearner.progress_percentage) === 100 ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedLearner.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

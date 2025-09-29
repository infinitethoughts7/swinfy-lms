"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
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

interface LearnerProfile {
  bio: string | null;
  profile_picture: string | null;
  phone_number: string | null;
  learning_goals: string | null;
  interests: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Learner {
  id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
  is_approved: boolean;
  kp_approval_status: string;
  created_at: string;
  updated_at: string;
  profile: LearnerProfile;
}

export default function KPLearnersPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
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
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/kp/learners/`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setLearners(data);
      } else {
        throw new Error('Failed to fetch learners');
      }
    } catch (err) {
      console.error('Error fetching learners:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch learners');
    } finally {
      setLoading(false);
    }
  };

  const filteredLearners = learners.filter(learner =>
    learner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (learner.profile.phone_number && learner.profile.phone_number.includes(searchTerm))
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
          <h1 className="text-2xl font-bold text-gray-900">Our Learners</h1>
          <p className="text-gray-600 text-sm">Manage and view learners in your organization</p>
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
            placeholder="Search by name, email, or phone..."
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
              {learners.length === 0 ? 'No learners found' : 'No learners match your search'}
            </p>
            <p className="text-gray-400 text-sm">
              {learners.length === 0 
                ? 'Learners will appear here once they join your organization'
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
                    {learner.profile.profile_picture ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={learner.profile.profile_picture}
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
                      {learner.is_verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{learner.email}</span>
                      </div>
                      
                      {learner.profile.phone_number && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{learner.profile.phone_number}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {formatDate(learner.created_at)}</span>
                      </div>
                    </div>

                    {/* Quick Info */}
                    {learner.profile.learning_goals && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 line-clamp-2">
                          <Target className="h-3 w-3 inline mr-1" />
                          {learner.profile.learning_goals}
                        </p>
                      </div>
                    )}

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
                {selectedLearner.profile.profile_picture ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={selectedLearner.profile.profile_picture}
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
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <span>{selectedLearner.full_name}</span>
                    {selectedLearner.is_verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </h3>
                  <p className="text-gray-600">{selectedLearner.email}</p>
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
              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedLearner.email}</span>
                    </div>
                  </div>
                  
                  {selectedLearner.profile.phone_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedLearner.profile.phone_number}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {selectedLearner.profile.bio && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">About</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedLearner.profile.bio}</p>
                </div>
              )}

              {/* Learning Goals */}
              {selectedLearner.profile.learning_goals && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Learning Goals</h4>
                  <div className="flex items-start space-x-2">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{selectedLearner.profile.learning_goals}</p>
                  </div>
                </div>
              )}

              {/* Interests */}
              {selectedLearner.profile.interests && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Interests</h4>
                  <div className="flex items-start space-x-2">
                    <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{selectedLearner.profile.interests}</p>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(selectedLearner.created_at)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center space-x-2">
                      {selectedLearner.is_verified ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-700">Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <span className="text-yellow-700">Unverified</span>
                        </>
                      )}
                    </div>
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

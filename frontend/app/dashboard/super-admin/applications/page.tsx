"use client";

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Mail,
  Phone,
  Globe,
  Building,
  Calendar,
  User,
  Filter,
  Search
} from 'lucide-react';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth';

interface KPApplication {
  id: string;
  knowledge_partner_name: string;
  knowledge_partner_type: string;
  type_display: string;
  knowledge_partner_email: string;
  contact_number: string;
  website_url: string;
  courses_interested_in: string;
  courses_interested_display: string;
  experience_years: string;
  experience_display: string;
  expected_tutors: string;
  expected_tutors_display: string;
  partner_message: string;
  status: 'pending' | 'approved' | 'rejected';
  status_display: string;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export default function KPApplicationsPage() {
  const [applications, setApplications] = useState<KPApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<KPApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const safeApplications = Array.isArray(applications) ? applications : [];

  useEffect(() => {
    // Check if user is authenticated before making API calls
    if (!isAuthenticated()) {
      logout();
      return;
    }
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/super-admin/applications/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await authenticatedFetch(url, {
        method: 'GET',
      });

      const data = await response.json();
      const applicationsArray = data.results || data;
      setApplications(Array.isArray(applicationsArray) ? applicationsArray : []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setActionLoading(true);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/super-admin/applications/${applicationId}/approve/`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to approve application');
      }

      const result = await response.json();
      
      // Show success message with updated information
      alert(`🎉 ${result.message}\n\n📧 Admin Email: ${result.admin_email}\n🔑 Sent with a Temporary Password\n🌐 Login URL: ${result.login_url}\n\n✅ Congratulatory email has been sent automatically!\n\nThe Knowledge Partner can now login immediately.`);
      
      setShowModal(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (err) {
      console.error('Error approving application:', err);
      alert(err instanceof Error ? err.message : 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/super-admin/applications/${applicationId}/reject/`, {
        method: 'POST',
        body: JSON.stringify({
          reason: rejectionReason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject application');
      }

      alert('Application rejected successfully!');
      
      setShowModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
      fetchApplications();
    } catch (err) {
      console.error('Error rejecting application:', err);
      alert(err instanceof Error ? err.message : 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (application: KPApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
    setRejectionReason('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    setRejectionReason('');
  };

  // Filter applications based on search term
  const filteredApplications = safeApplications.filter(app =>
    app.knowledge_partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.knowledge_partner_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Partner Applications</h1>
            <p className="text-gray-600">Review and manage Knowledge Partner applications</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge('pending')}`}>
              {safeApplications.filter(app => app.status === 'pending').length} Pending
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge('approved')}`}>
              {safeApplications.filter(app => app.status === 'approved').length} Approved
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge('rejected')}`}>
              {safeApplications.filter(app => app.status === 'rejected').length} Rejected
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}

      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'No applications match your current filters.'
              : 'No Knowledge Partner applications have been submitted yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{application.knowledge_partner_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.status)}`}>
                      {application.status_display}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      {application.type_display}
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {application.knowledge_partner_email}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(application.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Interested in:</span> {application.courses_interested_display}
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span> {application.experience_display}
                    </div>
                    <div>
                      <span className="font-medium">Expected tutors:</span> {application.expected_tutors_display}
                    </div>
                  </div>
                  
                  {application.partner_message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{application.partner_message}</p>
                    </div>
                  )}
                  
                  {application.status !== 'pending' && application.reviewed_by_name && (
                    <div className="mt-3 text-xs text-gray-500">
                      {application.status === 'approved' ? 'Approved' : 'Rejected'} by {application.reviewed_by_name} on {' '}
                      {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : 'N/A'}
                      {application.admin_notes && (
                        <div className="mt-1 italic">Note: {application.admin_notes}</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <button
                    onClick={() => openModal(application)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {application.status === 'pending' ? 'Review' : 'View'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedApplication.knowledge_partner_name}</h2>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusBadge(selectedApplication.status)}`}>
                    {selectedApplication.status_display}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                    <p className="text-gray-900">{selectedApplication.type_display}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedApplication.knowledge_partner_email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedApplication.contact_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <a href={selectedApplication.website_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      {selectedApplication.website_url}
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Courses Interested In</label>
                    <p className="text-gray-900">{selectedApplication.courses_interested_display}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <p className="text-gray-900">{selectedApplication.experience_display}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Tutors</label>
                    <p className="text-gray-900">{selectedApplication.expected_tutors_display}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applied On</label>
                    <p className="text-gray-900">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedApplication.partner_message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{selectedApplication.partner_message}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons for Pending Applications */}
                {selectedApplication.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (required if rejecting)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason for rejection..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(selectedApplication.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading ? 'Processing...' : 'Approve Application'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedApplication.id)}
                        disabled={actionLoading || !rejectionReason.trim()}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading ? 'Processing...' : 'Reject Application'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

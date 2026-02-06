"use client";

import { useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  Mail,
  Building,
  Calendar,
  Filter,
  Search,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth/token';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<KPApplication | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const safeApplications = Array.isArray(applications) ? applications : [];

  useEffect(() => {
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

      alert(`${result.message}\n\nAdmin Email: ${result.admin_email}\nSent with a Temporary Password\nLogin URL: ${result.login_url}\n\nCongratulatory email has been sent automatically!\n\nThe Knowledge Partner can now login immediately.`);

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

  const handleCloseModal = (open: boolean) => {
    if (!open) {
      setShowModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
    }
  };

  const openDeleteModal = (application: KPApplication) => {
    setApplicationToDelete(application);
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setApplicationToDelete(null);
    setDeleteConfirmText('');
  };

  const handleDelete = async () => {
    if (!applicationToDelete) return;

    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    try {
      setActionLoading(true);

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/super-admin/applications/${applicationToDelete.id}/delete/`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete application');
      }

      const result = await response.json();

      alert(`${result.message}${result.note ? '\n\n' + result.note : ''}`);

      closeDeleteModal();
      fetchApplications();
    } catch (err) {
      console.error('Error deleting application:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete application');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApplications = safeApplications.filter(app =>
    app.knowledge_partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.knowledge_partner_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeClassName = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="py-0">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Knowledge Partner Applications</CardTitle>
              <CardDescription>Review and manage Knowledge Partner applications</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusBadgeClassName('pending')}>
                {safeApplications.filter(app => app.status === 'pending').length} Pending
              </Badge>
              <Badge className={getStatusBadgeClassName('approved')}>
                {safeApplications.filter(app => app.status === 'approved').length} Approved
              </Badge>
              <Badge className={getStatusBadgeClassName('rejected')}>
                {safeApplications.filter(app => app.status === 'rejected').length} Rejected
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchApplications}
              className="text-destructive hover:text-destructive/80"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="py-0">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'No applications match your current filters.'
                : 'No Knowledge Partner applications have been submitted yet.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow py-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{application.knowledge_partner_name}</h3>
                      <Badge className={getStatusBadgeClassName(application.status)}>
                        {application.status_display}
                      </Badge>
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
                        {application.status === 'approved' ? 'Approved' : 'Rejected'} by {application.reviewed_by_name} on{' '}
                        {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : 'N/A'}
                        {application.admin_notes && (
                          <div className="mt-1 italic">Note: {application.admin_notes}</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(application)}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {application.status === 'pending' ? 'Review' : 'View'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteModal(application)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review/View Modal */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedApplication.knowledge_partner_name}</DialogTitle>
                <DialogDescription>
                  <Badge className={`mt-2 ${getStatusBadgeClassName(selectedApplication.status)}`}>
                    {selectedApplication.status_display}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

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
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason for rejection..."
                        rows={3}
                      />
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => handleApprove(selectedApplication.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading ? 'Processing...' : 'Approve Application'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedApplication.id)}
                        disabled={actionLoading || !rejectionReason.trim()}
                        className="flex-1"
                      >
                        {actionLoading ? 'Processing...' : 'Reject Application'}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          {applicationToDelete && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <DialogTitle>Delete Application</DialogTitle>
                    <DialogDescription>This action cannot be undone</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription>
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Warning:</strong> You are about to permanently delete the application for:
                  </p>
                  <p className="font-semibold text-red-900">{applicationToDelete.knowledge_partner_name}</p>
                  <p className="text-sm text-red-700">{applicationToDelete.knowledge_partner_email}</p>

                  {applicationToDelete.status === 'approved' && (
                    <div className="mt-3 p-2 bg-red-100 rounded border border-red-300">
                      <p className="text-xs text-red-800 font-medium">
                        This application was APPROVED. Deleting it will also remove:
                      </p>
                      <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
                        <li>The Knowledge Partner profile</li>
                        <li>The KP Admin user account</li>
                        <li>All associated data</li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <Input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={actionLoading || deleteConfirmText !== 'DELETE'}
                  className="flex-1"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

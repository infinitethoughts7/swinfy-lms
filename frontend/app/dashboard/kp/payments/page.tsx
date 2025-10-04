'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminDashboardApi } from '@/lib/api';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  User, 
  BookOpen, 
  Filter,
  RefreshCw
} from 'lucide-react';

interface Payment {
  id: string;
  amount: string;
  status: string;
  created_at: string;
  paid_at?: string;
  verified_at?: string;
  user_name: string;
  user_email: string;
  course_title: string;
  course_slug: string;
  verification_notes?: string;
  verified_by?: {
    full_name: string;
  };
}

export default function KPPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminDashboardApi.getPaymentsByStatus('paid');
      setPayments(data.results || data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminDashboardApi.getPaymentHistory(statusFilter === 'all' ? undefined : statusFilter);
      setPayments(data.results || data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const load = async () => {
    if (activeTab === 'pending') {
      await loadPendingPayments();
    } else {
      await loadPaymentHistory();
    }
  };

  useEffect(() => {
    load();
  }, [activeTab, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const approve = async (paymentId: string) => {
    try {
      setActionLoadingId(paymentId);
      await adminDashboardApi.verifyPayment(paymentId, 'approve');
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to approve payment');
    } finally {
      setActionLoadingId('');
    }
  };

  const reject = async (paymentId: string) => {
    try {
      setActionLoadingId(paymentId);
      await adminDashboardApi.verifyPayment(paymentId, 'reject');
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to reject payment');
    } finally {
      setActionLoadingId('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Clock className="h-4 w-4" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 text-sm">Manage and review payment transactions</p>
        </div>
        <Link href="/dashboard/kp" className="text-blue-600 hover:text-blue-700 text-sm">Back to dashboard</Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Verification
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment History
            </div>
          </button>
        </nav>
      </div>

      {/* Filter Controls for History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
            <button
              onClick={load}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 border border-red-200 bg-red-50 rounded text-red-700 text-sm">{error}</div>
      )}

      {/* Content */}
      {payments.length === 0 ? (
        <div className="p-12 text-center border border-gray-200 rounded-lg bg-gray-50">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'pending' ? 'No pending payments' : 'No payments found'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'pending' 
              ? 'All payments have been processed or there are no new payments to verify.'
              : 'No payments match your current filter criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Student
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Course
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Amount
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  {activeTab === 'history' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                  )}
                  {activeTab === 'pending' && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.user_name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{payment.user_email || 'No email'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline" 
                        href={`/courses/course/${payment.course_slug || payment.id}`}
                      >
                        {payment.course_title || 'Unknown Course'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-700">
                        ₹{payment.amount ? Number(payment.amount).toLocaleString() : '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status || 'pending')}`}>
                        {getStatusIcon(payment.status || 'pending')}
                        {(payment.status || 'pending').charAt(0).toUpperCase() + (payment.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 
                       payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '-'}
                    </td>
                    {activeTab === 'history' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.verified_at ? (
                          <div>
                            <div>Verified: {new Date(payment.verified_at).toLocaleDateString()}</div>
                            {payment.verified_by && (
                              <div className="text-xs text-gray-400">by {payment.verified_by.full_name}</div>
                            )}
                            {payment.verification_notes && (
                              <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={payment.verification_notes}>
                                {payment.verification_notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not verified</span>
                        )}
                      </td>
                    )}
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => approve(payment.id)}
                            disabled={actionLoadingId === payment.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {actionLoadingId === payment.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => reject(payment.id)}
                            disabled={actionLoadingId === payment.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminDashboardApi } from '@/features/dashboard/services/admin';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Card>
          <CardContent className="p-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border-b">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
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
        <Button variant="link" asChild>
          <Link href="/dashboard/kp">Back to dashboard</Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'history')}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Verification
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payment History
          </TabsTrigger>
        </TabsList>

        {/* Filter Controls for History Tab */}
        {activeTab === 'history' && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary" size="sm" onClick={load}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Content */}
        <TabsContent value={activeTab} className="mt-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
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
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Student
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Course
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Amount
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Status
                      </div>
                    </TableHead>
                    <TableHead>Payment Date</TableHead>
                    {activeTab === 'history' && (
                      <TableHead>Verification</TableHead>
                    )}
                    {activeTab === 'pending' && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.user_name || 'Unknown User'}</div>
                          <div className="text-sm text-gray-500">{payment.user_email || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          href={`/courses/course/${payment.course_slug || payment.id}`}
                        >
                          {payment.course_title || 'Unknown Course'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-green-700">
                          ₹{payment.amount ? Number(payment.amount).toLocaleString() : '0'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`inline-flex items-center gap-1 ${getStatusColor(payment.status || 'pending')}`}>
                          {getStatusIcon(payment.status || 'pending')}
                          {(payment.status || 'pending').charAt(0).toUpperCase() + (payment.status || 'pending').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() :
                         payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      {activeTab === 'history' && (
                        <TableCell className="text-sm text-gray-500">
                          {payment.verified_at ? (
                            <div>
                              <div>Verified: {new Date(payment.verified_at).toLocaleDateString()}</div>
                              {payment.verification_notes && (
                                <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={payment.verification_notes}>
                                  {payment.verification_notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not verified</span>
                          )}
                        </TableCell>
                      )}
                      {activeTab === 'pending' && (
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approve(payment.id)}
                              disabled={actionLoadingId === payment.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {actionLoadingId === payment.id ? 'Approving...' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => reject(payment.id)}
                              disabled={actionLoadingId === payment.id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

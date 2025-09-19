'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminDashboardApi } from '@/lib/api';

interface PendingPayment {
  id: string;
  amount: string;
  status: string;
  created_at: string;
  paid_at?: string;
  user_name: string;
  user_email: string;
  course_title: string;
  course_slug: string;
}

export default function KPPaymentsPage() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string>('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminDashboardApi.getPaymentsByStatus('paid');
      setPayments(data.results || data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (paymentId: string) => {
    try {
      setActionLoadingId(paymentId);
      await adminDashboardApi.verifyPayment(paymentId, 'approve');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to approve payment');
    } finally {
      setActionLoadingId('');
    }
  };

  const reject = async (paymentId: string) => {
    try {
      setActionLoadingId(paymentId);
      await adminDashboardApi.verifyPayment(paymentId, 'reject');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to reject payment');
    } finally {
      setActionLoadingId('');
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments (Paid)</h1>
        <Link href="/dashboard/kp" className="text-blue-600 hover:text-blue-700 text-sm">Back to dashboard</Link>
      </div>
      {error && (
        <div className="p-3 border border-red-200 bg-red-50 rounded text-red-700 text-sm">{error}</div>
      )}
      {payments.length === 0 ? (
        <div className="p-6 text-center text-gray-600 border border-gray-200 rounded-lg">No paid payments to verify</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid at</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{p.user_name}<div className="text-xs text-gray-500">{p.user_email}</div></td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link className="text-blue-600 hover:underline" href={`/courses/course/${p.course_slug}`}>{p.course_title}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-700">₹{Number(p.amount as unknown as number || parseFloat(p.amount)).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.paid_at ? new Date(p.paid_at).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => approve(p.id)}
                        disabled={actionLoadingId === p.id}
                        className="px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60"
                      >
                        {actionLoadingId === p.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => reject(p.id)}
                        disabled={actionLoadingId === p.id}
                        className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
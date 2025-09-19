'use client';

import { useEffect, useState } from 'react';
import { paymentsApi } from '@/lib/api';

interface Payment { id: string; amount: string; status: string; created_at: string; course_title?: string; }

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await paymentsApi.getPaymentHistory();
        const items = (res?.results || res || []) as Payment[];
        setPayments(items);
      } catch (e) {
        setError('Failed to load payments.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">Loading...</div>;
  if (error) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Payments</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-600 text-sm" colSpan={4}>No payments yet.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-sm text-gray-700">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.course_title || '-'}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{parseFloat(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'success' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



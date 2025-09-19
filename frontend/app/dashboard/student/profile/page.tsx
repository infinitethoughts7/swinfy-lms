'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';

export default function learnerProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">My Profile</h1>
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Full Name</div>
              <div className="font-medium text-gray-900">{user.full_name}</div>
            </div>
            <div>
              <div className="text-gray-500">Email</div>
              <div className="font-medium text-gray-900">{user.email}</div>
            </div>
            <div>
              <div className="text-gray-500">Role</div>
              <div className="font-medium text-gray-900">{user.role_display || user.role}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 text-sm">No user info found.</div>
        )}
      </div>
    </div>
  );
}



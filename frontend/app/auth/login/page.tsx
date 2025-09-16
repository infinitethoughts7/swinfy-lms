'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/providers/ModalProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { openLoginModal } = useModal();

  useEffect(() => {
    // Redirect to home page and open login modal
    router.push('/');
    // Small delay to ensure the home page loads before opening the modal
    const timer = setTimeout(() => {
      openLoginModal();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router, openLoginModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-700 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h1 className="text-2xl font-bold text-gray-900">OLLA LMS</h1>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Redirecting to Login
          </h2>
          <p className="text-gray-300">
            Please wait while we redirect you to the login page...
          </p>
        </div>

        {/* Loading Card */}
        <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Loading Login
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Redirecting you to the home page with login modal
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              If you are not redirected automatically,{' '}
              <Link 
                href="/" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                click here to go to the home page
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

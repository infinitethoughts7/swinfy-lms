'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { AuthAPI } from '@/lib/api/auth';
import { saveTokens } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await AuthAPI.getGoogleOAuthConfig();
        if (config.success && config.client_id) {
          setGoogleClientId(config.client_id);
        }
      } catch (err) {
        console.error('Failed to fetch Google OAuth config:', err);
      }
    };

    fetchConfig();
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);

    try {
      const credential = credentialResponse.credential;
      const response = await AuthAPI.googleOAuth({ token: credential });

      if (response.success && response.tokens) {
        saveTokens(response.tokens.access, response.tokens.refresh);
        router.push('/dashboard');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(err.message || 'Failed to register with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  if (!googleClientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Swinfy LMS
              </h2>
              <p className="text-gray-600">
                Create your account to get started
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              {loading && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Creating your account...</p>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </a>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing up, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Sign up with Google for quick and secure access to all courses and learning resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
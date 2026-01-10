'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthAPI } from '@/lib/api/auth';
import { saveTokens, saveUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Apple icon SVG
const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

// Google icon SVG
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      fill="currentColor"
    />
  </svg>
);

// Logo component with book icon
const Logo = () => (
  <div className="flex items-center gap-2 self-center font-medium">
    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    </div>
    Swinfy LMS
  </div>
);

// Declare global for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: () => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string | undefined;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: {
            id_token: string;
            code: string;
          };
          user?: {
            email?: string;
            name?: {
              firstName?: string;
              lastName?: string;
            };
          };
        }>;
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [appleClientId, setAppleClientId] = useState<string>('');

  useEffect(() => {
    // Fetch Google OAuth config
    const fetchGoogleConfig = async () => {
      try {
        const config = await AuthAPI.getGoogleOAuthConfig();
        if (config.success && config.client_id) {
          setGoogleClientId(config.client_id);
        }
      } catch (err) {
        console.error('Failed to fetch Google OAuth config:', err);
      }
    };

    // Fetch Apple OAuth config
    const fetchAppleConfig = async () => {
      try {
        const config = await AuthAPI.getAppleOAuthConfig();
        if (config.success && config.client_id) {
          setAppleClientId(config.client_id);
        }
      } catch (err) {
        console.error('Failed to fetch Apple OAuth config:', err);
      }
    };

    fetchGoogleConfig();
    fetchAppleConfig();

    // Load Google Identity Services SDK
    const googleScript = document.createElement('script');
    googleScript.src = 'https://accounts.google.com/gsi/client';
    googleScript.async = true;
    googleScript.defer = true;
    document.body.appendChild(googleScript);

    // Load Apple Sign-In SDK
    const appleScript = document.createElement('script');
    appleScript.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    appleScript.async = true;
    document.body.appendChild(appleScript);

    return () => {
      // Cleanup scripts on unmount
      if (document.body.contains(googleScript)) {
        document.body.removeChild(googleScript);
      }
      if (document.body.contains(appleScript)) {
        document.body.removeChild(appleScript);
      }
    };
  }, []);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await AuthAPI.login({ email, password });

      if (response.tokens) {
        saveTokens({ access: response.tokens.access, refresh: response.tokens.refresh });
        saveUser(response.user as Parameters<typeof saveUser>[0]);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google || !googleClientId) {
      setError('Google Sign-In is not available');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCallback,
    });
    window.google.accounts.id.prompt();
  };

  const handleGoogleCallback = async (response: { credential: string }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthAPI.googleOAuth({ token: response.credential });

      if (result.success && result.tokens) {
        saveTokens({ access: result.tokens.access, refresh: result.tokens.refresh });
        saveUser(result.user as Parameters<typeof saveUser>[0]);
        router.push('/dashboard');
      } else {
        setError(result.message || 'Google login failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!window.AppleID) {
      setError('Apple Sign-In is not available');
      return;
    }

    try {
      window.AppleID.auth.init({
        clientId: appleClientId || process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: `${window.location.origin}/auth/apple/callback`,
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();

      setLoading(true);
      setError(null);

      const result = await AuthAPI.appleOAuth({
        id_token: response.authorization.id_token,
        authorization_code: response.authorization.code,
        user: response.user,
      });

      if (result.success && result.tokens) {
        saveTokens({ access: result.tokens.access, refresh: result.tokens.refresh });
        saveUser(result.user as Parameters<typeof saveUser>[0]);
        router.push('/dashboard');
      } else {
        setError(result.message || 'Apple login failed');
      }
    } catch (err: unknown) {
      // Don't show error if user closed the popup
      if (err && typeof err === 'object' && 'error' in err && err.error === 'popup_closed_by_user') {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Apple';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo />

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Login with your Apple or Google account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="grid gap-6">
              {/* Social Login Buttons */}
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAppleLogin}
                  disabled={loading}
                >
                  <AppleIcon />
                  Login with Apple
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={loading || !googleClientId}
                >
                  <GoogleIcon />
                  Login with Google
                </Button>
              </div>

              {/* Divider */}
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin}>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>

              {/* Sign Up Link */}
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          By clicking continue, you agree to our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}

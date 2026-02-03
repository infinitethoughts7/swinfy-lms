'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AuthAPI } from '@/lib/auth/api';
import { saveTokens, saveUser } from '@/lib/auth/token';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AppleSignInButton from '@/components/auth/AppleSignInButton';
import Logo from '@/components/shared/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('[LoginPage] User authenticated, redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Show loading while redirecting authenticated user
  if (status === 'authenticated') {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Redirecting to dashboard...</span>
        </div>
      </div>
    );
  }

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

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <Logo size="lg" showText={true} href="/" />
        </div>

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
                <AppleSignInButton />
                <GoogleSignInButton />
              </div>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-muted-foreground text-sm">
                    Or continue with
                  </span>
                </div>
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

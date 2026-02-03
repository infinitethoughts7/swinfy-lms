'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthAPI } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AppleSignInButton from '@/components/auth/AppleSignInButton';

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

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await AuthAPI.register({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
        role: 'learner',
      });

      // Registration sends OTP, redirect to verification
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>
              Sign up with your Apple or Google account
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

              {/* Registration Form */}
              <form onSubmit={handleEmailRegister}>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
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
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </div>
              </form>

              {/* Sign In Link */}
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Sign in
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

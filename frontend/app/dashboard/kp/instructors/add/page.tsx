"use client";

import { useState } from 'react';
import { ArrowLeft, Save, User, Lock, AlertCircle } from 'lucide-react';
import { userApi } from '@/features/users/services/user';
import type { InstructorCreateData } from '@/shared/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormData {
  email: string;
  full_name: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AddInstructorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseFieldErrors = (errorMessage: string): FormErrors => {
    const fieldErrors: FormErrors = {};
    const parts = errorMessage.split(';').map(p => p.trim());
    parts.forEach(part => {
      const match = part.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, field, message] = match;
        fieldErrors[field.toLowerCase()] = message;
      }
    });
    return fieldErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSubmitError(null);
    setErrors({});

    try {
      const instructorData: InstructorCreateData = {
        email: formData.email,
        full_name: formData.full_name,
        password: '',
        confirm_password: '',
      };

      await userApi.instructors.create(instructorData);
      alert('Instructor created successfully! An invitation email with login credentials has been sent to their email address.');
      router.push('/dashboard/kp/instructors?success=created');
    } catch (err) {
      if (err instanceof Error) {
        const fieldErrors = parseFieldErrors(err.message);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setSubmitError('Please fix the content issues highlighted below.');
        } else {
          setSubmitError(err.message || 'Failed to create instructor');
        }
      } else {
        setSubmitError('Failed to create instructor');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href="/dashboard/kp/instructors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Instructor</h1>
          <p className="text-gray-600 mt-1">Create a new instructor account</p>
        </div>
      </div>

      <Alert>
        <User className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick Setup</strong> - Just provide basic account details. The instructor can complete their profile after logging in.
        </AlertDescription>
      </Alert>

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className={errors.full_name ? 'border-red-500' : ''}
                placeholder="Enter instructor's full name"
              />
              {errors.full_name && <p className="text-red-600 text-sm">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="instructor@example.com"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>
          </CardContent>
        </Card>

        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p><strong>Secure Password Generation</strong></p>
            <p className="text-sm">A secure, randomly-generated password will be automatically created for this instructor.</p>
            <p className="text-sm text-muted-foreground">The instructor will receive an email with their login credentials and will be prompted to change their password upon first login.</p>
          </AlertDescription>
        </Alert>

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                A secure temporary password is automatically generated
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Instructor receives an invitation email with login credentials
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                They must change their password after first login for security
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                They can complete their profile, bio, specializations, and start creating courses
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/kp/instructors">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Instructor
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

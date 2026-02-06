"use client";

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth/token';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LearnerProfile {
  bio: string | null;
  profile_picture: string | null;
  phone_number: string | null;
  learning_goals: string | null;
  interests: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Enrollment {
  id: string;
  course_title: string;
  course_slug: string;
  status: string;
  enrollment_date: string;
  progress_percentage: number;
  payment_status: string;
  amount_paid: string;
  overall_progress?: string;
  lessons_completed?: number;
  total_lessons?: number;
  last_activity?: string;
}

interface Learner {
  id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  profile: LearnerProfile;
  enrollments: Enrollment[];
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
}

export default function KPLearnersPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      return;
    }
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/kp/learners/`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const learnersList = Array.isArray(data) ? data : (data.results || data.learners || []);
        setLearners(learnersList);
      } else {
        throw new Error('Failed to fetch learners');
      }
    } catch (err) {
      console.error('Error fetching learners:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch learners');
    } finally {
      setLoading(false);
    }
  };

  const filteredLearners = (Array.isArray(learners) ? learners : []).filter(learner =>
    learner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (learner.profile?.phone_number && learner.profile.phone_number.includes(searchTerm)) ||
    (learner.enrollments || []).some(enrollment =>
      enrollment.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <Card>
          <CardContent className="p-3">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border-b">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={fetchLearners}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Our Learners</h1>
          <p className="text-gray-600 text-sm">Manage and view learners in your organization</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-5 w-5" />
          <span className="font-medium">{filteredLearners.length} learners</span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Learners Table */}
      {filteredLearners.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No learners found</h3>
            <p className="text-gray-600 text-sm">
              {learners.length === 0
                ? 'Learners will appear here once they enroll in your courses'
                : 'Try adjusting your search terms'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLearners.map((learner) => (
                <TableRow key={learner.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {(learner.full_name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          {learner.full_name || 'Unknown'}
                          {learner.is_verified && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{learner.email}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm text-gray-600">
                      {learner.profile?.phone_number || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm text-gray-600">{formatDate(learner.created_at)}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

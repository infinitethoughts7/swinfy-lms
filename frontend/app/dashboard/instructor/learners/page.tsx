"use client";

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Calendar,
  BookOpen,
  Target,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth/token';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Learner {
  id: string;
  learner_id: string;
  full_name: string;
  email: string;
  profile_picture: string | null;
  enrollment_date: string;
  progress_percentage: number;
  overall_progress: number;
  lessons_completed: number;
  total_lessons: number;
  course_title: string;
  course_slug: string;
  started_at: string | null;
  completed_at: string | null;
  last_activity: string | null;
}

export default function InstructorLearnersPage() {
  const [allLearners, setAllLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [showModal, setShowModal] = useState(false);

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

      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/instructor/dashboard/learner-progress/`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const learners = data.results || data || [];
        setAllLearners(learners);
      } else {
        throw new Error('Failed to fetch learners');
      }
    } catch (err) {
      console.error('Error fetching learners:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch learners');
      setAllLearners([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLearners = allLearners.filter(learner =>
    learner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (learner.course_title && learner.course_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openModal = (learner: Learner) => {
    setSelectedLearner(learner);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLearner(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatProgress = (progress: number) => {
    return Math.round(progress || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchLearners} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learners</h1>
          <p className="text-gray-600 text-sm">View learners enrolled in your courses</p>
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
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Learners Grid */}
      <Card>
        <CardContent className="p-6">
          {filteredLearners.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {allLearners.length === 0 ? 'No learners found' : 'No learners match your search'}
              </p>
              <p className="text-gray-400 text-sm">
                {allLearners.length === 0
                  ? 'Learners will appear here once they enroll in your courses'
                  : 'Try adjusting your search terms'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredLearners.map((learner) => (
                <Card key={learner.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Profile Picture */}
                      <Avatar className="w-16 h-16">
                        {learner.profile_picture ? (
                          <AvatarImage src={learner.profile_picture} alt={learner.full_name} />
                        ) : null}
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>

                      {/* Learner Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {learner.full_name}
                          </h3>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{learner.email}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3" />
                            <span className="truncate">{learner.course_title}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Enrolled {formatDate(learner.enrollment_date)}</span>
                          </div>
                        </div>

                        {/* Progress Info */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress ({learner.lessons_completed || 0}/{learner.total_lessons || 0} lessons)</span>
                            <span>{formatProgress(learner.progress_percentage || learner.overall_progress)}%</span>
                          </div>
                          <Progress value={formatProgress(learner.progress_percentage || learner.overall_progress)} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          {selectedLearner && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    {selectedLearner.profile_picture ? (
                      <AvatarImage src={selectedLearner.profile_picture} alt={selectedLearner.full_name} />
                    ) : null}
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{selectedLearner.full_name}</DialogTitle>
                    <p className="text-gray-600">{selectedLearner.email}</p>
                    <p className="text-sm text-blue-600">{selectedLearner.course_title}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Course Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Course Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span>{selectedLearner.course_title}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(selectedLearner.enrollment_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Learning Progress</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                        <span>Overall Progress</span>
                        <span className="font-semibold">{formatProgress(selectedLearner.progress_percentage)}%</span>
                      </div>
                      <Progress value={formatProgress(selectedLearner.progress_percentage)} className="h-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-blue-50">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Course Progress</span>
                          </div>
                          <p className="text-xs text-blue-700 mt-1">
                            {formatProgress(selectedLearner.progress_percentage)}% completed
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Status</span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">
                            {formatProgress(selectedLearner.progress_percentage) === 100 ? 'Completed' : 'In Progress'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedLearner.email}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

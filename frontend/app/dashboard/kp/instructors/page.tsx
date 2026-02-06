"use client";

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Plus, Trash2, AlertCircle } from 'lucide-react';
import { userApi } from '@/features/users/services/user';
import type { InstructorListItem } from '@/shared/types';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: { search?: string } = {};
      if (searchTerm) params.search = searchTerm;

      const data = await userApi.instructors.list(params);
      setInstructors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instructors');
      setInstructors([
        {
          id: '1',
          full_name: 'Sathish Kumar',
          email: 'sathish@example.com',
          title: 'Data Scientist',
          specializations: 'Data Science, Machine Learning',
          technologies: 'Python, R, TensorFlow, SQL',
          years_of_experience: 5,
          is_available: true,
          is_active: true,
          is_approved: true,
        },
        {
          id: '2',
          full_name: 'Rani Sharma',
          email: 'rani@example.com',
          title: 'Business Navigation Manager',
          specializations: 'Entrepreneurship Skills, Business Analysis',
          technologies: 'Business Intelligence, Analytics',
          years_of_experience: 8,
          is_available: true,
          is_active: true,
          is_approved: true,
        },
        {
          id: '3',
          full_name: 'Shirisha Patel',
          email: 'shirisha@example.com',
          title: 'Business Analyst',
          specializations: 'Business Insights, Data Analysis',
          technologies: 'Excel, Power BI, SQL',
          years_of_experience: 6,
          is_available: false,
          is_active: true,
          is_approved: true,
        },
        {
          id: '4',
          full_name: 'Sowkya Reddy',
          email: 'sowkya@example.com',
          title: 'Technical Analyst',
          specializations: 'Technical Skills, System Analysis',
          technologies: 'Java, Spring Boot, Microservices',
          years_of_experience: 4,
          is_available: true,
          is_active: true,
          is_approved: true,
        },
        {
          id: '5',
          full_name: 'Pravalika Singh',
          email: 'pravalika@example.com',
          title: 'Wellness and Life Skills Lecturer',
          specializations: 'Life Skills, Career Guidance',
          technologies: 'Soft Skills, Communication',
          years_of_experience: 7,
          is_available: true,
          is_active: true,
          is_approved: true,
        },
        {
          id: '6',
          full_name: 'Shivani Gupta',
          email: 'shivani@example.com',
          title: 'Data Analyst',
          specializations: 'Technical Skills, Data Visualization',
          technologies: 'Python, Tableau, Statistics',
          years_of_experience: 3,
          is_available: true,
          is_active: true,
          is_approved: true,
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleDelete = async (instructorId: string) => {
    try {
      await userApi.instructors.delete(instructorId);
      setInstructors(prev => prev.filter(instructor => instructor.id !== instructorId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete instructor');
    }
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = !searchTerm ||
      instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.technologies.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-10 w-full max-w-md" />
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
          <p className="text-gray-600 text-sm">Manage your knowledge partner instructors</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/kp/instructors/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Instructor
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{instructors.length}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {instructors.filter(i => i.is_active).length}
                </div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredInstructors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
            <p className="text-gray-600 mb-4 text-sm">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by adding your first instructor"
              }
            </p>
            <Button asChild>
              <Link href="/dashboard/kp/instructors/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Instructor
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Title</TableHead>
                <TableHead className="hidden lg:table-cell">Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {(instructor.full_name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{instructor.full_name || 'Unknown'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{instructor.email}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm text-gray-600">{instructor.title || '-'}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm text-gray-600">
                      {instructor.years_of_experience ? `${instructor.years_of_experience} years` : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      instructor.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {instructor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(instructor.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Instructor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this instructor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

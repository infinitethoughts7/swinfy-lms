"use client";

import { useState, useEffect } from 'react';
import {
  Users,
  User,
  Mail,
  Calendar,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth/token';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  role_display: string;
  kp_name?: string;
  is_verified: boolean;
  is_approved: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const safeUsers = Array.isArray(users) ? users : [];

  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      return;
    }
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/super-admin/users/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await authenticatedFetch(url, {
        method: 'GET',
      });

      const data = await response.json();
      const usersArray = data.results || data;
      setUsers(Array.isArray(usersArray) ? usersArray : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = safeUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.kp_name && user.kp_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadgeClassName = (role: string): string => {
    switch (role) {
      case 'learner':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'knowledge_partner':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'knowledge_partner_instructor':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'super_admin':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (user: UserData) => {
    if (!user.is_active) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (!user.is_verified) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    if (!user.is_approved) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (user: UserData) => {
    if (!user.is_active) return { text: 'Inactive', className: 'text-red-600' };
    if (!user.is_verified) return { text: 'Unverified', className: 'text-yellow-600' };
    if (!user.is_approved) return { text: 'Pending', className: 'text-orange-600' };
    return { text: 'Active', className: 'text-green-600' };
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="py-0">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">All Users</CardTitle>
              <CardDescription>View all users in the system (read-only)</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Card className="py-0 bg-blue-50 border-blue-100">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{safeUsers.length}</div>
                  <div className="text-sm text-blue-600">Total Users</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Learners</p>
                <p className="text-2xl font-bold text-green-600">
                  {safeUsers.filter(u => u.role === 'learner').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">KP Admins</p>
                <p className="text-2xl font-bold text-blue-600">
                  {safeUsers.filter(u => u.role === 'knowledge_partner').length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">KP Instructors</p>
                <p className="text-2xl font-bold text-purple-600">
                  {safeUsers.filter(u => u.role === 'knowledge_partner_instructor').length}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold text-red-600">
                  {safeUsers.filter(u => u.is_superuser).length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="learner">Learners</SelectItem>
                  <SelectItem value="knowledge_partner">KP Admins</SelectItem>
                  <SelectItem value="knowledge_partner_instructor">KP Instructors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchUsers}
              className="text-destructive hover:text-destructive/80"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card className="py-0">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter !== 'all'
                ? 'No users match your current filters.'
                : 'No users found in the system.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">User</TableHead>
                <TableHead className="font-medium">Role</TableHead>
                <TableHead className="font-medium">Organization</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Last Login</TableHead>
                <TableHead className="font-medium">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const status = getStatusText(user);
                return (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="py-4">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {getUserInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={getRoleBadgeClassName(user.role)}>
                        {user.role_display}
                      </Badge>
                      {user.is_superuser && (
                        <div className="text-xs text-red-600 font-medium mt-1">Super Admin</div>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-900">
                        {user.kp_name || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user)}
                        <span className={`text-sm ${status.className}`}>
                          {status.text}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-600">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

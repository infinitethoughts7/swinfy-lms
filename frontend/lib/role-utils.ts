/**
 * Utility functions for handling user roles and their display names
 */

export type UserRole = 
  | 'super_admin' 
  | 'knowledge_partner' 
  | 'knowledge_partner_instructor' 
  | 'learner' 
  | 'student' 
  | 'admin' 
  | 'tutor';

/**
 * Convert technical role names to user-friendly display names
 */
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'super_admin': 'Super Admin',
    'knowledge_partner': 'Knowledge Partner',
    'knowledge_partner_instructor': 'Instructor',
    'learner': 'Learner',
    'student': 'Student',
    'admin': 'Admin',
    'tutor': 'Tutor'
  };
  
  return roleMap[role] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Get role badge styling classes for different roles
 */
export const getRoleBadgeClasses = (role: string): string => {
  const badgeMap: Record<string, string> = {
    'super_admin': 'bg-red-100 text-red-800',
    'knowledge_partner': 'bg-blue-100 text-blue-800',
    'knowledge_partner_instructor': 'bg-green-100 text-green-800',
    'learner': 'bg-purple-100 text-purple-800',
    'student': 'bg-purple-100 text-purple-800',
    'admin': 'bg-gray-100 text-gray-800',
    'tutor': 'bg-yellow-100 text-yellow-800'
  };
  
  return badgeMap[role] || 'bg-gray-100 text-gray-800';
};

/**
 * Check if a role has admin privileges
 */
export const isAdminRole = (role: string): boolean => {
  return ['super_admin', 'knowledge_partner', 'admin'].includes(role);
};

/**
 * Check if a role can teach/instruct
 */
export const canTeach = (role: string): boolean => {
  return ['knowledge_partner_instructor', 'tutor'].includes(role);
};

/**
 * Check if a role can learn/enroll in courses
 */
export const canLearn = (role: string): boolean => {
  return ['learner', 'student'].includes(role);
};

// Dashboard Theme Configuration
// Maps OLLA logo colors to user roles for consistent theming

export type UserRole = 
  | 'learner' 
  | 'tutor' 
  | 'admin' 
  | 'knowledge_partner' 
  | 'knowledge_partner_instructor' 
  | 'super_admin';

export interface ThemeColors {
  // Primary colors - main brand color for the role
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  
  // Accent colors - for subtle touches
  accent: string;
  accentLight: string;
  
  // Background variations
  bgLight: string;
  bgMedium: string;
  
  // Text colors
  textOnPrimary: string;
  textOnAccent: string;
  
  // Border colors
  border: string;
  borderLight: string;
}

// Theme configuration based on OLLA logo colors
export const roleThemes: Record<UserRole, ThemeColors> = {
  // 🔵 BLUE - Learner (Trust, Learning, Focus)
  learner: {
    primary: '#3B82F6',        // blue-500
    primaryHover: '#2563EB',   // blue-600
    primaryLight: '#DBEAFE',   // blue-100
    primaryDark: '#1E40AF',    // blue-700
    accent: '#60A5FA',         // blue-400
    accentLight: '#93C5FD',    // blue-300
    bgLight: '#EFF6FF',        // blue-50
    bgMedium: '#BFDBFE',       // blue-200
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#1E3A8A',   // blue-900
    border: '#3B82F6',
    borderLight: '#93C5FD',
  },

  // 🟢 GREEN - Knowledge Partner (Growth, Success, Partnership)
  knowledge_partner: {
    primary: '#10B981',        // emerald-500
    primaryHover: '#059669',   // emerald-600
    primaryLight: '#D1FAE5',   // emerald-100
    primaryDark: '#047857',    // emerald-700
    accent: '#34D399',         // emerald-400
    accentLight: '#6EE7B7',    // emerald-300
    bgLight: '#ECFDF5',        // emerald-50
    bgMedium: '#A7F3D0',       // emerald-200
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#064E3B',   // emerald-900
    border: '#10B981',
    borderLight: '#6EE7B7',
  },

  // 🟡 YELLOW - Instructor (Guidance, Warmth, Teaching)
  knowledge_partner_instructor: {
    primary: '#F59E0B',        // amber-500
    primaryHover: '#D97706',   // amber-600
    primaryLight: '#FEF3C7',   // amber-100
    primaryDark: '#B45309',    // amber-700
    accent: '#FBBF24',         // amber-400
    accentLight: '#FCD34D',    // amber-300
    bgLight: '#FFFBEB',        // amber-50
    bgMedium: '#FDE68A',       // amber-200
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#78350F',   // amber-900
    border: '#F59E0B',
    borderLight: '#FCD34D',
  },

  // 🔴 RED - Super Admin (Power, Authority, Control)
  super_admin: {
    primary: '#EF4444',        // red-500
    primaryHover: '#DC2626',   // red-600
    primaryLight: '#FEE2E2',   // red-100
    primaryDark: '#B91C1C',    // red-700
    accent: '#F87171',         // red-400
    accentLight: '#FCA5A5',    // red-300
    bgLight: '#FEF2F2',        // red-50
    bgMedium: '#FECACA',       // red-200
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#7F1D1D',   // red-900
    border: '#EF4444',
    borderLight: '#FCA5A5',
  },

  // Legacy roles mapped to appropriate colors
  tutor: {
    // Tutors use instructor colors (yellow/amber)
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryLight: '#FEF3C7',
    primaryDark: '#B45309',
    accent: '#FBBF24',
    accentLight: '#FCD34D',
    bgLight: '#FFFBEB',
    bgMedium: '#FDE68A',
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#78350F',
    border: '#F59E0B',
    borderLight: '#FCD34D',
  },

  admin: {
    // Regular admins use green (knowledge partner colors)
    primary: '#10B981',
    primaryHover: '#059669',
    primaryLight: '#D1FAE5',
    primaryDark: '#047857',
    accent: '#34D399',
    accentLight: '#6EE7B7',
    bgLight: '#ECFDF5',
    bgMedium: '#A7F3D0',
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#064E3B',
    border: '#10B981',
    borderLight: '#6EE7B7',
  },
};

// Helper function to get theme for a role
export const getThemeForRole = (role: UserRole): ThemeColors => {
  return roleThemes[role] || roleThemes.learner; // Default to learner theme
};

// Helper function to generate gradient backgrounds
export const getGradientBackground = (role: UserRole): string => {
  const theme = getThemeForRole(role);
  return `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`;
};

// Helper to get role display name with emoji
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    learner: '🔵 Learner',
    knowledge_partner: '🟢 Knowledge Partner',
    knowledge_partner_instructor: '🟡 Instructor',
    super_admin: '🔴 Super Admin',
    tutor: '🟡 Tutor',
    admin: '🟢 Admin',
  };
  return roleNames[role] || role;
};
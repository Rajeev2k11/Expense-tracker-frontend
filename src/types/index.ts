export type Role =
  | 'CEO'
  | 'CTO'
  | 'CFO'
  | 'Founder'
  | 'Manager'
  | 'Team Leader'
  | 'HR'
  | 'Employee'
  | 'Client'
  | 'Designer'
  | 'Developer'
  | 'Marketing'
  | 'Sales'
  | 'Support'
  | string;

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  token: string;
  avatar?: string;
  // Optional fields added for MFA/demo flows
  password?: string;
  passwordSet?: boolean;
  mfaMethod?: 'authenticator' | 'passkey' | null;
  mfaVerified?: boolean;
  passkeys?: Array<{ id: string; attestation?: unknown }>;
  totpSecret?: string;
  invited?: boolean;
  phone?: string;
  location?: string;
  department?: string;
  joinDate?: string;
  bio?: string;
}

export type ExpenseStatus = 'Approved' | 'Pending' | 'Rejected';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  userId: string;
  userName: string;
  status: ExpenseStatus;
  notes?: string;
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  members: User[];
  activeCount: number;
  department?: string;
  monthlyBudget?: number;
}

export interface Transaction {
  id: string;
  icon?: string;
  title: string;
  userName: string;
  date: string;
  status: ExpenseStatus;
  amount: number;
}

export interface DashboardStats {
  totalSpent: number;
  budgetLeft: number;
  pendingApprovals: number;
  activeUsers: number;
}

// New types for Profile Page
export interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  bio: string;
  avatar?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  expenseApprovals: boolean;
  weeklyReports: boolean;
  budgetAlerts: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
}
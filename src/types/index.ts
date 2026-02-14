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
  description?: string;
  team_leader: string; // User ID
  members: string[]; // Array of User IDs
  monthly_budget: number;
  monthly_budget_remaining?: number;
  color?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamWithDetails extends Omit<Team, 'team_leader' | 'members'> {
  team_leader: User;
  members: User[];
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

// User Profile API Types
export interface TeamLeader {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

export interface TeamMember {
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
}

export interface UserProfileTeam {
  id: string;
  name: string;
  description?: string;
  team_leader?: TeamLeader;
  members?: TeamMember[];
  monthly_budget?: number;
  monthly_budget_remaining?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  member_type: string;
}

export interface ReadUserProfileResponse {
  user: UserProfile;
  defaultTeam: UserProfileTeam | null;
  activeTeam: UserProfileTeam | null;
  allTeams: Array<{
    id: string;
    name: string;
  }>;
}
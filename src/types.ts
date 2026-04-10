export type Priority = 'Minor' | 'Major' | 'Critical';
export type Status = 'In Progress' | 'Completed' | 'Pending' | 'High Alert';
export type Category = 'Troubleshooting' | 'Technical Support' | 'Creative & Design' | 'Infrastructure & Network' | 'Maintenance' | 'Web Development';

export interface Activity {
  id: number;
  activity_name: string;
  category: string;
  requester: string;
  department: string;
  it_personnel: string;
  type: string; // Used for priority
  status: string;
  duration: string;
  remarks: string;
  location: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  highAlert: number;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  company?: string;
  department?: string;
  jobTitle?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export interface UserSession {
  device: string;
  browser: string;
  ip: string;
  lastUpdated: string;
  sessionToken: string;
  isCurrent?: boolean;
  location?: string;
}

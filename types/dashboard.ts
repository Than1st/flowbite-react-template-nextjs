export interface ConsumptionRecord {
  id?: number;
  stasiun_id?: number;
  category: "electricity" | "water" | "genset";
  value: number;
  status: boolean;
  description?: string;
  record_date?: string;
  created_at?: string;
  updated_at?: string;
  stasiun_name?: string;
  created_by_name?: string;
  isActive?: boolean;
}

export interface DashboardNotification {
  id: number;
  title: string;
  description: string;
  type?: string;
  notification_type: "error" | "information" | "success" | "warning" | string;
  unread: boolean;
  timestamp: string;
}

export interface UserActivityData {
  id?: number;
  username?: string;
  image?: string | null;
  role?: string;
  stasiun?: string;
  nama?: string;
  nipp?: string;
  posisi?: string;
  activity?: {
    totalChecklist: number;
    closedIssues: number;
    itemCondition?: string;
  };
}

export interface CqiDashboardInfo {
  value: number;
  grade?: string;
  createdAt?: string;
  submittedShiftsCount: number;
}

export interface MonitoringStatusData {
  open: number;
  closed: number;
  pending: number;
  latest_created_at_per_status?: {
    open: string | null;
    closed: string | null;
    pending: string | null;
  };
}

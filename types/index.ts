export interface StationData {
  stasiun_id: number;
  stasiun_name: string;
}

export interface UserData {
  userId: number;
  roleId: number;
  roleName: string;
  username: string;
  nipp: string;
  nama?: string;
  posisi?: string;
  image?: string;
  stasiun_id: number;
  stasiun_name: string;
  stasiun_data?: Array<{ id: number; name: string }>;
  stasiun_ids?: number[];
  stasiun_names?: string[];
  stations?: Array<{ id?: number; stasiun_id?: number; name?: string; stasiun_name?: string }>;
  exp?: number;
  iat?: number;
}

export interface LoginData {
  token: string;
  userData: UserData;
  ssoToken?: string | { token?: string };
}

export interface MonitoringStatus {
  open: number;
  closed: number;
  pending: number;
  latest_created_at_per_status?: {
    open: string | null;
    closed: string | null;
    pending: string | null;
  };
}

export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  type?: string;
  notification_type?: string;
  unread?: boolean;
  created_at?: string;
}

export interface ConsumptionRecord {
  stasiun_id: number;
  category: "electricity" | "water" | "genset";
  value: number;
  status: boolean;
  description: string;
  user_id: number;
}

export interface ReportItem {
  id: number;
  date: string;
  OK: number;
  NOT_OK: number;
  stasiun: { id: number; stasiun_name: string; code?: string };
  created_by: { id: number; username: string; nipp?: string };
  reviewer_by?: { id: number; username: string; nipp?: string };
  approved_by?: { id: number; username: string; nipp?: string };
}

export interface ChecklistItem {
  stasiun_item_id: number;
  condition: boolean;
  comments: string;
  photo_url?: string;
  sub_items?: ChecklistSubItem[];
}

export interface ChecklistSubItem {
  stasiun_item_id: number;
  selected: boolean;
  remarks: string;
  finish_target: string;
  evidence?: string;
}

export interface CqiComponentArea {
  id: number;
  name: string;
  max_scale: number;
  weight: string;
  max_cqi: string;
  options: Array<{ scale: number; label: string }>;
}

export interface CqiSubmitPayload {
  nomor_dokumen: string;
  tanggal: string;
  station_id: number;
  stasiun: string;
  assessor_id: number;
  status: "submitted";
  assessments: Array<{ component_area_id: number; selected_scale: number }>;
}

export type Language = "id" | "en";

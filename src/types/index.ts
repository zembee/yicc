export type UserRole = 'MEMBER' | 'HOUSE_ADMIN' | 'SUPER_ADMIN';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type TransactionType = 'EVENT_ATTENDANCE' | 'MISSION_REWARD' | 'MANUAL_ADJUST' | 'REDEEM';

export interface House {
  id: string;
  name: string;
  color_hex: string;
  total_points: number;
}

export interface UserProfile {
  id: string;
  line_user_id: string;
  email?: string;
  display_name: string;
  picture_url?: string;
  phone_number?: string;
  linkedin_url?: string;
  company_name?: string;
  position?: string;
  industry?: string;
  cohort_batch: string;
  house_id?: string;
  house?: House;
  role: UserRole;
  points_balance: number;
  xp_balance: number;
  attendance_rate: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  location_name: string;
  google_maps_url?: string;
  start_time: string;
  end_time: string;
  reward_points: number;
  reward_xp: number;
  is_mandatory: boolean;
  status: EventStatus;
  isCheckedIn?: boolean;
  isRegisteredForEvent?: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  reward_xp: number;
  is_active: boolean;
  status?: SubmissionStatus | 'NOT_STARTED';
  submission?: MissionSubmission;
}

export interface MissionSubmission {
  id: string;
  mission_id: string;
  mission_title?: string;
  profile_id: string;
  user_name?: string;
  user_picture?: string;
  photo_storage_path: string;
  notes?: string;
  status: SubmissionStatus;
  reviewer_feedback?: string;
  created_at: string;
}

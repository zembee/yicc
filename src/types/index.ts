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
  image_url?: string;
  slug?: string;
  published_date_text?: string;
  author_name?: string;
  gallery_images?: string[];
  content_paragraphs?: string[];
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

export interface CompanyInfo {
  company_prefix?: string;
  company_name_thai?: string;
  company_name_eng?: string;
  founded_year?: string;
  business_position?: string;
  industrial_groups?: string;
  industrial_groups_label?: string;
  business_categories?: string;
  business_categories_label?: string;
  company_description?: string;
  company_address?: string;
  comp_tel_number?: string;
  company_logo_url?: string;
  website_url?: string;
  facebook_url?: string;
  line_id?: string;
  product_banner_url?: string;
}

export interface Participant {
  id: number | string;
  slug?: string;
  name_thai: string;
  nickname_eng: string;
  fullname_eng: string;
  tel_number?: string;
  email?: string;
  gen?: string;
  gen_label?: string;
  star_group?: string;
  star_group_label?: string;
  company_prefix?: string;
  company_name_thai?: string;
  company_name_eng?: string;
  founded_year?: string;
  business_position?: string;
  industrial_groups?: string;
  industrial_groups_label?: string;
  business_categories?: string;
  business_categories_label?: string;
  company_description?: string;
  company_address?: string;
  comp_tel_number?: string;
  profile_picture_url?: string;
  company_logo_url?: string;
  website_url?: string;
  facebook_url?: string;
  line_id?: string;
  product_banner_url?: string;
  companies?: CompanyInfo[];
  raw_meta?: any;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  image_url: string;
  author?: string;
}

export type UserRole = 'MEMBER' | 'HOUSE_ADMIN' | 'SUPER_ADMIN' | 'PENDING';
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
  approval_status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  points_balance: number;
  xp_balance: number;
  attendance_rate: number;
  following_count?: number;
  follower_count?: number;
  tier?: 'Silver' | 'Gold' | 'Platinum';
}

export interface CourseSessionMission {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  reward_xp: number;
  is_active: boolean;
  status?: SubmissionStatus | 'NOT_STARTED';
}

export interface CourseAgendaItem {
  time: string;
  title: string;
}

export interface CourseSpeaker {
  name: string;
  role: string;
  sessions_label?: string;
  image_url?: string;
}

export interface CourseFaqItem {
  question: string;
  answer: string;
}

export interface CourseSession {
  id: string;
  session_number: number;
  title: string;
  date_text: string;
  time_text: string;
  start_time: string;
  end_time: string;
  location_name: string;
  instructor?: string;
  reward_points: number;
  isCheckedIn?: boolean;
  checkin_window_text?: string;
  mission_deadline_text?: string;
  agenda?: CourseAgendaItem[];
  missions?: CourseSessionMission[];
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
  event_type?: 'general' | 'course';
  fee_member?: number;
  fee_guest?: number;
  max_seats?: number;
  registered_count?: number;
  sessions?: CourseSession[];
  is_sample_schedule?: boolean;
  schedule_summary_text?: string;
  duration_summary_text?: string;
  certificate_requirement_text?: string;
  registration_deadline_text?: string;
  learning_outcomes?: string[];
  interest_topics?: string[];
  speakers?: CourseSpeaker[];
  faqs?: CourseFaqItem[];
  contact_phone?: string;
  contact_line?: string;
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
  event_id?: string;
  event_title?: string;
  event_type?: 'general' | 'course';
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
  content_paragraphs?: string[];
  gallery_images?: string[];
  image_url: string;
  author?: string;
}

export type PrivilegeCategory =
  | 'All'
  | 'Events'
  | 'Food & Drink'
  | 'Shopping'
  | 'Entertainment'
  | 'Travel'
  | 'Lifestyle';

export interface PrivilegeItem {
  id: string;
  title: string;
  merchant: string;
  discount_label: string;
  category: Exclude<PrivilegeCategory, 'All'>;
  points_required: number;
  expiry_date: string;
  image_url: string;
  description: string;
  conditions: string[];
  how_to_use: string[];
  is_featured?: boolean;
}

export type NotificationCategory = 'general' | 'chat';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  time_ago: string;
  is_read: boolean;
  link?: string;
  icon_type?: 'birthday' | 'announcement' | 'event' | 'chat' | 'reward';
}

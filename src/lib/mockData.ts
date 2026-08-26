import { UserProfile, House, EventItem, Mission, MissionSubmission, Participant, NewsItem } from '@/types';
import participantsRaw from './yftiParticipantsData.json';

export const yftiParticipants: Participant[] = participantsRaw as Participant[];

export const mockHouses: House[] = [
  { id: 'the_sun', name: 'The Sun ☀️', color_hex: '#F59E0B', total_points: 1850 },
  { id: 'earth', name: 'Earth 🌍', color_hex: '#10B981', total_points: 1720 },
  { id: 'jupiter', name: 'Jupiter 🪐', color_hex: '#EA580C', total_points: 1980 },
  { id: 'the_mars', name: 'Mars 🔴', color_hex: '#EF4444', total_points: 1640 },
  { id: 'mercury', name: 'Mercury ⚪', color_hex: '#64748B', total_points: 1530 },
  { id: 'neptune', name: 'Neptune 🌊', color_hex: '#2563EB', total_points: 1890 },
  { id: 'saturn', name: 'Saturn 🪐', color_hex: '#D97706', total_points: 1610 },
  { id: 'uranus', name: 'Uranus ❄️', color_hex: '#06B6D4', total_points: 1490 },
  { id: 'venus', name: 'Venus ✨', color_hex: '#EC4899', total_points: 1760 },
];

export const mockCurrentUser: UserProfile = {
  id: 'u-yfti11',
  line_user_id: 'U_demo_yfti11',
  display_name: 'yfti11 (Admin / Member)',
  picture_url: 'https://yfticonnect.com/wp-content/uploads/2026/02/69.พงศ์พิชาญ-ธนสิริพูนสิน.jpg',
  email: 'yfti11@yfticonnect.com',
  phone_number: '082-269-9962',
  linkedin_url: 'https://linkedin.com',
  company_name: 'Young FTI Executive Hub',
  position: 'Executive Member & Committee',
  industry: 'เทคโนโลยี',
  cohort_batch: 'YFTI Cohort 11',
  house_id: 'the_mars',
  house: mockHouses[3],
  role: 'SUPER_ADMIN',
  points_balance: 450,
  xp_balance: 1820,
  attendance_rate: 92.0,
};

export const mockEvents: EventItem[] = [
  {
    id: 'e1',
    title: 'พิธีปิดหลักสูตร YOUNG FTI ELITE รุ่นที่ 11',
    description: 'พิธีปิดหลักสูตรและมอบวุฒิบัตรแก่ผู้สำเร็จการศึกษาหลักสูตร Young FTI ELITE รุ่นที่ 11 พร้อมงานกาล่าดินเนอร์ฉลองความสำเร็จ',
    location_name: 'The St. Regis Bangkok, Grand Ballroom',
    google_maps_url: 'https://maps.google.com',
    start_time: '2025-05-24T18:00:00.000Z',
    end_time: '2025-05-24T22:30:00.000Z',
    reward_points: 150,
    reward_xp: 350,
    is_mandatory: true,
    status: 'COMPLETED',
    isCheckedIn: true,
  },
  {
    id: 'e2',
    title: 'ภาพบรรยากาศการอบรมโครงการ Young FTI Elite รุ่นที่ 11',
    description: 'การสัมมนาเข้มข้นหัวข้อ "Industrial Transformation & Global Supply Chain Resilience" โดยวิทยากรชั้นนำระดับประเทศ',
    location_name: 'Waldorf Astoria Bangkok',
    google_maps_url: 'https://maps.google.com',
    start_time: '2025-05-17T09:00:00.000Z',
    end_time: '2025-05-17T17:00:00.000Z',
    reward_points: 100,
    reward_xp: 250,
    is_mandatory: true,
    status: 'COMPLETED',
    isCheckedIn: true,
  },
  {
    id: 'e3',
    title: 'กิจกรรม Y11 Friendship ณ Hard rock Maldives',
    description: 'ทริปกระชับมิตรและเจรจาขยายโอกาสความร่วมมือทางธุรกิจระดับนานาชาติ ณ สาธารณรัฐมัลดีฟส์',
    location_name: 'Hard Rock Hotel Maldives',
    google_maps_url: 'https://maps.google.com',
    start_time: '2025-04-28T08:00:00.000Z',
    end_time: '2025-05-02T20:00:00.000Z',
    reward_points: 200,
    reward_xp: 500,
    is_mandatory: false,
    status: 'COMPLETED',
    isCheckedIn: true,
  },
  {
    id: 'e4',
    title: 'Executive Speed Networking & Business Matching',
    description: 'กิจกรรมเจรจาจับคู่ธุรกิจข้าม House และแลกเปลี่ยนความร่วมมือทางอุตสาหกรรมในเครือข่ายสภาอุตสาหกรรม',
    location_name: 'Park Hyatt Bangkok, Penthouse Grill',
    google_maps_url: 'https://maps.google.com',
    start_time: new Date(Date.now() + 86400000 * 5).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 5 + 14400000).toISOString(),
    reward_points: 80,
    reward_xp: 200,
    is_mandatory: false,
    status: 'UPCOMING',
    isCheckedIn: false,
  },
  {
    id: 'e5',
    title: 'Young FTI Elite Synergy Masterclass 2026',
    description: 'คลาสเรียนพิเศษถอดบทเรียนการบริหารองค์กรยุค AI Automation และ Green Industry',
    location_name: 'The Okura Prestige Bangkok',
    google_maps_url: 'https://maps.google.com',
    start_time: new Date(Date.now() + 86400000 * 12).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 12 + 18000000).toISOString(),
    reward_points: 120,
    reward_xp: 300,
    is_mandatory: true,
    status: 'UPCOMING',
    isCheckedIn: false,
  }
];

export const mockNews: NewsItem[] = [
  {
    id: 'n1',
    title: 'เปิดรับสมัครนักอุตสาหกรรมรุ่นใหม่ Young FTI ELITE รุ่นถัดไป',
    date: '2026-06-15',
    category: 'ประกาศโครงการ',
    summary: 'สภาอุตสาหกรรมแห่งประเทศไทยเปิดรับสมัครผู้บริหารและทายาทธุรกิจอุตสาหกรรมเข้าร่วมโครงการ',
    content: 'หลักสูตรพัฒนาศักยภาพผู้บริหารระดับสูงและทายาทธุรกิจอุตสาหกรรมรุ่นใหม่ เพื่อสร้างเครือข่ายความร่วมมือและขับเคลื่อนเศรษฐกิจไทยสู่เวทีสากล',
    image_url: 'https://yfticonnect.com/wp-content/uploads/2026/05/Young-FTI-11-477-scaled.jpg',
    author: 'YFTI Committee'
  },
  {
    id: 'n2',
    title: 'สรุปภาพรวมความสำเร็จโครงการ Young FTI ELITE 11 สร้างมูลค่าพันธมิตรทางธุรกิจกว่า 500 ล้านบาท',
    date: '2025-05-30',
    category: 'ข่าวสารความสำเร็จ',
    summary: 'สมาชิกในรุ่นสามารถจับคู่ธุรกิจ (Synergy) และสร้างโครงการร่วมมือใหม่มากกว่า 40 โครงการ',
    content: 'ตลอดระยะเวลาของหลักสูตร สมาชิกทั้ง 9 กลุ่มดวงดาว ได้ร่วมกันทำภารกิจและสร้างเครือข่ายธุรกิจที่เข้มแข็ง ส่งเสริมการเติบโตอย่างยั่งยืน',
    image_url: 'https://yfticonnect.com/wp-content/uploads/2026/05/Y11_04042025_284-scaled.jpg',
    author: 'YFTI News'
  },
  {
    id: 'n3',
    title: 'ทริปมิตรภาพ Y11 Friendship ณ มัลดีฟส์ เชื่อมโยงความผูกพันและเครือข่ายระดับสากล',
    date: '2025-05-05',
    category: 'กิจกรรมสัมพันธ์',
    summary: 'กิจกรรมแลกเปลี่ยนประสบการณ์และสร้างความผูกพันระหว่างสมาชิก ณ Hard Rock Hotel Maldives',
    content: 'สมาชิก YFTI 11 ได้ร่วมกิจกรรม Team Building และเจรจาโอกาสทางธุรกิจในบรรยากาศผ่อนคลายริมทะเล',
    image_url: 'https://yfticonnect.com/wp-content/uploads/2026/05/Maldives-Davilsnap-Day2-3_461-scaled.jpg',
    author: 'YFTI Media'
  }
];

export const mockGalleryImages = [
  'https://yfticonnect.com/wp-content/uploads/2026/05/Y11_04042025_284-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/Y11_04042025_365-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/Y11_04042025_113-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/KIM05966-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/DSC00451-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/YFTI-Pattaya-24-Jan-25-130-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/Young-FTI-11-477-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/Young-FTI-11-480-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/Maldives-Davilsnap-Day2-3_461-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/Maldives-Davilsnap-Day2-3_220-scaled.jpg',
  'https://yfticonnect.com/wp-content/uploads/2026/05/Young-FTI-11-308-scaled.jpg'
];

export const mockMissions: Mission[] = [
  {
    id: 'm1',
    title: 'Seatmate Snap 📸',
    description: 'ถ่ายรูปคู่กับเพื่อนร่วมโต๊ะหรือเพื่อนต่าง House ในคลาสเรียน แล้วอัปโหลดเพื่อสะสมแต้ม',
    reward_points: 30,
    reward_xp: 80,
    is_active: true,
    status: 'APPROVED',
  },
  {
    id: 'm2',
    title: 'Mentor Connect 1-on-1 ☕',
    description: 'นัดทานกาแฟหรือคุยแลกเปลี่ยนมุมมองธุรกิจกับวิทยากรหรือ Mentor ประจำกลุ่ม',
    reward_points: 80,
    reward_xp: 200,
    is_active: true,
    status: 'PENDING',
  },
  {
    id: 'm3',
    title: 'Business Cross-Collab 🤝',
    description: 'ริเริ่มโปรเจกต์หรือจับคู่ธุรกิจ (Synergy) ร่วมกับสมาชิกในรุ่นอย่างน้อย 1 ธุรกิจ',
    reward_points: 150,
    reward_xp: 400,
    is_active: true,
    status: 'NOT_STARTED',
  },
];

// Convert participants into UserProfile array for legacy hooks
export const mockDirectory: UserProfile[] = yftiParticipants.map((p, idx) => {
  const house = mockHouses.find(h => h.id === p.star_group) || mockHouses[idx % mockHouses.length];
  return {
    id: String(p.id),
    line_user_id: `U_YFTI_${p.id}`,
    display_name: `${p.name_thai}${p.nickname_eng ? ` (${p.nickname_eng})` : ''}`,
    picture_url: p.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name_thai}`,
    phone_number: p.tel_number,
    company_name: p.company_name_thai || p.company_name_eng,
    position: p.business_position,
    industry: p.industrial_groups_label,
    cohort_batch: p.gen_label || 'YFTI 11',
    house_id: house.id,
    house: house,
    role: idx === 0 ? 'SUPER_ADMIN' : idx % 5 === 0 ? 'HOUSE_ADMIN' : 'MEMBER',
    points_balance: 200 + (idx * 23) % 400,
    xp_balance: 800 + (idx * 47) % 1200,
    attendance_rate: 80 + (idx * 3) % 21,
  };
});

export const mockPendingSubmissions: MissionSubmission[] = [
  {
    id: 'sub-1',
    mission_id: 'm2',
    mission_title: 'Mentor Connect 1-on-1 ☕',
    profile_id: 'u-yfti11',
    user_name: 'yfti11 (Admin / Member)',
    user_picture: 'https://yfticonnect.com/wp-content/uploads/2026/02/69.พงศ์พิชาญ-ธนสิริพูนสิน.jpg',
    photo_storage_path: 'https://yfticonnect.com/wp-content/uploads/2026/05/Young-FTI-11-477-scaled.jpg',
    notes: 'ประชุมยุทธศาสตร์ความร่วมมือธุรกิจร่วมกับประธานสภาอุตสาหกรรม',
    status: 'PENDING',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'sub-2',
    mission_id: 'm1',
    mission_title: 'Seatmate Snap 📸',
    profile_id: '3294',
    user_name: 'พิชญา เตชะกิจเกรียงไกร (Bam)',
    user_picture: 'https://yfticonnect.com/wp-content/uploads/2026/02/52.พิชญา-เตชะกิจเกรียงไกร.jpg',
    photo_storage_path: 'https://yfticonnect.com/wp-content/uploads/2026/05/Y11_04042025_365-scaled.jpg',
    notes: 'ถ่ายรูปคู่กระชับมิตรกับทีม Jupiter ในช่วงคลาสเช้า',
    status: 'PENDING',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

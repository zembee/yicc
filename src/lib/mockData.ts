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
    slug: 'พิธีปิดหลักสูตร-young-fti-elite-รุ่นท',
    title: 'พิธีปิดหลักสูตร YOUNG FTI ELITE รุ่นที่ 11',
    description: 'รวบรวมภาพกิจกรรม บรรยากาศความสนุก และความประทับใจตลอดงานพิธีปิดหลักสูตร YOUNG FTI ELITE รุ่นที่ 11 การมอบประกาศนียบัตร และฉลองจบหลักสูตร ณ โรงแรมเรเนซองส์ กรุงเทพ ราชประสงค์ จัดขึ้นเมื่อวันที่ 23 พฤษภาคม 2568',
    location_name: 'โรงแรมเรเนซองส์ กรุงเทพ ราชประสงค์ (Renaissance Bangkok Ratchaprasong)',
    google_maps_url: 'https://maps.app.goo.gl/renaissance-bangkok',
    start_time: '2025-05-24T18:00:00.000Z',
    end_time: '2025-05-24T22:30:00.000Z',
    reward_points: 150,
    reward_xp: 350,
    is_mandatory: true,
    status: 'COMPLETED',
    image_url: '/images/events/25680523-Y11-YoungFTI_1683-scaled.jpg',
    author_name: 'admin',
    published_date_text: '24 พฤษภาคม 2025',
    content_paragraphs: [
      'รวบรวมภาพกิจกรรม บรรยากาศความสนุก และความประทับใจตลอดงานพิธีปิดหลักสูตร YOUNG FTI ELITE รุ่นที่ 11 การมอบประกาศนียบัตร และฉลองจบหลักสูตร ณ โรงแรมเรเนซองส์ กรุงเทพ ราชประสงค์ จัดขึ้นเมื่อวันที่ 23 พฤษภาคม 2568'
    ],
    gallery_images: [
      '/images/events/gallery-closing/2R6_0973-1024x776.jpg',
      '/images/events/gallery-closing/2R6_1346-1024x776.jpg',
      '/images/events/gallery-closing/2R6_1497-1024x776.jpg',
      '/images/events/gallery-closing/2R6_1751-1024x776.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_22-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_29-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_39-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_102-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_105-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_113-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_155-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_158-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_167-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_168-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_174-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_220-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_249-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_264-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_267-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_287-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_304-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_311-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_334-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_371-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_387-683x1024.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_401-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_407-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_432-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_446-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_461-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_476-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_499-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_529-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_534-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_563-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_566-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_593-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_605-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_614-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_621-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_638-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_641-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_656-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_725-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_738-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_780-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_804-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_830-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_872-1024x683.jpg',
      '/images/events/gallery-closing/25680523-Y11-YoungFTI_884-1024x683.jpg'
    ],
    isCheckedIn: true,
  },
  {
    id: 'e2',
    slug: 'ภาพบรรยากาศการอบรมโครง',
    title: 'ภาพบรรยากาศการอบรมโครงการ Young FTI Elite รุ่นที่ 11',
    description: 'ภาพบรรยากาศการสัมมนาและอบรมเชิงลึกเพื่อพัฒนาศักยภาพผู้บริหารและนักอุตสาหกรรมรุ่นใหม่ โดยคณาจารย์และวิทยากรผู้เชี่ยวชาญระดับประเทศ',
    location_name: 'สภาอุตสาหกรรมแห่งประเทศไทย',
    google_maps_url: 'https://maps.google.com',
    start_time: '2025-05-17T09:00:00.000Z',
    end_time: '2025-05-17T17:00:00.000Z',
    reward_points: 100,
    reward_xp: 250,
    is_mandatory: true,
    status: 'COMPLETED',
    image_url: '/images/events/Y11-YoungFTI-Earth_225-scaled.jpg',
    author_name: 'admin',
    published_date_text: '17 พฤษภาคม 2025',
    content_paragraphs: [
      'ประมวลภาพบรรยากาศการอบรมและสัมมนาเข้มข้นในโครงการ Young FTI Elite รุ่นที่ 11 ซึ่งมุ่งเน้นการสร้างวิสัยทัศน์ผู้บริหารยุคใหม่ การแลกเปลี่ยนประสบการณ์จริง และการสร้างความร่วมมือข้ามภาคอุตสาหกรรม'
    ],
    gallery_images: [
      '/images/events/Y11-YoungFTI-Earth_225-scaled.jpg'
    ],
    isCheckedIn: true,
  },
  {
    id: 'e3',
    slug: 'กิจกรรมทริปเดินทางท่อง-2',
    title: 'กิจกรรม Y11 Friendship ณ Hard rock Maldives',
    description: 'ทริปกระชับมิตรและเปิดประสบการณ์ระดับนานาชาติ สานสัมพันธ์และแลกเปลี่ยนมุมมองธุรกิจระหว่างสมาชิก Young FTI Elite รุ่น 11 ณ Hard Rock Hotel Maldives',
    location_name: 'Hard Rock Hotel Maldives',
    google_maps_url: 'https://maps.google.com',
    start_time: '2025-04-28T08:00:00.000Z',
    end_time: '2025-05-02T20:00:00.000Z',
    reward_points: 200,
    reward_xp: 500,
    is_mandatory: false,
    status: 'COMPLETED',
    image_url: '/images/events/Maldives-Davilsnap-Day2-3_627-scaled.jpg',
    author_name: 'admin',
    published_date_text: '28 เมษายน 2025',
    content_paragraphs: [
      'ภาพความประทับใจทริป Young FTI Elite 11 ณ มัลดีฟส์ กิจกรรมกระชับมิตร สานต่อความสัมพันธ์ทางธุรกิจ และการสร้างพันธมิตรเครือข่ายระดับสากล'
    ],
    gallery_images: [
      '/images/events/Maldives-Davilsnap-Day2-3_627-scaled.jpg'
    ],
    isCheckedIn: true,
  },
  {
    id: 'e4',
    slug: 'ศึกษาดูงาน-บริษัท-ธนากรผ',
    title: 'ศึกษาดูงาน บริษัท ธนากรผลิตภัณฑ์น้ำมันพืช จำกัด',
    description: 'การศึกษาดูงานนวัตกรรมกระบวนการสกัดและผลิตน้ำมันพืชมาตรฐานสากล พร้อมเรียนรู้การจัดการซัพพลายเชนและความยั่งยืนในภาคอุตสาหกรรมอาหาร',
    location_name: 'บริษัท ธนากรผลิตภัณฑ์น้ำมันพืช จำกัด',
    google_maps_url: 'https://maps.google.com',
    start_time: '2025-04-05T09:00:00.000Z',
    end_time: '2025-04-05T16:00:00.000Z',
    reward_points: 100,
    reward_xp: 250,
    is_mandatory: false,
    status: 'COMPLETED',
    image_url: '/images/events/Y11_04042025_366-scaled.jpg',
    author_name: 'admin',
    published_date_text: '5 เมษายน 2025',
    content_paragraphs: [
      'ศึกษาดูงาน ณ บริษัท ธนากรผลิตภัณฑ์น้ำมันพืช จำกัด เพื่อศึกษาเทคโนโลยีการผลิตที่ทันสมัย มาตรฐานความปลอดภัยระดับสากล และแนวทางการขับเคลื่อนอุตสาหกรรมที่เป็นมิตรต่อสิ่งแวดล้อม'
    ],
    gallery_images: [
      '/images/events/Y11_04042025_366-scaled.jpg'
    ],
    isCheckedIn: false,
  },
  {
    id: 'e5',
    slug: 'กิจกรรมทริปเดินทางท่อง',
    title: 'กิจกรรมศึกษาดูงานต่างประเทศ ณ ประเทศฝรั่งเศส',
    description: 'ทริปการศึกษาดูงานนวัตกรรมอุตสาหกรรม แฟชั่น พลังงานสะอาด และเทคโนโลยีชั้นนำระดับสากล ณ กรุงปารีส ประเทศฝรั่งเศส',
    location_name: 'Paris, France',
    google_maps_url: 'https://maps.google.com',
    start_time: '2025-03-17T09:00:00.000Z',
    end_time: '2025-03-23T18:00:00.000Z',
    reward_points: 250,
    reward_xp: 600,
    is_mandatory: false,
    status: 'COMPLETED',
    image_url: '/images/events/KIM05966-1-scaled.jpg',
    author_name: 'admin',
    published_date_text: '17 มีนาคม 2025',
    content_paragraphs: [
      'ทริปการศึกษาดูงานองค์กรและอุตสาหกรรมชั้นนำในประเทศฝรั่งเศส เสริมสร้างความรู้ด้าน Green Transition และ Digital Transformation ในระดับสากล'
    ],
    gallery_images: [
      '/images/events/KIM05966-1-scaled.jpg'
    ],
    isCheckedIn: false,
  },
  {
    id: 'e6',
    slug: 'กิจกรรม-ice-breaking-young-fti11-ณ-พัทยา',
    title: 'กิจกรรมละลายพฤติกรรม Young FTI รุ่น 11 ณ พัทยา จ.ชลบุรี',
    description: 'กิจกรรมสร้างความคุ้นเคย ละลายพฤติกรรม (Ice Breaking) และแบ่งบ้านประจำกลุ่มเพื่อสร้างความสามัคคีและพลังเครือข่าย',
    location_name: 'Pattaya, Chonburi',
    google_maps_url: 'https://maps.google.com',
    start_time: '2025-01-27T09:00:00.000Z',
    end_time: '2025-01-29T17:00:00.000Z',
    reward_points: 150,
    reward_xp: 350,
    is_mandatory: true,
    status: 'COMPLETED',
    image_url: '/images/events/YFTI-Pattaya-24-Jan-25-557-scaled.jpg',
    author_name: 'admin',
    published_date_text: '27 มกราคม 2025',
    content_paragraphs: [
      'กิจกรรม Ice Breaking ณ พัทยา ชลบุรี เสริมสร้างความสนิทสนม การทำงานร่วมกันเป็นทีม และการรวมพลังของนักอุตสาหกรรมรุ่นใหม่'
    ],
    gallery_images: [
      '/images/events/YFTI-Pattaya-24-Jan-25-557-scaled.jpg'
    ],
    isCheckedIn: true,
  },
  {
    id: 'e7',
    slug: 'พิธีเปิดหลักสูตร-young-fti-elite-รุ่น',
    title: 'พิธีเปิดหลักสูตร Young FTI ELITE รุ่นที่ 11 และปฐมนิเทศ',
    description: 'การเปิดตัวอย่างเป็นทางการ ปาฐกถาพิเศษจากประธานสภาอุตสาหกรรมแห่งประเทศไทย และการปฐมนิเทศผู้เข้าร่วมอบรมหลักสูตร Young FTI Elite รุ่นที่ 11',
    location_name: 'The Athenee Hotel Bangkok',
    google_maps_url: 'https://maps.google.com',
    start_time: '2025-01-18T09:00:00.000Z',
    end_time: '2025-01-18T18:00:00.000Z',
    reward_points: 150,
    reward_xp: 350,
    is_mandatory: true,
    status: 'COMPLETED',
    image_url: '/images/events/Young-FTI-11-995-scaled.jpg',
    author_name: 'admin',
    published_date_text: '18 มกราคม 2025',
    content_paragraphs: [
      'พิธีเปิดหลักสูตร Young FTI ELITE รุ่นที่ 11 และการปฐมนิเทศอย่างเป็นทางการ ณ โรงแรม ดิ แอทธินี โฮเทล แบงค็อก'
    ],
    gallery_images: [
      '/images/events/Young-FTI-11-995-scaled.jpg'
    ],
    isCheckedIn: true,
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

import { CourseAgendaItem, CourseSession, EventItem } from '@/types';
import { MissionSubmissionRecord } from '@/components/profile/profileUtils';

const CHECKIN_KEY_PREFIX = 'yfti_course_session_checkins';

const THAI_SHORT_WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const THAI_FULL_WEEKDAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function readCourseSessionCheckins(profileId?: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const key = profileId ? `${CHECKIN_KEY_PREFIX}_${profileId}` : CHECKIN_KEY_PREFIX;
    const raw =
      localStorage.getItem(key) ?? (profileId ? localStorage.getItem(CHECKIN_KEY_PREFIX) : null);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeCourseSessionCheckin(
  sessionId: string,
  checkedIn: boolean,
  profileId?: string
): Record<string, boolean> {
  const current = readCourseSessionCheckins(profileId);
  const next = { ...current, [sessionId]: checkedIn };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CHECKIN_KEY_PREFIX, JSON.stringify(next));
      if (profileId) {
        localStorage.setItem(`${CHECKIN_KEY_PREFIX}_${profileId}`, JSON.stringify(next));
      }
    } catch {}
  }
  return next;
}

export interface SessionDateMeta {
  daysUntil: number;
  isToday: boolean;
  isFuture: boolean;
  countdownLabel: string;
  weekdayShort: string;
  weekdayFull: string;
  dayNumber: string;
  monthShort: string;
  fullDateThai: string;
}

export function getSessionDateMeta(
  session: CourseSession,
  forceTodaySessionId?: string | null
): SessionDateMeta {
  const d = new Date(session.start_time);
  const isValid = !Number.isNaN(d.getTime());

  if (!isValid) {
    return {
      daysUntil: 0,
      isToday: true,
      isFuture: false,
      countdownLabel: 'วันนี้',
      weekdayShort: 'ส.',
      weekdayFull: 'เสาร์',
      dayNumber: '12',
      monthShort: 'ธ.ค.',
      fullDateThai: session.date_text,
    };
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const rawDiff = Math.round((targetStart - todayStart) / 86400000);
  const daysUntil = forceTodaySessionId === session.id ? 0 : rawDiff;

  const isToday = daysUntil === 0;
  const isFuture = daysUntil > 0;
  const countdownLabel = isToday
    ? 'วันนี้'
    : isFuture
    ? `อีก ${daysUntil} วัน`
    : 'เปิดเช็กชื่อ';

  const weekdayShort = THAI_SHORT_WEEKDAYS[d.getDay()];
  const weekdayFull = THAI_FULL_WEEKDAYS[d.getDay()];
  const dayNumber = String(d.getDate());
  const monthShort = THAI_SHORT_MONTHS[d.getMonth()];
  const fullDateThai = `${weekdayFull} ${dayNumber} ${monthShort} ${d.getFullYear()}`;

  return {
    daysUntil,
    isToday,
    isFuture,
    countdownLabel,
    weekdayShort,
    weekdayFull,
    dayNumber,
    monthShort,
    fullDateThai,
  };
}

export function getSessionAgenda(session: CourseSession): CourseAgendaItem[] {
  if (session.agenda && session.agenda.length > 0) {
    return session.agenda;
  }
  const isAfternoonOnly = session.time_text.startsWith('13:');
  if (isAfternoonOnly) {
    return [
      { time: '13:00', title: 'ลงทะเบียนและเช็กชื่อเข้าคลาส' },
      { time: '13:30', title: session.title },
      { time: '15:00', title: 'Workshop และแลกเปลี่ยนกรณีศึกษา' },
      { time: '16:00', title: 'นำเสนอผลงานกลุ่มและสรุปคลาส' },
    ];
  }
  return [
    { time: '09:00', title: 'ลงทะเบียนและเช็กชื่อเข้าคลาส' },
    { time: '09:30', title: `${session.title.replace(/^Module \d+:\s*/i, '')} & Case Study` },
    { time: '13:00', title: 'Workshop เชิงปฏิบัติการประจำคลาส' },
    { time: '16:00', title: 'นำเสนอผลงานกลุ่มและสรุปคลาส' },
  ];
}

export function getSessionMaxPoints(session: CourseSession): number {
  const missionPts = (session.missions || []).reduce((acc, m) => acc + (m.reward_points || 0), 0);
  return (session.reward_points || 0) + missionPts;
}

export interface CourseSummary {
  sessions: CourseSession[];
  totalSessions: number;
  attendedSessions: number;
  totalMissions: number;
  completedMissions: number;
  earnedPoints: number;
  totalPossiblePoints: number;
  progressPercent: number;
  nextSession: CourseSession | null;
}

export function getCourseSummary(
  course: EventItem,
  sessionCheckins: Record<string, boolean> = {},
  missionRecords: Record<string, MissionSubmissionRecord> = {}
): CourseSummary {
  const rawSessions = course.sessions || [];
  const sessions: CourseSession[] = rawSessions.map((s) => ({
    ...s,
    isCheckedIn:
      sessionCheckins[s.id] !== undefined ? Boolean(sessionCheckins[s.id]) : Boolean(s.isCheckedIn),
  }));

  const totalSessions = sessions.length;
  const attendedSessions = sessions.filter((s) => s.isCheckedIn).length;

  let totalMissions = 0;
  let completedMissions = 0;
  let earnedPoints = 0;
  let totalPossiblePoints = 0;

  for (const s of sessions) {
    totalPossiblePoints += s.reward_points || 0;
    if (s.isCheckedIn) {
      earnedPoints += s.reward_points;
    }
    for (const m of s.missions || []) {
      totalMissions += 1;
      totalPossiblePoints += m.reward_points || 0;
      const status = missionRecords[m.id]?.status || m.status || 'NOT_STARTED';
      if (status === 'APPROVED' || status === 'PENDING') {
        completedMissions += 1;
      }
      if (status === 'APPROVED') {
        earnedPoints += m.reward_points;
      }
    }
  }

  const totalUnits = totalSessions + totalMissions;
  const completedUnits = attendedSessions + completedMissions;
  const progressPercent =
    totalUnits > 0 ? Math.min(100, Math.round((completedUnits / totalUnits) * 100)) : 0;

  const nextSession = sessions.find((s) => !s.isCheckedIn) || null;

  return {
    sessions,
    totalSessions,
    attendedSessions,
    totalMissions,
    completedMissions,
    earnedPoints,
    totalPossiblePoints: totalPossiblePoints || course.reward_points,
    progressPercent,
    nextSession,
  };
}

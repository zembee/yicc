import { CourseSession, EventItem } from '@/types';
import { MissionSubmissionRecord } from '@/components/profile/profileUtils';

const CHECKIN_KEY_PREFIX = 'yfti_course_session_checkins';

export function readCourseSessionCheckins(profileId?: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const key = profileId ? `${CHECKIN_KEY_PREFIX}_${profileId}` : CHECKIN_KEY_PREFIX;
    const raw = localStorage.getItem(key) ?? (profileId ? localStorage.getItem(CHECKIN_KEY_PREFIX) : null);
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

export interface CourseSummary {
  sessions: CourseSession[];
  totalSessions: number;
  attendedSessions: number;
  totalMissions: number;
  completedMissions: number;
  earnedPoints: number;
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

  for (const s of sessions) {
    if (s.isCheckedIn) {
      earnedPoints += s.reward_points;
    }
    for (const m of s.missions || []) {
      totalMissions += 1;
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
    progressPercent,
    nextSession,
  };
}

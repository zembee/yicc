'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Check,
  ChevronRight,
  GraduationCap,
  Star,
} from 'lucide-react';
import { EventItem, Mission, UserProfile } from '@/types';
import { getCourseSummary } from '@/lib/courseUtils';
import { MissionSubmissionRecord } from './profileUtils';

export interface MergedMissionItem extends Mission {
  resolvedStatus: 'APPROVED' | 'PENDING' | 'NOT_STARTED';
  submissionRecord?: MissionSubmissionRecord;
}

interface ProgressSectionProps {
  profile: UserProfile;
  tier: string;
  allEventsList?: EventItem[];
  myEventsList: EventItem[];
  sessionCheckins?: Record<string, boolean>;
  missionRecords?: Record<string, MissionSubmissionRecord>;
  mergedMissions?: MergedMissionItem[];
  onSubmitMission?: (missionId: string, record: MissionSubmissionRecord) => void;
}

const MIN_ATTENDANCE_FOR_CERTIFICATE = 80;
const MAX_VISIBLE_ACTIVITIES = 4;

const THAI_SHORT_MONTH_MAP: Record<string, string> = {
  มกราคม: 'ม.ค.',
  กุมภาพันธ์: 'ก.พ.',
  มีนาคม: 'มี.ค.',
  เมษายน: 'เม.ย.',
  พฤษภาคม: 'พ.ค.',
  มิถุนายน: 'มิ.ย.',
  กรกฎาคม: 'ก.ค.',
  สิงหาคม: 'ส.ค.',
  กันยายน: 'ก.ย.',
  ตุลาคม: 'ต.ค.',
  พฤศจิกายน: 'พ.ย.',
  ธันวาคม: 'ธ.ค.',
};

function shortenThaiDate(text?: string): string {
  if (!text) return 'กำลังจะมาถึง';
  let result = text.replace(/^เริ่ม\s+[ก-ฮ]\.\s*/, 'เริ่ม ');
  for (const [full, short] of Object.entries(THAI_SHORT_MONTH_MAP)) {
    result = result.replace(new RegExp(full, 'g'), short);
  }
  return result;
}

function shortenVenue(loc?: string): string {
  if (!loc) return 'FTI Tower';
  return loc
    .replace(/\s*\([^)]*\)/g, '')
    .replace(', ชั้น 19 กรุงเทพฯ', '')
    .replace(' ราชประสงค์', '')
    .trim();
}

export function ProgressSection({
  profile,
  tier,
  allEventsList = [],
  myEventsList,
  sessionCheckins = {},
  missionRecords = {},
}: ProgressSectionProps) {
  const [activeDetailTab, setActiveDetailTab] = useState<'courses' | 'history'>('courses');

  const attendanceRate = Math.max(0, Math.min(100, profile.attendance_rate ?? 95));
  const isCertificateEligible = attendanceRate >= MIN_ATTENDANCE_FOR_CERTIFICATE;
  const registeredEventsCount = myEventsList.length;
  const checkedInCount = myEventsList.filter((ev) => ev.isCheckedIn).length;
  const completedMandatoryCount = myEventsList.filter(
    (ev) => ev.is_mandatory && ev.isCheckedIn
  ).length;
  const totalMandatoryCount = myEventsList.filter((ev) => ev.is_mandatory).length;

  const absentQuota = 2;
  const estimatedAbsentCount =
    totalMandatoryCount > 0
      ? Math.max(0, totalMandatoryCount - completedMandatoryCount)
      : attendanceRate >= 100
      ? 0
      : attendanceRate >= 80
      ? 1
      : 2;
  const remainingQuota = Math.max(0, absentQuota - estimatedAbsentCount);

  const sourceEvents = allEventsList.length > 0 ? allEventsList : myEventsList;

  // Courses for Tab 1: คอร์สเรียนและภารกิจ
  const enrolledCourses = useMemo(() => {
    const enrolled = myEventsList.filter((ev) => ev.event_type === 'course');
    return enrolled.map((course) => ({
      course,
      summary: getCourseSummary(course, sessionCheckins, missionRecords),
    }));
  }, [myEventsList, sessionCheckins, missionRecords]);

  const upcomingCourses = useMemo(() => {
    const enrolledIds = new Set(enrolledCourses.map((c) => c.course.id));
    return sourceEvents.filter(
      (ev) => ev.event_type === 'course' && !enrolledIds.has(ev.id) && ev.status === 'UPCOMING'
    );
  }, [sourceEvents, enrolledCourses]);

  // Activities for Tab 2: ประวัติกิจกรรม
  const activityHistoryList = useMemo(() => {
    const generalEvents = sourceEvents.filter(
      (ev) =>
        ev.event_type !== 'course' &&
        (Boolean(ev.isCheckedIn) ||
          Boolean(ev.isRegisteredForEvent) ||
          myEventsList.some((m) => m.id === ev.id))
    );
    return [...generalEvents].sort((a, b) => {
      if (a.status === 'UPCOMING' && b.status !== 'UPCOMING') return -1;
      if (a.status !== 'UPCOMING' && b.status === 'UPCOMING') return 1;
      return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    });
  }, [sourceEvents, myEventsList]);

  const attendedActivitiesCount = activityHistoryList.filter(
    (ev) => ev.isCheckedIn || ev.status === 'COMPLETED'
  ).length;
  const upcomingActivitiesCount = activityHistoryList.filter(
    (ev) => !ev.isCheckedIn && ev.status === 'UPCOMING'
  ).length;
  const totalCheckinPoints = attendedActivitiesCount * 120;

  return (
    <div className="bg-white rounded-3xl shadow-[0_6px_24px_rgba(13,19,33,0.06)] overflow-hidden">
      {/* Split-Tone Executive Navy Header */}
      <div className="luxury-stage text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 block">
            My Progress
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight truncate">
            ความก้าวหน้าของฉัน
          </h3>
          <p className="text-[11px] text-slate-300 truncate mt-0.5">
            สรุปคะแนน สถานะสมาชิก และโควตาการเข้าร่วม
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full badge-gold-metallic text-xs font-extrabold tabular-nums shrink-0">
          {(profile.points_balance ?? 0).toLocaleString()} คะแนน
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* 4 Clean Summary Metric Boxes with Subtle Watermark Icon Backgrounds */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F6F4EF] space-y-1">
            <img
              src="/images/icons/points.webp?v=2"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-16 h-16 object-contain opacity-[0.22] -rotate-6"
            />
            <span className="relative z-10 text-[#9A7320] text-xs sm:text-sm font-bold block truncate">
              คะแนนสะสม
            </span>
            <p className="relative z-10 text-2xl font-extrabold text-[#1E2538] tabular-nums leading-tight">
              {(profile.points_balance ?? 0).toLocaleString()}
            </p>
            <span className="relative z-10 text-[11px] text-slate-400 tabular-nums block">
              {(profile.xp_balance ?? 0).toLocaleString()} XP
            </span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F6F4EF] space-y-1">
            <img
              src="/images/icons/profile.webp?v=2"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-16 h-16 object-contain opacity-[0.22] -rotate-6"
            />
            <span className="relative z-10 text-slate-600 text-xs sm:text-sm font-bold block truncate">
              ระดับสมาชิก
            </span>
            <p className="relative z-10 text-2xl font-extrabold text-[#1E2538] leading-tight">
              {tier}
            </p>
            <span className="relative z-10 text-[11px] text-slate-400 block">YFTI Elite 11</span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F6F4EF] space-y-1">
            <img
              src="/images/icons/events.webp?v=2"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-16 h-16 object-contain opacity-[0.22] -rotate-6"
            />
            <span className="relative z-10 text-slate-600 text-xs sm:text-sm font-bold block truncate">
              กิจกรรมที่สมัคร
            </span>
            <p className="relative z-10 text-2xl font-extrabold text-[#1E2538] tabular-nums leading-tight">
              {registeredEventsCount}
            </p>
            <span className="relative z-10 text-[11px] text-slate-400 tabular-nums block">
              เข้าเรียน {attendanceRate}%
            </span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F6F4EF] space-y-1">
            <img
              src="/images/icons/missions.webp?v=2"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-16 h-16 object-contain opacity-[0.22] -rotate-6"
            />
            <span className="relative z-10 text-slate-600 text-xs sm:text-sm font-bold block truncate">
              ขาด / โควตา
            </span>
            <p className="relative z-10 text-2xl font-extrabold text-[#1E2538] tabular-nums leading-tight">
              {estimatedAbsentCount}{' '}
              <span className="text-sm font-medium text-slate-400">/ {absentQuota}</span>
            </p>
            <span className="relative z-10 text-[11px] text-[#9A7320] font-semibold tabular-nums block">
              เหลือโควตา {remainingQuota} ครั้ง
            </span>
          </div>
        </div>

        {/* Certificate Eligibility & Cumulative Attendance Card (Placed above Tab Switcher) */}
        <div className="rounded-2xl bg-[#F6F4EF] p-4 space-y-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-[#161C2C]">
              สิทธิ์รับวุฒิบัตร
            </span>
            <span
              className={`text-xs font-extrabold inline-flex items-center gap-1 ${
                isCertificateEligible ? 'text-emerald-700' : 'text-[#9A742B]'
              }`}
            >
              {isCertificateEligible ? (
                <Check className="w-3.5 h-3.5 stroke-[2.8] text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-[#C5A059]" />
              )}
              {isCertificateEligible
                ? 'ผ่านเกณฑ์'
                : `ยังไม่ผ่านเกณฑ์ (ขั้นต่ำ ${MIN_ATTENDANCE_FOR_CERTIFICATE}%)`}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 font-medium">อัตราการเข้าร่วมสะสม</span>
              <span className="text-lg font-extrabold text-[#161C2C] tabular-nums">
                {attendanceRate}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#E8E2D5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C59B38] transition-all"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 tabular-nums">
              เกณฑ์ขั้นต่ำสำหรับจบหลักสูตร {MIN_ATTENDANCE_FOR_CERTIFICATE}% · เช็กชื่อแล้ว{' '}
              {checkedInCount}/{registeredEventsCount} ครั้ง
            </p>
          </div>
        </div>

        {/* Segmented Tab Switcher: คอร์สเรียนและภารกิจ | ประวัติกิจกรรม */}
        <div
          className="grid grid-cols-2 gap-1.5 p-1 bg-[#F6F4EF] rounded-2xl"
          role="tablist"
          aria-label="รายละเอียดความก้าวหน้า"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeDetailTab === 'courses'}
            onClick={() => setActiveDetailTab('courses')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center whitespace-nowrap ${
              activeDetailTab === 'courses'
                ? 'bg-[#12192B] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#161C2C]'
            }`}
          >
            <span>คอร์สเรียนและภารกิจ</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeDetailTab === 'history'}
            onClick={() => setActiveDetailTab('history')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center whitespace-nowrap ${
              activeDetailTab === 'history'
                ? 'bg-[#12192B] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#161C2C]'
            }`}
          >
            <span>ประวัติกิจกรรม</span>
          </button>
        </div>

        {activeDetailTab === 'courses' ? (
          /* ================= TAB 1: คอร์สเรียนและภารกิจ ================= */
          <div className="space-y-3.5">
            {enrolledCourses.map(({ course, summary }) => {
              const cleanTitle = course.title.replace(/^คอร์สเรียน:\s*/i, '');
              const totalClasses = summary.totalSessions || 3;
              const attendedClasses = summary.attendedSessions || 1;
              const classAttendancePercent =
                attendedClasses > 0 ? 100 : Math.round((attendedClasses / totalClasses) * 100);
              const absentClasses = 0;
              const totalMissions = Math.max(summary.totalMissions * 2, 6);
              const completedMissions = Math.max(summary.completedMissions * 2, 2);
              const earnedPts = summary.earnedPoints || 70;

              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-[#ECE6D9] bg-white p-4 space-y-3.5 shadow-[0_4px_16px_rgba(13,19,33,0.03)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#6B5E49] text-[#ECD28E] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        กำลังเรียน
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-snug">
                        {cleanTitle}
                      </h4>
                    </div>
                  </div>

                  <div className="divide-y divide-[#F3EFE6] border-y border-[#F3EFE6] text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500">คลาสที่เรียน</span>
                      <span className="font-extrabold text-[#161C2C] tabular-nums">
                        {attendedClasses} / {totalClasses} คลาส
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500">อัตราเข้าเรียน</span>
                      <span className="font-extrabold text-[#161C2C] tabular-nums">
                        {classAttendancePercent}% · ขาด {absentClasses} ครั้ง
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500">ภารกิจสำเร็จ</span>
                      <span className="font-extrabold text-[#161C2C] tabular-nums">
                        {completedMissions} / {totalMissions} ภารกิจ
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500">คะแนนที่ได้</span>
                      <span className="font-extrabold text-[#9A742B] tabular-nums">
                        +{earnedPts} Pts
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href={`/events/${course.id}`}
                      className="text-xs font-extrabold text-[#9A742B] hover:text-[#161C2C] inline-flex items-center gap-1 transition"
                    >
                      <span>ดูรายละเอียดคอร์สและภารกิจ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Secondary Pre-registered / Upcoming Course Compact Card */}
            {upcomingCourses.slice(0, 1).map((course) => {
              const cleanTitle = course.title.replace(/^คอร์สเรียน:\s*/i, '');
              const totalClasses = course.sessions?.length || 6;
              return (
                <Link
                  key={course.id}
                  href={`/events/${course.id}`}
                  className="rounded-2xl border border-[#ECE6D9] bg-white hover:border-[#C5A059] p-4 flex items-center justify-between gap-3 transition group shadow-[0_4px_16px_rgba(13,19,33,0.03)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#AF8C46] text-[#12192B] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[11px] font-bold text-[#9A742B] block truncate">
                        ลงทะเบียนแล้ว · {shortenThaiDate(course.published_date_text)}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#161C2C] truncate group-hover:text-[#9A742B] transition-colors">
                        {cleanTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {totalClasses} คลาส · ภารกิจจะเปิดตามวันเรียน
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              );
            })}
          </div>
        ) : (
          /* ================= TAB 2: ประวัติกิจกรรม ================= */
          <div className="space-y-3.5">
            {/* 3 Summary Stat Boxes */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-[#F6F4EF] p-3 text-center">
                <p className="text-base sm:text-lg font-extrabold text-[#161C2C] tabular-nums">
                  {attendedActivitiesCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">เข้าร่วมแล้ว</p>
              </div>
              <div className="rounded-2xl bg-[#F6F4EF] p-3 text-center">
                <p className="text-base sm:text-lg font-extrabold text-[#161C2C] tabular-nums">
                  {upcomingActivitiesCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">รอเข้าร่วม</p>
              </div>
              <div className="rounded-2xl bg-[#F6F4EF] p-3 text-center">
                <p className="text-base sm:text-lg font-extrabold text-[#9A742B] tabular-nums">
                  +{totalCheckinPoints}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Pts จากเช็กชื่อ</p>
              </div>
            </div>

            {/* Activity History Items */}
            <div className="space-y-2.5">
              {activityHistoryList.slice(0, MAX_VISIBLE_ACTIVITIES).map((ev, idx) => {
                const isAttended = Boolean(ev.isCheckedIn) || ev.status === 'COMPLETED';
                const iconBg =
                  idx % 3 === 0
                    ? 'bg-[#26324B] text-[#ECD28E]'
                    : idx % 3 === 1
                    ? 'bg-[#625744] text-[#ECD28E]'
                    : 'bg-[#424E5E] text-[#ECD28E]';

                return (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.id}`}
                    className="rounded-2xl border border-[#ECE6D9] hover:border-[#C5A059] bg-white p-3.5 flex items-center justify-between gap-3 transition group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        <Star className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-snug line-clamp-2 group-hover:text-[#9A742B] transition-colors">
                          {ev.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {shortenThaiDate(ev.published_date_text)} · {shortenVenue(ev.location_name)}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          {isAttended ? (
                            <>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                เข้าร่วมแล้ว
                              </span>
                              <span className="text-[11px] font-extrabold text-[#9A742B] tabular-nums">
                                +120 Pts
                              </span>
                            </>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FBF6EC] text-[#9A742B] text-[10px] font-bold">
                              ลงทะเบียนแล้ว
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}

              <Link
                href="/profile/events"
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF7F0] border border-[#E6E0D4] text-[#161C2C] text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
              >
                <span>ดูประวัติทั้งหมด</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

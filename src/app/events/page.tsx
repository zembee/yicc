'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mockEvents, mockHouses, mockMissions } from '@/lib/mockData';
import { useLiffAuth } from '@/contexts/LiffContext';
import { EventItem } from '@/types';
import { EventsPageSkeleton } from '@/components/ui/PageSkeletons';
import { getCourseSummary, readCourseSessionCheckins } from '@/lib/courseUtils';
import {
  MissionSubmissionRecord,
  normalizeMissionRecords,
  safeReadLocalStorage,
} from '@/components/profile/profileUtils';
import {
  CalendarDays,
  Search,
  X,
  Trophy,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Crown,
} from 'lucide-react';

const THAI_SHORT_WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
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

function computeDaysLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'เร็วๆ นี้';
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((targetStart - todayStart) / 86400000);
  if (diff <= 0) return 'วันนี้';
  return `อีก ${diff} วัน`;
}

function formatTimeRange(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '09:00–16:00 น.';
  return `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(
    2,
    '0'
  )}–${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')} น.`;
}

function CircularProgressRing({ percent }: { percent: number }) {
  const size = 48;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EFECE4"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#B68D40"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[11px] font-extrabold text-[#161C2C] tabular-nums">
        {clamped}%
      </span>
    </div>
  );
}

function Trophy3DIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="w-9 h-9 shrink-0">
      <path
        d="M11 10H7.5C6.7 10 6 10.7 6 11.5V13.5C6 16.8 8.5 19.5 11.8 19.9M29 10H32.5C33.3 10 34 10.7 34 11.5V13.5C34 16.8 31.5 19.5 28.2 19.9"
        stroke="#C5A059"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M11 8H29V16.5C29 21.5 25 25.5 20 25.5C15 25.5 11 21.5 11 16.5V8Z"
        fill="url(#trophyCupGrad)"
      />
      <path d="M20 12.2L21.1 14.5L23.6 14.8L21.8 16.6L22.2 19.1L20 17.9L17.8 19.1L18.2 16.6L16.4 14.8L18.9 14.5L20 12.2Z" fill="#FFF8E0" />
      <rect x="18" y="25" width="4" height="5" fill="#B68D40" />
      <rect x="13" y="30" width="14" height="4" rx="1.5" fill="#334155" />
      <defs>
        <linearGradient id="trophyCupGrad" x1="11" y1="8" x2="29" y2="25.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5E6BE" />
          <stop offset="0.5" stopColor="#D5B36A" />
          <stop offset="1" stopColor="#9A742B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Podium3DIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="w-8 h-8 shrink-0">
      <path d="M20 6L21.2 8.5L24 8.9L22 10.8L22.5 13.5L20 12.2L17.5 13.5L18 10.8L16 8.9L18.8 8.5L20 6Z" fill="#ECD28E" />
      <rect x="15" y="16" width="10" height="17" rx="2" fill="url(#podGold)" />
      <rect x="6" y="21" width="9" height="12" rx="2" fill="#475569" />
      <rect x="25" y="23" width="9" height="10" rx="2" fill="#785A32" />
      <text x="20" y="26.5" textAnchor="middle" fill="#12192B" fontSize="8" fontWeight="800">
        1
      </text>
      <text x="10.5" y="29" textAnchor="middle" fill="#E2E8F0" fontSize="7" fontWeight="700">
        2
      </text>
      <text x="29.5" y="30" textAnchor="middle" fill="#F5E6BE" fontSize="7" fontWeight="700">
        3
      </text>
      <defs>
        <linearGradient id="podGold" x1="15" y1="16" x2="25" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECD28E" />
          <stop offset="1" stopColor="#B68D40" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function EventsContent() {
  const searchParams = useSearchParams();
  const { profile } = useLiffAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [allEvents, setAllEvents] = useState<EventItem[]>(mockEvents);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [sessionCheckins, setSessionCheckins] = useState<Record<string, boolean>>({});
  const [missionRecords, setMissionRecords] = useState<Record<string, MissionSubmissionRecord>>({});

  const [showAllEnrolled, setShowAllEnrolled] = useState(false);
  const [showAllOpenCourses, setShowAllOpenCourses] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const myEventsScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeMyEventIdx, setActiveMyEventIdx] = useState(0);

  const coursesSectionRef = useRef<HTMLDivElement | null>(null);
  const activitiesSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const custom: EventItem[] = JSON.parse(localStorage.getItem('yfti_custom_events') || '[]');
        if (Array.isArray(custom) && custom.length > 0) {
          setAllEvents([...custom, ...mockEvents]);
        }
        const regs = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
        if (Array.isArray(regs)) {
          setRegisteredEventIds(
            regs
              .filter((r: any) => r.status === 'APPROVED')
              .map((r: any) => String(r.eventId))
          );
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    setSessionCheckins(readCourseSessionCheckins(profile?.id));
    const scopedKey = profile?.id ? `yfti_mission_submissions_${profile.id}` : null;
    const rawScoped = scopedKey ? safeReadLocalStorage<unknown>(scopedKey, null) : null;
    const rawLegacy =
      rawScoped === null ? safeReadLocalStorage<unknown>('yfti_mission_submissions', null) : null;
    setMissionRecords(normalizeMissionRecords(rawScoped ?? rawLegacy));
  }, [profile?.id]);

  useEffect(() => {
    const cat = searchParams?.get('category');
    if (cat === 'general' && activitiesSectionRef.current) {
      setTimeout(() => {
        activitiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [searchParams]);

  const q = searchQuery.trim().toLowerCase();
  const matchesQuery = (ev: EventItem) => {
    if (!q) return true;
    const hay = `${ev.title} ${ev.description || ''} ${ev.location_name || ''}`.toLowerCase();
    return hay.includes(q);
  };

  // 1. Enrolled Courses (คอร์สที่กำลังเรียน)
  const enrolledCourses = useMemo(() => {
    return allEvents
      .filter(
        (ev) =>
          ev.event_type === 'course' &&
          (Boolean(ev.isRegisteredForEvent) || registeredEventIds.includes(String(ev.id))) &&
          matchesQuery(ev)
      )
      .map((course) => ({
        course,
        summary: getCourseSummary(course, sessionCheckins, missionRecords),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents, registeredEventIds, sessionCheckins, missionRecords, q]);

  // 2. Newly Opened Courses (คอร์สเรียนเปิดใหม่)
  const openCourses = useMemo(() => {
    return allEvents.filter(
      (ev) =>
        ev.event_type === 'course' &&
        ev.status === 'UPCOMING' &&
        !ev.isRegisteredForEvent &&
        !registeredEventIds.includes(String(ev.id)) &&
        matchesQuery(ev)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents, registeredEventIds, q]);

  // 3. Member's Upcoming Activities (กิจกรรมของคุณที่จะมาถึง)
  const myUpcomingActivities = useMemo(() => {
    const list = allEvents.filter(
      (ev) =>
        ev.event_type !== 'course' &&
        ev.status === 'UPCOMING' &&
        (Boolean(ev.isRegisteredForEvent) || registeredEventIds.includes(String(ev.id))) &&
        matchesQuery(ev)
    );
    const fallback =
      list.length > 0
        ? list
        : allEvents.filter(
            (ev) => ev.event_type !== 'course' && ev.status === 'UPCOMING' && matchesQuery(ev)
          );
    return [...fallback]
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents, registeredEventIds, q]);

  // 4. Featured / All Activities (กิจกรรมที่น่าสนใจ)
  const featuredActivities = useMemo(() => {
    return allEvents.filter((ev) => ev.event_type !== 'course' && matchesQuery(ev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents, q]);

  // Aggregate Header Stats
  const stats = useMemo(() => {
    let attended = 0;
    let totalSessions = 0;
    let doneMissions = 0;
    let totalMissions = 0;

    for (const item of enrolledCourses) {
      attended += item.summary.attendedSessions;
      totalSessions += item.summary.totalSessions;
      doneMissions += item.summary.completedMissions;
      totalMissions += item.summary.totalMissions;
    }

    for (const m of mockMissions) {
      totalMissions += 1;
      const st = missionRecords[m.id]?.status || m.status || 'NOT_STARTED';
      if (st === 'APPROVED' || st === 'PENDING') doneMissions += 1;
    }

    return {
      attended: attended || 2,
      totalSessions: totalSessions || 5,
      doneMissions: doneMissions || 3,
      totalMissions: totalMissions || 8,
    };
  }, [enrolledCourses, missionRecords]);

  // House Leaderboard Calculation
  const sortedHouses = useMemo(
    () => [...mockHouses].sort((a, b) => b.total_points - a.total_points),
    []
  );

  const normalizedHouseId = (profile?.house_id || profile?.house?.id || 'the_sun').replace(
    /-/g,
    '_'
  );
  const myHouseIndex = sortedHouses.findIndex(
    (h) => h.id.toLowerCase() === normalizedHouseId.toLowerCase()
  );
  const myHouse = myHouseIndex >= 0 ? sortedHouses[myHouseIndex] : sortedHouses[0];
  const myHouseRank = myHouseIndex >= 0 ? myHouseIndex + 1 : 2;
  const points = profile?.points_balance ?? 360;

  const handleMyEventsScroll = () => {
    const el = myEventsScrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveMyEventIdx(Math.max(0, Math.min(myUpcomingActivities.length - 1, idx)));
  };

  const visibleEnrolled = showAllEnrolled ? enrolledCourses : enrolledCourses.slice(0, 2);
  const visibleActivities = showAllActivities ? featuredActivities : featuredActivities.slice(0, 3);

  const hasAnyResults =
    enrolledCourses.length > 0 || openCourses.length > 0 || featuredActivities.length > 0;

  return (
    <div className="w-full bg-[#F6F4EF] text-[#161C2C] pb-4">
      {/* ================= 1. OBSIDIAN DASHBOARD STAGE ================= */}
      <section className="relative overflow-hidden luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)]">
        <div className="relative z-10 max-w-4xl mx-auto space-y-3.5">
          {/* Top Title & Calendar Button */}
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl tracking-tight text-white truncate">
              <span className="font-extrabold">คอร์สเรียน</span>
              <span className="font-light text-white/85">และกิจกรรม</span>
            </h1>

            <Link
              href="/events/calendar"
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-[#C5A059]/45 text-[#ECD28E] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>ปฏิทินกิจกรรม</span>
            </Link>
          </div>

          {/* 2-Column Personal Progress Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* Left: คะแนนของฉัน */}
            <Link
              href="/privileges"
              className="rounded-[20px] bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.10] p-3.5 flex flex-col justify-between min-h-[104px] transition"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-300">คะแนนของฉัน</span>
                <img
                  src="/images/icons/points.webp?v=2"
                  alt=""
                  aria-hidden="true"
                  className="w-8 h-8 object-contain shrink-0 -mt-0.5"
                />
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white tabular-nums leading-none">
                    {points.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-[#ECD28E]">Pts</span>
                </div>
                <p className="text-[11px] font-semibold text-[#DFC27D]">+120 สัปดาห์นี้</p>
              </div>
            </Link>

            {/* Right: การเข้าเรียนและภารกิจ */}
            <div className="rounded-[20px] bg-white/[0.05] border border-white/[0.10] p-3.5 flex flex-col justify-between min-h-[104px]">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-300 leading-snug">
                  การเข้าเรียนและภารกิจ
                </span>
                <img
                  src="/images/icons/events.webp?v=2"
                  alt=""
                  aria-hidden="true"
                  className="w-8 h-8 object-contain shrink-0 -mt-0.5"
                />
              </div>

              <div className="grid grid-cols-2 divide-x divide-white/12 pt-1.5">
                <div className="pr-2">
                  <p className="text-lg sm:text-xl font-extrabold text-white tabular-nums leading-none">
                    {stats.attended}
                    <span className="text-xs font-normal text-slate-400">
                      /{stats.totalSessions}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">เข้าเรียน</p>
                </div>

                <div className="pl-3">
                  <p className="text-lg sm:text-xl font-extrabold text-white tabular-nums leading-none">
                    {stats.doneMissions}
                    <span className="text-xs font-normal text-slate-400">
                      /{stats.totalMissions}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">ภารกิจ</p>
                </div>
              </div>
            </div>
          </div>

          {/* House Score & Rank Banner */}
          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="w-full text-left rounded-[20px] bg-gradient-to-r from-[#26211B]/90 via-[#1D1D26]/90 to-[#181E2E]/90 hover:brightness-110 border border-[#C5A059]/35 px-4 py-3 flex items-center justify-between gap-3 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Trophy3DIcon />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-300 truncate">คะแนนดาว {myHouse.name}</p>
                <p className="text-base sm:text-lg font-extrabold text-white tabular-nums leading-tight mt-0.5">
                  {myHouse.total_points.toLocaleString()}{' '}
                  <span className="text-xs font-bold text-[#ECD28E]">Pts</span>
                </p>
              </div>
            </div>

            <div className="h-9 w-px bg-white/12 shrink-0" />

            <div className="flex items-center gap-2.5 shrink-0">
              <Podium3DIcon />
              <div>
                <p className="text-[11px] text-slate-300">อันดับกลุ่ม</p>
                <p className="text-base sm:text-lg font-extrabold text-white tabular-nums leading-tight mt-0.5">
                  {myHouseRank}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#ECD28E]" />
            </div>
          </button>
        </div>
      </section>

      {/* ================= 2. MAIN CONTENT SECTIONS ================= */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* Crisp White Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อกิจกรรม คอร์สเรียน หรือสถานที่..."
            className="w-full pl-10 pr-9 py-3 bg-white text-[#161C2C] rounded-2xl text-xs sm:text-sm font-medium placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#C5A059] shadow-[0_4px_18px_rgba(13,19,33,0.05)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="ล้างคำค้นหา"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!hasAnyResults && (
          <div className="py-14 text-center bg-white rounded-[24px] shadow-[0_6px_20px_rgba(13,19,33,0.05)] text-xs text-slate-500 space-y-2">
            <CalendarDays className="w-8 h-8 text-slate-300 mx-auto" />
            <p>ไม่พบคอร์สเรียนหรือกิจกรรมที่ตรงกับคำค้นหา</p>
          </div>
        )}

        {/* SECTION 1: คอร์สที่กำลังเรียน */}
        {enrolledCourses.length > 0 && (
          <section ref={coursesSectionRef} className="space-y-3 scroll-mt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
                  คอร์สที่กำลังเรียน
                </h2>
                <span className="w-5 h-5 rounded-full bg-[#12192B] text-[#ECD28E] text-[11px] font-extrabold flex items-center justify-center tabular-nums">
                  {enrolledCourses.length}
                </span>
              </div>

              {enrolledCourses.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowAllEnrolled((prev) => !prev)}
                  className="text-xs font-bold text-[#9A742B] hover:text-[#161C2C] transition"
                >
                  {showAllEnrolled ? 'ย่อรายการ' : 'แสดงทั้งหมด'}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {visibleEnrolled.map(({ course, summary }) => {
                const cleanTitle = course.title.replace(/^คอร์สเรียน:\s*/i, '');
                return (
                  <Link
                    key={course.id}
                    href={`/events/${course.id}`}
                    className="bg-white rounded-[22px] p-3.5 sm:p-4 shadow-[0_6px_22px_rgba(13,19,33,0.05)] hover:shadow-[0_10px_28px_rgba(13,19,33,0.09)] transition flex items-center gap-3.5 group"
                  >
                    <div className="w-[68px] h-[68px] rounded-[16px] overflow-hidden bg-[#6C6251] shrink-0">
                      <img
                        src={
                          course.image_url ||
                          'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/event_training.webp'
                        }
                        alt={cleanTitle}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[10px] font-extrabold text-[#9A742B] block">
                        {course.is_mandatory ? 'วิชาบังคับ' : 'คอร์สเลือก'}
                      </span>
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#161C2C] line-clamp-2 leading-snug group-hover:text-[#9A742B] transition-colors">
                        {cleanTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5 tabular-nums">
                        <span>
                          {summary.attendedSessions}/{summary.totalSessions} บทเรียน
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-[#B68D40]" />
                          <span>ภารกิจ</span>
                          <strong className="font-extrabold text-[#161C2C]">
                            {summary.completedMissions}/{summary.totalMissions}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <CircularProgressRing percent={summary.progressPercent} />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 2: คอร์สเรียนเปิดใหม่ */}
        {openCourses.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
                คอร์สเรียนเปิดใหม่
              </h2>
              <button
                type="button"
                onClick={() => setShowAllOpenCourses((prev) => !prev)}
                className="text-xs font-bold text-[#9A742B] hover:text-[#161C2C] transition"
              >
                {showAllOpenCourses ? 'แบบสไลด์' : 'แสดงทั้งหมด'}
              </button>
            </div>

            <div
              className={
                showAllOpenCourses
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                  : 'flex gap-3.5 overflow-x-auto pb-2 snap-x no-scrollbar -mr-4 pr-4 sm:mr-0 sm:pr-0'
              }
            >
              {openCourses.map((course) => {
                const cleanTitle = course.title.replace(/^คอร์สเรียน:\s*/i, '');
                const totalSessions = course.sessions?.length || 1;
                const fee = course.fee_member ?? 12900;
                const maxSeats = course.max_seats ?? 30;
                const leftSeats = Math.max(0, maxSeats - (course.registered_count ?? 18));

                return (
                  <div
                    key={course.id}
                    className={`${
                      showAllOpenCourses ? 'w-full' : 'w-[262px] sm:w-[290px] shrink-0 snap-start'
                    } bg-white rounded-[22px] overflow-hidden shadow-[0_8px_24px_rgba(13,19,33,0.06)] flex flex-col justify-between group`}
                  >
                    <Link
                      href={`/events/${course.id}`}
                      className="block relative h-[138px] bg-[#59685A] overflow-hidden"
                    >
                      {course.image_url && (
                        <img
                          src={course.image_url}
                          alt={cleanTitle}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/55 via-transparent to-[#0D1321]/30" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-[#12192B]/85 backdrop-blur-md text-[#ECD28E] text-[10px] font-bold">
                          เปิดรับสมัคร
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-white text-[#161C2C] text-[10px] font-extrabold tabular-nums shadow-sm">
                          +{course.reward_points} Pts
                        </span>
                      </div>
                    </Link>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <Link href={`/events/${course.id}`} className="block space-y-1.5">
                        <h3 className="text-xs sm:text-sm font-extrabold text-[#161C2C] line-clamp-2 leading-snug group-hover:text-[#9A742B] transition-colors">
                          {cleanTitle}
                        </h3>

                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                          <Calendar className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                          <span className="truncate">
                            {course.published_date_text || 'เร็วๆ นี้'} · {totalSessions} ครั้ง
                          </span>
                        </p>

                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                          <span className="truncate">{course.location_name}</span>
                        </p>
                      </Link>

                      <div className="pt-1 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-base font-extrabold text-[#161C2C] tabular-nums leading-tight">
                            {fee > 0 ? `฿${fee.toLocaleString()}` : 'เรียนฟรี'}
                          </p>
                          <p className="text-[10px] text-slate-500 tabular-nums">
                            เหลือ <strong className="font-bold text-[#9A4236]">{leftSeats}</strong>/
                            {maxSeats} ที่นั่ง
                          </p>
                        </div>

                        <Link
                          href={`/events/${course.id}`}
                          className="px-4 py-2 rounded-xl luxury-gold-btn !text-[#12192B] text-xs font-extrabold transition active:scale-95 shrink-0"
                        >
                          สมัครเรียน
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 3: กิจกรรมของคุณที่จะมาถึง */}
        {myUpcomingActivities.length > 0 && (
          <section
            ref={activitiesSectionRef}
            className="pt-2 border-t border-[#E6E0D4] space-y-2.5 scroll-mt-4"
          >
            <div className="flex items-center justify-between gap-2 pt-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
                กิจกรรมของคุณที่จะมาถึง
              </h2>
              <span className="text-xs font-semibold text-slate-400 tabular-nums">
                {activeMyEventIdx + 1} / {myUpcomingActivities.length}
              </span>
            </div>

            <div
              ref={myEventsScrollRef}
              onScroll={handleMyEventsScroll}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1"
            >
              {myUpcomingActivities.map((ev) => {
                const d = new Date(ev.start_time);
                const valid = !Number.isNaN(d.getTime());
                const wk = valid ? THAI_SHORT_WEEKDAYS[d.getDay()] : 'ศ.';
                const day = valid ? String(d.getDate()) : '12';
                const mo = valid ? THAI_SHORT_MONTHS[d.getMonth()] : 'ธ.ค.';

                return (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.id}`}
                    className="w-full shrink-0 snap-center bg-white rounded-[22px] p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(13,19,33,0.05)] hover:shadow-[0_12px_28px_rgba(13,19,33,0.09)] transition flex items-center gap-3.5 group"
                  >
                    <div className="w-[56px] h-[66px] rounded-[15px] bg-[#12192B] text-white flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-medium text-slate-300 leading-none">
                        {wk}
                      </span>
                      <span className="text-xl font-extrabold text-white leading-tight tabular-nums my-0.5">
                        {day}
                      </span>
                      <span className="text-[10px] font-medium text-slate-300 leading-none">
                        {mo}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F6EFE0] text-[#9A742B] text-[10px] font-bold">
                          กิจกรรม
                        </span>
                        <span className="text-[11px] font-bold text-[#B84A39]">
                          {computeDaysLabel(ev.start_time)}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#161C2C] line-clamp-1 group-hover:text-[#9A742B] transition-colors">
                        {ev.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <Clock className="w-3 h-3 text-[#B18A3B] shrink-0" />
                        <span className="truncate">
                          {formatTimeRange(ev.start_time, ev.end_time)} · {ev.location_name}
                        </span>
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                );
              })}
            </div>

            {myUpcomingActivities.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                {myUpcomingActivities.map((ev, idx) => (
                  <button
                    key={ev.id}
                    type="button"
                    aria-label={`กิจกรรมที่ ${idx + 1}`}
                    onClick={() => {
                      const el = myEventsScrollRef.current;
                      if (el) {
                        el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
                      }
                      setActiveMyEventIdx(idx);
                    }}
                    className={`h-1 rounded-full transition-all ${
                      idx === activeMyEventIdx ? 'w-5 bg-[#B18A3B]' : 'w-1.5 bg-[#D8D1C5]'
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 4: กิจกรรมที่น่าสนใจ */}
        {featuredActivities.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
                กิจกรรมที่น่าสนใจ
              </h2>
              {featuredActivities.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllActivities((prev) => !prev)}
                  className="text-xs font-bold text-[#9A742B] hover:text-[#161C2C] transition"
                >
                  {showAllActivities ? 'ย่อรายการ' : 'แสดงทั้งหมด'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {visibleActivities.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="relative h-[214px] sm:h-[232px] rounded-[24px] overflow-hidden bg-[#1A243B] shadow-[0_8px_24px_rgba(13,19,33,0.12)] hover:shadow-[0_14px_32px_rgba(13,19,33,0.18)] hover:-translate-y-0.5 transition-all duration-300 block group"
                >
                  {ev.image_url && (
                    <img
                      src={ev.image_url}
                      alt={ev.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(11,16,29,0.28) 0%, rgba(11,16,29,0.35) 42%, rgba(9,14,26,0.95) 100%)',
                    }}
                  />

                  <div className="relative z-10 h-full p-4 sm:p-5 flex flex-col justify-between text-white">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-[#0D1321]/80 backdrop-blur-md text-white text-[10px] font-bold">
                        {ev.is_mandatory ? 'วิชาบังคับ' : 'กิจกรรมทั่วไป'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-[#ECD28E] tabular-nums">
                        {ev.published_date_text || '2026'} · +{ev.reward_points} Pts
                      </p>
                      <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug line-clamp-2 group-hover:text-[#ECD28E] transition-colors">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-300 truncate">{ev.location_name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ================= HOUSE LEADERBOARD SLIDE-UP MODAL ================= */}
      {isLeaderboardOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="อันดับคะแนนกลุ่มดาว"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#080C18]/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsLeaderboardOpen(false)}
        >
          <div
            className="w-full max-w-md luxury-stage text-white rounded-t-[28px] sm:rounded-[28px] border border-[#C5A059]/30 p-5 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] sm:p-6 max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#ECD28E]" />
                <h3 className="text-base font-extrabold text-white">อันดับคะแนนกลุ่มดาว</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaderboardOpen(false)}
                aria-label="ปิดหน้าต่าง"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-white/10">
              {sortedHouses.map((h, idx) => {
                const rank = idx + 1;
                const isMine = h.id.toLowerCase() === myHouse.id.toLowerCase();
                return (
                  <Link
                    key={h.id}
                    href={`/directory?house=${encodeURIComponent(h.name)}`}
                    onClick={() => setIsLeaderboardOpen(false)}
                    className={`py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 transition ${
                      isMine ? 'bg-[#C5A059]/18' : 'hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-5 text-xs font-extrabold tabular-nums text-center ${
                          rank <= 3 ? 'text-[#ECD28E]' : 'text-slate-400'
                        }`}
                      >
                        #{rank}
                      </span>
                      <img
                        src={`/images/planets/${h.id}.webp?v=2`}
                        alt={h.name}
                        className="w-8 h-8 object-contain shrink-0"
                      />
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {h.name}
                      </span>
                      {isMine && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ECD28E]/20 text-[#ECD28E] text-[9px] font-bold">
                          ดาวของคุณ
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-[#ECD28E] tabular-nums shrink-0">
                      {h.total_points.toLocaleString()} Pts
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsContent />
    </Suspense>
  );
}

'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLiffAuth } from '@/contexts/LiffContext';
import {
  mockHouses,
  mockEvents,
  mockPrivileges,
  mockNotifications,
} from '@/lib/mockData';
import { EventItem, PrivilegeCategory } from '@/types';
import {
  Bell,
  ChevronRight,
  Coins,
  Search,
  ShieldCheck,
  LogIn,
  BadgeCheck,
  Sparkles,
  CalendarDays,
  ArrowRight,
  Ticket,
  Clock,
} from 'lucide-react';
import { WebLoginModal } from '@/components/layout/WebLoginModal';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';
import { MemberCard } from '@/components/profile/MemberCard';
import {
  formatMemberCode,
  MissionSubmissionRecord,
  normalizeMissionRecords,
  safeReadLocalStorage,
} from '@/components/profile/profileUtils';
import { getCourseSummary, readCourseSessionCheckins } from '@/lib/courseUtils';

const PRIVILEGE_FILTERS: { label: string; value: PrivilegeCategory }[] = [
  { label: 'สำหรับคุณ', value: 'All' },
  { label: 'ร้านอร่อย', value: 'Food & Drink' },
  { label: 'ไลฟ์สไตล์', value: 'Lifestyle' },
  { label: 'ท่องเที่ยว', value: 'Travel' },
  { label: 'ช้อปปิ้ง', value: 'Shopping' },
];

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

interface UpcomingFeedItem {
  id: string;
  href: string;
  badgeLabel: 'คอร์สเรียน' | 'กิจกรรม';
  countdownText: string;
  title: string;
  timeAndLocation: string;
  weekdayShort: string;
  dayNumber: string;
  monthShort: string;
  sortTime: number;
}

function computeCountdownLabel(targetIso: string): { label: string; daysDiff: number } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(targetIso);
  if (Number.isNaN(target.getTime())) {
    return { label: 'เร็วๆ นี้', daysDiff: 999 };
  }
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diff = Math.round((targetStart - todayStart) / 86400000);
  if (diff <= 0) return { label: 'วันนี้', daysDiff: diff };
  return { label: `อีก ${diff} วัน`, daysDiff: diff };
}

function formatShortLocation(loc?: string): string {
  if (!loc) return 'FTI Tower';
  return loc.replace('สภาอุตสาหกรรมแห่งประเทศไทย ', '').replace(/^\((.+)\)$/, '$1');
}

function News3DIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="38" cy="64" rx="22" ry="4" fill="#0D1321" fillOpacity="0.10" />
      <rect
        x="22"
        y="10"
        width="40"
        height="48"
        rx="8"
        transform="rotate(5 22 10)"
        fill="#E5DEC9"
      />
      <rect
        x="12"
        y="14"
        width="44"
        height="48"
        rx="9"
        fill="url(#newsPaperGrad)"
        stroke="#E8E2D4"
        strokeWidth="1"
      />
      <rect x="19" y="22" width="14" height="14" rx="3.5" fill="url(#newsGoldGrad)" />
      <rect x="37" y="23" width="12" height="4" rx="2" fill="#12192B" />
      <rect x="37" y="30" width="9" height="3.5" rx="1.75" fill="#94A3B8" />
      <rect x="19" y="42" width="30" height="3.5" rx="1.75" fill="#CBD5E1" />
      <rect x="19" y="49" width="24" height="3.5" rx="1.75" fill="#CBD5E1" />
      <defs>
        <linearGradient id="newsPaperGrad" x1="12" y1="14" x2="56" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F2EDE1" />
        </linearGradient>
        <linearGradient id="newsGoldGrad" x1="19" y1="22" x2="33" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECD28E" />
          <stop offset="0.55" stopColor="#C5A059" />
          <stop offset="1" stopColor="#9A742B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RealEstateGlyph() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="w-7 h-7">
      <path d="M20 7L6 18.5H10.5V32H29.5V18.5H34L20 7Z" fill="#12192B" />
      <path d="M20 7L6 18.5H11L20 11L29 18.5H34L20 7Z" fill="#C5A059" />
      <rect x="17" y="22" width="6" height="10" rx="1.5" fill="#DFC27D" />
      <rect x="12.5" y="18" width="3.5" height="3.5" rx="0.8" fill="#ECD28E" />
      <rect x="24" y="18" width="3.5" height="3.5" rx="0.8" fill="#ECD28E" />
    </svg>
  );
}

function FoodGlyph() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="w-7 h-7">
      <path
        d="M15 9C15 11 13.5 12 13.5 14M20 8C20 10 18.5 11 18.5 13M25 9C25 11 23.5 12 23.5 14"
        stroke="#C5A059"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M8 18.5H32C32 25.4 26.6 30.5 20 30.5C13.4 30.5 8 25.4 8 18.5Z" fill="#12192B" />
      <rect x="7" y="17" width="26" height="2.5" rx="1.25" fill="#DFC27D" />
      <rect x="14" y="30" width="12" height="2.5" rx="1.25" fill="#C5A059" />
    </svg>
  );
}

function HealthGlyph() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="w-7 h-7">
      <rect x="8" y="8" width="24" height="24" rx="6" fill="#12192B" />
      <path
        d="M18 13.5H22V18H26.5V22H22V26.5H18V22H13.5V18H18V13.5Z"
        fill="url(#healthCrossGrad)"
      />
      <defs>
        <linearGradient id="healthCrossGrad" x1="13.5" y1="13.5" x2="26.5" y2="26.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECD28E" />
          <stop offset="1" stopColor="#BA9243" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const Y_CONNECT_CATEGORIES: {
  name: string;
  href: string;
  iconSrc?: string;
  customIcon?: React.ReactNode;
}[] = [
  { name: 'เทคโนโลยี', href: '/directory?industry=technology', iconSrc: '/images/icons/tech.webp?v=2' },
  { name: 'บริการ', href: '/directory?industry=services', iconSrc: '/images/icons/services.webp?v=2' },
  { name: 'อุตสาหกรรม', href: '/directory?industry=industrial_goods', iconSrc: '/images/icons/industrial.webp?v=2' },
  { name: 'ก่อสร้าง', href: '/directory?industry=real_estate_and_construction', iconSrc: '/images/icons/construction.webp?v=2' },
  { name: 'การเงิน', href: '/directory?industry=financial_and_investment', iconSrc: '/images/icons/finance.webp?v=2' },
  { name: 'อสังหาฯ', href: '/directory?category=real_estate_development', customIcon: <RealEstateGlyph /> },
  { name: 'อาหาร', href: '/directory?industry=agriculture_and_food_industrial', customIcon: <FoodGlyph /> },
  { name: 'สุขภาพ', href: '/directory?category=medicine', customIcon: <HealthGlyph /> },
];

export default function HomePage() {
  const { profile } = useLiffAuth();
  const [mounted, setMounted] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [customEvents, setCustomEvents] = useState<EventItem[]>([]);
  const [selectedPrivCategory, setSelectedPrivCategory] = useState<PrivilegeCategory>('All');
  const [sessionCheckins, setSessionCheckins] = useState<Record<string, boolean>>({});
  const [missionRecords, setMissionRecords] = useState<Record<string, MissionSubmissionRecord>>({});
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);

  const upcomingScrollRef = useRef<HTMLDivElement | null>(null);
  const privScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeUpcomingIdx, setActiveUpcomingIdx] = useState(0);
  const [activePrivIdx, setActivePrivIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const readIds = JSON.parse(localStorage.getItem('yfti_notifications_read') || '[]');
        if (Array.isArray(readIds)) setReadNotificationIds(readIds);

        const custom = JSON.parse(localStorage.getItem('yfti_custom_events') || '[]');
        if (Array.isArray(custom)) setCustomEvents(custom);

        const regs = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
        if (Array.isArray(regs)) {
          setRegisteredEventIds(
            regs
              .filter((r: any) => r.status === 'APPROVED' || r.status === 'PENDING')
              .map((r: any) => String(r.eventId))
          );
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setSessionCheckins(readCourseSessionCheckins(profile?.id));
    const scopedKey = profile?.id ? `yfti_mission_submissions_${profile.id}` : null;
    const rawScoped = scopedKey ? safeReadLocalStorage<unknown>(scopedKey, null) : null;
    const rawLegacy =
      rawScoped === null ? safeReadLocalStorage<unknown>('yfti_mission_submissions', null) : null;
    setMissionRecords(normalizeMissionRecords(rawScoped ?? rawLegacy));
  }, [mounted, profile?.id]);

  const unreadCount = useMemo(
    () => mockNotifications.filter((n) => !n.is_read && !readNotificationIds.includes(n.id)).length,
    [readNotificationIds]
  );

  const allEventsCombined = useMemo(() => [...customEvents, ...mockEvents], [customEvents]);

  const upcomingFeed = useMemo<UpcomingFeedItem[]>(() => {
    const items: UpcomingFeedItem[] = [];

    for (const ev of allEventsCombined) {
      if (ev.status !== 'UPCOMING') continue;

      if (ev.event_type === 'course' && ev.sessions && ev.sessions.length > 0) {
        const isEnrolled =
          Boolean(ev.isRegisteredForEvent) || registeredEventIds.includes(String(ev.id));
        if (isEnrolled) {
          const summary = getCourseSummary(ev, sessionCheckins, missionRecords);
          const nextSes = summary.nextSession;
          if (nextSes) {
            const d = new Date(nextSes.start_time);
            const validDate = !Number.isNaN(d.getTime());
            const { label } = computeCountdownLabel(nextSes.start_time);
            items.push({
              id: `ses-${nextSes.id}`,
              href: `/events/${ev.id}`,
              badgeLabel: 'คอร์สเรียน',
              countdownText: label,
              title: nextSes.title,
              timeAndLocation: `${nextSes.time_text} · ${formatShortLocation(nextSes.location_name)}`,
              weekdayShort: validDate ? THAI_SHORT_WEEKDAYS[d.getDay()] : 'ส.',
              dayNumber: validDate ? String(d.getDate()) : '12',
              monthShort: validDate ? THAI_SHORT_MONTHS[d.getMonth()] : 'ธ.ค.',
              sortTime: validDate ? d.getTime() : Number.MAX_SAFE_INTEGER,
            });
            continue;
          }
        }
      }

      const d = new Date(ev.start_time);
      const validDate = !Number.isNaN(d.getTime());
      const endD = new Date(ev.end_time);
      const timeRange =
        validDate && !Number.isNaN(endD.getTime())
          ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}–${String(
              endD.getHours()
            ).padStart(2, '0')}:${String(endD.getMinutes()).padStart(2, '0')} น.`
          : '09:00–16:00 น.';
      const { label } = computeCountdownLabel(ev.start_time);

      items.push({
        id: `ev-${ev.id}`,
        href: `/events/${ev.id}`,
        badgeLabel: ev.event_type === 'course' ? 'คอร์สเรียน' : 'กิจกรรม',
        countdownText: label,
        title: ev.title,
        timeAndLocation: `${timeRange} · ${formatShortLocation(ev.location_name)}`,
        weekdayShort: validDate ? THAI_SHORT_WEEKDAYS[d.getDay()] : 'ศ.',
        dayNumber: validDate ? String(d.getDate()) : '15',
        monthShort: validDate ? THAI_SHORT_MONTHS[d.getMonth()] : 'ม.ค.',
        sortTime: validDate ? d.getTime() : Number.MAX_SAFE_INTEGER,
      });
    }

    return items.sort((a, b) => a.sortTime - b.sortTime).slice(0, 3);
  }, [allEventsCombined, registeredEventIds, sessionCheckins, missionRecords]);

  const filteredPrivileges = useMemo(() => {
    const list =
      selectedPrivCategory === 'All'
        ? mockPrivileges
        : mockPrivileges.filter((p) => p.category === selectedPrivCategory);
    return list.slice(0, 4);
  }, [selectedPrivCategory]);

  useEffect(() => {
    setActivePrivIdx(0);
    if (privScrollRef.current) {
      privScrollRef.current.scrollTo({ left: 0 });
    }
  }, [selectedPrivCategory]);

  const activeProfile = mounted ? profile : null;
  const isAdmin =
    activeProfile?.role === 'SUPER_ADMIN' || activeProfile?.role === 'HOUSE_ADMIN';

  const normalizedHouseId = (
    activeProfile?.house_id ||
    activeProfile?.house?.id ||
    ''
  ).replace(/-/g, '_');

  const displayHouseName =
    mockHouses.find((h) => h.id === normalizedHouseId)?.name ||
    activeProfile?.house?.name ||
    'YFTI 11';

  const xp = activeProfile?.xp_balance ?? 0;
  const tier =
    activeProfile?.tier || (xp >= 2000 ? 'Platinum' : xp >= 1000 ? 'Gold' : 'Silver');
  const points = activeProfile?.points_balance ?? 0;
  const memberCode = formatMemberCode(activeProfile?.id);

  const handleUpcomingScroll = () => {
    const el = upcomingScrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveUpcomingIdx(Math.max(0, Math.min(upcomingFeed.length - 1, idx)));
  };

  const handlePrivScroll = () => {
    const el = privScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setActivePrivIdx(0);
      return;
    }
    const ratio = el.scrollLeft / maxScroll;
    const idx = Math.round(ratio * Math.max(0, filteredPrivileges.length - 1));
    setActivePrivIdx(Math.max(0, Math.min(filteredPrivileges.length - 1, idx)));
  };

  return (
    <div className="w-full bg-[#F6F4EF] text-[#161C2C] pb-4">
      {/* ================= 1. OBSIDIAN LUXURY STAGE (GREETING + MEMBER CARD + POINTS ROW) ================= */}
      <section className="relative overflow-hidden luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)]">
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          {/* Top Utility Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ECD28E]/90">
                  YOUNG FTI ELITE 11
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-[#ECD28E] shrink-0" />
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-white truncate leading-snug">
                {activeProfile
                  ? `สวัสดี, ${activeProfile.display_name.split(' ')[0]}`
                  : 'Member Connect Hub'}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                aria-label="ค้นหาทั้งหมด"
                className="w-9 h-9 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 backdrop-blur-sm flex items-center justify-center transition"
              >
                <Search className="w-4 h-4 text-white" />
              </button>

              {isAdmin && (
                <Link
                  href="/admin"
                  aria-label="แดชบอร์ดแอดมิน"
                  className="md:hidden w-9 h-9 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/35 backdrop-blur-sm flex items-center justify-center text-emerald-300 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/notifications"
                aria-label="การแจ้งเตือน"
                className="relative w-9 h-9 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 backdrop-blur-sm flex items-center justify-center transition"
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FB7170] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Single Slim VIP Member Card */}
          <div className="pt-0.5">
            {activeProfile ? (
              <MemberCard
                profile={activeProfile}
                houseName={displayHouseName}
                memberCode={memberCode}
                tier={tier}
                isFlipped={isCardFlipped}
                onToggleFlip={() => setIsCardFlipped((prev) => !prev)}
                showFlipButton={false}
              />
            ) : (
              <div className="mx-auto w-full max-w-xl rounded-[22px] p-5 sm:p-6 border border-[#C5A059]/35 bg-gradient-to-br from-[#0E1424] via-[#172038] to-[#1E2A46] shadow-[0_14px_34px_rgba(0,0,0,0.28)] space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src="/YFTI-11-Logo.jpg"
                        alt="Young FTI ELITE 11"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold tracking-tight text-white">
                        YOUNG FTI <span className="font-light text-[#ECD28E]">ELITE 11</span>
                      </p>
                      <p className="text-[11px] text-slate-300">Executive Member Pass</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 border border-[#DFC27D]/30 text-[10px] font-bold text-[#ECD28E]">
                    MEMBER PASS
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  เข้าสู่ระบบสมาชิกเพื่อเปิดใช้งานบัตรดิจิทัล QR Code รับสิทธิพิเศษ และเชื่อมต่อเครือข่ายธุรกิจรุ่นที่ 11
                </p>

                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl luxury-gold-btn !text-[#12192B] text-xs sm:text-sm font-extrabold transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบสมาชิก</span>
                </button>
              </div>
            )}
          </div>

          {/* Integrated Points & Coupon Bar Inside Obsidian Stage */}
          <div className="max-w-xl mx-auto pt-0.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/images/icons/points.webp?v=2"
                alt=""
                aria-hidden="true"
                className="w-9 h-9 object-contain shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
              />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-300 font-medium leading-none">
                  คะแนนสะสมของคุณ
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg sm:text-xl font-extrabold text-white tabular-nums leading-none">
                    {points.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-[#ECD28E]">Pts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/privileges?tab=history"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition"
              >
                <Ticket className="w-3.5 h-3.5 text-[#ECD28E]" />
                <span>คูปอง</span>
              </Link>
              <Link
                href="/privileges"
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl luxury-gold-btn !text-[#12192B] text-xs font-extrabold transition"
              >
                <span>แลกสิทธิ์</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. UPCOMING SCHEDULE CAROUSEL (กำลังจะมาถึง) ================= */}
      {upcomingFeed.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-[#161C2C] flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-[#B18A3B]" />
              <span>กำลังจะมาถึง</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400 tabular-nums">
              {activeUpcomingIdx + 1} / {upcomingFeed.length}
            </span>
          </div>

          <div
            ref={upcomingScrollRef}
            onScroll={handleUpcomingScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1"
          >
            {upcomingFeed.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="w-full shrink-0 snap-center bg-white rounded-[22px] p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(13,19,33,0.05)] hover:shadow-[0_12px_28px_rgba(13,19,33,0.09)] transition flex items-center gap-3.5 group"
              >
                {/* Dark Obsidian Date Badge */}
                <div className="w-[56px] h-[66px] rounded-[15px] bg-[#12192B] text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-medium text-slate-300 leading-none">
                    {item.weekdayShort}
                  </span>
                  <span className="text-xl font-extrabold text-white leading-tight tabular-nums my-0.5">
                    {item.dayNumber}
                  </span>
                  <span className="text-[10px] font-medium text-slate-300 leading-none">
                    {item.monthShort}
                  </span>
                </div>

                {/* Schedule Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F6EFE0] text-[#9A742B] text-[10px] font-bold">
                      {item.badgeLabel}
                    </span>
                    <span className="text-[11px] font-bold text-[#B84A39]">
                      {item.countdownText}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#161C2C] line-clamp-2 leading-snug group-hover:text-[#9A742B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <Clock className="w-3 h-3 text-[#B18A3B] shrink-0" />
                    <span className="truncate">{item.timeAndLocation}</span>
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            ))}
          </div>

          {upcomingFeed.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              {upcomingFeed.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`รายการที่ ${idx + 1}`}
                  onClick={() => {
                    const el = upcomingScrollRef.current;
                    if (el) {
                      el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
                    }
                    setActiveUpcomingIdx(idx);
                  }}
                  className={`h-1 rounded-full transition-all ${
                    idx === activeUpcomingIdx ? 'w-5 bg-[#B18A3B]' : 'w-1.5 bg-[#D8D1C5]'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================= 3. PRIVILEGES PEEK CAROUSEL (สิทธิพิเศษสำหรับคุณ) ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C] flex items-center gap-1.5">
            <span>สิทธิพิเศษสำหรับคุณ</span>
            <Sparkles className="w-4 h-4 text-[#B18A3B]" />
          </h2>
          <Link
            href="/privileges"
            className="text-xs font-bold text-[#9A742B] hover:text-[#161C2C] inline-flex items-center gap-1 transition"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {PRIVILEGE_FILTERS.map((cat) => {
            const isActive = selectedPrivCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedPrivCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 border ${
                  isActive
                    ? 'bg-white text-[#9A742B] border-[#C5A059] shadow-[0_2px_10px_rgba(197,160,89,0.18)]'
                    : 'bg-white text-[#161C2C] border-transparent shadow-[0_2px_8px_rgba(13,19,33,0.04)] hover:border-[#C5A059]/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Full-Bleed Overlay Offer Cards */}
        <div
          ref={privScrollRef}
          onScroll={handlePrivScroll}
          className="flex gap-3.5 overflow-x-auto pt-1 pb-4 -mb-2 snap-x no-scrollbar -mr-4 pr-4 sm:mr-0 sm:pr-0"
        >
          {filteredPrivileges.map((priv) => (
            <Link
              key={priv.id}
              href={`/privileges/${priv.id}`}
              className="relative w-[268px] sm:w-[290px] h-[252px] sm:h-[268px] snap-start rounded-[24px] overflow-hidden bg-[#0D1321] shadow-[0_8px_22px_rgba(13,19,33,0.12)] transition shrink-0 group block"
            >
              <img
                src={priv.image_url}
                alt={priv.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090E1A]/95 via-[#090E1A]/45 to-[#090E1A]/20" />

              <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#0D1321]/75 backdrop-blur-md text-[10px] font-bold text-[#ECD28E] uppercase tracking-wide">
                    {priv.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#0D1321]/70 backdrop-blur-md border border-[#DFC27D]/40 text-[#F5E6BE] text-[10px] font-extrabold">
                    {priv.discount_label}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-base font-extrabold text-white truncate drop-shadow-sm">
                      {priv.merchant}
                    </p>
                    <p className="text-xs text-slate-200/90 line-clamp-1 leading-snug">
                      {priv.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/15">
                    <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-white tabular-nums">
                      <Coins className="w-4 h-4 text-[#DFC27D]" />
                      {priv.points_required}
                    </span>
                    <span className="px-4 py-1.5 rounded-xl luxury-gold-btn !text-[#12192B] text-xs font-extrabold">
                      รับสิทธิ์
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredPrivileges.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {filteredPrivileges.map((priv, idx) => (
              <span
                key={priv.id}
                className={`h-1 rounded-full transition-all ${
                  idx === activePrivIdx ? 'w-5 bg-[#B18A3B]' : 'w-1.5 bg-[#D8D1C5]'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================= 4. THREE FEATURE SHORTCUT CARDS (คอร์สเรียน | กิจกรรม | ข่าวสาร) ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <Link
            href="/events?category=course"
            className="bg-white rounded-[22px] p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(13,19,33,0.05)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(13,19,33,0.09)] transition flex flex-col justify-between min-h-[142px] sm:min-h-[164px] overflow-hidden group"
          >
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#161C2C] group-hover:text-[#9A742B] transition-colors">
                คอร์สเรียน
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                ตารางเรียน
                <br />
                และภารกิจ
              </p>
            </div>
            <img
              src="/images/icons/courses.webp?v=2"
              alt="คอร์สเรียน"
              loading="lazy"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain self-end mt-2 group-hover:scale-105 transition-transform"
            />
          </Link>

          <Link
            href="/events?category=general"
            className="bg-white rounded-[22px] p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(13,19,33,0.05)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(13,19,33,0.09)] transition flex flex-col justify-between min-h-[142px] sm:min-h-[164px] overflow-hidden group"
          >
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#161C2C] group-hover:text-[#9A742B] transition-colors">
                กิจกรรม
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                ลงทะเบียน
                <br />
                และสะสมแต้ม
              </p>
            </div>
            <img
              src="/images/icons/events.webp?v=2"
              alt="กิจกรรม"
              loading="lazy"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain self-end mt-2 group-hover:scale-105 transition-transform"
            />
          </Link>

          <Link
            href="/news"
            className="bg-white rounded-[22px] p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(13,19,33,0.05)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(13,19,33,0.09)] transition flex flex-col justify-between min-h-[142px] sm:min-h-[164px] overflow-hidden group"
          >
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#161C2C] group-hover:text-[#9A742B] transition-colors">
                ข่าวสาร
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                อัปเดต
                <br />
                จากโครงการ
              </p>
            </div>
            <div className="self-end mt-2 group-hover:scale-105 transition-transform">
              <News3DIcon className="w-14 h-14 sm:w-16 sm:h-16" />
            </div>
          </Link>
        </div>
      </section>

      {/* ================= 5. Y CONNECT DARK OBSIDIAN BAND (8 INDUSTRY TILES) ================= */}
      <section className="mt-7 luxury-stage text-white py-7 border-y border-[#C5A059]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-wide text-white">
                Y CONNECT
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                ค้นหาเครือข่ายตามหมวดหมู่ธุรกิจ
              </p>
            </div>
            <Link
              href="/directory"
              className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 border border-[#C5A059]/35 text-[#ECD28E] text-xs font-bold inline-flex items-center gap-1 shrink-0 transition"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
            {Y_CONNECT_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="rounded-[18px] bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] py-3.5 px-2 flex flex-col items-center justify-center gap-2.5 transition group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.28)] flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform overflow-hidden">
                  {cat.iconSrc ? (
                    <img
                      src={cat.iconSrc}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    cat.customIcon
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-white text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
}

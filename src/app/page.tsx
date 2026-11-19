'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, mockMissions, mockEvents, mockPrivileges, mockNotifications } from '@/lib/mockData';
import { EventItem } from '@/types';
import {
  Bell,
  ChevronRight,
  Coins,
  Crown,
  Clock,
  MapPin,
  Info,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import { WebLoginModal } from '@/components/layout/WebLoginModal';

const INDUSTRY_CATEGORIES = [
  { name: 'เทคโนโลยี', query: 'technology', iconSrc: '/images/icons/tech.webp' },
  { name: 'บริการ', query: 'services', iconSrc: '/images/icons/services.webp' },
  { name: 'อุปโภคบริโภค', query: 'consumer_goods', iconSrc: '/images/icons/consumer.webp' },
  { name: 'อุตสาหกรรม', query: 'industrial_goods', iconSrc: '/images/icons/industrial.webp' },
  { name: 'เกษตร / อาหาร', query: 'agriculture_and_food_industrial', iconSrc: '/images/icons/agriculture.webp' },
  { name: 'ก่อสร้าง', query: 'real_estate_and_construction', iconSrc: '/images/icons/construction.webp' },
  { name: 'ทรัพยากร', query: 'resources', iconSrc: '/images/icons/resources.webp' },
  { name: 'การเงิน / ลงทุน', query: 'financial_and_investment', iconSrc: '/images/icons/finance.webp' },
];

export default function HomePage() {
  const { profile } = useLiffAuth();
  const [mounted, setMounted] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [customEvents, setCustomEvents] = useState<EventItem[]>([]);
  const [missionOverrides, setMissionOverrides] = useState<Record<string, 'APPROVED' | 'PENDING' | 'NOT_STARTED'>>({});

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const readIds = JSON.parse(localStorage.getItem('yfti_notifications_read') || '[]');
        if (Array.isArray(readIds)) setReadNotificationIds(readIds);

        const custom = JSON.parse(localStorage.getItem('yfti_custom_events') || '[]');
        if (Array.isArray(custom)) setCustomEvents(custom);

        const savedMissions = JSON.parse(localStorage.getItem('yfti_mission_submissions') || '{}');
        if (savedMissions && typeof savedMissions === 'object') {
          setMissionOverrides(savedMissions);
        }
      } catch {}
    }
  }, []);

  const unreadCount = useMemo(
    () => mockNotifications.filter((n) => !n.is_read && !readNotificationIds.includes(n.id)).length,
    [readNotificationIds]
  );

  const sortedHouses = useMemo(
    () => [...mockHouses].sort((a, b) => b.total_points - a.total_points),
    []
  );

  const allEvents = useMemo(() => [...customEvents, ...mockEvents], [customEvents]);

  const courses = useMemo(
    () => allEvents.filter((e) => e.event_type === 'course'),
    [allEvents]
  );

  const generalEvents = useMemo(
    () => allEvents.filter((e) => e.event_type !== 'course').slice(0, 4),
    [allEvents]
  );

  const upcomingItems = useMemo(
    () => allEvents.filter((e) => e.status === 'UPCOMING'),
    [allEvents]
  );

  const mergedMissions = useMemo(
    () =>
      mockMissions.map((m) => ({
        ...m,
        status: missionOverrides[m.id] || m.status || 'NOT_STARTED',
      })),
    [missionOverrides]
  );

  const completedMissionsCount = useMemo(
    () => mergedMissions.filter((m) => m.status === 'APPROVED').length,
    [mergedMissions]
  );

  const activeProfile = mounted ? profile : null;
  const normalizedHouseId = (activeProfile?.house_id || activeProfile?.house?.id || '').replace(/-/g, '_');
  const displayHouseName =
    mockHouses.find((h) => h.id === normalizedHouseId)?.name || activeProfile?.house?.name || 'YFTI 11';

  const xp = activeProfile?.xp_balance ?? 0;
  const tier = activeProfile?.tier || (xp >= 2000 ? 'Platinum' : xp >= 1000 ? 'Gold' : 'Silver');
  const points = activeProfile?.points_balance ?? 0;

  return (
    <div className="w-full bg-[#F4F6FA] text-[#1E2538] pb-24">
      {/* ================= 1. EXECUTIVE NAVY HERO HEADER (LINE Portal Style) ================= */}
      <section className="relative overflow-hidden bg-[#181E30] text-white pt-5 pb-14 px-4 sm:px-6 rounded-b-[28px] border-b-[3px] border-[#FB7170] shadow-[0_10px_30px_rgba(24,30,48,0.18)]">
        {/* Blended Cohort Group Photo Backdrop */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <img
            src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-right opacity-35"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(95deg, #181E30 28%, rgba(30,37,56,0.92) 55%, rgba(30,37,56,0.52) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-5">
          {/* Top Brand & Tier Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Member Portal
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
              </div>
              <h1 className="text-xl sm:text-2xl tracking-tight text-white leading-tight">
                <span className="font-extrabold">Young FTI</span>{' '}
                <span className="font-light text-white/95">ELITE 11</span>
              </h1>
              <p className="text-xs font-medium text-[#FB7170]">
                หลักสูตรนักอุตสาหกรรมรุ่นใหม่
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/15 bg-[#181E30]/70 backdrop-blur-sm text-[#E5C158] text-xs font-semibold shrink-0">
              <Crown className="w-3.5 h-3.5" />
              <span>{tier}</span>
            </span>
          </div>

          {/* User Profile & Bell/Points Row */}
          <div className="flex items-center justify-between gap-3">
            {mounted && profile ? (
              <Link href="/profile" className="flex items-center gap-3 min-w-0 flex-1 group">
                <img
                  src={profile.picture_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp'}
                  alt={profile.display_name || 'Member'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/25 shrink-0 bg-slate-800 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp';
                  }}
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#E5C158] transition-colors">
                    {profile.display_name}
                  </p>
                  <p className="text-[11px] text-slate-300 truncate">{displayHouseName}</p>
                </div>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-[#1E2538] text-xs font-bold shadow-md transition"
              >
                <span>เข้าสู่ระบบสมาชิก</span>
                <span className="w-6 h-6 rounded-full bg-[#FB7170] text-white flex items-center justify-center">
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>
            )}

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/notifications"
                aria-label="การแจ้งเตือน"
                className="relative w-9 h-9 rounded-full bg-[#181E30]/75 hover:bg-white/20 border border-white/15 backdrop-blur-sm flex items-center justify-center transition"
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FB7170] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/privileges"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C59B38] hover:bg-[#b58b2e] text-white text-xs font-bold tabular-nums shadow-sm transition"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>{points.toLocaleString()}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. FLOATING SHORTCUT CARD (Custom Image Icons) ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-[22px] shadow-[0_8px_28px_rgba(15,23,42,0.07)] border border-slate-200/70 p-4 grid grid-cols-4 gap-2">
          <Link
            href="/privileges"
            className="flex flex-col items-center text-center gap-2 py-1 group"
          >
            <img
              src="/images/icons/privileges.webp"
              alt="Privileges"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-sm group-hover:-translate-y-0.5 transition-transform"
            />
            <span className="text-xs font-bold text-[#1E2538]">Privileges</span>
          </Link>

          <Link
            href="/events?category=course"
            className="flex flex-col items-center text-center gap-2 py-1 group"
          >
            <img
              src="/images/icons/courses.webp"
              alt="Courses"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-sm group-hover:-translate-y-0.5 transition-transform"
            />
            <span className="text-xs font-bold text-[#1E2538]">Courses</span>
          </Link>

          <Link
            href="/events?category=general"
            className="flex flex-col items-center text-center gap-2 py-1 group"
          >
            <img
              src="/images/icons/events.webp"
              alt="Events"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-sm group-hover:-translate-y-0.5 transition-transform"
            />
            <span className="text-xs font-bold text-[#1E2538]">Events</span>
          </Link>

          <Link
            href="/directory"
            className="flex flex-col items-center text-center gap-2 py-1 group"
          >
            <img
              src="/images/icons/business.webp"
              alt="Business"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-sm group-hover:-translate-y-0.5 transition-transform"
            />
            <span className="text-xs font-bold text-[#1E2538]">Business</span>
          </Link>
        </div>
      </div>

      {/* ================= MAIN CONTENT SECTIONS ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-7">
        {/* ================= 3. PRIVILEGES SECTION ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E2538]">สิทธิพิเศษ (Privileges)</h2>
              <p className="text-xs text-slate-500">ใช้ Point แลกส่วนลดและสิทธิประโยชน์เฉพาะสมาชิก</p>
            </div>
            <Link
              href="/privileges"
              className="px-3 py-1 rounded-full bg-[#1E2538] hover:bg-[#2B3550] text-white text-[11px] font-bold inline-flex items-center gap-0.5 shrink-0 transition shadow-sm"
            >
              View All <ChevronRight className="w-3.5 h-3.5 text-[#FB7170]" />
            </Link>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x no-scrollbar">
            {mockPrivileges.slice(0, 4).map((priv) => (
              <Link
                key={priv.id}
                href={`/privileges/${priv.id}`}
                className="min-w-[230px] max-w-[240px] snap-start bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-md transition flex flex-col justify-between shrink-0 group"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={priv.image_url}
                    alt={priv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 text-[#1E2538] text-[10px] font-bold tabular-nums shadow-sm">
                    <Coins className="w-3 h-3 text-[#B38728]" />
                    {priv.points_required}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/65 text-white text-[10px] font-medium">
                    {priv.category}
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <span className="text-[11px] font-medium text-slate-400 uppercase block truncate">
                    {priv.merchant}
                  </span>
                  <p className="text-sm font-bold text-[#1E2538]">{priv.discount_label}</p>
                  <h3 className="text-xs text-slate-500 line-clamp-1">{priv.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= 4. COURSES SECTION ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E2538]">คอร์สเรียน / หลักสูตร (Courses)</h2>
              <p className="text-xs text-slate-500">ดูรายละเอียดหลักสูตรและสมัครเรียนได้ทันที</p>
            </div>
            <Link
              href="/events?category=course"
              className="px-3 py-1 rounded-full bg-[#1E2538] hover:bg-[#2B3550] text-white text-[11px] font-bold inline-flex items-center gap-0.5 shrink-0 transition shadow-sm"
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5 text-[#FB7170]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/events/${course.id}`}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:border-[#C59B38] transition flex items-center gap-3.5 group"
              >
                <img
                  src={course.image_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/event_training.webp'}
                  alt={course.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#1E2538] text-white text-[10px] font-semibold">
                      Course
                    </span>
                    <span className="text-[11px] font-bold text-[#9A7320] tabular-nums">
                      +{course.reward_points} Pts
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1E2538] line-clamp-2 group-hover:text-[#B38728] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <Clock className="w-3 h-3 text-[#B38728] shrink-0" />
                    {course.published_date_text || 'เร็วๆ นี้'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= 5. EVENTS SECTION ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E2538]">กิจกรรมโครงการ (Events)</h2>
              <p className="text-xs text-slate-500">รายการกิจกรรมที่เปิดให้สมาชิกสมัครเข้าร่วม</p>
            </div>
            <Link
              href="/events?category=general"
              className="px-3 py-1 rounded-full bg-[#1E2538] hover:bg-[#2B3550] text-white text-[11px] font-bold inline-flex items-center gap-0.5 shrink-0 transition shadow-sm"
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5 text-[#FB7170]" />
            </Link>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x no-scrollbar">
            {generalEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="min-w-[245px] max-w-[260px] snap-start bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:border-[#C59B38] transition flex flex-col justify-between shrink-0 group"
              >
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={ev.image_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/hero_leaders.webp'}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${
                      ev.status === 'UPCOMING'
                        ? 'bg-[#C59B38] text-white'
                        : 'bg-[#1E2538]/90 text-white'
                    }`}
                  >
                    {ev.status === 'UPCOMING' ? 'เปิดรับสมัคร' : 'จบกิจกรรมแล้ว'}
                  </span>
                </div>
                <div className="p-3.5 space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#9A7320]">
                    {ev.published_date_text || 'กำลังจะมาถึง'}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1E2538] line-clamp-2 leading-snug">
                    {ev.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                    {ev.location_name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= 6. BUSINESS CATEGORIES CAROUSEL (8 SECTORS) ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E2538]">ธุรกิจที่เกี่ยวข้อง (8 หมวดหมู่)</h2>
              <p className="text-xs text-slate-500">กดเลือกหมวดหมู่เพื่อดูรายชื่อธุรกิจในเครือข่าย</p>
            </div>
            <Link
              href="/directory"
              className="text-xs font-bold text-[#B38728] hover:underline flex items-center gap-0.5 shrink-0"
            >
              ทำเนียบทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar">
            {INDUSTRY_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/directory?industry=${encodeURIComponent(cat.query)}`}
                className="min-w-[100px] sm:min-w-[110px] snap-start bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-[#C59B38] shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition flex flex-col items-center text-center gap-2 shrink-0 group"
              >
                <img
                  src={cat.iconSrc}
                  alt={cat.name}
                  loading="lazy"
                  className="w-11 h-11 rounded-xl shadow-sm group-hover:scale-105 transition-transform"
                />
                <span className="text-[11px] font-semibold text-[#1E2538] leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= 7. HOUSE LEADERBOARD (COSMIC 3D PODIUM) ================= */}
        <section className="relative rounded-3xl bg-gradient-to-b from-[#0D1220] via-[#12192C] to-[#0B101D] border border-white/10 shadow-[0_18px_42px_rgba(13,18,32,0.38)] text-white p-4 sm:p-6 overflow-hidden space-y-5">
          {/* Subtle Orbital Rings & Starlight Backdrop */}
          <svg
            aria-hidden="true"
            viewBox="0 0 600 260"
            className="pointer-events-none absolute top-14 left-0 right-0 w-full h-56 opacity-45"
            fill="none"
          >
            <ellipse cx="300" cy="240" rx="340" ry="120" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
            <ellipse cx="300" cy="240" rx="280" ry="95" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <ellipse cx="300" cy="240" rx="220" ry="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <circle cx="72" cy="48" r="1.2" fill="rgba(255,255,255,0.45)" />
            <circle cx="158" cy="24" r="1" fill="rgba(229,193,88,0.6)" />
            <circle cx="468" cy="36" r="1.3" fill="rgba(255,255,255,0.4)" />
            <circle cx="534" cy="74" r="1" fill="rgba(251,113,112,0.55)" />
            <circle cx="388" cy="18" r="1" fill="rgba(255,255,255,0.35)" />
          </svg>

          {/* Header Bar */}
          <div className="relative z-10 rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 flex items-center justify-between gap-3 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/images/icons/house.webp"
                alt="ตารางอันดับคะแนน"
                className="w-10 h-10 rounded-xl shadow-[0_0_16px_rgba(229,193,88,0.28)] shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  ตารางอันดับคะแนน
                </h2>
                <p className="text-[11px] text-slate-400 truncate">
                  คะแนนรวมทั้ง 9 ดวงดาว รุ่นที่ 11
                </p>
              </div>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 shrink-0">
              9 Houses
            </span>
          </div>

          {(() => {
            const topScore = Math.max(1, sortedHouses[0]?.total_points ?? 1);
            const podiumOrder = [
              { house: sortedHouses[1], rank: 2 },
              { house: sortedHouses[0], rank: 1 },
              { house: sortedHouses[2], rank: 3 },
            ].filter((item) => Boolean(item.house));
            const remainingHouses = sortedHouses.slice(3);

            return (
              <div className="relative z-10 space-y-5">
                {/* Top 3 3D Glass Cylinder Podium (2nd - 1st - 3rd) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-3 pb-1 px-0.5 sm:px-2">
                  {podiumOrder.map(({ house, rank }) => {
                    const isFirst = rank === 1;
                    const isSecond = rank === 2;
                    const accentHex = isFirst
                      ? '#E5C158'
                      : isSecond
                      ? '#60A5FA'
                      : '#FB7170';

                    return (
                      <Link
                        key={house.id}
                        href={`/directory?house=${encodeURIComponent(house.name)}`}
                        className="flex flex-col items-center group"
                      >
                        {/* Rank Pill */}
                        <span
                          className={`mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide backdrop-blur-sm ${
                            isFirst
                              ? 'bg-[#C59B38]/20 border border-[#E5C158]/60 text-[#E5C158] shadow-[0_0_14px_rgba(229,193,88,0.3)]'
                              : isSecond
                              ? 'bg-slate-400/15 border border-slate-300/25 text-slate-200'
                              : 'bg-[#FB7170]/15 border border-[#FB7170]/35 text-[#FDA4A3]'
                          }`}
                        >
                          {isFirst && <Crown className="w-3 h-3" />}
                          <span>#{rank}</span>
                        </span>

                        {/* Floating Glowing Planet */}
                        <div
                          className={`relative z-20 rounded-full overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 ${
                            isFirst
                              ? 'w-14 h-14 sm:w-16 sm:h-16 -mb-4 ring-2 ring-[#E5C158]/70'
                              : 'w-11 h-11 sm:w-13 sm:h-13 -mb-3.5 ring-2 ring-white/25'
                          }`}
                          style={{
                            boxShadow: `0 0 24px ${accentHex}55`,
                          }}
                        >
                          <img
                            src={`/images/planets/${house.id}.webp`}
                            alt={house.name}
                            className="w-full h-full object-cover scale-[1.18]"
                          />
                        </div>

                        {/* 3D Translucent Glass Cylinder Pedestal */}
                        <div className="relative w-full">
                          {/* Top Elliptical Rim */}
                          <div
                            className="w-full h-4 sm:h-5 rounded-[50%] relative z-10 border"
                            style={{
                              background: isFirst
                                ? 'linear-gradient(180deg, rgba(229,193,88,0.28) 0%, rgba(30,37,56,0.75) 100%)'
                                : isSecond
                                ? 'linear-gradient(180deg, rgba(148,163,184,0.28) 0%, rgba(30,37,56,0.75) 100%)'
                                : 'linear-gradient(180deg, rgba(251,113,112,0.24) 0%, rgba(30,37,56,0.75) 100%)',
                              borderColor: `${accentHex}55`,
                            }}
                          />

                          {/* Cylinder Body */}
                          <div
                            className={`-mt-2.5 rounded-b-[20px] border-x border-b flex flex-col items-center justify-center text-center px-1.5 backdrop-blur-md ${
                              isFirst
                                ? 'pt-6 pb-4 sm:pt-7 sm:pb-5 min-h-[104px] sm:min-h-[118px]'
                                : 'pt-5 pb-3.5 sm:pt-6 sm:pb-4 min-h-[84px] sm:min-h-[96px]'
                            }`}
                            style={{
                              background: isFirst
                                ? 'linear-gradient(180deg, rgba(30,37,56,0.88) 0%, rgba(197,155,56,0.20) 100%)'
                                : isSecond
                                ? 'linear-gradient(180deg, rgba(30,37,56,0.86) 0%, rgba(96,165,250,0.16) 100%)'
                                : 'linear-gradient(180deg, rgba(30,37,56,0.86) 0%, rgba(251,113,112,0.15) 100%)',
                              borderColor: `${accentHex}45`,
                              boxShadow: `0 10px 26px -8px ${accentHex}40`,
                            }}
                          >
                            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-full">
                              {house.name}
                            </p>
                            <p
                              className={`text-xs sm:text-sm font-extrabold tabular-nums mt-0.5 ${
                                isFirst ? 'text-[#E5C158]' : 'text-white'
                              }`}
                            >
                              {house.total_points.toLocaleString()}
                              <span className="text-[10px] font-medium text-slate-300 ml-0.5">
                                pts
                              </span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Ranks 4-9 Dark Glass Rows */}
                <div className="space-y-2.5">
                  {remainingHouses.map((house, idx) => {
                    const rank = idx + 4;
                    const pct = Math.max(15, Math.round((house.total_points / topScore) * 100));
                    const isMyHouse =
                      house.id.toLowerCase() === normalizedHouseId.toLowerCase();

                    return (
                      <Link
                        key={house.id}
                        href={`/directory?house=${encodeURIComponent(house.name)}`}
                        className={`flex items-center justify-between gap-3 px-3.5 sm:px-4 py-3 rounded-2xl border transition group ${
                          isMyHouse
                            ? 'bg-gradient-to-r from-[#FB7170]/15 via-[#FB7170]/8 to-white/[0.03] border-[#FB7170]/75 shadow-[0_0_22px_rgba(251,113,112,0.18)]'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span
                            className={`w-5 text-center text-xs font-bold tabular-nums shrink-0 ${
                              isMyHouse ? 'text-white' : 'text-slate-400'
                            }`}
                          >
                            {rank}
                          </span>

                          <div
                            className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2"
                            style={{
                              borderColor: `${house.color_hex}66`,
                              boxShadow: `0 0 14px ${house.color_hex}44`,
                            }}
                          >
                            <img
                              src={`/images/planets/${house.id}.webp`}
                              alt={house.name}
                              loading="lazy"
                              className="w-full h-full object-cover scale-[1.18]"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs sm:text-sm font-bold text-white truncate">
                                {house.name}
                              </span>
                              {isMyHouse && (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#FB7170]/20 border border-[#FB7170]/70 text-white text-[10px] font-bold shrink-0 shadow-[0_0_10px_rgba(251,113,112,0.3)]">
                                  บ้านของคุณ
                                </span>
                              )}
                            </div>

                            {/* Subtle Dark Progress Track */}
                            <div className="h-1.5 w-full max-w-[180px] sm:max-w-[240px] rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: isMyHouse ? '#FB7170' : 'rgba(148,163,184,0.55)',
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1 shrink-0 tabular-nums">
                          <span className="text-xs sm:text-sm font-extrabold text-white">
                            {house.total_points.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">pts</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </section>

        {/* ================= 8. MISSIONS & UPCOMING EVENTS ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Missions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/images/icons/missions.webp"
                  alt="Missions"
                  className="w-10 h-10 rounded-xl shadow-sm shrink-0"
                />
                <div>
                  <h2 className="text-base font-bold text-[#1E2538]">ภารกิจที่ต้องเก็บ</h2>
                  <p className="text-xs text-slate-500">
                    สำเร็จแล้ว {completedMissionsCount}/{mergedMissions.length} ภารกิจ
                  </p>
                </div>
              </div>
              <Link
                href="/profile"
                className="px-3 py-1 rounded-full bg-[#1E2538] hover:bg-[#2B3550] text-white text-[11px] font-bold inline-flex items-center gap-0.5 shrink-0 transition shadow-sm"
              >
                ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5 text-[#FB7170]" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {mergedMissions.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#FAFAF8] border border-slate-200/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[#1E2538] truncate">{m.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{m.description}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 tabular-nums ${
                      m.status === 'APPROVED'
                        ? 'bg-[#1E2538] text-white'
                        : m.status === 'PENDING'
                        ? 'bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {m.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-[#E5C158]" />}
                    {m.status === 'APPROVED' ? 'สำเร็จ' : m.status === 'PENDING' ? 'รอตรวจ' : `+${m.reward_points} Pts`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events/Classes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/images/icons/events.webp"
                  alt="Upcoming Events"
                  className="w-10 h-10 rounded-xl shadow-sm shrink-0"
                />
                <div>
                  <h2 className="text-base font-bold text-[#1E2538]">กิจกรรม/คลาสที่ใกล้มาถึง</h2>
                  <p className="text-xs text-slate-500">เตรียมตัวเข้าร่วมและเช็กชื่อสะสมแต้ม</p>
                </div>
              </div>
              <Link
                href="/events/calendar"
                className="px-3 py-1 rounded-full bg-[#1E2538] hover:bg-[#2B3550] text-white text-[11px] font-bold inline-flex items-center gap-0.5 shrink-0 transition shadow-sm"
              >
                ปฏิทิน <ChevronRight className="w-3.5 h-3.5 text-[#FB7170]" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingItems.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="p-3.5 rounded-xl bg-[#FAFAF8] hover:bg-slate-100 border border-slate-200/60 flex items-center justify-between gap-3 transition"
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[#1E2538] truncate">{ev.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {ev.published_date_text} • {ev.location_name}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 9. BANNER ABOUT (COMPACT CARD) ================= */}
        <Link
          href="/about"
          className="block bg-[#1E2538] hover:bg-[#252E46] text-white rounded-2xl p-5 shadow-sm transition group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-[#E5C158]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#E5C158]">
                  เกี่ยวกับโครงการ Young FTI ELITE 11
                </p>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  ทำความรู้จักหลักสูตรนักอุตสาหกรรมรุ่นใหม่
                </h3>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </Link>
      </div>

      <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

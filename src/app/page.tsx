'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, mockMissions, mockEvents, mockPrivileges, mockNotifications } from '@/lib/mockData';
import { EventItem } from '@/types';
import {
  Bell,
  Gift,
  GraduationCap,
  Calendar,
  Building2,
  ChevronRight,
  Coins,
  Crown,
  Trophy,
  Target,
  Clock,
  MapPin,
  Cpu,
  Briefcase,
  ShoppingBag,
  Factory,
  Wheat,
  HardHat,
  Zap,
  Landmark,
  Info,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import { WebLoginModal } from '@/components/layout/WebLoginModal';

const INDUSTRY_CATEGORIES = [
  { name: 'เทคโนโลยี', query: 'technology', icon: Cpu },
  { name: 'บริการ', query: 'services', icon: Briefcase },
  { name: 'อุปโภคบริโภค', query: 'consumer_goods', icon: ShoppingBag },
  { name: 'อุตสาหกรรม', query: 'industrial_goods', icon: Factory },
  { name: 'เกษตร / อาหาร', query: 'agriculture_and_food_industrial', icon: Wheat },
  { name: 'ก่อสร้าง', query: 'real_estate_and_construction', icon: HardHat },
  { name: 'ทรัพยากร', query: 'resources', icon: Zap },
  { name: 'การเงิน / ลงทุน', query: 'financial_and_investment', icon: Landmark },
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
    <div className="w-full bg-[#F7F7F5] text-[#1E2538] pb-24">
      {/* ================= 1. EXECUTIVE NAVY HERO HEADER ================= */}
      <section className="bg-gradient-to-b from-[#111827] to-[#1E2538] text-white pt-5 pb-14 px-4 sm:px-6 rounded-b-[28px] shadow-sm">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Top Brand & Tier Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Young FTI ELITE 11
                </h1>
                <BadgeCheck className="w-4 h-4 text-[#E5C158] shrink-0" />
              </div>
              <p className="text-[11px] text-slate-300">สภาอุตสาหกรรมแห่งประเทศไทย</p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/15 bg-white/10 text-[#E5C158] text-xs font-semibold shrink-0">
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
                  className="w-10 h-10 rounded-full object-cover border border-white/25 shrink-0 bg-slate-800"
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
                className="text-left text-xs font-semibold text-[#E5C158] hover:underline"
              >
                เข้าสู่ระบบสมาชิก Young FTI ELITE 11 →
              </button>
            )}

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/notifications"
                aria-label="การแจ้งเตือน"
                className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition"
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

      {/* ================= 2. FLOATING SHORTCUT CARD ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-[22px] shadow-[0_8px_28px_rgba(15,23,42,0.07)] border border-slate-100 p-4 grid grid-cols-4 gap-2">
          <Link
            href="/privileges"
            className="flex flex-col items-center text-center gap-1.5 py-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#FBF6EC] text-[#B38728] flex items-center justify-center group-hover:bg-[#F5EBD6] transition">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#1E2538]">Privileges</span>
          </Link>

          <Link
            href="/events?category=course"
            className="flex flex-col items-center text-center gap-1.5 py-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#FBF6EC] text-[#B38728] flex items-center justify-center group-hover:bg-[#F5EBD6] transition">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#1E2538]">Courses</span>
          </Link>

          <Link
            href="/events?category=general"
            className="flex flex-col items-center text-center gap-1.5 py-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#FBF6EC] text-[#B38728] flex items-center justify-center group-hover:bg-[#F5EBD6] transition">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#1E2538]">Events</span>
          </Link>

          <Link
            href="/directory"
            className="flex flex-col items-center text-center gap-1.5 py-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#FBF6EC] text-[#B38728] flex items-center justify-center group-hover:bg-[#F5EBD6] transition">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#1E2538]">Business</span>
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
              className="text-xs font-bold text-[#B38728] hover:underline flex items-center gap-0.5 shrink-0"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
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
              className="text-xs font-bold text-[#B38728] hover:underline flex items-center gap-0.5 shrink-0"
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
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
              className="text-xs font-bold text-[#B38728] hover:underline flex items-center gap-0.5 shrink-0"
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
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
            {INDUSTRY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/directory?industry=${encodeURIComponent(cat.query)}`}
                  className="min-w-[100px] sm:min-w-[110px] snap-start bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-[#C59B38] shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition flex flex-col items-center text-center gap-2 shrink-0 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FBF6EC] text-[#B38728] flex items-center justify-center group-hover:bg-[#F5EBD6] transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#1E2538] leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ================= 7. HOUSE LEADERBOARD (MOVED FROM ABOUT) ================= */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FBF6EC] text-[#B38728] flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E2538]">
                ตารางอันดับคะแนน (House Leaderboard)
              </h2>
              <p className="text-xs text-slate-500">คะแนนรวมทั้ง 9 กลุ่มดวงดาว รุ่นที่ 11</p>
            </div>
          </div>

          <div className="space-y-2">
            {sortedHouses.map((house, index) => (
              <div
                key={house.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAFAF8] border border-slate-200/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 tabular-nums ${
                      index === 0
                        ? 'bg-[#C59B38] text-white'
                        : index === 1
                        ? 'bg-[#1E2538] text-white'
                        : index === 2
                        ? 'bg-[#8A6418] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: house.color_hex }}
                  />
                  <span className="text-xs sm:text-sm font-bold text-[#1E2538] truncate">
                    {house.name}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1E2538] tabular-nums shrink-0">
                  {house.total_points.toLocaleString()}{' '}
                  <span className="text-[11px] text-slate-400 font-medium">pts</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 8. MISSIONS & UPCOMING EVENTS ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Missions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FBF6EC] text-[#B38728] flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1E2538]">ภารกิจที่ต้องเก็บ</h2>
                  <p className="text-xs text-slate-500">
                    สำเร็จแล้ว {completedMissionsCount}/{mergedMissions.length} ภารกิจ
                  </p>
                </div>
              </div>
              <Link href="/profile" className="text-xs font-bold text-[#B38728] hover:underline">
                ดูทั้งหมด
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
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FBF6EC] text-[#B38728] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1E2538]">กิจกรรม/คลาสที่ใกล้มาถึง</h2>
                  <p className="text-xs text-slate-500">เตรียมตัวเข้าร่วมและเช็กชื่อสะสมแต้ม</p>
                </div>
              </div>
              <Link href="/events/calendar" className="text-xs font-bold text-[#B38728] hover:underline">
                ปฏิทิน
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

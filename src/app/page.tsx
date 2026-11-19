'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import {
  mockHouses,
  mockEvents,
  mockPrivileges,
  mockNotifications,
  yftiParticipants,
} from '@/lib/mockData';
import { EventItem, PrivilegeCategory } from '@/types';
import {
  Bell,
  ChevronRight,
  Coins,
  Crown,
  QrCode,
  Search,
  ShieldCheck,
  Building2,
  MapPin,
  LogIn,
  BadgeCheck,
  Sparkles,
  LayoutGrid,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { WebLoginModal } from '@/components/layout/WebLoginModal';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';
import { MemberCard } from '@/components/profile/MemberCard';
import {
  formatMemberCode,
  DEFAULT_AVATAR_DATA_URI,
  handleAvatarError,
} from '@/components/profile/profileUtils';

const INDUSTRY_CIRCLES = [
  { name: 'เทคโนโลยี', query: 'technology', iconSrc: '/images/icons/tech.webp' },
  { name: 'บริการ', query: 'services', iconSrc: '/images/icons/services.webp' },
  { name: 'อุตสาหกรรม', query: 'industrial_goods', iconSrc: '/images/icons/industrial.webp' },
  { name: 'ก่อสร้าง', query: 'real_estate_and_construction', iconSrc: '/images/icons/construction.webp' },
  { name: 'การเงิน', query: 'financial_and_investment', iconSrc: '/images/icons/finance.webp' },
  { name: 'เกษตร/อาหาร', query: 'agriculture_and_food_industrial', iconSrc: '/images/icons/agriculture.webp' },
  { name: 'อุปโภคบริโภค', query: 'consumer_goods', iconSrc: '/images/icons/consumer.webp' },
];

const PRIVILEGE_FILTERS: { label: string; value: PrivilegeCategory }[] = [
  { label: 'สำหรับคุณ', value: 'All' },
  { label: 'ร้านอร่อย', value: 'Food & Drink' },
  { label: 'ไลฟ์สไตล์', value: 'Lifestyle' },
  { label: 'ท่องเที่ยว', value: 'Travel' },
  { label: 'ช้อปปิ้ง', value: 'Shopping' },
];

export default function HomePage() {
  const router = useRouter();
  const { profile } = useLiffAuth();
  const [mounted, setMounted] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [customEvents, setCustomEvents] = useState<EventItem[]>([]);
  const [selectedPrivCategory, setSelectedPrivCategory] = useState<PrivilegeCategory>('All');
  const [directoryQuery, setDirectoryQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const readIds = JSON.parse(localStorage.getItem('yfti_notifications_read') || '[]');
        if (Array.isArray(readIds)) setReadNotificationIds(readIds);

        const custom = JSON.parse(localStorage.getItem('yfti_custom_events') || '[]');
        if (Array.isArray(custom)) setCustomEvents(custom);
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

  const upcomingEvents = useMemo(
    () => [...customEvents, ...mockEvents].filter((e) => e.status === 'UPCOMING').slice(0, 4),
    [customEvents]
  );

  const filteredPrivileges = useMemo(() => {
    const list =
      selectedPrivCategory === 'All'
        ? mockPrivileges
        : mockPrivileges.filter((p) => p.category === selectedPrivCategory);
    return list.slice(0, 6);
  }, [selectedPrivCategory]);

  const spotlightPrivileges = useMemo(() => {
    const featured = mockPrivileges.filter((p) => p.is_featured);
    return (featured.length > 0 ? featured : mockPrivileges).slice(0, 4);
  }, []);

  const featuredDirectory = useMemo(() => {
    return yftiParticipants
      .filter((p) => p.profile_picture_url && p.company_name_thai)
      .slice(0, 8);
  }, []);

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

  const handleDirectorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = directoryQuery.trim();
    router.push(trimmed ? `/directory?q=${encodeURIComponent(trimmed)}` : '/directory');
  };

  return (
    <div className="w-full bg-[#F6F4EF] text-[#161C2C] pb-24">
      {/* ================= 1. OBSIDIAN LUXURY STAGE + SINGLE 3D MEMBER CARD ================= */}
      <section className="relative overflow-hidden luxury-stage text-white pt-4 pb-16 px-4 sm:px-6 border-b border-[#C5A059]/30">
        <div className="absolute inset-0 pointer-events-none select-none">
          <img
            src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-right opacity-15"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(11,16,29,0.96) 30%, rgba(18,26,45,0.88) 65%, rgba(24,34,58,0.72) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          {/* Compact Top Utility Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ECD28E]/90">
                  Young FTI ELITE 11
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-[#ECD28E] shrink-0" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white truncate leading-snug">
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
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm flex items-center justify-center transition"
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
                className="relative w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm flex items-center justify-center transition"
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

          {/* Interactive 3D Member Card with Stacked Wallet Peek */}
          <div className="pt-1 relative">
            {activeProfile ? (
              <div className="relative max-w-xl mx-auto">
                <div
                  aria-hidden="true"
                  className="hidden sm:block absolute top-3 -right-3 bottom-3 w-10 rounded-r-3xl bg-gradient-to-b from-[#D8B45A]/85 via-[#C59B38]/75 to-[#8C6A20]/70 border border-[#E5C158]/40 shadow-lg pointer-events-none"
                />
                <div className="relative z-10">
                  <MemberCard
                    profile={activeProfile}
                    houseName={displayHouseName}
                    memberCode={memberCode}
                    tier={tier}
                    isFlipped={isCardFlipped}
                    onToggleFlip={() => setIsCardFlipped((prev) => !prev)}
                    showFlipButton={false}
                  />
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <button
                    type="button"
                    aria-label="หน้าบัตรสมาชิก"
                    onClick={() => setIsCardFlipped(false)}
                    className={`h-1.5 rounded-full transition-all ${
                      !isCardFlipped ? 'w-5 bg-[#ECD28E]' : 'w-1.5 bg-white/30'
                    }`}
                  />
                  <button
                    type="button"
                    aria-label="หลังบัตรและ QR"
                    onClick={() => setIsCardFlipped(true)}
                    className={`h-1.5 rounded-full transition-all ${
                      isCardFlipped ? 'w-5 bg-[#ECD28E]' : 'w-1.5 bg-white/30'
                    }`}
                  />
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-[#C5A059]/40 bg-gradient-to-br from-[#0E1424] via-[#172038] to-[#1E2A46] shadow-[0_14px_34px_rgba(0,0,0,0.28)] space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src="/YFTI-11-Logo.jpg"
                        alt="Young FTI ELITE 11"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold tracking-tight text-white">
                        YOUNG FTI <span className="font-light text-white/90">ELITE 11</span>
                      </p>
                      <p className="text-[11px] text-slate-300">Digital Member Card & Privileges</p>
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl luxury-gold-btn text-xs sm:text-sm font-bold transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบสมาชิก</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= 2. LAYERED POINTS STRIP + QUICK MENU SHEET ================= */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 -mt-10 relative z-20">
        <div className="rounded-t-[26px] bg-gradient-to-r from-[#0E1526] via-[#172138] to-[#10182B] border-x border-t border-[#C5A059]/40 text-white px-5 pt-3.5 pb-9 shadow-[0_-6px_24px_rgba(11,16,29,0.22)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl badge-gold-metallic flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-300 font-medium leading-none">
                คะแนนสะสมของคุณ
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg sm:text-xl font-extrabold text-white tabular-nums leading-none">
                  {points.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-[#ECD28E]">Pts</span>
                <span className="hidden sm:inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-[#ECD28E]">
                  <Crown className="w-3 h-3" />
                  {tier}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeProfile && (
              <button
                type="button"
                onClick={() => setIsCardFlipped((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition"
              >
                <QrCode className="w-3.5 h-3.5 text-[#ECD28E]" />
                <span>{isCardFlipped ? 'หน้าบัตร' : 'แสดง QR'}</span>
              </button>
            )}
            <Link
              href="/privileges"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl luxury-gold-btn text-xs font-bold transition"
            >
              <span>แลกสิทธิ์</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="-mt-5 bg-white rounded-[26px] shadow-[0_10px_28px_rgba(13,19,33,0.06)] p-4 sm:p-5">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <Link
              href="/privileges"
              className="flex flex-col items-center text-center gap-1.5 py-1.5 rounded-xl hover:bg-[#F6F4EF] transition group"
            >
              <img
                src="/images/icons/privileges.webp"
                alt="สิทธิพิเศษ"
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl shadow-sm group-hover:-translate-y-0.5 transition-transform"
              />
              <span className="text-[11px] sm:text-xs font-bold text-[#161C2C]">สิทธิพิเศษ</span>
            </Link>

            <Link
              href="/directory"
              className="flex flex-col items-center text-center gap-1.5 py-1.5 rounded-xl hover:bg-[#F6F4EF] transition group"
            >
              <img
                src="/images/icons/business.webp"
                alt="ทำเนียบธุรกิจ"
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl shadow-sm group-hover:-translate-y-0.5 transition-transform"
              />
              <span className="text-[11px] sm:text-xs font-bold text-[#161C2C]">ทำเนียบธุรกิจ</span>
            </Link>

            <Link
              href="/events"
              className="flex flex-col items-center text-center gap-1.5 py-1.5 rounded-xl hover:bg-[#F6F4EF] transition group"
            >
              <img
                src="/images/icons/events.webp"
                alt="กิจกรรม"
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl shadow-sm group-hover:-translate-y-0.5 transition-transform"
              />
              <span className="text-[11px] sm:text-xs font-bold text-[#161C2C]">กิจกรรม</span>
            </Link>

            <Link
              href="/privileges?tab=history"
              className="flex flex-col items-center text-center gap-1.5 py-1.5 rounded-xl hover:bg-[#F6F4EF] transition group"
            >
              <img
                src="/images/icons/points.webp"
                alt="คูปองของฉัน"
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl shadow-sm group-hover:-translate-y-0.5 transition-transform"
              />
              <span className="text-[11px] sm:text-xs font-bold text-[#161C2C]">คูปองของฉัน</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 3. PRIVILEGES PEEK CAROUSEL (SUPER-APP OFFER CARDS) ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-7 space-y-3.5">
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

        {/* Pill Filter Chips (TrueYou / Luxury Pill Style) */}
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
                    : 'bg-white/75 text-slate-600 border-[#E6E0D4] hover:border-[#C5A059]/60 hover:text-[#161C2C]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Full-Bleed Overlay Offer Cards (All Text Over Photo) */}
        <div className="flex gap-3.5 overflow-x-auto pt-1 pb-5 -mb-3 snap-x no-scrollbar -mr-4 pr-4 sm:mr-0 sm:pr-0">
          {filteredPrivileges.map((priv) => (
            <Link
              key={priv.id}
              href={`/privileges/${priv.id}`}
              className="relative w-[268px] sm:w-[290px] h-[248px] sm:h-[264px] snap-start rounded-[24px] overflow-hidden bg-[#0D1321] shadow-[0_6px_16px_rgba(13,19,33,0.10)] ring-1 ring-inset ring-white/15 transition shrink-0 group block"
            >
              {/* Full-Bleed Background Photo */}
              <img
                src={priv.image_url}
                alt={priv.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Smooth Editorial Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090E1A]/95 via-[#090E1A]/45 to-[#090E1A]/20" />

              {/* Overlaid Content */}
              <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
                {/* Top Row: Category & Discount Pill */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0D1321]/65 backdrop-blur-md border border-white/15 text-[10px] font-bold text-[#ECD28E] uppercase tracking-wide">
                    {priv.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full badge-gold-metallic text-[10px] font-extrabold">
                    {priv.discount_label}
                  </span>
                </div>

                {/* Bottom Overlaid Copy + Points & Gold CTA */}
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-base font-extrabold text-white truncate drop-shadow-sm">
                      {priv.merchant}
                    </p>
                    <p className="text-xs text-slate-200/90 line-clamp-2 leading-snug">
                      {priv.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/15">
                    <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#ECD28E] tabular-nums">
                      <Coins className="w-4 h-4 text-[#DFC27D]" />
                      {priv.points_required}
                    </span>
                    <span className="px-4 py-1.5 rounded-full luxury-gold-btn text-xs font-bold">
                      รับสิทธิ์
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Elongated Gold Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          <span className="w-5 h-1 rounded-full bg-[#C5A059]" />
          <span className="w-1.5 h-1 rounded-full bg-[#D8D1C5]" />
          <span className="w-1.5 h-1 rounded-full bg-[#D8D1C5]" />
          <span className="w-1.5 h-1 rounded-full bg-[#D8D1C5]" />
        </div>
      </section>

      {/* ================= 4. CIRCULAR INDUSTRY MEDALLIONS (AIRY BRAND ROW) ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-7 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
            หมวดหมู่ธุรกิจแนะนำ
          </h2>
          <Link
            href="/directory"
            className="text-xs font-bold text-[#9A742B] hover:text-[#161C2C] inline-flex items-center gap-1 transition"
          >
            <span>ทำเนียบทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar -mr-4 pr-4 sm:mr-0 sm:pr-0">
          {INDUSTRY_CIRCLES.map((cat) => (
            <Link
              key={cat.query}
              href={`/directory?industry=${encodeURIComponent(cat.query)}`}
              className="flex flex-col items-center gap-2 shrink-0 w-[68px] group"
            >
              <div className="w-14 h-14 rounded-full bg-white shadow-[0_6px_18px_rgba(13,19,33,0.06)] group-hover:-translate-y-0.5 transition flex items-center justify-center p-2.5 overflow-hidden">
                <img
                  src={cat.iconSrc}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[11px] font-semibold text-[#161C2C] text-center leading-tight line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}

          {/* "View All" Circular Medallion */}
          <Link
            href="/directory"
            className="flex flex-col items-center gap-2 shrink-0 w-[68px] group"
          >
            <div className="w-14 h-14 rounded-full bg-[#0D1321] border border-[#C5A059]/50 shadow-[0_6px_18px_rgba(13,19,33,0.14)] group-hover:-translate-y-0.5 transition flex items-center justify-center text-[#ECD28E]">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#161C2C] text-center leading-tight">
              ดูทั้งหมด
            </span>
          </Link>
        </div>
      </section>

      {/* ================= 5. EXCLUSIVE ELITE SPOTLIGHT BANNERS (FULL-BLEED PEEK SLIDER) ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
              เฉพาะสมาชิก ELITE 11
            </h2>
            <p className="text-xs text-slate-500">ดีลพิเศษระดับ Executive ที่คัดสรรมาเฉพาะรุ่น</p>
          </div>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pt-1 pb-5 -mb-3 snap-x no-scrollbar -mr-4 pr-4 sm:mr-0 sm:pr-0">
          {spotlightPrivileges.map((priv) => (
            <Link
              key={`spot-${priv.id}`}
              href={`/privileges/${priv.id}`}
              className="relative w-[308px] sm:w-[380px] h-[176px] sm:h-[204px] snap-start rounded-[24px] overflow-hidden bg-[#0D1321] shadow-[0_6px_16px_rgba(13,19,33,0.10)] ring-1 ring-inset ring-white/15 shrink-0 group block"
            >
              <img
                src={priv.image_url}
                alt={priv.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(11,16,29,0.72) 0%, rgba(11,16,29,0.28) 42%, rgba(11,16,29,0.92) 100%)',
                }}
              />
              <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0D1321]/85 backdrop-blur-md border border-[#ECD28E]/40 text-[#ECD28E] text-[10px] font-bold uppercase tracking-wider shrink-0">
                    ELITE EXCLUSIVE
                  </span>
                  <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] truncate">
                    {priv.merchant}
                  </span>
                </div>
                <div className="space-y-1 max-w-[85%]">
                  <p className="text-xl sm:text-2xl font-extrabold text-[#ECD28E] leading-tight line-clamp-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                    {priv.discount_label}
                  </p>
                  <p className="text-xs font-medium text-white/95 line-clamp-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                    {priv.title}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <span className="w-5 h-1 rounded-full bg-[#0D1321]" />
          <span className="w-1.5 h-1 rounded-full bg-[#D8D1C5]" />
          <span className="w-1.5 h-1 rounded-full bg-[#D8D1C5]" />
        </div>
      </section>

      {/* ================= 6. FULL-BLEED DARK OBSIDIAN CONTRAST BAND: EXECUTIVE DIRECTORY SHOWCASE ================= */}
      <section className="mt-8 luxury-stage text-white py-7 border-y border-[#C5A059]/25">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ECD28E] block">
                Executive Network
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                ทำเนียบผู้บริหาร & เครือข่ายธุรกิจ
              </h2>
            </div>
            <Link
              href="/directory"
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[#ECD28E] text-[11px] font-bold inline-flex items-center gap-1 shrink-0 transition"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Instant Search inside Obsidian Band */}
          <form onSubmit={handleDirectorySearch} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={directoryQuery}
              onChange={(e) => setDirectoryQuery(e.target.value)}
              placeholder="ค้นหาชื่อสมาชิก, ชื่อเล่น, บริษัท หรืออุตสาหกรรม..."
              className="w-full pl-10 pr-20 py-2.5 bg-white text-[#161C2C] rounded-2xl text-xs sm:text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#C5A059] shadow-md"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-xl luxury-gold-btn text-xs font-bold transition"
            >
              ค้นหา
            </button>
          </form>

          {/* Horizontal Portrait Poster Cards (Visual Executive Showcase) */}
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x no-scrollbar -mr-4 pr-4 sm:mr-0 sm:pr-0">
            {featuredDirectory.map((member) => (
              <Link
                key={member.id}
                href={`/yfti_participants/${member.id}`}
                className="relative w-[154px] sm:w-[172px] h-[206px] sm:h-[228px] snap-start rounded-[22px] overflow-hidden bg-[#141B2D] ring-1 ring-inset ring-white/15 shrink-0 group block"
              >
                <img
                  src={member.profile_picture_url || DEFAULT_AVATAR_DATA_URI}
                  alt={member.name_thai}
                  loading="lazy"
                  onError={handleAvatarError}
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D18] via-[#090D18]/35 to-transparent" />

                {member.star_group_label && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-[#0D1321]/80 backdrop-blur-md border border-[#DFC27D]/35 text-[#ECD28E] text-[9px] font-bold">
                    {member.star_group_label}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 space-y-0.5">
                  <p className="text-xs font-extrabold text-white truncate">
                    {member.name_thai}
                  </p>
                  <p className="text-[10px] text-[#ECD28E] font-medium flex items-center gap-1 truncate">
                    <Building2 className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{member.company_name_thai}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7. UPCOMING EVENTS POSTER CAROUSEL ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-7 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
              กิจกรรม & คอร์สเรียนที่ใกล้มาถึง
            </h2>
            <p className="text-xs text-slate-500">เข้าร่วมเพื่อสะสมแต้มและเชื่อมต่อเครือข่าย</p>
          </div>
          <Link
            href="/events"
            className="text-xs font-bold text-[#9A742B] hover:text-[#161C2C] inline-flex items-center gap-1 shrink-0 transition"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pt-1 pb-5 -mb-3 snap-x no-scrollbar -mr-4 pr-4 sm:mr-0 sm:pr-0">
          {upcomingEvents.map((ev) => (
            <Link
              key={ev.id}
              href={`/events/${ev.id}`}
              className="relative w-[258px] sm:w-[278px] h-[220px] sm:h-[234px] snap-start rounded-[22px] overflow-hidden bg-[#0D1321] shadow-[0_6px_16px_rgba(13,19,33,0.10)] ring-1 ring-inset ring-white/15 transition shrink-0 group block"
            >
              <img
                src={
                  ev.image_url ||
                  'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/event_training.webp'
                }
                alt={ev.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090E1A]/95 via-[#090E1A]/45 to-[#090E1A]/15" />

              <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0D1321]/75 backdrop-blur-md border border-[#DFC27D]/35 text-[#ECD28E] text-[10px] font-bold">
                    +{ev.reward_points} Pts
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#ECD28E] flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 shrink-0" />
                    <span className="truncate">{ev.published_date_text || 'กำลังจะมาถึง'}</span>
                  </p>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white line-clamp-2 leading-snug">
                    {ev.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1 truncate pt-0.5">
                    <MapPin className="w-3 h-3 text-[#ECD28E]/80 shrink-0" />
                    <span className="truncate">{ev.location_name}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 8. HOUSE LEADERBOARD (ALL 9 HOUSES — UNIFIED LUXURY OBSIDIAN CARD) ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-7 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
            อันดับบ้าน 9 ดวงดาว
          </h2>
          <Link
            href="/directory"
            className="text-xs font-bold text-[#9A742B] hover:text-[#161C2C] inline-flex items-center gap-1 transition"
          >
            <span>ดูรายชื่อสมาชิก</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="luxury-stage rounded-[26px] p-4 sm:p-6 text-white shadow-[0_14px_34px_rgba(11,16,29,0.16)] space-y-5">
          {(() => {
            const topScore = Math.max(1, sortedHouses[0]?.total_points ?? 1);
            const podium = [
              { house: sortedHouses[1], rank: 2 },
              { house: sortedHouses[0], rank: 1 },
              { house: sortedHouses[2], rank: 3 },
            ].filter((item) => Boolean(item.house));
            const remainingHouses = sortedHouses.slice(3);

            return (
              <>
                {/* Top 3 Podium (#2 - #1 - #3) — Seamless Borderless Luxury */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end">
                  {podium.map(({ house, rank }) => {
                    const isFirst = rank === 1;
                    const isMyHouse =
                      house.id.toLowerCase() === normalizedHouseId.toLowerCase();

                    return (
                      <Link
                        key={house.id}
                        href={`/directory?house=${encodeURIComponent(house.name)}`}
                        className={`rounded-2xl px-2.5 sm:px-4 text-center flex flex-col items-center transition hover:-translate-y-0.5 ${
                          isFirst
                            ? 'py-5 bg-gradient-to-b from-[#C5A059]/22 via-[#C5A059]/8 to-transparent'
                            : 'py-3.5 bg-white/[0.04] hover:bg-white/[0.08]'
                        }`}
                      >
                        <span
                          className={`text-[11px] font-bold inline-flex items-center gap-1 mb-2.5 tabular-nums ${
                            isFirst ? 'text-[#ECD28E]' : 'text-slate-400'
                          }`}
                        >
                          {isFirst && <Crown className="w-3 h-3" />}
                          #{rank}
                        </span>

                        <img
                          src={`/images/planets/${house.id}.webp?v=2`}
                          alt={house.name}
                          loading="lazy"
                          className={`object-contain shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                            isFirst
                              ? 'w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_20px_rgba(236,210,142,0.35)]'
                              : 'w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]'
                          }`}
                        />

                        <div className="min-w-0 w-full mt-2.5">
                          <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                            {house.name}
                          </p>
                          <p
                            className={`text-[11px] font-bold tabular-nums mt-0.5 ${
                              isFirst ? 'text-[#ECD28E]' : 'text-slate-300'
                            }`}
                          >
                            {house.total_points.toLocaleString()}{' '}
                            <span className="text-[10px] font-normal opacity-70">pts</span>
                          </p>
                          {isMyHouse && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#ECD28E]/18 text-[#ECD28E] text-[9px] font-bold">
                              บ้านของคุณ
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Ranks #4 - #9 Borderless Clean Rows */}
                <div className="pt-2 divide-y divide-white/[0.06]">
                  {remainingHouses.map((house, idx) => {
                    const rank = idx + 4;
                    const pct = Math.max(18, Math.round((house.total_points / topScore) * 100));
                    const isMyHouse =
                      house.id.toLowerCase() === normalizedHouseId.toLowerCase();

                    return (
                      <Link
                        key={house.id}
                        href={`/directory?house=${encodeURIComponent(house.name)}`}
                        className={`px-3 py-2.5 first:pt-2.5 rounded-xl flex items-center justify-between gap-3 transition ${
                          isMyHouse
                            ? 'bg-[#C5A059]/15 my-1'
                            : 'hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span
                            className={`w-5 text-center text-xs font-bold tabular-nums shrink-0 ${
                              isMyHouse ? 'text-[#ECD28E]' : 'text-slate-400'
                            }`}
                          >
                            {rank}
                          </span>
                          <img
                            src={`/images/planets/${house.id}.webp?v=2`}
                            alt={house.name}
                            loading="lazy"
                            className="w-9 h-9 object-contain shrink-0"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs sm:text-sm font-bold text-white truncate">
                                {house.name}
                              </span>
                              {isMyHouse && (
                                <span className="px-2 py-0.5 rounded-full bg-[#ECD28E]/20 text-[#ECD28E] text-[9px] font-bold shrink-0">
                                  บ้านคุณ
                                </span>
                              )}
                            </div>
                            <div className="h-1 w-full max-w-[140px] rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: isMyHouse ? '#ECD28E' : 'rgba(255,255,255,0.32)',
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <span className="text-xs sm:text-sm font-bold text-white tabular-nums shrink-0">
                          {house.total_points.toLocaleString()}{' '}
                          <span className="text-[10px] font-normal text-slate-400">pts</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
}

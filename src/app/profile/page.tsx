'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, mockEvents, mockMissions, yftiParticipants } from '@/lib/mockData';
import { EventItem } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import {
  Coins,
  Award,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  LogOut,
  RefreshCw,
  Building2,
  CheckCircle2,
  Users,
  RotateCw,
  CreditCard,
  ExternalLink,
  Share2,
  Star,
  ShieldCheck,
  Target,
  X,
  ChevronRight,
  Clock,
  Crown,
  Upload,
  QrCode,
  CalendarCheck,
  ArrowLeft,
} from 'lucide-react';
import { WebLoginModal } from '@/components/layout/WebLoginModal';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { profile, updateRole, logout } = useLiffAuth();
  const [mounted, setMounted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'events' | 'missions'>('events');
  const [copySuccess, setCopySuccess] = useState(false);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [customEvents, setCustomEvents] = useState<EventItem[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [missionOverrides, setMissionOverrides] = useState<Record<string, 'APPROVED' | 'PENDING' | 'NOT_STARTED'>>({});

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const savedFollows = JSON.parse(localStorage.getItem('yfti_following_ids') || '[]');
        if (Array.isArray(savedFollows)) setFollowingIds(savedFollows);

        const savedCustom = JSON.parse(localStorage.getItem('yfti_custom_events') || '[]');
        if (Array.isArray(savedCustom)) setCustomEvents(savedCustom);

        const savedRegs = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
        if (Array.isArray(savedRegs)) {
          const ids = savedRegs
            .filter((r: any) => r.status !== 'REJECTED')
            .map((r: any) => String(r.eventId));
          setRegisteredEventIds(ids);
        }

        const savedMissions = JSON.parse(localStorage.getItem('yfti_mission_submissions') || '{}');
        if (savedMissions && typeof savedMissions === 'object') {
          setMissionOverrides(savedMissions);
        }
      } catch {}
    }
  }, []);

  const sortedHouses = useMemo(
    () => [...mockHouses].sort((a, b) => b.total_points - a.total_points),
    []
  );

  const rawHouseId = (profile?.house_id || profile?.house?.id || 'the_mars').replace(/-/g, '_');

  const currentHouse = useMemo(
    () => sortedHouses.find((h) => h.id === rawHouseId) || profile?.house || sortedHouses[0],
    [sortedHouses, rawHouseId, profile?.house]
  );

  const houseRank = useMemo(() => {
    const idx = sortedHouses.findIndex((h) => h.id === rawHouseId);
    return idx >= 0 ? idx + 1 : 1;
  }, [sortedHouses, rawHouseId]);

  const houseMembers = useMemo(
    () => yftiParticipants.filter((p) => (p.star_group || '').replace(/-/g, '_') === rawHouseId),
    [rawHouseId]
  );

  const allEventsList = useMemo(() => [...customEvents, ...mockEvents], [customEvents]);

  const myEventsList = useMemo(() => {
    return allEventsList.filter(
      (ev) => ev.isRegisteredForEvent || ev.isCheckedIn || registeredEventIds.includes(String(ev.id))
    );
  }, [allEventsList, registeredEventIds]);

  const mergedMissions = useMemo(
    () =>
      mockMissions.map((m) => ({
        ...m,
        status: missionOverrides[m.id] || m.status || 'NOT_STARTED',
      })),
    [missionOverrides]
  );

  const handleSubmitMission = (missionId: string) => {
    setMissionOverrides((prev) => {
      const next = { ...prev, [missionId]: 'PENDING' as const };
      if (typeof window !== 'undefined') {
        localStorage.setItem('yfti_mission_submissions', JSON.stringify(next));
      }
      return next;
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-4 border-[#C59B38] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FBF6EC] text-[#B38728] flex items-center justify-center mx-auto">
          <CreditCard className="w-7 h-7" />
        </div>
        <h2 className="font-bold text-lg text-[#1E2538]">ไม่พบข้อมูลบัตรสมาชิก</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          กรุณาเข้าสู่ระบบหรือผูกบัญชีเพื่อเปิดใช้งานบัตรสมาชิกดิจิทัล Young FTI ELITE 11
        </p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full py-3 bg-[#1E2538] hover:bg-[#2B3550] text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          เข้าสู่ระบบสมาชิก
        </button>
        <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  const houseColor = currentHouse?.color_hex || '#C59B38';
  const houseName = currentHouse?.name || 'Mars';
  const housePoints = currentHouse?.total_points || 1640;
  const memberCode = `Y11-${String(profile.id).replace(/\D/g, '').padStart(4, '0') || '0088'}`;
  const tier =
    profile.tier ||
    ((profile.xp_balance ?? 0) >= 2000
      ? 'Platinum'
      : (profile.xp_balance ?? 0) >= 1000
      ? 'Gold'
      : 'Silver');
  const followingCount = followingIds.length > 0 ? followingIds.length : (profile.following_count ?? 18);
  const followerCount = profile.follower_count ?? 24;

  const registeredEventsCount = myEventsList.length || 6;
  const absentCount = 1;
  const absentQuota = 2;
  const profileInDirectory = yftiParticipants.some((p) => String(p.id) === String(profile.id));

  const memberQrPayload = JSON.stringify({
    type: 'YFTI_MEMBER_PASSPORT',
    memberId: profile.id,
    name: profile.display_name,
    phone: profile.phone_number,
    house: houseName,
    role: profile.role,
    batch: 'YFTI 11',
  });

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-24 px-4 sm:px-6 pt-4">
      {/* ================= 1. 3D FLIPPABLE DIGITAL MEMBER CARD ================= */}
      <div className="space-y-3">
        <div
          className="relative mx-auto w-full max-w-xl select-none"
          style={{ perspective: '1200px' }}
        >
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full aspect-[1.586/1] min-h-[250px] sm:min-h-[300px] rounded-3xl transition-transform duration-700 cursor-pointer shadow-[0_14px_34px_rgba(20,27,45,0.22)]"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* ================= FRONT OF CARD ================= */}
            <div
              className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-7 flex flex-col justify-between overflow-hidden border border-white/15 text-white"
              style={{
                background: 'linear-gradient(135deg, #141B2D 0%, #1E2538 55%, #232D47 100%)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
              }}
            >
              {/* Subtle Architectural Grid Pattern */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />

              {/* Top Row: Brand & Tier Pill */}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center shrink-0">
                    <Image
                      src="/YFTI-11-Logo.jpg"
                      alt="YFTI 11"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      YOUNG FTI ELITE 11
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-300 truncate">
                      สภาอุตสาหกรรมแห่งประเทศไทย
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#C59B38]/20 text-[#E5C158] border border-[#C59B38]/40 text-[10px] font-bold uppercase tracking-wider shrink-0">
                  {tier}
                </span>
              </div>

              {/* Center Row: Member Avatar, Name & Single-Line Role + Position + House */}
              <div className="relative z-10 flex items-center gap-3.5 sm:gap-5 my-auto">
                <img
                  src={profile.picture_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp'}
                  alt={profile.display_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/30 bg-[#141B2D] shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp';
                  }}
                />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <h2 className="text-base sm:text-xl font-bold text-white truncate tracking-tight">
                    {profile.display_name}
                  </h2>

                  {/* Single-line: MEMBER + Position + House */}
                  <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-[#C59B38] text-white text-[9px] font-bold rounded-md uppercase shrink-0">
                      {profile.role === 'SUPER_ADMIN' ? 'ADMIN' : 'MEMBER'}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-[#E5C158] truncate max-w-[115px] sm:max-w-[180px]">
                      {profile.position || 'Executive Member'}
                    </span>
                    <span className="text-white/30 text-[10px] shrink-0">•</span>
                    <span className="text-[11px] sm:text-xs text-slate-200 truncate font-medium">
                      {houseName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Membership No & Mini QR Badge */}
              <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-3">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Membership No.
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono tracking-widest text-white tabular-nums">
                    {memberCode}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-lg bg-white text-[#1E2538] flex items-center justify-center shadow-sm">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* ================= BACK OF CARD ================= */}
            <div
              className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-7 flex flex-col justify-between overflow-hidden border border-white/15 text-white"
              style={{
                background: 'linear-gradient(135deg, #141B2D 0%, #1E2538 100%)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Top Label */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-bold text-[#E5C158] tracking-wide">
                  Member Verification Pass
                </span>
                <span className="text-[11px] font-mono text-slate-300 tabular-nums">{memberCode}</span>
              </div>

              {/* Middle: Contact Details on Left & Scannable QR on Right */}
              <div className="flex items-center justify-between gap-4 my-auto">
                <div className="min-w-0 flex-1 space-y-2 text-[11px] sm:text-xs text-slate-200">
                  <p className="font-bold text-white truncate">{profile.display_name}</p>
                  <p className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                    <span className="tabular-nums">{profile.phone_number || '082-269-9962'}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                    <span className="truncate">{profile.email || 'yfti11@yfticonnect.com'}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Briefcase className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                    <span className="truncate">{profile.industry || 'สินค้าอุตสาหกรรมและการผลิต'}</span>
                  </p>
                </div>

                <div className="shrink-0 bg-white p-2.5 rounded-2xl shadow-md text-center flex flex-col items-center">
                  <QRCodeSVG
                    value={memberQrPayload}
                    size={84}
                    level="M"
                    fgColor="#1E2538"
                    includeMargin={false}
                  />
                  <span className="text-[8px] font-bold font-mono text-slate-600 mt-1 uppercase">
                    Scan to Verify
                  </span>
                </div>
              </div>

              {/* Bottom: Points & XP */}
              <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 font-semibold tabular-nums">
                  <span className="px-2.5 py-0.5 bg-[#C59B38]/20 text-[#E5C158] rounded-md border border-[#C59B38]/30">
                    {(profile.points_balance ?? 0).toLocaleString()} Pts
                  </span>
                  <span className="px-2.5 py-0.5 bg-white/10 text-slate-200 rounded-md border border-white/15">
                    {(profile.xp_balance ?? 0).toLocaleString()} XP
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Young FTI ELITE 11</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls BELOW the card */}
        <div className="max-w-xl mx-auto flex items-center justify-center gap-2.5 pt-1">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200/80 hover:border-[#C59B38] rounded-xl text-xs font-bold text-[#1E2538] transition shadow-sm flex items-center justify-center gap-2 group"
          >
            <RotateCw className="w-4 h-4 text-[#B38728] group-hover:rotate-180 transition-transform duration-500" />
            <span>{isFlipped ? 'ดูหน้าบัตร' : 'พลิกดูหลังบัตร (QR)'}</span>
          </button>

          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-5 py-2.5 bg-[#1E2538] hover:bg-[#2B3550] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <Users className="w-4 h-4 text-[#E5C158]" />
            <span>สลับโปรไฟล์</span>
          </button>
        </div>
      </div>

      {/* ================= 2. FOLLOWERS & FOLLOWING COUNTER BAR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] grid grid-cols-2 divide-x divide-slate-100">
        <div className="py-4 px-5 text-center">
          <p className="text-xl sm:text-2xl font-bold text-[#1E2538] tabular-nums">{followerCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            Followers
          </p>
        </div>
        <div className="py-4 px-5 text-center">
          <p className="text-xl sm:text-2xl font-bold text-[#1E2538] tabular-nums">{followingCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            Following
          </p>
        </div>
      </div>

      {/* ================= 3. PERSONAL & COMPANY INFO CARD ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] overflow-hidden divide-y divide-slate-100">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#1E2538]">
              {profile.display_name}
            </h3>
            <p className="text-xs text-slate-500">
              {profile.position || 'ผู้บริหารระดับสูง'} •{' '}
              <span className="font-semibold text-[#1E2538]">
                {profile.company_name || 'Young FTI ELITE 11'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={profileInDirectory ? `/yfti_participants/${profile.id}` : '/directory'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FBF6EC] hover:bg-[#F5EBD6] border border-[#EFE2C2] text-[#9A7320] rounded-xl text-xs font-bold transition"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>เปิดดูในทำเนียบรุ่น</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Share2 className="w-3.5 h-3.5 text-[#B38728]" />
              <span>{copySuccess ? 'คัดลอกแล้ว' : 'แชร์'}</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FBF6EC] text-[#B38728] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block">เบอร์โทรศัพท์</span>
              <span className="text-xs sm:text-sm font-semibold text-[#1E2538] tabular-nums">
                {profile.phone_number || '082-269-9962'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FBF6EC] text-[#B38728] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block">อีเมล</span>
              <span className="text-xs sm:text-sm font-semibold text-[#1E2538] truncate block">
                {profile.email || 'yfti11@yfticonnect.com'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FBF6EC] text-[#B38728] flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block">กลุ่มอุตสาหกรรม</span>
              <span className="text-xs sm:text-sm font-semibold text-[#1E2538] truncate block">
                {profile.industry || 'อสังหาริมทรัพย์และก่อสร้าง'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. SEPARATE HOUSE CARD ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: houseColor }}
            >
              <Star className="w-6 h-6 fill-white/30" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 block">บ้านของฉัน</span>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-[#1E2538]">{houseName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] tabular-nums">
                  Rank #{houseRank}
                </span>
              </div>
              <p className="text-xs text-slate-500 tabular-nums">
                {houseMembers.length} สมาชิก • {housePoints.toLocaleString()} คะแนน
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsHouseModalOpen(true)}
          className="w-full py-2.5 rounded-xl bg-[#B89138] hover:bg-[#a37f2d] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Users className="w-4 h-4" />
          <span>ดูสมาชิกในบ้าน</span>
        </button>
      </div>

      {/* ================= 5. SUMMARY & SPLIT ATTENDANCE / MISSIONS ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E2538]">ความก้าวหน้าของฉัน</h3>
            <p className="text-xs text-slate-500">สรุปคะแนน สถานะสมาชิก และโควตาการเข้าร่วม</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] text-xs font-bold tabular-nums shrink-0">
            {(profile.points_balance ?? 0).toLocaleString()} คะแนน
          </span>
        </div>

        {/* 4 Clean Summary Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[#9A7320] text-[11px] font-semibold mb-1">
              <Coins className="w-3.5 h-3.5" />
              <span>Point คะแนนสะสม</span>
            </div>
            <p className="text-xl font-bold text-[#1E2538] tabular-nums">
              {(profile.points_balance ?? 0).toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {(profile.xp_balance ?? 0).toLocaleString()} XP
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[#1E2538] text-[11px] font-semibold mb-1">
              <Crown className="w-3.5 h-3.5 text-[#B38728]" />
              <span>ระดับสมาชิก</span>
            </div>
            <p className="text-xl font-bold text-[#1E2538]">{tier}</p>
            <span className="text-[11px] text-slate-400">YFTI Elite 11</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[#1E2538] text-[11px] font-semibold mb-1">
              <CalendarCheck className="w-3.5 h-3.5 text-[#B38728]" />
              <span>กิจกรรมที่สมัคร</span>
            </div>
            <p className="text-xl font-bold text-[#1E2538] tabular-nums">{registeredEventsCount}</p>
            <span className="text-[11px] text-slate-400 tabular-nums">
              เข้าเรียน {profile.attendance_rate ?? 0}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[#1E2538] text-[11px] font-semibold mb-1">
              <Clock className="w-3.5 h-3.5 text-[#B38728]" />
              <span>ขาด / โควตา</span>
            </div>
            <p className="text-xl font-bold text-[#1E2538] tabular-nums">
              {absentCount} <span className="text-sm font-medium text-slate-400">/ {absentQuota}</span>
            </p>
            <span className="text-[11px] text-[#9A7320] tabular-nums">
              เหลือโควตา {absentQuota - absentCount} ครั้ง
            </span>
          </div>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={() => setActiveDetailTab('events')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                activeDetailTab === 'events'
                  ? 'bg-[#1E2538] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>ข้อมูลการเข้าร่วมกิจกรรม/คอร์ส</span>
            </button>
            <button
              onClick={() => setActiveDetailTab('missions')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                activeDetailTab === 'missions'
                  ? 'bg-[#1E2538] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>ข้อมูลการเก็บภารกิจ</span>
            </button>
          </div>

          <span className="mt-3 px-3 py-1 bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2] rounded-full text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            สิทธิ์รับวุฒิบัตร: ผ่านเกณฑ์
          </span>
        </div>

        {activeDetailTab === 'events' ? (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">
                  อัตราการเข้าเรียนสะสม (Attendance Rate)
                </span>
                <span className="text-lg font-bold text-[#1E2538] tabular-nums">
                  {profile.attendance_rate ?? 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C59B38]"
                  style={{ width: `${Math.min(profile.attendance_rate ?? 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>เกณฑ์ขั้นต่ำสำหรับจบหลักสูตร: 80%</span>
                <span className="font-semibold text-[#1E2538] tabular-nums">6/7 กิจกรรมหลัก</span>
              </div>
            </div>

            {/* Category Quota Cards matching Figma Node 324:276 */}
            <div className="space-y-2.5">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#1E2538]">วิชาการและดูงาน</p>
                  <p className="text-[11px] text-slate-400">ขาดได้ไม่เกิน 2 ครั้ง • จัดไปแล้ว 7 ครั้ง</p>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <span className="text-sm font-bold text-[#1E2538]">ขาด 1</span>
                  <span className="text-xs text-slate-400"> / โควตา 2</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#1E2538]">สานสัมพันธ์หลัก</p>
                  <p className="text-[11px] text-slate-400">ขาดได้ไม่เกิน 2 ครั้ง • จัดไปแล้ว 2 ครั้ง</p>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <span className="text-sm font-bold text-[#1E2538]">ขาด 0</span>
                  <span className="text-xs text-slate-400"> / โควตา 2</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#1E2538]">พิเศษและพิธีการ</p>
                  <p className="text-[11px] text-slate-400">ขาดไม่ได้ • จัดไปแล้ว 3 ครั้ง</p>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <span className="text-sm font-bold text-[#1E2538]">ขาด 0</span>
                  <span className="text-xs text-slate-400"> / โควตา 0</span>
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-2 pt-1">
              {(myEventsList.length > 0 ? myEventsList : allEventsList.slice(0, 5)).map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/70 hover:border-[#C59B38] bg-[#FAFAF8] transition group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-[#1E2538] truncate group-hover:text-[#B38728] transition-colors">
                      {ev.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {ev.published_date_text || 'กำลังจะมาถึง'} • {ev.location_name}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      ev.isCheckedIn
                        ? 'bg-[#1E2538] text-white'
                        : ev.status === 'UPCOMING'
                        ? 'bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ev.isCheckedIn ? 'เช็กชื่อแล้ว' : ev.status === 'UPCOMING' ? 'ลงทะเบียนแล้ว' : 'เข้าร่วมแล้ว'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Tab 2: Missions Progress */
          <div className="space-y-2.5">
            {mergedMissions.map((mission) => (
              <div
                key={mission.id}
                className="p-4 rounded-xl border border-slate-200/70 bg-[#FAFAF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-[#1E2538]">{mission.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] tabular-nums">
                      +{mission.reward_points} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{mission.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {mission.status === 'NOT_STARTED' ? (
                    <label className="px-3.5 py-1.5 rounded-xl bg-[#B89138] hover:bg-[#a37f2d] text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ส่งหลักฐาน</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleSubmitMission(mission.id);
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        mission.status === 'APPROVED'
                          ? 'bg-[#1E2538] text-white'
                          : 'bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]'
                      }`}
                    >
                      {mission.status === 'APPROVED' ? 'สำเร็จแล้ว' : 'รอตรวจสอบ'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= 6. ACCOUNT GOVERNANCE & ROLE SIMULATOR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#B38728]" />
            <h4 className="text-sm font-bold text-[#1E2538]">สิทธิ์การเข้าถึงระบบ</h4>
          </div>
          <p className="text-xs text-slate-500">
            สลับบทบาทเพื่อทดสอบการใช้งานในมุมมองสมาชิกและผู้ดูแลระบบ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN'] as const).map((roleOption) => (
            <button
              key={roleOption}
              onClick={() => updateRole(roleOption)}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition border ${
                profile.role === roleOption
                  ? 'bg-[#1E2538] text-white border-[#1E2538]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {roleOption === 'SUPER_ADMIN'
                ? 'Super Admin'
                : roleOption === 'HOUSE_ADMIN'
                ? 'House Admin'
                : 'Member'}
            </button>
          ))}

          <button
            onClick={logout}
            className="py-2 px-3.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5 ml-auto sm:ml-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* House Members Modal matching Figma Node 324:273 */}
      {isHouseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setIsHouseModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#F7F7F5] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1E2538] text-white p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsHouseModalOpen(false)}
                    aria-label="ปิด"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-white">{houseName}</h3>
                    <p className="text-xs text-slate-300 tabular-nums">
                      {houseMembers.length} สมาชิกในบ้าน • Rank #{houseRank}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHouseModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between text-xs">
                <span className="text-slate-300">คะแนนรวมบ้าน</span>
                <span className="font-bold text-[#E5C158] tabular-nums">
                  {housePoints.toLocaleString()} คะแนน
                </span>
              </div>
            </div>

            <div className="overflow-y-auto p-4 space-y-2.5">
              {houseMembers.map((m) => (
                <Link
                  key={m.id}
                  href={`/yfti_participants/${m.id}`}
                  onClick={() => setIsHouseModalOpen(false)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 hover:border-[#C59B38] bg-white transition"
                >
                  <img
                    src={m.profile_picture_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp'}
                    alt={m.name_thai}
                    className="w-11 h-11 rounded-full object-cover bg-slate-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-[#1E2538] truncate">
                      {m.name_thai} ({m.nickname_eng})
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {m.company_name_thai || m.business_position}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] text-[10px] font-bold shrink-0">
                    {houseName}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Switch User Modal */}
      <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

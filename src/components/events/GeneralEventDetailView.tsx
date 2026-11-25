'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { EventAgendaItem, EventItem, EventStatBox, UserProfile } from '@/types';
import { mockHouses, yftiParticipants } from '@/lib/mockData';
import {
  ChevronLeft,
  Share2,
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
  Shirt,
  Lock,
  QrCode,
  Check,
  Phone,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

interface GeneralEventDetailViewProps {
  event: EventItem;
  profile: UserProfile | null;
  isRegistered: boolean;
  isEventTodayOrUnlocked: boolean;
  daysUntilEvent: number;
  registrationRecord?: Record<string, unknown> | null;
  onStartRegister: () => void;
  onOpenQr: () => void;
  onTogglePreviewToday: () => void;
  onShare: () => void;
}

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

export const GeneralEventDetailView: React.FC<GeneralEventDetailViewProps> = ({
  event,
  profile,
  isRegistered,
  isEventTodayOrUnlocked,
  daysUntilEvent,
  registrationRecord,
  onStartRegister,
  onOpenQr,
  onTogglePreviewToday,
  onShare,
}) => {
  const matchedParticipant = useMemo(() => {
    if (!profile?.id) return null;
    return yftiParticipants.find((p) => String(p.id) === String(profile.id)) || null;
  }, [profile?.id]);

  const resolvedHouseName = useMemo(() => {
    const normalized = (profile?.house_id || profile?.house?.id || '').replace(/-/g, '_');
    return (
      mockHouses.find((h) => h.id === normalized)?.name ||
      profile?.house?.name ||
      matchedParticipant?.star_group_label ||
      'The Sun'
    );
  }, [profile, matchedParticipant]);

  const startD = new Date(event.start_time);
  const endD = new Date(event.end_time);
  const validStart = !Number.isNaN(startD.getTime());
  const validEnd = !Number.isNaN(endD.getTime());

  const dateShortThai = validStart
    ? `${THAI_SHORT_WEEKDAYS[startD.getDay()]} ${startD.getDate()} ${
        THAI_SHORT_MONTHS[startD.getMonth()]
      }`
    : 'ศ. 18 ธ.ค.';

  const fullScheduleText =
    event.schedule_summary_text ||
    (validStart && validEnd
      ? `${dateShortThai} ${startD.getFullYear()} · ${String(startD.getHours()).padStart(
          2,
          '0'
        )}:${String(startD.getMinutes()).padStart(2, '0')} – ${String(endD.getHours()).padStart(
          2,
          '0'
        )}:${String(endD.getMinutes()).padStart(2, '0')} น.`
      : 'ศ. 18 ธ.ค. 2026 · 17:30 – 22:30 น.');

  const checkinSlotText = validStart
    ? `${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(
        2,
        '0'
      )}–19:00`
    : '17:30–19:00';

  const startHourText = validStart
    ? `${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(
        2,
        '0'
      )} น.`
    : '17:30 น.';

  const posterDateBadge =
    event.poster_date_badge ||
    (validStart
      ? `${String(startD.getDate()).padStart(2, '0')} · ${String(startD.getMonth() + 1).padStart(
          2,
          '0'
        )} · ${startD.getFullYear()}`
      : '18 · 12 · 2026');

  const posterTitle =
    event.poster_title ||
    (event.title.includes('Gala Night') ? 'Year-End\nGala Night' : event.title);

  const memberFee = event.fee_member ?? 1500;
  const maxSeats = event.max_seats ?? 200;
  const registeredCount = event.registered_count ?? 158;
  const remainingSeats = Math.max(0, maxSeats - registeredCount);
  const attendeeCount = event.attendee_count ?? registeredCount;
  const houseAttendeeCount = event.house_attendee_count ?? 14;

  const stats: EventStatBox[] =
    event.event_stats && event.event_stats.length > 0
      ? event.event_stats
      : [
          { value: `+${event.reward_points}`, label: 'Points สูงสุด' },
          { value: '2', label: 'ภารกิจ' },
          { value: String(maxSeats), label: 'ที่นั่งทั้งหมด' },
        ];

  const agenda: EventAgendaItem[] =
    event.event_agenda && event.event_agenda.length > 0
      ? event.event_agenda
      : [
          {
            time: '17:30',
            title: 'ลงทะเบียน · เช็กชื่อรับคะแนน',
            reward_points: Math.round(event.reward_points * 0.6) || 120,
          },
          { time: '18:30', title: 'พิธีเปิด & มอบรางวัลกลุ่มดาวประจำปี' },
          {
            time: '19:00',
            title: 'Gala Dinner & Business Networking',
            reward_points: Math.round(event.reward_points * 0.4) || 80,
          },
          { time: '21:00', title: 'Live Music · Photo Time' },
        ];

  const displayMemberName =
    (typeof registrationRecord?.applicantName === 'string' && registrationRecord.applicantName) ||
    profile?.display_name ||
    'ณัฐวุฒิ ศรีวัฒนกุล (ต้น)';
  const displayNick =
    typeof registrationRecord?.applicantNickname === 'string' &&
    registrationRecord.applicantNickname &&
    !displayMemberName.includes('(')
      ? ` (${registrationRecord.applicantNickname})`
      : '';
  const displayHouse =
    (typeof registrationRecord?.applicantHouse === 'string' && registrationRecord.applicantHouse) ||
    resolvedHouseName;
  const guestNames: string[] = Array.isArray(registrationRecord?.guestNames)
    ? (registrationRecord?.guestNames as string[]).filter(Boolean)
    : ['คุณปิยะนุช ศรีวัฒนกุล'];
  const guestCount =
    typeof registrationRecord?.guestCount === 'number'
      ? registrationRecord.guestCount
      : guestNames.length;
  const dietaryText =
    typeof registrationRecord?.dietaryType === 'string'
      ? [
          registrationRecord.dietaryType,
          typeof registrationRecord.allergyNote === 'string' && registrationRecord.allergyNote
            ? `ไม่ทาน${registrationRecord.allergyNote.replace(/^ไม่ทาน/, '')}`
            : 'ไม่ทานอาหารทะเล',
        ]
          .filter(Boolean)
          .join(' · ')
      : 'ทั่วไป · ไม่ทานอาหารทะเล';
  const paidAmount =
    typeof registrationRecord?.amount === 'number'
      ? registrationRecord.amount
      : memberFee + guestCount * (event.fee_guest ?? 2000);
  const seatCode =
    (typeof registrationRecord?.seatCode === 'string' && registrationRecord.seatCode) || 'GN-0187';

  const googleCalendarUrl = (() => {
    try {
      const sIso = new Date(event.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
      const eIso = new Date(event.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.title
      )}&dates=${sIso}/${eIso}&details=${encodeURIComponent(
        event.description
      )}&location=${encodeURIComponent(event.location_name)}`;
    } catch {
      return '#';
    }
  })();

  const handleDownloadReceipt = () => {
    const content = [
      'ใบเสร็จรับเงิน / หลักฐานการลงทะเบียน Young FTI ELITE 11',
      `กิจกรรม: ${event.title}`,
      `ผู้สมัคร: ${displayMemberName}${displayNick}`,
      `กลุ่มดาว: ${displayHouse}`,
      `รหัสที่นั่ง: ${seatCode}`,
      `ผู้ติดตาม: ${guestNames.join(', ') || '-'}`,
      `ประเภทอาหาร: ${dietaryText}`,
      `ยอดชำระทั้งหมด: ฿${paidAmount.toLocaleString()}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${seatCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const avatarBadges = [
    { label: 'ณ', bg: 'bg-[#12192B] text-[#ECD28E]' },
    { label: 'พ', bg: 'bg-[#7A5A2B] text-white' },
    { label: 'ก', bg: 'bg-[#1E3A5F] text-white' },
    { label: 'ธ', bg: 'bg-[#1D4D3E] text-white' },
    { label: 'ว', bg: 'bg-[#4C2848] text-white' },
    { label: 'ส', bg: 'bg-[#3D4659] text-white' },
  ];

  const subVenueName = event.location_name.includes('·')
    ? event.location_name.split('·')[1].trim()
    : 'Grand Ballroom';

  return (
    <div className="w-full bg-[#F6F4EF] text-[#161C2C] pb-24">
      {/* ================= 1. OBSIDIAN GALA HERO STAGE ================= */}
      <section className="relative overflow-hidden luxury-stage text-white pt-4 pb-6 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)]">
        {/* Celestial Concentric Orbits & Starlight */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[310px] h-[310px] rounded-full border border-[#C5A059]/15" />
          <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-[#C5A059]/20" />
          <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full border border-[#C5A059]/12" />
          <Sparkles className="w-3.5 h-3.5 text-[#ECD28E]/40 absolute top-16 left-[18%]" />
          <Sparkles className="w-4 h-4 text-[#ECD28E]/45 absolute top-14 right-[16%]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/12 text-xs font-bold text-white backdrop-blur-sm transition"
            >
              <ChevronLeft className="w-4 h-4 text-[#ECD28E]" />
              <span>กลับ</span>
            </Link>

            <div className="flex items-center gap-2">
              {isRegistered && (
                <button
                  type="button"
                  onClick={onTogglePreviewToday}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-[#C5A059]/40 text-[10px] font-bold text-[#ECD28E] transition"
                  title="สลับโหมดจำลองก่อนวันงาน / วันงานจริง"
                >
                  {isEventTodayOrUnlocked ? 'โหมด: ถึงวันเวลางานแล้ว' : 'โหมด: ก่อนถึงวันงาน'}
                </button>
              )}

              <button
                type="button"
                onClick={onShare}
                aria-label="แชร์"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/12 flex items-center justify-center text-white backdrop-blur-sm transition"
              >
                <Share2 className="w-4 h-4 text-[#ECD28E]" />
              </button>
            </div>
          </div>

          {/* Center Gala Poster Lockup */}
          <div className="py-5 sm:py-7 flex flex-col items-center text-center space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ECD28E]/90">
              {event.poster_eyebrow || 'YOUNG FTI ELITE 11'}
            </p>
            <p className="whitespace-pre-line text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-b from-[#FFF3D1] via-[#DFC27D] to-[#B38728] bg-clip-text text-transparent">
              {posterTitle}
            </p>
            <div className="flex items-center gap-2.5 pt-1 text-[11px] font-mono tracking-[0.22em] text-slate-300">
              <span className="w-7 h-px bg-[#C5A059]/40" />
              <span>{posterDateBadge}</span>
              <span className="w-7 h-px bg-[#C5A059]/40" />
            </div>
          </div>

          {/* Bottom Event Title & Badges */}
          <div className="border-t border-[#C5A059]/20 pt-4 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/45 text-[#ECD28E] text-[10px] font-bold">
                กิจกรรมพิเศษ
              </span>

              {isRegistered && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-[#6EE7B7] text-[10px] font-extrabold">
                  ลงทะเบียนแล้ว
                </span>
              )}

              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/15 text-slate-200 text-[10px] font-bold">
                {event.event_category_badge || 'Networking · Dinner'}
              </span>

              <span className="px-2.5 py-0.5 rounded-full luxury-gold-btn !text-[#12192B] text-[10px] font-extrabold tabular-nums">
                +{event.reward_points} Points
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug tracking-tight">
              {event.title}
            </h1>

            <p className="text-xs text-slate-300">
              {event.organizer_label || `จัดโดย ${event.author_name || 'คณะกรรมการรุ่น Young FTI ELITE 11'}`}
            </p>
          </div>
        </div>
      </section>

      {/* ================= 2. MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {!isRegistered ? (
          /* ---------- UNREGISTERED: FEE & REGISTER CTA CARD ---------- */
          <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.06)] space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">ค่าลงทะเบียนสมาชิก</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#161C2C] tabular-nums">
                    {memberFee > 0 ? `฿${memberFee.toLocaleString()}` : 'ฟรี'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ ท่าน</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-extrabold tabular-nums shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                เหลือ {remainingSeats} ที่นั่ง
              </span>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#B18A3B] shrink-0" />
              <span>{event.registration_deadline_text || 'ปิดรับสมัคร พ. 12 ธ.ค. 2026 · 23:59 น.'}</span>
            </p>

            <button
              type="button"
              onClick={onStartRegister}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#12192B] hover:bg-[#1B2540] text-white text-sm font-bold flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-sm"
            >
              <span>สมัครเข้าร่วมกิจกรรม</span>
              <ArrowRight className="w-4 h-4 text-[#ECD28E]" />
            </button>
          </div>
        ) : (
          /* ---------- REGISTERED: DARK PASS CARD + REGISTRATION SUMMARY CARD ---------- */
          <>
            {/* Dark Obsidian Ticket Pass Card */}
            <div className="rounded-[24px] luxury-stage text-white p-4 sm:p-5 shadow-[0_14px_34px_rgba(9,13,24,0.22)] border border-[#C5A059]/30 space-y-4">
              <div className="flex items-center justify-between">
                {isEventTodayOrUnlocked ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DF4747] text-white text-[10px] font-extrabold inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    วันนี้
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-[#C5A059]/40 text-[#ECD28E] text-[10px] font-bold">
                    อีก {Math.max(1, daysUntilEvent)} วัน
                  </span>
                )}
              </div>

              {/* Member Info Row */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full luxury-gold-btn !text-[#12192B] font-extrabold text-sm flex items-center justify-center shrink-0">
                  {displayMemberName.trim().charAt(0) || 'ณ'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-extrabold text-white truncate">
                    {displayMemberName}
                    {displayNick}
                  </p>
                  <p className="text-xs text-slate-300 truncate">
                    กลุ่มดาว {displayHouse}
                    {guestCount > 0 ? ` · ผู้ติดตาม ${guestCount} ท่าน` : ''}
                  </p>
                </div>
              </div>

              {/* 3-Col Ticket Metadata */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">วันที่</p>
                  <p className="font-extrabold text-white mt-0.5">{dateShortThai}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">เช็กชื่อ</p>
                  <p className="font-extrabold text-white tabular-nums mt-0.5">{checkinSlotText}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">รหัสที่นั่ง</p>
                  <p className="font-extrabold text-[#ECD28E] font-mono tabular-nums mt-0.5">
                    {seatCode}
                  </p>
                </div>
              </div>

              {/* QR Button (Disabled before event day vs Enabled on event day) */}
              {!isEventTodayOrUnlocked ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-white/[0.07] border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#ECD28E]" />
                    <span>เปิด QR ได้ในวันงาน</span>
                  </button>

                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#ECD28E]" />
                    <span>เพิ่มลงปฏิทิน</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={onOpenQr}
                    className="w-full py-3.5 px-4 rounded-xl luxury-gold-btn !text-[#12192B] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-md"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>เปิด QR เข้าร่วมงาน</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-300">
                    แสดง QR กับทีมงานหน้างาน เพื่อเช็กชื่อและรับ +{Math.round(event.reward_points * 0.6) || 120} Pts
                  </p>
                </div>
              )}
            </div>

            {/* ข้อมูลการลงทะเบียน Summary Card */}
            <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-extrabold text-[#161C2C]">
                  ข้อมูลการลงทะเบียน
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ชำระแล้ว
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">ผู้ติดตาม</span>
                  <span className="font-bold text-[#161C2C] text-right">
                    {guestCount > 0 ? guestNames.join(', ') : 'ไม่มีผู้ติดตาม'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">ประเภทอาหาร</span>
                  <span className="font-bold text-[#161C2C] text-right">{dietaryText}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">ยอดชำระ</span>
                  <span className="font-extrabold text-[#161C2C] tabular-nums">
                    ฿{paidAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#F1ECE2] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="font-bold text-[#9A742B] underline underline-offset-4 hover:text-[#161C2C] transition"
                >
                  ดาวน์โหลดใบเสร็จ
                </button>
                <button
                  type="button"
                  onClick={onStartRegister}
                  className="font-semibold text-slate-500 underline underline-offset-4 hover:text-[#161C2C] transition"
                >
                  แก้ไขข้อมูล
                </button>
              </div>
            </div>
          </>
        )}

        {/* 3-Row Schedule / Venue / Dress Code Card */}
        <div className="bg-white rounded-[22px] px-4 py-1 shadow-[0_8px_26px_rgba(13,19,33,0.05)] divide-y divide-[#F1ECE2]">
          <div className="py-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400">วันและเวลา</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] mt-0.5">
                {fullScheduleText}
              </p>
            </div>
          </div>

          <div className="py-3.5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400">สถานที่</p>
                <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] mt-0.5 leading-snug">
                  {event.location_name}
                </p>
              </div>
            </div>
            {event.google_maps_url && (
              <a
                href={event.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#9A742B] underline underline-offset-4 shrink-0 self-center"
              >
                แผนที่
              </a>
            )}
          </div>

          <div className="py-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center shrink-0">
              <Shirt className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400">Dress code</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] mt-0.5">
                {event.dress_code || 'Smart Casual / Business Formal'}
              </p>
            </div>
          </div>
        </div>

        {/* ABOUT / รายละเอียดกิจกรรม */}
        <section className="space-y-3 pt-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9A742B] block">
              ABOUT
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
              รายละเอียดกิจกรรม
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#394154] leading-relaxed">{event.description}</p>

          <div className="grid grid-cols-3 gap-2.5">
            {stats.map((st, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3.5 text-center shadow-[0_6px_20px_rgba(13,19,33,0.04)]"
              >
                <p
                  className={`text-base sm:text-lg font-extrabold tabular-nums ${
                    idx === 0 ? 'text-[#9A742B]' : 'text-[#161C2C]'
                  }`}
                >
                  {st.value}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{st.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AGENDA / กำหนดการ */}
        <section className="space-y-2.5 pt-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9A742B] block">
              AGENDA
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">กำหนดการ</h2>
          </div>

          <div className="bg-white rounded-[22px] px-4 py-1 shadow-[0_8px_26px_rgba(13,19,33,0.05)] divide-y divide-[#F1ECE2]">
            {agenda.map((row, idx) => (
              <div
                key={idx}
                className="py-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <div className="flex items-baseline gap-3.5 min-w-0">
                  <span className="font-extrabold text-[#9A742B] tabular-nums w-11 shrink-0">
                    {row.time}
                  </span>
                  <span className="font-bold text-[#161C2C] leading-snug">{row.title}</span>
                </div>
                {row.reward_points && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FBF6EC] text-[#9A742B] text-[10px] font-extrabold tabular-nums shrink-0">
                    +{row.reward_points} Pts
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* เพื่อนร่วมรุ่นที่เข้าร่วม */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#161C2C]">
              เพื่อนร่วมรุ่นที่เข้าร่วม {attendeeCount} คน
            </h3>
            <Link
              href="/directory"
              className="text-xs font-bold text-[#9A742B] hover:text-[#161C2C] transition"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="flex items-center">
            <div className="flex -space-x-2">
              {avatarBadges.map((av, i) => (
                <span
                  key={i}
                  className={`w-8 h-8 rounded-full ${av.bg} ring-2 ring-white text-[11px] font-extrabold flex items-center justify-center`}
                >
                  {av.label}
                </span>
              ))}
              <span className="px-2.5 h-8 rounded-full bg-[#F6F4EF] ring-2 ring-white text-[10px] font-bold text-slate-600 flex items-center justify-center tabular-nums">
                +{Math.max(0, attendeeCount - avatarBadges.length)}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-[#FBF6EC] px-3 py-2 text-[11px] font-semibold text-[#9A742B] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
            <span>
              จากกลุ่มดาว {resolvedHouseName} ของคุณ {houseAttendeeCount} คน
            </span>
          </div>
        </div>

        {/* ติดต่อสอบถามทีมงาน */}
        <section className="space-y-2.5 pt-1">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#161C2C]">ติดต่อสอบถามทีมงาน</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${event.contact_phone || '0822699962'}`}
              className="bg-white hover:bg-[#FAF7F0] rounded-2xl py-3 px-4 shadow-[0_4px_16px_rgba(13,19,33,0.05)] text-xs font-extrabold text-[#161C2C] flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#9A742B]" />
              <span>โทรหาผู้ประสานงาน</span>
            </a>

            <Link
              href="/contact"
              className="bg-white hover:bg-[#FAF7F0] rounded-2xl py-3 px-4 shadow-[0_4px_16px_rgba(13,19,33,0.05)] text-xs font-extrabold text-[#161C2C] flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#9A742B]" />
              <span>LINE OA</span>
            </Link>
          </div>
        </section>
      </div>

      {/* ================= 3. STICKY BOTTOM BAR ================= */}
      <div className="fixed inset-x-0 bottom-[60px] md:bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E6E0D4] px-4 py-2.5 shadow-[0_-8px_24px_rgba(11,16,29,0.08)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {!isRegistered ? (
            <>
              <div>
                <p className="text-[10px] font-medium text-slate-500">ค่าลงทะเบียนสมาชิก</p>
                <p className="text-base sm:text-lg font-extrabold text-[#161C2C] tabular-nums leading-tight">
                  {memberFee > 0 ? `฿${memberFee.toLocaleString()} / ท่าน` : 'เข้าร่วมฟรี'}
                </p>
              </div>
              <button
                type="button"
                onClick={onStartRegister}
                className="px-6 py-2.5 rounded-xl luxury-gold-btn !text-[#12192B] text-xs sm:text-sm font-extrabold transition active:scale-95"
              >
                สมัครเลย
              </button>
            </>
          ) : !isEventTodayOrUnlocked ? (
            <>
              <div>
                <p className="text-[10px] font-medium text-slate-500">
                  เริ่มงานในอีก {Math.max(1, daysUntilEvent)} วัน
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-tight">
                  {dateShortThai} · {startHourText}
                </p>
              </div>
              <button
                type="button"
                disabled
                className="px-4 py-2.5 rounded-xl bg-[#EFECE4] text-slate-500 text-xs font-bold inline-flex items-center gap-1.5 cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>QR เปิดอีก {Math.max(1, daysUntilEvent)} วัน</span>
              </button>
            </>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-medium text-slate-500">วันนี้ · เช็กชื่อได้ถึง 19:00 น.</p>
                <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-tight">
                  {subVenueName}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenQr}
                className="px-5 py-2.5 rounded-xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 transition active:scale-95"
              >
                <QrCode className="w-4 h-4 text-[#ECD28E]" />
                <span>เปิด QR</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

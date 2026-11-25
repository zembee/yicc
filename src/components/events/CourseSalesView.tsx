'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CourseSpeaker, EventItem } from '@/types';
import {
  ChevronLeft,
  Share2,
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
  Award,
  Check,
  User,
  Star,
  FileText,
  Users,
  ChevronDown,
  Phone,
  MessageCircle,
  Hourglass,
  Leaf,
  BookOpen,
} from 'lucide-react';

interface CourseSalesViewProps {
  course: EventItem;
  registrationStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  onStartRegister: () => void;
  onShare: () => void;
}

const DEFAULT_OUTCOMES = [
  'เข้าใจกรอบกลยุทธ์และมาตรฐานสำคัญที่ภาคอุตสาหกรรมต้องปรับตัว',
  'ฝึกปฏิบัติผ่าน Workshop และกรณีศึกษาจริงจากภาคธุรกิจ',
  'วางแผนลดต้นทุนและยกระดับประสิทธิภาพในองค์กรอย่างเป็นระบบ',
  'จัดทำแผนปฏิบัติการ (Action Plan) สำหรับธุรกิจของตนเองพร้อมนำเสนอ',
];

const DEFAULT_FAQS = [
  {
    question: 'ถ้าเข้าเรียนไม่ครบทุกครั้งทำอย่างไร',
    answer:
      'ผู้เรียนสามารถดาวน์โหลดเอกสารประกอบการเรียนได้ครบทุกครั้ง และยังมีสิทธิ์รับใบประกาศนียบัตรเมื่อมีเวลาเข้าเรียนตามเกณฑ์ขั้นต่ำของหลักสูตร (≥ 80%)',
  },
  {
    question: 'ขอใบกำกับภาษีในนามบริษัทได้ไหม',
    answer:
      'สามารถออกใบเสร็จรับเงินและใบกำกับภาษีเต็มรูปแบบในนามนิติบุคคลหรือบุคคลธรรมดาได้ โดยกรอกข้อมูลในขั้นตอนสมัครเรียน',
  },
  {
    question: 'ยกเลิกหรือโอนสิทธิ์ให้ผู้อื่นได้หรือไม่',
    answer:
      'สามารถแจ้งโอนสิทธิ์ให้ผู้บริหารในองค์กรเดียวกันหรือสมาชิก YFTI ท่านอื่นได้ล่วงหน้าอย่างน้อย 5 วันทำการก่อนเปิดคลาสแรก',
  },
];

export const CourseSalesView: React.FC<CourseSalesViewProps> = ({
  course,
  registrationStatus,
  onStartRegister,
  onShare,
}) => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const isCourse = course.event_type === 'course';
  const sessions = course.sessions || [];
  const totalSessions = sessions.length || 1;
  const memberFee = course.fee_member ?? (isCourse ? 12900 : 1200);
  const guestFee = course.fee_guest ?? Math.round(memberFee * 1.25);
  const hasDiscount = guestFee > memberFee && memberFee > 0;

  const maxSeats = course.max_seats ?? 30;
  const registeredCount = course.registered_count ?? 18;
  const remainingSeats = Math.max(0, maxSeats - registeredCount);

  const totalCurriculumPoints =
    sessions.reduce((sum, s) => sum + (s.reward_points || 0), 0) || course.reward_points;
  const displayPoints = course.reward_points || totalCurriculumPoints;

  const outcomes =
    course.learning_outcomes && course.learning_outcomes.length > 0
      ? course.learning_outcomes
      : DEFAULT_OUTCOMES;

  const faqs = course.faqs && course.faqs.length > 0 ? course.faqs : DEFAULT_FAQS;

  const speakers: CourseSpeaker[] =
    course.speakers && course.speakers.length > 0
      ? course.speakers
      : Array.from(
          new Map<string, CourseSpeaker>(
            sessions
              .filter((s) => Boolean(s.instructor))
              .map((s) => [
                s.instructor!,
                {
                  name: s.instructor!,
                  role: 'วิทยากรผู้ทรงคุณวุฒิประจำหลักสูตร YFTI Academy',
                  sessions_label: `ครั้งที่ ${s.session_number}`,
                },
              ])
          ).values()
        );

  const isEsgTheme = /esg|sustain|green|carbon/i.test(course.title);
  const startYear = new Date(course.start_time).getFullYear() || 2027;
  const cleanDisplayTitle = course.title.replace(/^คอร์สเรียน:\s*/i, '');
  const shortLocation = course.location_name.includes('FTI Tower')
    ? 'FTI Tower'
    : course.location_name;
  const ctaText = isCourse ? 'สมัครเรียน' : 'ลงทะเบียนเข้าร่วม';

  return (
    <div className="w-full bg-[#F6F4EF] text-[#161C2C] pb-24">
      {/* ================= 1. OBSIDIAN ACADEMY HERO STAGE ================= */}
      <section className="relative overflow-hidden luxury-stage text-white pt-4 pb-6 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)]">
        {/* Subtle Celestial Orbit Lines & Skyline Silhouette */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-[#C5A059]/12" />
          <div className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-[#C5A059]/16" />
          <div
            className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-[380px] h-[140px] rounded-full border border-[#C5A059]/15"
            style={{ transform: 'translate(-50%, -50%) rotate(-14deg)' }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-5">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={isCourse ? '/events?category=course' : '/events'}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/12 text-xs font-bold text-white backdrop-blur-sm transition"
            >
              <ChevronLeft className="w-4 h-4 text-[#ECD28E]" />
              <span>{isCourse ? 'คอร์สเรียน' : 'กิจกรรม'}</span>
            </Link>

            <button
              type="button"
              onClick={onShare}
              aria-label="แชร์"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/12 flex items-center justify-center text-white backdrop-blur-sm transition"
            >
              <Share2 className="w-4 h-4 text-[#ECD28E]" />
            </button>
          </div>

          {/* Center Emblem Poster Lockup */}
          <div className="py-4 sm:py-6 flex flex-col items-center text-center space-y-3 relative">
            <div className="w-16 h-16 rounded-[18px] luxury-gold-btn flex items-center justify-center shadow-[0_10px_28px_rgba(197,160,89,0.35)]">
              {isEsgTheme ? (
                <Leaf className="w-8 h-8 text-[#12192B] stroke-[2.2]" />
              ) : (
                <BookOpen className="w-8 h-8 text-[#12192B] stroke-[2.2]" />
              )}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300/90 pt-1">
              {isCourse ? `YFTI ACADEMY · ${startYear}` : `YFTI ELITE 11 · ${startYear}`}
            </p>

            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight max-w-sm bg-gradient-to-b from-[#F5E6BE] via-[#DFC27D] to-[#B89040] bg-clip-text text-transparent">
              {isEsgTheme ? 'ESG &\nSustainability' : cleanDisplayTitle}
            </p>
          </div>

          {/* Divider Skyline Accent */}
          <div className="border-t border-[#C5A059]/20 pt-4 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-[#6EE7B7] text-[10px] font-extrabold">
                เปิดรับสมัคร
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-[#C5A059]/40 text-[#ECD28E] text-[10px] font-bold">
                {isCourse ? `คอร์สเรียน · ${totalSessions} ครั้ง` : 'กิจกรรมเครือข่าย'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full luxury-gold-btn !text-[#12192B] text-[10px] font-extrabold tabular-nums">
                +{displayPoints} Pts
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug tracking-tight">
              {cleanDisplayTitle}
            </h1>

            <p className="text-xs text-slate-300">
              {course.published_date_text || 'เร็วๆ นี้'} · {shortLocation}
            </p>
          </div>
        </div>
      </section>

      {/* ================= 2. MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* Pricing & Enrollment Card */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.06)] space-y-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">ราคาสมาชิก YFTI</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#161C2C] tabular-nums">
                  {memberFee > 0 ? `฿${memberFee.toLocaleString()}` : 'เรียนฟรี'}
                </span>
                {hasDiscount && (
                  <span className="text-xs font-semibold text-slate-400 line-through tabular-nums">
                    ฿{guestFee.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-extrabold tabular-nums shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              เหลือ {remainingSeats}/{maxSeats} ที่นั่ง
            </span>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#B18A3B] shrink-0" />
            <span>
              {course.registration_deadline_text ||
                'ปิดรับสมัครล่วงหน้า 7 วันก่อนเริ่มคลาสแรก หรือจนกว่าที่นั่งจะเต็ม'}
            </span>
          </p>

          {registrationStatus === 'PENDING' ? (
            <div className="w-full py-3 px-4 rounded-2xl bg-[#FBF6EC] border border-[#E5D3A7] text-[#8E6F30] text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <Hourglass className="w-4 h-4 shrink-0" />
              <span>ส่งใบสมัครแล้ว · รอตรวจสอบสลิป 1–2 วันทำการ</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartRegister}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#12192B] hover:bg-[#1B2540] text-white text-sm font-bold flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-sm"
            >
              <span>{registrationStatus === 'REJECTED' ? 'ส่งใบสมัครใหม่' : ctaText}</span>
              <ArrowRight className="w-4 h-4 text-[#ECD28E]" />
            </button>
          )}
        </div>

        {/* 4-Row Key Course Info Card */}
        <div className="bg-white rounded-[22px] px-4 py-1 shadow-[0_8px_26px_rgba(13,19,33,0.05)] divide-y divide-[#F1ECE2]">
          <div className="py-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400">{isCourse ? 'ตารางเรียน' : 'วันจัดกิจกรรม'}</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] mt-0.5">
                {course.schedule_summary_text || course.published_date_text || 'ตามกำหนดการ'}
              </p>
            </div>
          </div>

          <div className="py-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400">{isCourse ? 'เวลาเรียน' : 'เวลา'}</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] mt-0.5">
                {course.duration_summary_text ||
                  `${sessions[0]?.time_text || '09:00 – 16:00 น.'}${isCourse ? ` · ${totalSessions} ครั้ง` : ''}`}
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
                  {course.location_name}
                </p>
              </div>
            </div>
            {course.google_maps_url && (
              <a
                href={course.google_maps_url}
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
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400">
                {isCourse ? 'เงื่อนไขรับประกาศนียบัตร' : 'สิทธิ์คะแนนสะสม'}
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] mt-0.5">
                {course.certificate_requirement_text ||
                  (isCourse
                    ? `เข้าเรียนอย่างน้อย ${Math.ceil(totalSessions * 0.8)} จาก ${totalSessions} ครั้ง`
                    : `รับ +${displayPoints} Points และ +${course.reward_xp} XP เมื่อสแกนเช็กอินหน้างาน`)}
              </p>
            </div>
          </div>
        </div>

        {/* ABOUT / เกี่ยวกับคอร์สนี้ */}
        <section className="space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9A742B] block">
              ABOUT
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">
              {isCourse ? 'เกี่ยวกับคอร์สนี้' : 'เกี่ยวกับกิจกรรมนี้'}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#394154] leading-relaxed">
            {course.description}
          </p>

          <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#161C2C]">
              {isCourse ? 'สิ่งที่คุณจะได้เรียนรู้' : 'ไฮไลต์กิจกรรม'}
            </h3>
            <ul className="space-y-2.5">
              {outcomes.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#394154]">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.6]" />
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CURRICULUM / เนื้อหาหลักสูตร */}
        {sessions.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9A742B] block">
                  CURRICULUM
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">เนื้อหาหลักสูตร</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500 tabular-nums pb-0.5">
                {totalSessions} ครั้ง · รวม +{displayPoints} Pts
              </span>
            </div>

            <div className="bg-white rounded-[22px] px-4 py-1 shadow-[0_8px_26px_rgba(13,19,33,0.05)] divide-y divide-[#F1ECE2]">
              {sessions.map((ses) => (
                <div key={ses.id} className="py-3.5 flex items-center gap-3">
                  <div className="w-11 h-12 rounded-xl bg-[#F6F4EF] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-semibold text-slate-400 leading-none">ครั้งที่</span>
                    <span className="text-sm font-extrabold text-[#161C2C] tabular-nums mt-0.5 leading-none">
                      {ses.session_number}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-snug">
                      {ses.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {ses.date_text} · {ses.time_text}
                    </p>
                  </div>

                  <span className="text-xs font-extrabold text-[#9A742B] tabular-nums shrink-0">
                    +{ses.reward_points}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SPEAKERS / วิทยากร */}
        {speakers.length > 0 && (
          <section className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9A742B] block">
                SPEAKERS
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">วิทยากร</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {speakers.map((sp, idx) => (
                <div
                  key={sp.name}
                  className="bg-white rounded-[20px] overflow-hidden shadow-[0_8px_24px_rgba(13,19,33,0.05)] flex flex-col"
                >
                  <div
                    className="relative aspect-[4/4.2] flex items-center justify-center overflow-hidden"
                    style={{
                      background:
                        idx % 2 === 0
                          ? 'linear-gradient(160deg, #2D3E66 0%, #162038 100%)'
                          : 'linear-gradient(160deg, #6E6146 0%, #383226 100%)',
                    }}
                  >
                    {sp.image_url ? (
                      <img
                        src={sp.image_url}
                        alt={sp.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <User className="w-14 h-14 text-white/45 stroke-[1.4]" />
                    )}

                    {sp.sessions_label && (
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#090D18]/80 backdrop-blur-md text-[#ECD28E] text-[10px] font-bold">
                        {sp.sessions_label}
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-3.5 space-y-0.5 flex-1">
                    <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-snug">
                      {sp.name}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {sp.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* สิ่งที่ได้รับ (2x2 Benefits Grid) */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">สิ่งที่ได้รับ</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(13,19,33,0.04)] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#161C2C]">ประกาศนียบัตร</p>
                <p className="text-[11px] text-slate-500">เมื่อเข้าร่วม ≥ 80%</p>
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(13,19,33,0.04)] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#161C2C]">
                  +{displayPoints} Points
                </p>
                <p className="text-[11px] text-slate-500">สะสมให้กลุ่มดาว</p>
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(13,19,33,0.04)] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#161C2C]">เอกสารประกอบ</p>
                <p className="text-[11px] text-slate-500">ดาวน์โหลดได้ทุกครั้ง</p>
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(13,19,33,0.04)] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#161C2C]">Networking</p>
                <p className="text-[11px] text-slate-500">กับวิทยากรและสมาชิก</p>
              </div>
            </div>
          </div>
        </section>

        {/* คำถามที่พบบ่อย (Accordion FAQ + Contact Buttons) */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">คำถามที่พบบ่อย</h2>

          <div className="bg-white rounded-[22px] px-4 py-1 shadow-[0_8px_26px_rgba(13,19,33,0.05)] divide-y divide-[#F1ECE2]">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 text-left"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#161C2C]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#9A742B] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-2 pr-6">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={`tel:${course.contact_phone || '0987654321'}`}
              className="bg-white hover:bg-[#FAF7F0] rounded-2xl py-3 px-4 shadow-[0_4px_16px_rgba(13,19,33,0.05)] text-xs font-extrabold text-[#161C2C] flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#9A742B]" />
              <span>โทรสอบถาม</span>
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

      {/* ================= 3. STICKY BOTTOM ENROLLMENT BAR ================= */}
      <div className="fixed inset-x-0 bottom-[60px] md:bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E6E0D4] px-4 py-2.5 shadow-[0_-8px_24px_rgba(11,16,29,0.08)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium text-slate-500">
              {isCourse ? `ราคาสมาชิก · ${totalSessions} ครั้ง` : 'ราคาสมาชิก YFTI'}
            </p>
            <p className="text-base sm:text-lg font-extrabold text-[#161C2C] tabular-nums leading-tight">
              {memberFee > 0 ? `฿${memberFee.toLocaleString()}` : 'เข้าร่วมฟรี'}
            </p>
          </div>

          {registrationStatus === 'PENDING' ? (
            <span className="px-4 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E5D3A7] text-[#8E6F30] text-xs font-bold">
              รอตรวจสอบสลิป
            </span>
          ) : (
            <button
              type="button"
              onClick={onStartRegister}
              className="px-6 py-2.5 rounded-xl luxury-gold-btn !text-[#12192B] text-xs sm:text-sm font-extrabold transition active:scale-95"
            >
              {ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

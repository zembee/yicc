'use client';

import React, { useState, useEffect } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, yftiParticipants } from '@/lib/mockData';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Coins, 
  Award, 
  GraduationCap, 
  Shield, 
  Briefcase, 
  Mail, 
  Phone, 
  LogOut,
  RefreshCw,
  Building2, 
  MapPin, 
  CheckCircle2, 
  Users,
  Sparkles,
  QrCode,
  RotateCw,
  CreditCard,
  ExternalLink,
  Share2,
  Download,
  Star,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { WebLoginModal } from '@/components/layout/WebLoginModal';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { profile, updateRole, logout } = useLiffAuth();
  const [mounted, setMounted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#FB7170] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2 className="font-extrabold text-lg text-[#1E2538]">ไม่พบข้อมูลบัตรสมาชิก</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          กรุณาเข้าสู่ระบบหรือผูกบัญชีเพื่อเปิดใช้งานบัตรสมาชิกดิจิทัล Young FTI ELITE 11
        </p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full py-3 bg-[#1E2538] hover:bg-[#2B3550] text-white rounded-2xl text-xs font-bold transition shadow-md"
        >
          เข้าสู่ระบบสมาชิก
        </button>
        <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  const houseColor = profile.house?.color_hex || '#F59E0B';
  const memberCode = `Y11-${String(profile.id).replace(/\D/g, '').padStart(4, '0') || '0088'}`;

  // QR Payload for member badge check-in & vCard
  const memberQrPayload = JSON.stringify({
    type: 'YFTI_MEMBER_PASSPORT',
    memberId: profile.id,
    name: profile.display_name,
    phone: profile.phone_number,
    house: profile.house?.name || profile.house_id,
    role: profile.role,
    batch: 'YFTI 11'
  });

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 pb-16 px-3 sm:px-4 animate-in fade-in duration-300">
      
      {/* Page Title & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E2538]/5 border border-[#1E2538]/10 text-xs font-extrabold text-[#1E2538] uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FB7170]" />
            <span>Official Digital Membership Passport</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E2538] tracking-tight">
            บัตรสมาชิกดิจิทัล (Member Card)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:border-[#1E2538] rounded-2xl text-xs font-bold text-[#1E2538] transition shadow-xs flex items-center justify-center gap-2 group"
          >
            <RotateCw className="w-4 h-4 text-[#FB7170] group-hover:rotate-180 transition-transform duration-500" />
            <span>{isFlipped ? 'ดูหน้าบัตร' : 'พลิกดูหลังบัตร (QR)'}</span>
          </button>

          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-4 py-2.5 bg-[#1E2538] hover:bg-[#2B3550] text-white rounded-2xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Users className="w-4 h-4 text-[#FB7170]" />
            <span>สลับโปรไฟล์</span>
          </button>
        </div>
      </div>

      {/* ================= 3D FLIPPABLE MEMBERSHIP CARD ================= */}
      <div className="relative mx-auto w-full max-w-xl perspective-[1200px] select-none py-2">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full aspect-[1.586/1] min-h-[290px] sm:min-h-[340px] rounded-[28px] sm:rounded-[32px] transition-all duration-700 transform-style-3d cursor-pointer shadow-2xl hover:shadow-[0_25px_60px_rgba(30,37,56,0.35)] ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >

          {/* ================= FRONT OF CARD ================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden backface-hidden border border-white/20 text-white shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #1E2538 0%, #151928 45%, #2A334E 80%, #1E2538 100%)',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* Background Decorative Metallic Watermark */}
            <div 
              className="absolute -right-12 -bottom-16 w-72 h-72 rounded-full opacity-10 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #FB7170 0%, rgba(255,255,255,0) 70%)'
              }}
            />
            <div 
              className="absolute -left-12 -top-16 w-60 h-60 rounded-full opacity-10 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${houseColor} 0%, rgba(255,255,255,0) 70%)`
              }}
            />

            {/* Subtle Diagonal Hologram Grid */}
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 0)',
                backgroundSize: '16px 16px'
              }}
            />

            {/* Card Header: Brand & Chip */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-white/20">
                  <Image
                    src="/YFTI-11-Logo.jpg"
                    alt="YFTI 11"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-black tracking-tight text-white">
                      YOUNG FTI <span className="text-[#FB7170]">ELITE</span>
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/15 text-white backdrop-blur-md">
                      11
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-300 font-medium">
                    The Federation of Thai Industries
                  </p>
                </div>
              </div>

              {/* EMV Microchip & Contactless Symbol */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-7 sm:w-12 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 p-0.5 shadow-inner border border-amber-300/60 flex flex-col justify-around px-1.5 opacity-90">
                  <div className="h-[1px] bg-amber-800/30 w-full" />
                  <div className="h-[1px] bg-amber-800/30 w-full" />
                  <div className="h-[1px] bg-amber-800/30 w-full" />
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                </svg>
              </div>
            </div>

            {/* Card Middle: Member Avatar, Name & House */}
            <div className="relative z-10 flex items-center gap-4 sm:gap-5 my-auto">
              <div className="relative shrink-0">
                <img
                  src={profile.picture_url || '/images/participants/p_3296.jpg'}
                  alt={profile.display_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/40 shadow-xl bg-[#2A334E]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/participants/p_3296.jpg';
                  }}
                />
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-[#FB7170] text-white text-[9px] font-black rounded-md shadow-sm uppercase">
                  {profile.role === 'SUPER_ADMIN' ? 'ADMIN' : 'MEMBER'}
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-white truncate tracking-tight">
                    {profile.display_name}
                  </h2>
                  {profile.house && (
                    <span 
                      className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white backdrop-blur-md shadow-xs border border-white/20"
                      style={{ backgroundColor: `${houseColor}99` }}
                    >
                      ⭐ {profile.house.name}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-[#FB7170] truncate">
                  {profile.position || 'Executive Member'}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-300 truncate font-medium">
                  {profile.company_name || 'Young FTI ELITE 11 Member'}
                </p>
              </div>
            </div>

            {/* Card Footer: Card Number, Batch & Tap to Flip Prompt */}
            <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-3 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-bold">
                  Card Number / Member ID
                </span>
                <span className="text-sm sm:text-base font-black font-mono tracking-widest text-white">
                  {memberCode}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-bold">
                  Cohort
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-200">
                  CLASS OF 2025
                </span>
              </div>
            </div>

            {/* Tap indicator */}
            <div className="absolute bottom-2 right-1/2 translate-x-1/2 text-[9px] text-white/50 font-bold uppercase tracking-wider flex items-center gap-1">
              <RotateCw className="w-2.5 h-2.5 animate-spin" />
              <span>แตะเพื่อดู QR และข้อมูลหลังบัตร</span>
            </div>
          </div>

          {/* ================= BACK OF CARD ================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 flex flex-col justify-between overflow-hidden backface-hidden border border-white/20 text-white shadow-2xl rotate-y-180"
            style={{
              background: 'linear-gradient(135deg, #151928 0%, #1E2538 50%, #151928 100%)',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* Magnetic Stripe */}
            <div className="absolute top-5 left-0 right-0 h-10 sm:h-12 bg-black/80 border-y border-white/10" />

            {/* Security Signature Strip & QR Layout */}
            <div className="relative z-10 mt-12 sm:mt-14 flex items-center justify-between gap-4">
              {/* Left: Contact Info & Signature */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="bg-slate-200/90 text-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold flex justify-between items-center shadow-inner">
                  <span className="italic text-slate-600">Authorized Signature:</span>
                  <span className="font-serif italic font-bold text-slate-900 truncate max-w-[120px]">
                    {profile.display_name.split(' ')[0]}
                  </span>
                </div>

                <div className="text-[10px] sm:text-xs text-slate-300 space-y-0.5 pt-1">
                  <p className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3 h-3 text-[#FB7170] shrink-0" />
                    <span>{profile.phone_number || '082-269-9962'}</span>
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-[#FB7170] shrink-0" />
                    <span>{profile.email || 'yfti11@yfticonnect.com'}</span>
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Briefcase className="w-3 h-3 text-[#FB7170] shrink-0" />
                    <span>{profile.industry || 'สินค้าอุตสาหกรรมและการผลิต'}</span>
                  </p>
                </div>
              </div>

              {/* Right: Real-time Member QR Code */}
              <div className="shrink-0 bg-white p-2 rounded-2xl shadow-lg text-center flex flex-col items-center">
                <QRCodeSVG
                  value={memberQrPayload}
                  size={84}
                  level="M"
                  fgColor="#1E2538"
                  includeMargin={false}
                />
                <span className="text-[8px] font-black font-mono text-slate-700 mt-1 uppercase">
                  Scan to Verify
                </span>
              </div>
            </div>

            {/* Back Footer: Balances & Terms */}
            <div className="relative z-10 border-t border-white/10 pt-2 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2.5 font-bold">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                  🪙 {profile.points_balance} Coins
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30 font-mono">
                  ⚡ {profile.xp_balance} XP
                </span>
              </div>

              <div className="text-right text-[9px] text-slate-400">
                Official FTI Network • Non-transferable
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EXECUTIVE DOSSIER & BUSINESS IDENTITY ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
        
        {/* Dossier Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FB7170]" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Executive Dossier • ทำเนียบผู้บริหาร
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E2538] tracking-tight">
              {profile.display_name}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {profile.position || 'กรรมการ / ผู้บริหารระดับสูง'} • <span className="font-bold text-[#1E2538]">{profile.company_name || 'Young FTI ELITE 11'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/directory`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1E2538] rounded-xl text-xs font-bold transition"
            >
              <Building2 className="w-3.5 h-3.5 text-[#FB7170]" />
              <span>เปิดดูในทำเนียบรุ่น</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Dossier Contact & Industry Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              เบอร์โทรศัพท์ติดต่อ
            </span>
            <p className="text-sm font-black font-mono text-[#1E2538] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#FB7170]" />
              {profile.phone_number || '082-269-9962'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              อีเมลส่วนตัว / องค์กร
            </span>
            <p className="text-sm font-bold text-[#1E2538] truncate flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#FB7170]" />
              {profile.email || 'yfti11@yfticonnect.com'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              กลุ่มอุตสาหกรรม (FTI Club)
            </span>
            <p className="text-sm font-bold text-[#1E2538] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#FB7170]" />
              {profile.industry || 'อสังหาริมทรัพย์และก่อสร้าง'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              กลุ่มดวงดาวประจำรุ่น (House)
            </span>
            <p className="text-sm font-black text-[#1E2538] flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" style={{ color: houseColor }} />
              {profile.house?.name || 'Mars'} ({profile.cohort_batch || 'YFTI 11'})
            </p>
          </div>
        </div>

        {/* Official Credentials & Badges Row */}
        <div className="p-4 sm:p-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ยืนยันตัวตนสมาชิกทางการ
            </span>
            <span className="text-[11px] font-bold px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FB7170]" />
              Cohort 11 Executive Track
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="text-xs font-bold text-slate-600 hover:text-[#1E2538] flex items-center gap-1.5 transition ml-auto"
          >
            <Share2 className="w-3.5 h-3.5 text-[#FB7170]" />
            <span>{copySuccess ? 'คัดลอกลิงก์โปรไฟล์แล้ว' : 'คัดลอกลิงก์โปรไฟล์'}</span>
          </button>
        </div>
      </div>

      {/* ================= BENTO GRID: ACADEMIC & REWARDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Bento (7 Cols): Academic Attendance & Graduation Meter */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FB7170]">
                Academic &amp; Completion Status
              </span>
              <h3 className="text-lg font-black text-[#1E2538]">
                สถิติการเข้าร่วมกิจกรรม &amp; สิทธิ์รับวุฒิบัตร
              </h3>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-black shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ผ่านเกณฑ์
            </span>
          </div>

          {/* Progress Bar & Numerical Metrics */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 font-bold">
                อัตราการเข้าเรียนสะสม (Attendance Rate)
              </span>
              <span className="text-2xl font-black font-mono text-[#1E2538]">
                {profile.attendance_rate}%
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#10B981] transition-all duration-1000"
                style={{ width: `${Math.min(profile.attendance_rate, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>เกณฑ์ขั้นต่ำสำหรับจบหลักสูตร: 80%</span>
              <span className="font-bold text-emerald-700 font-mono">6/7 กิจกรรมหลัก</span>
            </div>
          </div>

          {/* Mini Graduation Info Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs text-[#1E2538] shrink-0">
              <GraduationCap className="w-4 h-4 text-[#FB7170]" />
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">สถานะวุฒิบัตร:</strong> มีสิทธิ์เข้ารับวุฒิบัตรหลักสูตรนักอุตสาหกรรมรุ่นใหม่ รุ่นที่ 11 ในพิธีปิด
            </div>
          </div>
        </div>

        {/* Right Bento (5 Cols): Coins & XP Vault */}
        <div className="lg:col-span-5 bg-[#1E2538] text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FB7170]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FB7170]">
                Executive Loyalty Vault
              </span>
              <h3 className="text-lg font-black text-white">
                ยอดเหรียญ &amp; คะแนนสะสม
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-white/10 text-slate-200 border border-white/15 rounded-full text-[10px] font-bold">
              Level 4 Executive
            </span>
          </div>

          {/* Balances Display */}
          <div className="relative z-10 grid grid-cols-2 gap-3 py-1">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                <Coins className="w-3.5 h-3.5" />
                <span>Coins สะสม</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-white">
                {profile.points_balance}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                ใช้แลกของที่ระลึก
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Executive XP</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-white">
                {profile.xp_balance}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                แต้มกิจกรรมประจำรุ่น
              </span>
            </div>
          </div>

          {/* Action Link */}
          <div className="relative z-10 pt-1">
            <Link
              href="/events"
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-[#1E2538] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>ดูกิจกรรมสะสมแต้มเพิ่มเติม</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FB7170]" />
            </Link>
          </div>
        </div>

      </div>

      {/* ================= ACCOUNT GOVERNANCE & ROLE SIMULATOR ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#FB7170]" />
            <h4 className="text-sm font-black text-[#1E2538]">
              สิทธิ์การเข้าถึงระบบ (Role Permission)
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            จำลองมุมมองการใช้งานเพื่อทดสอบระบบตามระดับสิทธิ์ของผู้บริหาร
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN'] as const).map((roleOption) => (
            <button
              key={roleOption}
              onClick={() => updateRole(roleOption)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition border ${
                profile.role === roleOption
                  ? 'bg-[#1E2538] text-white border-[#1E2538] shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {roleOption === 'SUPER_ADMIN' ? 'Super Admin' : roleOption === 'HOUSE_ADMIN' ? 'House Admin' : 'Member'}
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

      {/* Switch User Modal */}
      <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}


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
  ShieldCheck
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
                  src={profile.picture_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.display_name}
                  alt={profile.display_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/40 shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.display_name;
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

      {/* ================= QUICK ACTION BUTTONS ================= */}
      <div className="max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-[#1E2538] transition shadow-xs flex items-center justify-center gap-2"
        >
          <RotateCw className="w-4 h-4 text-[#FB7170]" />
          <span>{isFlipped ? 'แสดงหน้าบัตร' : 'แสดง QR สแกน'}</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-[#1E2538] transition shadow-xs flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4 text-[#FB7170]" />
          <span>{copySuccess ? 'คัดลอกลิงก์แล้ว!' : 'แชร์บัตรสมาชิก'}</span>
        </button>

        <Link
          href={`/directory`}
          className="col-span-2 sm:col-span-1 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-[#1E2538] transition shadow-xs flex items-center justify-center gap-2 text-center"
        >
          <Building2 className="w-4 h-4 text-[#FB7170]" />
          <span>ทำเนียบธุรกิจรุ่น</span>
        </Link>
      </div>

      {/* ================= EXECUTIVE STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Card 1: Reward Points */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center shadow-card space-y-1 relative overflow-hidden group hover:-translate-y-0.5 transition">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FB7170] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
            <Coins className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 font-bold">Reward Coins สะสม</p>
          <p className="text-3xl font-black text-[#1E2538] font-mono">{profile.points_balance}</p>
          <p className="text-[11px] text-slate-400">ใช้แลกสิทธิประโยชน์ &amp; ของรางวัลโครงการ</p>
        </div>

        {/* Card 2: Executive XP */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center shadow-card space-y-1 relative overflow-hidden group hover:-translate-y-0.5 transition">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 font-bold">Executive XP</p>
          <p className="text-3xl font-black text-[#1E2538] font-mono">{profile.xp_balance}</p>
          <p className="text-[11px] text-slate-400">ระดับเลเวลประสบการณ์ประจำรุ่น 11</p>
        </div>

        {/* Card 3: Attendance Rate */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center shadow-card space-y-1 relative overflow-hidden group hover:-translate-y-0.5 transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 font-bold">สถิติการเข้าเรียน (Attendance)</p>
          <p className="text-3xl font-black text-[#1E2538] font-mono">{profile.attendance_rate}%</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์จบหลักสูตร (&gt;80%)
          </p>
        </div>
      </div>

      {/* ================= CONTACT & BUSINESS INFORMATION ================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-[#1E2538] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB7170]" />
            ข้อมูลการติดต่อและประวัติธุรกิจ (Official Profile)
          </h2>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {profile.cohort_batch || 'YFTI 11'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xs text-[#1E2538] shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[11px] font-semibold block">อีเมลสำหรับติดต่อ</span>
              <span className="font-bold text-slate-800 truncate block">{profile.email || 'yfti11@yfticonnect.com'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xs text-[#1E2538] shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[11px] font-semibold block">เบอร์โทรศัพท์มือถือ</span>
              <span className="font-bold text-slate-800 font-mono block">{profile.phone_number || '082-269-9962'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xs text-[#1E2538] shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[11px] font-semibold block">ตำแหน่งในองค์กร</span>
              <span className="font-bold text-slate-800 truncate block">{profile.position || 'Executive Member'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xs text-[#1E2538] shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[11px] font-semibold block">ชื่อบริษัท / กิจการ</span>
              <span className="font-bold text-slate-800 truncate block">{profile.company_name || 'Young FTI ELITE 11 Member'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ROLE SIMULATOR & LOGOUT ================= */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#1E2538] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#FB7170]" />
            สลับสิทธิ์จำลอง (Role Simulator)
          </span>
          <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">
            CURRENT: {profile.role}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {(['MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN'] as const).map((roleOption) => (
            <button
              key={roleOption}
              onClick={() => updateRole(roleOption)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition ${
                profile.role === roleOption
                  ? 'bg-[#1E2538] text-white border-[#1E2538] shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {roleOption === 'SUPER_ADMIN' ? 'Super Admin' : roleOption === 'HOUSE_ADMIN' ? 'House Admin' : 'Member'}
            </button>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 text-xs font-extrabold transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4 text-rose-500" />
        <span>ออกจากระบบ</span>
      </button>

      {/* Switch User Modal */}
      <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

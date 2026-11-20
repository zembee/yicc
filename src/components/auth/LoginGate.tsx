'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import {
  AlertCircle,
  ShieldCheck,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  KeyRound,
} from 'lucide-react';

const StarDiamond: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = 'w-3 h-3',
  style,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6Z" />
  </svg>
);

export const LoginGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    profile,
    isLoading,
    loginWithCredentials,
    loginWithLine,
    refetchProfile,
    isMockMode,
    logout,
  } = useLiffAuth();

  const [mounted, setMounted] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [username, setUsername] = useState('yfti11');
  const [password, setPassword] = useState('yfti@11');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Public routes that do not require auth gate
  if (pathname === '/register' || pathname?.startsWith('/privileges')) {
    return <>{children}</>;
  }

  const hasApprovedSession =
    Boolean(profile) && profile?.role !== 'PENDING' && profile?.approval_status !== 'PENDING';

  // 1. Luxury Obsidian Celestial Auth Verification Splash
  if (!mounted || (isLoading && !hasApprovedSession)) {
    return (
      <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center p-5 select-none fade-in-soft relative overflow-hidden">
        {/* Ambient Celestial Glow Orbs */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(223,194,125,0.14) 0%, rgba(197,160,89,0.03) 50%, transparent 75%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(16,23,40,0.85) 0%, transparent 70%)',
          }}
        />

        {/* Ambient Twinkling Cosmic Stars in Background */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <StarDiamond className="absolute top-[18%] left-[15%] w-3.5 h-3.5 text-[#ECD28E] opacity-60 animate-star-twinkle" />
          <StarDiamond className="absolute top-[28%] right-[18%] w-2.5 h-2.5 text-[#DFC27D] opacity-50 animate-star-twinkle-delayed" />
          <StarDiamond className="absolute bottom-[22%] left-[22%] w-3 h-3 text-[#F5E6BE] opacity-40 animate-star-twinkle-slow" />
          <StarDiamond className="absolute bottom-[28%] right-[15%] w-2 h-2 text-[#ECD28E] opacity-60 animate-star-twinkle" />
          <span className="absolute top-[12%] right-[32%] w-1.5 h-1.5 rounded-full bg-[#ECD28E]/60 animate-pulse" />
          <span className="absolute bottom-[16%] left-[36%] w-1 h-1 rounded-full bg-[#DFC27D]/50 animate-ping" />
        </div>

        {/* Executive Obsidian Pass Card */}
        <div
          className="relative w-full max-w-xs luxury-stage text-white rounded-[32px] overflow-hidden shadow-[0_24px_65px_rgba(0,0,0,0.55)] border border-[#DFC27D]/30"
          style={{ boxShadow: '0 24px 65px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(223,194,125,0.22)' }}
        >
          {/* Faint Floating 3D Planet Sun Watermark */}
          <img
            src="/images/planets/the_sun.webp?v=2"
            alt=""
            aria-hidden="true"
            className="absolute -right-8 -top-8 w-40 h-40 object-contain opacity-[0.20] pointer-events-none select-none animate-float-gentle"
          />

          {/* Twinkling Star Corner Accents inside card */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            <StarDiamond className="absolute top-4 left-5 w-3 h-3 text-[#ECD28E] opacity-75 animate-star-twinkle" />
            <StarDiamond className="absolute bottom-5 right-5 w-2.5 h-2.5 text-[#DFC27D] opacity-65 animate-star-twinkle-delayed" />
          </div>

          <div className="relative z-10 p-7 text-center space-y-5">
            {/* Center Celestial Emblem with Orbit Ring */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {/* Outer Orbit Ring with Satellite Star */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-dashed border-[#ECD28E]/35 animate-celestial-orbit pointer-events-none"
              >
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#ECD28E] shadow-[0_0_8px_#ECD28E]" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#DFC27D]/70" />
              </div>

              {/* Inner Dotted Counter-Orbit Ring */}
              <div
                aria-hidden="true"
                className="absolute inset-1.5 rounded-full border border-dotted border-white/20 animate-celestial-orbit-reverse pointer-events-none"
              />

              {/* Central Logo Box with Golden Aura */}
              <div className="relative w-16 h-16 rounded-2xl bg-white p-2 shadow-[0_10px_28px_rgba(0,0,0,0.5)] ring-1 ring-[#DFC27D]/60 flex items-center justify-center animate-gold-aura">
                <Image
                  src="/YFTI-11-Logo.jpg"
                  alt="Young FTI ELITE 11"
                  fill
                  sizes="64px"
                  className="object-contain p-1.5"
                  priority
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full badge-gold-metallic text-[10px] font-bold uppercase tracking-[0.22em]">
                <Sparkles className="w-3 h-3 text-[#ECD28E]" />
                <span>Executive Member Pass</span>
              </div>
              <h2 className="text-xl tracking-tight text-white drop-shadow-md">
                <span className="font-extrabold">YOUNG FTI</span>{' '}
                <span className="font-light text-[#ECD28E]">ELITE 11</span>
              </h2>
              <p className="text-[11px] font-medium text-slate-300">
                หลักสูตรนักอุตสาหกรรมรุ่นใหม่ • ส.อ.ท.
              </p>
            </div>

            {/* Smooth Cosmic Satin Gold Progress Track */}
            <div className="pt-2 space-y-2.5">
              <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#C5A059] via-[#F5E6BE] to-[#B18A3B] loading-bar-slide" />
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#ECD28E] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECD28E] animate-ping" />
                <span>กำลังเข้าสู่ระบบ 9 ดวงดาว...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and approved, render actual website pages
  if (hasApprovedSession) {
    return <>{children}</>;
  }

  // 2. Pending Approval Screen (Obsidian & Satin Gold Theme)
  if (profile && (profile.role === 'PENDING' || profile.approval_status === 'PENDING')) {
    return (
      <div className="min-h-screen bg-[#F6F4EF] flex flex-col items-center justify-center p-4 py-12 select-none">
        <div className="w-full max-w-md bg-white rounded-[28px] overflow-hidden shadow-[0_18px_45px_rgba(13,19,33,0.08)] p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-[#0D1321] text-[#ECD28E] rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FBF6E8] text-[#9A7320] rounded-full text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Pending Verification
            </span>
            <h2 className="text-xl font-extrabold text-[#161C2C]">
              บัญชีของท่านอยู่ระหว่างรอการอนุมัติ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              ผู้ดูแลระบบหลักสูตร Young FTI ELITE 11 กำลังตรวจสอบข้อมูลสมาชิกของท่าน กรุณารอการติดต่อกลับหรือแจ้งผลทาง LINE
            </p>
          </div>

          <div className="bg-[#FAF8F4] rounded-2xl p-4 text-left text-xs space-y-2 divide-y divide-[#EFECE4]">
            <div className="flex justify-between pb-1">
              <span className="text-slate-500">ชื่อผู้ลงทะเบียน</span>
              <span className="font-bold text-[#161C2C]">{profile.display_name}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">เบอร์โทรศัพท์</span>
              <span className="font-mono font-bold text-[#161C2C]">{profile.phone_number || '-'}</span>
            </div>
          </div>

          <div className="pt-1 space-y-2.5">
            <button
              type="button"
              onClick={() => refetchProfile()}
              className="w-full py-3.5 px-4 rounded-full bg-[#0D1321] hover:bg-[#18223A] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>ตรวจสอบสถานะการอนุมัติอีกครั้ง</span>
            </button>
            <a
              href="https://line.me/R/ti/p/@yfti11"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-full bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>ติดต่อทีมงานผ่าน LINE Official</span>
            </a>
            <button
              type="button"
              onClick={logout}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-[#161C2C] transition"
            >
              ออกจากระบบ / สลับบัญชี
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback handle password login
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const ok = loginWithCredentials(username, password);
    if (!ok) {
      setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }
    setIsSubmitting(false);
  };

  const handleLineAuth = () => {
    if (isMockMode) {
      router.push('/register');
    } else {
      loginWithLine();
    }
  };

  // 3. Main Luxury Obsidian & Satin Gold Login Screen
  return (
    <div className="min-h-screen bg-[#F6F4EF] flex flex-col items-center justify-center p-4 sm:p-6 py-10 select-none animate-in fade-in duration-300 relative overflow-hidden">
      {/* Ambient Celestial Glow Behind the Card */}
      <div
        aria-hidden="true"
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(223,194,125,0.14) 0%, rgba(197,160,89,0.03) 55%, transparent 75%)',
        }}
      />

      {/* Floating Star Accents outside the card */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none hidden sm:block">
        <StarDiamond className="absolute top-[16%] left-[10%] w-3.5 h-3.5 text-[#B18A3B] opacity-45 animate-star-twinkle" />
        <StarDiamond className="absolute top-[22%] right-[12%] w-3 h-3 text-[#B18A3B] opacity-40 animate-star-twinkle-delayed" />
        <StarDiamond className="absolute bottom-[18%] left-[14%] w-2.5 h-2.5 text-[#B18A3B] opacity-35 animate-star-twinkle-slow" />
        <span className="absolute top-[28%] left-[18%] w-1.5 h-1.5 rounded-full bg-[#C5A059]/40 animate-pulse" />
        <span className="absolute bottom-[24%] right-[16%] w-1.5 h-1.5 rounded-full bg-[#C5A059]/40 animate-pulse" />
      </div>

      {/* Borderless Luxury Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(9,13,24,0.14)] ring-1 ring-[#0D1321]/5">
        {/* Card Header: Obsidian Metal Pass Style with Alpha-Masked Hero Photo + Planet Watermark */}
        <div
          className="relative luxury-stage text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #090D18 0%, #101728 55%, #0B111E 100%)',
          }}
        >
          {/* Right Alpha-Masked Cohort Photo (Seamless Fade like Member Card) */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-[58%] pointer-events-none select-none overflow-hidden"
            style={{
              WebkitMaskImage:
                'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.22) 25%, rgba(0,0,0,0.82) 60%, black 85%)',
              maskImage:
                'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.22) 25%, rgba(0,0,0,0.82) 60%, black 85%)',
            }}
          >
            <img
              src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp"
              alt=""
              className="w-full h-full object-cover object-center opacity-70"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(9,13,24,0.18) 0%, transparent 35%, rgba(9,13,24,0.86) 100%)',
              }}
            />
          </div>

          {/* Faint 3D Planet Jupiter Backdrop + Gentle Float Animation */}
          <img
            src="/images/planets/jupiter.webp?v=2"
            alt=""
            aria-hidden="true"
            className="absolute -left-6 -bottom-8 w-36 h-36 object-contain opacity-[0.22] pointer-events-none select-none animate-float-gentle"
          />

          {/* Twinkling Star Accents in Card Header */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            <StarDiamond className="absolute top-4 right-1/3 w-3 h-3 text-[#ECD28E] opacity-75 animate-star-twinkle" />
            <StarDiamond className="absolute bottom-6 right-8 w-2.5 h-2.5 text-[#DFC27D] opacity-65 animate-star-twinkle-delayed" />
            <StarDiamond className="absolute top-12 left-1/2 w-2 h-2 text-[#F5E6BE] opacity-55 animate-star-twinkle-slow" />
          </div>

          <div className="relative z-10 p-6 sm:p-7 space-y-4 max-w-[76%]">
            {/* Logo + Celestial Orbit Ring + Executive Pass Eyebrow */}
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Orbit halo ring */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-2xl border border-dashed border-[#ECD28E]/40 animate-celestial-orbit pointer-events-none"
                >
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#ECD28E] shadow-[0_0_6px_#ECD28E]" />
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-white p-1.5 shadow-md ring-1 ring-[#DFC27D]/40 shrink-0 flex items-center justify-center">
                  <Image
                    src="/YFTI-11-Logo.jpg"
                    alt="Young FTI Elite 11"
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                    priority
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#ECD28E]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ECD28E]">
                    Executive Pass
                  </p>
                </div>
                <p className="text-[11px] text-slate-300">ระบบสมาชิก 9 ดวงดาว</p>
              </div>
            </div>

            {/* Brand Lockup */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                <span className="font-extrabold">YOUNG FTI</span>{' '}
                <span className="font-light text-[#ECD28E]">ELITE 11</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-[#F5E6BE]">
                หลักสูตรนักอุตสาหกรรมรุ่นใหม่
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-semibold text-slate-200">
              <ShieldCheck className="w-3 h-3 text-[#ECD28E]" />
              <span>สำหรับผู้เข้าร่วมโครงการเท่านั้น</span>
            </div>
          </div>

          {/* Subtle Satin Gold Bottom Hairline */}
          <div
            aria-hidden="true"
            className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#DFC27D]/45 to-transparent"
          />
        </div>

        {/* Card Body: LINE-First Authentication */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B18A3B]">
              Official Member Portal
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#161C2C] tracking-tight">
              เข้าสู่ระบบสมาชิก Young FTI 11
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              เชื่อมต่อผ่าน LINE หรือค้นหาด้วยเบอร์โทรศัพท์ เพื่อเข้าถึงบัตรสมาชิก ทำเนียบธุรกิจ และสิทธิพิเศษ
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action 1: LINE Login Button */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleLineAuth}
              className="w-full py-3.5 px-5 bg-[#06C755] hover:bg-[#05b34c] text-white font-extrabold text-sm rounded-full transition shadow-[0_8px_20px_rgba(6,199,85,0.24)] flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
            >
              <svg width="20" height="20" className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.039 9.608.391.084.922.258 1.057.592.121.303.079.777.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.646 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.569-3.864 2.569-5.991z" />
              </svg>
              <span>เข้าสู่ระบบด้วย LINE (LINE Login)</span>
            </button>

            {/* Primary Action 2: Phone Lookup & Account Link */}
            <Link
              href="/register"
              className="w-full py-3.5 px-4 bg-[#F6F4EF] hover:bg-[#EDE9DF] text-[#161C2C] font-bold text-xs sm:text-sm rounded-full transition flex items-center justify-center gap-2 text-center"
            >
              <Phone className="w-4 h-4 text-[#B18A3B]" />
              <span>ยืนยันเบอร์โทรศัพท์ / ผูกบัญชีสมาชิก</span>
            </Link>
          </div>

          {/* Quick Notice */}
          <div className="p-3.5 bg-[#FAF8F3] rounded-2xl text-[11px] text-slate-600 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#B18A3B] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#161C2C]">สำหรับสมาชิกใหม่:</strong> หากยังไม่เคยผูกบัญชี ระบบจะให้ระบุเบอร์โทรศัพท์และยืนยัน OTP เพื่อเชื่อมต่อโปรไฟล์ทันที
            </span>
          </div>

          {/* Secondary Admin/Password Login Accordion */}
          <div className="pt-3 border-t border-[#EFECE4]">
            <button
              type="button"
              onClick={() => setShowPasswordLogin(!showPasswordLogin)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-[#161C2C] py-1 transition"
            >
              <span>เข้าสู่ระบบด้วย Username &amp; Password (Admin / Staff)</span>
              {showPasswordLogin ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showPasswordLogin && (
              <form onSubmit={handleLogin} className="space-y-3 pt-3 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">ชื่อผู้ใช้งาน</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="yfti11 หรือ YFTI Admin"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F4] rounded-xl text-xs font-medium text-[#161C2C] outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">รหัสผ่าน</label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="yfti@11"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F4] rounded-xl text-xs font-medium text-[#161C2C] outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#0D1321] hover:bg-[#18223A] text-[#ECD28E] font-bold text-xs transition disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วยรหัสผ่าน'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mt-6 text-center text-[11px] text-slate-400">
        © 2026 Young FTI ELITE 11 • สภาอุตสาหกรรมแห่งประเทศไทย
      </div>
    </div>
  );
};

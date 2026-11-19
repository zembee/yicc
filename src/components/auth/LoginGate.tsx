'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockCurrentUser } from '@/lib/mockData';
import { Lock, User, Key, CheckCircle, AlertCircle, ShieldCheck, ArrowRight, Phone, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export const LoginGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoading, loginWithCredentials, loginWithLine, refetchProfile, isMockMode, logout } = useLiffAuth();
  
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

  // Wait for hydration + auth verification before rendering protected routes or login screen
  // This prevents flashing protected pages on initial SSR/mount before auth state is resolved.
  const hasApprovedSession =
    Boolean(profile) && profile?.role !== 'PENDING' && profile?.approval_status !== 'PENDING';

  if (!mounted || (isLoading && !hasApprovedSession)) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex flex-col items-center justify-center p-5 select-none fade-in-soft">
        <div className="w-full max-w-xs bg-[#1E2538] text-white rounded-3xl overflow-hidden shadow-[0_18px_48px_rgba(24,30,48,0.22)] border border-white/10 border-b-[3px] border-b-[#FB7170]">
          {/* Top Branded Area */}
          <div className="relative p-7 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto rounded-2xl bg-white p-2 shadow-lg ring-4 ring-white/10 flex items-center justify-center">
              <Image
                src="/YFTI-11-Logo.jpg"
                alt="Young FTI ELITE 11"
                fill
                sizes="64px"
                className="object-contain p-1.5"
                priority
              />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                Member Portal
              </p>
              <h2 className="text-lg tracking-tight text-white">
                <span className="font-extrabold">Young FTI</span>{' '}
                <span className="font-light text-white/95">ELITE 11</span>
              </h2>
              <p className="text-[11px] font-medium text-[#FB7170]">
                หลักสูตรนักอุตสาหกรรมรุ่นใหม่
              </p>
            </div>

            {/* Smooth Indeterminate Progress Track */}
            <div className="pt-2 space-y-2">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#C59B38] via-[#FB7170] to-[#E5C158] loading-bar-slide" />
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                กำลังตรวจสอบสถานะสมาชิก...
              </p>
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

  // If user has a PENDING approval status
  if (profile && (profile.role === 'PENDING' || profile.approval_status === 'PENDING')) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 py-12 select-none">
        <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase">
              Status: Pending Approval
            </span>
            <h2 className="text-xl font-black text-[#1E2538]">
              บัญชีของท่านอยู่ระหว่างรอการอนุมัติ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              ผู้ดูแลระบบหลักสูตร Young FTI ELITE 11 กำลังตรวจสอบข้อมูลสมาชิกของท่าน กรุณารอการติดต่อกลับหรือแจ้งผลทาง LINE
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">ชื่อผู้ลงทะเบียน:</span>
              <span className="font-bold text-[#1E2538]">{profile.display_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">เบอร์โทรศัพท์:</span>
              <span className="font-mono font-bold text-[#1E2538]">{profile.phone_number || '-'}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => refetchProfile()}
              className="w-full py-3 px-4 rounded-xl bg-[#1E2538] hover:bg-[#151A28] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>ตรวจสอบสถานะการอนุมัติอีกครั้ง</span>
            </button>
            <a
              href="https://line.me/R/ti/p/@yfti11"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>ติดต่อทีมงานผ่าน LINE Official</span>
            </a>
            <button
              onClick={logout}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700"
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

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col items-center justify-center p-4 sm:p-6 py-12 select-none animate-in fade-in duration-300">
      {/* Login Card Container */}
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80">
        {/* Card Header: LINE Member Portal Split Hero */}
        <div className="relative bg-[#1E2538] text-white overflow-hidden border-b-[3px] border-[#FB7170]">
          {/* Right Slanted Group Photo */}
          <div
            className="absolute right-0 top-0 bottom-0 w-[52%] pointer-events-none select-none"
            style={{
              clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0% 100%)',
            }}
          >
            <img
              src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp"
              alt="Young FTI ELITE 11"
              className="w-full h-full object-cover object-center opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E2538]/85 via-[#1E2538]/30 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-7 space-y-4 max-w-[70%]">
            {/* Logo + Member Portal Eyebrow */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-xl bg-white p-1.5 shadow-md shrink-0">
                <Image
                  src="/YFTI-11-Logo.jpg"
                  alt="Young FTI Elite 11"
                  fill
                  sizes="44px"
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  Member Portal
                </p>
                <p className="text-[11px] text-slate-300">ระบบสมาชิกโครงการ</p>
              </div>
            </div>

            {/* Bold + Light Brand Typography */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl leading-tight tracking-tight text-white">
                <span className="font-extrabold block">Young FTI</span>
                <span className="font-light text-white/95">ELITE 11</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-[#FB7170]">
                หลักสูตรนักอุตสาหกรรมรุ่นใหม่
              </p>
            </div>

            <p className="text-[11px] text-slate-300/90">
              สำหรับผู้เข้าร่วมโครงการเท่านั้น
            </p>
          </div>
        </div>

        {/* Card Body: LINE-First Authentication */}
        <div className="p-6 sm:p-9 space-y-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06C755]/15 text-[#06C755] text-xs font-extrabold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Member Portal</span>
            </div>
            <h2 className="text-2xl font-black text-[#1E2538] tracking-tight">
              เข้าสู่ระบบสมาชิก Young FTI 11
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              เชื่อมต่อผ่าน LINE หรือค้นหาด้วยเบอร์โทรศัพท์ เพื่อเข้าถึงทำเนียบรุ่นและกิจกรรม
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-semibold animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action 1: LINE Login Button */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleLineAuth}
              className="w-full py-4 px-5 bg-[#06C755] hover:bg-[#05b34c] text-white font-extrabold text-sm sm:text-base rounded-2xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer"
            >
              <svg width="24" height="24" className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.039 9.608.391.084.922.258 1.057.592.121.303.079.777.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.646 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.569-3.864 2.569-5.991z" />
              </svg>
              <span>เข้าสู่ระบบด้วย LINE (LINE Login)</span>
            </button>

            {/* Primary Action 2: Phone Lookup & Account Link */}
            <Link
              href="/register"
              className="w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-[#1E2538] border border-slate-200 font-bold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 text-center"
            >
              <Phone className="w-4 h-4 text-[#FB7170]" />
              <span>ยืนยันเบอร์โทรศัพท์ / ผูกบัญชีสมาชิก</span>
            </Link>
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
            💡 <strong>สำหรับสมาชิกใหม่:</strong> หากยังไม่เคยผูกบัญชี ระบบจะให้ระบุเบอร์โทรศัพท์และยืนยัน OTP เพื่อเชื่อมต่อโปรไฟล์ทันที
          </div>

          {/* Secondary Admin/Password Login Accordion */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPasswordLogin(!showPasswordLogin)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-[#1E2538] py-1 transition"
            >
              <span>เข้าสู่ระบบด้วย Username & Password (Admin / Staff)</span>
              {showPasswordLogin ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showPasswordLogin && (
              <form onSubmit={handleLogin} className="space-y-3.5 pt-3 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">ชื่อผู้ใช้งาน</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yfti11 หรือ YFTI Admin"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">รหัสผ่าน</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="yfti@11"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#1E2538] hover:bg-[#2B3550] text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วยรหัสผ่าน'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-slate-400">
        Copyright ©2025 by exvention • Young FTI ELITE 11
      </div>
    </div>
  );
};


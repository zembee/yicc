'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import { Lock, User, Key, CheckCircle, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loginWithCredentials, loginWithLine, isMockMode } = useLiffAuth();
  
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean>(true);
  const [username, setUsername] = useState('yfti11');
  const [password, setPassword] = useState('yfti@11');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('yfti_auth_session');
      if (session || profile) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    }
  }, [profile]);

  // If user is accessing the registration page or during SSR before mount, allow children through cleanly
  if (pathname === '/register' || !mounted) {
    return <>{children}</>;
  }

  // If authenticated, render actual website pages
  if (authenticated) {
    return <>{children}</>;
  }

  // If NOT authenticated, render the official YFTI Login Screen matching yfticonnect.com
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const user = username.trim();
    const pass = password.trim();

    if (
      (user.toLowerCase() === 'yfti11' && pass === 'yfti@11') ||
      (user === 'YFTI Admin' && pass === '(XM8zvGei1l$XaHc&nT$oqs&')
    ) {
      const authUser = {
        id: 'u-yfti11',
        display_name: user === 'YFTI Admin' ? 'YFTI Admin' : 'Young FTI 11 Member',
        role: user === 'YFTI Admin' ? 'SUPER_ADMIN' : 'MEMBER',
        cohort_batch: 'YFTI 11',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('yfti_auth_session', JSON.stringify(authUser));
      }
      setAuthenticated(true);
    } else {
      setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }
    setIsSubmitting(false);
  };

  const handleLineAuth = () => {
    if (isMockMode) {
      // In web browser environment, forward to register flow with simulated LINE connection
      router.push('/register');
    } else {
      loginWithLine();
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-6 py-12 select-none animate-in fade-in duration-300">
      {/* Login Card Container matching yfticonnect.com */}
      <div className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        {/* Card Header: Slanted Ribbon with YFTI Logo */}
        <div className="relative bg-[#F8FAFC] border-b border-slate-200">
          <div className="flex items-center justify-between h-20 sm:h-24">
            {/* White Left Logo Box */}
            <div className="flex items-center h-full z-10 pl-6 sm:pl-8">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                <Image
                  src="/YFTI-11-Logo.jpg"
                  alt="Young FTI Elite 11"
                  fill
                  sizes="56px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Brand Title in Center */}
            <div className="flex items-center gap-2 pr-6 sm:pr-8 z-10">
              <span className="text-lg sm:text-xl font-black text-[#1E2538] tracking-tight">
                Young FTI <span className="font-extrabold">ELITE</span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#FB7170]">
                หลักสูตรนักอุตสาหกรรมรุ่นใหม่
              </span>
            </div>

            {/* Slanted Navy Decorative Polygon */}
            <div
              className="absolute right-0 top-0 bottom-0 w-28 sm:w-36 bg-[#1E2538]"
              style={{
                clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0% 100%)'
              }}
            />
          </div>
        </div>

        {/* Card Body: Form Content */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#1E2538] tracking-tight">
              กรุณาเข้าสู่ระบบ เพื่อเข้าถึงหน้านี้
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              เฉพาะสมาชิกและผู้เข้าร่วมหลักสูตร Young FTI ELITE เท่านั้น
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-semibold animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Standard Credentials Box */}
          <div className="space-y-4">
            {/* Field 1: Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ชื่อผู้ใช้งานของท่าน"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านของท่าน"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Checkbox: Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#1E2538] focus:ring-[#1E2538]"
              />
              <label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer">
                Remember Me (จดจำการเข้าสู่ระบบ)
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#1E2538] hover:bg-[#2B3550] text-white font-bold text-sm rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">หรือ</span>
            </div>
          </div>

          {/* LINE Auth / Link Button & Registration Link */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleLineAuth}
              className="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2.5 group"
            >
              <svg width="20" height="20" className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.039 9.608.391.084.922.258 1.057.592.121.303.079.777.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.646 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.569-3.864 2.569-5.991z" />
              </svg>
              <span>เข้าสู่ระบบด้วย LINE / ผูกบัญชีสมาชิก</span>
            </button>

            <div className="text-center pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FB7170] hover:underline"
              >
                <span>ยังไม่มีบัญชีสมาชิก? สมัครลงทะเบียนใหม่</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
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

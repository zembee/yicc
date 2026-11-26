'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import { supabase } from '@/lib/supabase';
import { yftiParticipants, mockHouses } from '@/lib/mockData';
import { House, Participant, UserProfile } from '@/types';
import { 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Briefcase, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  Loader2, 
  UserCheck, 
  User, 
  Mail, 
  Star,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const INDUSTRIES = [
  'สินค้าอุตสาหกรรม',
  'สินค้าอุปโภคบริโภค',
  'การเกษตร / อาหารและเครื่องดื่ม',
  'เทคโนโลยีและซอฟต์แวร์',
  'อสังหาริมทรัพย์และก่อสร้าง',
  'ธุรกิจการเงินและการลงทุน',
  'พลังงานและสาธารณูปโภค',
  'บริการและโลจิสติกส์',
  'อื่นๆ'
];

type FlowStep = 'PHONE_LOOKUP' | 'OTP_VERIFY' | 'NEW_REGISTRATION' | 'PENDING_APPROVAL' | 'LINK_SUCCESS';

// Helper to normalize phone number
const normalizePhone = (num: string): string => {
  return num.replace(/\D/g, '').replace(/^66/, '0');
};

export default function RegisterPage() {
  const router = useRouter();
  const { profile, lineProfile, isLoading: isAuthLoading, switchProfile, refetchProfile, logout, isMockMode, loginWithLine } = useLiffAuth();

  const [step, setStep] = useState<FlowStep>('PHONE_LOOKUP');

  useEffect(() => {
    if (isAuthLoading || !profile) return;
    if (profile.role === 'PENDING' || profile.approval_status === 'PENDING') {
      if (step === 'PHONE_LOOKUP') {
        setStep('PENDING_APPROVAL');
      }
      return;
    }
    if (profile.approval_status !== 'REJECTED' && (step === 'PHONE_LOOKUP' || step === 'PENDING_APPROVAL')) {
      router.replace('/');
    }
  }, [profile, isAuthLoading, step, router]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [matchedParticipant, setMatchedParticipant] = useState<Participant | null>(null);

  // Form Fields for New Registration (Non-listed users)
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [selectedHouseId, setSelectedHouseId] = useState<string>('the_sun');
  const [houses, setHouses] = useState<House[]>(mockHouses);

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load houses
  useEffect(() => {
    async function loadHouses() {
      try {
        const { data, error } = await supabase.from('houses').select('*').order('name');
        if (!error && data && data.length > 0) {
          setHouses(data);
          setSelectedHouseId(data[0].id);
        }
      } catch (err) {
        // Fallback to mockHouses
      }
    }
    loadHouses();
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    if (step !== 'OTP_VERIFY') return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Pre-fill from LINE
  useEffect(() => {
    if (lineProfile?.displayName && !fullName) {
      setFullName(lineProfile.displayName);
    }
  }, [lineProfile, fullName]);

  // Step 1: Handle Phone Lookup
  const handlePhoneLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInput = normalizePhone(phoneNumber);
    if (!cleanInput || cleanInput.length < 9) {
      setErrorMsg('กรุณาระบุหมายเลขโทรศัพท์ 10 หลักให้ถูกต้อง');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Search in Local YFTI 11 Participant Directory (122 members)
      const localMatch = yftiParticipants.find((p) => {
        if (!p.tel_number) return false;
        return normalizePhone(p.tel_number) === cleanInput;
      });

      if (localMatch) {
        setMatchedParticipant(localMatch);
        setStep('OTP_VERIFY');
        setOtpCountdown(60);
        setIsLoading(false);
        return;
      }

      // 2. Search in Supabase profiles (if already exists)
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .ilike('phone_number', `%${cleanInput.slice(-8)}%`)
          .maybeSingle();

        if (dbProfile) {
          const mappedParticipant: Participant = {
            id: dbProfile.id,
            name_thai: dbProfile.display_name,
            nickname_eng: 'Member',
            fullname_eng: dbProfile.display_name,
            tel_number: dbProfile.phone_number,
            company_name_thai: dbProfile.company_name,
            business_position: dbProfile.position,
            star_group: dbProfile.house_id || 'the_sun',
            profile_picture_url: dbProfile.picture_url,
          };
          setMatchedParticipant(mappedParticipant);
          setStep('OTP_VERIFY');
          setOtpCountdown(60);
          setIsLoading(false);
          return;
        }
      } catch (dbErr) {
        console.warn('DB search fallback:', dbErr);
      }

      // 3. Not Found -> Go to New Member Registration (Pending Admin Approval)
      setStep('NEW_REGISTRATION');
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการค้นหาข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2A: Verify OTP & Link Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const enteredOtp = otpCode.trim();
    // Default test OTP: 123456
    if (enteredOtp !== '123456') {
      setErrorMsg('รหัส OTP ไม่ถูกต้อง กรุณากรอกรหัส 123456 (สำหรับทดสอบ)');
      return;
    }

    if (!matchedParticipant) {
      setErrorMsg('ไม่พบข้อมูลสมาชิก กรุณาลองค้นหาใหม่อีกครั้ง');
      return;
    }

    setIsLoading(true);

    try {
      const lineUserId = lineProfile?.userId || `U_LINE_${matchedParticipant.id}_${Date.now()}`;
      const actualPicture = matchedParticipant.profile_picture_url || lineProfile?.pictureUrl || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp';
      const targetHouse = houses.find((h) => h.id === matchedParticipant.star_group) || mockHouses[0];

      const linkedProfile: UserProfile = {
        id: String(matchedParticipant.id),
        line_user_id: lineUserId,
        display_name: `${matchedParticipant.name_thai} (${matchedParticipant.nickname_eng || 'Member'})`,
        picture_url: actualPicture,
        phone_number: matchedParticipant.tel_number || phoneNumber,
        email: matchedParticipant.email,
        company_name: matchedParticipant.company_name_thai || 'Young FTI ELITE 11 Member',
        position: matchedParticipant.business_position || 'Executive Member',
        industry: matchedParticipant.industrial_groups_label || 'อุตสาหกรรมและการผลิต',
        cohort_batch: 'YFTI 11',
        house_id: targetHouse.id,
        house: targetHouse,
        role: String(matchedParticipant.id) === '3296' ? 'SUPER_ADMIN' : 'MEMBER',
        approval_status: 'APPROVED',
        points_balance: 100, // Linked bonus
        xp_balance: 300,      // Linked bonus
        attendance_rate: 95,
      };

      // Upsert to Supabase
      try {
        await supabase.from('profiles').upsert({
          id: linkedProfile.id,
          line_user_id: linkedProfile.line_user_id,
          display_name: linkedProfile.display_name,
          picture_url: linkedProfile.picture_url,
          phone_number: linkedProfile.phone_number,
          company_name: linkedProfile.company_name,
          position: linkedProfile.position,
          industry: linkedProfile.industry,
          house_id: linkedProfile.house_id,
          cohort_batch: 'YFTI 11',
          role: linkedProfile.role,
          points_balance: linkedProfile.points_balance,
          xp_balance: linkedProfile.xp_balance,
          attendance_rate: linkedProfile.attendance_rate,
          updated_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn('Supabase sync notice:', dbErr);
      }

      // Save Session & Update App Context
      switchProfile(linkedProfile);
      setStep('LINK_SUCCESS');

      setTimeout(() => {
        router.replace('/about');
      }, 1500);
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการผูกบัญชี กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2B: Submit New Registration for Admin Approval
  const handleSubmitNewRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('กรุณาระบุชื่อ-นามสกุล');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg('กรุณาระบุเบอร์โทรศัพท์');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('กรุณาระบุชื่อบริษัท / องค์กร');
      return;
    }

    setIsLoading(true);

    try {
      const lineUserId = lineProfile?.userId || `U_PENDING_${Date.now()}`;
      const linePicture = lineProfile?.pictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName.trim())}`;
      const selectedHouse = houses.find((h) => h.id === selectedHouseId) || mockHouses[0];

      const pendingProfile: UserProfile & { created_at?: string } = {
        id: `pending_${Date.now()}`,
        line_user_id: lineUserId,
        display_name: fullName.trim() + (nickname ? ` (${nickname.trim()})` : ''),
        picture_url: linePicture,
        phone_number: phoneNumber.trim(),
        email: email.trim() || undefined,
        company_name: companyName.trim(),
        position: position.trim() || 'Executive',
        industry: industry,
        cohort_batch: 'YFTI 11',
        house_id: selectedHouse.id,
        house: selectedHouse,
        role: 'PENDING',
        approval_status: 'PENDING',
        points_balance: 0,
        xp_balance: 0,
        attendance_rate: 0,
        created_at: new Date().toISOString(),
      };

      // Save application to server API (persists to both Cloud JSON Store & Supabase with proper PENDING markers)
      try {
        await fetch('/api/members/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingProfile),
        });
      } catch (apiErr) {
        console.warn('Member application API notice:', apiErr);
      }

      // Save application to localStorage for offline/demo Admin approval queue
      if (typeof window !== 'undefined') {
        try {
          const existingRaw = localStorage.getItem('yfti_member_applications');
          const existing = existingRaw ? (JSON.parse(existingRaw) as UserProfile[]) : [];
          const filtered = Array.isArray(existing)
            ? existing.filter((item) => item.line_user_id !== pendingProfile.line_user_id)
            : [];
          localStorage.setItem(
            'yfti_member_applications',
            JSON.stringify([{ ...pendingProfile, created_at: new Date().toISOString() }, ...filtered])
          );
        } catch {}
      }

      // Persist pending session so exiting and re-entering keeps the pending state
      switchProfile(pendingProfile);
      setStep('PENDING_APPROVAL');
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[75vh] bg-[#F6F4EF] flex flex-col items-center justify-center p-5 select-none fade-in-soft">
        <div
          className="relative w-full max-w-xs luxury-stage text-white rounded-[28px] overflow-hidden shadow-[0_22px_50px_rgba(9,13,24,0.32)] p-7 text-center space-y-4"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(223,194,125,0.28)' }}
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 ring-1 ring-[#DFC27D]/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#ECD28E] animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base tracking-tight text-white">
              <span className="font-extrabold">YOUNG FTI</span>{' '}
              <span className="font-light text-[#ECD28E]">ELITE 11</span>
            </h2>
            <p className="text-[11px] text-slate-300">กำลังตรวจสอบสถานะสมาชิก...</p>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#C5A059] via-[#F5E6BE] to-[#B18A3B] loading-bar-slide" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-3 animate-in fade-in duration-300">
      {/* Back Link */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1E2538] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าหลัก</span>
        </Link>

        <span className="text-[11px] font-bold text-slate-400">
          Young FTI ELITE 11 Portal
        </span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        {/* Top Ribbon */}
        <div className="bg-[#1E2538] text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06C755]/20 text-[#06C755] text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LINE-First Member Onboarding</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {step === 'PHONE_LOOKUP' && 'ยืนยันตัวตนสมาชิกด้วยเบอร์โทรศัพท์'}
              {step === 'OTP_VERIFY' && 'ยืนยันรหัส OTP เพื่อผูกบัญชี LINE'}
              {step === 'NEW_REGISTRATION' && 'กรอกข้อมูลขออนุมัติเข้าร่วมโครงการ'}
              {step === 'PENDING_APPROVAL' && 'ส่งข้อมูลขออนุมัติเรียบร้อยแล้ว'}
              {step === 'LINK_SUCCESS' && 'ผูกบัญชีสมาชิกสำเร็จ!'}
            </h1>
            <p className="text-xs text-slate-300">
              {step === 'PHONE_LOOKUP' && 'ค้นหาข้อมูลสมาชิกทำเนียบรุ่น 11 และผูกกับ LINE ของท่าน'}
              {step === 'OTP_VERIFY' && 'กรอกรหัสยืนยัน 6 หลัก เพื่อความปลอดภัยในการเชื่อมต่อ'}
              {step === 'NEW_REGISTRATION' && 'ไม่พบข้อมูลในระบบ กรุณาส่งข้อมูลเพื่อรอ Admin อนุมัติ'}
              {step === 'PENDING_APPROVAL' && 'ข้อมูลของท่านอยู่ระหว่างรอการตรวจสอบจากผู้ดูแลระบบ'}
              {step === 'LINK_SUCCESS' && 'ยินดีต้อนรับสู่เครือข่าย Young FTI ELITE 11'}
            </p>
          </div>

          <div
            className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 pointer-events-none"
            style={{ clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0% 100%)' }}
          />
        </div>

        {/* LINE Identity Card */}
        <div className="p-4 sm:p-5 bg-emerald-50/70 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#06C755] bg-white shadow-sm flex items-center justify-center shrink-0">
              {lineProfile?.pictureUrl ? (
                <img src={lineProfile.pictureUrl} alt="LINE Avatar" className="w-full h-full object-cover" />
              ) : (
                <svg width="22" height="22" className="w-5 h-5 fill-[#06C755] shrink-0" viewBox="0 0 24 24">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.039 9.608.391.084.922.258 1.057.592.121.303.079.777.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.646 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.569-3.864 2.569-5.991z" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#06C755]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>บัญชี LINE ที่เชื่อมต่อ</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {lineProfile?.displayName || 'LINE Account User'}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 bg-white border border-[#06C755]/30 text-[#06C755] rounded-full shadow-sm">
            LINE Connected
          </span>
        </div>

        {/* Step Body Content */}
        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-semibold animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STEP 1: PHONE LOOKUP ================= */}
          {step === 'PHONE_LOOKUP' && (
            <form onSubmit={handlePhoneLookup} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-700">
                  ระบุเบอร์โทรศัพท์ที่ลงทะเบียนไว้กับโครงการ <span className="text-[#FB7170]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition font-mono"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  ระบบจะค้นหาชื่อของท่านในทำเนียบรุ่น 11 เพื่อส่งรหัส OTP ผูกบัญชี
                </p>
              </div>

              {/* Quick Sample Test Number */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>ตัวอย่างเบอร์ในระบบสำหรับทดสอบ (คลิกเพื่อใส่):</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {['082-269-9962', '081-445-5678', '089-123-4567'].map((demoTel) => (
                    <button
                      key={demoTel}
                      type="button"
                      onClick={() => setPhoneNumber(demoTel)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-[#1E2538] hover:text-[#1E2538] transition shadow-sm font-mono"
                    >
                      {demoTel}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#1E2538] hover:bg-[#2B3550] text-white font-bold text-sm rounded-2xl transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังค้นหาข้อมูลสมาชิก...</span>
                  </>
                ) : (
                  <>
                    <span>ค้นหาข้อมูล & ขอรับรหัส OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 2A: OTP VERIFY (MATCH FOUND) ================= */}
          {step === 'OTP_VERIFY' && matchedParticipant && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Matched Profile Preview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
                <img
                  src={matchedParticipant.profile_picture_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + matchedParticipant.name_thai}
                  alt={matchedParticipant.name_thai}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      พบข้อมูลในระบบ
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {matchedParticipant.star_group || 'YFTI 11'}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#1E2538] truncate">
                    {matchedParticipant.name_thai} ({matchedParticipant.nickname_eng})
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {matchedParticipant.company_name_thai} • {matchedParticipant.business_position}
                  </p>
                </div>
              </div>

              {/* OTP Input Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-700">
                    รหัสยืนยัน OTP 6 หลัก <span className="text-[#FB7170]">*</span>
                  </label>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {otpCountdown > 0 ? `ขอรหัสใหม่ใน ${otpCountdown}s` : 'สามารถขอรหัสใหม่ได้'}
                  </span>
                </div>

                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="กรอก 123456"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black tracking-widest text-[#1E2538] text-center outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition font-mono"
                    autoFocus
                  />
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>สำหรับการทดสอบระบบ: กรุณาใส่รหัส OTP <strong>123456</strong></span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setStep('PHONE_LOOKUP');
                    setOtpCode('');
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  เปลี่ยนเบอร์
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm rounded-2xl transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังผูกบัญชี...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ยืนยัน OTP & ผูกบัญชี LINE ทันที</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2B: NEW REGISTRATION (PENDING ADMIN APPROVAL) ================= */}
          {step === 'NEW_REGISTRATION' && (
            <form onSubmit={handleSubmitNewRegistration} className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>ไม่พบเบอร์ {phoneNumber} ในทะเบียนรุ่น 11</span>
                </div>
                <p>
                  กรุณากรอกข้อมูลเพื่อส่งเรื่องขออนุมัติเข้าใช้งาน (Admin Approval) ทีมงานจะตรวจสอบและแจ้งผลกลับทาง LINE
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    ชื่อ - นามสกุล <span className="text-[#FB7170]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="เช่น กนกวรรณ วงศ์ชัย"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    ชื่อเล่น (อังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="เช่น Sand"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    เบอร์โทรศัพท์ <span className="text-[#FB7170]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    อีเมล (Email)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    ชื่อบริษัท / องค์กร <span className="text-[#FB7170]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="เช่น บริษัท กลัฟเท็กซ์ จำกัด"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    ตำแหน่งในธุรกิจ
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="เช่น กรรมการผู้จัดการ"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">กลุ่มอุตสาหกรรม</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">กลุ่มดาวประจำตัว</label>
                  <select
                    value={selectedHouseId}
                    onChange={(e) => setSelectedHouseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>⭐ {h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('PHONE_LOOKUP')}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-[#1E2538] hover:bg-[#2B3550] text-white font-bold text-sm rounded-2xl transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังส่งข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-[#FB7170]" />
                      <span>ส่งข้อมูลเพื่อรอ Admin อนุมัติ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 3B: PENDING APPROVAL SCREEN ================= */}
          {step === 'PENDING_APPROVAL' && (
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-pulse">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-extrabold uppercase">
                  Status: Pending Approval
                </span>
                <h3 className="text-xl font-black text-[#1E2538]">
                  บันทึกข้อมูลเรียบร้อยแล้ว
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  ข้อมูลของท่านอยู่ระหว่างรอการตรวจสอบและอนุมัติสิทธิ์เข้าใช้งานจากผู้ดูแลระบบหลักสูตร Young FTI ELITE 11
                </p>
              </div>

              {/* Progress Steps Timeline */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">1. ส่งข้อมูลเบื้องต้นและผูก LINE</p>
                    <p className="text-[10px] text-slate-400">สำเร็จเรียบร้อย</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 animate-spin">
                    ⏳
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-900">2. ผู้ดูแลระบบตรวจสอบสถานะสมาชิก</p>
                    <p className="text-[10px] text-slate-500">กำลังดำเนินการ (ใช้เวลาประมาณ 1-2 วันทำการ)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400">3. ปลดล็อกสิทธิ์และเข้าสู่ระบบเต็มรูปแบบ</p>
                    <p className="text-[10px] text-slate-400">แจ้งเตือนผ่าน LINE ทันทีเมื่ออนุมัติ</p>
                  </div>
                </div>
              </div>

              {statusFeedback && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  {statusFeedback}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={isCheckingStatus}
                  onClick={async () => {
                    setIsCheckingStatus(true);
                    setStatusFeedback(null);
                    try {
                      await refetchProfile();
                      setStatusFeedback('ซิงก์ข้อมูลล่าสุดแล้ว · อยู่ระหว่างรอแอดมินอนุมัติ');
                    } finally {
                      setIsCheckingStatus(false);
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1E2538] hover:bg-[#151A28] disabled:opacity-60 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>{isCheckingStatus ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะอีกครั้ง'}</span>
                </button>
                <a
                  href="https://line.me/R/ti/p/@yfti11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>ติดต่อเจ้าหน้าที่ผ่าน LINE</span>
                </a>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Link
                  href="/"
                  className="text-xs font-bold text-slate-500 hover:text-[#1E2538] transition"
                >
                  กลับหน้าหลัก
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setStatusFeedback(null);
                    setErrorMsg(null);
                    setStep('PHONE_LOOKUP');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 transition"
                >
                  รีเซ็ต / กรอกข้อมูลสมัครใหม่
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3A: LINK SUCCESS ================= */}
          {step === 'LINK_SUCCESS' && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#1E2538]">
                  ผูกบัญชีสมาชิกสำเร็จ!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  ยินดีต้อนรับคุณ {matchedParticipant?.name_thai} ({matchedParticipant?.nickname_eng}) เข้าสู่ระบบ
                </p>
              </div>

              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-full text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ได้รับ 100 Coins & 300 XP สำหรับสมาชิกยืนยันตัวตน</span>
              </div>

              <p className="text-xs text-slate-400 animate-pulse pt-3">
                กำลังนำท่านเข้าสู่ระบบ...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


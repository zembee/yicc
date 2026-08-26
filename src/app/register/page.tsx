'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import { supabase } from '@/lib/supabase';
import { House } from '@/types';
import { User, Phone, Mail, Building2, Briefcase, Sparkles, ShieldCheck, CheckCircle2, Loader2, Award, Star, ArrowLeft } from 'lucide-react';
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

const BUSINESS_CATEGORIES = [
  'ของใช้ในครัวเรือนและสำนักงาน',
  'ยานยนต์และชิ้นส่วนยานยนต์',
  'อาหารและเครื่องดื่ม',
  'เทคโนโลยีและดิจิทัลโซลูชัน',
  'พลังงานและสิ่งแวดล้อม',
  'การแพทย์และสุขภาพ',
  'การเงินและการลงทุน',
  'การขนส่งและโลจิสติกส์',
  'การท่องเที่ยวและการบริการ',
  'อื่นๆ'
];

export default function RegisterPage() {
  const router = useRouter();
  const { lineProfile, profile, isMockMode, switchProfile } = useLiffAuth();

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [category, setCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [selectedHouseId, setSelectedHouseId] = useState<string>('');
  const [houses, setHouses] = useState<House[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill LINE Profile info
  useEffect(() => {
    if (lineProfile) {
      if (!fullName) setFullName(lineProfile.displayName || '');
    }
  }, [lineProfile, fullName]);

  // Load official houses from Supabase
  useEffect(() => {
    async function loadHouses() {
      try {
        const { data, error } = await supabase.from('houses').select('*').order('name');
        if (!error && data && data.length > 0) {
          setHouses(data);
          setSelectedHouseId(data[0].id);
        } else {
          // Default constellations
          const defaultHouses: House[] = [
            { id: '0813ba7c-87ae-40e7-87ec-44b6b7c9398b', name: 'The Sun', color_hex: '#F59E0B', total_points: 0 },
            { id: '1243951e-fce4-46d7-99fd-ce8bdd50570a', name: 'Mercury', color_hex: '#8B5CF6', total_points: 0 },
            { id: 'be7c0cef-029f-48f5-b00b-8a1b199c285a', name: 'Venus', color_hex: '#F97316', total_points: 0 },
            { id: 'fbcb44bb-abc5-471b-9874-573a0e948162', name: 'Earth', color_hex: '#10B981', total_points: 0 },
            { id: 'aa5196cb-2b9f-4faa-a06f-c1fb707fbac5', name: 'The Mars', color_hex: '#EF4444', total_points: 0 },
            { id: 'f53bc19c-6f22-4718-83d3-eeb2ca4e64e6', name: 'Jupiter', color_hex: '#6366F1', total_points: 0 },
            { id: 'f5938f7a-10e6-4bda-89ac-5e1fccf4e19c', name: 'Saturn', color_hex: '#EC4899', total_points: 0 },
            { id: 'de7ece9d-4cd6-415f-b59b-08d7fdaeaf3e', name: 'Uranus', color_hex: '#14B8A6', total_points: 0 },
            { id: '738f28ea-ed56-49cc-86d2-b3eddfb37042', name: 'Neptune', color_hex: '#06B6D4', total_points: 0 },
          ];
          setHouses(defaultHouses);
          setSelectedHouseId(defaultHouses[0].id);
        }
      } catch (err) {
        console.error('Error fetching houses:', err);
      }
    }
    loadHouses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('กรุณาระบุชื่อ-นามสกุล');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg('กรุณาระบุเบอร์โทรศัพท์สำหรับติดต่อ');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('กรุณาระบุชื่อบริษัท / องค์กร');
      return;
    }

    setIsSubmitting(true);

    try {
      const lineUserId = lineProfile?.userId || `U_LINE_${Date.now()}`;
      const pictureUrl = lineProfile?.pictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName.trim())}`;
      const selectedHouse = houses.find(h => h.id === selectedHouseId);

      const profilePayload = {
        line_user_id: lineUserId,
        display_name: fullName.trim() + (nickname ? ` (${nickname.trim()})` : ''),
        picture_url: pictureUrl,
        phone_number: phoneNumber.trim(),
        email: email.trim() || undefined,
        company_name: companyName.trim(),
        position: position.trim() || 'Executive Member',
        industry: industry,
        house_id: selectedHouseId || undefined,
        cohort_batch: 'YFTI 11',
        role: 'MEMBER' as const,
        points_balance: 50, // Welcome bonus
        xp_balance: 100,     // Welcome bonus
        attendance_rate: 100,
        updated_at: new Date().toISOString()
      };

      // 1. Save to Supabase profiles
      try {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('line_user_id', lineUserId)
          .maybeSingle();

        if (existingUser) {
          await supabase.from('profiles').update(profilePayload).eq('id', existingUser.id);
        } else {
          await supabase.from('profiles').insert(profilePayload);
        }
      } catch (dbErr) {
        console.warn('Supabase DB notice:', dbErr);
      }

      // 2. Set authenticated profile in app state & localStorage
      const authUserProfile = {
        id: lineUserId,
        ...profilePayload,
        house: selectedHouse
      };
      switchProfile(authUserProfile);

      setIsSuccess(true);
      setTimeout(() => {
        router.replace('/about');
      }, 1200);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 text-emerald-600 shadow-lg animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1E2538] mb-2">ลงทะเบียนและผูกบัญชีสำเร็จ!</h2>
        <p className="text-sm text-slate-600 mb-6">ยินดีต้อนรับสู่เครือข่าย Young FTI ELITE 11</p>
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-900 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm">
          <Award className="w-5 h-5 text-amber-500" />
          <span>ได้รับ 50 Coins & 100 XP สิทธิประโยชน์สมาชิกใหม่!</span>
        </div>
        <p className="text-xs text-slate-400 mt-6 animate-pulse">กำลังนำท่านเข้าสู่ระบบ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 px-2 animate-in fade-in duration-300">
      {/* Back to Login */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1E2538] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าเข้าสู่ระบบ</span>
        </Link>
      </div>

      {/* Main Registration Container */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-200">
        {/* Header Ribbon */}
        <div className="bg-[#1E2538] text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB7170]/20 text-[#FB7170] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Young FTI ELITE 11 Member Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ลงทะเบียนและผูกบัญชีสมาชิก
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              กรอกข้อมูลประวัติและธุรกิจของท่าน เพื่อเชื่อมต่อทำเนียบรุ่นและรับแต้มสะสมทันที
            </p>
          </div>

          {/* Slanted decoration */}
          <div
            className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 pointer-events-none"
            style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }}
          />
        </div>

        {/* LINE Identity Box */}
        <div className="p-6 sm:p-8 bg-emerald-50/60 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#06C755] bg-white shadow-sm flex items-center justify-center shrink-0">
              {lineProfile?.pictureUrl ? (
                <img src={lineProfile.pictureUrl} alt="LINE Avatar" className="w-full h-full object-cover" />
              ) : (
                <svg width="24" height="24" className="w-6 h-6 fill-[#06C755] shrink-0" viewBox="0 0 24 24">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.039 9.608.391.084.922.258 1.057.592.121.303.079.777.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.646 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.569-3.864 2.569-5.991z" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#06C755]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>เชื่อมต่อ LINE สำเร็จ</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {lineProfile?.displayName || 'LINE Account User'}
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-block px-3 py-1 bg-white border border-[#06C755]/30 text-[#06C755] rounded-full text-xs font-bold shadow-sm">
            Auto-Synced
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Section 1: ข้อมูลส่วนตัว */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1E2538] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FB7170]" />
              ข้อมูลส่วนตัว
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ชื่อ - นามสกุล (ภาษาไทย) <span className="text-[#FB7170]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น กนกวรรณ วงศ์ชัย"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ชื่อเล่น (ภาษาอังกฤษ)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="เช่น Sand"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-[#FB7170]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูลธุรกิจ */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h3 className="text-sm font-bold text-[#1E2538] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FB7170]" />
              ข้อมูลธุรกิจและองค์กร
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ชื่อบริษัท / กิจการ <span className="text-[#FB7170]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="เช่น บริษัท กลัฟเท็กซ์ จำกัด"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ตำแหน่งในธุรกิจ
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="เช่น กรรมการผู้จัดการ / CEO"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  กลุ่มอุตสาหกรรม
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ดวงดาวประจำตัว (House / Constellation)
                </label>
                <select
                  value={selectedHouseId}
                  onChange={(e) => setSelectedHouseId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
                >
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      ⭐ {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#1E2538] hover:bg-[#2B3550] text-white font-bold text-sm sm:text-base rounded-2xl transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#FB7170]" />
                  <span>ยืนยันการลงทะเบียน & เริ่มต้นใช้งาน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

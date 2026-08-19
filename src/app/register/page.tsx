'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import { supabase } from '@/lib/supabase';
import { House } from '@/types';
import { User, Phone, Mail, Building2, Briefcase, Sparkles, ShieldCheck, CheckCircle2, Loader2, Award } from 'lucide-react';
import Image from 'next/image';

const INDUSTRIES = [
  'Technology & Software',
  'Finance & Banking',
  'Retail & E-Commerce',
  'Manufacturing & Industrial',
  'Real Estate & Property',
  'Healthcare & Medical',
  'Food & Beverage',
  'Logistics & Supply Chain',
  'Energy & Utilities',
  'Media & Advertising',
  'Other / อื่นๆ'
];

export default function RegisterPage() {
  const router = useRouter();
  const { lineProfile, profile, isMockMode, refetchProfile } = useLiffAuth();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [selectedHouseId, setSelectedHouseId] = useState<string>('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

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

  // Load houses from Supabase
  useEffect(() => {
    async function loadHouses() {
      try {
        const { data, error } = await supabase.from('houses').select('*').order('name');
        if (!error && data && data.length > 0) {
          setHouses(data);
          setSelectedHouseId(data[0].id);
        } else {
          // Fallback static houses
          const staticHouses: House[] = [
            { id: '1a7f672d-edde-4b41-9875-e7fa614bd7a7', name: 'House Pegasus', color_hex: '#3B82F6', total_points: 0 },
            { id: 'd016755f-9634-468f-9e94-486f684aeeb8', name: 'House Alpha (Dragons)', color_hex: '#EF4444', total_points: 0 },
            { id: '5c4604d4-906b-424b-8e11-36182e7f4c46', name: 'House Phoenix', color_hex: '#F59E0B', total_points: 0 },
            { id: '8ef457bc-812a-40c3-9838-5ee9bfd990ff', name: 'House Titans', color_hex: '#10B981', total_points: 0 }
          ];
          setHouses(staticHouses);
          setSelectedHouseId(staticHouses[0].id);
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
      const lineUserId = lineProfile?.userId || profile?.line_user_id || `U_manual_${Date.now()}`;
      const pictureUrl = lineProfile?.pictureUrl || profile?.picture_url || '';

      const profilePayload = {
        line_user_id: lineUserId,
        display_name: fullName.trim(),
        picture_url: pictureUrl,
        phone_number: phoneNumber.trim(),
        email: email.trim() || null,
        company_name: companyName.trim(),
        position: position.trim() || 'Executive Member',
        industry: industry,
        house_id: selectedHouseId || null,
        cohort_batch: 'YFTI Cohort 1',
        role: 'MEMBER',
        points_balance: 50, // Welcome bonus
        xp_balance: 100,     // Welcome bonus
        updated_at: new Date().toISOString()
      };

      // Check if profile exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('line_user_id', lineUserId)
        .maybeSingle();

      if (existingUser) {
        // Update existing
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('id', existingUser.id);

        if (updateErr) throw updateErr;
      } else {
        // Insert new
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert(profilePayload);

        if (insertErr) throw insertErr;
      }

      setIsSuccess(true);
      if (refetchProfile) {
        await refetchProfile();
      }

      setTimeout(() => {
        router.replace('/academy');
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-[#212542] mb-1">ลงทะเบียนสำเร็จ!</h2>
        <p className="text-sm text-slate-600 mb-4">ยินดีต้อนรับสู่ YFTI Connect Cohort 1</p>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-bold">
          <Award className="w-4 h-4 text-amber-500" />
          <span>ได้รับ 50 Coins & 100 XP ต้อนรับสมาชิกใหม่!</span>
        </div>
        <p className="text-xs text-slate-400 mt-6 animate-pulse">กำลังพาเข้าสู่ระบบ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#212542] via-[#2F3563] to-[#5867E8] rounded-2xl p-5 text-white shadow-lg mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/80 bg-white/20 shrink-0 shadow-inner flex items-center justify-center">
            {lineProfile?.pictureUrl ? (
              <img src={lineProfile.pictureUrl} alt="LINE Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ยืนยันตัวตนผ่าน LINE แล้ว</span>
            </div>
            <h1 className="text-lg font-black tracking-tight leading-tight">
              ลงทะเบียนสมาชิก YFTI
            </h1>
          </div>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          กรอกข้อมูลประวัติผู้บริหารเพื่อเชื่อมโยงกับเครือข่าย YFTI Cohort 1 และรับแต้มสะสมกิจกรรมทันที
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-[#212542] mb-1.5">
            ชื่อ-นามสกุล <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="เช่น ดร. สมชาย ใจดี"
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#212542] focus:outline-none focus:border-[#5867E8] focus:ring-1 focus:ring-[#5867E8]"
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#212542] mb-1.5">
              เบอร์โทรศัพท์มือถือ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#212542] focus:outline-none focus:border-[#5867E8] focus:ring-1 focus:ring-[#5867E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212542] mb-1.5">
              อีเมลทำงาน (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="executive@company.com"
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#212542] focus:outline-none focus:border-[#5867E8] focus:ring-1 focus:ring-[#5867E8]"
              />
            </div>
          </div>
        </div>

        {/* Company & Position */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#212542] mb-1.5">
              บริษัท / องค์กร <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="ชื่อบริษัท"
                className="w-full pl-9 pr-2 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#212542] focus:outline-none focus:border-[#5867E8] focus:ring-1 focus:ring-[#5867E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212542] mb-1.5">
              ตำแหน่ง (Position)
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="CEO / MD"
                className="w-full pl-9 pr-2 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#212542] focus:outline-none focus:border-[#5867E8] focus:ring-1 focus:ring-[#5867E8]"
              />
            </div>
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-xs font-bold text-[#212542] mb-1.5">
            กลุ่มอุตสาหกรรม (Industry)
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#212542] focus:outline-none focus:border-[#5867E8] focus:ring-1 focus:ring-[#5867E8]"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* House Selection */}
        <div>
          <label className="block text-xs font-bold text-[#212542] mb-1.5">
            เลือกสังกัดบ้าน / House ประจำรุ่น
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {houses.map((h) => {
              const isSelected = selectedHouseId === h.id;
              return (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => setSelectedHouseId(h.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#212542] bg-white ring-2 ring-[#212542] shadow-sm'
                      : 'border-[#E2E8F0] bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-sm"
                      style={{ backgroundColor: h.color_hex }}
                    />
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#212542]" />
                    )}
                  </div>
                  <span className="text-xs font-black text-[#212542] leading-tight">
                    {h.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 pb-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#212542] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#2F3563] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ยืนยันการลงทะเบียน & เริ่มใช้งาน</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, yftiParticipants } from '@/lib/mockData';
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
  Users
} from 'lucide-react';
import { WebLoginModal } from '@/components/layout/WebLoginModal';

export default function ProfilePage() {
  const { profile, updateRole, logout } = useLiffAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  if (!profile) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        <p className="font-bold text-base text-slate-700">ไม่พบข้อมูลโปรไฟล์</p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="mt-4 px-5 py-2.5 bg-[#1E2538] text-white rounded-xl text-xs font-bold"
        >
          เข้าสู่ระบบ
        </button>
        <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10 pb-12">
      {/* Profile Header Banner */}
      <div className="bg-[#1E2538] text-white p-6 sm:p-10 rounded-3xl border border-[#2A334E] shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="relative shrink-0">
          {profile.picture_url ? (
            <img
              src={profile.picture_url}
              alt={profile.display_name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white/20 shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.display_name;
              }}
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-2xl text-white">
              {profile.display_name.charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 px-3 py-1 bg-[#FB7170] rounded-full text-[10px] text-white font-black shadow-md uppercase">
            YFTI 11
          </span>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">{profile.display_name}</h1>
            <span className="text-[10px] font-bold bg-[#FB7170] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {profile.role}
            </span>
            {profile.house && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                {profile.house.name}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#FB7170] font-bold">{profile.position || 'Executive Member'}</p>
          <p className="text-xs text-slate-300 flex items-center justify-center md:justify-start gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {profile.company_name || 'Young FTI ELITE 11'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#FB7170]" />
            <span>สลับผู้ใช้</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-3xl text-center shadow-card space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#FB7170] flex items-center justify-center mx-auto mb-2">
            <Coins className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-bold">Reward Points</p>
          <p className="text-2xl font-black text-[#1E2538] font-mono">{profile.points_balance}</p>
          <p className="text-[10px] text-slate-400">ใช้แลกสิทธิประโยชน์ในโครงการ</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl text-center shadow-card space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-bold">Executive XP</p>
          <p className="text-2xl font-black text-[#1E2538] font-mono">{profile.xp_balance}</p>
          <p className="text-[10px] text-slate-400">สะสมประสบการณ์ประจำรุ่น</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl text-center shadow-card space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-bold">Attendance Rate</p>
          <p className="text-2xl font-black text-[#1E2538] font-mono">{profile.attendance_rate}%</p>
          <p className="text-[10px] text-emerald-600 font-bold">✓ ผ่านเกณฑ์ขั้นต่ำ 80%</p>
        </div>
      </div>

      {/* Contact & Business Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
        <h2 className="text-sm font-extrabold text-[#1E2538] uppercase tracking-wider border-b border-slate-100 pb-3">
          ข้อมูลการติดต่อและธุรกิจ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">อีเมล</span>
              <span className="font-bold text-slate-800">{profile.email || 'yfti11@yfticonnect.com'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">เบอร์โทรศัพท์</span>
              <span className="font-bold text-slate-800 font-mono">{profile.phone_number || '082-269-9962'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">กลุ่มอุตสาหกรรม</span>
              <span className="font-bold text-slate-800">{profile.industry || 'เทคโนโลยี'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">รุ่นที่เข้าร่วม</span>
              <span className="font-bold text-slate-800">{profile.cohort_batch || 'YFTI Cohort 11'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#1E2538] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#FB7170]" />
            สลับสิทธิ์จำลอง (Role Simulator)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">DEVELOPER / DEMO</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN'] as const).map((roleOption) => (
            <button
              key={roleOption}
              onClick={() => updateRole(roleOption)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                profile.role === roleOption
                  ? 'bg-[#1E2538] text-white border-[#1E2538] shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-[#1E2538]'
              }`}
            >
              {roleOption === 'SUPER_ADMIN' ? 'Super Admin' : roleOption === 'HOUSE_ADMIN' ? 'House Admin' : 'Member'}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4 text-slate-400" />
        ออกจากระบบ
      </button>

      <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

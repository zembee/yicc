'use client';

import React from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
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
  Building2
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, updateRole, logout } = useLiffAuth();

  if (!profile) {
    return (
      <div className="p-6 text-center text-slate-500">
        ไม่พบข้อมูลโปรไฟล์
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header Profile Banner (Deep Navy Brand Card) */}
      <div className="bg-[#181B34] text-white p-5 rounded-2xl border border-[#2A2E54] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        <div className="relative mb-2.5">
          {profile.picture_url ? (
            <img
              src={profile.picture_url}
              alt={profile.display_name}
              className="w-18 h-18 rounded-2xl object-cover border-2 border-white shadow-lg"
            />
          ) : (
            <div className="w-18 h-18 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-white">
              {profile.display_name.charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-[#FB7170] rounded-full text-[9px] text-white font-bold shadow">
            ELITE 11
          </span>
        </div>

        <h1 className="text-base font-black text-white">{profile.display_name}</h1>
        <p className="text-xs text-[#FB7170] font-semibold mt-0.5">{profile.position}</p>
        <p className="text-xs text-slate-300">{profile.company_name}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-3">
          {profile.house && (
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-white/10 text-white border border-white/15"
            >
              {profile.house.name}
            </span>
          )}
          <span className="text-[10px] font-bold bg-[#FB7170] text-white px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {profile.role}
          </span>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
          <Coins className="w-4 h-4 text-[#FB7170] mx-auto mb-1" />
          <p className="text-[10px] text-slate-500 font-medium">Coins</p>
          <p className="text-sm font-bold text-[#181B34]">{profile.points_balance}</p>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
          <Award className="w-4 h-4 text-[#FB7170] mx-auto mb-1" />
          <p className="text-[10px] text-slate-500 font-medium">Total XP</p>
          <p className="text-sm font-bold text-[#181B34]">{profile.xp_balance}</p>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
          <GraduationCap className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <p className="text-[10px] text-slate-500 font-medium">Attendance</p>
          <p className="text-sm font-bold text-[#181B34]">{profile.attendance_rate}%</p>
        </div>
      </div>

      {/* Details List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-sm">
        <h2 className="text-xs font-bold text-[#181B34] uppercase tracking-wider mb-2">ข้อมูลการติดต่อและธุรกิจ</h2>

        <div className="flex items-center gap-3 text-xs text-slate-700 py-1 border-b border-slate-100">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500">อีเมล:</span>
          <span className="font-semibold text-[#181B34] ml-auto">{profile.email || 'panupong@techcorp.co'}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-700 py-1 border-b border-slate-100">
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500">เบอร์โทรศัพท์:</span>
          <span className="font-semibold text-[#181B34] ml-auto">{profile.phone_number || '081-234-5678'}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-700 py-1">
          <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500">อุตสาหกรรม:</span>
          <span className="font-semibold text-[#181B34] ml-auto">{profile.industry || 'Technology & Software'}</span>
        </div>
      </div>

      {/* Role Simulator (Dev/Demo Switcher) */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#181B34] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#FB7170]" />
            สลับสิทธิ์จำลอง (Role Simulator)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">DEMO</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(['MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN'] as const).map((roleOption) => (
            <button
              key={roleOption}
              onClick={() => updateRole(roleOption)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
                profile.role === roleOption
                  ? 'bg-[#181B34] text-white border-[#181B34]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-[#181B34]'
              }`}
            >
              {roleOption === 'SUPER_ADMIN' ? 'Super Admin' : roleOption === 'HOUSE_ADMIN' ? 'House Admin' : 'Member'}
            </button>
          ))}
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4 text-slate-400" />
        ออกจากระบบ
      </button>
    </div>
  );
}


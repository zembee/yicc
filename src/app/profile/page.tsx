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
  RefreshCw
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, updateRole, logout } = useLiffAuth();

  if (!profile) {
    return (
      <div className="p-6 text-center text-[#6B7280]">
        ไม่พบข้อมูลโปรไฟล์
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header Profile Card */}
      <div className="bg-[#212542] text-white p-6 rounded-3xl shadow-[0_10px_25px_rgba(33,37,66,0.15)] flex flex-col items-center text-center relative overflow-hidden">
        {/* House Color Accent */}
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: profile.house?.color_hex || '#FB7170' }}
        />

        <div className="relative mb-3">
          {profile.picture_url ? (
            <img
              src={profile.picture_url}
              alt={profile.display_name}
              className="w-20 h-20 rounded-3xl object-cover border-2 border-white shadow-2xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-[#DBDFFF] flex items-center justify-center font-bold text-lg text-[#212542]">
              {profile.display_name.charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-[#FB7170] rounded-full text-[10px] text-white font-black shadow">
            LVL 4
          </span>
        </div>

        <h2 className="text-base font-extrabold text-white">{profile.display_name}</h2>
        <p className="text-xs text-[#DBDFFF] font-bold mt-0.5">{profile.position}</p>
        <p className="text-xs text-white/80">{profile.company_name}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-3">
          {profile.house && (
            <span
              className="text-[10px] font-bold px-3 py-1 rounded-xl bg-white/15 text-white border border-white/20"
            >
              {profile.house.name}
            </span>
          )}
          <span className="text-[10px] font-bold bg-[#DBDFFF] text-[#212542] px-3 py-1 rounded-xl flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {profile.role}
          </span>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-[#EEEEEE] p-3.5 rounded-2xl text-center shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
          <Coins className="w-4 h-4 text-[#FB7170] mx-auto mb-1" />
          <p className="text-[10px] text-[#6B7280]">Coins</p>
          <p className="text-sm font-extrabold text-[#212542]">{profile.points_balance}</p>
        </div>

        <div className="bg-white border border-[#EEEEEE] p-3.5 rounded-2xl text-center shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
          <Award className="w-4 h-4 text-[#5867E8] mx-auto mb-1" />
          <p className="text-[10px] text-[#6B7280]">Total XP</p>
          <p className="text-sm font-extrabold text-[#212542]">{profile.xp_balance}</p>
        </div>

        <div className="bg-white border border-[#EEEEEE] p-3.5 rounded-2xl text-center shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
          <GraduationCap className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <p className="text-[10px] text-[#6B7280]">Attendance</p>
          <p className="text-sm font-extrabold text-[#212542]">{profile.attendance_rate}%</p>
        </div>
      </div>

      {/* Role Simulator */}
      <div className="bg-white border border-[#EEEEEE] p-4 rounded-3xl shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-[#212542] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#5867E8]" />
            สลับโหมดจำลองสิทธิ์ (Role Switcher)
          </span>
          <span className="text-[10px] text-[#9CA3AF]">Dev Tool</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN'] as const).map((roleOption) => (
            <button
              key={roleOption}
              onClick={() => updateRole(roleOption)}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                profile.role === roleOption
                  ? 'bg-[#212542] text-white border-[#212542]'
                  : 'bg-[#F8F9FC] text-[#6B7280] border-[#EEEEEE] hover:text-[#212542]'
              }`}
            >
              {roleOption === 'SUPER_ADMIN' ? 'Super Admin' : roleOption === 'HOUSE_ADMIN' ? 'House Admin' : 'Member'}
            </button>
          ))}
        </div>
      </div>

      {/* Details List */}
      <div className="bg-white border border-[#EEEEEE] rounded-3xl p-4 space-y-3 shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
        <h3 className="text-xs font-bold text-[#212542] uppercase tracking-wider">ข้อมูลการติดต่อและธุรกิจ</h3>

        <div className="flex items-center gap-3 text-xs text-[#292929] py-1.5 border-b border-[#EEEEEE]">
          <Mail className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <span className="text-[#6B7280]">อีเมล:</span>
          <span className="font-semibold text-[#212542] ml-auto">{profile.email || 'panupong@techcorp.co'}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#292929] py-1.5 border-b border-[#EEEEEE]">
          <Phone className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <span className="text-[#6B7280]">เบอร์โทรศัพท์:</span>
          <span className="font-semibold text-[#212542] ml-auto">{profile.phone_number || '081-234-5678'}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#292929] py-1.5">
          <Briefcase className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <span className="text-[#6B7280]">อุตสาหกรรม:</span>
          <span className="font-semibold text-[#212542] ml-auto">{profile.industry || 'Technology & AI'}</span>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full py-3.5 rounded-2xl bg-[#FFF5F5] hover:bg-[#FFD7D7]/40 text-[#FB7170] text-xs font-extrabold border border-[#FFD7D7] transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        ออกจากระบบ
      </button>
    </div>
  );
}

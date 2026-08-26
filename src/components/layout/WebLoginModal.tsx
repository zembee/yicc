'use client';

import React, { useState } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { yftiParticipants, mockCurrentUser } from '@/lib/mockData';
import { UserProfile } from '@/types';
import { Lock, User, KeyRound, Shield, CheckCircle2, AlertCircle, X, Users } from 'lucide-react';
import Image from 'next/image';

interface WebLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebLoginModal: React.FC<WebLoginModalProps> = ({ isOpen, onClose }) => {
  const { profile, loginWithCredentials, loginWithLine, switchProfile, logout } = useLiffAuth();
  const [username, setUsername] = useState('yfti11');
  const [password, setPassword] = useState('yfti@11');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSwitchList, setShowSwitchList] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const success = loginWithCredentials(username, password);
    if (success) {
      setSuccessMsg('เข้าสู่ระบบสำเร็จ!');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 700);
    } else {
      setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ลองใช้ yfti11 / yfti@11)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#1E2538] text-white px-6 py-6 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 mx-auto mb-3 bg-white rounded-2xl p-2 shadow-md flex items-center justify-center">
            <Image 
              src="/YFTI-11-Logo.jpg" 
              alt="YFTI 11" 
              width={42} 
              height={42} 
              className="object-contain"
            />
          </div>
          <h3 className="text-lg font-black tracking-tight text-white">Young FTI ELITE 11</h3>
          <p className="text-xs text-[#FB7170] font-semibold mt-0.5">เข้าสู่ระบบสำหรับสมาชิกและผู้ดูแล</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {profile && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={profile.picture_url || 'https://yfticonnect.com/wp-content/uploads/2025/07/YFTI-11-Logo.webp'}
                  alt={profile.display_name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs text-slate-500 font-medium">เข้าสู่ระบบในชื่อ</p>
                  <p className="text-sm font-bold text-[#1E2538]">{profile.display_name}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {profile.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition"
              >
                ออกจากระบบ
              </button>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!showSwitchList ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yfti11 หรือ YFTI Admin"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1E2538] focus:bg-white outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รหัสผ่าน (Password)</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="yfti@11"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1E2538] focus:bg-white outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#1E2538] hover:bg-[#2A334E] text-white font-bold text-sm rounded-xl shadow-md transition"
                >
                  เข้าสู่ระบบ
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowSwitchList(true)}
                  className="text-xs font-bold text-slate-500 hover:text-[#1E2538] flex items-center justify-center gap-1.5 mx-auto"
                >
                  <Users className="w-3.5 h-3.5 text-[#FB7170]" />
                  <span>สลับดูในมุมมองสมาชิกคนอื่น (122 ท่าน)</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700">เลือกโปรไฟล์สมาชิกที่ต้องการจำลอง:</h4>
                <button
                  onClick={() => setShowSwitchList(false)}
                  className="text-xs font-bold text-[#FB7170] hover:underline"
                >
                  ย้อนกลับ
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {yftiParticipants.slice(0, 30).map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const userObj: UserProfile = {
                        id: String(p.id),
                        line_user_id: `U_SIM_${p.id}`,
                        display_name: `${p.name_thai} (${p.nickname_eng || 'Member'})`,
                        picture_url: p.profile_picture_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.name_thai,
                        phone_number: p.tel_number,
                        company_name: p.company_name_thai,
                        position: p.business_position,
                        industry: p.industrial_groups_label,
                        cohort_batch: 'YFTI 11',
                        house_id: p.star_group || 'the_mars',
                        role: idx === 0 ? 'SUPER_ADMIN' : 'MEMBER',
                        points_balance: 320,
                        xp_balance: 1200,
                        attendance_rate: 90,
                      };
                      switchProfile(userObj);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-left transition border border-slate-100"
                  >
                    <img
                      src={p.profile_picture_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.name_thai}
                      alt={p.name_thai}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.name_thai} ({p.nickname_eng})</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.company_name_thai || p.industrial_groups_label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

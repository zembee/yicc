'use client';

import React, { useState, useMemo } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { yftiParticipants, mockHouses } from '@/lib/mockData';
import { UserProfile } from '@/types';
import { User, KeyRound, CheckCircle2, AlertCircle, X, Users, Search } from 'lucide-react';
import Image from 'next/image';

interface WebLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebLoginModal: React.FC<WebLoginModalProps> = ({ isOpen, onClose }) => {
  const { profile, loginWithCredentials, switchProfile, logout } = useLiffAuth();
  const [username, setUsername] = useState('yfti11');
  const [password, setPassword] = useState('yfti@11');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSwitchList, setShowSwitchList] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return yftiParticipants;
    return yftiParticipants.filter(
      (p) =>
        (p.name_thai || '').toLowerCase().includes(q) ||
        (p.nickname_eng || '').toLowerCase().includes(q) ||
        (p.company_name_thai || '').toLowerCase().includes(q) ||
        String(p.id).includes(q)
    );
  }, [memberSearch]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-[28px] shadow-[0_24px_60px_rgba(9,13,24,0.28)] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Obsidian & Satin Gold Header */}
        <div className="relative luxury-stage text-white px-6 py-6 text-center overflow-hidden">
          <img
            src="/images/planets/saturn.webp?v=2"
            alt=""
            aria-hidden="true"
            className="absolute -left-6 -bottom-6 w-28 h-28 object-contain opacity-[0.16] pointer-events-none select-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative z-10 w-14 h-14 mx-auto mb-3 bg-white rounded-2xl p-2 shadow-md ring-1 ring-[#DFC27D]/40 flex items-center justify-center">
            <Image
              src="/YFTI-11-Logo.jpg"
              alt="YFTI 11"
              width={42}
              height={42}
              className="object-contain"
            />
          </div>
          <h3 className="relative z-10 text-lg tracking-tight text-white">
            <span className="font-extrabold">YOUNG FTI</span>{' '}
            <span className="font-light text-[#ECD28E]">ELITE 11</span>
          </h3>
          <p className="relative z-10 text-xs text-[#F5E6BE] font-medium mt-0.5">
            เข้าสู่ระบบสำหรับสมาชิกและผู้ดูแล
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {profile && (
            <div className="bg-[#FAF8F4] rounded-2xl p-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={profile.picture_url || 'https://yfticonnect.com/wp-content/uploads/2025/07/YFTI-11-Logo.webp'}
                  alt={profile.display_name}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-[#DFC27D]/40 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">เข้าสู่ระบบในชื่อ</p>
                  <p className="text-xs sm:text-sm font-bold text-[#161C2C] truncate">{profile.display_name}</p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#FBF6E8] text-[#9A7320] font-bold">
                    {profile.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 transition shrink-0"
              >
                ออกจากระบบ
              </button>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!showSwitchList ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อผู้ใช้งาน (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yfti11 หรือ YFTI Admin"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F4] rounded-xl text-sm font-medium text-[#161C2C] focus:ring-2 focus:ring-[#C5A059]/50 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">รหัสผ่าน (Password)</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="yfti@11"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F4] rounded-xl text-sm font-medium text-[#161C2C] focus:ring-2 focus:ring-[#C5A059]/50 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-full luxury-gold-btn font-bold text-sm transition"
                >
                  เข้าสู่ระบบ
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowSwitchList(true)}
                  className="text-xs font-bold text-slate-500 hover:text-[#161C2C] flex items-center justify-center gap-1.5 mx-auto transition"
                >
                  <Users className="w-3.5 h-3.5 text-[#B18A3B]" />
                  <span>สลับดูในมุมมองสมาชิกคนอื่น (122 ท่าน)</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#161C2C]">
                  เลือกโปรไฟล์สมาชิกที่ต้องการจำลอง ({filteredMembers.length} ท่าน)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowSwitchList(false)}
                  className="text-xs font-bold text-[#B18A3B] hover:underline"
                >
                  ย้อนกลับ
                </button>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, ชื่อเล่น, บริษัท หรือรหัสสมาชิก..."
                  className="w-full pl-8 pr-3 py-2 bg-[#FAF8F4] rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {filteredMembers.map((p, idx) => {
                  const normalizedHouseId = (p.star_group || 'the_mars').replace(/-/g, '_');
                  const matchedHouse = mockHouses.find((h) => h.id === normalizedHouseId) || mockHouses[0];
                  return (
                    <button
                      key={p.id}
                      type="button"
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
                          house_id: matchedHouse.id,
                          house: matchedHouse,
                          role: String(p.id) === '3296' || idx === 0 ? 'SUPER_ADMIN' : 'MEMBER',
                          approval_status: 'APPROVED',
                          points_balance: 320,
                          xp_balance: 1200,
                          attendance_rate: 90,
                        };
                        switchProfile(userObj);
                        onClose();
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FAF8F4] text-left transition"
                    >
                      <img
                        src={p.profile_picture_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.name_thai}
                        alt={p.name_thai}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#161C2C] truncate">
                          {p.name_thai} ({p.nickname_eng})
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {matchedHouse.name} • {p.company_name_thai || p.industrial_groups_label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

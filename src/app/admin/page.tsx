'use client';

import React, { useState } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { QrScannerModal } from '@/components/admin/QrScannerModal';
import { MissionReviewList } from '@/components/admin/MissionReviewList';
import { 
  QrCode, 
  Users, 
  Award,
  AlertCircle 
} from 'lucide-react';

export default function AdminPage() {
  const { profile } = useLiffAuth();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastCheckinResult, setLastCheckinResult] = useState<any | null>(null);

  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'HOUSE_ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF5F5] border border-[#FFD7D7] flex items-center justify-center text-[#FB7170] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold text-[#212542] mb-1">Access Restricted</h2>
        <p className="text-xs text-[#6B7280] max-w-xs leading-relaxed">
          หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (House Admin / Super Admin) เท่านั้น
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#212542] bg-[#DBDFFF] px-2.5 py-0.5 rounded-full">
            Admin Console
          </span>
          <h2 className="text-base font-extrabold text-[#212542] mt-1.5">Staff & Event Operations</h2>
        </div>
        <span className="text-xs bg-white border border-[#EEEEEE] text-[#212542] font-extrabold px-2.5 py-1 rounded-xl shadow-sm">
          {profile.role}
        </span>
      </div>

      {/* Quick QR Scanner Trigger Banner (Navy Card with Coral Button) */}
      <div className="bg-[#212542] rounded-3xl p-5 shadow-[0_10px_25px_rgba(33,37,66,0.15)] text-white flex flex-col gap-3 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FB7170] rounded-full blur-3xl opacity-25 pointer-events-none" />

        <div className="relative z-10">
          <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 text-[#DBDFFF] px-2 py-0.5 rounded-md">
            Fast Check-in
          </span>
          <h3 className="text-lg font-extrabold text-white mt-1.5">เปิดกล้องสแกน QR หน้างาน</h3>
          <p className="text-xs text-white/80 font-medium">
            สแกน Member Token เช็คชื่อและแจกเหรียญ/XP เข้าบัญชีทันที
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="w-full py-3 rounded-2xl bg-[#FB7170] hover:bg-[#e85857] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] relative z-10"
        >
          <QrCode className="w-4 h-4 text-white" />
          เริ่มสแกน QR Code สมาชิก
        </button>
      </div>

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#EEEEEE] p-4 rounded-3xl shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
          <div className="flex items-center gap-2 text-[#6B7280] text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-[#5867E8]" />
            <span>ยอดเช็คชื่อล่าสุด</span>
          </div>
          <p className="text-lg font-extrabold text-[#212542]">42 / 50 คน</p>
        </div>

        <div className="bg-white border border-[#EEEEEE] p-4 rounded-3xl shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
          <div className="flex items-center gap-2 text-[#6B7280] text-xs mb-1">
            <Award className="w-3.5 h-3.5 text-[#FB7170]" />
            <span>แต้มที่แจกวันนี้</span>
          </div>
          <p className="text-lg font-extrabold text-[#FB7170]">2,100 pts</p>
        </div>
      </div>

      {/* Mission Review Section */}
      <MissionReviewList />

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={(data) => {
          setLastCheckinResult(data);
        }}
      />
    </div>
  );
}

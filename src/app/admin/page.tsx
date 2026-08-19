'use client';

import React, { useState } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { QrScannerModal } from '@/components/admin/QrScannerModal';
import { MissionReviewList } from '@/components/admin/MissionReviewList';
import { 
  QrCode, 
  Users, 
  Award,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function AdminPage() {
  const { profile } = useLiffAuth();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastCheckinResult, setLastCheckinResult] = useState<any | null>(null);

  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'HOUSE_ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#FB7170] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-bold text-[#181B34] mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (House Admin / Super Admin) เท่านั้น
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#FB7170] bg-rose-50 px-2 py-0.5 rounded border border-rose-100 mb-1">
            <ShieldCheck className="w-3 h-3" />
            Operations Console
          </div>
          <h1 className="text-base font-extrabold text-[#181B34]">Staff & Event Manager</h1>
        </div>
        <span className="text-xs bg-slate-100 border border-slate-200 text-[#181B34] font-bold px-2.5 py-1 rounded-lg">
          {profile.role}
        </span>
      </div>

      {/* Quick QR Scanner Trigger (Navy Card with Coral Button) */}
      <div className="bg-[#181B34] rounded-2xl p-4 shadow-sm border border-[#2A2E54] text-white flex flex-col gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 text-[#DBDFFF] px-2 py-0.5 rounded">
            Fast Check-in
          </span>
          <h2 className="text-sm font-bold text-white mt-1.5">เปิดกล้องสแกน QR หน้างาน</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            สแกน Member Token เช็คชื่อและแจกเหรียญ/XP เข้าบัญชีอัตโนมัติ
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="w-full py-2.5 rounded-xl bg-[#FB7170] hover:bg-[#e85857] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
        >
          <QrCode className="w-4 h-4 text-white" />
          เริ่มสแกน QR Code สมาชิก
        </button>
      </div>

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-[#181B34]" />
            <span>ยอดเช็คชื่อล่าสุด</span>
          </div>
          <p className="text-base font-bold text-[#181B34]">42 / 50 คน</p>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Award className="w-3.5 h-3.5 text-[#FB7170]" />
            <span>แต้มที่แจกวันนี้</span>
          </div>
          <p className="text-base font-bold text-[#FB7170]">2,100 pts</p>
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


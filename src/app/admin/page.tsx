'use client';

import React, { useState, useEffect } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { QrScannerModal } from '@/components/admin/QrScannerModal';
import { MissionReviewList } from '@/components/admin/MissionReviewList';
import { 
  QrCode, 
  Users, 
  Award,
  AlertCircle,
  ShieldCheck,
  Plus,
  CheckCircle2,
  XCircle,
  FileCheck,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface EventRegistrationRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  applicantName: string;
  applicantPhone?: string;
  ticketType: string;
  amount: number;
  slipName: string;
  slipDataUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function AdminPage() {
  const { profile } = useLiffAuth();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastCheckinResult, setLastCheckinResult] = useState<any | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistrationRecord[]>([]);
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'general' | 'course'>('course');
  const [newLocation, setNewLocation] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-12-25');
  const [newFeeMember, setNewFeeMember] = useState('1500');
  const [newFeeGuest, setNewFeeGuest] = useState('2500');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
        if (Array.isArray(saved)) setRegistrations(saved);
      } catch {}
    }
  }, []);

  const handleUpdateRegStatus = (regId: string, status: 'APPROVED' | 'REJECTED') => {
    setRegistrations((prev) => {
      const next = prev.map((r) => (r.id === regId ? { ...r, status } : r));
      if (typeof window !== 'undefined') {
        localStorage.setItem('yfti_event_registrations', JSON.stringify(next));
      }
      return next;
    });
  };

  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'HOUSE_ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-12 h-12 rounded-xl bg-[#FBF6EC] border border-[#EFE2C2] flex items-center justify-center text-[#B38728] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-bold text-[#1E2538] mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (House Admin / Super Admin) เท่านั้น
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#9A7320] bg-[#FBF6EC] px-2.5 py-0.5 rounded-full border border-[#EFE2C2] mb-1">
            <ShieldCheck className="w-3 h-3 text-[#B38728]" />
            Operations Console
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#1E2538]">Staff & Event Manager</h1>
        </div>
        <span className="text-xs bg-slate-100 border border-slate-200 text-[#1E2538] font-bold px-2.5 py-1 rounded-lg shrink-0">
          {profile.role}
        </span>
      </div>

      {/* Quick QR Scanner Trigger (Navy Card with Gold Button) */}
      <div className="bg-[#1E2538] rounded-2xl p-4 shadow-sm border border-[#2A334E] text-white flex flex-col gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 text-[#E5C158] px-2 py-0.5 rounded">
            Fast Check-in
          </span>
          <h2 className="text-sm font-bold text-white mt-1.5">เปิดกล้องสแกน QR หน้างาน</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            สแกน Member Token เช็คชื่อและแจกเหรียญ/XP เข้าบัญชีอัตโนมัติ
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="w-full py-2.5 rounded-xl bg-[#C59B38] hover:bg-[#b58b2e] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
        >
          <QrCode className="w-4 h-4 text-white" />
          เริ่มสแกน QR Code สมาชิก
        </button>
      </div>

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-[#1E2538]" />
            <span>ยอดเช็คชื่อล่าสุด</span>
          </div>
          <p className="text-base font-bold text-[#1E2538]">42 / 50 คน</p>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Award className="w-3.5 h-3.5 text-[#B38728]" />
            <span>แต้มที่แจกวันนี้</span>
          </div>
          <p className="text-base font-bold text-[#9A7320]">2,100 pts</p>
        </div>
      </div>

      {/* Create Event / Course Button */}
      <button
        onClick={() => setIsCreateEventOpen(true)}
        className="w-full py-3 rounded-2xl bg-white border border-slate-200 hover:border-[#C59B38] text-[#1E2538] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Plus className="w-4 h-4 text-[#B38728]" />
        <span>สร้างกิจกรรม / คอร์สเรียนใหม่พร้อมแบบฟอร์มสมัคร</span>
      </button>

      {/* Event Registration & Slip Approval Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#1E2538] flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#B38728]" />
            <span>อนุมัติการสมัคร &amp; สลิปโอนเงิน</span>
          </h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]">
            รอตรวจ {registrations.filter((r) => r.status === 'PENDING').length} รายการ
          </span>
        </div>

        {registrations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">ยังไม่มีรายการสมัครเข้าร่วมกิจกรรม</p>
        ) : (
          <div className="space-y-2.5">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-[#1E2538]">{reg.eventTitle}</p>
                  <p className="text-[11px] text-slate-600">
                    {reg.applicantName} • {reg.ticketType} (฿{reg.amount.toLocaleString()})
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[10px] text-slate-400">สลิป: {reg.slipName} • {reg.createdAt}</p>
                    {reg.slipDataUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewSlipUrl(reg.slipDataUrl!)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>ดูรูปสลิป</span>
                      </button>
                    )}
                  </div>
                </div>

                {reg.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateRegStatus(reg.id, 'APPROVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติ
                    </button>
                    <button
                      onClick={() => handleUpdateRegStatus(reg.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> ปฏิเสธ
                    </button>
                  </div>
                ) : (
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      reg.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {reg.status === 'APPROVED' ? 'อนุมัติแล้ว (ออกบัตรแล้ว)' : 'ปฏิเสธแล้ว'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mission Review Section */}
      <MissionReviewList />

      {/* Create Event Modal */}
      {isCreateEventOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setIsCreateEventOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCreateEventOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-[#1E2538]">สร้างกิจกรรม / คอร์สเรียนใหม่</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                const dateBase = newEventDate || '2026-12-25';
                const parsedDate = new Date(`${dateBase}T09:00:00`);
                const formattedDateText = Number.isNaN(parsedDate.getTime())
                  ? dateBase
                  : parsedDate.toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });
                const newEv = {
                  id: `e-custom-${Date.now()}`,
                  slug: `custom-${Date.now()}`,
                  title: newTitle.trim(),
                  description: `กิจกรรมสร้างโดยแอดมิน (${newLocation || 'FTI Tower'}) เปิดรับสมัครพร้อมระบบแนบสลิปโอนเงิน`,
                  location_name: newLocation || 'สภาอุตสาหกรรมแห่งประเทศไทย (FTI Tower)',
                  start_time: new Date(`${dateBase}T09:00:00`).toISOString(),
                  end_time: new Date(`${dateBase}T17:00:00`).toISOString(),
                  reward_points: 100,
                  reward_xp: 250,
                  is_mandatory: false,
                  status: 'UPCOMING',
                  event_type: newType,
                  fee_member: Number(newFeeMember) || 1500,
                  fee_guest: Number(newFeeGuest) || 2500,
                  image_url: '/images/home/event_training.jpg',
                  published_date_text: formattedDateText,
                };
                if (typeof window !== 'undefined') {
                  const existing = JSON.parse(localStorage.getItem('yfti_custom_events') || '[]');
                  existing.unshift(newEv);
                  localStorage.setItem('yfti_custom_events', JSON.stringify(existing));
                }
                setNewTitle('');
                setIsCreateEventOpen(false);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="ชื่อกิจกรรม / คอร์สเรียน"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'general' | 'course')}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                >
                  <option value="course">คอร์สเรียน</option>
                  <option value="general">กิจกรรมทั่วไป</option>
                </select>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
              </div>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="สถานที่จัดงาน"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={newFeeMember}
                  onChange={(e) => setNewFeeMember(e.target.value)}
                  placeholder="ค่าสมัครสมาชิก (บาท)"
                  className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
                <input
                  type="number"
                  value={newFeeGuest}
                  onChange={(e) => setNewFeeGuest(e.target.value)}
                  placeholder="ค่าสมัครบุคคลทั่วไป (บาท)"
                  className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1E2538] text-white text-xs font-bold hover:bg-[#2B3550] transition"
              >
                บันทึกและเปิดรับสมัคร
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slip Preview Modal */}
      {previewSlipUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setPreviewSlipUrl(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-4 space-y-3 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-[#1E2538]">หลักฐานการโอนเงิน (สลิป)</h4>
              <button
                onClick={() => setPreviewSlipUrl(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={previewSlipUrl}
              alt="สลิปโอนเงิน"
              className="w-full max-h-[65vh] object-contain rounded-2xl border border-slate-200 bg-slate-50"
            />
          </div>
        </div>
      )}

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


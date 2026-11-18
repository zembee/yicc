'use client';

import React, { useState, useEffect } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockEvents, mockPrivileges, yftiParticipants } from '@/lib/mockData';
import { QrScannerModal } from '@/components/admin/QrScannerModal';
import { MissionReviewList } from '@/components/admin/MissionReviewList';
import { MemberApprovalList } from '@/components/admin/MemberApprovalList';
import { PrivilegeManager } from '@/components/admin/PrivilegeManager';
import { EventManager } from '@/components/admin/EventManager';
import {
  QrCode,
  Users,
  Award,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck,
  Image as ImageIcon,
  X,
  LayoutDashboard,
  UserCheck,
  Calendar,
  Gift,
  Target,
  ChevronRight,
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

type AdminTab = 'overview' | 'members' | 'events' | 'privileges' | 'missions';

export default function AdminPage() {
  const { profile } = useLiffAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastCheckinResult, setLastCheckinResult] = useState<any | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistrationRecord[]>([]);
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  const [pendingMembersCount, setPendingMembersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(mockEvents.length);
  const [privilegesCount, setPrivilegesCount] = useState(mockPrivileges.length);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
        if (Array.isArray(saved)) setRegistrations(saved);
      } catch {}
    }

    fetch('/api/members/applications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.applications)) {
          const count = data.applications.filter(
            (a: any) => a.role === 'PENDING' && a.approval_status !== 'REJECTED'
          ).length;
          setPendingMembersCount(count);
        }
      })
      .catch(() => {});

    fetch('/api/events')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.events)) {
          setEventsCount(data.events.length);
        }
      })
      .catch(() => {});

    fetch('/api/privileges')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.privileges)) {
          setPrivilegesCount(data.privileges.length);
        }
      })
      .catch(() => {});
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

  const pendingEventRegs = registrations.filter((r) => r.status === 'PENDING').length;

  const tabs: { key: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { key: 'overview', label: 'ภาพรวม', icon: LayoutDashboard },
    { key: 'members', label: 'สมาชิก', icon: UserCheck, badge: pendingMembersCount },
    { key: 'events', label: 'Events', icon: Calendar, badge: pendingEventRegs },
    { key: 'privileges', label: 'Privileges', icon: Gift },
    { key: 'missions', label: 'ภารกิจ & QR', icon: Target },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-4 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#9A7320] bg-[#FBF6EC] px-2.5 py-0.5 rounded-full border border-[#EFE2C2] mb-1">
            <ShieldCheck className="w-3 h-3 text-[#B38728]" />
            YFTI Admin Panel
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#1E2538]">
            ศูนย์จัดการระบบ Young FTI ELITE 11
          </h1>
        </div>
        <span className="text-xs bg-slate-100 border border-slate-200 text-[#1E2538] font-bold px-2.5 py-1 rounded-lg shrink-0">
          {profile.role}
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition border ${
                isActive
                  ? 'bg-[#1E2538] text-white border-[#1E2538] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#C59B38]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E5C158]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-[#E5C158] text-[#1E2538]' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Quick QR Scanner Trigger */}
          <div className="bg-[#1E2538] rounded-2xl p-4 shadow-sm border border-[#2A334E] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              className="sm:w-auto w-full px-5 py-2.5 rounded-xl bg-[#C59B38] hover:bg-[#b58b2e] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] shrink-0"
            >
              <QrCode className="w-4 h-4 text-white" />
              เริ่มสแกน QR Code สมาชิก
            </button>
          </div>

          {/* KPI Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className="bg-white border border-slate-200 hover:border-[#C59B38] p-3.5 rounded-xl shadow-sm text-left transition"
            >
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>สมาชิกรออนุมัติ</span>
              </div>
              <p className="text-lg font-black text-[#1E2538]">{pendingMembersCount} คน</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className="bg-white border border-slate-200 hover:border-[#C59B38] p-3.5 rounded-xl shadow-sm text-left transition"
            >
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-[#1E2538]" />
                <span>สมาชิกในระบบ</span>
              </div>
              <p className="text-lg font-black text-[#1E2538]">{yftiParticipants.length} คน</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className="bg-white border border-slate-200 hover:border-[#C59B38] p-3.5 rounded-xl shadow-sm text-left transition"
            >
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#B38728]" />
                <span>Events &amp; คอร์ส</span>
              </div>
              <p className="text-lg font-black text-[#1E2538]">{eventsCount} รายการ</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privileges')}
              className="bg-white border border-slate-200 hover:border-[#C59B38] p-3.5 rounded-xl shadow-sm text-left transition"
            >
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Gift className="w-3.5 h-3.5 text-[#B38728]" />
                <span>Privileges</span>
              </div>
              <p className="text-lg font-black text-[#9A7320]">{privilegesCount} สิทธิ์</p>
            </button>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className="bg-white border border-slate-200 hover:border-[#C59B38] rounded-2xl p-4 flex items-center justify-between text-left shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBF6EC] text-[#9A7320] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#1E2538]">จัดการ Events &amp; สลิปโอนเงิน</p>
                  <p className="text-[11px] text-slate-500">
                    สร้าง/แก้ไขกิจกรรม และตรวจสลิป ({pendingEventRegs} รอตรวจ)
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privileges')}
              className="bg-white border border-slate-200 hover:border-[#C59B38] rounded-2xl p-4 flex items-center justify-between text-left shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBF6EC] text-[#9A7320] flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#1E2538]">จัดการ Privileges สิทธิพิเศษ</p>
                  <p className="text-[11px] text-slate-500">
                    เพิ่ม แก้ไข ลบ และตั้งค่า Featured ({privilegesCount} รายการ)
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Show Member Approval Queue directly on Overview too */}
          <MemberApprovalList />
        </div>
      )}

      {/* ================= TAB: MEMBERS ================= */}
      {activeTab === 'members' && <MemberApprovalList />}

      {/* ================= TAB: EVENTS ================= */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <EventManager onCountChange={setEventsCount} />

          {/* Event Registration & Slip Approval Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#1E2538] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#B38728]" />
                <span>อนุมัติการสมัครกิจกรรม &amp; สลิปโอนเงิน</span>
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]">
                รอตรวจ {pendingEventRegs} รายการ
              </span>
            </div>

            {registrations.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ยังไม่มีรายการสมัครกิจกรรมหรือแนบสลิปโอนเงิน
              </div>
            ) : (
              <div className="space-y-2.5">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-[#1E2538]">{reg.eventTitle}</p>
                        <p className="text-[11px] text-slate-500">
                          ผู้สมัคร: <span className="font-semibold text-slate-700">{reg.applicantName}</span> •{' '}
                          {reg.ticketType === 'MEMBER' ? 'สมาชิก' : 'บุคคลทั่วไป'} • ฿{reg.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          สลิป: {reg.slipName} • {reg.createdAt}
                        </p>
                      </div>

                      {reg.slipDataUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewSlipUrl(reg.slipDataUrl!)}
                          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-[#1E2538] hover:border-[#C59B38] flex items-center gap-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#B38728]" />
                          ดูสลิป
                        </button>
                      )}
                    </div>

                    {reg.status === 'PENDING' ? (
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateRegStatus(reg.id, 'APPROVED')}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRegStatus(reg.id, 'REJECTED')}
                          className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> ปฏิเสธ
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] ${
                            reg.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {reg.status === 'APPROVED' ? 'อนุมัติแล้ว (ออกบัตรแล้ว)' : 'ปฏิเสธแล้ว'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB: PRIVILEGES ================= */}
      {activeTab === 'privileges' && <PrivilegeManager onCountChange={setPrivilegesCount} />}

      {/* ================= TAB: MISSIONS & QR ================= */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          <div className="bg-[#1E2538] rounded-2xl p-4 shadow-sm border border-[#2A334E] text-white flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">สแกน QR เช็คชื่อหน้างาน</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                สแกนบัตรสมาชิกเพื่อบันทึกการเข้าร่วมกิจกรรมและแจกแต้มอัตโนมัติ
              </p>
            </div>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#C59B38] hover:bg-[#b58b2e] text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              สแกน QR
            </button>
          </div>

          {lastCheckinResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
              <span className="font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                เช็คอินสำเร็จ: {lastCheckinResult.memberName || lastCheckinResult.lineUserId}
              </span>
            </div>
          )}

          <MissionReviewList />
        </div>
      )}

      {/* Slip Image Preview Modal */}
      {previewSlipUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewSlipUrl(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewSlipUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={previewSlipUrl} alt="Slip preview" className="w-full max-h-[75vh] object-contain bg-slate-900" />
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={(res) => setLastCheckinResult(res)}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockEvents } from '@/lib/mockData';
import { useLiffAuth } from '@/contexts/LiffContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Ticket,
  BellRing,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  Hourglass,
  X,
} from 'lucide-react';

interface EventRegistrationRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  applicantName: string;
  ticketType: string;
  amount: number;
  slipName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function MyTicketsPage() {
  const { profile } = useLiffAuth();
  const [registrations, setRegistrations] = useState<EventRegistrationRecord[]>([]);
  const [selectedQrTicket, setSelectedQrTicket] = useState<{
    title: string;
    code: string;
    qrValue: string;
  } | null>(null);

  const buildEventQrValue = (eventId: string, eventTitle: string, attendeeName?: string) =>
    JSON.stringify({
      version: 1,
      type: 'EVENT_CHECKIN',
      profileId: profile?.id || '3296',
      lineUserId: profile?.line_user_id || 'U_SIM_3296',
      displayName: profile?.display_name || attendeeName || 'สมาชิก YFTI 11',
      eventId,
      eventTitle,
      ts: Date.now(),
    });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
        if (Array.isArray(saved)) setRegistrations(saved);
      } catch {}
    }
  }, []);

  const preRegisteredUpcoming = mockEvents.filter(
    (e) => e.status === 'UPCOMING' && e.isRegisteredForEvent
  );

  const upcomingCount =
    preRegisteredUpcoming.length +
    registrations.filter((r) => r.status === 'APPROVED').length;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-24 space-y-5 animate-in fade-in duration-300">
      {/* Executive Navy Hero Header */}
      <div className="relative overflow-hidden bg-[#141A2C] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(20,26,44,0.18)] border-b-[3px] border-[#FB7170] flex items-center justify-between gap-3">
        <div className="absolute inset-0 pointer-events-none select-none">
          <img
            src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-right opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(115deg, rgba(16,22,38,0.96) 28%, rgba(24,31,52,0.88) 58%, rgba(30,37,56,0.65) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center gap-3 min-w-0">
          <Link
            href="/events"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg tracking-tight truncate">
              <span className="font-extrabold">บัตรของฉัน</span>{' '}
              <span className="font-light text-white/90 text-sm">My Tickets</span>
            </h1>
            <p className="text-[11px] font-medium text-[#FB7170] truncate">
              บัตรเข้าร่วมกิจกรรมและคอร์สเรียนทั้งหมด
            </p>
          </div>
        </div>
        <span className="relative z-10 px-3 py-1 rounded-xl badge-gold-metallic text-xs font-extrabold shrink-0 tabular-nums">
          {upcomingCount} ใบ
        </span>
      </div>

      {/* Upcoming Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <BellRing className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h2 className="text-xs sm:text-sm font-black text-amber-900">
            แจ้งเตือนกิจกรรม/คอร์สที่ใกล้มาถึง
          </h2>
          <p className="text-xs text-amber-800">
            คุณมี {upcomingCount} กิจกรรมที่ยืนยันสิทธิ์แล้ว กรุณาเตรียม QR บัตรเข้าร่วมสำหรับสแกนหน้างาน
          </p>
        </div>
      </div>

      {/* Tickets from User Registrations (Pending / Approved) */}
      {registrations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            รายการสมัครล่าสุด
          </h3>
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      reg.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : reg.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {reg.status === 'APPROVED' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> อนุมัติแล้ว (ได้รับบัตร)
                      </>
                    ) : reg.status === 'REJECTED' ? (
                      'ไม่ผ่านการอนุมัติ'
                    ) : (
                      <>
                        <Hourglass className="w-3 h-3" /> รอแอดมินอนุมัติสลิป
                      </>
                    )}
                  </span>
                  <h4 className="text-sm font-extrabold text-[#1E2538]">{reg.eventTitle}</h4>
                  <p className="text-[11px] text-slate-500">
                    ผู้สมัคร: {reg.applicantName} • {reg.ticketType} (฿{reg.amount.toLocaleString()})
                  </p>
                </div>

                {reg.status === 'APPROVED' && (
                  <button
                    onClick={() =>
                      setSelectedQrTicket({
                        title: reg.eventTitle,
                        code: `TICKET-${reg.id}`,
                        qrValue: buildEventQrValue(reg.eventId, reg.eventTitle, reg.applicantName),
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-[#1E2538] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 hover:bg-[#2B3550] transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>แสดงบัตร</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pre-registered Upcoming Events */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          บัตรเข้าร่วมกิจกรรม/คอร์สที่ยืนยันแล้ว
        </h3>
        {preRegisteredUpcoming.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col sm:flex-row"
          >
            <img
              src={ev.image_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/event_training.webp'}
              alt={ev.title}
              className="w-full sm:w-36 h-32 sm:h-auto object-cover shrink-0"
            />
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black">
                  <Ticket className="w-3 h-3" /> ยืนยันสิทธิ์แล้ว
                </span>
                <Link
                  href={`/events/${ev.id}`}
                  className="block text-sm font-extrabold text-[#1E2538] hover:text-[#B38728] transition-colors"
                >
                  {ev.title}
                </Link>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#B38728]" /> {ev.published_date_text}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#B38728]" /> {ev.location_name}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() =>
                    setSelectedQrTicket({
                      title: ev.title,
                      code: `YFTI-PASS-${ev.id}`,
                      qrValue: buildEventQrValue(ev.id, ev.title),
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#E5C158]" />
                  <span>Show Ticket QR</span>
                </button>
                <Link
                  href={`/events/${ev.id}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#1E2538] transition"
                >
                  รายละเอียด
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Ticket Modal */}
      {selectedQrTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedQrTicket(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedQrTicket(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black">
              E-Ticket Pass
            </span>
            <h3 className="text-sm font-black text-[#1E2538]">{selectedQrTicket.title}</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              <QRCodeSVG value={selectedQrTicket.qrValue} size={170} fgColor="#1E2538" />
            </div>
            <p className="text-xs font-mono text-slate-500">{selectedQrTicket.code}</p>
          </div>
        </div>
      )}
    </div>
  );
}

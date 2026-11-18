'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Calendar, 
  MapPin, 
  Coins, 
  Award, 
  QrCode, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  RefreshCw,
  X,
  UserCheck
} from 'lucide-react';
import { format, formatISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { useLiffAuth } from '@/contexts/LiffContext';
import { EventItem } from '@/types';

interface Props {
  event: EventItem;
  onCheckinSuccess?: () => void;
}

export const EventCardWithQrModal: React.FC<Props> = ({ event }) => {
  const { profile } = useLiffAuth();

  // Registration state synced with yfti_event_registrations
  const [regStatus, setRegStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>(() => {
    if (event.isRegisteredForEvent) return 'APPROVED';
    return 'NONE';
  });

  // QR Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [timestampToken, setTimestampToken] = useState<number>(Date.now());

  useEffect(() => {
    if (event.isRegisteredForEvent) {
      setRegStatus('APPROVED');
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        const regs = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
        const found = Array.isArray(regs)
          ? regs.find((r: any) => String(r.eventId) === String(event.id))
          : null;
        if (found?.status) {
          setRegStatus(found.status);
          return;
        }
      } catch {}
    }
    setRegStatus('NONE');
  }, [event.id, event.isRegisteredForEvent]);

  const isRegistered = regStatus === 'APPROVED';

  // Google Calendar URL
  const googleCalendarUrl = useMemo(() => {
    try {
      const startIso = formatISO(new Date(event.start_time)).replace(/-|:|\.\d+/g, '');
      const endIso = formatISO(new Date(event.end_time)).replace(/-|:|\.\d+/g, '');
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${startIso}/${endIso}`,
        details: event.description,
        location: event.location_name || '',
      });
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    } catch (e) {
      return '#';
    }
  }, [event]);

  // Rolling Time-based Token
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setTimestampToken(Date.now());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const qrPayload = useMemo(() => {
    return JSON.stringify({
      version: 1,
      type: 'EVENT_CHECKIN',
      rolling: true,
      profileId: profile?.id || '3296',
      lineUserId: profile?.line_user_id || 'U_SIM_3296',
      displayName: profile?.display_name || 'สมาชิก YFTI 11',
      eventId: event.id,
      eventTitle: event.title,
      ts: timestampToken,
    });
  }, [profile, event.id, event.title, timestampToken]);

  // Event Cover Photos
  const eventCover = event.image_url || (
    event.id === 'e1'
      ? 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp'
      : event.id === 'e2'
      ? 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/Y11-YoungFTI-Earth_225-scaled.webp'
      : event.id === 'e3'
      ? 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/Maldives-Davilsnap-Day2-3_627-scaled.webp'
      : event.id === 'e4'
      ? 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/Y11_04042025_366-scaled.webp'
      : event.id === 'e5'
      ? 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/KIM05966-1-scaled.webp'
      : event.id === 'e6'
      ? 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/YFTI-Pattaya-24-Jan-25-557-scaled.webp'
      : 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/Young-FTI-11-995-scaled.webp'
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:border-[#C59B38] transition flex flex-col justify-between group border border-slate-200/80">
      {/* Top Part: Image + Info (Clickable Link to Detail Page) */}
      <Link href={`/events/${event.id}`} className="block focus:outline-none">
        {/* Event Photo Banner */}
        <div className="relative h-[210px] w-full overflow-hidden rounded-xl bg-slate-900">
          <img
            src={eventCover}
            alt={event.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

          {/* Top Status Chips */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            {event.is_mandatory ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#C59B38] text-white shadow-sm">
                วิชาบังคับ (80%)
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1E2538]/90 text-white">
                {event.event_type === 'course' ? 'คอร์สเรียน' : 'กิจกรรมทั่วไป'}
              </span>
            )}

            {event.isCheckedIn ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1E2538] text-white shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-[#E5C158]" /> เช็คชื่อแล้ว
              </span>
            ) : isRegistered ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-[#1E2538] shadow-sm">
                <UserCheck className="w-3 h-3 text-[#B38728]" /> ลงทะเบียนแล้ว
              </span>
            ) : regStatus === 'PENDING' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2] shadow-sm">
                <Clock className="w-3 h-3" /> รอแอดมินอนุมัติ
              </span>
            ) : null}
          </div>

          {/* Bottom Reward Badges */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[10px] font-bold text-white bg-black/65 px-2.5 py-0.5 rounded-full flex items-center gap-1 tabular-nums">
              <Coins className="w-3 h-3 text-[#E5C158]" /> +{event.reward_points}
            </span>
            <span className="text-[10px] font-bold text-white bg-black/65 px-2.5 py-0.5 rounded-full tabular-nums">
              +{event.reward_xp} XP
            </span>
          </div>
        </div>

        {/* Event Content Block */}
        <div className="mt-3.5 space-y-1">
          <div className="text-xs font-semibold text-[#9A7320] py-0.5">
            {format(new Date(event.start_time), 'd MMM yyyy', { locale: th })}
          </div>

          <h4 className="text-base sm:text-lg font-bold text-[#1E2538] leading-snug group-hover:text-[#B38728] transition-colors line-clamp-2">
            {event.title}
          </h4>

          {event.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
              {event.description}
            </p>
          )}

          {event.location_name && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#B38728] shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-3.5 mt-3 border-t border-slate-100">
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>ลงปฏิทิน</span>
        </a>

        {/* Not Registered -> Navigate to registration & slip upload form */}
        {!event.isCheckedIn && event.status === 'UPCOMING' && (regStatus === 'NONE' || regStatus === 'REJECTED') && (
          <Link
            href={`/events/${event.id}?register=1`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#B89138] hover:bg-[#a37f2d] text-xs font-bold text-white transition shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>สมัครเข้าร่วม</span>
          </Link>
        )}

        {/* Pending Approval */}
        {!event.isCheckedIn && event.status === 'UPCOMING' && regStatus === 'PENDING' && (
          <Link
            href={`/events/${event.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FBF6EC] hover:bg-[#F5EBD6] border border-[#EFE2C2] text-xs font-bold text-[#9A7320] transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>รอแอดมินอนุมัติ</span>
          </Link>
        )}

        {/* Approved or Non-Upcoming -> Show QR */}
        {!event.isCheckedIn && (isRegistered || event.status !== 'UPCOMING') && (
          <button
            onClick={() => {
              setTimestampToken(Date.now());
              setCountdown(30);
              setIsOpen(true);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] text-xs font-bold text-white transition shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 text-[#E5C158]" />
            <span>เช็คชื่อ (QR)</span>
          </button>
        )}

        {/* Checked In */}
        {event.isCheckedIn && (
          <button
            disabled
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-[#1E2538] border border-slate-200 text-xs font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#B38728]" />
            <span>เข้าร่วมแล้ว</span>
          </button>
        )}
      </div>

      {/* Modal QR Code */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-5 relative shadow-xl flex flex-col items-center text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-2 border border-emerald-200">
              <UserCheck className="w-3.5 h-3.5" />
              <span>RSVP Confirmed</span>
            </div>

            <h4 className="text-sm font-bold text-[#181B34] mb-1">{event.title}</h4>
            <p className="text-xs text-slate-500 mb-4">แสดง QR Code นี้ให้ Staff สแกนหน้างาน</p>

            {/* QR Card */}
            <div className="p-3.5 bg-white rounded-xl shadow-sm border border-slate-200 mb-3.5">
              <QRCodeSVG
                value={qrPayload}
                size={190}
                level="H"
                fgColor="#181B34"
                includeMargin={false}
              />
            </div>

            {/* Live refresh countdown */}
            <div className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 mb-2">
              <span className="flex items-center gap-1.5 text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 text-[#181B34] animate-spin" />
                รีเฟรชรหัสความปลอดภัยใน
              </span>
              <span className="font-mono font-bold text-[#FB7170]">{countdown}s</span>
            </div>

            <p className="text-[10px] text-slate-400">
              * รหัส QR จะเปลี่ยนอัตโนมัติทุก 30 วินาที เพื่อความปลอดภัย
            </p>
          </div>
        </div>
      )}
    </div>
  );
};


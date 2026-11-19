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
    <div className="relative min-h-[320px] sm:min-h-[340px] bg-[#0D1321] rounded-[24px] overflow-hidden shadow-[0_8px_24px_rgba(13,19,33,0.12)] hover:shadow-[0_14px_32px_rgba(13,19,33,0.18)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
      {/* Full-Bleed Event Photo Background */}
      <img
        src={eventCover}
        alt={event.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 pointer-events-none"
      />

      {/* Signature Obsidian Dark Bottom Fade (Matches Home Luxury Theme) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(9,14,26,0.45) 0%, rgba(9,14,26,0.18) 32%, rgba(9,14,26,0.82) 62%, rgba(9,14,26,0.97) 84%, #090E1A 100%)',
        }}
      />

      {/* Top Status Chips */}
      <div className="relative z-10 p-3.5 flex items-center justify-between gap-2 pointer-events-none">
        {event.is_mandatory ? (
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#0D1321]/85 backdrop-blur-md text-[#ECD28E]">
            วิชาบังคับ (80%)
          </span>
        ) : (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#0D1321]/75 backdrop-blur-md text-white">
            {event.event_type === 'course' ? 'คอร์สเรียน' : 'กิจกรรมทั่วไป'}
          </span>
        )}

        {event.isCheckedIn ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/90 text-white">
            <CheckCircle2 className="w-3 h-3" /> เช็คชื่อแล้ว
          </span>
        ) : isRegistered ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0D1321]/85 backdrop-blur-md text-[#ECD28E]">
            <UserCheck className="w-3 h-3" /> ลงทะเบียนแล้ว
          </span>
        ) : regStatus === 'PENDING' ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0D1321]/85 backdrop-blur-md text-[#ECD28E]">
            <Clock className="w-3 h-3" /> รอแอดมินอนุมัติ
          </span>
        ) : null}
      </div>

      {/* Bottom Content & Actions Overlaid on Obsidian Fade */}
      <div className="relative z-10 mt-auto pt-16 px-4 sm:px-5 pb-4 space-y-3 text-white">
        <Link href={`/events/${event.id}`} className="block focus:outline-none space-y-1.5">
          {/* Date & Reward Meta Row */}
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 font-bold text-[#ECD28E]">
              <Calendar className="w-3.5 h-3.5 text-[#DFC27D]" />
              {format(new Date(event.start_time), 'd MMM yyyy', { locale: th })}
            </span>
            <span className="inline-flex items-center gap-1 font-extrabold text-[#ECD28E] tabular-nums">
              <Coins className="w-3.5 h-3.5 text-[#DFC27D]" />
              +{event.reward_points} Pts
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-extrabold text-white leading-snug group-hover:text-[#ECD28E] transition-colors line-clamp-2 drop-shadow-sm">
            {event.title}
          </h4>

          {event.location_name && (
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#ECD28E]/80 shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
        </Link>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-2.5 border-t border-white/12">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/12 hover:bg-white/20 backdrop-blur-sm text-xs font-bold text-white whitespace-nowrap transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#ECD28E]" />
            <span>ลงปฏิทิน</span>
          </a>

          {/* Not Registered -> Navigate to registration & slip upload form */}
          {!event.isCheckedIn && event.status === 'UPCOMING' && (regStatus === 'NONE' || regStatus === 'REJECTED') && (
            <Link
              href={`/events/${event.id}?register=1`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl luxury-gold-btn text-xs font-bold whitespace-nowrap transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>สมัครเข้าร่วม</span>
            </Link>
          )}

          {/* Pending Approval */}
          {!event.isCheckedIn && event.status === 'UPCOMING' && regStatus === 'PENDING' && (
            <Link
              href={`/events/${event.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl badge-gold-metallic text-xs font-bold whitespace-nowrap transition"
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
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl luxury-gold-btn text-xs font-bold whitespace-nowrap transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>เช็คชื่อ (QR)</span>
            </button>
          )}

          {/* Checked In */}
          {event.isCheckedIn && (
            <button
              disabled
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 text-[#ECD28E] text-xs font-bold whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>เข้าร่วมแล้ว</span>
            </button>
          )}
        </div>
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


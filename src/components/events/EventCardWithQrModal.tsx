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
  UserCheck,
  Loader2
} from 'lucide-react';
import { format, formatISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { useLiffAuth } from '@/contexts/LiffContext';
import { EventItem } from '@/types';
import { supabase } from '@/lib/supabase';

interface Props {
  event: EventItem;
  onCheckinSuccess?: () => void;
}

export const EventCardWithQrModal: React.FC<Props> = ({ event }) => {
  const { profile } = useLiffAuth();
  
  // Registration state
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    if (event.isRegisteredForEvent) return true;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`event_reg_${event.id}`);
      return stored === 'true';
    }
    return false;
  });

  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [showRegSuccessToast, setShowRegSuccessToast] = useState<boolean>(false);

  // QR Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [timestampToken, setTimestampToken] = useState<number>(Date.now());

  // Check Supabase if user already registered for this event
  useEffect(() => {
    async function checkEventRegistration() {
      if (!profile?.id) return;
      try {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', event.id)
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (data && !error) {
          setIsRegistered(true);
          localStorage.setItem(`event_reg_${event.id}`, 'true');
        }
      } catch (err) {
        // Fallback to local storage
      }
    }
    checkEventRegistration();
  }, [profile?.id, event.id]);

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
    if (!profile) return '';
    return JSON.stringify({
      version: 1,
      profileId: profile.id,
      lineUserId: profile.line_user_id,
      displayName: profile.display_name,
      eventId: event.id,
      eventTitle: event.title,
      ts: timestampToken,
    });
  }, [profile, event.id, event.title, timestampToken]);

  // Handle Event RSVP / Registration
  const handleRegisterEvent = async () => {
    setIsRegistering(true);
    try {
      if (profile?.id) {
        await supabase
          .from('event_registrations')
          .insert({
            event_id: event.id,
            profile_id: profile.id,
          })
          .select();
      }

      setIsRegistered(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`event_reg_${event.id}`, 'true');
      }

      setShowRegSuccessToast(true);
      setTimeout(() => setShowRegSuccessToast(false), 3500);
    } catch (err) {
      setIsRegistered(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`event_reg_${event.id}`, 'true');
      }
      setShowRegSuccessToast(true);
      setTimeout(() => setShowRegSuccessToast(false), 3500);
    } finally {
      setIsRegistering(false);
    }
  };

  // Event Cover Photos
  const eventCover = event.image_url || (
    event.id === 'e1'
      ? '/images/events/25680523-Y11-YoungFTI_1683-scaled.jpg'
      : event.id === 'e2'
      ? '/images/events/Y11-YoungFTI-Earth_225-scaled.jpg'
      : event.id === 'e3'
      ? '/images/events/Maldives-Davilsnap-Day2-3_627-scaled.jpg'
      : event.id === 'e4'
      ? '/images/events/Y11_04042025_366-scaled.jpg'
      : event.id === 'e5'
      ? '/images/events/KIM05966-1-scaled.jpg'
      : event.id === 'e6'
      ? '/images/events/YFTI-Pattaya-24-Jan-25-557-scaled.jpg'
      : '/images/events/Young-FTI-11-995-scaled.jpg'
  );

  return (
    <div className="bg-white rounded-[12px] p-5 shadow-[0px_4px_16px_2px_rgba(0,0,0,0.15)] hover:shadow-[0px_2px_25px_0px_rgba(0,0,0,0.2)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 border border-slate-100">
      {/* Toast */}
      {showRegSuccessToast && (
        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>ลงทะเบียนสำเร็จ! สามารถเปิด QR เช็คชื่อได้เมื่อถึงเวลางาน</span>
        </div>
      )}

      {/* Top Part: Image + Info (Clickable Link to Detail Page) */}
      <Link href={`/events/${event.id}`} className="block focus:outline-none">
        {/* Event Photo Banner (.elementor-element-b4d5875) */}
        <div className="relative h-[240px] w-full overflow-hidden rounded-[6px] bg-slate-900">
          <img
            src={eventCover}
            alt={event.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 group-hover:brightness-105 transition-all duration-500 rounded-[6px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10 pointer-events-none" />

          {/* Top Status Chips */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            {event.is_mandatory ? (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FB7170] text-white shadow-sm">
                วิชาบังคับ (80%)
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#212542]/85 backdrop-blur-sm text-white border border-white/20">
                กิจกรรมทั่วไป
              </span>
            )}

            {event.isCheckedIn ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white shadow-sm">
                <CheckCircle2 className="w-3 h-3" /> เช็คชื่อแล้ว
              </span>
            ) : isRegistered ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#3B82F6] text-white shadow-sm">
                <UserCheck className="w-3 h-3" /> ลงทะเบียนแล้ว
              </span>
            ) : null}
          </div>

          {/* Bottom Reward Badges */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
              <Coins className="w-3 h-3 text-[#FB7170]" /> +{event.reward_points}
            </span>
            <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded font-mono border border-white/10">
              +{event.reward_xp} XP
            </span>
          </div>
        </div>

        {/* Event Content Block (.elementor-element-5008d92) */}
        <div className="mt-[15px] space-y-1">
          {/* Coral Date Tag (.elementor-element-2583bd8) */}
          <div className="text-base font-normal text-[#FB7170] py-1.5">
            {format(new Date(event.start_time), 'd MMM yyyy', { locale: th })}
          </div>

          {/* Title (.elementor-element-60f4ba2) */}
          <h4 className="text-xl sm:text-2xl font-semibold text-[#212542] leading-[1.3] group-hover:text-[#FB7170] transition-colors">
            {event.title}
          </h4>

          {/* Description */}
          {event.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
              {event.description}
            </p>
          )}

          {/* Venue Info */}
          {event.location_name && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-2">
              <MapPin className="w-3.5 h-3.5 text-[#FB7170] shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-100">
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>ลงปฏิทิน</span>
        </a>

        {/* Not Registered */}
        {!event.isCheckedIn && !isRegistered && (
          <button
            onClick={handleRegisterEvent}
            disabled={isRegistering}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#212542] hover:bg-[#2e335b] text-xs font-bold text-white transition disabled:opacity-60 shadow-sm"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังลงทะเบียน...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-[#FB7170]" />
                <span>ลงทะเบียน</span>
              </>
            )}
          </button>
        )}

        {/* Registered -> Show QR */}
        {!event.isCheckedIn && isRegistered && (
          <button
            onClick={() => {
              setTimestampToken(Date.now());
              setCountdown(30);
              setIsOpen(true);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#212542] hover:bg-[#2e335b] text-xs font-bold text-white transition shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 text-[#FB7170]" />
            <span>เช็คชื่อ (QR)</span>
          </button>
        )}

        {/* Checked In */}
        {event.isCheckedIn && (
          <button
            disabled
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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


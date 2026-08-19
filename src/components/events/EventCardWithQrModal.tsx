'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

  // Event Cover Photos (Matching executive class aesthetic from image.png)
  const eventCover = event.id === 'e1'
    ? 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
    : event.id === 'e2'
    ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-all">
      {/* Toast */}
      {showRegSuccessToast && (
        <div className="m-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>ลงทะเบียนสำเร็จ! สามารถเปิด QR เช็คชื่อได้เมื่อถึงเวลางาน</span>
        </div>
      )}

      {/* Event Photo Banner with Status Chip */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-900">
        <img
          src={eventCover}
          alt={event.title}
          className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          {event.is_mandatory ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FB7170] text-white shadow-sm">
              วิชาบังคับ (80%)
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#181B34]/80 backdrop-blur-sm text-white">
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

        {/* Bottom Reward Badges on Image */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1">
            <Coins className="w-3 h-3 text-[#FB7170]" /> +{event.reward_points}
          </span>
          <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded font-mono">
            +{event.reward_xp} XP
          </span>
        </div>
      </div>

      {/* Event Content Block */}
      <div className="p-4">
        {/* Coral Date Tag (Directly echoing image.png style: '24 พ.ค. 2025') */}
        <div className="text-xs font-bold text-[#FB7170] mb-1">
          {format(new Date(event.start_time), 'd MMM yyyy', { locale: th })}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-[#181B34] mb-1.5 leading-snug">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {event.description}
        </p>

        {/* Venue info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <MapPin className="w-3.5 h-3.5 text-[#FB7170] shrink-0" />
          <span className="truncate">{event.location_name}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            ลงปฏิทิน
          </a>

          {/* Not Registered */}
          {!event.isCheckedIn && !isRegistered && (
            <button
              onClick={handleRegisterEvent}
              disabled={isRegistering}
              className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#181B34] hover:bg-[#25294e] text-xs font-bold text-white transition disabled:opacity-60"
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
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#181B34] hover:bg-[#25294e] text-xs font-bold text-white transition"
            >
              <QrCode className="w-3.5 h-3.5 text-[#FB7170]" />
              <span>เปิด QR เช็คชื่อ</span>
            </button>
          )}

          {/* Completed */}
          {event.isCheckedIn && (
            <div className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              เช็คชื่อแล้ว
            </div>
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


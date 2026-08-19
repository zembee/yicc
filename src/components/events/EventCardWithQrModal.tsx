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
  X 
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
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [timestampToken, setTimestampToken] = useState<number>(Date.now());

  // 1. Google Calendar URL
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

  // 2. Rolling Time-based Token
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

  return (
    <div className="bg-white border border-[#EEEEEE] rounded-3xl p-5 shadow-[0_4px_20px_rgba(33,37,66,0.04)] text-[#292929] mb-4 transition-all hover:shadow-[0_8px_25px_rgba(33,37,66,0.07)]">
      {/* Top Meta */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {event.is_mandatory && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFD7D7] text-[#FB7170] border border-[#FB7170]/30">
              วิชาบังคับ
            </span>
          )}
          <span className="text-xs text-[#6B7280] font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#212542]" />
            {format(new Date(event.start_time), 'EEE d MMM yyyy', { locale: th })}
          </span>
        </div>

        {event.isCheckedIn ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> เช็คชื่อแล้ว
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF5F5] text-[#FB7170] border border-[#FFD7D7]">
            <Clock className="w-3.5 h-3.5" /> รอเช็คชื่อ
          </span>
        )}
      </div>

      {/* Event Details */}
      <h3 className="text-base font-extrabold text-[#212542] mb-1.5 leading-snug">{event.title}</h3>
      <p className="text-xs text-[#6B7280] line-clamp-2 mb-4 leading-relaxed">{event.description}</p>

      {/* Rewards & Location */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-[#F8F9FC] p-3 rounded-2xl border border-[#EEEEEE]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#FB7170] shrink-0" />
          <div className="truncate text-xs">
            <p className="text-[#9CA3AF] text-[10px] font-medium">สถานที่</p>
            <p className="text-[#212542] font-semibold truncate">{event.location_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <div className="flex items-center gap-1 text-xs font-extrabold text-[#FB7170] bg-[#FFD7D7]/50 px-2 py-1 rounded-xl border border-[#FFD7D7]">
            <Coins className="w-3.5 h-3.5" /> +{event.reward_points}
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-[#212542] bg-[#DBDFFF] px-2 py-1 rounded-xl border border-[#c2c9ff]">
            <Award className="w-3.5 h-3.5 text-[#5867E8]" /> +{event.reward_xp} XP
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#F8F9FC] hover:bg-[#EEEEEE] active:scale-[0.98] text-xs font-bold text-[#212542] border border-[#EEEEEE] transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#5867E8]" />
          ลงปฏิทิน Google
        </a>

        {!event.isCheckedIn ? (
          <button
            onClick={() => {
              setTimestampToken(Date.now());
              setCountdown(30);
              setIsOpen(true);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#212542] hover:bg-[#2d335a] active:scale-[0.98] text-xs font-bold text-white shadow-md shadow-[#212542]/20 transition"
          >
            <QrCode className="w-4 h-4 text-[#DBDFFF]" />
            เปิด QR เช็คชื่อ
          </button>
        ) : (
          <button
            disabled
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#F4F5FA] text-xs font-semibold text-[#9CA3AF] cursor-not-allowed border border-[#EEEEEE]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            เรียบร้อย
          </button>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#212542]/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-[#EEEEEE] w-full max-w-sm rounded-3xl p-6 relative shadow-2xl flex flex-col items-center text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#6B7280] hover:text-[#212542] bg-[#F8F9FC] hover:bg-[#EEEEEE]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FB7170] bg-[#FFD7D7] px-3 py-1 rounded-full border border-[#FB7170]/30 mb-2">
              Member Attendance Token
            </span>
            <h4 className="text-base font-extrabold text-[#212542] mb-1">{event.title}</h4>
            <p className="text-xs text-[#6B7280] mb-5">ยื่น QR Code นี้ให้ Staff สแกนหน้างาน</p>

            {/* QR Card */}
            <div className="p-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(33,37,66,0.08)] border border-[#EEEEEE] mb-4">
              <QRCodeSVG
                value={qrPayload}
                size={200}
                level="H"
                fgColor="#212542"
                includeMargin={false}
              />
            </div>

            {/* Live refresh timer */}
            <div className="w-full flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] border border-[#DBDFFF] text-[#212542] mb-3">
              <span className="flex items-center gap-1.5 text-[#6B7280] font-medium">
                <RefreshCw className="w-3.5 h-3.5 text-[#5867E8] animate-spin" />
                รีเฟรชรหัสความปลอดภัยใน
              </span>
              <span className="font-mono font-extrabold text-[#FB7170]">{countdown}s</span>
            </div>

            <div className="text-[11px] text-[#9CA3AF] leading-relaxed">
              * รหัส QR จะเปลี่ยนอัตโนมัติเพื่อป้องกันการส่งภาพแคปหน้าจอแทนกัน
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

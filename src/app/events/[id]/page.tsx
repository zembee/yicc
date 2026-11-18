'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { mockEvents, mockMissions } from '@/lib/mockData';
import { useLiffAuth } from '@/contexts/LiffContext';
import { EventItem } from '@/types';
import { 
  Calendar, 
  MapPin, 
  User, 
  ArrowLeft, 
  ExternalLink, 
  QrCode, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Share2,
  Sparkles,
  Target,
  Upload,
  Ticket,
  Hourglass
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function EventDetailPage() {
  const params = useParams();
  const { profile } = useLiffAuth();
  const rawId = decodeURIComponent((params.id as string) || '');

  const [customEvents, setCustomEvents] = useState<EventItem[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [ticketType, setTicketType] = useState<'member' | 'guest'>('member');
  const [slipFileName, setSlipFileName] = useState('');
  const [slipDataUrl, setSlipDataUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setApplicantName(profile.display_name || '');
      setApplicantPhone(profile.phone_number || '');
    }
  }, [profile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const custom: EventItem[] = JSON.parse(localStorage.getItem('yfti_custom_events') || '[]');
        if (Array.isArray(custom)) setCustomEvents(custom);
      } catch {}
    }
  }, []);

  // Find event by ID or Slug
  const allEvents = [...customEvents, ...mockEvents];
  const event = allEvents.find(
    (ev) => ev.id === rawId || ev.slug === rawId || encodeURIComponent(ev.slug || '') === rawId
  );

  useEffect(() => {
    if (!event || typeof window === 'undefined') return;
    const paramsQuery = new URLSearchParams(window.location.search);
    const autoOpenRegister = paramsQuery.get('register') === '1';

    if (event.isRegisteredForEvent) {
      setRegistrationStatus('APPROVED');
      return;
    }
    try {
      const regs = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
      const found = regs.find((r: any) => r.eventId === event.id);
      if (found) {
        setRegistrationStatus(found.status);
        if (found.status === 'REJECTED' && autoOpenRegister && event.status === 'UPCOMING') {
          setIsRegisterModalOpen(true);
        }
        return;
      }
    } catch {}

    if (autoOpenRegister && event.status === 'UPCOMING') {
      setIsRegisterModalOpen(true);
    }
  }, [event]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#212542]">ไม่พบข้อมูลกิจกรรม</h2>
        <p className="text-slate-500 text-sm">ขออภัย ไม่พบกิจกรรมที่คุณกำลังค้นหา</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#212542] text-white text-sm font-semibold hover:bg-[#2e335b] transition"
        >
          <ArrowLeft className="w-4 h-4" /> กลับหน้ารวมกิจกรรม
        </Link>
      </div>
    );
  }

  const gallery = event.gallery_images && event.gallery_images.length > 0
    ? event.gallery_images
    : [event.image_url || '/images/events/25680523-Y11-YoungFTI_1683-scaled.jpg'];

  const otherEvents = mockEvents.filter((ev) => ev.id !== event.id).slice(0, 3);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${new Date(event.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(
    event.end_time
  ).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(
    event.description
  )}&location=${encodeURIComponent(event.location_name)}`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      {/* Toast */}
      {copiedToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#212542] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>คัดลอกลิงก์กิจกรรมเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#111827] via-[#1E2538] to-[#252E46] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" /> กลับหน้ารวมกิจกรรม
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full transition backdrop-blur-sm"
            >
              <Share2 className="w-3.5 h-3.5" /> แชร์กิจกรรม
            </button>
          </div>

          {/* Title */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {event.is_mandatory ? (
                <span className="px-3 py-0.5 rounded-full bg-[#C59B38] text-white text-[11px] font-bold tracking-wider uppercase shadow-sm">
                  วิชาบังคับ (80%)
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-sm">
                  กิจกรรมทั่วไป
                </span>
              )}
              {event.isCheckedIn && (
                <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> เข้าร่วมแล้ว
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight font-kanit tracking-tight">
              {event.title}
            </h1>
          </div>

          {/* Meta Info Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E5C158]" />
              <span>เผยแพร่ {event.published_date_text || '24 พฤษภาคม 2025'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#E5C158]" />
              <span>ผู้เขียน {event.author_name || 'admin'}</span>
            </div>
            {event.location_name && (
              <div className="flex items-center gap-2 truncate max-w-md">
                <MapPin className="w-4 h-4 text-[#E5C158] shrink-0" />
                <span className="truncate">{event.location_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-10">
        {/* Main Featured Photo (.elementor-element-38ee6e9) */}
        <div className="relative w-full h-[280px] sm:h-[420px] lg:h-[500px] rounded-2xl overflow-hidden shadow-[0px_8px_30px_rgba(0,0,0,0.18)] bg-slate-900 border-4 border-white">
          <img
            src={event.image_url || gallery[0]}
            alt={event.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <span className="text-xs font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
              +{event.reward_points} Points
            </span>
            <span className="text-xs font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 font-mono">
              +{event.reward_xp} XP
            </span>
          </div>
        </div>

        {/* Action Panel: Calendar & QR Check-in */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-bold text-[#B38728] uppercase tracking-wider">
              Young FTI Elite Activity Pass
            </div>
            <div className="text-base sm:text-lg font-bold text-[#1E2538]">
              {event.isCheckedIn ? 'คุณได้ทำการเช็คชื่อกิจกรรมนี้แล้ว' : 'เข้าร่วมกิจกรรมและสะสมคะแนน'}
            </div>
            <p className="text-xs text-slate-500">
              บันทึกลงปฏิทินส่วนตัว หรือเปิด QR Code สำหรับการเช็คชื่อหน้างาน
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              ลง Google Calendar
            </a>

            {event.status === 'UPCOMING' && (registrationStatus === 'NONE' || registrationStatus === 'REJECTED') && (
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#B89138] hover:bg-[#a37f2d] text-white text-xs sm:text-sm font-bold transition shadow-sm"
              >
                <Ticket className="w-4 h-4" />
                {registrationStatus === 'REJECTED' ? 'ส่งสลิปสมัครใหม่อีกครั้ง' : 'สมัครเข้าร่วม + แนบสลิป'}
              </button>
            )}

            {event.status === 'UPCOMING' && registrationStatus === 'PENDING' && (
              <span className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] text-xs sm:text-sm font-bold">
                <Hourglass className="w-4 h-4" />
                รอแอดมินอนุมัติสลิป
              </span>
            )}

            {(event.status !== 'UPCOMING' || registrationStatus === 'APPROVED') && (
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] text-white text-xs sm:text-sm font-bold transition shadow-sm"
              >
                <QrCode className="w-4 h-4 text-[#E5C158]" />
                {event.isCheckedIn ? 'ดู QR Code' : 'เปิด QR บัตรเข้าร่วม'}
              </button>
            )}
          </div>
        </div>

        {/* Paragraph & Description */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-[#1E2538] border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B38728]" />
            รายละเอียดกิจกรรม
          </h3>
          {event.content_paragraphs && event.content_paragraphs.length > 0 ? (
            event.content_paragraphs.map((p, idx) => (
              <p key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed leading-7 font-normal">
                {p}
              </p>
            ))
          ) : (
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed leading-7 font-normal">
              {event.description}
            </p>
          )}

          {event.location_name && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-[#FB7170] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">สถานที่: </span>
                <span>{event.location_name}</span>
                {event.google_maps_url && (
                  <a
                    href={event.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3B82F6] hover:underline ml-2 inline-flex items-center gap-1 font-semibold"
                  >
                    ดูแผนที่ Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* In-Event Missions & Points */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg sm:text-xl font-bold text-[#1E2538] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#B38728]" />
              ภารกิจและคะแนนภายในกิจกรรม
            </h3>
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              รับสูงสุด +{event.reward_points + 260} Pts
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#1E2538]">เช็กชื่อเข้าร่วมกิจกรรม</p>
                <p className="text-[11px] text-slate-500">สแกน QR บัตรเข้าร่วมกับทีมงานหน้างาน</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black shrink-0">
                +{event.reward_points} Pts
              </span>
            </div>

            {mockMissions.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#1E2538]">{m.title}</p>
                  <p className="text-[11px] text-slate-500">{m.description}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black shrink-0">
                  +{m.reward_points} Pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery Grid (Only shown after event has started/completed) */}
        {event.status !== 'UPCOMING' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold text-[#212542] font-kanit">
                ภาพบรรยากาศ ({gallery.length} ภาพ)
              </h3>
              <span className="text-xs text-slate-500">คลิกที่ภาพเพื่อดูขนาดเต็ม</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {gallery.map((imgUrl, index) => (
                <div
                  key={index}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative h-48 sm:h-56 rounded-xl overflow-hidden bg-slate-100 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/60"
                >
                  <img
                    src={imgUrl}
                    alt={`ภาพที่ ${index + 1}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="p-2.5 rounded-full bg-white/90 text-[#212542] shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Activities Grid (.elementor-element-bf59698) */}
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <h3 className="text-xl sm:text-2xl font-bold text-[#212542] font-kanit">
            กิจกรรมอื่นๆ ในโครงการ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="bg-white rounded-[12px] p-4 shadow-[0px_4px_16px_2px_rgba(0,0,0,0.10)] hover:shadow-[0px_2px_25px_0px_rgba(0,0,0,0.18)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 border border-slate-100"
              >
                <div className="relative h-36 w-full rounded-[6px] overflow-hidden bg-slate-900 mb-3">
                  <img
                    src={ev.image_url || '/images/events/25680523-Y11-YoungFTI_1683-scaled.jpg'}
                    alt={ev.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    {ev.is_mandatory ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#FB7170] text-white shadow-sm">
                        วิชาบังคับ
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#212542]/85 text-white">
                        กิจกรรมทั่วไป
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#FB7170] font-normal">
                    {ev.published_date_text || '2025'}
                  </div>
                  <h4 className="text-sm font-semibold text-[#212542] group-hover:text-[#FB7170] transition-colors line-clamp-2 leading-snug">
                    {ev.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 backdrop-blur-md animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white py-2 z-10">
            <div className="text-xs sm:text-sm font-mono text-slate-300">
              ภาพที่ {lightboxIndex + 1} จาก {gallery.length}
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image in Lightbox */}
          <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center p-2">
            <img
              src={gallery[lightboxIndex]}
              alt={`รูปที่ ${lightboxIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />

            {/* Navigation Arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === null || prev === 0 ? gallery.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === null || prev === gallery.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails */}
          <div className="w-full max-w-4xl overflow-x-auto py-2 flex items-center justify-center gap-2 no-scrollbar">
            {gallery.slice(0, 15).map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`h-12 w-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                  lightboxIndex === idx ? 'border-[#FB7170] scale-110' : 'border-white/30 opacity-60'
                }`}
              >
                <img src={thumb} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QR Check-in Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl flex flex-col items-center text-center space-y-4">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="px-3 py-1 rounded-full bg-[#FB7170]/10 text-[#FB7170] text-xs font-bold">
                QR Code เช็คชื่อเข้าร่วมกิจกรรม
              </span>
              <h3 className="text-base font-bold text-[#212542] line-clamp-2 pt-1">
                {event.title}
              </h3>
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-inner flex items-center justify-center">
              <QRCodeSVG
                value={JSON.stringify({
                  version: 1,
                  type: 'EVENT_CHECKIN',
                  profileId: profile?.id || '3296',
                  lineUserId: profile?.line_user_id || 'U_SIM_3296',
                  displayName: profile?.display_name || applicantName || 'สมาชิก YFTI 11',
                  eventId: event.id,
                  eventTitle: event.title,
                  ts: Date.now(),
                })}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            <div className="text-xs text-slate-500 leading-relaxed">
              แสดง QR Code นี้แก่เจ้าหน้าที่หน้างานเพื่อสแกนยืนยันการเข้าร่วมและรับคะแนน{' '}
              <span className="font-bold text-[#FB7170]">+{event.reward_points} Points</span>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#212542] text-white text-xs font-bold hover:bg-[#2e335b] transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
      {/* Registration & Slip Upload Modal */}
      {isRegisterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setIsRegisterModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FB7170]">
                Event Registration
              </span>
              <h3 className="text-base font-black text-[#1E2538]">{event.title}</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amount =
                  ticketType === 'member'
                    ? event.fee_member ?? 1500
                    : event.fee_guest ?? 2500;
                const newReg = {
                  id: `reg-${Date.now()}`,
                  eventId: event.id,
                  eventTitle: event.title,
                  applicantName: applicantName || 'สมาชิก YFTI 11',
                  applicantPhone: applicantPhone || '082-269-9962',
                  ticketType: ticketType === 'member' ? 'สมาชิก YFTI' : 'บุคคลทั่วไป',
                  amount,
                  slipName: slipFileName || 'transfer-slip.jpg',
                  slipDataUrl: slipDataUrl || undefined,
                  status: 'PENDING',
                  createdAt: new Date().toLocaleString('th-TH'),
                };
                if (typeof window !== 'undefined') {
                  const existing = JSON.parse(
                    localStorage.getItem('yfti_event_registrations') || '[]'
                  );
                  const filtered = existing.filter((r: any) => String(r.eventId) !== String(event.id));
                  filtered.unshift(newReg);
                  localStorage.setItem('yfti_event_registrations', JSON.stringify(filtered));
                }
                setRegistrationStatus('PENDING');
                setIsRegisterModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุลผู้เข้าร่วม</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทบัตร</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTicketType('member')}
                    className={`p-3 rounded-xl border text-left transition ${
                      ticketType === 'member'
                        ? 'border-[#1E2538] bg-[#1E2538]/5'
                        : 'border-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#1E2538] block">สมาชิก YFTI</span>
                    <span className="text-xs font-black text-[#FB7170]">
                      ฿{(event.fee_member ?? 1500).toLocaleString()}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketType('guest')}
                    className={`p-3 rounded-xl border text-left transition ${
                      ticketType === 'guest'
                        ? 'border-[#1E2538] bg-[#1E2538]/5'
                        : 'border-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#1E2538] block">บุคคลทั่วไป</span>
                    <span className="text-xs font-black text-[#FB7170]">
                      ฿{(event.fee_guest ?? 2500).toLocaleString()}
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-[#1E2538]">ข้อมูลการโอนเงิน</p>
                <p className="text-slate-600">ธนาคารกสิกรไทย: 055-8-96255-9 (สภาอุตสาหกรรมฯ)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">แนบสลิปโอนเงิน</label>
                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#FB7170] bg-slate-50 cursor-pointer transition text-xs font-bold text-slate-600">
                  {slipDataUrl ? (
                    <img
                      src={slipDataUrl}
                      alt="ตัวอย่างสลิปโอนเงิน"
                      className="max-h-40 rounded-xl object-contain border border-slate-200 bg-white"
                    />
                  ) : null}
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#FB7170]" />
                    <span>{slipFileName || 'เลือกไฟล์รูปภาพสลิปโอนเงิน'}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setSlipFileName(f.name);
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setSlipDataUrl(reader.result);
                          }
                        };
                        reader.readAsDataURL(f);
                      }
                    }}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#1E2538] hover:bg-[#2B3550] text-white text-xs sm:text-sm font-black transition shadow-md"
              >
                ส่งใบสมัครและรอแอดมินอนุมัติ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

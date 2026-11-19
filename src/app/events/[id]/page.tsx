'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { mockEvents, mockMissions } from '@/lib/mockData';
import { useLiffAuth } from '@/contexts/LiffContext';
import { EventItem, Mission, MissionSubmission } from '@/types';
import {
  MissionSubmissionRecord,
  normalizeMissionRecords,
  readImageProofFile,
  safeReadLocalStorage,
  safeWriteLocalStorage,
} from '@/components/profile/profileUtils';
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
  Hourglass,
  Clock,
  AlertCircle,
  ImagePlus,
  Trophy
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mission submission form state
  const [missionRecords, setMissionRecords] = useState<Record<string, MissionSubmissionRecord>>({});
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionNote, setMissionNote] = useState('');
  const [missionPhotoName, setMissionPhotoName] = useState('');
  const [missionPhotoPreview, setMissionPhotoPreview] = useState('');
  const [missionError, setMissionError] = useState<string | null>(null);
  const [isReadingMissionPhoto, setIsReadingMissionPhoto] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scopedKey = profile?.id ? `yfti_mission_submissions_${profile.id}` : null;
    const rawScoped = scopedKey ? safeReadLocalStorage<unknown>(scopedKey, null) : null;
    const rawLegacy =
      rawScoped === null ? safeReadLocalStorage<unknown>('yfti_mission_submissions', null) : null;
    setMissionRecords(normalizeMissionRecords(rawScoped ?? rawLegacy));
  }, [profile?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const openMissionModal = (mission: Mission) => {
    const existing = missionRecords[mission.id];
    setSelectedMission(mission);
    setMissionNote(existing?.note || '');
    setMissionPhotoName(existing?.fileName || '');
    setMissionPhotoPreview(existing?.previewDataUrl || '');
    setMissionError(null);
  };

  const closeMissionModal = () => {
    setSelectedMission(null);
    setMissionError(null);
  };

  const handleMissionPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setMissionError(null);
    setIsReadingMissionPhoto(true);
    try {
      const { fileName, previewDataUrl } = await readImageProofFile(file);
      setMissionPhotoName(fileName);
      setMissionPhotoPreview(previewDataUrl);
    } catch (err) {
      setMissionError(
        err instanceof Error ? err.message : 'ไม่สามารถอ่านไฟล์รูปภาพได้ กรุณาลองใหม่'
      );
    } finally {
      setIsReadingMissionPhoto(false);
    }
  };

  const handleMissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission) return;

    if (!missionPhotoPreview && !missionPhotoName) {
      setMissionError('กรุณาอัปโหลดรูปภาพหลักฐานการทำภารกิจ');
      return;
    }

    const record: MissionSubmissionRecord = {
      status: 'PENDING',
      fileName: missionPhotoName || 'mission-proof.jpg',
      note: missionNote.trim() || undefined,
      submittedAt: new Date().toISOString(),
      previewDataUrl: missionPhotoPreview || undefined,
    };

    const updatedRecords: Record<string, MissionSubmissionRecord> = {
      ...missionRecords,
      [selectedMission.id]: record,
    };

    setMissionRecords(updatedRecords);
    safeWriteLocalStorage('yfti_mission_submissions', updatedRecords);
    if (profile?.id) {
      safeWriteLocalStorage(`yfti_mission_submissions_${profile.id}`, updatedRecords);
    }

    // Also store in custom mission submissions queue for Admin review
    const existingQueue = safeReadLocalStorage<MissionSubmission[]>(
      'yfti_custom_mission_submissions',
      [],
      (v): v is MissionSubmission[] => Array.isArray(v)
    );
    const newSubmission: MissionSubmission = {
      id: `sub-${Date.now()}`,
      profile_id: profile?.id || '3296',
      user_name: profile?.display_name || applicantName || 'สมาชิก YFTI 11',
      user_picture: profile?.picture_url,
      mission_id: selectedMission.id,
      mission_title: selectedMission.title,
      event_id: event?.id,
      event_title: event?.title,
      event_type: event?.event_type || 'general',
      photo_storage_path:
        missionPhotoPreview ||
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80',
      notes: missionNote.trim() || undefined,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    const nextQueue = [
      newSubmission,
      ...existingQueue.filter(
        (s) => !(s.mission_id === selectedMission.id && s.profile_id === newSubmission.profile_id)
      ),
    ];
    safeWriteLocalStorage('yfti_custom_mission_submissions', nextQueue);

    closeMissionModal();
    showToast('ส่งหลักฐานภารกิจเรียบร้อยแล้ว รอแอดมินตรวจสอบ');
  };

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
    : [event.image_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp'];

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
      showToast('คัดลอกลิงก์กิจกรรมเรียบร้อยแล้ว');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#161C2C] pb-24">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0D1321] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#ECD28E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Obsidian Luxury Hero Header */}
      <div className="luxury-stage text-white pt-6 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 text-[#ECD28E]" /> กลับหน้ารวมกิจกรรม
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full transition backdrop-blur-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ECD28E]" /> แชร์กิจกรรม
            </button>
          </div>

          {/* Title */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {event.is_mandatory ? (
                <span className="px-3 py-0.5 rounded-full badge-gold-metallic text-[11px] font-extrabold tracking-wider uppercase">
                  วิชาบังคับ (80%)
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-bold backdrop-blur-sm">
                  กิจกรรมทั่วไป
                </span>
              )}
              {event.isCheckedIn && (
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> เข้าร่วมแล้ว
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {event.title}
            </h1>
          </div>

          {/* Meta Info Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ECD28E]" />
              <span>เผยแพร่ {event.published_date_text || '24 พฤษภาคม 2025'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#ECD28E]" />
              <span>ผู้เขียน {event.author_name || 'admin'}</span>
            </div>
            {event.location_name && (
              <div className="flex items-center gap-2 truncate max-w-md">
                <MapPin className="w-4 h-4 text-[#ECD28E] shrink-0" />
                <span className="truncate">{event.location_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlapping Warm Limestone Sheet */}
      <div className="relative z-20 -mt-6 bg-[#F4F1EA] rounded-t-[24px] pt-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Featured Photo (Borderless) */}
          <div className="relative w-full h-[240px] sm:h-[380px] lg:h-[440px] rounded-[24px] overflow-hidden shadow-[0_12px_30px_rgba(13,19,33,0.14)] bg-[#0D1321]">
            <img
              src={event.image_url || gallery[0]}
              alt={event.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute bottom-3.5 right-3.5 flex items-center gap-2">
              <span className="text-xs font-bold text-[#ECD28E] bg-[#0D1321]/85 backdrop-blur-md px-3 py-1 rounded-full">
                +{event.reward_points} Points
              </span>
              <span className="text-xs font-bold text-white bg-[#0D1321]/85 backdrop-blur-md px-3 py-1 rounded-full font-mono">
                +{event.reward_xp} XP
              </span>
            </div>
          </div>

          {/* Action Panel: Editorial Activity Pass (Direct on #F4F1EA, Sharp 4px Buttons, Zero Wrapping) */}
          <div className="pb-6 border-b border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <div className="text-[10px] font-medium text-[#8E7338] uppercase tracking-[0.26em]">
                ACTIVITY PASS
              </div>
              <div className="text-base sm:text-lg font-bold text-[#0F1521] tracking-tight">
                {event.isCheckedIn ? 'คุณเช็กชื่อเข้าร่วมกิจกรรมนี้แล้ว' : 'เข้าร่วมกิจกรรมและสะสมคะแนน'}
              </div>
              <p className="text-xs text-[#64625A]">
                บันทึกลงปฏิทินส่วนตัว หรือเปิด QR Code สำหรับเช็กชื่อหน้างาน
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[4px] border border-[#0F1521]/20 hover:border-[#0F1521] text-[#0F1521] text-xs font-semibold whitespace-nowrap transition"
              >
                <Calendar className="w-3.5 h-3.5 text-[#8E7338] shrink-0" strokeWidth={1.5} />
                <span>เพิ่มลงปฏิทิน</span>
              </a>

              {event.status === 'UPCOMING' && (registrationStatus === 'NONE' || registrationStatus === 'REJECTED') && (
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[4px] bg-[#0F1521] hover:bg-[#1A2438] text-[#C4A052] text-xs font-semibold whitespace-nowrap transition"
                >
                  <Ticket className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  <span>{registrationStatus === 'REJECTED' ? 'ส่งสลิปใหม่' : 'สมัครเข้าร่วม'}</span>
                </button>
              )}

              {event.status === 'UPCOMING' && registrationStatus === 'PENDING' && (
                <span className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[4px] border border-[#8E7338]/40 text-[#8E7338] text-xs font-semibold whitespace-nowrap">
                  <Hourglass className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  <span>รออนุมัติสลิป</span>
                </span>
              )}

              {(event.status !== 'UPCOMING' || registrationStatus === 'APPROVED') && (
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[4px] bg-[#0F1521] hover:bg-[#1A2438] text-white text-xs font-semibold whitespace-nowrap transition"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#C4A052] shrink-0" strokeWidth={1.5} />
                  <span>{event.isCheckedIn ? 'ดู QR Code' : 'เปิด QR เข้าร่วม'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= EVENT OVERVIEW (CLASSIC EDITORIAL — DIRECTLY ON #F4F1EA CANVAS) ================= */}
          <section className="pt-2 space-y-5">
            <div className="space-y-1.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#8E7338] block">
                EVENT OVERVIEW
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0F1521] tracking-tight">
                รายละเอียดกิจกรรม
              </h3>
            </div>

            <div className="space-y-3.5">
              {event.content_paragraphs && event.content_paragraphs.length > 0 ? (
                event.content_paragraphs.map((p, idx) => (
                  <p key={idx} className="text-[#2C3342] text-sm sm:text-[15px] leading-relaxed font-normal">
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-[#2C3342] text-sm sm:text-[15px] leading-relaxed font-normal">
                  {event.description}
                </p>
              )}
            </div>

            {event.location_name && (
              <div className="pt-4 border-t border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin
                    className="w-4 h-4 text-[#8E7338] shrink-0 mt-0.5"
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7A756A] block">
                      สถานที่จัดงาน
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-[#0F1521] leading-snug mt-0.5">
                      {event.location_name}
                    </p>
                  </div>
                </div>
                {event.google_maps_url && (
                  <a
                    href={event.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#0F1521] hover:text-[#8E7338] underline underline-offset-4 decoration-[#8E7338]/60 pl-6 sm:pl-0 shrink-0 transition"
                  >
                    ดูแผนที่ →
                  </a>
                )}
              </div>
            )}
          </section>

          {/* ================= IN-EVENT MISSIONS (EDITORIAL PRIVATE CLUB LIST — NO NESTED CARDS) ================= */}
          <section className="space-y-1">
            {/* Flat #0F1521 Sharp Title Bar (No Gradient, No Glows, No Pill Capsule) */}
            <div className="bg-[#0F1521] text-white rounded-[4px] px-4 py-3.5 sm:px-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Trophy
                  className="w-4 h-4 text-[#C4A052] shrink-0"
                  strokeWidth={1.5}
                />
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight truncate">
                    ภารกิจสะสมแต้มในกิจกรรม
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    แตะที่รายการเพื่อส่งหลักฐานรับคะแนน
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C4A052] tabular-nums shrink-0">
                +{event.reward_points + 260} PTS
              </span>
            </div>

            {/* Borderless Hairline Editorial List Directly on #F4F1EA */}
            <div className="divide-y divide-black/[0.07] border-b border-black/[0.07]">
              {/* 01 Check-in Row */}
              <div className="py-4 px-1 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <span className="text-[11px] font-mono text-[#8E7338] tabular-nums pt-0.5 shrink-0">
                    01
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-[#0F1521] leading-snug">
                      เช็กชื่อเข้าร่วมกิจกรรม
                    </p>
                    <p className="text-xs text-[#64625A] leading-relaxed">
                      สแกน QR บัตรเข้าร่วมกับทีมงานหน้างาน
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0F1521] tabular-nums pt-0.5 shrink-0">
                  +{event.reward_points} PTS
                </span>
              </div>

              {mockMissions.map((m, idx) => {
                const record = missionRecords[m.id];
                const resolvedStatus = record?.status || m.status || 'NOT_STARTED';
                const cleanTitle = m.title.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, '').trim();
                const rowNumber = String(idx + 2).padStart(2, '0');
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => openMissionModal(m)}
                    className="w-full text-left py-4 px-1 hover:bg-black/[0.025] flex items-start justify-between gap-4 transition group cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-[#8E7338] tabular-nums pt-0.5 shrink-0">
                        {rowNumber}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          <p className="text-sm font-semibold text-[#0F1521] group-hover:text-[#8E7338] transition-colors leading-snug">
                            {cleanTitle}
                          </p>
                          {resolvedStatus === 'APPROVED' && (
                            <span className="text-[11px] font-medium text-[#4A7558] tracking-wide">
                              • สำเร็จแล้ว
                            </span>
                          )}
                          {resolvedStatus === 'PENDING' && (
                            <span className="text-[11px] font-medium text-[#9B7B38] tracking-wide">
                              • รอตรวจสอบ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64625A] leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8E7338] tabular-nums pt-0.5 shrink-0">
                      +{m.reward_points} PTS
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Photo Gallery Grid (Only shown after event has started/completed) */}
          {event.status !== 'UPCOMING' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">
                  ภาพบรรยากาศ ({gallery.length} ภาพ)
                </h3>
                <span className="text-xs text-slate-500">คลิกที่ภาพเพื่อดูขนาดเต็ม</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {gallery.map((imgUrl, index) => (
                  <div
                    key={index}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-[#0D1321] cursor-pointer shadow-[0_6px_18px_rgba(13,19,33,0.08)] transition-all duration-300"
                  >
                    <img
                      src={imgUrl}
                      alt={`ภาพที่ ${index + 1}`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="p-2.5 rounded-full bg-white/90 text-[#161C2C] shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Activities Grid (Full-Bleed Text-Over-Image Poster Cards matching Home) */}
          <div className="pt-4 space-y-4">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">
              กิจกรรมอื่นๆ ในโครงการ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherEvents.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="relative h-[200px] sm:h-[214px] rounded-[22px] overflow-hidden bg-[#0D1321] shadow-[0_6px_18px_rgba(13,19,33,0.10)] hover:shadow-[0_12px_28px_rgba(13,19,33,0.16)] transition-all duration-300 group hover:-translate-y-0.5 block"
                >
                  <img
                    src={ev.image_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp'}
                    alt={ev.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(9,14,26,0.22) 0%, rgba(9,14,26,0.38) 45%, rgba(9,14,26,0.94) 100%)',
                    }}
                  />

                  <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
                    <div>
                      {ev.is_mandatory ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0D1321]/80 backdrop-blur-md text-[#ECD28E]">
                          วิชาบังคับ
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0D1321]/75 backdrop-blur-md text-white">
                          กิจกรรมทั่วไป
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-[#ECD28E]">
                        {ev.published_date_text || '2026'}
                      </p>
                      <h4 className="text-sm font-extrabold text-white line-clamp-2 leading-snug">
                        {ev.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
      {/* Mission Submission Modal */}
      {selectedMission && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-modal-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={closeMissionModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeMissionModal}
              aria-label="ปิดหน้าต่าง"
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mission Summary Header: Title, Description, Reward Points */}
            <div className="space-y-2.5 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  +{selectedMission.reward_points} Pts
                </span>
                {selectedMission.reward_xp > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                    +{selectedMission.reward_xp} XP
                  </span>
                )}
              </div>
              <h3
                id="mission-modal-title"
                className="text-lg font-extrabold text-[#1E2538] leading-snug"
              >
                {selectedMission.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedMission.description}
              </p>
            </div>

            {(() => {
              const currentStatus =
                missionRecords[selectedMission.id]?.status || selectedMission.status || 'NOT_STARTED';
              const isApproved = currentStatus === 'APPROVED';

              return (
                <form onSubmit={handleMissionSubmit} className="space-y-4">
                  {currentStatus === 'PENDING' && (
                    <div className="p-3 rounded-xl bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] text-xs font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>ส่งหลักฐานแล้ว กำลังรอแอดมินตรวจสอบ (สามารถอัปเดตหลักฐานใหม่ได้)</span>
                    </div>
                  )}

                  {isApproved && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>ภารกิจนี้ได้รับการอนุมัติและรับคะแนนเรียบร้อยแล้ว</span>
                    </div>
                  )}

                  {missionError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{missionError}</span>
                    </div>
                  )}

                  {/* Image Upload Box */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1E2538]">
                      อัปโหลดรูปภาพหลักฐาน <span className="text-rose-500">*</span>
                    </label>
                    <label
                      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed transition text-xs font-semibold ${
                        isApproved
                          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                          : 'border-slate-300 hover:border-[#C59B38] bg-slate-50 hover:bg-[#FBF6EC]/40 text-slate-600 cursor-pointer'
                      }`}
                    >
                      {missionPhotoPreview ? (
                        <div className="w-full space-y-2 flex flex-col items-center">
                          <img
                            src={missionPhotoPreview}
                            alt="ตัวอย่างรูปหลักฐานภารกิจ"
                            className="max-h-48 w-auto rounded-xl object-contain border border-slate-200 bg-white shadow-sm"
                          />
                          {!isApproved && (
                            <span className="text-[11px] font-bold text-[#9A7320] underline">
                              เปลี่ยนรูปภาพ ({missionPhotoName})
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#B38728] shadow-sm">
                            <ImagePlus className="w-5 h-5" />
                          </div>
                          <div className="text-center space-y-0.5">
                            <p className="font-bold text-[#1E2538]">
                              {isReadingMissionPhoto ? 'กำลังประมวลผลรูปภาพ...' : 'คลิกเพื่ออัปโหลดรูปภาพ'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 5 MB
                            </p>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isApproved || isReadingMissionPhoto}
                        className="hidden"
                        onChange={handleMissionPhotoChange}
                      />
                    </label>
                  </div>

                  {/* Note Textarea */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="mission-note-textarea"
                      className="block text-xs font-bold text-[#1E2538]"
                    >
                      Note (รายละเอียดเพิ่มเติม)
                    </label>
                    <textarea
                      id="mission-note-textarea"
                      rows={3}
                      disabled={isApproved}
                      value={missionNote}
                      onChange={(e) => setMissionNote(e.target.value)}
                      placeholder="ระบุรายละเอียดการทำภารกิจ เช่น ชื่อเพื่อนที่ถ่ายรูปด้วย หรือสรุปประเด็นที่พูดคุย..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#1E2538] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#C59B38] focus:border-[#C59B38] resize-none disabled:opacity-60"
                    />
                  </div>

                  {/* Submit Button */}
                  {!isApproved ? (
                    <button
                      type="submit"
                      disabled={isReadingMissionPhoto}
                      className="w-full py-3 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition shadow-sm"
                    >
                      ยืนยันการทำภารกิจ
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={closeMissionModal}
                      className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E2538] text-xs sm:text-sm font-bold transition"
                    >
                      ปิดหน้าต่าง
                    </button>
                  )}
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

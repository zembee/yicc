'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockEvents, mockMissions } from '@/lib/mockData';
import { useLiffAuth } from '@/contexts/LiffContext';
import {
  EventItem,
  Mission,
  MissionSubmission,
  CourseSession,
  CourseSessionMission,
} from '@/types';
import {
  getCourseSummary,
  getSessionDateMeta,
  readCourseSessionCheckins,
  writeCourseSessionCheckin,
} from '@/lib/courseUtils';
import {
  MissionSubmissionRecord,
  normalizeMissionRecords,
  readImageProofFile,
  safeReadLocalStorage,
  safeWriteLocalStorage,
} from '@/components/profile/profileUtils';
import { CourseSalesView } from '@/components/events/CourseSalesView';
import { CourseRegistrationView } from '@/components/events/CourseRegistrationView';
import { CourseSessionSheet } from '@/components/events/CourseSessionSheet';
import {
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  ArrowRight,
  QrCode,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Share2,
  Sparkles,
  Upload,
  Ticket,
  Hourglass,
  Clock,
  AlertCircle,
  ImagePlus,
  Trophy,
  Lock,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type AnyMission = Mission | CourseSessionMission;

export default function EventDetailPage() {
  const params = useParams();
  const { profile } = useLiffAuth();
  const rawId = decodeURIComponent((params.id as string) || '');

  const [customEvents, setCustomEvents] = useState<EventItem[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<
    'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('NONE');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCourseRegisterPageOpen, setIsCourseRegisterPageOpen] = useState(false);
  const [previewTodayMode, setPreviewTodayMode] = useState(false);

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

  const allEvents = [...customEvents, ...mockEvents];
  const event = allEvents.find(
    (ev) => ev.id === rawId || ev.slug === rawId || encodeURIComponent(ev.slug || '') === rawId
  );

  useEffect(() => {
    if (!event || typeof window === 'undefined') return;
    const paramsQuery = new URLSearchParams(window.location.search);
    const autoOpenRegister = paramsQuery.get('register') === '1';
    const isPreviewToday =
      paramsQuery.get('preview') === 'today' || paramsQuery.get('today') === '1';
    setPreviewTodayMode(isPreviewToday);

    if (event.isRegisteredForEvent) {
      setRegistrationStatus('APPROVED');
      return;
    }

    try {
      const regs = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
      const found = Array.isArray(regs)
        ? regs.find((r: any) => String(r.eventId) === String(event.id))
        : null;
      if (found) {
        setRegistrationStatus(found.status);
        if (found.status === 'REJECTED' && autoOpenRegister && event.status === 'UPCOMING') {
          setIsCourseRegisterPageOpen(true);
        }
        return;
      }
    } catch {}

    setRegistrationStatus('NONE');
    if (autoOpenRegister && event.status === 'UPCOMING') {
      setIsCourseRegisterPageOpen(true);
    }
  }, [event]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeQrSession, setActiveQrSession] = useState<CourseSession | null>(null);
  const [selectedSessionForSheet, setSelectedSessionForSheet] = useState<CourseSession | null>(
    null
  );
  const [sessionCheckins, setSessionCheckins] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSessionCheckins(readCourseSessionCheckins(profile?.id));
  }, [profile?.id]);

  // Mission submission form state
  const [missionRecords, setMissionRecords] = useState<Record<string, MissionSubmissionRecord>>({});
  const [selectedMission, setSelectedMission] = useState<AnyMission | null>(null);
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

  const openMissionModal = (mission: AnyMission) => {
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

  const handleToggleSessionCheckin = (session: CourseSession) => {
    const nextState = !session.isCheckedIn;
    const updated = writeCourseSessionCheckin(session.id, nextState, profile?.id);
    setSessionCheckins(updated);
    showToast(
      nextState
        ? `เช็กชื่อคลาสที่ ${session.session_number} สำเร็จ (+${session.reward_points} Pts)`
        : `ยกเลิกสถานะเช็กชื่อคลาสที่ ${session.session_number} แล้ว`
    );
  };

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#212542]">ไม่พบข้อมูลกิจกรรม</h2>
        <p className="text-slate-500 text-sm">ขออภัย ไม่พบกิจกรรมหรือคอร์สเรียนที่คุณกำลังค้นหา</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#212542] text-white text-sm font-semibold hover:bg-[#2e335b] transition"
        >
          <ArrowLeft className="w-4 h-4" /> กลับหน้ารวมกิจกรรม
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('คัดลอกลิงก์เรียบร้อยแล้ว');
    }
  };

  const isCourse = event.event_type === 'course';
  const isEnrolledOrActive =
    Boolean(event.isRegisteredForEvent) ||
    Boolean(event.isCheckedIn) ||
    registrationStatus === 'APPROVED' ||
    event.status !== 'UPCOMING';

  // ================= VIEW B: DEDICATED 4-STEP REGISTRATION FORM (COURSES & EVENTS) =================
  if (isCourseRegisterPageOpen) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#0D1321] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#ECD28E]" />
            <span>{toastMessage}</span>
          </div>
        )}
        <CourseRegistrationView
          course={event}
          profile={profile}
          onBack={() => setIsCourseRegisterPageOpen(false)}
          onSubmitSuccess={(status, msg) => {
            setRegistrationStatus(status);
            setIsCourseRegisterPageOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast(msg);
          }}
        />
      </>
    );
  }

  // ================= VIEW A: SALES / OVERVIEW PAGE (UN-REGISTERED COURSE OR EVENT) =================
  if (!isEnrolledOrActive) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#0D1321] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#ECD28E]" />
            <span>{toastMessage}</span>
          </div>
        )}
        <CourseSalesView
          course={event}
          registrationStatus={registrationStatus}
          onStartRegister={() => {
            setIsCourseRegisterPageOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onShare={handleShare}
        />
      </>
    );
  }

  // ================= VIEW C / D: ENROLLED COURSE & GENERAL EVENT DETAIL =================
  const isCourseWithSessions =
    isCourse && Array.isArray(event.sessions) && event.sessions.length > 0;

  const courseSummary = isCourseWithSessions
    ? getCourseSummary(event, sessionCheckins, missionRecords)
    : null;

  const forceTodaySessionId =
    previewTodayMode && courseSummary?.nextSession ? courseSummary.nextSession.id : null;

  const activeSheetSessionSynced =
    selectedSessionForSheet && courseSummary
      ? courseSummary.sessions.find((s) => s.id === selectedSessionForSheet.id) ||
        selectedSessionForSheet
      : null;

  const gallery =
    event.gallery_images && event.gallery_images.length > 0
      ? event.gallery_images
      : [
          event.image_url ||
            'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp',
        ];

  const otherEvents = mockEvents.filter((ev) => ev.id !== event.id).slice(0, 3);

  const googleCalendarUrl = (() => {
    try {
      const startIso = new Date(event.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
      const endIso = new Date(event.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.title
      )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(
        event.description
      )}&location=${encodeURIComponent(event.location_name)}`;
    } catch {
      return '#';
    }
  })();

  const heroNextSession = courseSummary?.nextSession || null;
  const heroNextDateMeta = heroNextSession
    ? getSessionDateMeta(heroNextSession, forceTodaySessionId)
    : null;
  const isHeroSessionUnlocked = heroNextDateMeta ? !heroNextDateMeta.isFuture : false;

  return (
    <div className="bg-[#F6F4EF] text-[#161C2C] pb-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0D1321] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#ECD28E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Obsidian Luxury Hero Header (Sticky) */}
      <div className="sticky top-0 md:top-24 z-30 luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 lg:px-8 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)]">
        <div className="max-w-4xl mx-auto space-y-3.5">
          {/* Top Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={isCourse ? '/events?category=course' : '/events'}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#ECD28E]" />
              <span>{isCourse ? 'กลับหน้าคอร์สเรียน' : 'กลับหน้ากิจกรรม'}</span>
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full transition backdrop-blur-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ECD28E]" /> แชร์กิจกรรม
            </button>
          </div>

          {/* Badges & Title */}
          <div className="space-y-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              {event.is_mandatory ? (
                <span className="px-3 py-0.5 rounded-full badge-gold-metallic text-[11px] font-extrabold tracking-wide">
                  วิชาบังคับ (80%)
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-bold backdrop-blur-sm">
                  {isCourse ? 'คอร์สเรียน' : 'กิจกรรมทั่วไป'}
                </span>
              )}
              {event.isCheckedIn ? (
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> เข้าร่วมแล้ว
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#ECD28E] text-[11px] font-bold">
                  ลงทะเบียนแล้ว
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug tracking-tight">
              {event.title}
            </h1>
          </div>

          {/* Clean Location Line (Consistent Across Courses & Activities) */}
          {event.location_name && (
            <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#ECD28E] shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Warm Limestone Content Sheet */}
      <div className="relative z-10 bg-[#F6F4EF] pt-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Featured Photo */}
          <div className="relative w-full h-[216px] sm:h-[340px] lg:h-[400px] rounded-[22px] overflow-hidden shadow-[0_10px_28px_rgba(13,19,33,0.12)] bg-[#796B4F]">
            <img
              src={event.image_url || gallery[0]}
              alt={event.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-xs font-extrabold text-white luxury-gold-btn px-3 py-1 rounded-full tabular-nums">
                +{event.reward_points} Points
              </span>
              <span className="text-xs font-extrabold text-white bg-[#12192B]/90 backdrop-blur-md px-3 py-1 rounded-full tabular-nums">
                +{event.reward_xp} XP
              </span>
            </div>
          </div>

          {/* ================= HERO NEXT / TODAY SESSION CARD (ENROLLED COURSES) ================= */}
          {isCourseWithSessions && heroNextSession && heroNextDateMeta ? (
            <section className="space-y-2.5">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">
                  {heroNextDateMeta.isToday ? 'คลาสวันนี้' : 'คลาสที่กำลังมาถึง'}
                </h2>
                <p className="text-xs text-slate-500">
                  เปิด QR Code เพื่อเช็กชื่อหน้างาน และทำภารกิจของคลาสนี้เพื่อรับคะแนน
                </p>
              </div>

              <div className="bg-white rounded-[22px] p-4 sm:p-5 border border-[#E8DFC8] shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3.5">
                {/* Badges Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#12192B] text-[#ECD28E] text-[10px] font-bold">
                    คลาส {heroNextSession.session_number}
                  </span>

                  {heroNextDateMeta.isToday ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DF4747] text-white text-[10px] font-bold inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      วันนี้
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F6EFE0] text-[#8E6F30] text-[10px] font-bold">
                      {heroNextDateMeta.countdownLabel}
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded-full bg-[#FBF7EE] border border-[#E8DFC8] text-[#8E6F30] text-[10px] font-bold inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    รอเช็กชื่อ
                  </span>
                </div>

                {/* Session Title & Meta */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#161C2C] leading-snug">
                    {heroNextSession.title}
                  </h3>

                  <div className="space-y-1 text-xs text-[#4A5060]">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                      <span>
                        {heroNextSession.date_text} · {heroNextSession.time_text}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                      <span>{heroNextSession.location_name}</span>
                    </p>
                    {heroNextSession.instructor && (
                      <p className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                        <span>วิทยากร: {heroNextSession.instructor}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Primary Check-in CTA (Unlocked vs Locked) */}
                {isHeroSessionUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQrSession(heroNextSession);
                      setIsQrModalOpen(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <QrCode className="w-4 h-4 text-[#ECD28E]" />
                    <span>เปิด QR เช็กชื่อ</span>
                  </button>
                ) : (
                  <div className="w-full py-3 px-4 rounded-xl bg-[#F3EFE6] border border-dashed border-[#CFC6B4] text-xs font-semibold text-[#545047] flex items-center justify-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      เปิด QR เช็กชื่อได้ในอีก{' '}
                      <strong className="font-extrabold text-[#8E6F30]">
                        {heroNextDateMeta.daysUntil} วัน
                      </strong>
                    </span>
                  </div>
                )}

                {/* Per-Class Mission Sub-Card */}
                {heroNextSession.missions && heroNextSession.missions.length > 0 && (
                  <div className="pt-3 border-t border-dashed border-[#E6E0D4] space-y-2">
                    <p className="text-[11px] font-bold text-[#8E6F30]">
                      ภารกิจประจำคลาส {heroNextSession.session_number}
                    </p>

                    {heroNextSession.missions.map((sm) => {
                      const rec = missionRecords[sm.id];
                      const resolvedStatus = rec?.status || sm.status || 'NOT_STARTED';
                      return (
                        <div
                          key={sm.id}
                          className="rounded-2xl bg-[#F6F4EF] p-3.5 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-snug">
                                {sm.title}
                              </p>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {sm.description}
                              </p>
                            </div>
                            <span className="text-xs font-extrabold text-[#8E6F30] tabular-nums shrink-0">
                              +{sm.reward_points} PTS
                            </span>
                          </div>

                          <div className="pt-2.5 border-t border-[#E8E2D5] flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                              <span>
                                {isHeroSessionUnlocked
                                  ? heroNextSession.mission_deadline_text ||
                                    `ส่งได้ถึง ${heroNextSession.date_text} 23:59 น.`
                                  : `เปิดให้ทำในวันเรียน ${heroNextSession.date_text}`}
                              </span>
                            </span>

                            {resolvedStatus === 'APPROVED' ? (
                              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> สำเร็จแล้ว
                              </span>
                            ) : resolvedStatus === 'PENDING' ? (
                              <button
                                type="button"
                                onClick={() => openMissionModal(sm)}
                                className="px-3 py-1 rounded-xl bg-[#FBF6EC] border border-[#E5D3A7] text-[#8E6F30] text-xs font-bold"
                              >
                                รอตรวจสอบ
                              </button>
                            ) : isHeroSessionUnlocked ? (
                              <button
                                type="button"
                                onClick={() => openMissionModal(sm)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs font-bold inline-flex items-center gap-1 transition"
                              >
                                <span>ทำภารกิจ</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#ECD28E]" />
                              </button>
                            ) : (
                              <span className="px-3 py-1 rounded-xl bg-[#EBE6DA] border border-[#D8D1C2] text-slate-500 text-xs font-semibold inline-flex items-center gap-1">
                                <Lock className="w-3 h-3" /> ยังไม่เปิด
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          ) : !isCourseWithSessions ? (
            /* ================= REGISTERED GENERAL EVENT CHECK-IN & IN-EVENT MISSIONS CARD ================= */
            (() => {
              const evMeta = getSessionDateMeta(
                {
                  id: event.id,
                  session_number: 1,
                  title: event.title,
                  date_text: event.published_date_text || '',
                  time_text: '',
                  start_time: event.start_time,
                  end_time: event.end_time,
                  location_name: event.location_name,
                  reward_points: event.reward_points,
                },
                previewTodayMode ? event.id : null
              );
              const isEventUnlocked =
                Boolean(event.isCheckedIn) || event.status !== 'UPCOMING' || !evMeta.isFuture;
              const startD = new Date(event.start_time);
              const endD = new Date(event.end_time);
              const timeStr =
                !Number.isNaN(startD.getTime()) && !Number.isNaN(endD.getTime())
                  ? `${String(startD.getHours()).padStart(2, '0')}:${String(
                      startD.getMinutes()
                    ).padStart(2, '0')} – ${String(endD.getHours()).padStart(2, '0')}:${String(
                      endD.getMinutes()
                    ).padStart(2, '0')} น.`
                  : '18:00 – 22:00 น.';

              return (
                <section className="space-y-2.5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">
                      {event.status !== 'UPCOMING'
                        ? 'บัตรเข้าร่วมและภารกิจกิจกรรม'
                        : evMeta.isToday
                        ? 'กิจกรรมวันนี้'
                        : 'กิจกรรมที่กำลังมาถึง'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      เปิด QR Code เพื่อเช็กชื่อหน้างาน และทำภารกิจในกิจกรรมเพื่อสะสมคะแนน
                    </p>
                  </div>

                  <div className="bg-white rounded-[22px] p-4 sm:p-5 border border-[#E8DFC8] shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#12192B] text-[#ECD28E] text-[10px] font-bold">
                          กิจกรรม
                        </span>
                        {event.isCheckedIn ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> เช็กชื่อแล้ว
                          </span>
                        ) : evMeta.isToday ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#DF4747] text-white text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            วันนี้
                          </span>
                        ) : event.status === 'UPCOMING' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F6EFE0] text-[#8E6F30] text-[10px] font-bold">
                            {evMeta.countdownLabel}
                          </span>
                        ) : null}

                        {!event.isCheckedIn && event.status === 'UPCOMING' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FBF7EE] border border-[#E8DFC8] text-[#8E6F30] text-[10px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            รอเช็กชื่อ
                          </span>
                        )}
                      </div>

                      <a
                        href={googleCalendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-xl bg-[#FAF8F3] hover:bg-[#EFECE4] border border-[#E6E0D4] text-[11px] font-extrabold text-[#161C2C] inline-flex items-center gap-1.5 transition"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#9A742B]" />
                        <span>ลงปฏิทิน</span>
                      </a>
                    </div>

                    <div className="space-y-1 text-xs text-[#4A5060]">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                        <span>
                          {event.published_date_text || evMeta.fullDateThai} · {timeStr}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                        <span>{event.location_name}</span>
                      </p>
                      {event.author_name && (
                        <p className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                          <span>ผู้จัดงาน: {event.author_name}</span>
                        </p>
                      )}
                    </div>

                    {isEventUnlocked ? (
                      <button
                        type="button"
                        onClick={() => setIsQrModalOpen(true)}
                        className="w-full py-3 px-4 rounded-xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"
                      >
                        <QrCode className="w-4 h-4 text-[#ECD28E]" />
                        <span>{event.isCheckedIn ? 'ดู QR บัตรเข้าร่วม' : 'เปิด QR เช็กชื่อ'}</span>
                      </button>
                    ) : (
                      <div className="w-full py-3 px-4 rounded-xl bg-[#F3EFE6] border border-dashed border-[#CFC6B4] text-xs font-semibold text-[#545047] flex items-center justify-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          เปิด QR เช็กชื่อได้ในอีก{' '}
                          <strong className="font-extrabold text-[#8E6F30]">
                            {evMeta.daysUntil} วัน
                          </strong>
                        </span>
                      </div>
                    )}

                    {/* In-Event Missions Inside Luxury Card */}
                    <div className="pt-3 border-t border-dashed border-[#E6E0D4] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-[#8E6F30]">ภารกิจสะสมแต้มในกิจกรรม</p>
                        <span className="text-[11px] font-bold text-[#8E6F30] tabular-nums">
                          +{mockMissions.reduce((acc, m) => acc + m.reward_points, 0)} PTS
                        </span>
                      </div>

                      {mockMissions.map((m) => {
                        const record = missionRecords[m.id];
                        const resolvedStatus = record?.status || m.status || 'NOT_STARTED';
                        const cleanTitle = m.title
                          .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, '')
                          .trim();

                        return (
                          <div
                            key={m.id}
                            className="rounded-2xl bg-[#F6F4EF] p-3.5 space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-0.5 min-w-0">
                                <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-snug">
                                  {cleanTitle}
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  {m.description}
                                </p>
                              </div>
                              <span className="text-xs font-extrabold text-[#8E6F30] tabular-nums shrink-0">
                                +{m.reward_points} PTS
                              </span>
                            </div>

                            <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between gap-2">
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                                <span>
                                  {isEventUnlocked
                                    ? 'ส่งหลักฐานภาพถ่ายเพื่อรับคะแนน'
                                    : `เปิดให้ทำในวันกิจกรรม ${event.published_date_text || ''}`}
                                </span>
                              </span>

                              {resolvedStatus === 'APPROVED' ? (
                                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> สำเร็จแล้ว
                                </span>
                              ) : resolvedStatus === 'PENDING' ? (
                                <button
                                  type="button"
                                  onClick={() => openMissionModal(m)}
                                  className="px-3 py-1 rounded-xl bg-[#FBF6EC] border border-[#E5D3A7] text-[#8E6F30] text-xs font-bold"
                                >
                                  รอตรวจสอบ
                                </button>
                              ) : isEventUnlocked ? (
                                <button
                                  type="button"
                                  onClick={() => openMissionModal(m)}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs font-bold inline-flex items-center gap-1 transition"
                                >
                                  <span>ทำภารกิจ</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#ECD28E]" />
                                </button>
                              ) : (
                                <span className="px-3 py-1 rounded-xl bg-[#EBE6DA] border border-[#D8D1C2] text-slate-500 text-xs font-semibold inline-flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> ยังไม่เปิด
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })()
          ) : null}

          {/* ================= EVENT / COURSE OVERVIEW ================= */}
          <section className="pt-1 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8E7338] block">
                EVENT OVERVIEW
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0F1521] tracking-tight">
                {isCourse ? 'รายละเอียดหลักสูตร' : 'รายละเอียดกิจกรรม'}
              </h3>
            </div>

            <div className="space-y-3">
              {event.content_paragraphs && event.content_paragraphs.length > 0 ? (
                event.content_paragraphs.map((p, idx) => (
                  <p
                    key={idx}
                    className="text-[#2C3342] text-xs sm:text-sm leading-relaxed font-normal"
                  >
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-[#2C3342] text-xs sm:text-sm leading-relaxed font-normal">
                  {event.description}
                </p>
              )}
            </div>

            {event.location_name && (
              <div className="pt-3.5 border-t border-black/[0.07] flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#8E7338] shrink-0 mt-0.5" />
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7A756A] block">
                    {isCourse ? 'สถานที่เข้าเรียน' : 'สถานที่จัดงาน'}
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-[#0F1521] leading-snug">
                    {event.location_name}
                  </p>
                  {event.google_maps_url && (
                    <a
                      href={event.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-bold text-[#0F1521] hover:text-[#8E7338] underline underline-offset-4 decoration-[#8E7338]/70 transition"
                    >
                      ดูแผนที่ →
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ================= COURSE PROGRESS & SESSION SCHEDULE CARDS ================= */}
          {isCourseWithSessions && courseSummary ? (
            <section className="space-y-4">
              {/* Course Progress Summary Card */}
              <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E7338] block">
                    COURSE PROGRESS
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0F1521]">
                    สรุปการเรียนและความคืบหน้าหลักสูตร
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#0F1521]">ความคืบหน้าโดยรวม</span>
                    <span className="text-[#8E7338] tabular-nums">
                      {courseSummary.progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#EFECE4] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#C5A059] to-[#B18A3B] transition-all duration-300"
                      style={{ width: `${courseSummary.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="rounded-xl bg-[#F6F4EF] p-3 text-center">
                    <p className="text-[10px] text-[#64625A] font-medium">เข้าเรียน</p>
                    <p className="text-sm sm:text-base font-extrabold text-[#0F1521] tabular-nums mt-0.5">
                      {courseSummary.attendedSessions}/{courseSummary.totalSessions}
                    </p>
                    <p className="text-[10px] text-[#64625A]">คลาส</p>
                  </div>
                  <div className="rounded-xl bg-[#F6F4EF] p-3 text-center">
                    <p className="text-[10px] text-[#64625A] font-medium">ภารกิจ</p>
                    <p className="text-sm sm:text-base font-extrabold text-[#0F1521] tabular-nums mt-0.5">
                      {courseSummary.completedMissions}/{courseSummary.totalMissions}
                    </p>
                    <p className="text-[10px] text-[#64625A]">รายการ</p>
                  </div>
                  <div className="rounded-xl bg-[#F6F4EF] p-3 text-center">
                    <p className="text-[10px] text-[#64625A] font-medium">คะแนนที่ได้</p>
                    <p className="text-sm sm:text-base font-extrabold text-[#8E7338] tabular-nums mt-0.5">
                      +{courseSummary.earnedPoints}
                    </p>
                    <p className="text-[10px] text-[#64625A]">Pts</p>
                  </div>
                </div>
              </div>

              {/* Schedule Header Bar + Clickable Session Cards */}
              <div className="space-y-3">
                <div className="bg-[#12192B] text-white rounded-[18px] px-4 py-3.5 sm:px-5 flex items-center justify-between gap-3 shadow-[0_8px_22px_rgba(11,16,29,0.14)]">
                  <div className="flex items-center gap-3 min-w-0">
                    <Trophy className="w-4 h-4 text-[#DFC27D] shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                        ตารางเรียน{' '}
                        <span className="text-xs font-bold text-[#ECD28E]">
                          · {courseSummary.totalSessions} คลาส
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-300 truncate">
                        เช็กชื่อและทำภารกิจแยกตามคลาสเรียน
                      </p>
                    </div>
                  </div>

                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-[#C5A059]/40 text-[#ECD28E] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>ลงปฏิทิน</span>
                  </a>
                </div>

                <div className="space-y-2.5">
                  {courseSummary.sessions.map((session) => {
                    const isNextActive = heroNextSession?.id === session.id;
                    const sMeta = getSessionDateMeta(session, forceTodaySessionId);
                    const firstMission = session.missions?.[0];
                    const missionStatus = firstMission
                      ? missionRecords[firstMission.id]?.status ||
                        firstMission.status ||
                        'NOT_STARTED'
                      : null;

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => setSelectedSessionForSheet(session)}
                        className={`w-full text-left rounded-[20px] p-3.5 sm:p-4 flex items-center gap-3.5 transition group ${
                          isNextActive
                            ? 'bg-[#FAF3E3] border border-[#DFC27D] shadow-[0_8px_24px_rgba(197,160,89,0.14)]'
                            : 'bg-white border border-transparent shadow-[0_6px_20px_rgba(13,19,33,0.05)] hover:border-[#DFC27D]/60'
                        }`}
                      >
                        {/* Left Date Badge */}
                        <div
                          className={`w-[56px] h-[68px] rounded-[15px] flex flex-col items-center justify-center shrink-0 ${
                            isNextActive
                              ? 'luxury-gold-btn !text-[#12192B]'
                              : session.isCheckedIn
                              ? 'bg-[#12192B] text-white'
                              : 'bg-[#4E596F] text-white'
                          }`}
                        >
                          <span className="text-[10px] font-semibold opacity-80 leading-none">
                            {sMeta.weekdayShort}
                          </span>
                          <span className="text-xl font-extrabold leading-tight tabular-nums my-0.5">
                            {sMeta.dayNumber}
                          </span>
                          <span className="text-[10px] font-semibold opacity-80 leading-none">
                            {sMeta.monthShort}
                          </span>
                        </div>

                        {/* Middle Session Content */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isNextActive
                                  ? 'bg-[#12192B] text-[#ECD28E]'
                                  : 'bg-[#F6EFE0] text-[#8E6F30]'
                              }`}
                            >
                              คลาส {session.session_number}
                            </span>

                            {session.isCheckedIn ? (
                              <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">
                                ✓ เช็กชื่อแล้ว
                              </span>
                            ) : sMeta.isToday ? (
                              <span className="text-[11px] font-extrabold text-[#C93B3B]">
                                วันนี้
                              </span>
                            ) : isNextActive ? (
                              <span className="text-[11px] font-bold text-[#A54438]">
                                {sMeta.countdownLabel}
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-500">
                                {sMeta.countdownLabel}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-snug line-clamp-2 group-hover:text-[#8E6F30] transition-colors">
                            {session.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                            <Clock className="w-3 h-3 text-[#9A742B] shrink-0" />
                            <span className="truncate">
                              {session.time_text} · {session.location_name}
                            </span>
                          </p>

                          {firstMission && (
                            <p
                              className={`text-[11px] font-bold flex items-center gap-1 truncate ${
                                missionStatus === 'APPROVED'
                                  ? 'text-emerald-700'
                                  : isNextActive
                                  ? 'text-[#8E6F30]'
                                  : 'text-slate-500'
                              }`}
                            >
                              <Trophy className="w-3 h-3 shrink-0" />
                              <span>
                                {missionStatus === 'APPROVED'
                                  ? `ภารกิจสำเร็จแล้ว · +${firstMission.reward_points} Pts`
                                  : missionStatus === 'PENDING'
                                  ? `รอตรวจภารกิจ · +${firstMission.reward_points} Pts`
                                  : isNextActive
                                  ? `ภารกิจยังไม่ส่ง · +${firstMission.reward_points} Pts`
                                  : `ภารกิจเปิดในวันเรียน · +${firstMission.reward_points} Pts`}
                              </span>
                            </p>
                          )}
                        </div>

                        <ChevronRight className="w-4 h-4 text-[#9A742B] group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {/* Photo Gallery Grid (Completed Events) */}
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

          {/* Other Activities Grid */}
          <div className="pt-2 space-y-3.5">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#161C2C]">
              กิจกรรมอื่นๆ ในโครงการ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {otherEvents.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="relative h-[184px] sm:h-[204px] rounded-[22px] overflow-hidden bg-[#0D1321] shadow-[0_6px_18px_rgba(13,19,33,0.10)] hover:shadow-[0_12px_28px_rgba(13,19,33,0.16)] transition-all duration-300 group hover:-translate-y-0.5 block"
                >
                  <img
                    src={
                      ev.image_url ||
                      'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp'
                    }
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

      {/* ================= VIEW E: COURSE SESSION SLIDE-UP SHEET ================= */}
      <CourseSessionSheet
        course={event}
        session={activeSheetSessionSynced}
        isActiveNextSession={
          Boolean(activeSheetSessionSynced) &&
          heroNextSession?.id === activeSheetSessionSynced?.id
        }
        forceTodaySessionId={forceTodaySessionId}
        missionRecords={missionRecords}
        onClose={() => setSelectedSessionForSheet(null)}
        onOpenQrCheckin={(ses) => {
          setActiveQrSession(ses);
          setIsQrModalOpen(true);
        }}
        onOpenMission={(sm) => openMissionModal(sm)}
      />

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 backdrop-blur-md animate-in fade-in duration-200">
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

          <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center p-2">
            <img
              src={gallery[lightboxIndex]}
              alt={`รูปที่ ${lightboxIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />

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

          <div className="w-full max-w-4xl overflow-x-auto py-2 flex items-center justify-center gap-2 no-scrollbar">
            {gallery.slice(0, 15).map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`h-12 w-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                  lightboxIndex === idx ? 'border-[#C5A059] scale-110' : 'border-white/30 opacity-60'
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
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl flex flex-col items-center text-center space-y-4">
            <button
              onClick={() => {
                setIsQrModalOpen(false);
                setActiveQrSession(null);
              }}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="px-3 py-1 rounded-full bg-[#F6EFE0] text-[#8E6F30] text-xs font-extrabold">
                {activeQrSession
                  ? `QR เช็กชื่อคลาสที่ ${activeQrSession.session_number}`
                  : 'QR Code เช็กชื่อเข้าร่วมกิจกรรม'}
              </span>
              <h3 className="text-base font-extrabold text-[#161C2C] line-clamp-2 pt-1">
                {activeQrSession ? activeQrSession.title : event.title}
              </h3>
              {activeQrSession && (
                <p className="text-[11px] text-slate-500">
                  {activeQrSession.date_text} · {activeQrSession.time_text}
                </p>
              )}
            </div>

            <div className="p-4 bg-white border border-[#E6E0D4] rounded-2xl shadow-sm flex items-center justify-center">
              <QRCodeSVG
                value={JSON.stringify({
                  version: 1,
                  type: activeQrSession ? 'COURSE_SESSION_CHECKIN' : 'EVENT_CHECKIN',
                  profileId: profile?.id || '3296',
                  lineUserId: profile?.line_user_id || 'U_SIM_3296',
                  displayName: profile?.display_name || applicantName || 'สมาชิก YFTI 11',
                  eventId: event.id,
                  eventTitle: event.title,
                  sessionId: activeQrSession?.id,
                  sessionNumber: activeQrSession?.session_number,
                  ts: Date.now(),
                })}
                size={196}
                level="H"
                fgColor="#12192B"
                includeMargin
              />
            </div>

            <div className="text-xs text-slate-500 leading-relaxed">
              แสดง QR Code นี้แก่ทีมงานหน้าห้องเพื่อสแกนยืนยันการเข้าร่วมและรับคะแนน{' '}
              <span className="font-extrabold text-[#8E6F30]">
                +{activeQrSession ? activeQrSession.reward_points : event.reward_points} Points
              </span>
            </div>

            {activeQrSession && !activeQrSession.isCheckedIn && (
              <button
                type="button"
                onClick={() => {
                  handleToggleSessionCheckin(activeQrSession);
                  setIsQrModalOpen(false);
                  setActiveQrSession(null);
                }}
                className="w-full py-2.5 rounded-xl luxury-gold-btn !text-[#12192B] text-xs font-extrabold transition"
              >
                จำลองการสแกนเช็กชื่อสำเร็จ
              </button>
            )}

            <button
              onClick={() => {
                setIsQrModalOpen(false);
                setActiveQrSession(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#12192B] text-white text-xs font-bold hover:bg-[#1B2540] transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* General Event Registration Modal */}
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
              <span className="text-[10px] font-black uppercase tracking-widest text-[#9A742B]">
                Event Registration
              </span>
              <h3 className="text-base font-black text-[#1E2538]">{event.title}</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amount =
                  ticketType === 'member' ? event.fee_member ?? 1500 : event.fee_guest ?? 2500;
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
                  const filtered = existing.filter(
                    (r: any) => String(r.eventId) !== String(event.id)
                  );
                  filtered.unshift(newReg);
                  localStorage.setItem('yfti_event_registrations', JSON.stringify(filtered));
                }
                setRegistrationStatus('PENDING');
                setIsRegisterModalOpen(false);
                showToast('ส่งใบสมัครเข้าร่วมกิจกรรมแล้ว รอแอดมินอนุมัติ');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุลผู้เข้าร่วม
                </label>
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
                    <span className="text-xs font-black text-[#9A742B]">
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
                    <span className="text-xs font-black text-[#9A742B]">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  แนบสลิปโอนเงิน
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#C5A059] bg-slate-50 cursor-pointer transition text-xs font-bold text-slate-600">
                  {slipDataUrl ? (
                    <img
                      src={slipDataUrl}
                      alt="ตัวอย่างสลิปโอนเงิน"
                      className="max-h-40 rounded-xl object-contain border border-slate-200 bg-white"
                    />
                  ) : null}
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#9A742B]" />
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
                className="w-full py-3 rounded-2xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs sm:text-sm font-black transition shadow-md"
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

            <div className="space-y-2.5 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />+{selectedMission.reward_points} Pts
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
                missionRecords[selectedMission.id]?.status ||
                selectedMission.status ||
                'NOT_STARTED';
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
                              {isReadingMissionPhoto
                                ? 'กำลังประมวลผลรูปภาพ...'
                                : 'คลิกเพื่ออัปโหลดรูปภาพ'}
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

                  {!isApproved ? (
                    <button
                      type="submit"
                      disabled={isReadingMissionPhoto}
                      className="w-full py-3 rounded-xl bg-[#12192B] hover:bg-[#1B2540] disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition shadow-sm"
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

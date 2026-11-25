'use client';

import React from 'react';
import { CourseSession, CourseSessionMission, EventItem } from '@/types';
import { MissionSubmissionRecord } from '@/components/profile/profileUtils';
import {
  getSessionAgenda,
  getSessionDateMeta,
  getSessionMaxPoints,
} from '@/lib/courseUtils';
import {
  X,
  Calendar,
  MapPin,
  User,
  UserCheck,
  Trophy,
  Lock,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface CourseSessionSheetProps {
  course: EventItem;
  session: CourseSession | null;
  isActiveNextSession?: boolean;
  forceTodaySessionId?: string | null;
  missionRecords: Record<string, MissionSubmissionRecord>;
  onClose: () => void;
  onOpenQrCheckin: (session: CourseSession) => void;
  onOpenMission: (mission: CourseSessionMission) => void;
}

export const CourseSessionSheet: React.FC<CourseSessionSheetProps> = ({
  course,
  session,
  isActiveNextSession = false,
  forceTodaySessionId,
  missionRecords,
  onClose,
  onOpenQrCheckin,
  onOpenMission,
}) => {
  if (!session) return null;

  const dateMeta = getSessionDateMeta(session, forceTodaySessionId);
  const agenda = getSessionAgenda(session);
  const maxPts = getSessionMaxPoints(session);
  const missions = session.missions || [];

  const totalTasks = 1 + missions.length;
  const completedMissionsCount = missions.filter((m) => {
    const st = missionRecords[m.id]?.status || m.status || 'NOT_STARTED';
    return st === 'APPROVED' || st === 'PENDING';
  }).length;
  const completedTasksCount = (session.isCheckedIn ? 1 : 0) + completedMissionsCount;

  const sessionCalendarUrl = (() => {
    try {
      const startIso = new Date(session.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
      const endIso = new Date(session.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        `${course.title} — ${session.title}`
      )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(
        course.description
      )}&location=${encodeURIComponent(session.location_name)}`;
    } catch {
      return '#';
    }
  })();

  const isUnlocked = Boolean(session.isCheckedIn) || !dateMeta.isFuture;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={session.title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#080C18]/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#F6F4EF] rounded-t-[28px] sm:rounded-[28px] shadow-[0_-14px_44px_rgba(0,0,0,0.45)] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#D5CEBF]" />
        </div>

        {/* Sheet Header */}
        <div className="px-4 sm:px-5 pt-2 pb-3.5 flex items-start gap-3.5 shrink-0">
          <div
            className={`w-[58px] h-[68px] rounded-[16px] flex flex-col items-center justify-center shrink-0 ${
              isActiveNextSession || dateMeta.isToday
                ? 'luxury-gold-btn !text-[#12192B]'
                : 'bg-[#12192B] text-white'
            }`}
          >
            <span className="text-[10px] font-semibold opacity-80 leading-none">
              {dateMeta.weekdayShort}
            </span>
            <span className="text-xl font-extrabold leading-tight tabular-nums my-0.5">
              {dateMeta.dayNumber}
            </span>
            <span className="text-[10px] font-semibold opacity-80 leading-none">
              {dateMeta.monthShort}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#12192B] text-[#ECD28E] text-[10px] font-bold">
                คลาส {session.session_number}
              </span>
              {session.isCheckedIn ? (
                <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> เช็กชื่อแล้ว
                </span>
              ) : dateMeta.isToday ? (
                <span className="px-2 py-0.5 rounded-full bg-[#DF4747] text-white text-[10px] font-bold inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  วันนี้
                </span>
              ) : (
                <span className="text-xs font-bold text-[#9A4236]">{dateMeta.countdownLabel}</span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#161C2C] leading-snug">
              {session.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#EFECE4] border border-[#E6E0D4] flex items-center justify-center text-[#161C2C] transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="px-4 sm:px-5 pb-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. Session Details White Card */}
          <div className="bg-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(13,19,33,0.04)] space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-[#161C2C]">
              <Calendar className="w-4 h-4 text-[#9A742B] shrink-0" />
              <span>
                {dateMeta.fullDateThai} · {session.time_text}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-[#161C2C]">
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#9A742B] shrink-0" />
                <span className="truncate">{session.location_name}</span>
              </div>
              {course.google_maps_url && (
                <a
                  href={course.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#8E6F30] underline underline-offset-4 shrink-0"
                >
                  ดูแผนที่
                </a>
              )}
            </div>

            {session.instructor && (
              <div className="flex items-center gap-2.5 text-[#161C2C]">
                <User className="w-4 h-4 text-[#9A742B] shrink-0" />
                <span>วิทยากร: {session.instructor}</span>
              </div>
            )}

            <div className="pt-2.5 border-t border-[#F1ECE2] flex items-center justify-between">
              <span className="text-xs text-slate-500">คะแนนสูงสุดของคลาสนี้</span>
              <span className="text-sm sm:text-base font-extrabold text-[#8E6F30] tabular-nums">
                +{maxPts} Pts
              </span>
            </div>
          </div>

          {/* 2. กำหนดการในคลาส (Agenda) */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#8E6F30] tracking-wide">กำหนดการในคลาส</p>
            <div className="bg-white rounded-[20px] px-4 py-1 shadow-[0_6px_20px_rgba(13,19,33,0.04)] divide-y divide-[#F1ECE2]">
              {agenda.map((row, idx) => (
                <div key={idx} className="py-3 flex items-baseline gap-4 text-xs sm:text-sm">
                  <span className="font-extrabold text-[#8E6F30] tabular-nums w-11 shrink-0">
                    {row.time}
                  </span>
                  <span className="text-[#161C2C] font-medium leading-snug">{row.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. ภารกิจของคลาสนี้ */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#8E6F30] tracking-wide">ภารกิจของคลาสนี้</p>
              <span className="text-xs font-semibold text-slate-500 tabular-nums">
                {completedTasksCount}/{totalTasks} สำเร็จ
              </span>
            </div>

            {/* Task 1: เช็กชื่อเข้าคลาส */}
            <div className="bg-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(13,19,33,0.04)] flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs sm:text-sm font-extrabold text-[#161C2C]">
                      เช็กชื่อเข้าคลาส
                    </p>
                    {session.isCheckedIn && (
                      <span className="text-[10px] font-bold text-emerald-700">• สำเร็จแล้ว</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    สแกน QR กับทีมงานหน้าห้อง {session.checkin_window_text || 'ก่อนเริ่มคลาสเรียน'}
                  </p>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-[#8E6F30] tabular-nums shrink-0">
                +{session.reward_points}
              </span>
            </div>

            {/* Task 2+: Session Missions */}
            {missions.map((sm) => {
              const rec = missionRecords[sm.id];
              const resolvedStatus = rec?.status || sm.status || 'NOT_STARTED';
              return (
                <div
                  key={sm.id}
                  className="bg-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(13,19,33,0.04)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F6EFE0] text-[#9A742B] flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs sm:text-sm font-extrabold text-[#161C2C] leading-snug">
                          {sm.title}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">{sm.description}</p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-[#8E6F30] tabular-nums shrink-0">
                      +{sm.reward_points}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-[#F1ECE2] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#9A742B] shrink-0" />
                      <span>
                        {isUnlocked
                          ? session.mission_deadline_text || `ส่งได้ถึง ${session.date_text} 23:59 น.`
                          : `เปิดให้ทำในวันเรียน ${session.date_text}`}
                      </span>
                    </span>

                    {resolvedStatus === 'APPROVED' ? (
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> สำเร็จแล้ว
                      </span>
                    ) : resolvedStatus === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenMission(sm);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#FBF6EC] text-[#9A742B] text-xs font-bold"
                      >
                        รอตรวจสอบ
                      </button>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenMission(sm);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <span>ทำภารกิจ</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#ECD28E]" />
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-[#EFECE4] border border-[#DCD5C7] text-slate-500 text-xs font-semibold inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> ยังไม่เปิด
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Sheet Footer */}
        <div className="bg-white border-t border-[#E6E0D4] px-4 sm:px-5 pt-3.5 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] sm:py-4 flex items-center gap-2.5 shrink-0">
          <a
            href={sessionCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-[#FAF8F3] hover:bg-[#EFECE4] border border-[#E6E0D4] text-xs font-extrabold text-[#161C2C] inline-flex items-center justify-center gap-1.5 transition shrink-0"
          >
            <Calendar className="w-4 h-4 text-[#9A742B]" />
            <span>ลงปฏิทิน</span>
          </a>

          {session.isCheckedIn ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQrCheckin(session);
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>เช็กชื่อแล้ว (ดู QR)</span>
            </button>
          ) : isUnlocked ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQrCheckin(session);
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition"
            >
              <QrCode className="w-4 h-4 text-[#ECD28E]" />
              <span>เปิด QR เช็กชื่อ</span>
            </button>
          ) : (
            <div className="flex-1 py-3 px-4 rounded-2xl bg-[#EFECE4] border border-dashed border-[#CFC6B4] text-xs font-bold text-[#4A463E] inline-flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                เปิด QR ได้ในอีก{' '}
                <strong className="font-extrabold text-[#8E6F30]">{dateMeta.daysUntil} วัน</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

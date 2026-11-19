'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  GraduationCap,
  Target,
  Upload,
} from 'lucide-react';
import { EventItem, Mission, UserProfile } from '@/types';
import { MissionSubmissionRecord, readImageProofFile } from './profileUtils';

export interface MergedMissionItem extends Mission {
  resolvedStatus: 'APPROVED' | 'PENDING' | 'NOT_STARTED';
  submissionRecord?: MissionSubmissionRecord;
}

interface ProgressSectionProps {
  profile: UserProfile;
  tier: string;
  myEventsList: EventItem[];
  mergedMissions: MergedMissionItem[];
  onSubmitMission: (
    missionId: string,
    record: MissionSubmissionRecord
  ) => void;
}

const MIN_ATTENDANCE_FOR_CERTIFICATE = 80;
const MAX_VISIBLE_EVENTS = 5;
const DEFAULT_EVENT_COVER =
  'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp';

export function ProgressSection({
  profile,
  tier,
  myEventsList,
  mergedMissions,
  onSubmitMission,
}: ProgressSectionProps) {
  const [activeDetailTab, setActiveDetailTab] = useState<'events' | 'missions'>('events');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingMissionId, setUploadingMissionId] = useState<string | null>(null);

  const attendanceRate = Math.max(0, Math.min(100, profile.attendance_rate ?? 0));
  const isCertificateEligible = attendanceRate >= MIN_ATTENDANCE_FOR_CERTIFICATE;
  const registeredEventsCount = myEventsList.length;
  const checkedInCount = myEventsList.filter((ev) => ev.isCheckedIn).length;
  const completedMandatoryCount = myEventsList.filter(
    (ev) => ev.is_mandatory && ev.isCheckedIn
  ).length;
  const totalMandatoryCount = myEventsList.filter((ev) => ev.is_mandatory).length;

  const absentQuota = 2;
  const estimatedAbsentCount =
    totalMandatoryCount > 0
      ? Math.max(0, totalMandatoryCount - completedMandatoryCount)
      : attendanceRate >= 100
      ? 0
      : attendanceRate >= 80
      ? 1
      : 2;
  const remainingQuota = Math.max(0, absentQuota - estimatedAbsentCount);

  const handleMissionFileChange = async (
    missionId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    // Reset input value so the user can re-select the same file if needed
    e.target.value = '';
    if (!file) return;

    setUploadError(null);
    setUploadingMissionId(missionId);
    try {
      const { fileName, previewDataUrl } = await readImageProofFile(file);
      onSubmitMission(missionId, {
        status: 'PENDING',
        fileName,
        submittedAt: new Date().toISOString(),
        previewDataUrl,
      });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่'
      );
    } finally {
      setUploadingMissionId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_6px_24px_rgba(13,19,33,0.06)] overflow-hidden">
      {/* Split-Tone Executive Navy Header */}
      <div className="bg-gradient-to-r from-[#141A2C] via-[#1E2538] to-[#252E46] text-white px-5 py-4 sm:px-6 sm:py-5 border-b-[3px] border-[#FB7170] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 block">
            My Progress
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight truncate">
            ความก้าวหน้าของฉัน
          </h3>
          <p className="text-[11px] text-slate-300 truncate mt-0.5">
            สรุปคะแนน สถานะสมาชิก และโควตาการเข้าร่วม
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-xl badge-gold-metallic text-xs font-extrabold tabular-nums shrink-0">
          {(profile.points_balance ?? 0).toLocaleString()} คะแนน
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* 4 Clean Summary Metric Boxes with Subtle Watermark Icon Backgrounds */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-1">
            <img
              src="/images/icons/points.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-16 h-16 rounded-2xl opacity-[0.14] -rotate-6"
            />
            <span className="relative z-10 text-[#9A7320] text-xs sm:text-sm font-bold block truncate">
              คะแนนสะสม
            </span>
            <p className="relative z-10 text-2xl font-extrabold text-[#1E2538] tabular-nums leading-tight">
              {(profile.points_balance ?? 0).toLocaleString()}
            </p>
            <span className="relative z-10 text-[11px] text-slate-400 tabular-nums block">
              {(profile.xp_balance ?? 0).toLocaleString()} XP
            </span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-1">
            <img
              src="/images/icons/profile.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-16 h-16 rounded-2xl opacity-[0.14] -rotate-6"
            />
            <span className="relative z-10 text-slate-600 text-xs sm:text-sm font-bold block truncate">
              ระดับสมาชิก
            </span>
            <p className="relative z-10 text-2xl font-extrabold text-[#1E2538] leading-tight">
              {tier}
            </p>
            <span className="relative z-10 text-[11px] text-slate-400 block">YFTI Elite 11</span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-1">
            <img
              src="/images/icons/events.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-16 h-16 rounded-2xl opacity-[0.14] -rotate-6"
            />
            <span className="relative z-10 text-slate-600 text-xs sm:text-sm font-bold block truncate">
              กิจกรรมที่สมัคร
            </span>
            <p className="relative z-10 text-2xl font-extrabold text-[#1E2538] tabular-nums leading-tight">
              {registeredEventsCount}
            </p>
            <span className="relative z-10 text-[11px] text-slate-400 tabular-nums block">
              เข้าเรียน {attendanceRate}%
            </span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-1">
            <img
              src="/images/icons/missions.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-16 h-16 rounded-2xl opacity-[0.14] -rotate-6"
            />
            <span className="relative z-10 text-slate-600 text-xs sm:text-sm font-bold block truncate">
              ขาด / โควตา
            </span>
            <p className="relative z-10 text-2xl font-extrabold text-[#1E2538] tabular-nums leading-tight">
              {estimatedAbsentCount}{' '}
              <span className="text-sm font-medium text-slate-400">/ {absentQuota}</span>
            </p>
            <span className="relative z-10 text-[11px] text-[#9A7320] font-semibold tabular-nums block">
              เหลือโควตา {remainingQuota} ครั้ง
            </span>
          </div>
        </div>

        {/* Clean Segmented Tab Switcher & Certificate Badge */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <div
            className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mt-3"
            role="tablist"
            aria-label="รายละเอียดความก้าวหน้า"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeDetailTab === 'events'}
              onClick={() => setActiveDetailTab('events')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeDetailTab === 'events'
                  ? 'bg-[#1E2538] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#1E2538]'
              }`}
            >
              <GraduationCap className={`w-4 h-4 shrink-0 ${activeDetailTab === 'events' ? 'text-[#E5C158]' : ''}`} />
              <span>กิจกรรม / คอร์ส</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeDetailTab === 'missions'}
              onClick={() => setActiveDetailTab('missions')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeDetailTab === 'missions'
                  ? 'bg-[#1E2538] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#1E2538]'
              }`}
            >
              <Target className={`w-4 h-4 shrink-0 ${activeDetailTab === 'missions' ? 'text-[#FB7170]' : ''}`} />
              <span>ภารกิจของฉัน</span>
            </button>
          </div>

          <div
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70 border-l-[3px] ${
              isCertificateEligible ? 'border-l-emerald-500' : 'border-l-[#FB7170]'
            }`}
          >
            <span className="text-xs font-semibold text-slate-600">สิทธิ์รับวุฒิบัตร</span>
            <span
              className={`text-xs font-bold inline-flex items-center gap-1.5 ${
                isCertificateEligible ? 'text-emerald-700' : 'text-[#E05252]'
              }`}
            >
              {isCertificateEligible ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-[#FB7170]" />
              )}
              {isCertificateEligible
                ? 'ผ่านเกณฑ์'
                : `ยังไม่ผ่านเกณฑ์ (ขั้นต่ำ ${MIN_ATTENDANCE_FOR_CERTIFICATE}%)`}
            </span>
          </div>
        </div>

      {activeDetailTab === 'events' ? (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 font-medium">
                อัตราการเข้าเรียนสะสม (Attendance Rate)
              </span>
              <span className="text-lg font-bold text-[#1E2538] tabular-nums">
                {attendanceRate}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C59B38] transition-all"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>เกณฑ์ขั้นต่ำสำหรับจบหลักสูตร: {MIN_ATTENDANCE_FOR_CERTIFICATE}%</span>
              <span className="font-semibold text-[#1E2538] tabular-nums">
                เช็กชื่อแล้ว {checkedInCount}/{registeredEventsCount} กิจกรรม
              </span>
            </div>
          </div>

          {/* Events List (Latest 5 items) */}
          <div className="space-y-2.5 pt-1">
            {myEventsList.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-[#FAFAF8] text-center space-y-2">
                <p className="text-xs font-semibold text-slate-600">
                  ยังไม่มีกิจกรรมที่คุณลงทะเบียน
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] text-white text-xs font-bold transition"
                >
                  ดูกิจกรรมที่เปิดรับสมัคร
                </Link>
              </div>
            ) : (
              <>
                {myEventsList.slice(0, MAX_VISIBLE_EVENTS).map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/70 hover:border-[#C59B38] bg-[#FAFAF8] transition group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-200 border border-slate-200/80 shrink-0">
                      <img
                        src={ev.image_url || DEFAULT_EVENT_COVER}
                        alt={ev.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.onerror = null;
                          img.src = DEFAULT_EVENT_COVER;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-[#1E2538] truncate group-hover:text-[#B38728] transition-colors">
                        {ev.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {ev.published_date_text || 'กำลังจะมาถึง'} • {ev.location_name}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold shrink-0 ${
                        ev.isCheckedIn
                          ? 'text-emerald-700'
                          : ev.status === 'UPCOMING'
                          ? 'text-[#B38728]'
                          : 'text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          ev.isCheckedIn
                            ? 'bg-emerald-500'
                            : ev.status === 'UPCOMING'
                            ? 'bg-[#C59B38]'
                            : 'bg-slate-400'
                        }`}
                      />
                      {ev.isCheckedIn
                        ? 'เช็กชื่อแล้ว'
                        : ev.status === 'UPCOMING'
                        ? 'ลงทะเบียนแล้ว'
                        : 'เข้าร่วมแล้ว'}
                    </span>
                  </Link>
                ))}

                {myEventsList.length > MAX_VISIBLE_EVENTS && (
                  <Link
                    href="/profile/events"
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FBF6EC] border border-slate-200 hover:border-[#C59B38] text-[#1E2538] hover:text-[#9A7320] text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <span>ดูทั้งหมด ({myEventsList.length} รายการ)</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Missions Progress */
        <div className="space-y-2.5">
          {uploadError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {mergedMissions.map((mission) => (
            <div
              key={mission.id}
              className="p-4 rounded-xl border border-slate-200/70 bg-[#FAFAF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1E2538]">{mission.title}</h4>
                  <span className="text-[11px] font-bold text-[#B38728] tabular-nums">
                    +{mission.reward_points} pts
                  </span>
                </div>
                <p className="text-xs text-slate-500">{mission.description}</p>
                {mission.submissionRecord?.fileName && (
                  <p className="text-[11px] text-slate-400 truncate">
                    ไฟล์ที่แนบ: {mission.submissionRecord.fileName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {mission.submissionRecord?.previewDataUrl && (
                  <img
                    src={mission.submissionRecord.previewDataUrl}
                    alt={`หลักฐานภารกิจ ${mission.title}`}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                )}

                {mission.resolvedStatus === 'NOT_STARTED' ? (
                  <label className="px-3.5 py-1.5 rounded-xl bg-[#B89138] hover:bg-[#a37f2d] text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingMissionId === mission.id ? 'กำลังบันทึก...' : 'ส่งหลักฐาน'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingMissionId === mission.id}
                      className="hidden"
                      onChange={(e) => handleMissionFileChange(mission.id, e)}
                    />
                  </label>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold shrink-0 ${
                      mission.resolvedStatus === 'APPROVED'
                        ? 'text-emerald-700'
                        : 'text-[#B38728]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        mission.resolvedStatus === 'APPROVED'
                          ? 'bg-emerald-500'
                          : 'bg-[#C59B38]'
                      }`}
                    />
                    {mission.resolvedStatus === 'APPROVED' ? 'สำเร็จแล้ว' : 'รอตรวจสอบ'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

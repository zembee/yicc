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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1E2538]">ความก้าวหน้าของฉัน</h3>
          <p className="text-xs text-slate-500">สรุปคะแนน สถานะสมาชิก และโควตาการเข้าร่วม</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] text-xs font-bold tabular-nums shrink-0">
          {(profile.points_balance ?? 0).toLocaleString()} คะแนน
        </span>
      </div>

      {/* 4 Clean Summary Metric Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-[#9A7320] text-[11px] font-semibold mb-1">
            <Coins className="w-3.5 h-3.5" />
            <span>Point คะแนนสะสม</span>
          </div>
          <p className="text-xl font-bold text-[#1E2538] tabular-nums">
            {(profile.points_balance ?? 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {(profile.xp_balance ?? 0).toLocaleString()} XP
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-[#1E2538] text-[11px] font-semibold mb-1">
            <Crown className="w-3.5 h-3.5 text-[#B38728]" />
            <span>ระดับสมาชิก</span>
          </div>
          <p className="text-xl font-bold text-[#1E2538]">{tier}</p>
          <span className="text-[11px] text-slate-400">YFTI Elite 11</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-[#1E2538] text-[11px] font-semibold mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-[#B38728]" />
            <span>กิจกรรมที่สมัคร</span>
          </div>
          <p className="text-xl font-bold text-[#1E2538] tabular-nums">{registeredEventsCount}</p>
          <span className="text-[11px] text-slate-400 tabular-nums">
            เข้าเรียน {attendanceRate}%
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-[#1E2538] text-[11px] font-semibold mb-1">
            <Clock className="w-3.5 h-3.5 text-[#B38728]" />
            <span>ขาด / โควตา</span>
          </div>
          <p className="text-xl font-bold text-[#1E2538] tabular-nums">
            {estimatedAbsentCount}{' '}
            <span className="text-sm font-medium text-slate-400">/ {absentQuota}</span>
          </p>
          <span className="text-[11px] text-[#9A7320] tabular-nums">
            เหลือโควตา {remainingQuota} ครั้ง
          </span>
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2 pt-3" role="tablist" aria-label="รายละเอียดความก้าวหน้า">
          <button
            type="button"
            role="tab"
            aria-selected={activeDetailTab === 'events'}
            onClick={() => setActiveDetailTab('events')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              activeDetailTab === 'events'
                ? 'bg-[#1E2538] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>ข้อมูลการเข้าร่วมกิจกรรม/คอร์ส</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeDetailTab === 'missions'}
            onClick={() => setActiveDetailTab('missions')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              activeDetailTab === 'missions'
                ? 'bg-[#1E2538] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>ข้อมูลการเก็บภารกิจ</span>
          </button>
        </div>

        <span
          className={`mt-3 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
            isCertificateEligible
              ? 'bg-[#FBF6EC] text-[#9A7320] border-[#EFE2C2]'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {isCertificateEligible ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
          {isCertificateEligible
            ? 'สิทธิ์รับวุฒิบัตร: ผ่านเกณฑ์'
            : `สิทธิ์รับวุฒิบัตร: ยังไม่ผ่านเกณฑ์ (ขั้นต่ำ ${MIN_ATTENDANCE_FOR_CERTIFICATE}%)`}
        </span>
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
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        ev.isCheckedIn
                          ? 'bg-[#1E2538] text-white'
                          : ev.status === 'UPCOMING'
                          ? 'bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] tabular-nums">
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
                    className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      mission.resolvedStatus === 'APPROVED'
                        ? 'bg-[#1E2538] text-white'
                        : 'bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]'
                    }`}
                  >
                    {mission.resolvedStatus === 'APPROVED' ? 'สำเร็จแล้ว' : 'รอตรวจสอบ'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

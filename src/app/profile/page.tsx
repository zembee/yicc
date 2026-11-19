'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Briefcase,
  CreditCard,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Share2,
  Star,
  Users,
} from 'lucide-react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, mockEvents, mockMissions, yftiParticipants } from '@/lib/mockData';
import { EventItem } from '@/types';
import { WebLoginModal } from '@/components/layout/WebLoginModal';
import { ProfilePageSkeleton } from '@/components/ui/PageSkeletons';
import { MemberCard } from '@/components/profile/MemberCard';
import { HouseMembersModal } from '@/components/profile/HouseMembersModal';
import {
  MergedMissionItem,
  ProgressSection,
} from '@/components/profile/ProgressSection';
import {
  MissionSubmissionRecord,
  copyTextToClipboard,
  formatMemberCode,
  normalizeMissionRecords,
  safeReadLocalStorage,
  safeWriteLocalStorage,
} from '@/components/profile/profileUtils';

const isArrayOfStrings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((item) => typeof item === 'string');

const isArrayOfObjects = (v: unknown): v is Record<string, unknown>[] =>
  Array.isArray(v);

export default function ProfilePage() {
  const { profile, updateRole, logout } = useLiffAuth();
  const [mounted, setMounted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [followingIds, setFollowingIds] = useState<string[] | null>(null);
  const [customEvents, setCustomEvents] = useState<EventItem[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [missionRecords, setMissionRecords] = useState<Record<string, MissionSubmissionRecord>>({});
  const copyTimeoutRef = useRef<number | null>(null);

  const profileId = profile?.id;

  // Cleanup copy feedback timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Load localStorage state per active profile with isolated safe parsers
  useEffect(() => {
    setMounted(true);
    setIsFlipped(false);

    if (typeof window === 'undefined') return;

    const scopedFollowKey = profileId ? `yfti_following_ids_${profileId}` : null;
    const savedFollows =
      (scopedFollowKey ? safeReadLocalStorage<string[] | null>(scopedFollowKey, null, isArrayOfStrings) : null) ??
      safeReadLocalStorage<string[] | null>('yfti_following_ids', null, isArrayOfStrings);
    setFollowingIds(savedFollows);

    const savedCustom = safeReadLocalStorage<EventItem[]>(
      'yfti_custom_events',
      [],
      (v): v is EventItem[] => Array.isArray(v)
    );
    setCustomEvents(savedCustom);

    const savedRegs = safeReadLocalStorage<Record<string, unknown>[]>(
      'yfti_event_registrations',
      [],
      isArrayOfObjects
    );
    const ids = savedRegs
      .filter((r) => {
        if (r.status === 'REJECTED') return false;
        // Filter by active profile if registration stores profileId/userId
        const regOwner = r.profileId ?? r.userId;
        if (profileId && regOwner !== undefined && String(regOwner) !== String(profileId)) {
          return false;
        }
        return r.eventId !== undefined;
      })
      .map((r) => String(r.eventId));
    setRegisteredEventIds(ids);

    const scopedMissionKey = profileId ? `yfti_mission_submissions_${profileId}` : null;
    const rawScopedMissions = scopedMissionKey
      ? safeReadLocalStorage<unknown>(scopedMissionKey, null)
      : null;
    const rawLegacyMissions =
      rawScopedMissions === null
        ? safeReadLocalStorage<unknown>('yfti_mission_submissions', null)
        : null;
    setMissionRecords(normalizeMissionRecords(rawScopedMissions ?? rawLegacyMissions));
  }, [profileId]);

  const sortedHouses = useMemo(
    () => [...mockHouses].sort((a, b) => b.total_points - a.total_points),
    []
  );

  const rawHouseId = (profile?.house_id || profile?.house?.id || 'the_mars')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');

  const currentHouse = useMemo(
    () => sortedHouses.find((h) => h.id.toLowerCase() === rawHouseId) || profile?.house || sortedHouses[0],
    [sortedHouses, rawHouseId, profile?.house]
  );

  const houseRank = useMemo<number | null>(() => {
    const idx = sortedHouses.findIndex((h) => h.id.toLowerCase() === rawHouseId);
    return idx >= 0 ? idx + 1 : null;
  }, [sortedHouses, rawHouseId]);

  const houseMembers = useMemo(
    () =>
      yftiParticipants.filter(
        (p) => (p.star_group || '').trim().toLowerCase().replace(/-/g, '_') === rawHouseId
      ),
    [rawHouseId]
  );

  const allEventsList = useMemo(() => [...customEvents, ...mockEvents], [customEvents]);

  const myEventsList = useMemo(() => {
    return allEventsList.filter(
      (ev) => ev.isRegisteredForEvent || ev.isCheckedIn || registeredEventIds.includes(String(ev.id))
    );
  }, [allEventsList, registeredEventIds]);

  const mergedMissions = useMemo<MergedMissionItem[]>(
    () =>
      mockMissions.map((m) => {
        const record = missionRecords[m.id];
        const fallbackStatus =
          m.status === 'APPROVED' || m.status === 'PENDING' ? m.status : 'NOT_STARTED';
        return {
          ...m,
          resolvedStatus: record?.status ?? fallbackStatus,
          submissionRecord: record,
        };
      }),
    [missionRecords]
  );

  const handleSubmitMission = useCallback(
    (missionId: string, record: MissionSubmissionRecord) => {
      const next: Record<string, MissionSubmissionRecord> = {
        ...missionRecords,
        [missionId]: record,
      };
      setMissionRecords(next);
      const storageKey = profileId
        ? `yfti_mission_submissions_${profileId}`
        : 'yfti_mission_submissions';
      safeWriteLocalStorage(storageKey, next);
    },
    [missionRecords, profileId]
  );

  if (!mounted) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FBF6EC] text-[#B38728] flex items-center justify-center mx-auto">
          <CreditCard className="w-7 h-7" />
        </div>
        <h2 className="font-bold text-lg text-[#1E2538]">ไม่พบข้อมูลบัตรสมาชิก</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          กรุณาเข้าสู่ระบบหรือผูกบัญชีเพื่อเปิดใช้งานบัตรสมาชิกดิจิทัล Young FTI ELITE 11
        </p>
        <button
          type="button"
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full py-3 bg-[#1E2538] hover:bg-[#2B3550] text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          เข้าสู่ระบบสมาชิก
        </button>
        <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  const houseColor = currentHouse?.color_hex || '#C59B38';
  const houseName = currentHouse?.name || 'Mars';
  const housePoints = currentHouse?.total_points ?? 0;
  const memberCode = formatMemberCode(profile.id);
  const tier =
    profile.tier ||
    ((profile.xp_balance ?? 0) >= 2000
      ? 'Platinum'
      : (profile.xp_balance ?? 0) >= 1000
      ? 'Gold'
      : 'Silver');

  // Distinguish explicit empty array [] (0 following) from null (not yet stored locally)
  const followingCount =
    followingIds !== null ? followingIds.length : (profile.following_count ?? 0);
  const followerCount = profile.follower_count ?? 0;
  const profileInDirectory = yftiParticipants.some((p) => String(p.id) === String(profile.id));

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;

    const targetPath = profileInDirectory ? `/yfti_participants/${profile.id}` : '/directory';
    const shareUrl = `${window.location.origin}${targetPath}`;
    const copied = await copyTextToClipboard(shareUrl);

    setCopyStatus(copied ? 'copied' : 'failed');
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus('idle');
      copyTimeoutRef.current = null;
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-24 px-4 sm:px-6 pt-4">
      {/* ================= 1. 3D FLIPPABLE DIGITAL MEMBER CARD ================= */}
      <MemberCard
        profile={profile}
        houseName={houseName}
        memberCode={memberCode}
        tier={tier}
        isFlipped={isFlipped}
        onToggleFlip={() => setIsFlipped((prev) => !prev)}
      />

      {/* ================= 2. PERSONAL & COMPANY INFO CARD ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_6px_24px_rgba(15,23,42,0.06)] overflow-hidden divide-y divide-slate-100">
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#1E2538] leading-snug">
                {profile.display_name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {profile.position || 'ผู้บริหารระดับสูง'} •{' '}
                <span className="font-semibold text-[#1E2538]">
                  {profile.company_name || 'Young FTI ELITE 11'}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-[#1E2538] rounded-xl text-xs font-bold transition shrink-0 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-[#B38728]" />
              <span>
                {copyStatus === 'copied'
                  ? 'คัดลอกแล้ว'
                  : copyStatus === 'failed'
                  ? 'คัดลอกไม่สำเร็จ'
                  : 'แชร์'}
              </span>
            </button>
          </div>

          {/* Following & Follower Counts under Name */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F8FAFC] border border-slate-200/70 text-slate-600 tabular-nums">
              <strong className="font-bold text-[#1E2538]">{followingCount}</strong>
              <span>Following</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F8FAFC] border border-slate-200/70 text-slate-600 tabular-nums">
              <strong className="font-bold text-[#1E2538]">{followerCount}</strong>
              <span>Follower</span>
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-1">
            <Phone
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-14 h-14 text-[#1E2538] opacity-[0.07] -rotate-12"
            />
            <span className="relative z-10 text-xs font-bold text-[#9A7320] block">เบอร์โทรศัพท์</span>
            <span className="relative z-10 text-sm sm:text-base font-extrabold text-[#1E2538] tabular-nums block">
              {profile.phone_number || 'ยังไม่ระบุ'}
            </span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-1">
            <Mail
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-14 h-14 text-[#FB7170] opacity-[0.10] -rotate-12"
            />
            <span className="relative z-10 text-xs font-bold text-slate-500 block">อีเมล</span>
            <span className="relative z-10 text-sm sm:text-base font-extrabold text-[#1E2538] truncate block">
              {profile.email || 'ยังไม่ระบุ'}
            </span>
          </div>

          <div className="relative overflow-hidden p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-1">
            <Briefcase
              aria-hidden="true"
              className="pointer-events-none select-none absolute -right-2 -bottom-2 w-14 h-14 text-[#1E2538] opacity-[0.07] -rotate-12"
            />
            <span className="relative z-10 text-xs font-bold text-slate-500 block">กลุ่มอุตสาหกรรม</span>
            <span className="relative z-10 text-sm sm:text-base font-extrabold text-[#1E2538] truncate block">
              {profile.industry || 'ยังไม่ระบุ'}
            </span>
          </div>
        </div>
      </div>

      {/* ================= 4. SEPARATE HOUSE CARD (SPLIT-TONE EXECUTIVE PASS) ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_6px_24px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="relative bg-gradient-to-r from-[#141A2C] via-[#1E2538] to-[#252E46] text-white p-5 sm:p-6 border-b-[3px] border-[#FB7170] flex items-center justify-between gap-4 overflow-hidden">
          <div className="relative z-10 flex items-center gap-4 min-w-0">
            <img
              src={`/images/planets/${currentHouse?.id || 'the_mars'}.webp`}
              alt={houseName}
              className="w-14 h-14 rounded-2xl ring-2 ring-white/20 shadow-[0_6px_18px_rgba(0,0,0,0.3)] shrink-0"
            />
            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 block">
                My House
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-extrabold text-white">{houseName}</h3>
                {houseRank !== null && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C59B38]/25 border border-[#E5C158]/50 text-[#E5C158] tabular-nums">
                    Rank #{houseRank}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 tabular-nums">
                {houseMembers.length} สมาชิก •{' '}
                <strong className="text-[#E5C158]">{housePoints.toLocaleString()}</strong> คะแนน
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white">
          <button
            type="button"
            onClick={() => setIsHouseModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Users className="w-4 h-4 text-[#E5C158]" />
            <span>ดูสมาชิกในบ้าน</span>
          </button>
        </div>
      </div>

      {/* ================= 5. SUMMARY & SPLIT ATTENDANCE / MISSIONS ================= */}
      <ProgressSection
        profile={profile}
        tier={tier}
        myEventsList={myEventsList}
        mergedMissions={mergedMissions}
        onSubmitMission={handleSubmitMission}
      />

      {/* ================= 6. ACCOUNT GOVERNANCE & ROLE SIMULATOR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#B38728]" />
            <h4 className="text-sm font-bold text-[#1E2538]">สิทธิ์การเข้าถึงระบบ</h4>
          </div>
          <p className="text-xs text-slate-500">
            สลับบทบาทเพื่อทดสอบการใช้งานในมุมมองสมาชิกและผู้ดูแลระบบ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN'] as const).map((roleOption) => (
            <button
              key={roleOption}
              type="button"
              onClick={() => updateRole(roleOption)}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition border ${
                profile.role === roleOption
                  ? 'bg-[#1E2538] text-white border-[#1E2538]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {roleOption === 'SUPER_ADMIN'
                ? 'Super Admin'
                : roleOption === 'HOUSE_ADMIN'
                ? 'House Admin'
                : 'Member'}
            </button>
          ))}

          <button
            type="button"
            onClick={logout}
            className="py-2 px-3.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5 ml-auto sm:ml-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* House Members Modal */}
      <HouseMembersModal
        isOpen={isHouseModalOpen}
        onClose={() => setIsHouseModalOpen(false)}
        houseName={houseName}
        houseRank={houseRank}
        housePoints={housePoints}
        houseMembers={houseMembers}
      />

      {/* Switch User Modal */}
      <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Briefcase,
  Coins,
  CreditCard,
  Crown,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Share2,
  Users,
} from 'lucide-react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, mockEvents, mockMissions, yftiParticipants } from '@/lib/mockData';
import { EventItem } from '@/types';
import { WebLoginModal } from '@/components/layout/WebLoginModal';
import { PhotoLightbox } from '@/components/ui/PhotoLightbox';
import { InfoCard, InfoGrid, InfoRow } from '@/components/ui/InfoCard';
import { ProfilePageSkeleton } from '@/components/ui/PageSkeletons';
import { HouseMembersModal } from '@/components/profile/HouseMembersModal';
import {
  MergedMissionItem,
  ProgressSection,
} from '@/components/profile/ProgressSection';
import {
  DEFAULT_AVATAR_DATA_URI,
  MissionSubmissionRecord,
  copyTextToClipboard,
  formatMemberCode,
  handleAvatarError,
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
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
    <div className="w-full bg-[#F6F4EF] pb-4">
      {/* ================= 1. OBSIDIAN LUXURY PROFILE HEADER (SAME DNA, DISTINCT PROFILE LAYOUT) ================= */}
      <section className="relative luxury-stage text-white pt-5 pb-12 px-4 sm:px-6 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <button
                type="button"
                onClick={() => setIsPhotoOpen(true)}
                aria-label="ดูรูปเต็มจอ"
                className="shrink-0 rounded-full cursor-zoom-in"
              >
                <img
                  src={profile.picture_url || DEFAULT_AVATAR_DATA_URI}
                  alt={profile.display_name}
                  onError={handleAvatarError}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover object-top ring-2 ring-[#ECD28E]/50 hover:ring-[#ECD28E] bg-[#0D1321] shadow-lg transition"
                />
              </button>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full badge-gold-metallic text-[10px] font-bold uppercase tracking-wider">
                    <Crown className="w-3 h-3" />
                    {tier}
                  </span>
                  <span className="text-[11px] font-mono tracking-widest text-slate-300 tabular-nums">
                    {memberCode}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-white leading-snug truncate">
                  {profile.display_name}
                </h1>
                <p className="text-xs text-slate-300 truncate">
                  <span className="text-[#ECD28E] font-semibold">
                    {profile.position || 'ผู้บริหารระดับสูง'}
                  </span>
                  <span className="mx-1.5 text-white/25">•</span>
                  <span>{profile.company_name || 'Young FTI ELITE 11'}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-full text-xs font-bold transition shrink-0 backdrop-blur-md"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ECD28E]" />
              <span>
                {copyStatus === 'copied'
                  ? 'คัดลอกแล้ว'
                  : copyStatus === 'failed'
                  ? 'ไม่สำเร็จ'
                  : 'แชร์'}
              </span>
            </button>
          </div>

          {/* Compact Frosted Stats Row (Points, Following, Follower) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-sm">
              <span className="text-[10px] text-slate-300 flex items-center gap-1">
                <Coins className="w-3 h-3 text-[#ECD28E]" />
                Points
              </span>
              <p className="text-base sm:text-lg font-extrabold text-[#ECD28E] tabular-nums mt-0.5">
                {(profile.points_balance ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-sm">
              <span className="text-[10px] text-slate-300 block">Following</span>
              <p className="text-base sm:text-lg font-extrabold text-white tabular-nums mt-0.5">
                {followingCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-sm">
              <span className="text-[10px] text-slate-300 block">Follower</span>
              <p className="text-base sm:text-lg font-extrabold text-white tabular-nums mt-0.5">
                {followerCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. OVERLAPPING ROUNDED WARM IVORY SHEET ================= */}
      <div className="relative z-20 -mt-6 luxury-sheet rounded-t-[30px] pt-5 px-4 sm:px-6 min-h-[65vh]">
        <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
          {/* Contact & Business Details */}
          <InfoCard eyebrow="Member Details" title="ข้อมูลสมาชิก" iconSrc="/images/icons/profile.webp?v=2">
            <InfoGrid>
              <InfoRow label="เบอร์โทรศัพท์" mono accent>{profile.phone_number || 'ยังไม่ระบุ'}</InfoRow>
              <InfoRow label="อีเมล">{profile.email || 'ยังไม่ระบุ'}</InfoRow>
              <InfoRow label="ตำแหน่ง">{profile.position || 'ยังไม่ระบุ'}</InfoRow>
              <InfoRow label="บริษัท">{profile.company_name || 'ยังไม่ระบุ'}</InfoRow>
              <InfoRow label="กลุ่มอุตสาหกรรม" wide>{profile.industry || 'ยังไม่ระบุ'}</InfoRow>
            </InfoGrid>
          </InfoCard>

      {/* ================= 4. SEPARATE HOUSE CARD (SPLIT-TONE EXECUTIVE PASS) ================= */}
      <div className="bg-white rounded-3xl shadow-[0_6px_24px_rgba(13,19,33,0.06)] overflow-hidden">
        <div className="relative luxury-stage text-white p-5 sm:p-6 flex items-center justify-between gap-4 overflow-hidden">
          <div className="relative z-10 flex items-center gap-4 min-w-0">
            <img
              src={`/images/planets/${currentHouse?.id || 'the_mars'}.webp?v=2`}
              alt={houseName}
              className="w-14 h-14 object-contain shrink-0 drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]"
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
            className="w-full py-2.5 rounded-full luxury-gold-btn text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
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

      {/* ================= 6. ACCOUNT / ROLE ================= */}
      <InfoCard eyebrow="Account" title="สิทธิ์การเข้าถึงระบบ">
        <p className="text-xs text-slate-500 pt-1 pb-3 border-b border-[#F1ECE2]">
          สลับบทบาทเพื่อทดสอบการใช้งานในมุมมองสมาชิกและผู้ดูแลระบบ
        </p>
        <div className="flex flex-wrap items-center gap-2 py-4">
          {(['MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN'] as const).map((roleOption) => (
            <button
              key={roleOption}
              type="button"
              onClick={() => updateRole(roleOption)}
              className={`py-2 px-4 rounded-full text-xs font-bold transition ${
                profile.role === roleOption
                  ? 'bg-[#0D1321] text-[#ECD28E]'
                  : 'bg-[#F6F4EF] text-slate-600 hover:bg-[#EAE5DA]'
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
            className="py-2 px-4 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1.5 ml-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </InfoCard>

      {/* House Members Modal */}
      <HouseMembersModal
        isOpen={isHouseModalOpen}
        onClose={() => setIsHouseModalOpen(false)}
        houseName={houseName}
        houseRank={houseRank}
        housePoints={housePoints}
        houseMembers={houseMembers}
      />

      <PhotoLightbox
        isOpen={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        src={profile.picture_url || DEFAULT_AVATAR_DATA_URI}
        alt={profile.display_name}
        caption={profile.display_name}
      />

      {/* Switch User Modal */}
      <WebLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
      </div>
    </div>
  );
}

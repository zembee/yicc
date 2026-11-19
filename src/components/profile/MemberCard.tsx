'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Briefcase, Mail, Phone, QrCode, RotateCw } from 'lucide-react';
import { UserProfile } from '@/types';
import {
  DEFAULT_AVATAR_DATA_URI,
  getRoleBadge,
  handleAvatarError,
} from './profileUtils';

interface MemberCardProps {
  profile: UserProfile;
  houseName: string;
  memberCode: string;
  tier: string;
  isFlipped: boolean;
  onToggleFlip: () => void;
  showFlipButton?: boolean;
}

export function MemberCard({
  profile,
  houseName,
  memberCode,
  tier,
  isFlipped,
  onToggleFlip,
  showFlipButton = true,
}: MemberCardProps) {
  // Rolling timestamp refreshed every 30s while QR side is visible (60s validity window in QrScannerModal)
  const [qrTimestamp, setQrTimestamp] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!isFlipped) return;
    setQrTimestamp(Date.now());
    const intervalId = window.setInterval(() => {
      setQrTimestamp(Date.now());
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [isFlipped]);

  // Strip PII (phone) and untrusted client-side role from QR payload
  const memberQrPayload = useMemo(
    () =>
      JSON.stringify({
        type: 'YFTI_MEMBER_PASSPORT',
        memberId: profile.id,
        name: profile.display_name,
        house: houseName,
        batch: profile.cohort_batch || 'YFTI 11',
        rolling: true,
        ts: qrTimestamp,
      }),
    [profile.id, profile.display_name, profile.cohort_batch, houseName, qrTimestamp]
  );

  const roleBadge = getRoleBadge(profile.role);

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleFlip();
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="relative mx-auto w-full max-w-xl select-none"
        style={{ perspective: '1200px' }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
          aria-label={isFlipped ? 'พลิกกลับดูหน้าบัตรสมาชิก' : 'พลิกดูหลังบัตรสมาชิกและ QR Code'}
          onClick={onToggleFlip}
          onKeyDown={handleCardKeyDown}
          className="relative w-full aspect-[1.586/1] min-h-[250px] sm:min-h-[300px] rounded-3xl transition-transform duration-700 cursor-pointer shadow-[0_14px_34px_rgba(20,27,45,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B38] focus-visible:ring-offset-2"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ================= FRONT OF CARD ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-7 flex flex-col justify-between overflow-hidden border border-[#C59B38]/35 text-white"
            style={{
              background:
                'radial-gradient(120% 90% at 92% 8%, rgba(229,193,88,0.16) 0%, rgba(251,113,112,0.06) 32%, transparent 62%), linear-gradient(135deg, #101626 0%, #1B2338 52%, #232D47 100%)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            {/* Subtle Architectural Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.045] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Bottom Signature Gold-Coral Hairline */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C59B38] via-[#FB7170] to-[#C59B38] opacity-90"
            />

            {/* Top Row: Brand & Tier Pill */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1 shadow-md ring-2 ring-white/15 flex items-center justify-center shrink-0">
                  <Image
                    src="/YFTI-11-Logo.jpg"
                    alt="YFTI 11"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base tracking-tight text-white truncate">
                    <span className="font-extrabold">YOUNG FTI</span>{' '}
                    <span className="font-light text-white/90">ELITE 11</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-300 truncate">
                    สภาอุตสาหกรรมแห่งประเทศไทย
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#C59B38]/20 text-[#E5C158] border border-[#E5C158]/45 text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-[0_0_12px_rgba(229,193,88,0.18)]">
                {tier}
              </span>
            </div>

            {/* Center Row: Member Avatar, Name & Single-Line Role + Position + Company */}
            <div className="relative z-10 flex items-center gap-3.5 sm:gap-5 my-auto">
              <img
                src={profile.picture_url || DEFAULT_AVATAR_DATA_URI}
                alt={profile.display_name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/40 ring-2 ring-[#C59B38]/35 bg-[#141B2D] shadow-lg shrink-0"
                onError={handleAvatarError}
              />

              <div className="min-w-0 flex-1 space-y-1.5">
                <h2 className="text-base sm:text-xl font-bold text-white truncate tracking-tight">
                  {profile.display_name}
                </h2>

                {/* Single-line: ROLE + Position + Company */}
                <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase shrink-0 ${roleBadge.className}`}
                  >
                    {roleBadge.label}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#E5C158] truncate">
                    {profile.position || 'Executive Member'}
                  </span>
                  <span className="text-white/30 text-[10px] shrink-0">•</span>
                  <span className="text-[11px] sm:text-xs text-slate-200 truncate font-medium">
                    {profile.company_name || houseName}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Membership No & Mini QR Badge */}
            <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Membership No.
                </span>
                <span className="text-sm sm:text-base font-bold font-mono tracking-widest text-white tabular-nums">
                  {memberCode}
                </span>
              </div>

              <div className="w-8 h-8 rounded-lg bg-white text-[#1E2538] flex items-center justify-center shadow-sm">
                <QrCode className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-7 flex flex-col justify-between overflow-hidden border border-white/15 text-white"
            style={{
              background: 'linear-gradient(135deg, #141B2D 0%, #1E2538 100%)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Top Label */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold text-[#E5C158] tracking-wide">
                Member Verification Pass
              </span>
              <span className="text-[11px] font-mono text-slate-300 tabular-nums">{memberCode}</span>
            </div>

            {/* Middle: Contact Details on Left & Scannable Rolling QR on Right */}
            <div className="flex items-center justify-between gap-4 my-auto">
              <div className="min-w-0 flex-1 space-y-2 text-[11px] sm:text-xs text-slate-200">
                <p className="font-bold text-white truncate">{profile.display_name}</p>
                <p className="flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                  <span className="tabular-nums">{profile.phone_number || 'ยังไม่ระบุ'}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                  <span className="truncate">{profile.email || 'ยังไม่ระบุ'}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Briefcase className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                  <span className="truncate">{profile.industry || 'ยังไม่ระบุ'}</span>
                </p>
              </div>

              <div className="shrink-0 bg-white p-2.5 rounded-2xl shadow-md text-center flex flex-col items-center">
                <QRCodeSVG
                  value={memberQrPayload}
                  size={84}
                  level="M"
                  fgColor="#1E2538"
                  includeMargin={false}
                />
                <span className="text-[8px] font-bold font-mono text-slate-600 mt-1 uppercase">
                  Dynamic QR • 60s
                </span>
              </div>
            </div>

            {/* Bottom: Points & XP */}
            <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 font-semibold tabular-nums">
                <span className="px-2.5 py-0.5 bg-[#C59B38]/20 text-[#E5C158] rounded-md border border-[#C59B38]/30">
                  {(profile.points_balance ?? 0).toLocaleString()} Pts
                </span>
                <span className="px-2.5 py-0.5 bg-white/10 text-slate-200 rounded-md border border-white/15">
                  {(profile.xp_balance ?? 0).toLocaleString()} XP
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Young FTI ELITE 11</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flip Control BELOW the card */}
      {showFlipButton && (
        <div className="max-w-xl mx-auto flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={onToggleFlip}
            className="px-5 py-2.5 bg-white border border-slate-200/80 hover:border-[#C59B38] rounded-xl text-xs font-bold text-[#1E2538] transition shadow-sm flex items-center justify-center gap-2 group"
          >
            <RotateCw className="w-4 h-4 text-[#B38728] group-hover:rotate-180 transition-transform duration-500" />
            <span>{isFlipped ? 'ดูหน้าบัตร' : 'พลิกดูหลังบัตร (QR)'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

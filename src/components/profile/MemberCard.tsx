'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Briefcase, Crown, Mail, Phone, QrCode, RotateCw } from 'lucide-react';
import { UserProfile } from '@/types';
import {
  DEFAULT_AVATAR_DATA_URI,
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

const PLANET_META_MAP: Record<string, { img: string; color: string; label: string }> = {
  'the sun': { img: '/images/planets/the_sun.webp?v=2', color: '#F59E0B', label: 'The Sun' },
  the_sun: { img: '/images/planets/the_sun.webp?v=2', color: '#F59E0B', label: 'The Sun' },
  sun: { img: '/images/planets/the_sun.webp?v=2', color: '#F59E0B', label: 'The Sun' },
  mercury: { img: '/images/planets/mercury.webp?v=2', color: '#94A3B8', label: 'Mercury' },
  venus: { img: '/images/planets/venus.webp?v=2', color: '#EC4899', label: 'Venus' },
  earth: { img: '/images/planets/earth.webp?v=2', color: '#10B981', label: 'Earth' },
  mars: { img: '/images/planets/the_mars.webp?v=2', color: '#EF4444', label: 'Mars' },
  the_mars: { img: '/images/planets/the_mars.webp?v=2', color: '#EF4444', label: 'Mars' },
  'the mars': { img: '/images/planets/the_mars.webp?v=2', color: '#EF4444', label: 'Mars' },
  jupiter: { img: '/images/planets/jupiter.webp?v=2', color: '#F97316', label: 'Jupiter' },
  saturn: { img: '/images/planets/saturn.webp?v=2', color: '#EAB308', label: 'Saturn' },
  uranus: { img: '/images/planets/uranus.webp?v=2', color: '#06B6D4', label: 'Uranus' },
  neptune: { img: '/images/planets/neptune.webp?v=2', color: '#3B82F6', label: 'Neptune' },
};

function resolvePlanetMeta(houseId?: string, houseName?: string) {
  const byId = (houseId || '').trim().toLowerCase();
  if (PLANET_META_MAP[byId]) return PLANET_META_MAP[byId];
  const byName = (houseName || '').trim().toLowerCase();
  return PLANET_META_MAP[byName] || null;
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

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleFlip();
    }
  };

  const planetMeta = resolvePlanetMeta(profile.house_id, houseName);
  const houseDisplayLabel = planetMeta?.label || houseName;
  const houseAccent = planetMeta?.color || '#DFC27D';

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
          className="relative w-full h-[180px] sm:h-[196px] rounded-[22px] transition-transform duration-700 cursor-pointer shadow-[0_18px_40px_rgba(4,8,18,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DFC27D] focus-visible:ring-offset-2"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ================= FRONT OF CARD (SLIM OBSIDIAN METAL PASS + SEAMLESS MASKED PORTRAIT) ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-[22px] px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col justify-between overflow-hidden text-white"
            style={{
              background:
                'linear-gradient(135deg, #090D18 0%, #101728 55%, #0B111E 100%)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            {/* Planet House Ambient Aura + Faint 3D Planet Backdrop Watermark */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(60% 95% at 12% 58%, ${houseAccent}24 0%, transparent 70%)`,
              }}
            />
            {planetMeta && (
              <img
                src={planetMeta.img}
                alt=""
                aria-hidden="true"
                className="absolute -left-5 -bottom-6 w-36 h-36 sm:w-44 sm:h-44 object-contain opacity-[0.17] pointer-events-none select-none"
              />
            )}

            {/* Full-Height Member Portrait on Right with True Alpha Mask Fade (Zero Seam!) */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-[56%] sm:w-[48%] pointer-events-none select-none overflow-hidden"
              style={{
                WebkitMaskImage:
                  'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.22) 22%, rgba(0,0,0,0.85) 55%, black 80%)',
                maskImage:
                  'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.22) 22%, rgba(0,0,0,0.85) 55%, black 80%)',
              }}
            >
              <img
                src={profile.picture_url || DEFAULT_AVATAR_DATA_URI}
                alt=""
                onError={handleAvatarError}
                className="w-full h-full object-cover object-top"
              />
              {/* Soft Bottom Vignette for QR & Contrast */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(9,13,24,0.22) 0%, transparent 30%, rgba(9,13,24,0.82) 100%)',
                }}
              />
            </div>

            {/* Continuous Top-Layer Satin Gold Hairline Frame (Wraps All 4 Edges Smoothly) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-20 rounded-[22px] pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(223,194,125,0.32)',
              }}
            />

            {/* Top Row: Compact Brand Lockup & Planet House + Gold Tier */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
                  <Image
                    src="/YFTI-11-Logo.jpg"
                    alt="YFTI 11"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-[11px] sm:text-xs tracking-[0.08em] text-white truncate">
                    <span className="font-extrabold">YOUNG FTI</span>{' '}
                    <span className="font-light text-[#ECD28E]">ELITE 11</span>
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-slate-400 tracking-wide truncate">
                    Executive Member Pass
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {houseDisplayLabel && (
                  <span
                    className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full bg-[#090D18]/80 backdrop-blur-md text-[10px] font-extrabold tracking-wide text-[#F5E6BE]"
                    style={{ boxShadow: `inset 0 0 0 1px ${houseAccent}55` }}
                  >
                    {planetMeta && (
                      <img
                        src={planetMeta.img}
                        alt={houseDisplayLabel}
                        className="w-3.5 h-3.5 object-contain shrink-0"
                      />
                    )}
                    <span>{houseDisplayLabel}</span>
                  </span>
                )}
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#090D18]/75 backdrop-blur-md text-[9px] font-bold uppercase tracking-[0.14em] text-[#ECD28E]">
                  <Crown className="w-2.5 h-2.5 text-[#DFC27D]" />
                  {tier}
                </span>
              </div>
            </div>

            {/* Middle Row: Clean Left-Aligned Member Name, Role & Company */}
            <div className="relative z-10 max-w-[66%] sm:max-w-[64%] my-auto space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-white truncate tracking-tight leading-snug drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                {profile.display_name}
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-[#ECD28E] truncate">
                {profile.position || 'Executive Member'}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                {profile.company_name || houseName}
              </p>
            </div>

            {/* Bottom Row: Membership No & Minimal QR Trigger */}
            <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/[0.08]">
              <div className="flex items-baseline gap-2">
                <span className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                  ID
                </span>
                <span className="text-xs sm:text-sm font-bold font-mono tracking-[0.2em] text-[#F5E6BE] tabular-nums">
                  {memberCode}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                <span className="hidden xs:inline tracking-wide">แตะเพื่อดู QR</span>
                <span className="w-7 h-7 rounded-lg bg-white/95 text-[#0D1321] flex items-center justify-center shadow-sm">
                  <QrCode className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD (SLIM QR PASS) ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-[22px] px-5 py-4 sm:px-6 sm:py-5 flex flex-col justify-between overflow-hidden text-white"
            style={{
              background: 'linear-gradient(135deg, #090D18 0%, #121A2D 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(223,194,125,0.26)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Top Label */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-[11px] font-bold text-[#ECD28E] tracking-[0.12em] uppercase">
                Verification Pass
              </span>
              <span className="text-[11px] font-mono tracking-widest text-slate-300 tabular-nums">
                {memberCode}
              </span>
            </div>

            {/* Middle: Compact Details + Dynamic QR */}
            <div className="flex items-center justify-between gap-4 my-auto">
              <div className="min-w-0 flex-1 space-y-1.5 text-[11px] text-slate-300">
                <p className="font-bold text-white text-xs sm:text-sm truncate">
                  {profile.display_name}
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Phone className="w-3 h-3 text-[#DFC27D] shrink-0" />
                  <span className="tabular-nums">{profile.phone_number || 'ยังไม่ระบุ'}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Mail className="w-3 h-3 text-[#DFC27D] shrink-0" />
                  <span className="truncate">{profile.email || 'ยังไม่ระบุ'}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Briefcase className="w-3 h-3 text-[#DFC27D] shrink-0" />
                  <span className="truncate">{profile.industry || houseName}</span>
                </p>
              </div>

              <div className="shrink-0 bg-white p-2 rounded-xl text-center flex flex-col items-center">
                <QRCodeSVG
                  value={memberQrPayload}
                  size={74}
                  level="M"
                  fgColor="#0D1321"
                  includeMargin={false}
                />
                <span className="text-[7px] font-bold font-mono text-slate-600 mt-0.5 uppercase">
                  Dynamic • 60s
                </span>
              </div>
            </div>

            {/* Bottom: Points & XP */}
            <div className="border-t border-white/[0.08] pt-2 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2 font-semibold tabular-nums">
                <span className="text-[#ECD28E]">
                  {(profile.points_balance ?? 0).toLocaleString()} Pts
                </span>
                <span className="text-white/25">•</span>
                <span className="text-slate-300">
                  {(profile.xp_balance ?? 0).toLocaleString()} XP
                </span>
              </div>
              <span className="text-slate-400">แตะเพื่อพลิกกลับ</span>
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
            className="px-5 py-2.5 bg-white hover:bg-[#F6F4EF] rounded-xl text-xs font-bold text-[#161C2C] transition shadow-sm flex items-center justify-center gap-2 group"
          >
            <RotateCw className="w-4 h-4 text-[#B18A3B] group-hover:rotate-180 transition-transform duration-500" />
            <span>{isFlipped ? 'ดูหน้าบัตร' : 'พลิกดูหลังบัตร (QR)'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

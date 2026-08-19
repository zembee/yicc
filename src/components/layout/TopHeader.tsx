'use client';

import React from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import Image from 'next/image';
import { Coins, Award, Shield } from 'lucide-react';
import Link from 'next/link';

export const TopHeader: React.FC = () => {
  const { profile, isMockMode } = useLiffAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#212542] backdrop-blur-xl border-b border-[#EEEEEE] px-4 py-2.5 shadow-[0_2px_12px_rgba(33,37,66,0.03)]">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Brand & Cohort Badge */}
        <Link href="/academy" className="flex items-center gap-2.5 shrink-0">
          <Image src="/YFTI-11-Logo.jpg" alt="YFTI Connect" width={32} height={32} className="rounded-md" />
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight text-[var(--e-global-color-primary)] leading-tight whitespace-nowrap">
              YFTI CONNECT
            </span>
            <div className="flex items-center gap-1.5 leading-none mt-0.5">
              <span className="text-[10px] text-[var(--e-global-color-secondary)] font-medium whitespace-nowrap">
                Cohort 1
              </span>
              {isMockMode && (
                <span className="text-[8px] bg-[var(--e-global-color-daf0130)] text-[var(--e-global-color-secondary)] font-bold px-1 py-0.2 rounded font-mono">
                  DEMO
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* User Stats & Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {profile && (
            <>
              {/* Compact Unified Points Pill */}
              <div className="flex items-center bg-[#F8F9FC] border border-[#EEEEEE] rounded-full p-1 pl-2.5 pr-2.5 gap-2.5 shadow-sm shrink-0">
                {/* Coins */}
                <div className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-[#FB7170] shrink-0" />
                  <span className="text-xs font-black text-[#212542] font-mono leading-none">
                    {profile.points_balance}
                  </span>
                </div>

                {/* Divider */}
                <span className="w-[1px] h-3 bg-[#CBD5E1]" />

                {/* XP */}
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#5867E8] shrink-0" />
                  <span className="text-xs font-black text-[#212542] font-mono leading-none">
                    {profile.xp_balance}
                  </span>
                </div>
              </div>

              {/* Avatar Link (Guaranteed Circle, Never Squished) */}
              <Link href="/profile" className="relative shrink-0 block">
                <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full overflow-hidden border-2 border-[#212542] shadow-sm bg-[#DBDFFF] flex items-center justify-center aspect-square">
                  {profile.picture_url ? (
                    <img
                      src={profile.picture_url}
                      alt={profile.display_name}
                      className="w-full h-full object-cover aspect-square"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#212542]">
                      {profile.display_name.charAt(0)}
                    </span>
                  )}
                </div>
                {profile.role !== 'MEMBER' && (
                  <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-[#212542] rounded-full text-[8px] text-white border border-white">
                    <Shield className="w-2.5 h-2.5" />
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

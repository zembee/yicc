'use client';

import React from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import Image from 'next/image';
import { Coins, Award, Shield } from 'lucide-react';
import Link from 'next/link';

export const TopHeader: React.FC = () => {
  const { profile, isMockMode } = useLiffAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#181B34] border-b border-[#2A2E54] shadow-[0_4px_20px_rgba(0,0,0,0.15)] text-white">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Signature White Trapezoid Logo Block from image.png */}
        <Link href="/academy" className="flex items-center group">
          <div className="bg-white px-3.5 py-2 clip-trapezoid-logo pr-6 flex items-center justify-center transition-all group-hover:bg-slate-50">
            <Image 
              src="/YFTI-11-Logo.jpg" 
              alt="Young FTI Elite 11" 
              width={26} 
              height={26} 
              className="object-contain" 
              priority
            />
          </div>
          <div className="flex flex-col pl-2 py-2">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-sm tracking-tight text-white whitespace-nowrap">
                Young FTI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FB7170]">
                ELITE 11
              </span>
            </div>
            <span className="text-[9px] text-[#A5B4FC] font-medium tracking-wide mt-0.5">
              {isMockMode ? 'MEMBER PORTAL (DEMO)' : 'CONNECT HUB'}
            </span>
          </div>
        </Link>

        {/* Right: User Stats & Profile Avatar */}
        <div className="flex items-center gap-2 pr-3 py-2">
          {profile && (
            <>
              {/* Compact Translucent Points Pill */}
              <div className="flex items-center bg-white/10 hover:bg-white/15 border border-white/15 rounded-full px-2.5 py-1 gap-2 transition-all">
                {/* Coins */}
                <div className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-[#FB7170] shrink-0" />
                  <span className="text-xs font-black text-white font-mono leading-none">
                    {profile.points_balance}
                  </span>
                </div>

                {/* Divider */}
                <span className="w-[1px] h-2.5 bg-white/20" />

                {/* XP */}
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#DBDFFF] shrink-0" />
                  <span className="text-xs font-black text-white font-mono leading-none">
                    {profile.xp_balance}
                  </span>
                </div>
              </div>

              {/* Avatar Link */}
              <Link href="/profile" className="relative shrink-0 block group">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/40 group-hover:border-[#FB7170] transition-all bg-[#212542] flex items-center justify-center">
                  {profile.picture_url ? (
                    <img
                      src={profile.picture_url}
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {profile.display_name.charAt(0)}
                    </span>
                  )}
                </div>
                {profile.role !== 'MEMBER' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FB7170] rounded-full text-[8px] text-white flex items-center justify-center border border-[#181B34]">
                    <Shield className="w-2 h-2" />
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


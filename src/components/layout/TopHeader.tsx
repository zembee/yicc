'use client';

import React, { useState } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import Image from 'next/image';
import { Search, Menu, X, Coins, Award, Shield, LogIn, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobalSearchModal } from './GlobalSearchModal';
import { WebLoginModal } from './WebLoginModal';

export const TopHeader: React.FC = () => {
  const pathname = usePathname();
  const { profile, isMockMode } = useLiffAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'เกี่ยวกับเรา', href: '/about' },
    { label: 'ธุรกิจภายในโครงการ', href: '/directory' },
    { label: 'กิจกรรม', href: '/events' },
    { label: 'ข่าวสาร', href: '/news' },
    { label: 'ติดต่อเรา', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1E2538] border-b border-[#2A334E] shadow-[0_4px_20px_rgba(0,0,0,0.15)] text-white select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-20 px-0 sm:px-4">
          {/* Left: Signature White Trapezoid Logo Block matching yfticonnect.com */}
          <div className="flex items-center h-full">
            <Link href="/academy" className="flex items-center h-full group">
              <div className="bg-white h-full px-4 sm:px-6 clip-trapezoid-logo pr-8 sm:pr-10 flex items-center justify-center transition-all group-hover:bg-slate-50">
                <Image 
                  src="/YFTI-11-Logo.jpg" 
                  alt="Young FTI Elite 11" 
                  width={34} 
                  height={34} 
                  className="object-contain" 
                  priority
                />
              </div>
              <div className="hidden lg:flex flex-col pl-3 py-2">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
                    Young FTI
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FB7170]">
                    ELITE 11
                  </span>
                </div>
                <span className="text-[10px] text-[#A5B4FC] font-medium tracking-wide mt-0.5">
                  หลักสูตรนักอุตสาหกรรมรุ่นใหม่
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-semibold">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/academy' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl transition-all relative ${
                    isActive
                      ? 'text-[#FB7170] font-bold'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FB7170] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Stats, Profile & Login */}
          <div className="flex items-center gap-2 sm:gap-3 pr-3 sm:pr-0">
            {/* Search Icon Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition shadow-sm"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Profile / Login Chip */}
            {profile ? (
              <div className="flex items-center gap-2">
                {/* Stats Pill (Desktop) */}
                <div className="hidden lg:flex items-center bg-white/10 border border-white/15 rounded-full px-3 py-1 gap-2.5">
                  <div className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-[#FB7170]" />
                    <span className="text-xs font-bold font-mono">{profile.points_balance}</span>
                  </div>
                  <span className="w-[1px] h-3 bg-white/20" />
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#DBDFFF]" />
                    <span className="text-xs font-bold font-mono">{profile.xp_balance}</span>
                  </div>
                </div>

                {/* User Dropdown / Login Trigger */}
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/40 group-hover:border-[#FB7170] bg-[#2A334E] flex items-center justify-center shrink-0">
                    {profile.picture_url ? (
                      <img
                        src={profile.picture_url}
                        alt={profile.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-white max-w-[90px] sm:max-w-[120px] truncate hidden xs:inline">
                    {profile.display_name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-300" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FB7170] hover:bg-[#fa5b5a] text-white text-xs font-bold transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/80 bg-[#1A1F33] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/academy' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#FB7170] text-white font-bold'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold text-[#FB7170] hover:underline"
              >
                โปรไฟล์ส่วนตัว ({profile?.display_name})
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                className="text-xs text-slate-300 hover:text-white"
              >
                สลับผู้ใช้ / เข้าสู่ระบบ
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <WebLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

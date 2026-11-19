'use client';

import React, { useState, useEffect } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import Image from 'next/image';
import { Search, Menu, X, Coins, Award, Shield, LogIn, User, ChevronDown, LogOut, ExternalLink, Settings, QrCode } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobalSearchModal } from './GlobalSearchModal';
import { WebLoginModal } from './WebLoginModal';
import { QuickQrHubSheet } from './QuickQrHubSheet';

export const TopHeader: React.FC = () => {
  const pathname = usePathname();
  const { profile, isMockMode, logout } = useLiffAuth();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: 'หน้าแรก', href: '/' },
    { label: 'สิทธิพิเศษ', href: '/privileges' },
    { label: 'ทำเนียบธุรกิจ', href: '/directory' },
    { label: 'กิจกรรม', href: '/events' },
    { label: 'โปรไฟล์', href: '/profile' },
  ];

  return (
    <>
      <header className="hidden md:block sticky top-0 z-40 bg-[#0D1321]/95 backdrop-blur-md border-b border-[#C5A059]/25 shadow-[0_6px_28px_rgba(8,12,24,0.3)] text-white select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 sm:h-24 px-4 sm:px-6 lg:px-8">
          {/* Left: Signature White Trapezoid Logo Block matching yfticonnect.com */}
          <div className="flex items-center h-full">
            <Link href="/" className="flex items-center h-full group">
              <div 
                className="bg-white h-full px-5 sm:px-8 flex items-center justify-center transition-all group-hover:bg-slate-50 relative -ml-4 sm:-ml-6 lg:-ml-8"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 78% 100%, 0% 100%)',
                  paddingRight: '2.5rem'
                }}
              >
                <img 
                  src="/YFTI-11-Logo.jpg" 
                  alt="Young FTI Elite 11" 
                  className="h-12 w-auto max-h-12 object-contain" 
                />
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar matching yfticonnect.com */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 text-[17px] lg:text-[19px] font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/directory' && pathname.startsWith('/yfti_participants'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-200 relative py-2 ${
                    isActive
                      ? 'text-[#DFC27D] font-semibold'
                      : 'text-white/85 hover:text-[#DFC27D]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C5A059] via-[#ECD28E] to-[#C5A059] rounded-full animate-in fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Stats, Profile & Login */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Quick QR & Hub Trigger */}
            <button
              onClick={() => setIsQrSheetOpen(true)}
              aria-label="Quick QR & Hub"
              title="Quick QR & Hub"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#D8B45A] via-[#C59B38] to-[#A67F2A] text-white hover:brightness-105 flex items-center justify-center transition shadow-md hover:scale-105"
            >
              <QrCode className="w-5 h-5" />
            </button>

            {/* Search Icon Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-[#1E2538] hover:bg-slate-100 flex items-center justify-center transition shadow-md hover:scale-105"
            >
              <Search className="w-5 h-5 text-[#1E2538]" />
            </button>

            {/* Profile / Login Chip */}
            {!mounted ? (
              <div className="w-10 h-10 sm:w-24 sm:h-10" />
            ) : profile ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-white/60 group-hover:border-[#FB7170] bg-[#2A334E] flex items-center justify-center shrink-0 shadow-sm">
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
                  <div className="flex flex-col text-left leading-tight hidden xs:flex">
                    <span className="text-xs font-bold text-white max-w-[100px] truncate">
                      {profile.display_name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-[#FB7170] font-semibold">
                      {profile.role === 'SUPER_ADMIN' ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300 transition-transform group-hover:translate-y-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1E2538] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-white/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 shrink-0">
                        <img
                          src={profile.picture_url || '/YFTI-11-Logo.jpg'}
                          alt={profile.display_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{profile.display_name}</p>
                        <p className="text-xs text-slate-400 truncate">{profile.company_name || 'Young FTI ELITE 11'}</p>
                      </div>
                    </div>

                    <div className="py-1.5 space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition"
                      >
                        <User className="w-4 h-4 text-[#FB7170]" />
                        <span>โปรไฟล์ของฉัน (Profile)</span>
                      </Link>

                      <Link
                        href="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition"
                      >
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>แดชบอร์ดแอดมิน (Admin)</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setIsLoginOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition text-left"
                      >
                        <Settings className="w-4 h-4 text-amber-400" />
                        <span>สลับโปรไฟล์จำลอง (Switch User)</span>
                      </button>
                    </div>

                    <div className="pt-1.5 border-t border-white/10">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#FB7170] hover:bg-[#FB7170]/10 rounded-xl transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FB7170] hover:bg-[#fa5b5a] text-white text-xs sm:text-sm font-bold transition shadow-md hover:scale-105"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition shadow-sm"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#181E2E] border-t border-white/10 px-4 py-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/directory' && pathname.startsWith('/yfti_participants'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-2xl text-base font-semibold transition ${
                    isActive
                      ? 'bg-[#FB7170] text-white font-bold'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <WebLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <QuickQrHubSheet isOpen={isQrSheetOpen} onClose={() => setIsQrSheetOpen(false)} />
    </>
  );
};

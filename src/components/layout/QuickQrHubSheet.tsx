'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Ticket,
  CalendarDays,
  ChevronRight,
  ShieldCheck,
  LogIn,
  BadgeCheck,
  CreditCard,
} from 'lucide-react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockEvents, mockHouses } from '@/lib/mockData';
import { formatMemberCode } from '@/components/profile/profileUtils';
import { WebLoginModal } from './WebLoginModal';

interface QuickQrHubSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickQrHubSheet: React.FC<QuickQrHubSheetProps> = ({ isOpen, onClose }) => {
  const { profile } = useLiffAuth();
  const [rendered, setRendered] = useState(isOpen);
  const [visible, setVisible] = useState(false);
  const [qrTimestamp, setQrTimestamp] = useState<number>(() => Date.now());
  const [couponCount, setCouponCount] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const touchStartYRef = useRef<number | null>(null);

  // Smooth mount -> slide-up on open, slide-down -> unmount on close
  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      setDragOffsetY(0);
      const rafId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      return () => window.cancelAnimationFrame(rafId);
    } else {
      setVisible(false);
      const timer = window.setTimeout(() => {
        setRendered(false);
        setDragOffsetY(0);
      }, 320);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setQrTimestamp(Date.now());
    const intervalId = window.setInterval(() => {
      setQrTimestamp(Date.now());
    }, 30000);

    try {
      const saved = JSON.parse(localStorage.getItem('yfti_redemptions') || '[]');
      if (Array.isArray(saved)) {
        setCouponCount(saved.length);
      }
    } catch {}

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const normalizedHouseId = (profile?.house_id || profile?.house?.id || '').replace(/-/g, '_');
  const houseName =
    mockHouses.find((h) => h.id === normalizedHouseId)?.name ||
    profile?.house?.name ||
    'YFTI 11';

  const xp = profile?.xp_balance ?? 0;
  const tier = profile?.tier || (xp >= 2000 ? 'Platinum' : xp >= 1000 ? 'Gold' : 'Silver');
  const memberCode = formatMemberCode(profile?.id);
  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'HOUSE_ADMIN';

  const nextEvent = useMemo(
    () => mockEvents.find((e) => e.status === 'UPCOMING') || mockEvents[0],
    []
  );

  const memberQrPayload = useMemo(
    () =>
      JSON.stringify({
        type: 'YFTI_MEMBER_PASSPORT',
        memberId: profile?.id || 'guest',
        name: profile?.display_name || 'Guest',
        house: houseName,
        batch: profile?.cohort_batch || 'YFTI 11',
        rolling: true,
        ts: qrTimestamp,
      }),
    [profile?.id, profile?.display_name, profile?.cohort_batch, houseName, qrTimestamp]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const delta = e.touches[0].clientY - touchStartYRef.current;
    if (delta > 0) {
      setDragOffsetY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffsetY > 90) {
      onClose();
    } else {
      setDragOffsetY(0);
    }
    touchStartYRef.current = null;
  };

  if (!rendered && !isLoginOpen) return null;

  return (
    <>
      {rendered && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick QR & Hub"
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-colors duration-300 ${
            visible ? 'bg-[#080C18]/75 backdrop-blur-sm' : 'bg-transparent backdrop-blur-none pointer-events-none'
          }`}
          onClick={onClose}
        >
          <div
            className="w-full max-w-md luxury-stage rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-[0_-16px_48px_rgba(0,0,0,0.55)] border border-[#C5A059]/25 max-h-[92vh] flex flex-col"
            style={{
              transform: visible
                ? `translate3d(0, ${dragOffsetY}px, 0)`
                : 'translate3d(0, 100%, 0)',
              transition:
                dragOffsetY > 0
                  ? 'none'
                  : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Obsidian QR Stage (Swipe down on this area to dismiss) */}
            <div
              className="relative px-6 pt-3.5 pb-9 text-white flex flex-col items-center text-center touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Drag Handle */}
              <div className="w-11 h-1.5 rounded-full bg-white/25 mb-3 sm:hidden" />

              {/* Header Row */}
              <div className="w-full flex items-center justify-between mb-5">
                <div className="w-9" />
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold tracking-tight text-white">Quick QR & Hub</h2>
                  <BadgeCheck className="w-4 h-4 text-[#ECD28E]" />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="ปิดหน้าต่าง"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {profile ? (
                <>
                  <div className="bg-white p-4 rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-4 ring-[#C5A059]/35">
                    <QRCodeSVG
                      value={memberQrPayload}
                      size={176}
                      level="M"
                      fgColor="#0D1321"
                      includeMargin={false}
                    />
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-bold text-white">{profile.display_name}</p>
                    <p className="text-xs font-semibold text-[#ECD28E] tracking-wide tabular-nums">
                      YFTI ELITE 11 • {tier} Tier • {memberCode}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Dynamic QR รีเฟรชอัตโนมัติทุก 60 วินาที สำหรับเช็กอินและรับสิทธิ์
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto text-[#ECD28E]">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-white">เข้าสู่ระบบเพื่อใช้งาน Member QR</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsLoginOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl luxury-gold-btn text-xs font-bold transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบสมาชิก</span>
                  </button>
                </div>
              )}
            </div>

            {/* Overlapping Rounded Warm Ivory Sheet (Hub Actions) */}
            <div className="-mt-4 luxury-sheet rounded-t-[28px] px-5 pt-5 pb-7 space-y-2.5 overflow-y-auto">
              <Link
                href="/privileges?tab=history"
                onClick={onClose}
                className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(13,19,33,0.05)] hover:shadow-[0_8px_22px_rgba(13,19,33,0.09)] flex items-center justify-between gap-3 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FBF6EC] text-[#9A742B] flex items-center justify-center shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#161C2C] group-hover:text-[#9A742B] transition-colors">
                      คูปองของฉัน (My Coupons)
                    </p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {couponCount > 0 ? `${couponCount} รายการที่แลกไว้` : 'ดูประวัติการแลกสิทธิพิเศษ'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#161C2C] shrink-0" />
              </Link>

              <Link
                href="/events"
                onClick={onClose}
                className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(13,19,33,0.05)] hover:shadow-[0_8px_22px_rgba(13,19,33,0.09)] flex items-center justify-between gap-3 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F6F4EF] text-[#161C2C] flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#161C2C] group-hover:text-[#9A742B] transition-colors">
                      คอร์สเรียน และกิจกรรม
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {nextEvent ? `${nextEvent.published_date_text || 'เร็วๆ นี้'} • ${nextEvent.title}` : 'ดูกำหนดการทั้งหมด'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#161C2C] shrink-0" />
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(13,19,33,0.05)] hover:shadow-[0_8px_22px_rgba(13,19,33,0.09)] flex items-center justify-between gap-3 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#161C2C] group-hover:text-emerald-700 transition-colors">
                        แดชบอร์ดแอดมิน (Admin)
                      </p>
                      <p className="text-xs text-slate-500">จัดการสมาชิก กิจกรรม และสิทธิพิเศษ</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <WebLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

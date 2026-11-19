'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockPrivileges } from '@/lib/mockData';
import { PrivilegeItem } from '@/types';
import { ActivePrivilegeModal, ActivePrivilegeData } from '@/components/privileges/ActivePrivilegeModal';
import {
  ArrowLeft,
  Coins,
  Clock,
  ShieldAlert,
  QrCode,
} from 'lucide-react';

export default function PrivilegeDetailPage() {
  const params = useParams();
  const id = String(params?.id || '');
  const { profile, switchProfile } = useLiffAuth();
  const initialPrivilege = mockPrivileges.find((p) => p.id === id) || null;

  const [privilege, setPrivilege] = useState<PrivilegeItem | null>(initialPrivilege);
  const [isFetchingPrivilege, setIsFetchingPrivilege] = useState<boolean>(!initialPrivilege);
  const [mounted, setMounted] = useState(false);
  const [activePrivilege, setActivePrivilege] = useState<ActivePrivilegeData | null>(null);
  const [savedRedemption, setSavedRedemption] = useState<ActivePrivilegeData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    async function loadPrivilege() {
      try {
        const res = await fetch(`/api/privileges?id=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = (await res.json()) as { privilege?: PrivilegeItem | null };
          if (!cancelled && data.privilege) {
            setPrivilege(data.privilege);
          }
        }
      } catch {
        // Fallback to mockPrivileges already set
      } finally {
        if (!cancelled) setIsFetchingPrivilege(false);
      }
    }

    if (id) {
      loadPrivilege();
    } else {
      setIsFetchingPrivilege(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!privilege || typeof window === 'undefined') return;
    try {
      const existing = JSON.parse(localStorage.getItem('yfti_redemptions') || '[]');
      const found = Array.isArray(existing)
        ? existing.find((r: any) => r.privilegeId === privilege.id)
        : null;
      if (found) {
        setSavedRedemption({
          title: found.title,
          merchant: found.merchant,
          discountLabel: found.discountLabel || privilege.discount_label,
          code: found.code,
          redeemedAt: found.redeemedAt,
        });
      }
    } catch {}
  }, [privilege]);

  const activeProfile = mounted ? profile : null;
  const isMember = mounted
    ? Boolean(
        activeProfile &&
          activeProfile.role !== 'PENDING' &&
          activeProfile.approval_status !== 'PENDING' &&
          activeProfile.approval_status !== 'REJECTED'
      )
    : false;
  const userPoints = activeProfile?.points_balance ?? 0;
  const canAfford = privilege ? userPoints >= privilege.points_required : false;

  const handleRedeem = () => {
    setErrorMsg(null);
    if (!privilege) return;
    if (!isMember || !profile) {
      setErrorMsg('กรุณาสมัครสมาชิกและเข้าสู่ระบบก่อนกดแลกสิทธิพิเศษ');
      return;
    }
    if (!canAfford) {
      setErrorMsg(`คะแนนสะสมไม่เพียงพอ (ต้องการ ${privilege.points_required} Pts)`);
      return;
    }

    const generatedCode = `YEC-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowText = new Date().toLocaleString('th-TH');
    const updatedUser = {
      ...profile,
      points_balance: userPoints - privilege.points_required,
    };
    switchProfile(updatedUser);

    const record = {
      id: `red-${Date.now()}`,
      privilegeId: privilege.id,
      title: privilege.title,
      merchant: privilege.merchant,
      discountLabel: privilege.discount_label,
      points: privilege.points_required,
      code: generatedCode,
      redeemedAt: nowText,
    };

    if (typeof window !== 'undefined') {
      try {
        const parsed = JSON.parse(localStorage.getItem('yfti_redemptions') || '[]');
        const list = Array.isArray(parsed) ? parsed : [];
        list.unshift(record);
        localStorage.setItem('yfti_redemptions', JSON.stringify(list));
      } catch {}
    }

    // Sync redemption to server so Admin can scan & verify from any device
    fetch('/api/privileges/redemptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...record,
        memberId: profile.id,
        memberName: profile.display_name,
      }),
    }).catch(() => {});

    const modalData: ActivePrivilegeData = {
      title: privilege.title,
      merchant: privilege.merchant,
      discountLabel: privilege.discount_label,
      code: generatedCode,
      redeemedAt: nowText,
    };
    setSavedRedemption(modalData);
    setActivePrivilege(modalData);
  };

  if (!privilege && isFetchingPrivilege) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-12 text-center text-xs font-bold text-slate-400">
        กำลังโหลดข้อมูลสิทธิพิเศษ...
      </div>
    );
  }

  if (!privilege) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-12 text-center space-y-4">
        <p className="text-sm font-bold text-[#1E2538]">ไม่พบสิทธิพิเศษที่ต้องการ</p>
        <Link
          href="/privileges"
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#1E2538] px-4 py-2.5 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้า Privileges
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F6F4EF] text-[#161C2C] pb-4">
      {/* ================= 1. FULL-BLEED LUXURY PHOTO HERO (FIXED IN FRONT) ================= */}
      <div className="sticky top-0 md:top-24 z-30 w-full h-[230px] sm:h-[290px] bg-[#0D1321] rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)] overflow-hidden">
        <img
          src={privilege.image_url}
          alt={privilege.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/unsplash_hEC6zxdFF0M.webp';
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,16,29,0.68) 0%, rgba(11,16,29,0.18) 45%, rgba(11,16,29,0.88) 100%)',
          }}
        />

        {/* Floating Top Navigation & Points Bar */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between gap-2">
          <Link
            href="/privileges"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0D1321]/65 hover:bg-[#0D1321]/85 backdrop-blur-md px-3.5 py-2 rounded-full transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#ECD28E]" />
            <span>สิทธิพิเศษ</span>
          </Link>

          <div className="px-3.5 py-1.5 rounded-full badge-gold-metallic text-xs font-bold flex items-center gap-1.5 tabular-nums">
            <Coins className="w-3.5 h-3.5" />
            <span>{userPoints.toLocaleString()} Pts</span>
          </div>
        </div>

        {/* Bottom-Left Hero Title & Discount Pill */}
        <div className="absolute inset-x-0 bottom-10 z-10 max-w-3xl mx-auto px-4 sm:px-6 space-y-1.5 text-white">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0D1321]/85 border border-[#ECD28E]/40 text-[#ECD28E] text-[10px] font-bold uppercase tracking-wider">
              {privilege.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full luxury-gold-btn text-[10px] font-extrabold">
              {privilege.discount_label}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide drop-shadow-sm">
            {privilege.merchant}
          </p>
          <h1 className="text-lg sm:text-2xl font-extrabold text-white leading-snug drop-shadow-sm line-clamp-2">
            {privilege.title}
          </h1>
        </div>
      </div>

      {/* ================= 2. WARM IVORY CONTENT SHEET ================= */}
      <div className="relative z-10 pt-5 px-4 sm:px-6 min-h-[60vh]">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* 3 Borderless Stat Tiles */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-3.5 rounded-2xl bg-white shadow-[0_6px_20px_rgba(13,19,33,0.05)]">
              <span className="text-[10px] font-semibold text-[#9A742B] block">ใช้คะแนนแลก</span>
              <span className="text-sm sm:text-base font-extrabold text-[#161C2C] tabular-nums mt-0.5 block">
                {privilege.points_required} Pts
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white shadow-[0_6px_20px_rgba(13,19,33,0.05)]">
              <span className="text-[10px] font-semibold text-slate-500 block">คะแนนของคุณ</span>
              <span className="text-sm sm:text-base font-extrabold text-[#161C2C] tabular-nums mt-0.5 block">
                {userPoints.toLocaleString()} Pts
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white shadow-[0_6px_20px_rgba(13,19,33,0.05)]">
              <span className="text-[10px] font-semibold text-slate-500 block">วันหมดอายุ</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#161C2C] flex items-center gap-1 mt-0.5 truncate">
                <Clock className="w-3 h-3 text-[#B18A3B] shrink-0" />
                <span className="truncate">{privilege.expiry_date}</span>
              </span>
            </div>
          </div>

          {/* Borderless Main Content Card */}
          <div className="bg-white rounded-[24px] p-5 sm:p-7 shadow-[0_6px_24px_rgba(13,19,33,0.055)] space-y-5">
            {/* Description */}
            <div className="space-y-1.5">
              <h2 className="text-sm font-extrabold text-[#161C2C]">รายละเอียดสิทธิพิเศษ</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {privilege.description}
              </p>
            </div>

            {/* Conditions */}
            <div className="space-y-2 pt-4 border-t border-[#F1ECE2]">
              <h2 className="text-sm font-extrabold text-[#161C2C]">เงื่อนไขการใช้สิทธิ์</h2>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {privilege.conditions.map((cond, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#B18A3B] font-bold">•</span>
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to use */}
            <div className="space-y-2 pt-4 border-t border-[#F1ECE2]">
              <h2 className="text-sm font-extrabold text-[#161C2C]">วิธีการใช้สิทธิ์</h2>
              <ol className="space-y-1.5 text-xs sm:text-sm text-slate-600 list-decimal list-inside">
                {privilege.how_to_use.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Redeem CTA */}
            <div className="pt-2">
              {!isMember ? (
                <Link
                  href="/register"
                  className="block w-full py-3.5 rounded-full bg-[#0D1321] hover:bg-[#18223A] text-white text-center text-sm font-bold transition shadow-md"
                >
                  สมัครสมาชิกเพื่อแลกสิทธิพิเศษ
                </Link>
              ) : (
                <div className="space-y-2.5">
                  {savedRedemption && (
                    <button
                      type="button"
                      onClick={() => setActivePrivilege(savedRedemption)}
                      className="w-full py-3 rounded-full bg-[#0D1321] hover:bg-[#18223A] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4 text-[#ECD28E]" />
                      <span>ดูรหัสที่แลกไว้แล้ว (QR / Barcode)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRedeem}
                    disabled={!canAfford}
                    className={`w-full py-3.5 rounded-full text-sm font-bold transition ${
                      canAfford
                        ? 'luxury-gold-btn'
                        : 'bg-[#E6E0D4] text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford
                      ? `แลก ${privilege.points_required} Points ทันที`
                      : `คะแนนสะสมไม่พอ (ขาดอีก ${privilege.points_required - userPoints} Pts)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Privilege Modal (QR + 1D Barcode + Code) */}
      <ActivePrivilegeModal
        data={activePrivilege}
        onClose={() => setActivePrivilege(null)}
      />
    </div>
  );
}

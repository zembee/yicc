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
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-24 space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/privileges"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1E2538] hover:text-[#B38728] transition px-3.5 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้า Privileges</span>
        </Link>

        <div className="px-3.5 py-1.5 rounded-full bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] text-xs font-bold flex items-center gap-1.5 tabular-nums">
          <Coins className="w-3.5 h-3.5" />
          <span>คงเหลือ {userPoints.toLocaleString()} Pts</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="relative aspect-[16/9] bg-slate-100">
          <img
            src={privilege.image_url}
            alt={privilege.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/home/unsplash_hEC6zxdFF0M.webp';
            }}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-4 left-4 px-3.5 py-1 rounded-full bg-[#B89138] text-white text-xs font-bold shadow-sm">
            {privilege.discount_label}
          </span>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {/* Header Info */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">{privilege.merchant}</span>
            <h1 className="text-lg sm:text-2xl font-bold text-[#1E2538] leading-snug">
              {privilege.title}
            </h1>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#FBF6EC] border border-[#EFE2C2]">
                <span className="text-[10px] font-semibold text-[#9A7320] block">ใช้คะแนนแลก</span>
                <span className="text-sm sm:text-base font-bold text-[#1E2538] tabular-nums">
                  {privilege.points_required} Pts
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
                <span className="text-[10px] font-semibold text-slate-500 block">คะแนนของคุณ</span>
                <span className="text-sm sm:text-base font-bold text-[#1E2538] tabular-nums">
                  {userPoints.toLocaleString()} Pts
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
                <span className="text-[10px] font-semibold text-slate-500 block">วันหมดอายุ</span>
                <span className="text-xs sm:text-sm font-bold text-[#1E2538] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[#B38728] shrink-0" />
                  {privilege.expiry_date}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <h2 className="text-sm font-bold text-[#1E2538]">รายละเอียด</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {privilege.description}
            </p>
          </div>

          {/* Conditions */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h2 className="text-sm font-bold text-[#1E2538]">เงื่อนไขการใช้สิทธิ์</h2>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
              {privilege.conditions.map((cond, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#B38728] font-bold">•</span>
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to use */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h2 className="text-sm font-bold text-[#1E2538]">วิธีการใช้ Point</h2>
            <ol className="space-y-1.5 text-xs sm:text-sm text-slate-600 list-decimal list-inside">
              {privilege.how_to_use.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Redeem Button */}
          {!isMember ? (
            <Link
              href="/register"
              className="block w-full py-3.5 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] text-white text-center text-sm font-bold transition shadow-sm"
            >
              สมัครสมาชิกเพื่อแลกสิทธิพิเศษ
            </Link>
          ) : (
            <div className="space-y-2.5">
              {savedRedemption && (
                <button
                  onClick={() => setActivePrivilege(savedRedemption)}
                  className="w-full py-3 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] text-white text-xs sm:text-sm font-bold transition shadow-sm flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-[#E5C158]" />
                  <span>ดูรหัสที่แลกไว้แล้ว (QR / Barcode)</span>
                </button>
              )}
              <button
                onClick={handleRedeem}
                disabled={!canAfford}
                className="w-full py-3.5 rounded-xl bg-[#B89138] hover:bg-[#a37f2d] disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold transition shadow-sm"
              >
                {canAfford
                  ? `แลก ${privilege.points_required} Points ทันที`
                  : `คะแนนสะสมไม่พอ (ขาดอีก ${privilege.points_required - userPoints} Pts)`}
              </button>
            </div>
          )}
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

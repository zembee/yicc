'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockPrivileges } from '@/lib/mockData';
import { PrivilegeCategory } from '@/types';
import { ActivePrivilegeModal, ActivePrivilegeData } from '@/components/privileges/ActivePrivilegeModal';
import { PrivilegesPageSkeleton } from '@/components/ui/PageSkeletons';
import {
  Search,
  Coins,
  Ticket,
  Gift,
  Utensils,
  Plane,
  ShoppingBag,
  Sparkles,
  CalendarDays,
  Film,
  CheckCircle2,
  X,
  UserPlus,
  QrCode,
  ArrowUpDown,
} from 'lucide-react';

const CATEGORIES: {
  id: PrivilegeCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'All', label: 'ทั้งหมด', icon: Gift },
  { id: 'Food & Drink', label: 'อาหาร', icon: Utensils },
  { id: 'Travel', label: 'ท่องเที่ยว', icon: Plane },
  { id: 'Shopping', label: 'ช้อปปิ้ง', icon: ShoppingBag },
  { id: 'Lifestyle', label: 'ไลฟ์สไตล์', icon: Sparkles },
  { id: 'Events', label: 'อีเวนต์', icon: CalendarDays },
  { id: 'Entertainment', label: 'บันเทิง', icon: Film },
];

interface RedemptionRecord {
  id: string;
  privilegeId: string;
  title: string;
  merchant: string;
  discountLabel?: string;
  points: number;
  code: string;
  redeemedAt: string;
}

function PrivilegesContent() {
  const searchParams = useSearchParams();
  const { profile } = useLiffAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrivilegeCategory>('All');
  const [sortBy, setSortBy] = useState<'default' | 'points_asc' | 'points_desc'>('default');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [history, setHistory] = useState<RedemptionRecord[]>([]);
  const [selectedActivePrivilege, setSelectedActivePrivilege] = useState<ActivePrivilegeData | null>(null);
  const [privileges, setPrivileges] = useState(mockPrivileges);

  useEffect(() => {
    setMounted(true);
    fetch('/api/privileges')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.privileges)) {
          setPrivileges(data.privileges);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const catParam = searchParams?.get('category');
    if (catParam) {
      const matched = CATEGORIES.find(
        (c) => c.id.toLowerCase() === catParam.toLowerCase()
      );
      if (matched) {
        setSelectedCategory(matched.id);
      }
    }
    if (searchParams?.get('tab') === 'history') {
      setIsHistoryOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yfti_redemptions');
        if (saved) setHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const filteredPrivileges = useMemo(() => {
    const list = privileges.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.merchant.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    if (sortBy === 'points_asc') {
      return [...list].sort((a, b) => a.points_required - b.points_required);
    }
    if (sortBy === 'points_desc') {
      return [...list].sort((a, b) => b.points_required - a.points_required);
    }
    return list;
  }, [privileges, selectedCategory, searchQuery, sortBy]);

  const activeProfile = mounted ? profile : null;
  const isMember = mounted
    ? Boolean(activeProfile && activeProfile.role !== 'PENDING' && activeProfile.approval_status !== 'REJECTED')
    : true;
  const userPoints = activeProfile?.points_balance ?? 0;

  return (
    <div className="w-full bg-[#F6F4EF] pb-4">
      {/* ================= 1. CURVED OBSIDIAN HEADER + ICON CATEGORY BAR (FIXED IN FRONT) ================= */}
      <section className="sticky top-0 md:top-24 z-30 luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(90% 80% at 85% 0%, rgba(197,155,56,0.16) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                สิทธิพิเศษ <span className="font-light text-white/80 text-base sm:text-lg">Privileges</span>
              </h1>
              <p className="text-[11px] text-slate-300 mt-0.5">
                ใช้คะแนนสะสมแลกรับส่วนลดจากพาร์ทเนอร์
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-sm"
              >
                <Ticket className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>คูปอง</span>
                {history.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FB7170] text-[10px] font-extrabold">
                    {history.length}
                  </span>
                )}
              </button>
              <div className="px-3 py-1.5 rounded-xl badge-gold-metallic flex items-center gap-1.5 text-xs font-bold tabular-nums">
                <Coins className="w-3.5 h-3.5" />
                <span>{userPoints.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Floating Crisp White Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสิทธิพิเศษ ร้านค้า หรือหมวดหมู่..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white text-[#1E2538] text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C59B38] shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Horizontal Scrollable Rounded-Square Icon Category Bar (Matches Style 3 Screen 2) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  <span
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center border transition-all duration-200 ${
                      isActive
                        ? 'bg-[#C59B38]/22 border-[#E5C158] text-[#E5C158] shadow-[0_0_16px_rgba(229,193,88,0.25)]'
                        : 'bg-white/8 border-white/10 text-slate-300 group-hover:bg-white/14 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span
                    className={`text-[10px] font-semibold whitespace-nowrap ${
                      isActive ? 'text-[#E5C158]' : 'text-slate-300'
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 2. WARM IVORY CONTENT SHEET ================= */}
      <div className="relative z-10 pt-5 px-4 sm:px-6 min-h-[65vh]">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Non-Member Invite Card */}
          {!isMember && (
            <div className="bg-[#FDFBF5] border border-[#EFE2C2] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B89138] text-white flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-[#1E2538]">
                    สมัครเป็นสมาชิก Young FTI เพื่อรับสิทธิพิเศษ
                  </h2>
                  <p className="text-xs text-slate-600">
                    สิทธิพิเศษสำหรับสมาชิกเท่านั้น กดดูสิทธิประโยชน์และสมัครได้ทันที
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBenefitsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#EFE2C2] text-xs font-bold text-[#9A7320] hover:bg-[#FBF6EC] transition"
                >
                  ดูรายละเอียด
                </button>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-[#B89138] hover:bg-[#a37f2d] text-white text-xs font-bold transition"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            </div>
          )}

          {/* Metadata & Sort Row */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-extrabold text-[#1E2538] tabular-nums">
              {filteredPrivileges.length} สิทธิพิเศษ
            </p>

            <div className="flex items-center gap-2">
              {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-[#FB7170] hover:underline"
                >
                  ล้างตัวกรอง
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setSortBy((prev) =>
                    prev === 'default'
                      ? 'points_asc'
                      : prev === 'points_asc'
                      ? 'points_desc'
                      : 'default'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:border-[#C59B38] text-xs font-bold text-[#1E2538] flex items-center gap-1.5 shadow-sm transition"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#C59B38]" />
                <span>
                  {sortBy === 'points_asc'
                    ? 'คะแนนน้อย → มาก'
                    : sortBy === 'points_desc'
                    ? 'คะแนนมาก → น้อย'
                    : 'เรียงตามแนะนำ'}
                </span>
              </button>
            </div>
          </div>

          {/* ================= 2-COLUMN PRIVILEGE CARDS (MATCHES STYLE 3 SCREEN 2) ================= */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {filteredPrivileges.map((priv) => (
              <Link
                key={priv.id}
                href={`/privileges/${priv.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_6px_22px_rgba(13,19,33,0.06)] hover:shadow-[0_12px_28px_rgba(13,19,33,0.11)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="relative aspect-[4/3] bg-[#0D1321] overflow-hidden">
                  <img
                    src={priv.image_url}
                    alt={priv.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                  {/* Top-Left Obsidian-Gold Discount Badge */}
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-lg bg-[#0D1321]/90 backdrop-blur-md border border-[#DFC27D]/40 text-[#ECD28E] text-[10px] font-bold shadow-sm max-w-[75%] truncate">
                    {priv.discount_label}
                  </span>

                  {/* Bottom-Right Satin Gold Points Badge */}
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 text-[#161C2C] text-[10px] font-extrabold tabular-nums shadow-sm">
                    <Coins className="w-2.5 h-2.5 text-[#B18A3B]" />
                    {priv.points_required} Pts
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-[#161C2C] line-clamp-1 group-hover:text-[#9A742B] transition-colors">
                      {priv.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">{priv.merchant}</p>
                  </div>

                  {/* Satin Champagne Gold Pill Redeem CTA */}
                  <div className="w-full py-1.5 rounded-full luxury-gold-btn text-center text-[11px] font-bold transition">
                    แลกรับสิทธิ์
                  </div>
                </div>
              </Link>
            ))}

            {filteredPrivileges.length === 0 && (
              <div className="col-span-2 md:col-span-3 py-12 text-center bg-white rounded-2xl shadow-[0_6px_20px_rgba(13,19,33,0.05)] text-xs text-slate-500 space-y-2">
                <Gift className="w-8 h-8 text-slate-300 mx-auto" />
                <p>ไม่พบสิทธิพิเศษที่ตรงกับคำค้นหา</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= REDEMPTION HISTORY MODAL (MY COUPONS) ================= */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#F4F6FA] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[82vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#141A2C] text-white p-5 space-y-1.5 border-b-[3px] border-[#C59B38]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#E5C158]" />
                  <span>คูปองของฉัน (My Coupons)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 tabular-nums">
                Points คงเหลือ: <strong className="text-[#E5C158]">{userPoints.toLocaleString()}</strong>
              </p>
            </div>

            <div className="overflow-y-auto p-4 space-y-2.5">
              {history.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Ticket className="w-9 h-9 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">ยังไม่มีคูปองที่แลกไว้</p>
                </div>
              ) : (
                history.map((h) => {
                  const matchedPriv = privileges.find((p) => p.id === h.privilegeId);
                  const discountLabel = h.discountLabel || matchedPriv?.discount_label;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setIsHistoryOpen(false);
                        setSelectedActivePrivilege({
                          title: h.title,
                          merchant: h.merchant,
                          discountLabel,
                          code: h.code,
                          redeemedAt: h.redeemedAt,
                        });
                      }}
                      className="w-full text-left p-3.5 rounded-2xl bg-white shadow-[0_4px_16px_rgba(13,19,33,0.05)] hover:shadow-[0_8px_22px_rgba(13,19,33,0.09)] space-y-1.5 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#1E2538] truncate">
                          {discountLabel || h.title}
                        </p>
                        <span className="text-[11px] font-bold text-[#9A7320] tabular-nums shrink-0">
                          -{h.points} Pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {h.merchant} • {h.redeemedAt}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B38728]">
                        <QrCode className="w-3.5 h-3.5" />
                        <span className="font-mono">{h.code}</span>
                        <span>• แตะเพื่อแสดงรหัส</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MEMBER BENEFITS MODAL ================= */}
      {isBenefitsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setIsBenefitsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E2538]">สิทธิประโยชน์สำหรับสมาชิก YFTI</h3>
              <button
                type="button"
                onClick={() => setIsBenefitsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B38728] shrink-0 mt-0.5" />
                <span>แลกส่วนลดร้านอาหาร โรงแรม เลานจ์สนามบิน และพาร์ทเนอร์ชั้นนำ</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B38728] shrink-0 mt-0.5" />
                <span>สะสม Points จากการเข้าเรียนคอร์ส กิจกรรม และภารกิจประจำรุ่น</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B38728] shrink-0 mt-0.5" />
                <span>สิทธิ์เข้าร่วมงาน Networking และ Business Matching ในเครือข่าย ส.อ.ท.</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-3 rounded-xl bg-[#B89138] hover:bg-[#a37f2d] text-white text-center text-xs font-bold transition"
            >
              สมัครสมาชิกเลย
            </Link>
          </div>
        </div>
      )}

      {/* Active Privilege Modal from History */}
      <ActivePrivilegeModal
        data={selectedActivePrivilege}
        onClose={() => setSelectedActivePrivilege(null)}
      />
    </div>
  );
}

export default function PrivilegesPage() {
  return (
    <Suspense fallback={<PrivilegesPageSkeleton />}>
      <PrivilegesContent />
    </Suspense>
  );
}

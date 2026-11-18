'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockPrivileges } from '@/lib/mockData';
import { PrivilegeCategory } from '@/types';
import { ActivePrivilegeModal, ActivePrivilegeData } from '@/components/privileges/ActivePrivilegeModal';
import {
  ArrowLeft,
  Search,
  Coins,
  History,
  Gift,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  UserPlus,
  QrCode,
} from 'lucide-react';

const CATEGORIES: { id: PrivilegeCategory; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Events', label: 'Events' },
  { id: 'Food & Drink', label: 'Food & Drink' },
  { id: 'Shopping', label: 'Shopping' },
  { id: 'Entertainment', label: 'Entertainment' },
  { id: 'Travel', label: 'Travel' },
  { id: 'Lifestyle', label: 'Lifestyle' },
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
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [history, setHistory] = useState<RedemptionRecord[]>([]);
  const [selectedActivePrivilege, setSelectedActivePrivilege] = useState<ActivePrivilegeData | null>(null);

  useEffect(() => {
    setMounted(true);
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
  }, [searchParams]);

  const featuredPrivileges = useMemo(
    () => mockPrivileges.filter((p) => p.is_featured),
    []
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yfti_redemptions');
        if (saved) setHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (featuredPrivileges.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % featuredPrivileges.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [featuredPrivileges.length]);

  const filteredPrivileges = useMemo(() => {
    return mockPrivileges.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.merchant.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const activeProfile = mounted ? profile : null;
  const isMember = mounted
    ? Boolean(activeProfile && activeProfile.role !== 'PENDING' && activeProfile.approval_status !== 'REJECTED')
    : true;
  const userPoints = activeProfile?.points_balance ?? 0;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 pb-24 space-y-5">
      {/* ================= TOP EXECUTIVE NAVY HEADER & SEARCH ================= */}
      <div className="bg-[#1E2538] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              aria-label="กลับหน้าหลัก"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">Privileges</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[#E5C158] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
            <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 flex items-center gap-1.5 text-white text-xs font-bold tabular-nums">
              <Coins className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>{userPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสิทธิพิเศษ ร้านค้า หรือหมวดหมู่..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white text-[#1E2538] text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C59B38]"
          />
        </div>
      </div>

      {/* ================= NON-MEMBER INVITE CARD ================= */}
      {!isMember && (
        <div className="bg-[#FDFBF5] border border-[#EFE2C2] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B89138] text-white flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#1E2538]">
                สมัครเป็นสมาชิก Young FTI เพื่อรับสิทธิพิเศษ
              </h2>
              <p className="text-xs text-slate-600">
                สิทธิพิเศษสำหรับสมาชิกเท่านั้น กดดูสิทธิประโยชน์ทั้งหมดและสมัครเข้าร่วมได้ทันที
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsBenefitsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#EFE2C2] text-xs font-bold text-[#9A7320] hover:bg-[#FBF6EC] transition"
            >
              ดูสิทธิพิเศษสมาชิก
            </button>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-[#B89138] hover:bg-[#a37f2d] text-white text-xs font-bold transition"
            >
              สมัครสมาชิกเลย
            </Link>
          </div>
        </div>
      )}

      {/* ================= BANNER ADS CAROUSEL ================= */}
      {featuredPrivileges.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-[#1E2538]">
          <Link
            href={`/privileges/${featuredPrivileges[carouselIdx].id}`}
            className="block relative aspect-[16/8] sm:aspect-[16/6]"
          >
            <img
              src={featuredPrivileges[carouselIdx].image_url}
              alt={featuredPrivileges[carouselIdx].title}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-4 left-4 right-14 text-white space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#C59B38] text-[10px] font-bold text-white">
                {featuredPrivileges[carouselIdx].discount_label}
              </span>
              <h3 className="text-sm sm:text-lg font-bold line-clamp-1">
                {featuredPrivileges[carouselIdx].title}
              </h3>
              <p className="text-[11px] text-slate-200 tabular-nums">
                ใช้ {featuredPrivileges[carouselIdx].points_required} Points • {featuredPrivileges[carouselIdx].merchant}
              </p>
            </div>
          </Link>

          <button
            onClick={() =>
              setCarouselIdx((prev) => (prev - 1 + featuredPrivileges.length) % featuredPrivileges.length)
            }
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCarouselIdx((prev) => (prev + 1) % featuredPrivileges.length)}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= CATEGORY FILTER PILLS ================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-[#B89138] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Category Result Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-[#1E2538]">
          หมวดหมู่: {selectedCategory} ({filteredPrivileges.length} รายการ)
        </span>
        {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#9A7320] hover:underline"
          >
            แสดงทั้งหมด
          </button>
        )}
      </div>

      {/* ================= PRIVILEGES GRID (2 COLUMNS) ================= */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {filteredPrivileges.map((priv) => (
          <Link
            key={priv.id}
            href={`/privileges/${priv.id}`}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:border-[#C59B38] transition flex flex-col justify-between group"
          >
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
              <img
                src={priv.image_url}
                alt={priv.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 text-[#1E2538] text-[10px] font-bold tabular-nums shadow-sm">
                <Coins className="w-3 h-3 text-[#B38728]" />
                {priv.points_required}
              </span>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/65 text-white text-[10px] font-medium max-w-[55%] truncate">
                {priv.category}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 space-y-1">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase block truncate">
                {priv.merchant}
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#1E2538]">{priv.discount_label}</p>
              <h3 className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">{priv.title}</h3>
            </div>
          </Link>
        ))}

        {filteredPrivileges.length === 0 && (
          <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
            <Gift className="w-8 h-8 text-slate-300 mx-auto" />
            <p>ไม่พบสิทธิพิเศษที่ตรงกับคำค้นหา</p>
          </div>
        )}
      </div>

      {/* ================= REDEMPTION HISTORY MODAL ================= */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#F7F7F5] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1E2538] text-white p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Redemption History</h3>
                <button
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
                <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีประวัติการแลกสิทธิพิเศษ</p>
              ) : (
                history.map((h) => {
                  const matchedPriv = mockPrivileges.find((p) => p.id === h.privilegeId);
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
                      className="w-full text-left p-3.5 rounded-2xl bg-white hover:border-[#C59B38] border border-slate-200/80 space-y-1.5 transition"
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
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-[#1E2538] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PrivilegesContent />
    </Suspense>
  );
}

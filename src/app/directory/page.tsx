'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { yftiParticipants } from '@/lib/mockData';
import { getParticipants } from '@/lib/dataService';
import { Participant } from '@/types';
import type { Html5QrcodeScanner } from 'html5-qrcode';
import { DirectoryPageSkeleton } from '@/components/ui/PageSkeletons';
import Link from 'next/link';
import { 
  Search, 
  Building2, 
  X, 
  ChevronLeft,
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  User, 
  QrCode,
  ArrowUpDown,
  UserPlus,
  UserCheck,
  Keyboard,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const HOUSES_LIST = [
  { value: 'ALL', label: 'ดาว (ทั้งหมด)' },
  { value: 'The Sun', label: 'The Sun' },
  { value: 'Earth', label: 'Earth' },
  { value: 'Jupiter', label: 'Jupiter' },
  { value: 'Mars', label: 'Mars' },
  { value: 'Mercury', label: 'Mercury' },
  { value: 'Neptune', label: 'Neptune' },
  { value: 'Saturn', label: 'Saturn' },
  { value: 'Uranus', label: 'Uranus' },
  { value: 'Venus', label: 'Venus' },
];

const INDUSTRY_GROUPS = [
  { value: 'ALL', label: 'กลุ่มอุตสาหกรรม (ทั้งหมด)' },
  { value: 'agriculture_and_food_industrial', label: 'เกษตรและอุตสาหกรรมอาหาร' },
  { value: 'resources', label: 'ทรัพยากร' },
  { value: 'technology', label: 'เทคโนโลยี' },
  { value: 'financial_and_investment', label: 'ธุรกิจการเงิน และการลงทุน' },
  { value: 'services', label: 'บริการ' },
  { value: 'industrial_goods', label: 'สินค้าอุตสาหกรรม' },
  { value: 'consumer_goods', label: 'สินค้าอุปโภคบริโภค' },
  { value: 'real_estate_and_construction', label: 'อสังหาริมทรัพย์และก่อสร้าง' },
];

const BUSINESS_CATEGORIES = [
  { value: 'ALL', label: 'หมวดธุรกิจ (ทั้งหมด)' },
  { value: 'software_ict', label: 'Software ICT' },
  { value: 'tourism_and_recreation', label: 'การท่องเที่ยวและสันทนาการ' },
  { value: 'printing_and_packaging', label: 'การพิมพ์ และบรรจุภัณฑ์' },
  { value: 'medicine', label: 'การแพทย์' },
  { value: 'transportation_and_logistics', label: 'ขนส่งและโลจิสติกส์' },
  { value: 'household_and_office_supplies', label: 'ของใช้ในครัวเรือนและสำนักงาน' },
  { value: 'cosmetics_medicines_medical_equipment', label: 'เครื่องสำอาง ยา และเครื่องมือแพทย์' },
  { value: 'electronic_parts', label: 'ชิ้นส่วนอิเล็กทรอนิกส์' },
  { value: 'agriculture_business', label: 'ธุรกิจการเกษตร' },
  { value: 'financial_and_investment', label: 'ธุรกิจการเงิน และการลงทุน' },
  { value: 'special_services', label: 'บริการเฉพาะกิจ' },
  { value: 'construction_contracting_services', label: 'บริการรับเหมาก่อสร้าง' },
  { value: 'petrochemicals_and_chemicals', label: 'ปิโตรเคมีและเคมีภัณฑ์' },
  { value: 'energy_and_utilities', label: 'พลังงานและสาธารณูปโภค' },
  { value: 'real_estate_development', label: 'พัฒนาอสังหาริมทรัพย์' },
  { value: 'commerce', label: 'พาณิชย์' },
  { value: 'fashion', label: 'แฟชั่น eg. เครื่องนุ่งห่ม รองเท้า' },
  { value: 'automative', label: 'ยานยนต์ รวมถึง ชิ้นส่วนและอะไหล่ยานยนต์' },
  { value: 'instruction_materials', label: 'วัสดุก่อสร้าง' },
  { value: 'industial_materials_machinery', label: 'วัสดุอุตสาหกรรมและเครื่องจักร' },
  { value: 'metal_products', label: 'เหล็ก และ ผลิตภัณฑ์โลหะ' },
  { value: 'mine', label: 'เหมืองแร่' },
  { value: 'food_and_baverage', label: 'อาหารและเครื่องดื่ม รวมถึง อาหารสัตว์เลี้ยง' },
  { value: 'others', label: 'อื่นๆ' },
];

const COHORT_LIST = [
  { value: 'ALL', label: 'รุ่น (ทั้งหมด)' },
  { value: 'yfti_11', label: 'YFTI 11' },
  { value: 'yfti_10', label: 'YFTI 10' },
  { value: 'yfti_9', label: 'YFTI 9' },
  { value: 'yfti_8', label: 'YFTI 8' },
  { value: 'yfti_7', label: 'YFTI 7' },
  { value: 'yfti_6', label: 'YFTI 6' },
  { value: 'yfti_5', label: 'YFTI 5' },
  { value: 'yfti_4', label: 'YFTI 4' },
  { value: 'yfti_3', label: 'YFTI 3' },
  { value: 'yfti_2', label: 'YFTI 2' },
  { value: 'yfti_1', label: 'YFTI 1' },
];

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

const COHORT_COMMITTEE_ROLES: Record<string, { role: string; order: number }> = {
  '3090': { role: 'ประธานรุ่น', order: 1 },
  '3296': { role: 'รองประธานรุ่น', order: 2 },
  '3294': { role: 'เลขาธิการ', order: 3 },
  '3292': { role: 'เหรัญญิก', order: 4 },
  '3290': { role: 'กรรมการบริหารรุ่น', order: 5 },
  '3285': { role: 'กรรมการบริหารรุ่น', order: 6 },
  '3279': { role: 'กรรมการบริหารรุ่น', order: 7 },
  '3277': { role: 'กรรมการบริหารรุ่น', order: 8 },
  '3274': { role: 'กรรมการบริหารรุ่น', order: 9 },
  '3264': { role: 'กรรมการบริหารรุ่น', order: 10 },
};

function DirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>(yftiParticipants);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCohort, setSelectedCohort] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('yfti_following_ids') || '[]');
        if (Array.isArray(saved)) setFollowingIds(saved);
      } catch {}
    }
  }, []);

  const toggleFollow = (e: React.MouseEvent, pid: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowingIds((prev) => {
      const next = prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid];
      if (typeof window !== 'undefined') {
        localStorage.setItem('yfti_following_ids', JSON.stringify(next));
      }
      return next;
    });
  };

  // Load from Supabase DB on mount (with fallback to 122 participants)
  useEffect(() => {
    async function loadData() {
      const data = await getParticipants();
      if (data && data.length > 0) {
        setParticipants(data);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const indParam = searchParams?.get('industry');
    const qParam = searchParams?.get('q') || searchParams?.get('search');
    if (indParam) {
      const matched = INDUSTRY_GROUPS.find(
        (ig) => ig.value === indParam || ig.label.includes(indParam)
      );
      if (matched) {
        setSelectedIndustry(matched.value);
        setSearchQuery('');
      } else {
        setSearchQuery(indParam);
      }
    } else if (qParam) {
      setSearchQuery(qParam);
    }
    const houseParam = searchParams?.get('house') || searchParams?.get('star');
    if (houseParam) {
      setSelectedHouse(houseParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isScanModalOpen || scanMode !== 'camera') return;
    setScanError(null);
    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        const { Html5QrcodeScanner: QrScanner } = await import('html5-qrcode');
        if (cancelled) return;

        const scanner = new QrScanner(
          'directory-qr-reader',
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            let targetId = '';
            try {
              const payload = JSON.parse(decodedText);
              const raw = payload.memberId || payload.profileId;
              if (raw) {
                targetId = String(raw).trim().replace(/^Y11-0*/i, '');
              }
            } catch {
              const urlMatch = decodedText.match(/(?:yfti_participants|directory)\/([^/?#]+)/i);
              if (urlMatch?.[1]) {
                targetId = urlMatch[1];
              } else {
                const cleaned = decodedText.trim().replace(/^Y11-0*/i, '');
                if (/^\d+$/.test(cleaned)) {
                  targetId = cleaned;
                }
              }
            }

            if (targetId) {
              scanner.clear().catch(() => {});
              setIsScanModalOpen(false);
              router.push(`/yfti_participants/${targetId}`);
            } else {
              setScanError('ไม่พบรหัสสมาชิกใน QR Code นี้');
            }
          },
          () => {
            // ignore continuous scan frame errors
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.error('Directory QR Scanner init error:', err);
        if (!cancelled) {
          setScanError('ไม่สามารถเปิดกล้องได้ กรุณากรอกรหัสสมาชิกแทน');
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isScanModalOpen, scanMode, router]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedHouse, selectedIndustry, selectedCategory, selectedCohort, pageSize]);

  const stripHtml = (html?: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').replace(/&[a-z]+;/gi, ' ').trim();
  };

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const tokens = q.split(/\s+/).filter(Boolean);

      const searchableText = [
        p.name_thai,
        p.nickname_eng,
        p.fullname_eng,
        p.company_name_thai,
        p.company_name_eng,
        p.company_prefix,
        p.business_position,
        stripHtml(p.company_description),
        p.company_address,
        p.tel_number,
        p.comp_tel_number,
        p.star_group_label,
        p.star_group,
        p.industrial_groups_label,
        p.industrial_groups,
        p.business_categories_label,
        p.business_categories,
        p.gen_label,
        p.gen,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = tokens.length === 0 || tokens.every((token) => searchableText.includes(token));

      const matchesHouse = selectedHouse === 'ALL' || (() => {
        const target = selectedHouse.toLowerCase().replace(/[\s\-_]/g, '');
        const pStar = (p.star_group || '').toLowerCase().replace(/[\s\-_]/g, '');
        const pStarLabel = (p.star_group_label || '').toLowerCase().replace(/[\s\-_]/g, '');
        return (pStar && (pStar.includes(target) || target.includes(pStar))) ||
               (pStarLabel && (pStarLabel.includes(target) || target.includes(pStarLabel)));
      })();

      const matchesIndustry = selectedIndustry === 'ALL' || (() => {
        const target = selectedIndustry.toLowerCase().replace(/[\s\-_]/g, '');
        const pGroup = (p.industrial_groups || '').toLowerCase().replace(/[\s\-_]/g, '');
        const pGroupLabel = (p.industrial_groups_label || '').toLowerCase().replace(/[\s\-_]/g, '');
        return (pGroup && (pGroup.includes(target) || target.includes(pGroup))) ||
               (pGroupLabel && (pGroupLabel.includes(target) || target.includes(pGroupLabel)));
      })();

      const matchesCategory = selectedCategory === 'ALL' || (() => {
        const target = selectedCategory.toLowerCase().replace(/[\s\-_]/g, '');
        const pCat = (p.business_categories || '').toLowerCase().replace(/[\s\-_]/g, '');
        const pCatLabel = (p.business_categories_label || '').toLowerCase().replace(/[\s\-_]/g, '');
        return (pCat && (pCat.includes(target) || target.includes(pCat))) ||
               (pCatLabel && (pCatLabel.includes(target) || target.includes(pCatLabel)));
      })();

      const matchesCohort = selectedCohort === 'ALL' || (() => {
        const target = selectedCohort.toLowerCase().replace(/[\s\-_]/g, '');
        const pGen = (p.gen || '').toLowerCase().replace(/[\s\-_]/g, '');
        const pGenLabel = (p.gen_label || '').toLowerCase().replace(/[\s\-_]/g, '');
        return (pGen && (pGen.includes(target) || target.includes(pGen))) ||
               (pGenLabel && (pGenLabel.includes(target) || target.includes(pGenLabel)));
      })();

      return matchesSearch && matchesHouse && matchesIndustry && matchesCategory && matchesCohort;
    });
  }, [participants, searchQuery, selectedHouse, selectedIndustry, selectedCategory, selectedCohort]);

  const sortedParticipants = useMemo(() => {
    if (sortOrder === 'default') return filteredParticipants;
    return [...filteredParticipants].sort((a, b) => {
      const nameA = (a.name_thai || '').trim();
      const nameB = (b.name_thai || '').trim();
      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB, 'th')
        : nameB.localeCompare(nameA, 'th');
    });
  }, [filteredParticipants, sortOrder]);

  const committeeMembers = useMemo(() => {
    return participants
      .filter((p) => Boolean(COHORT_COMMITTEE_ROLES[String(p.id)]))
      .sort(
        (a, b) =>
          (COHORT_COMMITTEE_ROLES[String(a.id)]?.order ?? 999) -
          (COHORT_COMMITTEE_ROLES[String(b.id)]?.order ?? 999)
      )
      .map((p) => ({
        ...p,
        cohortRole: COHORT_COMMITTEE_ROLES[String(p.id)]?.role || 'กรรมการ',
      }));
  }, [participants]);

  // Pagination calculations
  const totalItems = sortedParticipants.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedParticipants = useMemo(() => {
    return sortedParticipants.slice(startIndex, endIndex);
  }, [sortedParticipants, startIndex, endIndex]);

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
    const resultsElement = document.getElementById('directory-results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const paginationRange = useMemo(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    if (left > 2) {
      range.push('...');
    }
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    if (right < totalPages - 1) {
      range.push('...');
    }
    if (totalPages > 1) {
      range.push(totalPages);
    }
    return range;
  }, [currentPage, totalPages]);

  const hasActiveFilters =
    selectedHouse !== 'ALL' ||
    selectedIndustry !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedCohort !== 'ALL' ||
    Boolean(searchQuery);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-20">
      {/* 1. Executive Navy Hero Header with Blended Backdrop, Search & QR Button */}
      <div className="relative overflow-hidden bg-[#141A2C] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(20,26,44,0.18)] border-b-[3px] border-[#FB7170] space-y-4">
        {/* Blended Stage Backdrop */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <img
            src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-right opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(115deg, rgba(16,22,38,0.96) 28%, rgba(24,31,52,0.88) 58%, rgba(30,37,56,0.65) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/images/icons/business.webp"
              alt="ทำเนียบธุรกิจ"
              className="w-11 h-11 rounded-xl ring-1 ring-white/15 shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl tracking-tight text-white leading-tight truncate">
                <span className="font-extrabold">ทำเนียบธุรกิจ</span>{' '}
                <span className="font-light text-white/95">Young FTI ELITE 11</span>
              </h1>
              <p className="text-xs font-medium text-[#FB7170] mt-0.5 tabular-nums">
                ทั้งหมด {participants.length.toLocaleString()} ท่าน
              </p>
            </div>
          </div>
        </div>

        {/* Search Input + QR Button (rounded-xl) */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ บริษัท หรือ keyword..."
              className="w-full pl-10 pr-9 py-2.5 bg-white text-[#1E2538] rounded-xl text-xs sm:text-sm font-medium placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#C59B38] shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setScanMode('camera');
              setScanError(null);
              setIsScanModalOpen(true);
            }}
            aria-label="สแกนเพิ่มเพื่อน"
            title="สแกนเพิ่มเพื่อน"
            className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 text-[#1E2538] flex items-center justify-center shrink-0 shadow-sm transition"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Clean Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border outline-none transition shrink-0 shadow-sm ${
            selectedIndustry !== 'ALL'
              ? 'bg-[#1E2538] border-[#1E2538] text-white'
              : 'bg-white border-slate-200/80 text-slate-700 hover:border-[#C59B38]'
          }`}
        >
          {INDUSTRY_GROUPS.map((ig) => (
            <option key={ig.value} value={ig.value} className="text-slate-800 bg-white">
              {ig.label}
            </option>
          ))}
        </select>

        <select
          value={selectedHouse}
          onChange={(e) => setSelectedHouse(e.target.value)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border outline-none transition shrink-0 shadow-sm ${
            selectedHouse !== 'ALL'
              ? 'bg-[#1E2538] border-[#1E2538] text-white'
              : 'bg-white border-slate-200/80 text-slate-700 hover:border-[#C59B38]'
          }`}
        >
          {HOUSES_LIST.map((h) => (
            <option key={h.value} value={h.value} className="text-slate-800 bg-white">
              {h.label}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border outline-none transition max-w-[180px] shrink-0 shadow-sm ${
            selectedCategory !== 'ALL'
              ? 'bg-[#1E2538] border-[#1E2538] text-white'
              : 'bg-white border-slate-200/80 text-slate-700 hover:border-[#C59B38]'
          }`}
        >
          {BUSINESS_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value} className="text-slate-800 bg-white">
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={selectedCohort}
          onChange={(e) => setSelectedCohort(e.target.value)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border outline-none transition shrink-0 shadow-sm ${
            selectedCohort !== 'ALL'
              ? 'bg-[#1E2538] border-[#1E2538] text-white'
              : 'bg-white border-slate-200/80 text-slate-700 hover:border-[#C59B38]'
          }`}
        >
          {COHORT_LIST.map((c) => (
            <option key={c.value} value={c.value} className="text-slate-800 bg-white">
              {c.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedHouse('ALL');
              setSelectedIndustry('ALL');
              setSelectedCategory('ALL');
              setSelectedCohort('ALL');
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold text-[#FB7170] hover:underline shrink-0"
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* 3. Committee Section (กรรมการ) */}
      {committeeMembers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/icons/profile.webp"
                alt="กรรมการรุ่น"
                className="w-8 h-8 rounded-lg shadow-sm shrink-0"
              />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#1E2538] leading-tight">
                  กรรมการ Young FTI ELITE 11
                </h2>
                <p className="text-[11px] text-slate-400">คณะกรรมการบริหารรุ่นที่ 11</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-400 shrink-0">เลื่อนดูรายชื่อ →</span>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x no-scrollbar">
            {committeeMembers.map((cm) => {
              const isF = followingIds.includes(String(cm.id));
              return (
                <Link
                  key={cm.id}
                  href={`/yfti_participants/${cm.id}`}
                  className="min-w-[186px] max-w-[186px] snap-start bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_6px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.11)] hover:-translate-y-0.5 hover:border-[#C59B38]/80 transition-all duration-300 flex flex-col shrink-0 group"
                >
                  {/* Top Subtle Executive Hairline */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#1E2538] via-[#C59B38] to-[#FB7170]" />

                  <div className="p-4 flex-1 flex flex-col items-center text-center gap-2.5">
                    <img
                      src={cm.profile_picture_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp'}
                      alt={cm.name_thai}
                      className="w-16 h-16 rounded-full object-cover object-top bg-slate-100 border-2 border-white ring-2 ring-[#C59B38]/35 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp';
                      }}
                    />
                    <div className="min-w-0 w-full space-y-1.5">
                      <p className="text-xs font-bold text-[#1E2538] group-hover:text-[#B38728] transition-colors truncate">
                        {cm.name_thai}
                      </p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2] text-[10px] font-bold">
                        {cm.cohortRole}
                      </span>
                      {cm.company_name_thai && (
                        <p className="text-[11px] font-medium text-slate-700 flex items-center justify-center gap-1.5 truncate pt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-[#B38728] shrink-0" />
                          <span className="truncate">{cm.company_name_thai}</span>
                        </p>
                      )}
                    </div>

                    <div className="w-full pt-2.5 mt-auto border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#1E2538]">
                      <span className="group-hover:text-[#B38728] transition-colors">ดูโปรไฟล์</span>
                      <button
                        onClick={(e) => toggleFollow(e, String(cm.id))}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                          isF
                            ? 'bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]'
                            : 'bg-slate-100 text-[#1E2538] hover:bg-[#1E2538] hover:text-white'
                        }`}
                      >
                        {isF ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            Follow
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Members List Header Row */}
      <div id="directory-results" className="scroll-mt-6 flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="text-sm font-bold text-[#1E2538] tabular-nums">
          สมาชิกทั้งหมด ({totalItems.toLocaleString()})
          {totalItems > 0 && (
            <span className="text-xs font-normal text-slate-400 ml-2">
              แสดง {startIndex + 1} - {endIndex}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() =>
              setSortOrder((prev) =>
                prev === 'default' ? 'asc' : prev === 'asc' ? 'desc' : 'default'
              )
            }
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#C59B38] text-[#B38728] text-xs font-bold flex items-center gap-1.5 transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>
              {sortOrder === 'asc'
                ? 'Sort: ก-ฮ'
                : sortOrder === 'desc'
                ? 'Sort: ฮ-ก'
                : 'Sort: Name'}
            </span>
          </button>

          <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-full">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition tabular-nums ${
                  pageSize === size
                    ? 'bg-[#1E2538] text-white'
                    : 'text-slate-500 hover:text-[#1E2538]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Members Grid */}
      {paginatedParticipants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <User className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">ไม่พบสมาชิกที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองกลุ่มอุตสาหกรรมและดาวใหม่อีกครั้ง
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {paginatedParticipants.map((member) => (
              <Link
                key={member.id}
                href={`/yfti_participants/${member.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)] hover:shadow-[0_14px_30px_rgba(15,23,42,0.11)] hover:-translate-y-0.5 hover:border-[#C59B38]/80 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                {/* Member Portrait */}
                <div className="relative aspect-[4/4.5] overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={member.profile_picture_url || 'https://yfticonnect.com/wp-content/uploads/2025/07/YFTI-11-Logo.webp'}
                    alt={member.name_thai}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + member.name_thai;
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#141A2C]/35 via-transparent to-transparent pointer-events-none" />
                  {member.star_group_label && (
                    <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2.5 py-0.5 bg-[#141A2C]/85 backdrop-blur-md border border-white/15 text-[#E5C158] text-[10px] font-bold rounded-lg shadow-sm">
                      {member.star_group_label}
                    </span>
                  )}
                </div>

                {/* Member Information */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <h3 className="font-bold text-xs sm:text-sm text-[#1E2538] group-hover:text-[#B38728] transition-colors leading-snug line-clamp-1 sm:line-clamp-none">
                        {member.name_thai}
                      </h3>
                      {member.nickname_eng && (
                        <span className="text-[10px] sm:text-xs font-semibold text-[#9A7320]">
                          ({member.nickname_eng})
                        </span>
                      )}
                    </div>

                    {member.company_name_thai && (
                      <p className="text-[11px] sm:text-xs font-medium text-slate-700 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-[#B38728] shrink-0" />
                        <span className="truncate">{member.company_name_thai}</span>
                      </p>
                    )}

                    {member.company_description && (
                      <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {stripHtml(member.company_description)}
                      </p>
                    )}
                  </div>

                  {/* Badges / Follow Row */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {member.industrial_groups_label && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate max-w-full">
                          {member.industrial_groups_label}
                        </span>
                      )}
                      {member.business_categories_label && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FBF6EC] text-[#9A7320] truncate max-w-full">
                          {member.business_categories_label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#1E2538]">
                      <span className="group-hover:text-[#B38728] transition-colors">ดูโปรไฟล์</span>
                      <button
                        onClick={(e) => toggleFollow(e, String(member.id))}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                          followingIds.includes(String(member.id))
                            ? 'bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]'
                            : 'bg-slate-100 text-[#1E2538] hover:bg-[#1E2538] hover:text-white'
                        }`}
                      >
                        {followingIds.includes(String(member.id)) ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            Follow
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls Bar */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-xs text-slate-500 font-medium tabular-nums">
                หน้า <strong className="text-[#1E2538] font-bold">{currentPage}</strong> จากทั้งหมด{' '}
                <strong className="text-[#1E2538] font-bold">{totalPages}</strong> หน้า
                <span className="text-slate-400 ml-1.5">({totalItems.toLocaleString()} รายการ)</span>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap justify-center">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  title="หน้าแรก"
                  className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="หน้าก่อนหน้า"
                  className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {paginationRange.map((page, idx) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1.5 sm:px-2 py-1 text-xs text-slate-400 font-bold">
                        ...
                      </span>
                    );
                  }
                  const pageNum = page as number;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => goToPage(pageNum)}
                      className={`min-w-[32px] h-8 sm:min-w-[36px] sm:h-9 px-2 rounded-xl text-xs font-bold transition tabular-nums shrink-0 ${
                        isActive
                          ? 'bg-[#1E2538] text-white shadow-sm'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="หน้าถัดไป"
                  className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="หน้าสุดท้าย"
                  className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* QR Scan Add Friend Modal */}
      {isScanModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setIsScanModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsScanModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1E2538]">สแกนบัตรเพื่อน</h3>
              <p className="text-xs text-slate-500">
                เล็ง QR บัตรสมาชิก / Digital ID ของเพื่อนให้อยู่ในกรอบ
              </p>
            </div>

            {scanMode === 'camera' ? (
              <div className="space-y-3">
                <div
                  id="directory-qr-reader"
                  className="w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 text-slate-800"
                />
                {scanError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{scanError}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setScanError(null);
                    setScanMode('manual');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#9A7320] hover:underline pt-1"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>กรอกรหัสสมาชิกแทน</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cleaned = scanInput.trim().replace(/^Y11-0*/i, '');
                  if (cleaned) {
                    setIsScanModalOpen(false);
                    router.push(`/yfti_participants/${cleaned}`);
                  }
                }}
                className="space-y-3 pt-1"
              >
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="เช่น Y11-3296 หรือ 3294"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#1E2538]"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] text-white text-xs font-bold transition"
                >
                  ค้นหาและเปิดโปรไฟล์เพื่อน
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('camera')}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1E2538]"
                >
                  <Camera className="w-3.5 h-3.5 text-[#B38728]" />
                  <span>เปิดกล้องสแกน QR แทน</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<DirectoryPageSkeleton />}>
      <DirectoryContent />
    </Suspense>
  );
}

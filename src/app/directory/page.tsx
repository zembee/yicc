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
  AlertTriangle,
  Phone,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal
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

const PLANET_META_MAP: Record<string, { img: string; color: string; label: string }> = {
  'the sun': { img: '/images/planets/the_sun.webp?v=2', color: '#F59E0B', label: 'The Sun' },
  the_sun: { img: '/images/planets/the_sun.webp?v=2', color: '#F59E0B', label: 'The Sun' },
  sun: { img: '/images/planets/the_sun.webp?v=2', color: '#F59E0B', label: 'The Sun' },
  mercury: { img: '/images/planets/mercury.webp?v=2', color: '#94A3B8', label: 'Mercury' },
  venus: { img: '/images/planets/venus.webp?v=2', color: '#EC4899', label: 'Venus' },
  earth: { img: '/images/planets/earth.webp?v=2', color: '#10B981', label: 'Earth' },
  mars: { img: '/images/planets/the_mars.webp?v=2', color: '#EF4444', label: 'Mars' },
  the_mars: { img: '/images/planets/the_mars.webp?v=2', color: '#EF4444', label: 'Mars' },
  'the mars': { img: '/images/planets/the_mars.webp?v=2', color: '#EF4444', label: 'Mars' },
  jupiter: { img: '/images/planets/jupiter.webp?v=2', color: '#F97316', label: 'Jupiter' },
  saturn: { img: '/images/planets/saturn.webp?v=2', color: '#EAB308', label: 'Saturn' },
  uranus: { img: '/images/planets/uranus.webp?v=2', color: '#06B6D4', label: 'Uranus' },
  neptune: { img: '/images/planets/neptune.webp?v=2', color: '#3B82F6', label: 'Neptune' },
};

function resolvePlanetMeta(starGroup?: string, starGroupLabel?: string) {
  const key = (starGroupLabel || starGroup || '').trim().toLowerCase();
  return PLANET_META_MAP[key] || null;
}

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
    <div className="w-full bg-[#F6F4EF] pb-4">
      {/* 1. Obsidian Luxury Header with Floating Search & Industry Pills (Sticky behind scrolling sheet) */}
      <section className="sticky top-0 md:top-24 z-10 luxury-stage text-white pt-4 pb-12 px-4 sm:px-6 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(90% 80% at 85% 0%, rgba(197,155,56,0.16) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">
                ทำเนียบธุรกิจ <span className="font-light text-white/80 text-base sm:text-lg">Directory</span>
              </h1>
              <p className="text-[11px] text-slate-300 mt-0.5 tabular-nums">
                สมาชิกและเครือข่ายธุรกิจทั้งหมด {participants.length.toLocaleString()} ท่าน
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                aria-label="ตัวกรองเพิ่มเติม"
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  showAdvancedFilters || selectedHouse !== 'ALL' || selectedCategory !== 'ALL' || selectedCohort !== 'ALL'
                    ? 'bg-[#C59B38]/25 border-[#E5C158] text-[#E5C158]'
                    : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/15'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">ตัวกรอง</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScanMode('camera');
                  setScanError(null);
                  setIsScanModalOpen(true);
                }}
                aria-label="สแกนเพิ่มเพื่อน"
                title="สแกนเพิ่มเพื่อน"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center shrink-0 transition"
              >
                <QrCode className="w-4 h-4 text-[#E5C158]" />
              </button>
            </div>
          </div>

          {/* Floating Crisp White Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อสมาชิก, ชื่อเล่น, บริษัท หรือประเภทธุรกิจ..."
              className="w-full pl-10 pr-9 py-2.5 bg-white text-[#1E2538] rounded-2xl text-xs sm:text-sm font-medium placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#C59B38] shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Industry Filter Pills inside Navy Header */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {INDUSTRY_GROUPS.map((ig) => {
              const isActive = selectedIndustry === ig.value;
              const shortLabel =
                ig.value === 'ALL'
                  ? 'ทั้งหมด'
                  : ig.label
                      .replace('กลุ่มอุตสาหกรรม (ทั้งหมด)', 'ทั้งหมด')
                      .replace('เกษตรและอุตสาหกรรมอาหาร', 'เกษตร / อาหาร')
                      .replace('ธุรกิจการเงิน และการลงทุน', 'การเงิน / ลงทุน')
                      .replace('อสังหาริมทรัพย์และก่อสร้าง', 'ก่อสร้าง / อสังหาฯ')
                      .replace('สินค้าอุตสาหกรรม', 'อุตสาหกรรม')
                      .replace('สินค้าอุปโภคบริโภค', 'อุปโภคบริโภค');
              return (
                <button
                  key={ig.value}
                  type="button"
                  onClick={() => setSelectedIndustry(ig.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition shrink-0 ${
                    isActive
                      ? 'bg-[#C59B38]/25 border-[#E5C158] text-[#E5C158] shadow-sm'
                      : 'bg-white/8 border-white/12 text-slate-300 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Overlapping Rounded Warm Ivory Sheet */}
      <div className="relative z-20 -mt-6 luxury-sheet rounded-t-[30px] pt-5 px-4 sm:px-6 min-h-[65vh]">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Expandable Advanced Filter Bar (House / Business Category / Cohort) */}
          {(showAdvancedFilters || selectedHouse !== 'ALL' || selectedCategory !== 'ALL' || selectedCohort !== 'ALL') && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                  type="button"
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
          )}

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

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar -mr-4 pr-4 sm:mr-0 sm:pr-0">
            {committeeMembers.map((cm) => {
              const isF = followingIds.includes(String(cm.id));
              return (
                <Link
                  key={cm.id}
                  href={`/yfti_participants/${cm.id}`}
                  className="relative w-[166px] sm:w-[180px] h-[224px] snap-start rounded-[22px] overflow-hidden bg-[#0B101D] shadow-[0_8px_22px_rgba(13,19,33,0.12)] hover:-translate-y-0.5 transition-all duration-300 shrink-0 group block"
                >
                  <img
                    src={cm.profile_picture_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp'}
                    alt={cm.name_thai}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp';
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(9,13,24,0.28) 0%, rgba(9,13,24,0.12) 38%, rgba(9,13,24,0.94) 100%)',
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 z-20 rounded-[22px] pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(223,194,125,0.26)' }}
                  />

                  <div className="relative z-10 h-full p-3 flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#090D18]/80 backdrop-blur-md text-[#ECD28E] text-[9px] font-bold truncate">
                        {cm.cohortRole}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleFollow(e, String(cm.id))}
                        aria-label={isF ? 'เลิกติดตาม' : 'บันทึกสมาชิก'}
                        className={`p-1 rounded-full backdrop-blur-md transition shrink-0 ${
                          isF ? 'bg-[#C5A059] text-white' : 'bg-[#090D18]/60 text-white/80 hover:bg-[#090D18]/90'
                        }`}
                      >
                        {isF ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-white truncate">
                        {cm.name_thai}
                      </p>
                      {cm.company_name_thai && (
                        <p className="text-[10px] font-medium text-[#ECD28E] flex items-center gap-1 truncate">
                          <Building2 className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{cm.company_name_thai}</span>
                        </p>
                      )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {paginatedParticipants.map((member) => {
              const isFollowed = followingIds.includes(String(member.id));
              const phoneDigits = member.tel_number?.replace(/[^\d+]/g, '');
              const lineHandle = member.line_id?.trim().replace(/^@/, '');
              const planetMeta = resolvePlanetMeta(member.star_group, member.star_group_label);
              const houseDisplayLabel = member.star_group_label || planetMeta?.label;
              const houseAccent = planetMeta?.color || '#DFC27D';
              return (
                <div
                  key={member.id}
                  className="relative h-[170px] sm:h-[180px] rounded-[20px] overflow-hidden text-white shadow-[0_10px_26px_rgba(9,13,24,0.16)] hover:-translate-y-0.5 transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, #090D18 0%, #101728 55%, #0B111E 100%)',
                  }}
                >
                  {/* Planet House Signature Ambient Aura + Faint 3D Planet Backdrop Watermark */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(60% 95% at 14% 55%, ${houseAccent}24 0%, transparent 70%)`,
                    }}
                  />
                  {planetMeta && (
                    <img
                      src={planetMeta.img}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="absolute -left-5 -bottom-6 w-36 h-36 sm:w-40 sm:h-40 object-contain opacity-[0.18] pointer-events-none select-none transition-transform duration-700 group-hover:scale-105 group-hover:rotate-6"
                    />
                  )}

                  {/* Large Portrait (right ~56%) fading into the card — same gimmick as the Home member card */}
                  <Link
                    href={`/yfti_participants/${member.id}`}
                    aria-label={member.name_thai}
                    className="absolute inset-y-0 right-0 w-[56%] overflow-hidden block"
                    style={{
                      WebkitMaskImage:
                        'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.28) 22%, rgba(0,0,0,0.88) 52%, black 75%)',
                      maskImage:
                        'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.28) 22%, rgba(0,0,0,0.88) 52%, black 75%)',
                    }}
                  >
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
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(9,13,24,0.15) 0%, transparent 32%, rgba(9,13,24,0.84) 100%)',
                      }}
                    />
                  </Link>

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 z-20 rounded-[20px] pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(223,194,125,0.25)' }}
                  />

                  <div className="relative z-10 h-full px-4 py-3 sm:px-4.5 sm:py-3.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      {houseDisplayLabel ? (
                        <span
                          className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full bg-[#090D18]/75 backdrop-blur-md text-[10px] font-extrabold tracking-wide shadow-sm"
                          style={{
                            color: '#F5E6BE',
                            boxShadow: `inset 0 0 0 1px ${houseAccent}55`,
                          }}
                        >
                          {planetMeta ? (
                            <img
                              src={planetMeta.img}
                              alt={houseDisplayLabel}
                              className="w-4 h-4 object-contain shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                            />
                          ) : (
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: houseAccent }}
                            />
                          )}
                          <span>{houseDisplayLabel}</span>
                        </span>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={(e) => toggleFollow(e, String(member.id))}
                        aria-label={isFollowed ? 'เลิกติดตาม' : 'บันทึกสมาชิก'}
                        className={`p-1.5 rounded-full backdrop-blur-md transition shrink-0 ${
                          isFollowed
                            ? 'bg-[#C5A059] text-white'
                            : 'bg-[#090D18]/70 text-white/80 hover:bg-[#090D18]/90 hover:text-[#ECD28E]'
                        }`}
                      >
                        {isFollowed ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <Link
                      href={`/yfti_participants/${member.id}`}
                      className="block max-w-[58%] space-y-0.5 my-auto"
                    >
                      <h3 className="font-extrabold text-[13px] sm:text-[15px] text-white group-hover:text-[#ECD28E] transition-colors leading-snug truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                        {member.name_thai}
                        {member.nickname_eng && (
                          <span className="text-[11px] font-medium text-slate-300 ml-1">({member.nickname_eng})</span>
                        )}
                      </h3>
                      {member.company_name_thai && (
                        <p className="text-[11px] font-semibold text-[#ECD28E] flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{member.company_name_thai}</span>
                        </p>
                      )}
                      {member.industrial_groups_label && (
                        <p className="text-[10px] text-slate-300/90 truncate">
                          {member.industrial_groups_label}
                        </p>
                      )}
                    </Link>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/[0.08]">
                      {phoneDigits ? (
                        <a
                          href={`tel:${phoneDigits}`}
                          className="py-1 px-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition"
                        >
                          <Phone className="w-2.5 h-2.5 text-[#ECD28E]" />
                          <span>โทร</span>
                        </a>
                      ) : (
                        <span className="py-1 px-2 rounded-full bg-white/[0.04] text-white/30 text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1 cursor-not-allowed">
                          <Phone className="w-2.5 h-2.5" />
                          <span>โทร</span>
                        </span>
                      )}
                      {lineHandle ? (
                        <a
                          href={`https://line.me/ti/p/~${encodeURIComponent(lineHandle)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1 px-2 rounded-full bg-white/10 hover:bg-[#06C755] text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition"
                        >
                          <MessageCircle className="w-2.5 h-2.5 text-[#ECD28E]" />
                          <span>LINE</span>
                        </a>
                      ) : (
                        <span className="py-1 px-2 rounded-full bg-white/[0.04] text-white/30 text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1 cursor-not-allowed">
                          <MessageCircle className="w-2.5 h-2.5" />
                          <span>LINE</span>
                        </span>
                      )}
                      <Link
                        href={`/yfti_participants/${member.id}`}
                        className="py-1 px-2 rounded-full luxury-gold-btn text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition"
                      >
                        <User className="w-2.5 h-2.5" />
                        <span>โปรไฟล์</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls Bar */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl shadow-[0_6px_20px_rgba(13,19,33,0.05)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
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
        </div>
      </div>

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

'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { yftiParticipants } from '@/lib/mockData';
import { getParticipants } from '@/lib/dataService';
import { Participant } from '@/types';
import Link from 'next/link';
import { 
  Search, 
  Phone, 
  Building2, 
  Briefcase, 
  MapPin, 
  X, 
  ChevronRight, 
  Filter, 
  User, 
  Share2, 
  Globe, 
  Database,
  ArrowRight
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const HOUSES_LIST = [
  { value: 'ALL', label: 'ดาว (ทั้งหมด)' },
  { value: 'the_sun', label: 'The Sun' },
  { value: 'earth', label: 'Earth' },
  { value: 'jupiter', label: 'Jupiter' },
  { value: 'the_mars', label: 'Mars' },
  { value: 'mercury', label: 'Mercury' },
  { value: 'neptune', label: 'Neptune' },
  { value: 'saturn', label: 'Saturn' },
  { value: 'uranus', label: 'Uranus' },
  { value: 'venus', label: 'Venus' },
];

const INDUSTRY_GROUPS = [
  { value: 'ALL', label: 'กลุ่มอุตสาหกรรม (ทั้งหมด)' },
  { value: 'agri', label: 'เกษตรและอุตสาหกรรมอาหาร' },
  { value: 'resources', label: 'ทรัพยากร' },
  { value: 'tech', label: 'เทคโนโลยี' },
  { value: 'finance', label: 'ธุรกิจการเงิน และการลงทุน' },
  { value: 'service', label: 'บริการ' },
  { value: 'industrial', label: 'สินค้าอุตสาหกรรม' },
  { value: 'consumer', label: 'สินค้าอุปโภคบริโภค' },
  { value: 'real_estate', label: 'อสังหาริมทรัพย์และก่อสร้าง' },
];

const BUSINESS_CATEGORIES = [
  { value: 'ALL', label: 'หมวดธุรกิจ (ทั้งหมด)' },
  { value: 'Software ICT', label: 'Software ICT' },
  { value: 'การท่องเที่ยวและสันทนาการ', label: 'การท่องเที่ยวและสันทนาการ' },
  { value: 'การพิมพ์ และบรรจุภัณฑ์', label: 'การพิมพ์ และบรรจุภัณฑ์' },
  { value: 'การแพทย์', label: 'การแพทย์' },
  { value: 'ขนส่งและโลจิสติกส์', label: 'ขนส่งและโลจิสติกส์' },
  { value: 'ของใช้ในครัวเรือนและสำนักงาน', label: 'ของใช้ในครัวเรือนและสำนักงาน' },
  { value: 'เครื่องสำอาง ยา และเครื่องมือแพทย์', label: 'เครื่องสำอาง ยา และเครื่องมือแพทย์' },
  { value: 'ชิ้นส่วนอิเล็กทรอนิกส์', label: 'ชิ้นส่วนอิเล็กทรอนิกส์' },
  { value: 'ธุรกิจการเกษตร', label: 'ธุรกิจการเกษตร' },
  { value: 'ธุรกิจการเงิน และการลงทุน', label: 'ธุรกิจการเงิน และการลงทุน' },
  { value: 'บริการเฉพาะกิจ', label: 'บริการเฉพาะกิจ' },
  { value: 'บริการรับเหมาก่อสร้าง', label: 'บริการรับเหมาก่อสร้าง' },
  { value: 'ปิโตรเคมีและเคมีภัณฑ์', label: 'ปิโตรเคมีและเคมีภัณฑ์' },
  { value: 'พลังงานและสาธารณูปโภค', label: 'พลังงานและสาธารณูปโภค' },
  { value: 'พัฒนาอสังหาริมทรัพย์', label: 'พัฒนาอสังหาริมทรัพย์' },
  { value: 'พาณิชย์', label: 'พาณิชย์' },
  { value: 'แฟชั่น', label: 'แฟชั่น eg. เครื่องนุ่งห่ม รองเท้า' },
  { value: 'ยานยนต์', label: 'ยานยนต์ รวมถึง ชิ้นส่วนและอะไหล่' },
  { value: 'วัสดุก่อสร้าง', label: 'วัสดุก่อสร้าง' },
  { value: 'อาหารและเครื่องดื่ม', label: 'อาหารและเครื่องดื่ม' },
  { value: 'อื่นๆ', label: 'อื่นๆ' },
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

function DirectoryContent() {
  const searchParams = useSearchParams();
  const [participants, setParticipants] = useState<Participant[]>(yftiParticipants);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCohort, setSelectedCohort] = useState('ALL');

  // Load from Supabase DB on mount
  useEffect(() => {
    async function loadData() {
      const data = await getParticipants();
      setParticipants(data);
    }
    loadData();
  }, []);

  useEffect(() => {
    const indParam = searchParams?.get('industry');
    if (indParam) {
      setSearchQuery(indParam);
    }
  }, [searchParams]);

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name_thai.toLowerCase().includes(q) ||
        (p.nickname_eng && p.nickname_eng.toLowerCase().includes(q)) ||
        (p.fullname_eng && p.fullname_eng.toLowerCase().includes(q)) ||
        (p.company_name_thai && p.company_name_thai.toLowerCase().includes(q)) ||
        (p.company_name_eng && p.company_name_eng.toLowerCase().includes(q)) ||
        (p.industrial_groups_label && p.industrial_groups_label.toLowerCase().includes(q)) ||
        (p.business_categories_label && p.business_categories_label.toLowerCase().includes(q));

      const matchesHouse =
        selectedHouse === 'ALL' ||
        (p.star_group && p.star_group.toLowerCase() === selectedHouse.toLowerCase()) ||
        (p.star_group_label && p.star_group_label.toLowerCase().includes(selectedHouse.toLowerCase()));

      const matchesIndustry =
        selectedIndustry === 'ALL' ||
        (p.industrial_groups && p.industrial_groups.toLowerCase().includes(selectedIndustry.toLowerCase())) ||
        (p.industrial_groups_label && p.industrial_groups_label.toLowerCase().includes(selectedIndustry.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'ALL' ||
        (p.business_categories && p.business_categories.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (p.business_categories_label && p.business_categories_label.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchesCohort =
        selectedCohort === 'ALL' ||
        (p.gen && p.gen.toLowerCase() === selectedCohort.toLowerCase()) ||
        (p.gen_label && p.gen_label.toLowerCase().includes(selectedCohort.toLowerCase()));

      return matchesSearch && matchesHouse && matchesIndustry && matchesCategory && matchesCohort;
    });
  }, [participants, searchQuery, selectedHouse, selectedIndustry, selectedCategory, selectedCohort]);

  const stripHtml = (html?: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').replace(/&[a-z]+;/gi, ' ').trim();
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-12">
      {/* 1. Header Title */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-1">
          <Database className="w-3.5 h-3.5" />
          <span>เชื่อมต่อฐานข้อมูล Supabase ({participants.length} ท่าน)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E2538] tracking-tight">
          ธุรกิจภายในโครงการเรา
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          ทำเนียบสมาชิกและธุรกิจในเครือข่าย Young FTI ELITE 11 ทั้ง 122 ท่าน (คลิกเพื่อดูหน้าประวัติเต็ม)
        </p>
      </div>

      {/* 2. 4-Filter Dropdown Bar matching yfticonnect.com */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-card space-y-4">
        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter 1: ดาว (House) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ดาว</label>
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
            >
              {HOUSES_LIST.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: กลุ่มอุตสาหกรรม */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">กลุ่มอุตสาหกรรม</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
            >
              {INDUSTRY_GROUPS.map((ig) => (
                <option key={ig.value} value={ig.value}>
                  {ig.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: หมวดธุรกิจ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">หมวดธุรกิจ</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition truncate"
            >
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: รุ่น */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">รุ่น</label>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
            >
              {COHORT_LIST.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input Box & Submit Button */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาบริษัท หรือชื่อผู้เข้าร่วม..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => {}}
            className="py-3 px-8 bg-[#1E2538] hover:bg-[#2B3550] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>ค้นหา</span>
          </button>
        </div>

        {/* Active Filters count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>พบสมาชิกทั้งหมด <strong className="text-[#1E2538]">{filteredParticipants.length}</strong> ท่าน</span>
          {(selectedHouse !== 'ALL' || selectedIndustry !== 'ALL' || selectedCategory !== 'ALL' || selectedCohort !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedHouse('ALL');
                setSelectedIndustry('ALL');
                setSelectedCategory('ALL');
                setSelectedCohort('ALL');
              }}
              className="text-[#FB7170] hover:underline font-bold text-xs"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* 3. 122 Members Grid (Navigates to dedicated page when clicked) */}
      {filteredParticipants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <User className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">ไม่พบสมาชิกที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองกลุ่มอุตสาหกรรมและดาวใหม่อีกครั้ง
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredParticipants.map((member) => (
            <Link
              key={member.id}
              href={`/yfti_participants/${member.id}`}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
            >
              {/* Member Portrait */}
              <div className="relative aspect-[4/4.5] overflow-hidden bg-slate-100">
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
                {member.star_group_label && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#1E2538]/85 backdrop-blur-sm text-white text-[10px] font-bold rounded-full border border-white/20">
                    {member.star_group_label}
                  </span>
                )}
              </div>

              {/* Member Information */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1E2538] group-hover:text-[#FB7170] transition-colors">
                      {member.name_thai}
                    </h3>
                    {member.nickname_eng && (
                      <span className="text-xs font-bold text-[#FB7170]">({member.nickname_eng})</span>
                    )}
                  </div>

                  {member.company_name_thai && (
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-[#FB7170] shrink-0" />
                      <span className="truncate">{member.company_name_thai}</span>
                    </p>
                  )}

                  {member.company_description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-1">
                      {stripHtml(member.company_description)}
                    </p>
                  )}
                </div>

                {/* Badges / Tags */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {member.industrial_groups_label && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate max-w-full">
                        {member.industrial_groups_label}
                      </span>
                    )}
                    {member.business_categories_label && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-[#FB7170] truncate max-w-full">
                        {member.business_categories_label}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#1E2538] group-hover:text-[#FB7170] pt-1">
                    <span>ดูโปรไฟล์เต็ม</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-9 h-9 border-3 border-[#1E2538] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">กำลังโหลดทำเนียบสมาชิกจาก Database...</p>
      </div>
    }>
      <DirectoryContent />
    </Suspense>
  );
}

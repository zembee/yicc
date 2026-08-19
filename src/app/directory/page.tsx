'use client';

import React, { useState } from 'react';
import { mockDirectory, mockHouses } from '@/lib/mockData';
import { UserProfile } from '@/types';
import { 
  Search, 
  Phone, 
  MessageCircle, 
  Linkedin, 
  Building2, 
  Briefcase, 
  X, 
  Shield,
  Layers,
  ChevronDown
} from 'lucide-react';

const INDUSTRY_CATEGORIES = [
  { id: 'ALL', nameTh: 'ทั้งหมด', nameEn: 'All Industries', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80' },
  { id: 'Technology', nameTh: 'เทคโนโลยี', nameEn: 'Technology', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80' },
  { id: 'Service', nameTh: 'บริการ', nameEn: 'Service', img: 'https://images.unsplash.com/photo-1556742049-0a67e55722c3?w=400&auto=format&fit=crop&q=80' },
  { id: 'Consumer Products', nameTh: 'สินค้าอุปโภคบริโภค', nameEn: 'Consumer Products', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80' },
  { id: 'Industrial Goods', nameTh: 'สินค้าอุตสาหกรรม', nameEn: 'Industrial Goods', img: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=80' },
  { id: 'Agriculture', nameTh: 'การเกษตร / อาหาร', nameEn: 'Agriculture / Food', img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80' },
  { id: 'Real Estate', nameTh: 'การก่อสร้าง', nameEn: 'Real Estate / Construction', img: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=400&auto=format&fit=crop&q=80' },
  { id: 'Resources', nameTh: 'ทรัพยากร', nameEn: 'Resources', img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&auto=format&fit=crop&q=80' },
  { id: 'Finance', nameTh: 'ธุรกิจการเงิน / ลงทุน', nameEn: 'Financials / Investment', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80' },
];

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [showCategoryGrid, setShowCategoryGrid] = useState(true);

  const filteredMembers = mockDirectory.filter((member) => {
    const matchesSearch =
      member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.company_name && member.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.position && member.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.industry && member.industry.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHouse = selectedHouse === 'ALL' || member.house_id === selectedHouse;

    const matchesCategory =
      selectedCategory === 'ALL' ||
      (member.industry && member.industry.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'Finance' && member.industry?.toLowerCase().includes('finance')) ||
      (selectedCategory === 'Real Estate' && member.industry?.toLowerCase().includes('real estate')) ||
      (selectedCategory === 'Technology' && member.industry?.toLowerCase().includes('tech')) ||
      (selectedCategory === 'Agriculture' && member.industry?.toLowerCase().includes('food')) ||
      (selectedCategory === 'Industrial Goods' && (member.industry?.toLowerCase().includes('industrial') || member.industry?.toLowerCase().includes('logistics')));

    return matchesSearch && matchesHouse && matchesCategory;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Signature Young FTI Diagonal Section Banner (Matching image.png: 'ธุรกิจที่เกี่ยวข้อง') */}
      <div className="flex items-center justify-between">
        <div className="inline-block bg-[#181B34] text-white px-4 py-1.5 clip-diagonal-tag pr-7 shadow-sm">
          <span className="text-xs font-bold tracking-wide">ธุรกิจที่เกี่ยวข้อง & ทำเนียบรุ่น</span>
        </div>
        <button
          onClick={() => setShowCategoryGrid(!showCategoryGrid)}
          className="text-[11px] text-slate-500 hover:text-[#181B34] font-semibold flex items-center gap-1"
        >
          <Layers className="w-3.5 h-3.5 text-[#FB7170]" />
          <span>{showCategoryGrid ? 'ซ่อนหมวดหมู่' : 'แสดง 8 หมวดธุรกิจ'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCategoryGrid ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 2. 8 Industry Category Grid (Direct representation from image.png) */}
      {showCategoryGrid && (
        <div className="grid grid-cols-2 gap-2 transition-all">
          {INDUSTRY_CATEGORIES.slice(1).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
                className={`relative h-20 rounded-xl overflow-hidden text-left p-2.5 flex flex-col justify-end transition-all border ${
                  isSelected
                    ? 'border-[#FB7170] ring-2 ring-[#FB7170] scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img
                  src={cat.img}
                  alt={cat.nameTh}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-black/30" />
                <div className="relative z-10">
                  <p className="text-xs font-bold text-white leading-tight">{cat.nameTh}</p>
                  <p className="text-[9px] text-[#DBDFFF]/90 font-medium truncate mt-0.5">{cat.nameEn}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อ, บริษัท, ตำแหน่ง, หรืออุตสาหกรรม..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#181B34] shadow-sm transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. House & Category Active Indicator Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            setSelectedHouse('ALL');
            setSelectedCategory('ALL');
          }}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            selectedHouse === 'ALL' && selectedCategory === 'ALL'
              ? 'bg-[#181B34] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-[#181B34]'
          }`}
        >
          ทั้งหมด
        </button>
        {mockHouses.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHouse(selectedHouse === h.id ? 'ALL' : h.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedHouse === h.id
                ? 'bg-[#181B34] text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: h.color_hex }}
            />
            {h.name.split(' ')[1] || h.name}
          </button>
        ))}
      </div>

      {/* Active Category Chip */}
      {selectedCategory !== 'ALL' && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500">หมวดหมู่:</span>
          <span className="inline-flex items-center gap-1 bg-slate-100 text-[#181B34] font-bold px-2 py-0.5 rounded text-[11px] border border-slate-200">
            {INDUSTRY_CATEGORIES.find((c) => c.id === selectedCategory)?.nameTh}
            <button onClick={() => setSelectedCategory('ALL')} className="hover:text-rose-600">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {/* 5. Member Cards List */}
      <div className="space-y-2.5 pt-1">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-slate-300 transition cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {member.picture_url ? (
                  <img
                    src={member.picture_url}
                    alt={member.display_name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[#181B34]">
                    {member.display_name.charAt(0)}
                  </div>
                )}
                {member.role !== 'MEMBER' && (
                  <span className="absolute -bottom-1 -right-1 p-0.5 bg-[#181B34] rounded text-[8px] text-white">
                    <Shield className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[#181B34] truncate">
                  {member.display_name}
                </h3>
                <p className="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                  {member.position}
                </p>
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-300 shrink-0" />
                  {member.company_name}
                </p>
              </div>
            </div>

            {/* House Badge */}
            {member.house && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded shrink-0 border"
                style={{
                  color: member.house.color_hex,
                  backgroundColor: `${member.house.color_hex}10`,
                  borderColor: `${member.house.color_hex}30`,
                }}
              >
                {member.house.name.split(' ')[1] || 'House'}
              </span>
            )}
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">ไม่พบข้อมูลสมาชิกในหมวดหมู่นี้</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedHouse('ALL');
                setSelectedCategory('ALL');
              }}
              className="mt-2 text-xs text-[#FB7170] font-bold underline"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* 6. Direct Contact Executive Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-5 relative shadow-xl flex flex-col items-center text-center">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Avatar */}
            {selectedMember.picture_url && (
              <img
                src={selectedMember.picture_url}
                alt={selectedMember.display_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-md mb-2.5"
              />
            )}

            <h3 className="text-sm font-bold text-[#181B34]">{selectedMember.display_name}</h3>
            <p className="text-xs text-[#FB7170] font-semibold mt-0.5">{selectedMember.position}</p>
            <p className="text-xs text-slate-500">{selectedMember.company_name}</p>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 mb-4">
              <span className="text-[10px] bg-slate-100 text-[#181B34] font-semibold px-2 py-0.5 rounded">
                {selectedMember.industry}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded border border-slate-200">
                {selectedMember.cohort_batch}
              </span>
            </div>

            {/* Direct Connect Buttons */}
            <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-slate-100">
              <a
                href={selectedMember.phone_number ? `tel:${selectedMember.phone_number}` : '#'}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#181B34] font-bold text-xs border border-slate-200 transition"
              >
                <Phone className="w-4 h-4 mb-1 text-[#181B34]" />
                <span>โทรออก</span>
              </a>

              <a
                href={`https://line.me/R/ti/p/${selectedMember.line_user_id}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#06c755] font-bold text-xs border border-slate-200 transition"
              >
                <MessageCircle className="w-4 h-4 mb-1 text-[#06c755]" />
                <span>LINE</span>
              </a>

              <a
                href={selectedMember.linkedin_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0077b5] font-bold text-xs border border-slate-200 transition"
              >
                <Linkedin className="w-4 h-4 mb-1 text-[#0077b5]" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


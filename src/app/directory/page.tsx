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
  Shield 
} from 'lucide-react';

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);

  const filteredMembers = mockDirectory.filter((member) => {
    const matchesSearch =
      member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.company_name && member.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.position && member.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.industry && member.industry.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHouse = selectedHouse === 'ALL' || member.house_id === selectedHouse;

    return matchesSearch && matchesHouse;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold text-[#212542]">Executive Directory</h2>
        <p className="text-xs text-[#6B7280]">ค้นหาทำเนียบสมาชิก แลกเปลี่ยนคอนเนกชันและธุรกิจ</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อ, ตำแหน่ง, บริษัท, หรืออุตสาหกรรม..."
          className="w-full bg-white border border-[#EEEEEE] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#292929] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#212542] transition shadow-[0_2px_8px_rgba(33,37,66,0.02)]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#212542]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* House Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedHouse('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            selectedHouse === 'ALL'
              ? 'bg-[#212542] text-white'
              : 'bg-white text-[#6B7280] border border-[#EEEEEE]'
          }`}
        >
          ทุกบ้าน
        </button>
        {mockHouses.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHouse(h.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedHouse === h.id
                ? 'bg-[#DBDFFF] text-[#212542] border border-[#c2c9ff]'
                : 'bg-white text-[#6B7280] border border-[#EEEEEE]'
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

      {/* Member Cards */}
      <div className="space-y-3 pt-1">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="bg-white border border-[#EEEEEE] rounded-3xl p-4 shadow-[0_4px_20px_rgba(33,37,66,0.04)] hover:shadow-[0_8px_25px_rgba(33,37,66,0.08)] transition cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {member.picture_url ? (
                  <img
                    src={member.picture_url}
                    alt={member.display_name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-[#EEEEEE] shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#DBDFFF] flex items-center justify-center font-bold text-[#212542]">
                    {member.display_name.charAt(0)}
                  </div>
                )}
                {member.role !== 'MEMBER' && (
                  <span className="absolute -bottom-1 -right-1 p-0.5 bg-[#212542] rounded-md text-[8px] text-white">
                    <Shield className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#212542] truncate">
                  {member.display_name}
                </h4>
                <p className="text-[11px] text-[#6B7280] truncate flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                  {member.position}
                </p>
                <p className="text-[10px] text-[#9CA3AF] truncate flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#CBD5E1] shrink-0" />
                  {member.company_name}
                </p>
              </div>
            </div>

            {/* House Badge */}
            {member.house && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-lg shrink-0 border"
                style={{
                  color: member.house.color_hex,
                  backgroundColor: `${member.house.color_hex}15`,
                  borderColor: `${member.house.color_hex}30`,
                }}
              >
                {member.house.name.split(' ')[1] || 'House'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Direct Contact Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#212542]/60 backdrop-blur-md">
          <div className="bg-white border border-[#EEEEEE] w-full max-w-sm rounded-3xl p-6 relative shadow-2xl flex flex-col items-center text-center">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#6B7280] hover:text-[#212542] bg-[#F8F9FC]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Member Profile Avatar */}
            {selectedMember.picture_url && (
              <img
                src={selectedMember.picture_url}
                alt={selectedMember.display_name}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-[#212542] shadow-xl mb-3"
              />
            )}

            <h3 className="text-base font-extrabold text-[#212542]">{selectedMember.display_name}</h3>
            <p className="text-xs text-[#FB7170] font-bold mt-0.5">{selectedMember.position}</p>
            <p className="text-xs text-[#6B7280]">{selectedMember.company_name}</p>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 mb-5">
              <span className="text-[10px] bg-[#DBDFFF] text-[#212542] font-semibold px-2.5 py-0.5 rounded-full">
                {selectedMember.industry}
              </span>
              <span className="text-[10px] bg-[#F8F9FC] text-[#6B7280] font-medium px-2.5 py-0.5 rounded-full border border-[#EEEEEE]">
                {selectedMember.cohort_batch}
              </span>
            </div>

            {/* Direct Connect Action Buttons */}
            <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-[#EEEEEE]">
              {/* Call */}
              <a
                href={selectedMember.phone_number ? `tel:${selectedMember.phone_number}` : '#'}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8F9FC] hover:bg-[#EEEEEE] text-[#212542] font-bold text-xs border border-[#EEEEEE] transition"
              >
                <Phone className="w-5 h-5 mb-1 text-[#212542]" />
                <span>โทรออก</span>
              </a>

              {/* LINE Chat */}
              <a
                href={`https://line.me/R/ti/p/${selectedMember.line_user_id}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8F9FC] hover:bg-[#EEEEEE] text-[#06c755] font-bold text-xs border border-[#EEEEEE] transition"
              >
                <MessageCircle className="w-5 h-5 mb-1 text-[#06c755]" />
                <span>LINE</span>
              </a>

              {/* LinkedIn */}
              <a
                href={selectedMember.linkedin_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8F9FC] hover:bg-[#EEEEEE] text-[#0077b5] font-bold text-xs border border-[#EEEEEE] transition"
              >
                <Linkedin className="w-5 h-5 mb-1 text-[#0077b5]" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

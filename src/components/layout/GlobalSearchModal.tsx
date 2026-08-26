'use client';

import React, { useState, useMemo } from 'react';
import { yftiParticipants, mockEvents } from '@/lib/mockData';
import { Participant, EventItem } from '@/types';
import { Search, X, Building2, User, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectParticipant?: (p: Participant) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onSelectParticipant }) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return { members: [], events: [] };
    const q = query.toLowerCase().trim();

    const members = yftiParticipants.filter(p => 
      p.name_thai.toLowerCase().includes(q) ||
      (p.nickname_eng && p.nickname_eng.toLowerCase().includes(q)) ||
      (p.fullname_eng && p.fullname_eng.toLowerCase().includes(q)) ||
      (p.company_name_thai && p.company_name_thai.toLowerCase().includes(q)) ||
      (p.company_name_eng && p.company_name_eng.toLowerCase().includes(q)) ||
      (p.industrial_groups_label && p.industrial_groups_label.toLowerCase().includes(q)) ||
      (p.star_group_label && p.star_group_label.toLowerCase().includes(q))
    );

    const events = mockEvents.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location_name.toLowerCase().includes(q)
    );

    return { members: members.slice(0, 10), events: events.slice(0, 5) };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อสมาชิก, บริษัท, กลุ่มอุตสาหกรรม, หรือกิจกรรม..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 font-medium"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!query.trim() ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">ค้นหาข้อมูลในระบบ YFTI Connect</p>
              <p className="text-xs text-slate-400 mt-1">พิมพ์ชื่อผู้เข้าร่วม, ชื่อบริษัท, กลุ่มอุตสาหกรรม หรือกิจกรรมที่ต้องการ</p>
            </div>
          ) : searchResults.members.length === 0 && searchResults.events.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              <p className="font-semibold text-slate-600">ไม่พบผลการค้นหาสำหรับ &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">ลองใช้คำค้นหาอื่น เช่น ชื่อเล่น, ชื่อบริษัท หรือประเภทธุรกิจ</p>
            </div>
          ) : (
            <>
              {/* Members Section */}
              {searchResults.members.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FB7170]" />
                    สมาชิก & ธุรกิจ ({searchResults.members.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.members.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          if (onSelectParticipant) {
                            onSelectParticipant(m);
                          }
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer transition border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={m.profile_picture_url || 'https://yfticonnect.com/wp-content/uploads/2025/07/YFTI-11-Logo.webp'}
                            alt={m.name_thai}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + m.name_thai;
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#1E2538]">{m.name_thai}</span>
                              {m.nickname_eng && (
                                <span className="text-xs font-semibold text-[#FB7170]">({m.nickname_eng})</span>
                              )}
                              {m.star_group_label && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                                  {m.star_group_label}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              {m.company_name_thai && (
                                <span className="flex items-center gap-1 truncate max-w-[200px]">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  {m.company_name_thai}
                                </span>
                              )}
                              {m.industrial_groups_label && (
                                <span className="text-[11px] text-slate-400">· {m.industrial_groups_label}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events Section */}
              {searchResults.events.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FB7170]" />
                    กิจกรรม ({searchResults.events.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.events.map((e) => (
                      <Link
                        key={e.id}
                        href="/events"
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer transition border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <p className="font-bold text-sm text-[#1E2538]">{e.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>📍 {e.location_name}</span>
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

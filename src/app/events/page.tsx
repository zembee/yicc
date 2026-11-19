'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mockEvents } from '@/lib/mockData';
import { EventItem } from '@/types';
import { EventCardWithQrModal } from '@/components/events/EventCardWithQrModal';
import { EventsPageSkeleton } from '@/components/ui/PageSkeletons';
import { Ticket, CalendarDays, Search, X } from 'lucide-react';

type EventFilter = 'ALL' | 'GENERAL' | 'COURSE' | 'COMPLETED';

const FILTER_TABS: { key: EventFilter; label: string }[] = [
  { key: 'ALL', label: 'ทั้งหมด' },
  { key: 'GENERAL', label: 'กิจกรรมทั่วไป' },
  { key: 'COURSE', label: 'คอร์สเรียน' },
  { key: 'COMPLETED', label: 'เช็กชื่อ / สำเร็จ' },
];

function EventsContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<EventFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [allEvents, setAllEvents] = useState<EventItem[]>(mockEvents);

  useEffect(() => {
    const cat = searchParams?.get('category');
    if (cat === 'course') setFilter('COURSE');
    else if (cat === 'general') setFilter('GENERAL');
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const custom: EventItem[] = JSON.parse(localStorage.getItem('yfti_custom_events') || '[]');
        if (Array.isArray(custom) && custom.length > 0) {
          setAllEvents([...custom, ...mockEvents]);
        }
      } catch {}
    }
  }, []);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allEvents.filter((ev) => {
      if (filter === 'GENERAL' && ev.event_type === 'course') return false;
      if (filter === 'COURSE' && ev.event_type !== 'course') return false;
      if (filter === 'COMPLETED' && !(ev.isCheckedIn || ev.status === 'COMPLETED')) return false;
      if (q) {
        const hay = `${ev.title} ${ev.description || ''} ${ev.location_name || ''}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [allEvents, filter, searchQuery]);

  return (
    <div className="w-full bg-[#F6F4EF] pb-4">
      {/* ================= 1. CURVED OBSIDIAN LUXURY HEADER ================= */}
      <section className="relative luxury-stage text-white pt-4 pb-12 px-4 sm:px-6 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto space-y-3.5">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">
                กิจกรรม <span className="font-light text-white/80 text-base sm:text-lg">&amp; คอร์สเรียน</span>
              </h1>
              <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                หลักสูตรและกิจกรรมเครือข่าย Young FTI ELITE 11
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/events/my-tickets"
                className="px-3 py-1.5 rounded-xl badge-gold-metallic text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>บัตรของฉัน</span>
              </Link>
              <Link
                href="/events/calendar"
                aria-label="ปฏิทินกิจกรรม"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold inline-flex items-center gap-1.5 transition backdrop-blur-sm"
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#ECD28E]" />
                <span className="hidden xs:inline">ปฏิทิน</span>
              </Link>
            </div>
          </div>

          {/* Floating Crisp White Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อกิจกรรม คอร์สเรียน หรือสถานที่..."
              className="w-full pl-10 pr-9 py-2.5 bg-white text-[#161C2C] rounded-2xl text-xs sm:text-sm font-medium placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#C5A059] shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Filter Pills Inside Obsidian Header */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const isActive = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition shrink-0 ${
                    isActive
                      ? 'bg-[#C59B38]/25 border-[#E5C158] text-[#E5C158] shadow-sm'
                      : 'bg-white/8 border-white/12 text-slate-300 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 2. OVERLAPPING WARM IVORY SHEET ================= */}
      <div className="relative z-20 -mt-6 luxury-sheet rounded-t-[30px] pt-5 px-4 sm:px-6 min-h-[65vh]">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-extrabold text-[#161C2C] tabular-nums">
              {filteredEvents.length} กิจกรรมและคอร์สเรียน
            </p>
            {(filter !== 'ALL' || searchQuery.trim() !== '') && (
              <button
                type="button"
                onClick={() => {
                  setFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-[#9A742B] hover:underline"
              >
                แสดงทั้งหมด
              </button>
            )}
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredEvents.map((ev) => (
                <EventCardWithQrModal key={ev.id} event={ev} />
              ))}
            </div>
          ) : (
            <div className="py-14 text-center bg-white rounded-[24px] shadow-[0_6px_20px_rgba(13,19,33,0.05)] text-xs text-slate-500 space-y-2">
              <CalendarDays className="w-8 h-8 text-slate-300 mx-auto" />
              <p>ไม่พบกิจกรรมหรือคอร์สเรียนที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsContent />
    </Suspense>
  );
}

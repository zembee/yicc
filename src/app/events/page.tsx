'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mockEvents } from '@/lib/mockData';
import { EventItem } from '@/types';
import { EventCardWithQrModal } from '@/components/events/EventCardWithQrModal';
import { EventsPageSkeleton } from '@/components/ui/PageSkeletons';
import { Ticket, CalendarDays } from 'lucide-react';

type EventFilter = 'ALL' | 'GENERAL' | 'COURSE' | 'COMPLETED';

function EventsContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<EventFilter>('ALL');
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

  const filteredEvents = allEvents.filter((ev) => {
    if (filter === 'GENERAL') return ev.event_type !== 'course';
    if (filter === 'COURSE') return ev.event_type === 'course';
    if (filter === 'COMPLETED') return ev.isCheckedIn || ev.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-24">
      {/* Executive Navy Header with Integrated My Tickets & Calendar Buttons */}
      <div className="bg-gradient-to-b from-[#181B34] via-[#1E2538] to-[#252E46] text-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_rgba(15,23,42,0.12)] border border-slate-800/60 border-b-[3px] border-b-[#FB7170] space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Activities &amp; Courses</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            กิจกรรมและคอร์สเรียนหลักสูตร Young FTI ELITE 11
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <Link
            href="/events/my-tickets"
            className="py-2.5 px-4 rounded-xl bg-[#C59B38] hover:bg-[#b38a2e] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Ticket className="w-4 h-4" />
            <span>บัตรของฉัน</span>
          </Link>

          <Link
            href="/events/calendar"
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <CalendarDays className="w-4 h-4" />
            <span>ปฏิทิน</span>
          </Link>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-start gap-2 overflow-x-auto py-1 no-scrollbar">
        {(
          [
            { key: 'ALL', label: 'ทั้งหมด' },
            { key: 'GENERAL', label: 'กิจกรรมทั่วไป' },
            { key: 'COURSE', label: 'คอร์สเรียน' },
            { key: 'COMPLETED', label: 'เช็กชื่อ / สำเร็จ' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition shadow-sm ${
              filter === tab.key
                ? 'bg-[#1E2538] text-white'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:text-[#1E2538] hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((ev) => (
          <EventCardWithQrModal key={ev.id} event={ev} />
        ))}
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

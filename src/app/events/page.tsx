'use client';

import React, { useState } from 'react';
import { mockEvents } from '@/lib/mockData';
import { EventCardWithQrModal } from '@/components/events/EventCardWithQrModal';
import { Calendar } from 'lucide-react';

export default function EventsPage() {
  const [filter, setFilter] = useState<'ALL' | 'MANDATORY' | 'COMPLETED'>('ALL');

  const filteredEvents = mockEvents.filter((ev) => {
    if (filter === 'MANDATORY') return ev.is_mandatory;
    if (filter === 'COMPLETED') return ev.isCheckedIn || ev.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#212542]">Cohort Events & Schedule</h2>
          <p className="text-xs text-[#6B7280]">ตารางเรียนและกิจกรรมสัมมนาเครือข่ายผู้นำ</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-[#DBDFFF] flex items-center justify-center text-[#212542]">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        {[
          { key: 'ALL', label: 'ทั้งหมด' },
          { key: 'MANDATORY', label: 'วิชาบังคับ (80%)' },
          { key: 'COMPLETED', label: 'เช็คชื่อแล้ว' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              filter === tab.key
                ? 'bg-[#212542] text-white shadow-md shadow-[#212542]/20'
                : 'bg-white text-[#6B7280] border border-[#EEEEEE] hover:text-[#212542]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4 pt-1">
        {filteredEvents.map((ev) => (
          <EventCardWithQrModal key={ev.id} event={ev} />
        ))}
      </div>
    </div>
  );
}

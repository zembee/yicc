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
          <h1 className="text-base font-extrabold text-[#181B34]">กิจกรรมโครงการ</h1>
          <p className="text-xs text-slate-500">ตารางเรียนและกิจกรรมสัมมนาเครือข่าย Young FTI ELITE</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#181B34]">
          <Calendar className="w-4 h-4 text-[#FB7170]" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {[
          { key: 'ALL', label: 'ทั้งหมด' },
          { key: 'MANDATORY', label: 'วิชาบังคับ (80%)' },
          { key: 'COMPLETED', label: 'เช็คชื่อแล้ว' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              filter === tab.key
                ? 'bg-[#181B34] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-[#181B34]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3.5 pt-1">
        {filteredEvents.map((ev) => (
          <EventCardWithQrModal key={ev.id} event={ev} />
        ))}
      </div>
    </div>
  );
}


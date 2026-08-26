'use client';

import React, { useState } from 'react';
import { mockEvents } from '@/lib/mockData';
import { EventCardWithQrModal } from '@/components/events/EventCardWithQrModal';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';

export default function EventsPage() {
  const [filter, setFilter] = useState<'ALL' | 'MANDATORY' | 'COMPLETED'>('ALL');

  const filteredEvents = mockEvents.filter((ev) => {
    if (filter === 'MANDATORY') return ev.is_mandatory;
    if (filter === 'COMPLETED') return ev.isCheckedIn || ev.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-8 sm:space-y-10 pb-12">
      {/* Header Info */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E2538] tracking-tight">
          กิจกรรมโครงการ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          ตารางอบรม สัมมนาเชิงปฏิบัติการ ทริปกระชับมิตร และการเช็คชื่อเข้าร่วมกิจกรรม
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 no-scrollbar">
        {[
          { key: 'ALL', label: 'กิจกรรมทั้งหมด' },
          { key: 'MANDATORY', label: 'วิชาบังคับ (เกณฑ์ 80%)' },
          { key: 'COMPLETED', label: 'เช็คชื่อ / สำเร็จแล้ว' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition shadow-sm ${
              filter === tab.key
                ? 'bg-[#1E2538] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-[#1E2538] hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev) => (
          <EventCardWithQrModal key={ev.id} event={ev} />
        ))}
      </div>
    </div>
  );
}

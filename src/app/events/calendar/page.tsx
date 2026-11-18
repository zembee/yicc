'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { mockEvents } from '@/lib/mockData';
import { EventItem } from '@/types';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export default function EventsCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 11, 1)); // Dec 2026
  const [allEvents, setAllEvents] = useState<EventItem[]>(mockEvents);

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay();

  const monthEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const d = new Date(ev.start_time);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [allEvents, year, month]);

  const eventDays = useMemo(() => {
    const map = new Map<number, EventItem[]>();
    monthEvents.forEach((ev) => {
      const day = new Date(ev.start_time).getDate();
      const list = map.get(day) || [];
      list.push(ev);
      map.set(day, list);
    });
    return map;
  }, [monthEvents]);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-24 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#1E2538] text-white rounded-3xl p-4 sm:p-5 shadow-md flex items-center gap-3">
        <Link
          href="/events"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base sm:text-lg font-black">ปฏิทินกิจกรรม</h1>
          <p className="text-[11px] text-slate-300">กำหนดการคอร์สเรียนและกิจกรรมทั้งหมด</p>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm sm:text-base font-black text-[#1E2538]">
            {THAI_MONTHS[month]} {year + 543}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const hasEvents = eventDays.has(day);
            return (
              <div
                key={day}
                className={`h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold relative ${
                  hasEvents
                    ? 'bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]'
                    : 'text-[#1E2538]'
                }`}
              >
                <span>{day}</span>
                {hasEvents && <span className="w-1.5 h-1.5 rounded-full bg-[#C59B38] mt-0.5" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Month Events List */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          กิจกรรมในเดือน {THAI_MONTHS[month]} ({monthEvents.length})
        </h3>
        {monthEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-xs text-slate-400">
            ไม่มีกิจกรรมในเดือนนี้
          </div>
        ) : (
          monthEvents.map((ev) => (
            <Link
              key={ev.id}
              href={`/events/${ev.id}`}
              className="block bg-white rounded-2xl p-4 border border-slate-200 hover:border-[#C59B38] shadow-sm transition space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#9A7320] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#B38728]" />
                  {ev.published_date_text || new Date(ev.start_time).toLocaleDateString('th-TH')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                  {ev.event_type === 'course' ? 'คอร์สเรียน' : 'กิจกรรม'}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#1E2538]">{ev.title}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {ev.location_name}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

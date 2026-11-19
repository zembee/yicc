'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck, CheckCircle2, GraduationCap } from 'lucide-react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockEvents } from '@/lib/mockData';
import { EventItem } from '@/types';
import { safeReadLocalStorage } from '@/components/profile/profileUtils';

const DEFAULT_EVENT_COVER =
  'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp';

type StatusFilter = 'ALL' | 'CHECKED_IN' | 'REGISTERED';

const isArrayOfObjects = (v: unknown): v is Record<string, unknown>[] =>
  Array.isArray(v);

export default function ProfileEventsHistoryPage() {
  const { profile } = useLiffAuth();
  const [customEvents, setCustomEvents] = useState<EventItem[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const profileId = profile?.id;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedCustom = safeReadLocalStorage<EventItem[]>(
      'yfti_custom_events',
      [],
      (v): v is EventItem[] => Array.isArray(v)
    );
    setCustomEvents(savedCustom);

    const savedRegs = safeReadLocalStorage<Record<string, unknown>[]>(
      'yfti_event_registrations',
      [],
      isArrayOfObjects
    );
    const ids = savedRegs
      .filter((r) => {
        if (r.status === 'REJECTED') return false;
        const regOwner = r.profileId ?? r.userId;
        if (profileId && regOwner !== undefined && String(regOwner) !== String(profileId)) {
          return false;
        }
        return r.eventId !== undefined;
      })
      .map((r) => String(r.eventId));
    setRegisteredEventIds(ids);
  }, [profileId]);

  const myEventsList = useMemo(() => {
    const all = [...customEvents, ...mockEvents];
    return all.filter(
      (ev) => ev.isRegisteredForEvent || ev.isCheckedIn || registeredEventIds.includes(String(ev.id))
    );
  }, [customEvents, registeredEventIds]);

  const filteredEvents = useMemo(() => {
    if (statusFilter === 'CHECKED_IN') {
      return myEventsList.filter((ev) => ev.isCheckedIn);
    }
    if (statusFilter === 'REGISTERED') {
      return myEventsList.filter((ev) => !ev.isCheckedIn);
    }
    return myEventsList;
  }, [myEventsList, statusFilter]);

  const checkedInCount = myEventsList.filter((ev) => ev.isCheckedIn).length;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 pb-24 space-y-5">
      {/* Executive Navy Header */}
      <div className="bg-gradient-to-b from-[#181B34] via-[#1E2538] to-[#252E46] text-white rounded-2xl p-4 sm:p-6 shadow-[0_4px_16px_rgba(15,23,42,0.12)] border border-slate-800/60 space-y-4">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            aria-label="กลับหน้าโปรไฟล์"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">
              ข้อมูลการเข้าร่วมกิจกรรม / คอร์สเรียน
            </h1>
            <p className="text-xs text-slate-300 mt-0.5 tabular-nums">
              ทั้งหมด {myEventsList.length} รายการ • เช็กชื่อแล้ว {checkedInCount} รายการ
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        {(
          [
            { key: 'ALL', label: `ทั้งหมด (${myEventsList.length})` },
            { key: 'CHECKED_IN', label: `เช็กชื่อแล้ว (${checkedInCount})` },
            { key: 'REGISTERED', label: `ลงทะเบียนแล้ว (${myEventsList.length - checkedInCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-sm ${
              statusFilter === tab.key
                ? 'bg-[#1E2538] text-white'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:text-[#1E2538] hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-2.5">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <GraduationCap className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">ไม่พบรายการกิจกรรมในหมวดนี้</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E2538] hover:bg-[#2B3550] text-white text-xs font-bold transition mt-1"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>ดูกิจกรรมทั้งหมด</span>
            </Link>
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <Link
              key={ev.id}
              href={`/events/${ev.id}`}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/70 hover:border-[#C59B38] bg-[#FAFAF8] transition group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-200 border border-slate-200/80 shrink-0">
                <img
                  src={ev.image_url || DEFAULT_EVENT_COVER}
                  alt={ev.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = DEFAULT_EVENT_COVER;
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#1E2538] truncate group-hover:text-[#B38728] transition-colors">
                  {ev.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {ev.published_date_text || 'กำลังจะมาถึง'} • {ev.location_name}
                </p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center gap-1 ${
                  ev.isCheckedIn
                    ? 'bg-[#1E2538] text-white'
                    : ev.status === 'UPCOMING'
                    ? 'bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {ev.isCheckedIn && <CheckCircle2 className="w-3 h-3 text-[#E5C158]" />}
                <span>
                  {ev.isCheckedIn
                    ? 'เช็กชื่อแล้ว'
                    : ev.status === 'UPCOMING'
                    ? 'ลงทะเบียนแล้ว'
                    : 'เข้าร่วมแล้ว'}
                </span>
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

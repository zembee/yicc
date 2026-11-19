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
      {/* Executive Navy Hero Header */}
      <div className="relative overflow-hidden bg-[#141A2C] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_30px_rgba(20,26,44,0.18)] border-b-[3px] border-[#FB7170] space-y-4">
        <div className="absolute inset-0 pointer-events-none select-none">
          <img
            src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-right opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(115deg, rgba(16,22,38,0.96) 28%, rgba(24,31,52,0.88) 58%, rgba(30,37,56,0.65) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            href="/profile"
            aria-label="กลับหน้าโปรไฟล์"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <img
            src="/images/icons/events.webp"
            alt="ประวัติกิจกรรม"
            className="w-10 h-10 rounded-xl ring-1 ring-white/15 shadow-sm shrink-0 hidden sm:block"
          />
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold tracking-tight truncate">
              ข้อมูลการเข้าร่วมกิจกรรม / คอร์สเรียน
            </h1>
            <p className="text-xs font-medium text-[#FB7170] mt-0.5 tabular-nums">
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
                className={`text-[11px] font-bold shrink-0 inline-flex items-center gap-1.5 ${
                  ev.isCheckedIn
                    ? 'text-emerald-700'
                    : ev.status === 'UPCOMING'
                    ? 'text-[#B38728]'
                    : 'text-slate-500'
                }`}
              >
                {ev.isCheckedIn ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      ev.status === 'UPCOMING' ? 'bg-[#C59B38]' : 'bg-slate-400'
                    }`}
                  />
                )}
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

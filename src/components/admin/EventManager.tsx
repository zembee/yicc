'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { EventItem, EventStatus } from '@/types';
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const EMPTY_FORM = {
  id: '',
  title: '',
  event_type: 'course' as 'general' | 'course',
  status: 'UPCOMING' as EventStatus,
  date: '2026-12-25',
  location_name: 'สภาอุตสาหกรรมแห่งประเทศไทย (FTI)',
  fee_member: '1500',
  fee_guest: '2500',
  reward_points: '50',
  reward_xp: '100',
  description: '',
};

export const EventManager: React.FC<{ onCountChange?: (count: number) => void }> = ({
  onCountChange,
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = (await res.json()) as { events?: EventItem[] };
        if (Array.isArray(data.events)) {
          setEvents(data.events);
          onCountChange?.(data.events.length);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (item: EventItem) => {
    const datePart = item.start_time ? item.start_time.slice(0, 10) : '2026-12-25';
    setForm({
      id: item.id,
      title: item.title,
      event_type: item.event_type || 'general',
      status: item.status,
      date: datePart,
      location_name: item.location_name || '',
      fee_member: String(item.fee_member ?? 0),
      fee_guest: String(item.fee_guest ?? 0),
      reward_points: String(item.reward_points ?? 50),
      reward_xp: String(item.reward_xp ?? 100),
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSaving(true);
    try {
      const startIso = new Date(`${form.date}T09:00:00+07:00`).toISOString();
      const endIso = new Date(`${form.date}T17:00:00+07:00`).toISOString();

      const payload = {
        id: form.id || undefined,
        title: form.title.trim(),
        event_type: form.event_type,
        status: form.status,
        start_time: startIso,
        end_time: endIso,
        location_name: form.location_name.trim(),
        fee_member: Number(form.fee_member) || 0,
        fee_guest: Number(form.fee_guest) || 0,
        reward_points: Number(form.reward_points) || 50,
        reward_xp: Number(form.reward_xp) || 100,
        description: form.description.trim(),
      };

      const res = await fetch('/api/events', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as { events?: EventItem[] };
        if (Array.isArray(data.events)) {
          setEvents(data.events);
          onCountChange?.(data.events.length);
        }
        setIsModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = (await res.json()) as { events?: EventItem[] };
      if (Array.isArray(data.events)) {
        setEvents(data.events);
        onCountChange?.(data.events.length);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-[#1E2538] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#B38728]" />
          <span>จัดการกิจกรรม &amp; คอร์สเรียน (Events)</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {events.length} รายการ
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadEvents}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#1E2538] hover:bg-slate-50 transition"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="px-3 py-1.5 rounded-lg bg-[#1E2538] hover:bg-[#2A334E] text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#E5C158]" />
            สร้างกิจกรรม / คอร์ส
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {events.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'UPCOMING'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.status === 'ONGOING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]">
                  {item.event_type === 'course' ? 'คอร์สเรียน' : 'กิจกรรม'}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  +{item.reward_points} Pts / +{item.reward_xp} XP
                </span>
              </div>
              <p className="text-xs font-extrabold text-[#1E2538] truncate">{item.title}</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                <span>{item.start_time ? item.start_time.slice(0, 10) : '-'}</span>
                {item.location_name && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-0.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {item.location_name}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={`/events/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#1E2538] transition"
                title="ดูหน้าจริง (เปิดแท็บใหม่)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => openEdit(item)}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#1E2538] transition"
                title="แก้ไข"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition"
                title="ลบ"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1E2538] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-black">
                {form.id ? 'แก้ไขกิจกรรม / คอร์สเรียน' : 'สร้างกิจกรรม / คอร์สเรียนใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 overflow-y-auto text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">ชื่อกิจกรรม / คอร์ส *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">ประเภท</label>
                  <select
                    value={form.event_type}
                    onChange={(e) =>
                      setForm({ ...form, event_type: e.target.value as 'general' | 'course' })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="course">คอร์สเรียน</option>
                    <option value="general">กิจกรรมทั่วไป</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">สถานะ</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">วันที่จัด</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">สถานที่</label>
                <input
                  type="text"
                  value={form.location_name}
                  onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">ค่าสมัครสมาชิก</label>
                  <input
                    type="number"
                    min={0}
                    value={form.fee_member}
                    onChange={(e) => setForm({ ...form, fee_member: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">บุคคลทั่วไป</label>
                  <input
                    type="number"
                    min={0}
                    value={form.fee_guest}
                    onChange={(e) => setForm({ ...form, fee_guest: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">แจก Pts</label>
                  <input
                    type="number"
                    min={0}
                    value={form.reward_points}
                    onChange={(e) => setForm({ ...form, reward_points: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">แจก XP</label>
                  <input
                    type="number"
                    min={0}
                    value={form.reward_xp}
                    onChange={(e) => setForm({ ...form, reward_xp: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">รายละเอียด</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-[#1E2538] hover:bg-[#2A334E] disabled:opacity-60 text-white font-bold text-xs transition"
              >
                {isSaving ? 'กำลังบันทึก...' : form.id ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม / คอร์ส'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

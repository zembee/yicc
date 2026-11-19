'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockNotifications } from '@/lib/mockData';
import { NotificationItem } from '@/types';
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  Megaphone,
  Calendar,
  Award,
  CheckCheck,
  ChevronRight,
} from 'lucide-react';

type FilterTab = 'all' | 'chat' | 'general';

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const readIds: string[] = JSON.parse(localStorage.getItem('yfti_notifications_read') || '[]');
        if (Array.isArray(readIds) && readIds.length > 0) {
          setItems(
            mockNotifications.map((item) =>
              readIds.includes(item.id) ? { ...item, is_read: true } : item
            )
          );
        }
      } catch {}
    }
  }, []);

  const persistReadIds = (nextItems: NotificationItem[]) => {
    if (typeof window !== 'undefined') {
      const readIds = nextItems.filter((i) => i.is_read).map((i) => i.id);
      localStorage.setItem('yfti_notifications_read', JSON.stringify(readIds));
    }
  };

  const unreadCount = useMemo(
    () => items.filter((item) => !item.is_read).length,
    [items]
  );

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items;
    return items.filter((item) => item.category === activeTab);
  }, [items, activeTab]);

  const handleMarkAllRead = () => {
    setItems((prev) => {
      const next = prev.map((item) => ({ ...item, is_read: true }));
      persistReadIds(next);
      return next;
    });
  };

  const handleItemClick = (item: NotificationItem) => {
    setItems((prev) => {
      const next = prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n));
      persistReadIds(next);
      return next;
    });
    if (item.link) {
      router.push(item.link);
    }
  };

  const renderIcon = (item: NotificationItem) => {
    let Icon = Megaphone;
    if (item.category === 'chat') Icon = MessageCircle;
    else if (item.icon_type === 'event') Icon = Calendar;
    else if (item.icon_type === 'reward') Icon = Award;

    return (
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          !item.is_read
            ? 'bg-[#0D1321] text-[#ECD28E] shadow-sm'
            : 'bg-[#F6F4EF] text-[#9A7320]'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="w-full bg-[#F6F4EF] text-[#161C2C] pb-4">
      {/* ================= 1. CURVED OBSIDIAN LUXURY STAGE HEADER ================= */}
      <section className="relative luxury-stage text-white pt-4 pb-12 px-4 sm:px-6 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(90% 80% at 85% 0%, rgba(197,155,56,0.16) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                aria-label="กลับหน้าหลัก"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md flex items-center justify-center transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">
                    การแจ้งเตือน{' '}
                    <span className="font-light text-white/80 text-base sm:text-lg">
                      Notifications
                    </span>
                  </h1>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full luxury-gold-btn text-[10px] font-bold tabular-nums shrink-0">
                      {unreadCount} ใหม่
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                  ข่าวสาร กิจกรรม และสิทธิพิเศษสำหรับสมาชิก ELITE 11
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md text-xs font-bold text-[#ECD28E] hover:text-white disabled:opacity-35 disabled:pointer-events-none flex items-center gap-1.5 transition shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">อ่านทั้งหมด</span>
            </button>
          </div>

          {/* Filter Pills inside Obsidian Header */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
            {(
              [
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'chat', label: 'ข้อความ & เครือข่าย' },
                { id: 'general', label: 'ข่าวสาร & กิจกรรม' },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'luxury-gold-btn text-white'
                      : 'bg-white/[0.08] text-slate-300 hover:bg-white/[0.14] hover:text-white'
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
      <div className="relative z-20 -mt-7 rounded-t-[32px] luxury-sheet pt-6 pb-2 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-[24px] p-12 text-center shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-[#161C2C]">ยังไม่มีการแจ้งเตือนในหมวดนี้</p>
              <p className="text-xs text-slate-400">เมื่อมีข่าวสารหรือกิจกรรมใหม่ ระบบจะแจ้งให้ทราบที่นี่</p>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] shadow-[0_8px_26px_rgba(13,19,33,0.05)] divide-y divide-[#EFECE4] overflow-hidden">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left p-4 sm:p-5 transition flex items-start gap-3.5 group ${
                    !item.is_read
                      ? 'bg-[#FBF8F0] hover:bg-[#F6F1E3]'
                      : 'bg-white hover:bg-[#FAF9F5]'
                  }`}
                >
                  {renderIcon(item)}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2
                        className={`text-xs sm:text-sm leading-snug group-hover:text-[#9A7320] transition-colors ${
                          !item.is_read
                            ? 'font-extrabold text-[#161C2C]'
                            : 'font-bold text-[#1E2538]'
                        }`}
                      >
                        {item.title}
                      </h2>
                      <div className="flex items-center gap-2 shrink-0 mt-0.5">
                        {!item.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#9A7320] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                    <span className="text-[11px] text-slate-400 block pt-0.5 font-medium">
                      {item.time_ago}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Caught-up Footer */}
          <div className="py-3 text-center text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#B18A3B]" />
            <span>แสดงการแจ้งเตือนล่าสุดครบทั้งหมดแล้ว</span>
          </div>
        </div>
      </div>
    </div>
  );
}

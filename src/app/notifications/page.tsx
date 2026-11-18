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
      <div className="w-10 h-10 rounded-full bg-white border border-slate-200/70 text-[#1E2538] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#B38728]" />
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-24 space-y-5">
      {/* Executive Navy Header */}
      <div className="bg-[#1E2538] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="กลับหน้าหลัก"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#FB7170] text-white text-[11px] font-bold tabular-nums">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="text-xs font-bold text-[#E5C158] hover:text-white disabled:opacity-40 flex items-center gap-1.5 transition"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* 3 Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(
          [
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'chat', label: 'Chat' },
            { id: 'general', label: 'แจ้งเตือนทั่วไป' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#C59B38] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-[#1E2538]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3.5 ${
              !item.is_read
                ? 'bg-[#FCF9EE] border-[#EFE3C2] hover:bg-[#FAF4DF]'
                : 'bg-white border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {renderIcon(item)}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-[#1E2538] leading-snug">
                  {item.title}
                </h2>
                {!item.is_read && (
                  <span className="w-2 h-2 rounded-full bg-[#C59B38] shrink-0 mt-1.5" />
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {item.message}
              </p>
              <span className="text-[11px] text-slate-400 block pt-0.5">
                {item.time_ago}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Caught-up Footer */}
      <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Bell className="w-3.5 h-3.5" />
        <span>You&apos;re all caught up</span>
      </div>
    </div>
  );
}

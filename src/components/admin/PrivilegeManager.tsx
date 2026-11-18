'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PrivilegeItem } from '@/types';
import {
  Gift,
  Plus,
  Pencil,
  Trash2,
  Star,
  ExternalLink,
  X,
  Coins,
  RefreshCw,
} from 'lucide-react';

const CATEGORIES: PrivilegeItem['category'][] = [
  'Food & Drink',
  'Travel',
  'Lifestyle',
  'Shopping',
  'Entertainment',
  'Events',
];

const EMPTY_FORM = {
  id: '',
  title: '',
  merchant: '',
  discount_label: '',
  category: 'Food & Drink' as PrivilegeItem['category'],
  points_required: '100',
  expiry_date: '31 ธ.ค. 2026',
  image_url: 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/unsplash_hEC6zxdFF0M.webp',
  description: '',
  conditionsText: 'แสดง QR Code สิทธิพิเศษจากแอป YFTI-CONNECT ก่อนรับบริการ',
  is_featured: false,
};

export const PrivilegeManager: React.FC<{ onCountChange?: (count: number) => void }> = ({
  onCountChange,
}) => {
  const [privileges, setPrivileges] = useState<PrivilegeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadPrivileges = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/privileges');
      if (res.ok) {
        const data = (await res.json()) as { privileges?: PrivilegeItem[] };
        if (Array.isArray(data.privileges)) {
          setPrivileges(data.privileges);
          onCountChange?.(data.privileges.length);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    loadPrivileges();
  }, [loadPrivileges]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (item: PrivilegeItem) => {
    setForm({
      id: item.id,
      title: item.title,
      merchant: item.merchant,
      discount_label: item.discount_label,
      category: item.category,
      points_required: String(item.points_required),
      expiry_date: item.expiry_date,
      image_url: item.image_url,
      description: item.description,
      conditionsText: (item.conditions || []).join('\n'),
      is_featured: Boolean(item.is_featured),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.merchant.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        id: form.id || undefined,
        title: form.title.trim(),
        merchant: form.merchant.trim(),
        discount_label: form.discount_label.trim() || 'สิทธิพิเศษ',
        category: form.category,
        points_required: Number(form.points_required) || 100,
        expiry_date: form.expiry_date.trim() || '31 ธ.ค. 2026',
        image_url: form.image_url.trim() || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/unsplash_hEC6zxdFF0M.webp',
        description: form.description.trim(),
        conditions: form.conditionsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        is_featured: form.is_featured,
      };

      const res = await fetch('/api/privileges', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as { privileges?: PrivilegeItem[] };
        if (Array.isArray(data.privileges)) {
          setPrivileges(data.privileges);
          onCountChange?.(data.privileges.length);
        }
        setIsModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeatured = async (item: PrivilegeItem) => {
    const res = await fetch('/api/privileges', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_featured: !item.is_featured }),
    });
    if (res.ok) {
      const data = (await res.json()) as { privileges?: PrivilegeItem[] };
      if (Array.isArray(data.privileges)) {
        setPrivileges(data.privileges);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/privileges?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = (await res.json()) as { privileges?: PrivilegeItem[] };
      if (Array.isArray(data.privileges)) {
        setPrivileges(data.privileges);
        onCountChange?.(data.privileges.length);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-[#1E2538] flex items-center gap-2">
          <Gift className="w-4 h-4 text-[#B38728]" />
          <span>จัดการสิทธิพิเศษ (Privileges)</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {privileges.length} รายการ
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPrivileges}
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
            เพิ่มสิทธิพิเศษ
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {privileges.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={item.image_url}
                alt={item.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/unsplash_hEC6zxdFF0M.webp';
                }}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
              />
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF6EC] text-[#9A7320] border border-[#EFE2C2]">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E2538] text-white">
                    {item.discount_label}
                  </span>
                  {item.is_featured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      ★ Featured
                    </span>
                  )}
                </div>
                <p className="text-xs font-extrabold text-[#1E2538] truncate">{item.title}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{item.merchant}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5 font-bold text-[#9A7320]">
                    <Coins className="w-3 h-3" /> {item.points_required} Pts
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleFeatured(item)}
                className={`p-2 rounded-lg border text-xs font-bold transition ${
                  item.is_featured
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-amber-600'
                }`}
                title="สลับสถานะแนะนำ (Featured)"
              >
                <Star className="w-3.5 h-3.5" />
              </button>
              <Link
                href={`/privileges/${item.id}`}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#1E2538] transition"
                title="ดูหน้าจริง"
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
                {form.id ? 'แก้ไขสิทธิพิเศษ' : 'เพิ่มสิทธิพิเศษใหม่'}
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
                <label className="font-bold text-slate-600 block mb-1">ชื่อสิทธิพิเศษ *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  placeholder="เช่น ส่วนลด 15% ห้องอาหาร..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">ร้านค้า / พาร์ทเนอร์ *</label>
                  <input
                    type="text"
                    required
                    value={form.merchant}
                    onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">ป้ายส่วนลด</label>
                  <input
                    type="text"
                    value={form.discount_label}
                    onChange={(e) => setForm({ ...form, discount_label: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="เช่น ลด 15%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">หมวดหมู่</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as PrivilegeItem['category'] })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">ใช้คะแนน (Pts)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.points_required}
                    onChange={(e) => setForm({ ...form, points_required: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">วันหมดอายุ</label>
                  <input
                    type="text"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">URL รูปภาพ</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
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

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  เงื่อนไขการใช้สิทธิ์ (ขึ้นบรรทัดใหม่ต่อ 1 ข้อ)
                </label>
                <textarea
                  rows={2}
                  value={form.conditionsText}
                  onChange={(e) => setForm({ ...form, conditionsText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span>แสดงใน Carousel แนะนำ (Featured)</span>
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-[#1E2538] hover:bg-[#2A334E] disabled:opacity-60 text-white font-bold text-xs transition"
              >
                {isSaving ? 'กำลังบันทึก...' : form.id ? 'บันทึกการแก้ไข' : 'สร้างสิทธิพิเศษ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

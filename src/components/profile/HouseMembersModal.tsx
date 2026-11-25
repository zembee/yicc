'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { Participant } from '@/types';
import { DEFAULT_AVATAR_DATA_URI, handleAvatarError } from './profileUtils';

interface HouseMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseName: string;
  houseRank: number | null;
  housePoints: number;
  houseMembers: Participant[];
}

export function HouseMembersModal({
  isOpen,
  onClose,
  houseName,
  houseRank,
  housePoints,
  houseMembers,
}: HouseMembersModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="house-members-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#F7F7F5] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1E2538] text-white p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 id="house-members-modal-title" className="text-base font-bold text-white">
                {houseName}
              </h3>
              <p className="text-xs text-slate-300 tabular-nums">
                {houseMembers.length} สมาชิกในกลุ่มดาว
                {houseRank !== null ? ` • อันดับ #${houseRank}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่างสมาชิกในกลุ่มดาว"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between text-xs">
            <span className="text-slate-300">คะแนนรวมกลุ่มดาว</span>
            <span className="font-bold text-[#E5C158] tabular-nums">
              {housePoints.toLocaleString()} คะแนน
            </span>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-2.5">
          {houseMembers.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">
              ยังไม่มีรายชื่อสมาชิกในกลุ่มดาวนี้
            </p>
          ) : (
            houseMembers.map((m) => (
              <Link
                key={m.id}
                href={`/yfti_participants/${m.id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 hover:border-[#C59B38] bg-white transition"
              >
                <img
                  src={m.profile_picture_url || DEFAULT_AVATAR_DATA_URI}
                  alt={m.name_thai}
                  className="w-11 h-11 rounded-full object-cover bg-slate-200 shrink-0"
                  onError={handleAvatarError}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-[#1E2538] truncate">
                    {m.name_thai}
                    {m.nickname_eng ? ` (${m.nickname_eng})` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {m.company_name_thai || m.business_position || 'สมาชิก YFTI 11'}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FBF6EC] border border-[#EFE2C2] text-[#9A7320] text-[10px] font-bold shrink-0">
                  {houseName}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

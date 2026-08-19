'use client';

import React, { useState } from 'react';
import { MissionSubmission } from '@/types';
import { mockPendingSubmissions } from '@/lib/mockData';
import { Check, X, Clock, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export const MissionReviewList: React.FC = () => {
  const [submissions, setSubmissions] = useState<MissionSubmission[]>(mockPendingSubmissions);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAction = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
    );
  };

  const pendingList = submissions.filter((s) => s.status === 'PENDING');

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-xs font-bold text-[#181B34] flex items-center gap-1.5 uppercase tracking-wide">
          <Clock className="w-3.5 h-3.5 text-[#FB7170]" />
          คำขอตรวจภารกิจรออนุมัติ ({pendingList.length})
        </h3>
      </div>

      {pendingList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-slate-500 text-xs shadow-sm">
          ไม่มีภารกิจรอการตรวจสอบในขณะนี้
        </div>
      ) : (
        pendingList.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3"
          >
            {/* User Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {item.user_picture ? (
                  <img
                    src={item.user_picture}
                    alt={item.user_name || ''}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#181B34] flex items-center justify-center font-bold text-xs">
                    {item.user_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-[#181B34]">{item.user_name}</h4>
                  <p className="text-[10px] text-slate-400">
                    ส่งเมื่อ {format(new Date(item.created_at), 'd MMM HH:mm', { locale: th })}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-[#FB7170] border border-rose-100">
                {item.mission_title}
              </span>
            </div>

            {/* Note */}
            {item.notes && (
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                "{item.notes}"
              </p>
            )}

            {/* Photo Thumbnail */}
            <div
              onClick={() => setSelectedImage(item.photo_storage_path)}
              className="relative w-full h-36 rounded-lg overflow-hidden cursor-pointer group bg-slate-100 border border-slate-200"
            >
              <img
                src={item.photo_storage_path}
                alt="Mission proof"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-[#181B34]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-xs font-bold text-white bg-[#181B34]/90 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                  <ImageIcon className="w-3.5 h-3.5" /> ดูภาพขนาดเต็ม
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleAction(item.id, 'REJECTED')}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> ปฏิเสธ
              </button>
              <button
                onClick={() => handleAction(item.id, 'APPROVED')}
                className="flex-1 py-2 px-3 rounded-lg bg-[#181B34] hover:bg-[#25294e] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-[#FB7170]" /> อนุมัติแต้ม
              </button>
            </div>
          </div>
        ))
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 cursor-pointer backdrop-blur-sm"
        >
          <div className="relative max-w-sm w-full">
            <img
              src={selectedImage}
              alt="Full preview"
              className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]"
            />
            <p className="text-center text-xs text-white/80 mt-2 font-medium">แตะที่ใดก็ได้เพื่อปิด</p>
          </div>
        </div>
      )}
    </div>
  );
};


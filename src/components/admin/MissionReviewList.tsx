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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#212542] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FB7170]" />
          คำขอตรวจภารกิจรออนุมัติ ({pendingList.length})
        </h3>
      </div>

      {pendingList.length === 0 ? (
        <div className="bg-white border border-[#EEEEEE] rounded-2xl p-6 text-center text-[#6B7280] text-xs">
          ไม่มีภารกิจรอการตรวจสอบในขณะนี้
        </div>
      ) : (
        pendingList.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#EEEEEE] rounded-3xl p-4 shadow-[0_4px_20px_rgba(33,37,66,0.04)] flex flex-col gap-3"
          >
            {/* User Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {item.user_picture ? (
                  <img
                    src={item.user_picture}
                    alt={item.user_name || ''}
                    className="w-9 h-9 rounded-full object-cover border border-[#EEEEEE]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#DBDFFF] text-[#212542] flex items-center justify-center font-bold text-xs">
                    {item.user_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-extrabold text-[#212542]">{item.user_name}</h4>
                  <p className="text-[10px] text-[#6B7280]">
                    ส่งเมื่อ {format(new Date(item.created_at), 'd MMM HH:mm', { locale: th })}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#FFD7D7] text-[#FB7170] border border-[#FB7170]/30">
                {item.mission_title}
              </span>
            </div>

            {/* Note */}
            {item.notes && (
              <p className="text-xs text-[#292929] bg-[#F8F9FC] p-2.5 rounded-xl border border-[#EEEEEE]">
                "{item.notes}"
              </p>
            )}

            {/* Photo Thumbnail */}
            <div
              onClick={() => setSelectedImage(item.photo_storage_path)}
              className="relative w-full h-40 rounded-2xl overflow-hidden cursor-pointer group bg-[#F8F9FC] border border-[#EEEEEE]"
            >
              <img
                src={item.photo_storage_path}
                alt="Mission proof"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-[#212542]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-xs font-bold text-white bg-[#212542]/80 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                  <ImageIcon className="w-3.5 h-3.5" /> ดูภาพขนาดเต็ม
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleAction(item.id, 'REJECTED')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#F8F9FC] hover:bg-[#FFF5F5] text-[#6B7280] hover:text-[#FB7170] text-xs font-bold border border-[#EEEEEE] transition flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" /> ปฏิเสธ
              </button>
              <button
                onClick={() => handleAction(item.id, 'APPROVED')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#212542] hover:bg-[#2d335a] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-[#212542]/20"
              >
                <Check className="w-4 h-4 text-[#DBDFFF]" /> อนุมัติแต้ม (+80 XP)
              </button>
            </div>
          </div>
        ))
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-[#212542]/80 flex items-center justify-center p-4 cursor-pointer backdrop-blur-md"
        >
          <div className="relative max-w-sm w-full">
            <img
              src={selectedImage}
              alt="Full preview"
              className="w-full rounded-3xl shadow-2xl object-contain max-h-[80vh]"
            />
            <p className="text-center text-xs text-white/80 mt-3 font-medium">แตะที่ใดก็ได้เพื่อปิด</p>
          </div>
        </div>
      )}
    </div>
  );
};

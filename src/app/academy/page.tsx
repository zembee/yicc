'use client';

import React, { useState } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, mockMissions } from '@/lib/mockData';
import { Mission } from '@/types';
import { 
  Trophy, 
  Lock, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Award,
  X,
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function AcademyPage() {
  const { profile, isLoading } = useLiffAuth();
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [activeMissionToUpload, setActiveMissionToUpload] = useState<Mission | null>(null);
  const [note, setNote] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-[#181B34] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลหลักสูตร...</p>
      </div>
    );
  }

  const attendance = profile?.attendance_rate ?? 85;
  const isLocked = attendance < 80;

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMissionToUpload) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setMissions((prev) =>
        prev.map((m) =>
          m.id === activeMissionToUpload.id ? { ...m, status: 'PENDING' } : m
        )
      );
      setIsSubmitting(false);
      setActiveMissionToUpload(null);
      setNote('');
      setUploadedImagePreview(null);
    }, 700);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Official Executive Headline & Attendance Banner */}
      <section className="bg-[#181B34] text-white p-5 rounded-2xl shadow-sm border border-[#2A2E54] relative overflow-hidden">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#DBDFFF] text-[10px] font-bold tracking-wide uppercase mb-1.5 border border-white/10">
              <ShieldCheck className="w-3 h-3 text-[#FB7170]" />
              Executive Cohort 1
            </div>
            <h1 className="text-lg font-black text-white leading-tight">Young FTI ELITE 11</h1>
            <p className="text-xs text-[#FB7170] font-semibold mt-0.5">หลักสูตรนักอุตสาหกรรมรุ่นใหม่</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-2xl font-black ${attendance >= 80 ? 'text-[#DBDFFF]' : 'text-[#FB7170]'}`}>
              {attendance}%
            </span>
            <p className="text-[10px] text-slate-300 font-medium">เกณฑ์ขั้นต่ำ 80%</p>
          </div>
        </div>

        {/* Clean Solid Progress Bar */}
        <div className="w-full bg-white/15 rounded-full h-2.5 p-0.5 mb-2.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              attendance >= 80 
                ? 'bg-[#FB7170]' 
                : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(100, attendance)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span>อัตราการเข้าเรียนสะสม</span>
          <span className="text-white font-medium">
            {attendance >= 80 ? '✓ ผ่านเกณฑ์รับวุฒิบัตร' : '⚠️ ต่ำกว่าเกณฑ์ที่กำหนด'}
          </span>
        </div>
      </section>

      {/* 2. Executive Masterclass Resource Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F6F7FB] border border-slate-200 flex items-center justify-center text-[#181B34]">
              <Sparkles className="w-4 h-4 text-[#FB7170]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#181B34]">Executive Masterclass Vault</h2>
              <p className="text-[11px] text-slate-500">เอกสารการบรรยาย สไลด์สรุป และบันทึกย้อนหลัง</p>
            </div>
          </div>
          {!isLocked && (
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ปลดล็อกแล้ว
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FA] border border-slate-200 text-xs hover:border-slate-300 transition cursor-pointer">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#FB7170]" />
              </div>
              <div className="min-w-0">
                <p className="text-[#181B34] font-semibold truncate">AI Strategy & Industrial Transformation 2026.pdf</p>
                <p className="text-[10px] text-slate-400">บรรยายโดย ดร.สุทธิเกียรติ • 24.8 MB</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </div>
        </div>

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-[2px] flex flex-col items-center justify-center p-5 text-center z-10">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#FB7170] mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-[#181B34]">เนื้อหาถูกจำกัดสิทธิ์ (Locked)</h3>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
              สงวนสิทธิ์เฉพาะผู้มีอัตราการเข้าเรียน 80% ขึ้นไปเท่านั้น (ปัจจุบันอยู่ที่ {attendance}%)
            </p>
          </div>
        )}
      </section>

      {/* 3. House Score Leaderboard */}
      <section className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FB7170]" />
            <h2 className="text-sm font-bold text-[#181B34]">House Score Leaderboard</h2>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
            สัปดาห์ที่ 4
          </span>
        </div>

        <div className="space-y-2">
          {mockHouses
            .sort((a, b) => b.total_points - a.total_points)
            .map((house, idx) => {
              const isUserHouse = profile?.house_id === house.id;
              return (
                <div
                  key={house.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isUserHouse
                      ? 'bg-[#F4F6FF] border-[#DBDFFF] ring-1 ring-[#DBDFFF]'
                      : 'bg-white border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-black text-xs ${
                      idx === 0 ? 'text-[#FB7170]' : idx === 1 ? 'text-[#181B34]' : 'text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: house.color_hex }}
                    />
                    <div>
                      <h3 className="text-xs font-bold text-[#181B34] flex items-center gap-1.5">
                        {house.name}
                        {isUserHouse && (
                          <span className="text-[9px] bg-[#181B34] text-white px-1.5 py-0.2 rounded font-bold">
                            บ้านของคุณ
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#181B34]">
                    {house.total_points.toLocaleString()} pts
                  </span>
                </div>
              );
            })}
        </div>
      </section>

      {/* 4. Gamified Cohort Missions */}
      <section className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FB7170]" />
            <h2 className="text-sm font-bold text-[#181B34]">ภารกิจสะสมแต้ม Cohort</h2>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            แลกของรางวัล & สิทธิ์พิเศษ
          </span>
        </div>

        <div className="space-y-3">
          {missions.map((mission) => {
            return (
              <div
                key={mission.id}
                className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2.5 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#181B34]">{mission.title}</h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[11px] font-bold text-[#FB7170] flex items-center gap-1 bg-[#FFD7D7]/60 px-2 py-0.5 rounded-md border border-[#FFD7D7]">
                      <Coins className="w-3 h-3 text-[#FB7170]" /> +{mission.reward_points}
                    </span>
                    <span className="text-[9px] font-bold text-[#181B34] bg-slate-200/80 px-1.5 py-0.2 rounded font-mono">
                      +{mission.reward_xp} XP
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                  {mission.status === 'APPROVED' ? (
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติแต้มแล้ว
                    </span>
                  ) : mission.status === 'PENDING' ? (
                    <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> รอเจ้าหน้าที่ตรวจสอบ
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveMissionToUpload(mission)}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#181B34] hover:bg-[#25294e] text-white font-bold text-xs transition active:scale-95 ml-auto"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#DBDFFF]" />
                      ส่งภาพหลักฐาน
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Photo Upload Modal */}
      {activeMissionToUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-5 relative shadow-xl">
            <button
              onClick={() => setActiveMissionToUpload(null)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#181B34] bg-slate-100 px-2 py-0.5 rounded mb-2 inline-block">
              Mission Submission
            </span>
            <h3 className="text-sm font-bold text-[#181B34] mb-1">{activeMissionToUpload.title}</h3>
            <p className="text-xs text-slate-500 mb-4">{activeMissionToUpload.description}</p>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              {/* Photo Input Picker */}
              <div className="border border-dashed border-slate-300 hover:border-[#181B34] rounded-xl p-4 text-center cursor-pointer bg-[#F8F9FA] transition">
                {uploadedImagePreview ? (
                  <div className="relative">
                    <img
                      src={uploadedImagePreview}
                      alt="Preview"
                      className="w-full h-36 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImagePreview(null)}
                      className="absolute top-2 right-2 p-1 bg-slate-900/80 rounded-full text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 cursor-pointer py-2">
                    <UploadCloud className="w-6 h-6 text-[#181B34]" />
                    <span className="text-xs text-[#181B34] font-bold">แตะเพื่อเลือกภาพหลักฐาน</span>
                    <span className="text-[10px] text-slate-400">รองรับไฟล์ JPG, PNG</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-[#181B34] mb-1">บันทึกข้อความเพิ่มเติม (ถ้ามี)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ถ่ายคู่กับพี่กิตติ House Pegasus"
                  className="w-full bg-[#F8F9FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#181B34]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMissionToUpload(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#181B34] hover:bg-[#25294e] text-white font-bold text-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังส่ง...' : 'ยืนยันและส่ง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


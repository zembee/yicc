'use client';

import React, { useState } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, mockMissions } from '@/lib/mockData';
import { Mission } from '@/types';
import { 
  Trophy, 
  Flame, 
  Lock, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Award,
  X,
  FileText
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
        <div className="w-8 h-8 border-2 border-[#212542] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#6B7280]">กำลังเชื่อมต่อข้อมูล Cohort...</p>
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
    }, 800);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Attendance Tracker Card (Navy Hero Card) */}
      <section className="bg-[#212542] text-white p-5 rounded-3xl shadow-[0_10px_25px_rgba(33,37,66,0.15)] relative overflow-hidden">
        {/* Accent Soft Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FB7170] rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="flex justify-between items-start mb-3 relative z-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#212542] bg-[#DBDFFF] px-2.5 py-0.5 rounded-full">
              Attendance Tracker
            </span>
            <h2 className="text-base font-extrabold text-white mt-2">อัตราการเข้าเรียนสะสม</h2>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-black ${attendance >= 80 ? 'text-[#DBDFFF]' : 'text-[#FFD7D7]'}`}>
              {attendance}%
            </span>
            <p className="text-[10px] text-[#DBDFFF]/80">เกณฑ์ขั้นต่ำ 80%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/15 rounded-full h-3 p-0.5 mb-3 border border-white/20 relative z-10">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              attendance >= 80 
                ? 'bg-gradient-to-r from-[#DBDFFF] to-[#FB7170] shadow-md' 
                : 'bg-[#FB7170]'
            }`}
            style={{ width: `${Math.min(100, attendance)}%` }}
          />
        </div>

        <p className="text-[11px] text-white/85 flex items-center gap-1.5 relative z-10">
          <Flame className="w-3.5 h-3.5 text-[#FB7170] shrink-0" />
          {attendance >= 80
            ? 'ยอดเยี่ยม! คุณผ่านเกณฑ์รับวุฒิบัตรและสิทธิ์เข้าถึงเนื้อหาพิเศษ'
            : 'คำเตือน: เวลาเรียนต่ำกว่า 80% เมนู Masterclass จะถูกล็อกชั่วคราว'}
        </p>
      </section>

      {/* 2. Locked / Unlocked Masterclass Resource */}
      <section className="relative rounded-3xl overflow-hidden border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#DBDFFF] flex items-center justify-center text-[#212542]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#212542]">Executive Masterclass Vault</h3>
              <p className="text-[10px] text-[#6B7280]">สไลด์สรุป คลังความรู้ และ VDO ย้อนหลัง</p>
            </div>
          </div>
          {!isLocked && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ปลดล็อกแล้ว
            </span>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FC] border border-[#EEEEEE] text-xs">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#5867E8]" />
              <span className="text-[#212542] font-semibold">AI Strategy Framework 2026.pdf</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF] font-medium">24 MB</span>
          </div>
        </div>

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-5 text-center z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#FFD7D7] border border-[#FB7170]/30 flex items-center justify-center text-[#FB7170] mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-[#212542]">เนื้อหาถูกล็อก (Locked)</h4>
            <p className="text-xs text-[#6B7280] mt-1 max-w-xs leading-relaxed">
              สงวนสิทธิ์เฉพาะผู้มีอัตราการเข้าเรียน 80% ขึ้นไปเท่านั้น (ปัจจุบันคุณอยู่ที่ {attendance}%)
            </p>
          </div>
        )}
      </section>

      {/* 3. House/Team Leaderboard */}
      <section className="bg-white border border-[#EEEEEE] p-5 rounded-3xl shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FB7170]" />
            <h3 className="text-sm font-extrabold text-[#212542]">House Score Leaderboard</h3>
          </div>
          <span className="text-[10px] text-[#6B7280] font-medium bg-[#F8F9FC] px-2 py-0.5 rounded-md border border-[#EEEEEE]">
            สัปดาห์ที่ 4
          </span>
        </div>

        <div className="space-y-2.5">
          {mockHouses
            .sort((a, b) => b.total_points - a.total_points)
            .map((house, idx) => {
              const isUserHouse = profile?.house_id === house.id;
              return (
                <div
                  key={house.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    isUserHouse
                      ? 'bg-[#F4F6FF] border-[#DBDFFF] shadow-sm'
                      : 'bg-[#F8F9FC] border-[#EEEEEE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-black text-xs ${
                      idx === 0 ? 'text-[#FB7170] font-bold' : idx === 1 ? 'text-[#212542]' : 'text-[#9CA3AF]'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: house.color_hex }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#212542] flex items-center gap-1.5">
                        {house.name}
                        {isUserHouse && (
                          <span className="text-[9px] bg-[#DBDFFF] text-[#212542] px-1.5 py-0.2 rounded font-bold">
                            บ้านของคุณ
                          </span>
                        )}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-extrabold text-[#212542]">
                    {house.total_points} pts
                  </span>
                </div>
              );
            })}
        </div>
      </section>

      {/* 4. Gamified Missions List */}
      <section className="bg-white border border-[#EEEEEE] p-5 rounded-3xl shadow-[0_4px_20px_rgba(33,37,66,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#5867E8]" />
            <h3 className="text-sm font-extrabold text-[#212542]">Gamified Cohort Missions</h3>
          </div>
          <span className="text-[10px] text-[#212542] bg-[#DBDFFF] font-bold px-2 py-0.5 rounded-full">
            ภารกิจสะสมแต้ม
          </span>
        </div>

        <div className="space-y-3">
          {missions.map((mission) => {
            return (
              <div
                key={mission.id}
                className="bg-[#F8F9FC] border border-[#EEEEEE] rounded-2xl p-4 flex flex-col gap-3 hover:border-[#DBDFFF] transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#212542]">{mission.title}</h4>
                    <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[11px] font-extrabold text-[#FB7170] flex items-center gap-1 bg-[#FFD7D7] px-2 py-0.5 rounded-lg border border-[#FB7170]/30">
                      <Coins className="w-3 h-3" /> +{mission.reward_points}
                    </span>
                    <span className="text-[10px] font-bold text-[#5867E8] bg-[#DBDFFF] px-1.5 py-0.2 rounded">
                      +{mission.reward_xp} XP
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EEEEEE]">
                  {mission.status === 'APPROVED' ? (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติแต้มแล้ว
                    </span>
                  ) : mission.status === 'PENDING' ? (
                    <span className="text-[11px] text-[#FB7170] font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> รอแอดมินตรวจสอบรูป
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveMissionToUpload(mission)}
                      className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#212542] hover:bg-[#2d335a] text-white font-bold text-xs shadow-md shadow-[#212542]/20 transition active:scale-95 ml-auto"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#DBDFFF]" />
                      ส่งหลักฐานภาพถ่าย
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#212542]/60 backdrop-blur-md">
          <div className="bg-white border border-[#EEEEEE] w-full max-w-sm rounded-3xl p-5 relative shadow-2xl">
            <button
              onClick={() => setActiveMissionToUpload(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#6B7280] hover:text-[#212542] bg-[#F8F9FC]"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#212542] bg-[#DBDFFF] px-2.5 py-0.5 rounded-full mb-2 inline-block">
              Mission Submission
            </span>
            <h4 className="text-sm font-extrabold text-[#212542] mb-1">{activeMissionToUpload.title}</h4>
            <p className="text-xs text-[#6B7280] mb-4">{activeMissionToUpload.description}</p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Photo Input Picker */}
              <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#212542] rounded-2xl p-4 text-center cursor-pointer bg-[#F8F9FC] transition">
                {uploadedImagePreview ? (
                  <div className="relative">
                    <img
                      src={uploadedImagePreview}
                      alt="Preview"
                      className="w-full h-36 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImagePreview(null)}
                      className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-2">
                    <UploadCloud className="w-7 h-7 text-[#212542]" />
                    <span className="text-xs text-[#212542] font-bold">แตะเพื่อเลือกภาพจากกล้อง / Gallery</span>
                    <span className="text-[10px] text-[#9CA3AF]">รองรับไฟล์ JPG, PNG</span>
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
                <label className="block text-xs font-bold text-[#212542] mb-1">บันทึกข้อความหรือแท็กเพื่อน (ถ้ามี)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ถ่ายคู่กับพี่กิตติ House Pegasus"
                  className="w-full bg-[#F8F9FC] border border-[#EEEEEE] rounded-xl px-3.5 py-2.5 text-xs text-[#292929] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#212542]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#212542] hover:bg-[#2d335a] text-white font-bold text-xs transition shadow-md shadow-[#212542]/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันและส่งให้อนุมัติ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

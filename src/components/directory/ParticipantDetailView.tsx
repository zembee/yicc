'use client';

import React, { useState, useEffect } from 'react';
import { yftiParticipants } from '@/lib/mockData';
import { getParticipants } from '@/lib/dataService';
import { Participant } from '@/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Share2, 
  CheckCircle2
} from 'lucide-react';

interface ParticipantDetailViewProps {
  idOrSlug: string;
}

export const ParticipantDetailView: React.FC<ParticipantDetailViewProps> = ({ idOrSlug }) => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await getParticipants();
      const decodedParam = decodeURIComponent(idOrSlug).toLowerCase().trim();
      
      const found = all.find((p) => {
        const pId = String(p.id);
        const pNameThai = p.name_thai ? p.name_thai.toLowerCase().trim() : '';
        const pNickEng = p.nickname_eng ? p.nickname_eng.toLowerCase().trim() : '';
        const pSlug = (p.raw_meta as any)?.slug || '';
        
        return (
          pId === decodedParam ||
          pNameThai.replace(/\s+/g, '-') === decodedParam ||
          pNameThai.includes(decodedParam) ||
          (pNickEng && pNickEng === decodedParam) ||
          pSlug === decodedParam
        );
      });

      if (found) {
        setParticipant(found);
      } else {
        const numId = parseInt(decodedParam, 10);
        if (!isNaN(numId)) {
          const byId = all.find(p => p.id === numId);
          if (byId) setParticipant(byId);
        }
      }
      setLoading(false);
    }
    load();
  }, [idOrSlug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#1E2538] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลสมาชิก...</p>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-[#1E2538]">ไม่พบข้อมูลสมาชิก</h2>
        <p className="text-xs text-slate-500">ข้อมูลสมาชิกที่คุณค้นหาอาจถูกเปลี่ยนหรือย้ายตำแหน่ง</p>
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2538] text-white rounded-xl text-xs font-bold hover:bg-[#2B3550] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าทำเนียบธุรกิจ</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-16 animate-in fade-in duration-300">
      {/* 1. Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#1E2538] transition bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#FB7170]" />
          <span>กลับสู่หน้าทำเนียบธุรกิจ</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1E2538] bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">คัดลอกลิงก์แล้ว</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>แชร์โปรไฟล์</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Signature Slanted Hero Title Banner matching yfticonnect.com */}
      <div className="relative rounded-3xl bg-[#1E2538] text-white overflow-hidden shadow-xl p-6 sm:p-10 border border-[#2A334E]">
        {/* Slanted Accent polygon decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-[#262F47] hidden md:block" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }} />

        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FB7170] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              Young FTI ELITE 11
            </span>
            {participant.star_group_label && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15 text-[11px] font-bold">
                ⭐ {participant.star_group_label}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {participant.name_thai} {participant.nickname_eng ? `(${participant.nickname_eng})` : ''}
          </h1>

          {participant.company_name_thai && (
            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-[#FB7170]">
                <Building2 className="w-4 h-4" />
                {participant.company_name_thai}
              </span>
              {participant.industrial_groups_label && (
                <span className="text-slate-400">· {participant.industrial_groups_label}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Section 1: ข้อมูลส่วนตัว (Personal Information) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Portrait Photo */}
          <div className="md:col-span-4 lg:col-span-4 space-y-3">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-200/80 shadow-md">
              <img
                src={participant.profile_picture_url || 'https://yfticonnect.com/wp-content/uploads/2025/07/YFTI-11-Logo.webp'}
                alt={participant.name_thai}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + participant.name_thai;
                }}
              />
            </div>
            {participant.star_group_label && (
              <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
                <span className="text-[11px] text-indigo-500 font-bold block">ดวงดาวประจำตัว</span>
                <span className="text-base font-black text-indigo-900">{participant.star_group_label}</span>
              </div>
            )}
          </div>

          {/* Personal Attributes Grid */}
          <div className="md:col-span-8 lg:col-span-8 space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2538] border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FB7170]" />
              ข้อมูลส่วนตัว
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">ชื่อเล่น (ภาษาอังกฤษ) :</span>
                <p className="font-bold text-slate-900 text-base">{participant.nickname_eng || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">ชื่อ - นามสกุล (ภาษาไทย) :</span>
                <p className="font-bold text-slate-900 text-base">{participant.name_thai || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">ชื่อ - นามสกุล (ภาษาอังกฤษ) :</span>
                <p className="font-bold text-slate-900">{participant.fullname_eng || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">เบอร์โทรติดต่อ :</span>
                {participant.tel_number ? (
                  <a
                    href={`tel:${participant.tel_number}`}
                    className="font-bold text-[#FB7170] hover:underline flex items-center gap-1.5 font-mono text-base"
                  >
                    <Phone className="w-4 h-4" />
                    {participant.tel_number}
                  </a>
                ) : (
                  <p className="font-bold text-slate-400">-</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">ดาว :</span>
                <p className="font-bold text-slate-900">{participant.star_group_label || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">รุ่น :</span>
                <p className="font-bold text-slate-900">{participant.gen_label || 'YFTI 11'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section 2: ข้อมูลบริษัท (Company Information - Dark Navy Theme) matching yfticonnect.com */}
      <div className="rounded-3xl bg-[#1E2538] text-white p-6 sm:p-10 border border-[#2A334E] shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Company Logo Column */}
          <div className="md:col-span-4 lg:col-span-4 space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              ข้อมูลบริษัท
            </h2>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[160px] text-center">
              {participant.company_logo_url ? (
                <img
                  src={participant.company_logo_url}
                  alt={participant.company_name_thai || 'Company Logo'}
                  className="max-h-24 max-w-full object-contain filter drop-shadow"
                />
              ) : (
                <div className="space-y-2 text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto text-[#FB7170]" />
                  <p className="text-xs font-bold text-white">{participant.company_name_thai || 'องค์กรชั้นนำ'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Company Details Attributes Grid */}
          <div className="md:col-span-8 lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6 text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">คำนำหน้าบริษัท :</span>
                <p className="font-bold text-white">บริษัท จำกัด</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">ชื่อบริษัท (ภาษาไทย) :</span>
                <p className="font-bold text-white text-base">{participant.company_name_thai || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">ชื่อบริษัท (ภาษาอังกฤษ) :</span>
                <p className="font-bold text-slate-200">{participant.company_name_eng || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">กลุ่มอุตสาหกรรม :</span>
                <p className="font-bold text-[#FB7170]">{participant.industrial_groups_label || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">หมวดธุรกิจ :</span>
                <p className="font-bold text-slate-200">{participant.business_categories_label || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">ตำแหน่งในธุรกิจ :</span>
                <p className="font-bold text-white">{participant.business_position || '-'}</p>
              </div>

              {participant.founded_year && (
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-semibold block">ปีที่ก่อตั้ง (พ.ศ.) :</span>
                  <p className="font-bold text-white font-mono">{participant.founded_year}</p>
                </div>
              )}

              {participant.comp_tel_number && (
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-semibold block">เบอร์โทรศัพท์บริษัท :</span>
                  <p className="font-bold text-slate-200 font-mono">{participant.comp_tel_number}</p>
                </div>
              )}
            </div>

            {participant.company_address && (
              <div className="mt-6 pt-5 border-t border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FB7170] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">ที่ตั้งสำนักงาน :</span>
                  <p className="leading-relaxed">{participant.company_address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Section 3: Company Description */}
      {participant.company_description && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2538] border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB7170]" />
            Company Description
          </h2>
          <div 
            className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: participant.company_description }}
          />
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="text-center pt-4">
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1E2538] hover:bg-[#2B3550] text-white font-bold text-sm rounded-2xl shadow-lg transition"
        >
          <ArrowLeft className="w-4 h-4 text-[#FB7170]" />
          <span>กลับสู่หน้าทำเนียบธุรกิจ (Directory)</span>
        </Link>
      </div>
    </div>
  );
};

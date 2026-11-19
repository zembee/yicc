'use client';

import React, { useState, useEffect } from 'react';
import { getParticipants } from '@/lib/dataService';
import { Participant, CompanyInfo } from '@/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Share2, 
  CheckCircle2, 
  Globe, 
  Facebook, 
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  UserPlus,
  UserCheck
} from 'lucide-react';

interface ParticipantDetailViewProps {
  idOrSlug: string;
}

export const ParticipantDetailView: React.FC<ParticipantDetailViewProps> = ({ idOrSlug }) => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await getParticipants();
      const decodedParam = decodeURIComponent(idOrSlug).toLowerCase().trim();
      
      const found = all.find((p) => {
        const pId = String(p.id);
        const pNameThai = p.name_thai ? p.name_thai.toLowerCase().trim() : '';
        const pNickEng = p.nickname_eng ? p.nickname_eng.toLowerCase().trim() : '';
        const pSlug = p.slug ? decodeURIComponent(p.slug).toLowerCase().trim() : '';
        
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

  useEffect(() => {
    if (!participant || typeof window === 'undefined') return;
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('yfti_following_ids') || '[]');
      setIsFollowing(saved.includes(String(participant.id)));
    } catch {}
  }, [participant]);

  const handleToggleFollow = () => {
    if (!participant || typeof window === 'undefined') return;
    const pid = String(participant.id);
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('yfti_following_ids') || '[]');
      const next = isFollowing ? saved.filter((id) => id !== pid) : [...saved, pid];
      localStorage.setItem('yfti_following_ids', JSON.stringify(next));
      setIsFollowing(!isFollowing);
    } catch {
      setIsFollowing(!isFollowing);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] pb-24 fade-in-soft">
        <div className="bg-gradient-to-b from-[#181B34] via-[#212542] to-[#2B3054] pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b-[3px] border-[#FB7170]">
          <div className="max-w-6xl mx-auto flex flex-col items-center space-y-4 pt-6">
            <div className="h-7 w-52 rounded-lg skeleton-shimmer-dark" />
            <div className="h-5 w-24 rounded-md skeleton-shimmer-dark" />
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl skeleton-shimmer-dark" />
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-xl skeleton-shimmer-dark" />
              <div className="h-8 w-24 rounded-xl skeleton-shimmer-dark" />
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
            <div className="h-6 w-36 rounded-md skeleton-shimmer" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-full rounded-md skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-[#212542]">ไม่พบข้อมูลสมาชิก</h2>
        <p className="text-xs text-slate-500">ข้อมูลสมาชิกที่คุณค้นหาอาจถูกเปลี่ยนหรือย้ายตำแหน่ง</p>
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#212542] text-white rounded-xl text-xs font-bold hover:bg-[#2e335b] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าทำเนียบธุรกิจ</span>
        </Link>
      </div>
    );
  }

  // Build the list of companies (supports 1 or multiple companies per participant)
  const companiesList: CompanyInfo[] = (participant.companies && participant.companies.length > 0)
    ? participant.companies
    : [
        {
          company_prefix: participant.company_prefix || 'บริษัท จำกัด',
          company_name_thai: participant.company_name_thai,
          company_name_eng: participant.company_name_eng,
          founded_year: participant.founded_year,
          business_position: participant.business_position,
          industrial_groups: participant.industrial_groups,
          industrial_groups_label: participant.industrial_groups_label,
          business_categories: participant.business_categories,
          business_categories_label: participant.business_categories_label,
          company_description: participant.company_description,
          company_address: participant.company_address,
          comp_tel_number: participant.comp_tel_number,
          company_logo_url: participant.company_logo_url,
          website_url: participant.website_url,
          facebook_url: participant.facebook_url,
          line_id: participant.line_id,
          product_banner_url: participant.product_banner_url
        }
      ];

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-24 font-sans space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {copied && (
        <div className="fixed top-5 right-5 z-50 bg-[#212542] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>คัดลอกลิงก์โปรไฟล์เรียบร้อยแล้ว</span>
        </div>
      )}

      {/* 1. Header Banner (.elementor-element-1b044043) */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#161B2E] via-[#1E2538] to-[#252D46] text-white pt-6 pb-12 px-4 sm:px-6 lg:px-8 border-b-[3px] border-[#FB7170] shadow-[0_8px_28px_rgba(22,27,46,0.2)]">
        {/* Subtle Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(229,193,88,0.45) 0%, rgba(251,113,112,0.2) 55%, transparent 75%)',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto space-y-5">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-xl backdrop-blur-sm border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าทำเนียบธุรกิจ
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-xl transition backdrop-blur-sm border border-white/10"
            >
              <Share2 className="w-3.5 h-3.5" /> แชร์โปรไฟล์
            </button>
          </div>

          {/* Centered Name, Nickname, Portrait & Actions (.elementor-element-264882a) */}
          <div className="flex flex-col items-center text-center space-y-3.5 pt-1">
            <div className="space-y-0.5">
              <h1 className="text-2xl sm:text-4xl font-semibold text-white font-kanit tracking-tight leading-tight">
                {participant.name_thai}
              </h1>
              {participant.nickname_eng && (
                <h2 className="text-base sm:text-2xl font-normal text-slate-300 font-kanit">
                  ({participant.nickname_eng})
                </h2>
              )}
            </div>

            {/* Rounded-Square Portrait Photo with Overlapping Star Badge */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shadow-[0_10px_28px_rgba(0,0,0,0.35)] border-2 border-white/80 ring-4 ring-[#C59B38]/25">
                <img
                  src={participant.profile_picture_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp'}
                  alt={participant.name_thai}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + participant.name_thai;
                  }}
                />
              </div>
              {participant.star_group_label && (
                <span className="-mt-3 relative z-10 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#181E30] border border-[#E5C158]/50 text-[11px] font-bold text-[#E5C158] shadow-md">
                  ⭐ {participant.star_group_label}
                </span>
              )}
            </div>

            {/* Clean Minimal Following / Follower & Symmetric Action Buttons */}
            {(() => {
              const numId = Number(String(participant.id).replace(/\D/g, '')) || 100;
              const memberFollowingCount = 14 + (numId % 19);
              const memberFollowerCount = 21 + ((numId * 7) % 33) + (isFollowing ? 1 : 0);
              return (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="inline-flex items-center justify-center gap-4 text-xs text-slate-300 tabular-nums">
                    <span>
                      <strong className="text-white font-bold text-sm mr-1">{memberFollowingCount}</strong>
                      Following
                    </span>
                    <span className="h-3.5 w-px bg-white/20" aria-hidden="true" />
                    <span>
                      <strong className="text-white font-bold text-sm mr-1">{memberFollowerCount}</strong>
                      Follower
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 w-full max-w-[264px]">
                    <button
                      onClick={handleToggleFollow}
                      className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm ${
                        isFollowing
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-white text-[#1E2538] hover:bg-slate-100'
                      }`}
                    >
                      {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      <span>{isFollowing ? 'Following' : 'Follow'}</span>
                    </button>

                    <Link
                      href={`/chat/${participant.id}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#FB7170] hover:bg-[#fa5b5a] text-white text-xs font-bold transition shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat</span>
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick Tags Sub-bar (.elementor-element-41acba6d) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] sm:text-xs">
            {companiesList.map((comp, idx) => (
              <React.Fragment key={idx}>
                {comp.industrial_groups_label && (
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-slate-200 font-medium border border-white/10">
                    {comp.industrial_groups_label}
                  </span>
                )}
                {comp.business_categories_label && (
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-slate-200 font-medium border border-white/10">
                    {comp.business_categories_label}
                  </span>
                )}
                {comp.company_name_thai && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB7170]/15 text-[#FF9B9A] font-semibold border border-[#FB7170]/35">
                    <Building2 className="w-3.5 h-3.5 text-[#FB7170]" />
                    {comp.company_name_thai}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 space-y-6">
        {/* 2. Section 1: ข้อมูลส่วนตัว (Personal Information) */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(15,23,42,0.05)] border border-slate-200/70 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <img
              src="/images/icons/profile.webp"
              alt="Personal Info"
              className="w-10 h-10 rounded-xl shadow-sm shrink-0"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A7320] block">
                Personal Profile
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1E2538] font-kanit leading-tight">
                ข้อมูลส่วนตัว
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 text-[11px] font-semibold block">ชื่อ - นามสกุล (ภาษาไทย)</span>
              <div className="font-bold text-[#1E2538] text-sm sm:text-base">
                {participant.name_thai || '-'}
              </div>
            </div>

            <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 text-[11px] font-semibold block">ชื่อเล่น (ภาษาอังกฤษ)</span>
              <div className="font-bold text-[#1E2538] text-sm sm:text-base">
                {participant.nickname_eng || '-'}
              </div>
            </div>

            <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 text-[11px] font-semibold block">ชื่อ - นามสกุล (ภาษาอังกฤษ)</span>
              <div className="font-semibold text-slate-700 text-sm">
                {participant.fullname_eng || '-'}
              </div>
            </div>

            <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 text-[11px] font-semibold block">เบอร์โทรติดต่อ</span>
              <div>
                {participant.tel_number ? (
                  <a
                    href={`tel:${participant.tel_number}`}
                    className="font-bold text-[#FB7170] hover:underline inline-flex items-center gap-1.5 font-mono text-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {participant.tel_number}
                  </a>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </div>
            </div>

            <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 text-[11px] font-semibold block">ดาวประจำบ้าน</span>
              <div className="font-bold text-[#1E2538] text-sm">
                {participant.star_group_label || participant.star_group || '-'}
              </div>
            </div>

            <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 text-[11px] font-semibold block">รุ่นหลักสูตร</span>
              <div className="font-bold text-[#1E2538] text-sm">
                {participant.gen_label || 'YFTI 11'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Company Sections Loop (Handles 1 or Multiple Companies) */}
        {companiesList.map((company, index) => {
          const sectionTitle = index === 0 ? 'ข้อมูลบริษัท' : `ข้อมูลบริษัทที่ ${index + 1}`;
          
          return (
            <React.Fragment key={index}>
              {/* Company Info Box */}
              <div
                className="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(15,23,42,0.05)] border border-slate-200/70 space-y-5"
                data-id="548d8500"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <img
                    src="/images/icons/business.webp"
                    alt={sectionTitle}
                    className="w-10 h-10 rounded-xl shadow-sm shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A7320] block">
                      Company Profile
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-[#1E2538] font-kanit leading-tight">
                      {sectionTitle}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Compact Company Logo */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    <div className="w-full max-w-[180px] sm:max-w-[220px] aspect-square rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-4 flex items-center justify-center shadow-sm overflow-hidden">
                      {company.company_logo_url ? (
                        <img
                          src={company.company_logo_url}
                          alt={company.company_name_thai || sectionTitle}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center space-y-2 text-slate-300">
                          <Building2 className="w-14 h-14 mx-auto text-slate-300" />
                          <p className="text-xs font-semibold text-slate-400">{company.company_name_thai || 'โลโก้บริษัท'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Company Attributes Grid */}
                  <div className="md:col-span-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 text-[11px] font-semibold block">คำนำหน้าบริษัท</span>
                        <div className="font-bold text-[#1E2538] text-sm">
                          {company.company_prefix || 'บริษัท จำกัด'}
                        </div>
                      </div>

                      <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 text-[11px] font-semibold block">ชื่อบริษัท (ภาษาไทย)</span>
                        <div className="font-bold text-[#1E2538] text-sm">
                          {company.company_name_thai || '-'}
                        </div>
                      </div>

                      <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 text-[11px] font-semibold block">ชื่อบริษัท (ภาษาอังกฤษ)</span>
                        <div className="font-semibold text-slate-700 text-sm">
                          {company.company_name_eng || '-'}
                        </div>
                      </div>

                      <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 text-[11px] font-semibold block">กลุ่มอุตสาหกรรม</span>
                        <div className="font-bold text-[#FB7170] text-sm">
                          {company.industrial_groups_label || '-'}
                        </div>
                      </div>

                      <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 text-[11px] font-semibold block">หมวดธุรกิจ</span>
                        <div className="font-bold text-[#1E2538] text-sm">
                          {company.business_categories_label || '-'}
                        </div>
                      </div>

                      <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 text-[11px] font-semibold block">ตำแหน่งในธุรกิจ</span>
                        <div className="font-bold text-[#1E2538] text-sm">
                          {company.business_position || '-'}
                        </div>
                      </div>

                      <div className="space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/70 sm:col-span-2">
                        <span className="text-slate-400 text-[11px] font-semibold block">ปีที่ก่อตั้ง (พ.ศ.)</span>
                        <div className="font-bold text-[#1E2538] font-mono text-sm">
                          {company.founded_year || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Description, Address & Social Channels */}
              {(company.company_description || company.company_address || company.website_url || company.facebook_url || company.line_id || company.product_banner_url) && (
                <div
                  className="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(15,23,42,0.05)] border border-slate-200/70 space-y-6"
                  data-id="77a6feb0"
                >
                  {/* Company Description */}
                  {company.company_description && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="w-1 h-5 rounded-full bg-[#FB7170]" />
                        <h2 className="text-base sm:text-lg font-bold text-[#1E2538] font-kanit">
                          เกี่ยวกับธุรกิจ (Company Description)
                        </h2>
                      </div>
                      <div
                        className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: company.company_description }}
                      />
                    </div>
                  )}

                  {/* Address and Contact Channels */}
                  {(company.company_address || company.website_url || company.facebook_url || company.line_id || company.comp_tel_number) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      {company.company_address && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold text-[#1E2538] flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#FB7170]" />
                            <span>ที่อยู่บริษัท</span>
                          </h3>
                          <div className="whitespace-pre-line text-xs sm:text-sm text-slate-600 leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/70">
                            {company.company_address}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-[#1E2538] flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-[#B38728]" />
                          <span>ช่องทางติดต่อและติดตามบริษัท</span>
                        </h3>
                        <div className="space-y-2.5 bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/70 text-xs sm:text-sm">
                          {company.website_url && (
                            <div className="flex items-center gap-2.5 text-slate-700">
                              <Globe className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <a
                                href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline hover:text-[#FB7170] transition truncate"
                              >
                                {company.website_url}
                              </a>
                            </div>
                          )}
                          {company.facebook_url && (
                            <div className="flex items-center gap-2.5 text-slate-700">
                              <Facebook className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <span className="truncate">{company.facebook_url}</span>
                            </div>
                          )}
                          {company.line_id && (
                            <div className="flex items-center gap-2.5 text-slate-700">
                              <MessageCircle className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <span className="truncate">{company.line_id}</span>
                            </div>
                          )}
                          {company.comp_tel_number && (
                            <div className="flex items-center gap-2.5 text-slate-700">
                              <Phone className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <a href={`tel:${company.comp_tel_number}`} className="font-mono hover:underline hover:text-[#FB7170]">
                                {company.comp_tel_number}
                              </a>
                            </div>
                          )}
                          {!company.website_url && !company.facebook_url && !company.line_id && !company.comp_tel_number && (
                            <div className="flex items-center gap-2.5 text-slate-700">
                              <Building2 className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <span>{company.company_name_thai}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* สินค้าและบริการของบริษัท */}
                  {company.product_banner_url && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-5 rounded-full bg-[#C59B38]" />
                        <h3 className="text-base font-bold text-[#1E2538] font-kanit">
                          สินค้าและบริการของบริษัท
                        </h3>
                      </div>
                      <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200/70">
                        <img
                          src={company.product_banner_url}
                          alt="สินค้าและบริการของบริษัท"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* 4. Section 4: ค้นหาธุรกิจอื่นที่สนใจ */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E2538] font-kanit">
                ค้นหาธุรกิจอื่นที่สนใจ
              </h2>
              <p className="text-xs text-slate-500">สำรวจเครือข่ายสมาชิกตามกลุ่มอุตสาหกรรม</p>
            </div>
            <Link
              href="/directory"
              className="px-3 py-1.5 rounded-full bg-[#1E2538] hover:bg-[#2B3550] text-white text-[11px] font-bold inline-flex items-center gap-0.5 shrink-0 transition shadow-sm"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#FB7170]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { title_th: 'เทคโนโลยี', title_en: 'Technology', key: 'technology', iconSrc: '/images/icons/tech.webp' },
              { title_th: 'บริการ', title_en: 'Service', key: 'services', iconSrc: '/images/icons/services.webp' },
              { title_th: 'สินค้าอุปโภคบริโภค', title_en: 'Consumer Products', key: 'consumer_goods', iconSrc: '/images/icons/consumer.webp' },
              { title_th: 'สินค้าอุตสาหกรรม', title_en: 'Industrial Goods', key: 'industrial_goods', iconSrc: '/images/icons/industrial.webp' },
            ].map((cat) => (
              <Link
                key={cat.key}
                href={`/directory?industry=${cat.key}`}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:border-[#C59B38] transition-all duration-200 border border-slate-200/80 group hover:-translate-y-0.5 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <img
                    src={cat.iconSrc}
                    alt={cat.title_th}
                    loading="lazy"
                    className="w-11 h-11 rounded-xl shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <span className="p-1.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-[#1E2538] group-hover:text-white transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-[#1E2538] group-hover:text-[#B38728] transition-colors font-kanit">
                    {cat.title_th}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {cat.title_en}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

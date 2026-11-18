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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#212542] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลสมาชิก...</p>
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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {copied && (
        <div className="fixed top-5 right-5 z-50 bg-[#212542] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>คัดลอกลิงก์โปรไฟล์เรียบร้อยแล้ว</span>
        </div>
      )}

      {/* 1. Header Banner (.elementor-element-1b044043) */}
      <div className="bg-gradient-to-b from-[#181B34] via-[#212542] to-[#2B3054] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าทำเนียบธุรกิจ
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full transition backdrop-blur-sm"
            >
              <Share2 className="w-3.5 h-3.5" /> แชร์โปรไฟล์
            </button>
          </div>

          {/* Name & Nickname Heading (.elementor-element-264882a) */}
          <div className="space-y-2 pt-2">
            <h1 className="text-3xl sm:text-5xl font-semibold text-white font-kanit tracking-tight leading-tight">
              {participant.name_thai}
            </h1>
            {participant.nickname_eng && (
              <h2 className="text-2xl sm:text-4xl font-normal text-slate-300 font-kanit">
                ({participant.nickname_eng})
              </h2>
            )}

            {/* Following / Follower & Action Buttons (Follow + Chat) */}
            {(() => {
              const numId = Number(String(participant.id).replace(/\D/g, '')) || 100;
              const memberFollowingCount = 14 + (numId % 19);
              const memberFollowerCount = 21 + ((numId * 7) % 33) + (isFollowing ? 1 : 0);
              return (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="bg-white/10 px-3 py-1 rounded-full">
                      <strong className="text-white">{memberFollowingCount}</strong> Following
                    </span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">
                      <strong className="text-white">{memberFollowerCount}</strong> Follower
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <button
                      onClick={handleToggleFollow}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FB7170] hover:bg-[#fa5b5a] text-white text-xs font-bold transition shadow-sm"
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-xs sm:text-sm">
            {companiesList.map((comp, idx) => (
              <React.Fragment key={idx}>
                {comp.industrial_groups_label && (
                  <span className="px-3 py-1 rounded-full bg-white/15 text-white font-medium backdrop-blur-sm border border-white/10">
                    {comp.industrial_groups_label}
                  </span>
                )}
                {comp.business_categories_label && (
                  <span className="px-3 py-1 rounded-full bg-white/15 text-white font-medium backdrop-blur-sm border border-white/10">
                    {comp.business_categories_label}
                  </span>
                )}
                {comp.company_name_thai && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB7170]/20 text-[#FB7170] font-semibold border border-[#FB7170]/30 backdrop-blur-sm">
                    <Building2 className="w-3.5 h-3.5" />
                    {comp.company_name_thai}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* 2. Section 1: ข้อมูลส่วนตัว (Personal Information) (.elementor-element-1cab9997) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Portrait Photo (.elementor-element-4126a283) */}
            <div className="md:col-span-4 lg:col-span-4 flex flex-col items-center md:items-start space-y-3">
              <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 shadow-md border border-slate-200/80">
                <img
                  src={participant.profile_picture_url || '/images/participants/p_3296.jpg'}
                  alt={participant.name_thai}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + participant.name_thai;
                  }}
                />
              </div>
              {participant.star_group_label && (
                <div className="w-full max-w-[280px] sm:max-w-[320px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[11px] text-slate-500 font-medium">ดวงดาวประจำตัว</span>
                  <span className="text-sm font-bold text-[#212542] block">⭐ {participant.star_group_label}</span>
                </div>
              )}
            </div>

            {/* Right Column: Personal Info Table (.elementor-element-3b5c9361) */}
            <div className="md:col-span-8 lg:col-span-8 space-y-5">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#212542] font-kanit border-b border-slate-100 pb-3">
                ข้อมูลส่วนตัว
              </h2>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                  <span className="sm:col-span-5 font-semibold text-slate-500">ชื่อเล่น (ภาษาอังกฤษ) :</span>
                  <span className="sm:col-span-7 font-bold text-[#212542] text-sm sm:text-base">
                    {participant.nickname_eng || '-'}
                  </span>
                </div>

                <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                  <span className="sm:col-span-5 font-semibold text-slate-500">ชื่อ - นามสกุล (ภาษาไทย) :</span>
                  <span className="sm:col-span-7 font-bold text-[#212542] text-sm sm:text-base">
                    {participant.name_thai || '-'}
                  </span>
                </div>

                <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                  <span className="sm:col-span-5 font-semibold text-slate-500">ชื่อ - นามสกุล (ภาษาอังกฤษ) :</span>
                  <span className="sm:col-span-7 font-normal text-slate-700">
                    {participant.fullname_eng || '-'}
                  </span>
                </div>

                <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                  <span className="sm:col-span-5 font-semibold text-slate-500">เบอร์โทรติดต่อ :</span>
                  <span className="sm:col-span-7">
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
                  </span>
                </div>

                <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                  <span className="sm:col-span-5 font-semibold text-slate-500">ดาว :</span>
                  <span className="sm:col-span-7 font-semibold text-[#212542]">
                    {participant.star_group_label || participant.star_group || '-'}
                  </span>
                </div>

                <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                  <span className="sm:col-span-5 font-semibold text-slate-500">รุ่น :</span>
                  <span className="sm:col-span-7 font-semibold text-[#212542]">
                    {participant.gen_label || 'YFTI 11'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Company Sections Loop (Handles 1 or Multiple Companies) */}
        {companiesList.map((company, index) => {
          const sectionTitle = index === 0 ? 'ข้อมูลบริษัท' : `ข้อมูลบริษัทที่ ${index + 1}`;
          
          return (
            <React.Fragment key={index}>
              {/* Company Info Box (.elementor-element-548d8500) */}
              <div 
                className="elementor-element elementor-element-548d8500 bg-white rounded-2xl p-6 sm:p-8 shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] border border-slate-100 space-y-6"
                data-id="548d8500"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Heading & Logo (.elementor-element-31b4a25e) */}
                  <div className="md:col-span-4 lg:col-span-4 flex flex-col items-center md:items-start space-y-4">
                    <div className="elementor-element elementor-element-1fd2b44f w-full">
                      <h2 className="elementor-heading-title text-xl sm:text-2xl font-semibold text-[#212542] font-kanit">
                        {sectionTitle}
                      </h2>
                    </div>

                    {/* Company Logo Image (.elementor-element-6517c78b) */}
                    <div className="elementor-element elementor-element-6517c78b w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-xl bg-white border border-slate-200/80 p-4 flex items-center justify-center shadow-sm overflow-hidden">
                      {company.company_logo_url ? (
                        <img
                          src={company.company_logo_url}
                          alt={company.company_name_thai || sectionTitle}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center space-y-2 text-slate-300">
                          <Building2 className="w-16 h-16 mx-auto text-slate-300" />
                          <p className="text-xs font-semibold text-slate-400">{company.company_name_thai || 'โลโก้บริษัท'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Company Attributes Grid (.elementor-element-2ce6d1e8) */}
                  <div className="md:col-span-8 lg:col-span-8">
                    <div className="elementor-element elementor-element-2ce6d1e8 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs sm:text-sm">
                      {/* คำนำหน้าบริษัท */}
                      <div className="elementor-element elementor-element-546dfe2e space-y-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                        <span className="elementor-heading-title text-slate-500 text-[11px] font-semibold block">คำนำหน้าบริษัท</span>
                        <div className="jet-listing-dynamic-field__content font-bold text-[#212542] text-sm sm:text-base">
                          {company.company_prefix || 'บริษัท จำกัด'}
                        </div>
                      </div>

                      {/* ชื่อบริษัท (ภาษาไทย) */}
                      <div className="elementor-element elementor-element-f2e704f space-y-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                        <span className="elementor-heading-title text-slate-500 text-[11px] font-semibold block">ชื่อบริษัท (ภาษาไทย)</span>
                        <div className="jet-listing-dynamic-field__content font-bold text-[#212542] text-sm sm:text-base">
                          {company.company_name_thai || '-'}
                        </div>
                      </div>

                      {/* ชื่อบริษัท (ภาษาอังกฤษ) */}
                      <div className="elementor-element elementor-element-3aef0d6a space-y-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                        <span className="elementor-heading-title text-slate-500 text-[11px] font-semibold block">ชื่อบริษัท  (ภาษาอังกฤษ)</span>
                        <div className="jet-listing-dynamic-field__content font-bold text-slate-700 text-sm sm:text-base">
                          {company.company_name_eng || '-'}
                        </div>
                      </div>

                      {/* กลุ่มอุตสหกรรม */}
                      <div className="elementor-element elementor-element-47426508 space-y-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                        <span className="elementor-heading-title text-slate-500 text-[11px] font-semibold block">กลุ่มอุตสหกรรม</span>
                        <div className="jet-listing-dynamic-field__content font-bold text-[#FB7170] text-sm sm:text-base">
                          {company.industrial_groups_label || '-'}
                        </div>
                      </div>

                      {/* หมวดธุรกิจ */}
                      <div className="elementor-element elementor-element-c69cf60 space-y-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                        <span className="elementor-heading-title text-slate-500 text-[11px] font-semibold block">หมวดธุรกิจ</span>
                        <div className="jet-listing-dynamic-field__content font-bold text-[#212542] text-sm sm:text-base">
                          {company.business_categories_label || '-'}
                        </div>
                      </div>

                      {/* ตำแหน่งในธุรกิจ */}
                      <div className="elementor-element elementor-element-1a3fc8d6 space-y-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                        <span className="elementor-heading-title text-slate-500 text-[11px] font-semibold block">ตำแหน่งในธุรกิจ</span>
                        <div className="jet-listing-dynamic-field__content font-bold text-[#212542] text-sm sm:text-base">
                          {company.business_position || '-'}
                        </div>
                      </div>

                      {/* ปีที่ก่อตั้ง (พ.ศ.) */}
                      <div className="elementor-element elementor-element-4f5195bb space-y-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 sm:col-span-2">
                        <span className="elementor-heading-title text-slate-500 text-[11px] font-semibold block">ปีที่ก่อตั้ง (พ.ศ.)</span>
                        <div className="jet-listing-dynamic-field__content font-bold text-[#212542] font-mono text-sm sm:text-base">
                          {company.founded_year || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Description, Address & Social Channels (.elementor-element-77a6feb0) */}
              {(company.company_description || company.company_address || company.website_url || company.facebook_url || company.line_id || company.product_banner_url) && (
                <div 
                  className="elementor-element elementor-element-77a6feb0 bg-white rounded-2xl p-6 sm:p-8 shadow-[0px_4px_16px_2px_rgba(0,0,0,0.08)] border border-slate-100 space-y-8"
                  data-id="77a6feb0"
                >
                  {/* Company Description (.elementor-element-65e0bdf1) */}
                  {company.company_description && (
                    <div className="elementor-element elementor-element-65e0bdf1 space-y-3">
                      <div className="elementor-element elementor-element-169eafbb">
                        <h2 className="elementor-heading-title text-xl sm:text-2xl font-semibold text-[#212542] font-kanit border-b border-slate-100 pb-3">
                          Company Description
                        </h2>
                      </div>
                      <div 
                        className="elementor-element elementor-element-18559d76 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: company.company_description }}
                      />
                    </div>
                  )}

                  {/* Address and Contact Channels (.elementor-element-13abf543) */}
                  {(company.company_address || company.website_url || company.facebook_url || company.line_id || company.comp_tel_number) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      {/* ที่อยู่บริษัท (.elementor-element-5eb3a4fb) */}
                      {company.company_address && (
                        <div className="elementor-element elementor-element-5eb3a4fb space-y-2">
                          <div className="elementor-element elementor-element-7b99cb31">
                            <h2 className="elementor-heading-title text-lg font-semibold text-[#212542] font-kanit">
                              ที่อยู่บริษัท
                            </h2>
                          </div>
                          <div className="elementor-element elementor-element-167c1eca whitespace-pre-line text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {company.company_address}
                          </div>
                        </div>
                      )}

                      {/* ช่องทางติดต่อและติดตามบริษัท (.elementor-element-6f5dec76) */}
                      <div className="elementor-element elementor-element-6f5dec76 space-y-2">
                        <div className="elementor-element elementor-element-b2bcdf4">
                          <h2 className="elementor-heading-title text-lg font-semibold text-[#212542] font-kanit">
                            ช่องทางติดต่อและติดตามบริษัท
                          </h2>
                        </div>
                        <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm">
                          {company.website_url && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Globe className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <a 
                                href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline hover:text-[#FB7170] transition"
                              >
                                {company.website_url}
                              </a>
                            </div>
                          )}
                          {company.facebook_url && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Facebook className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <span>{company.facebook_url}</span>
                            </div>
                          )}
                          {company.line_id && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <MessageCircle className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <span>{company.line_id}</span>
                            </div>
                          )}
                          {company.comp_tel_number && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Phone className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <a href={`tel:${company.comp_tel_number}`} className="font-mono hover:underline hover:text-[#FB7170]">
                                {company.comp_tel_number}
                              </a>
                            </div>
                          )}
                          {!company.website_url && !company.facebook_url && !company.line_id && !company.comp_tel_number && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Building2 className="w-4 h-4 text-[#FB7170] shrink-0" />
                              <span>{company.company_name_thai}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* สินค้าและบริการของบริษัท (.elementor-element-62f5df53) */}
                  {company.product_banner_url && (
                    <div className="elementor-element elementor-element-62f5df53 space-y-3 pt-4 border-t border-slate-100">
                      <div className="elementor-element elementor-element-2072ba21">
                        <h2 className="elementor-heading-title text-lg font-semibold text-[#212542] font-kanit">
                          สินค้าและบริการของบริษัท
                        </h2>
                      </div>
                      <div className="elementor-element elementor-element-5ddb0e83 rounded-xl overflow-hidden shadow-sm border border-slate-100">
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

        {/* 4. Section 4: ค้นหาธุรกิจอื่นที่สนใจ (.elementor-element-4df330d4) */}
        <div className="elementor-element elementor-element-4df330d4 pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-[#212542] font-kanit">
              ค้นหาธุรกิจอื่นที่สนใจ
            </h2>
            <Link
              href="/directory"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#FB7170] hover:text-[#e05655] transition"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title_th: 'เทคโนโลยี', title_en: 'Technology', key: 'technology', color: 'from-blue-500/10 to-indigo-500/10' },
              { title_th: 'บริการ', title_en: 'Service', key: 'services', color: 'from-emerald-500/10 to-teal-500/10' },
              { title_th: 'สินค้าอุปโภคบริโภค', title_en: 'Consumer Products', key: 'consumer_goods', color: 'from-rose-500/10 to-orange-500/10' },
              { title_th: 'สินค้าอุตสาหกรรม', title_en: 'Industrial Goods', key: 'industrial_goods', color: 'from-amber-500/10 to-yellow-500/10' },
            ].map((cat) => (
              <Link
                key={cat.key}
                href={`/directory?industry=${cat.key}`}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/80 group hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[#212542] group-hover:text-[#FB7170] transition-colors font-kanit">
                    {cat.title_th}
                  </h3>
                  <h4 className="text-xs text-slate-400">
                    {cat.title_en}
                  </h4>
                </div>
                <div className="pt-4 flex items-center justify-end">
                  <span className="p-1.5 rounded-full bg-slate-100 group-hover:bg-[#FB7170] group-hover:text-white transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { getParticipants } from '@/lib/dataService';
import { Participant, CompanyInfo } from '@/types';
import Link from 'next/link';
import { PhotoLightbox } from '@/components/ui/PhotoLightbox';
import { InfoCard, InfoGrid, InfoRow } from '@/components/ui/InfoCard';
import { ParticipantDetailSkeleton } from '@/components/ui/PageSkeletons';
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
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

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
    return <ParticipantDetailSkeleton />;
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
    <div className="bg-[#F6F4EF] text-[#161C2C] pb-4 animate-in fade-in duration-300">
      <PhotoLightbox
        isOpen={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        src={participant.profile_picture_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp'}
        alt={participant.name_thai}
        caption={participant.name_thai}
      />

      {/* Toast Notification */}
      {copied && (
        <div className="fixed top-5 right-5 z-50 bg-[#0D1321] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#ECD28E]" />
          <span>คัดลอกลิงก์โปรไฟล์เรียบร้อยแล้ว</span>
        </div>
      )}

      {/* 1. Refined Obsidian Executive Header (Scrolls naturally with page) */}
      <section className="relative overflow-hidden luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 lg:px-8 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)]">
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Top Bar: Back & Share */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/directory"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-full backdrop-blur-md transition"
            >
              <ArrowLeft className="w-4 h-4 text-[#ECD28E]" /> ทำเนียบธุรกิจ
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-full backdrop-blur-md transition"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ECD28E]" /> แชร์โปรไฟล์
            </button>
          </div>

          {/* Centered Executive Portrait & Identity */}
          <div className="flex flex-col items-center text-center space-y-3.5 pt-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPhotoOpen(true)}
                aria-label="ดูรูปเต็มจอ"
                className="block w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#0D1321] ring-2 ring-[#ECD28E]/50 shadow-[0_12px_30px_rgba(0,0,0,0.4)] cursor-zoom-in hover:ring-[#ECD28E] transition"
              >
                <img
                  src={participant.profile_picture_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp'}
                  alt={participant.name_thai}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + participant.name_thai;
                  }}
                />
              </button>
              {participant.star_group_label && (
                <span className="-mt-3 relative z-10 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#0D1321] text-[10px] font-bold text-[#ECD28E] shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ECD28E]" />
                  {participant.star_group_label}
                </span>
              )}
            </div>

            <div className="space-y-1 max-w-lg">
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {participant.name_thai}
                {participant.nickname_eng && (
                  <span className="text-base sm:text-xl font-medium text-slate-300 ml-1.5">
                    ({participant.nickname_eng})
                  </span>
                )}
              </h1>

              {companiesList[0]?.company_name_thai && (
                <p className="text-xs sm:text-sm font-semibold text-[#ECD28E] flex items-center justify-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{companiesList[0].company_name_thai}</span>
                </p>
              )}
              {companiesList[0]?.industrial_groups_label && (
                <p className="text-[11px] sm:text-xs text-slate-300">
                  {companiesList[0].industrial_groups_label}
                </p>
              )}
            </div>

            {/* Following / Follower & Action Buttons */}
            {(() => {
              const numId = Number(String(participant.id).replace(/\D/g, '')) || 100;
              const memberFollowingCount = 14 + (numId % 19);
              const memberFollowerCount = 21 + ((numId * 7) % 33) + (isFollowing ? 1 : 0);
              return (
                <div className="flex flex-col items-center gap-3 w-full pt-1">
                  <div className="inline-flex items-center gap-4 text-xs text-slate-300 tabular-nums">
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

                  <div className="flex items-center gap-2.5 w-full max-w-[260px]">
                    <button
                      onClick={handleToggleFollow}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold transition ${
                        isFollowing
                          ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                          : 'bg-white/12 hover:bg-white/20 backdrop-blur-sm text-white'
                      }`}
                    >
                      {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5 text-[#ECD28E]" />}
                      <span>{isFollowing ? 'Following' : 'Follow'}</span>
                    </button>

                    <Link
                      href={`/chat/${participant.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full luxury-gold-btn text-xs font-bold transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Warm Ivory Content Sheet */}
      <div className="relative z-10 pt-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-5">
        {/* 2. ข้อมูลส่วนตัว */}
        <InfoCard eyebrow="Personal Profile" title="ข้อมูลส่วนตัว" iconSrc="/images/icons/profile.webp?v=2">
          <InfoGrid>
            <InfoRow label="ชื่อ - นามสกุล (ไทย)" wide>{participant.name_thai || '-'}</InfoRow>
            <InfoRow label="ชื่อเล่น">{participant.nickname_eng || '-'}</InfoRow>
            <InfoRow label="รุ่นหลักสูตร">{participant.gen_label || 'YFTI 11'}</InfoRow>
            <InfoRow label="ชื่อ - นามสกุล (อังกฤษ)" wide>{participant.fullname_eng || '-'}</InfoRow>
            <InfoRow label="เบอร์โทรติดต่อ" mono accent>
              {participant.tel_number ? (
                <a href={`tel:${participant.tel_number}`} className="hover:underline">
                  {participant.tel_number}
                </a>
              ) : (
                '-'
              )}
            </InfoRow>
            <InfoRow label="ดาวประจำบ้าน">{participant.star_group_label || participant.star_group || '-'}</InfoRow>
          </InfoGrid>
        </InfoCard>

        {/* 3. Company Sections Loop (Handles 1 or Multiple Companies) */}
        {companiesList.map((company, index) => {
          const sectionTitle = index === 0 ? 'ข้อมูลบริษัท' : `ข้อมูลบริษัทที่ ${index + 1}`;
          
          return (
            <React.Fragment key={index}>
              {/* Company Info Box (Borderless) */}
              <div
                className="bg-white rounded-[24px] p-5 sm:p-7 shadow-[0_6px_22px_rgba(13,19,33,0.055)] space-y-5"
                data-id="548d8500"
              >
                <div className="flex items-center gap-3 border-b border-[#F1ECE2] pb-4">
                  <img
                    src="/images/icons/business.webp?v=2"
                    alt={sectionTitle}
                    className="w-10 h-10 object-contain shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A742B] block">
                      Company Profile
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#161C2C] leading-tight">
                      {sectionTitle}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-3 flex flex-col items-center pt-3">
                    <div className="w-full max-w-[140px] md:max-w-none aspect-square rounded-2xl bg-[#F6F4EF] p-4 flex items-center justify-center overflow-hidden">
                      {company.company_logo_url ? (
                        <img
                          src={company.company_logo_url}
                          alt={company.company_name_thai || sectionTitle}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-9">
                    <InfoGrid>
                      <InfoRow label="คำนำหน้าบริษัท">{company.company_prefix || 'บริษัท จำกัด'}</InfoRow>
                      <InfoRow label="ปีที่ก่อตั้ง (พ.ศ.)" mono>{company.founded_year || '-'}</InfoRow>
                      <InfoRow label="ชื่อบริษัท (ไทย)" wide>{company.company_name_thai || '-'}</InfoRow>
                      <InfoRow label="ชื่อบริษัท (อังกฤษ)" wide>{company.company_name_eng || '-'}</InfoRow>
                      <InfoRow label="กลุ่มอุตสาหกรรม" accent>{company.industrial_groups_label || '-'}</InfoRow>
                      <InfoRow label="หมวดธุรกิจ">{company.business_categories_label || '-'}</InfoRow>
                      <InfoRow label="ตำแหน่งในธุรกิจ" wide>{company.business_position || '-'}</InfoRow>
                    </InfoGrid>
                  </div>
                </div>
              </div>

              {/* Company Description, Address & Social Channels (Borderless) */}
              {(company.company_description || company.company_address || company.website_url || company.facebook_url || company.line_id || company.product_banner_url) && (
                <div
                  className="bg-white rounded-[24px] p-5 sm:p-7 shadow-[0_6px_22px_rgba(13,19,33,0.055)] space-y-6"
                  data-id="77a6feb0"
                >
                  {/* Company Description */}
                  {company.company_description && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-[#F1ECE2] pb-3">
                        <span className="w-1 h-5 rounded-full bg-[#C5A059]" />
                        <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#F1ECE2]">
                      {company.company_address && (
                        <div className="space-y-2">
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9A742B] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>ที่อยู่บริษัท</span>
                          </h3>
                          <p className="whitespace-pre-line text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {company.company_address}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9A742B] flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          <span>ช่องทางติดต่อ</span>
                        </h3>
                        <div className="divide-y divide-[#F1ECE2] text-xs sm:text-sm">
                          {company.website_url && (
                            <div className="flex items-center gap-2.5 py-2 text-[#161C2C]">
                              <Globe className="w-4 h-4 text-[#B18A3B] shrink-0" />
                              <a
                                href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline hover:text-[#9A742B] transition truncate"
                              >
                                {company.website_url}
                              </a>
                            </div>
                          )}
                          {company.facebook_url && (
                            <div className="flex items-center gap-2.5 py-2 text-[#161C2C]">
                              <Facebook className="w-4 h-4 text-[#B18A3B] shrink-0" />
                              <span className="truncate">{company.facebook_url}</span>
                            </div>
                          )}
                          {company.line_id && (
                            <div className="flex items-center gap-2.5 py-2 text-[#161C2C]">
                              <MessageCircle className="w-4 h-4 text-[#B18A3B] shrink-0" />
                              <span className="truncate">{company.line_id}</span>
                            </div>
                          )}
                          {company.comp_tel_number && (
                            <div className="flex items-center gap-2.5 py-2 text-[#161C2C]">
                              <Phone className="w-4 h-4 text-[#B18A3B] shrink-0" />
                              <a href={`tel:${company.comp_tel_number}`} className="font-mono hover:underline hover:text-[#9A742B]">
                                {company.comp_tel_number}
                              </a>
                            </div>
                          )}
                          {!company.website_url && !company.facebook_url && !company.line_id && !company.comp_tel_number && (
                            <div className="flex items-center gap-2.5 py-2 text-[#161C2C]">
                              <Building2 className="w-4 h-4 text-[#B18A3B] shrink-0" />
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

        {/* 4. Explore other businesses */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C]">
                ค้นหาธุรกิจอื่นที่สนใจ
              </h2>
              <p className="text-xs text-slate-500">สำรวจเครือข่ายสมาชิกตามกลุ่มอุตสาหกรรม</p>
            </div>
            <Link
              href="/directory"
              className="text-xs font-bold text-[#9A742B] hover:text-[#161C2C] inline-flex items-center gap-1 shrink-0 transition"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { title_th: 'เทคโนโลยี', title_en: 'Technology', key: 'technology', iconSrc: '/images/icons/tech.webp?v=2' },
              { title_th: 'บริการ', title_en: 'Service', key: 'services', iconSrc: '/images/icons/services.webp?v=2' },
              { title_th: 'สินค้าอุปโภคบริโภค', title_en: 'Consumer Products', key: 'consumer_goods', iconSrc: '/images/icons/consumer.webp?v=2' },
              { title_th: 'สินค้าอุตสาหกรรม', title_en: 'Industrial Goods', key: 'industrial_goods', iconSrc: '/images/icons/industrial.webp?v=2' },
            ].map((cat) => (
              <Link
                key={cat.key}
                href={`/directory?industry=${cat.key}`}
                className="bg-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(13,19,33,0.055)] hover:shadow-[0_12px_28px_rgba(13,19,33,0.1)] hover:-translate-y-0.5 transition-all duration-200 group flex flex-col gap-3"
              >
                <img
                  src={cat.iconSrc}
                  alt={cat.title_th}
                  loading="lazy"
                  className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
                />
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#161C2C] group-hover:text-[#9A742B] transition-colors">
                    {cat.title_th}
                  </h3>
                  <p className="text-[11px] text-slate-400">{cat.title_en}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

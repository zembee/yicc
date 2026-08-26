'use client';

import React, { useState, useEffect } from 'react';
import { useLiffAuth } from '@/contexts/LiffContext';
import { mockHouses, mockMissions, mockEvents, mockNews, mockGalleryImages } from '@/lib/mockData';
import { Mission, EventItem, NewsItem } from '@/types';
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
  ChevronLeft,
  ShieldCheck,
  Calendar,
  Building2,
  Users,
  ArrowRight,
  Layers
} from 'lucide-react';
import Link from 'next/link';

const INDUSTRY_SECTORS = [
  { id: 'tech', nameTh: 'เทคโนโลยี', nameEn: 'Technology', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80', query: 'เทคโนโลยี' },
  { id: 'service', nameTh: 'บริการ', nameEn: 'Service', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80', query: 'บริการ' },
  { id: 'consumer', nameTh: 'สินค้าอุปโภคบริโภค', nameEn: 'Consumer Products', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80', query: 'สินค้าอุปโภคบริโภค' },
  { id: 'industrial', nameTh: 'สินค้าอุตสาหกรรม', nameEn: 'Industrial Goods', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80', query: 'สินค้าอุตสาหกรรม' },
  { id: 'agri', nameTh: 'การเกษตร / อาหาร', nameEn: 'Agriculture / Food', img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80', query: 'เกษตร' },
  { id: 'construct', nameTh: 'การก่อสร้าง', nameEn: 'Real Estate / Construction', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80', query: 'ก่อสร้าง' },
  { id: 'resources', nameTh: 'ทรัพยากร', nameEn: 'Resources', img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&auto=format&fit=crop&q=80', query: 'ทรัพยากร' },
  { id: 'finance', nameTh: 'ธุรกิจการเงิน / ลงทุน', nameEn: 'Financials / Investment', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80', query: 'การเงิน' },
];

const HERO_SLIDES = [
  {
    image: 'https://yfticonnect.com/wp-content/uploads/2026/05/Young-FTI-11-477-scaled.jpg',
    caption: 'Young FTI ELITE รุ่นที่ 11',
    subtitle: 'ทำเนียบผู้นำอุตสาหกรรมรุ่นใหม่'
  },
  {
    image: 'https://yfticonnect.com/wp-content/uploads/2026/05/Y11_04042025_284-scaled.jpg',
    caption: 'พิธีเปิดและสัมมนาผู้นำระดับชาติ',
    subtitle: 'Industrial Transformation & Sustainable Growth'
  },
  {
    image: 'https://yfticonnect.com/wp-content/uploads/2026/05/Maldives-Davilsnap-Day2-3_461-scaled.jpg',
    caption: 'Y11 Friendship Trip @ Maldives',
    subtitle: 'สานสัมพันธ์เครือข่ายธุรกิจระดับสากล'
  }
];

export default function AcademyPage() {
  const { profile, isLoading } = useLiffAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [activeMissionToUpload, setActiveMissionToUpload] = useState<Mission | null>(null);
  const [note, setNote] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto carousel rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-9 h-9 border-3 border-[#1E2538] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const attendance = profile?.attendance_rate ?? 92;
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
    <div className="space-y-10 sm:space-y-14">
      {/* 1. Hero Image Slider Carousel matching yfticonnect.com */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 border border-slate-200 aspect-[16/9] sm:aspect-[21/9] max-h-[520px]">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.caption}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E2538]/90 via-[#1E2538]/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
              <span className="inline-block px-3 py-1 bg-[#FB7170] text-white text-[11px] sm:text-xs font-bold rounded-full w-fit mb-2 uppercase tracking-wider shadow-sm">
                Young FTI ELITE 11
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black leading-tight drop-shadow-md">
                {slide.caption}
              </h2>
              <p className="text-xs sm:text-base text-slate-200 font-medium mt-1 drop-shadow">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Slide navigation buttons */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-6 bg-[#FB7170]' : 'w-2 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Main Title & Slogan matching yfticonnect.com */}
      <section className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E2538] tracking-tight">
          Young FTI ELITE 11
        </h1>
        <p className="text-base sm:text-xl font-bold text-[#FB7170]">
          หลักสูตรนักอุตสาหกรรมรุ่นใหม่
        </p>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto pt-1">
          สภาอุตสาหกรรมแห่งประเทศไทย (ส.อ.ท.) — แพลตฟอร์มเชื่อมโยงเครือข่ายธุรกิจ และยกระดับศักยภาพผู้บริหารสู่อนาคต
        </p>
      </section>

      {/* 3. Member Quick Attendance & Gamification Overview Banner */}
      <section className="bg-gradient-to-r from-[#1E2538] to-[#2B3550] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700/50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Col 1: Attendance info */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#DBDFFF] text-xs font-bold tracking-wide border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FB7170]" />
              สถานะการเข้าเรียนและคะแนน
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl sm:text-4xl font-black ${attendance >= 80 ? 'text-[#DBDFFF]' : 'text-[#FB7170]'}`}>
                  {attendance}%
                </span>
                <span className="text-xs text-slate-300 font-medium">(เกณฑ์ขั้นต่ำ 80%)</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {attendance >= 80 ? '✓ ผ่านเกณฑ์รับวุฒิบัตรและปลดล็อก Masterclass' : '⚠️ จำเป็นต้องเข้าเรียนเพิ่มเพื่อรับวุฒิบัตร'}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/15 rounded-full h-3 p-0.5">
              <div
                className="h-full rounded-full bg-[#FB7170] transition-all duration-700"
                style={{ width: `${Math.min(100, attendance)}%` }}
              />
            </div>
          </div>

          {/* Col 2: Points & XP Stats */}
          <div className="grid grid-cols-2 gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-[#FB7170]" />
                Points สะสม
              </span>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">
                {profile?.points_balance ?? 450}
              </p>
              <p className="text-[10px] text-slate-400">ใช้แลกของรางวัล</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#DBDFFF]" />
                XP ประจำรุ่น
              </span>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">
                {profile?.xp_balance ?? 1820}
              </p>
              <p className="text-[10px] text-slate-400">ระดับ Executive</p>
            </div>
          </div>

          {/* Col 3: Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
            <Link
              href="/directory"
              className="flex-1 py-3 px-4 bg-[#FB7170] hover:bg-[#e85857] text-white font-bold text-xs sm:text-sm rounded-xl text-center shadow-md transition flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>ค้นหาทำเนียบรุ่น (122 ท่าน)</span>
            </Link>
            <Link
              href="/events"
              className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm rounded-xl text-center transition flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#FB7170]" />
              <span>ดูกิจกรรม & เช็คอิน</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. กิจกรรมโครงการ (Project Events) matching yfticonnect.com */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2538] tracking-tight">
              กิจกรรมโครงการ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              การจัดอบรม สัมมนาเชิงปฏิบัติการ และกิจกรรมสร้างเครือข่ายสัมพันธ์
            </p>
          </div>
          <Link
            href="/events"
            className="text-xs sm:text-sm font-bold text-[#FB7170] hover:text-[#e85857] flex items-center gap-1 transition"
          >
            <span>ดูกิจกรรมทั้งหมด</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {mockEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FB7170]" />
                    {new Date(event.start_time).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    +{event.reward_points} pts
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-[#1E2538] group-hover:text-[#FB7170] transition-colors leading-snug line-clamp-2 mb-2">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate max-w-[180px]">📍 {event.location_name}</span>
                <Link
                  href="/events"
                  className="font-bold text-[#1E2538] hover:text-[#FB7170] flex items-center gap-0.5 shrink-0"
                >
                  <span>รายละเอียด</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ข่าวสารโครงการ (News & Announcements) matching yfticonnect.com */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2538] tracking-tight">
              ข่าวสารโครงการ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              ข่าวประชาสัมพันธ์ บทความ และความเคลื่อนไหวในแวดวงอุตสาหกรรม
            </p>
          </div>
          <Link
            href="/news"
            className="text-xs sm:text-sm font-bold text-[#FB7170] hover:text-[#e85857] flex items-center gap-1 transition"
          >
            <span>ดูข่าวสารทั้งหมด</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockNews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-[#1E2538]/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    📅 {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-[#1E2538] group-hover:text-[#FB7170] transition-colors leading-snug line-clamp-2 mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-2">
                    {item.summary}
                  </p>
                </div>
                <Link
                  href="/news"
                  className="text-xs font-bold text-[#1E2538] group-hover:text-[#FB7170] flex items-center gap-1 pt-2 border-t border-slate-100"
                >
                  <span>อ่านต่อ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. บรรยากาศกิจกรรม (Activity Gallery) matching yfticonnect.com */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2538] tracking-tight">
            บรรยากาศกิจกรรม
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ภาพประทับใจและความทรงจำของครอบครัว Young FTI ELITE 11
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {mockGalleryImages.slice(0, 8).map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-slate-200 bg-slate-100"
            >
              <img
                src={img}
                alt={`บรรยากาศ ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Sparkles className="w-6 h-6 text-[#FB7170]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. ธุรกิจที่เกี่ยวข้อง (8 Industry Sectors) matching yfticonnect.com */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2538] tracking-tight">
              ธุรกิจที่เกี่ยวข้อง
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              หมวดหมู่อุตสาหกรรมหลักของสมาชิกในโครงการ
            </p>
          </div>
          <Link
            href="/directory"
            className="text-xs sm:text-sm font-bold text-[#FB7170] hover:text-[#e85857] flex items-center gap-1 transition"
          >
            <span>ดูทำเนียบธุรกิจ</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {INDUSTRY_SECTORS.map((sector) => (
            <Link
              key={sector.id}
              href={`/directory?industry=${encodeURIComponent(sector.query)}`}
              className="relative aspect-[16/10] rounded-2xl overflow-hidden group border border-slate-200 shadow-sm flex flex-col justify-end p-3.5 transition hover:shadow-md"
            >
              <img
                src={sector.img}
                alt={sector.nameTh}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2538]/95 via-[#1E2538]/60 to-black/20" />
              <div className="relative z-10 text-white">
                <h3 className="font-black text-xs sm:text-sm tracking-tight leading-tight group-hover:text-[#FB7170] transition-colors">
                  {sector.nameTh}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-300 font-medium">
                  {sector.nameEn}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. House Ranking Leaderboard (9 Constellations) & Missions Gamification */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#1E2538] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>House Leaderboard (9 ดวงดาว)</span>
            </h2>
            <p className="text-xs text-slate-500">ตารางคะแนนรวมและอันดับการร่วมกิจกรรมประจำรุ่น YFTI 11</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full w-fit">
            อัปเดตแบบเรียลไทม์
          </span>
        </div>

        {/* 9 Constellations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {mockHouses.sort((a, b) => b.total_points - a.total_points).map((house, rank) => (
            <div
              key={house.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                rank === 0
                  ? 'bg-amber-50/70 border-amber-200'
                  : rank === 1
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  rank === 0 ? 'bg-amber-400 text-white' : rank === 1 ? 'bg-slate-400 text-white' : rank === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  #{rank + 1}
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-[#1E2538]">{house.name}</p>
                  <p className="text-[10px] text-slate-400">House Group</p>
                </div>
              </div>
              <span className="font-mono font-black text-xs sm:text-sm text-[#1E2538]">
                {house.total_points} pts
              </span>
            </div>
          ))}
        </div>

        {/* Executive Missions Section */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-[#1E2538] mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FB7170]" />
            ภารกิจสะสมแต้มประจำสัปดาห์
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-xs text-[#1E2538]">{mission.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      +{mission.reward_points} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {mission.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  {mission.status === 'APPROVED' ? (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติแล้ว
                    </span>
                  ) : mission.status === 'PENDING' ? (
                    <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> รอตรวจ
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveMissionToUpload(mission)}
                      className="text-xs font-bold text-[#FB7170] hover:underline flex items-center gap-1"
                    >
                      <UploadCloud className="w-3.5 h-3.5" /> ส่งหลักฐาน
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Mission Modal */}
      {activeMissionToUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveMissionToUpload(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-base text-[#1E2538] mb-1">
              ส่งผลงาน: {activeMissionToUpload.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{activeMissionToUpload.description}</p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">แนบรูปถ่ายหลักฐาน</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedImagePreview(URL.createObjectURL(file));
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1E2538] file:text-white hover:file:bg-[#2A334E] cursor-pointer"
                  required
                />
              </div>

              {uploadedImagePreview && (
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={uploadedImagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">บันทึกเพิ่มเติม (ถ้ามี)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ระบุรายละเอียดเพิ่มเติม..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1E2538]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#1E2538] hover:bg-[#2A334E] text-white font-bold text-xs rounded-xl shadow transition"
              >
                {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการส่งผลงาน'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

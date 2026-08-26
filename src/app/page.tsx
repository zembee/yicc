'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Users, 
  Building2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const HERO_SLIDES = [
  {
    image: '/images/about/Young-FTI-11-979.jpg',
    alt: 'Young FTI ELITE รุ่นที่ 11'
  },
  {
    image: '/images/home/hero_leaders.jpg',
    alt: 'พิธีเปิดและสัมมนาผู้บริหารระดับสูง Young FTI 11'
  },
  {
    image: '/images/home/event_training.jpg',
    alt: 'ภาพบรรยากาศการอบรมโครงการ Young FTI Elite รุ่นที่ 11'
  },
  {
    image: '/images/home/event_maldives.jpg',
    alt: 'กิจกรรม Y11 Friendship ณ Hard rock Maldives'
  }
];

const EVENTS = [
  {
    id: 'e1',
    date: '24 พ.ค. 2025',
    title: 'พิธีปิดหลักสูตร YOUNG FTI ELITE รุ่นที่ 11',
    image: '/images/about/history_group.webp',
    link: '/events'
  },
  {
    id: 'e2',
    date: '17 พ.ค. 2025',
    title: 'ภาพบรรยากาศการอบรม โครงการ Young FTI Elite รุ่นที่ 11',
    image: '/images/home/event_training.jpg',
    link: '/events'
  },
  {
    id: 'e3',
    date: '28 เม.ย. 2025',
    title: 'กิจกรรม Y11 Friendship ณ Hard rock Maldives',
    image: '/images/home/event_maldives.jpg',
    link: '/events'
  }
];

const GALLERY_PHOTOS = [
  { img: '/images/about/act_lecture.webp', span: 'col-span-1 row-span-1' },
  { img: '/images/about/act_icebreaking.webp', span: 'col-span-1 row-span-1' },
  { img: '/images/about/act_csr.webp', span: 'col-span-1 row-span-1' },
  { img: '/images/about/Young-FTI-11-979.jpg', span: 'col-span-1 row-span-1' },
  { img: '/images/home/hero_leaders.jpg', span: 'col-span-1 row-span-1' },
  { img: '/images/home/gallery_6.jpg', span: 'col-span-1 row-span-1' },
  { img: '/images/home/event_training.jpg', span: 'col-span-1 row-span-1' },
  { img: '/images/home/event_maldives.jpg', span: 'col-span-1 row-span-1' }
];

const INDUSTRY_SECTORS = [
  { nameTh: 'เทคโนโลยี', nameEn: 'Technology', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80', query: 'เทคโนโลยี' },
  { nameTh: 'บริการ', nameEn: 'Service', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80', query: 'บริการ' },
  { nameTh: 'สินค้าอุปโภคบริโภค', nameEn: 'Consumer Products', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80', query: 'สินค้าอุปโภคบริโภค' },
  { nameTh: 'สินค้าอุตสาหกรรม', nameEn: 'Industrial Goods', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80', query: 'สินค้าอุตสาหกรรม' },
  { nameTh: 'การเกษตร / อาหาร', nameEn: 'Agriculture / Food', img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80', query: 'เกษตร' },
  { nameTh: 'การก่อสร้าง', nameEn: 'Real Estate / Construction', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80', query: 'ก่อสร้าง' },
  { nameTh: 'ทรัพยากร', nameEn: 'Resources', img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&auto=format&fit=crop&q=80', query: 'ทรัพยากร' },
  { nameTh: 'ธุรกิจการเงิน / ลงทุน', nameEn: 'Financials / Investment', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80', query: 'การเงิน' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 animate-in fade-in duration-300">
      {/* 1. Hero Carousel matching yfticonnect.com */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-[16/9] max-h-[560px] bg-slate-950">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-[#FB7170]' : 'w-2.5 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Brand Ribbon Heading & Leaders Celebration Photo */}
      <section className="space-y-8 text-center">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl font-black text-[#1E2538] tracking-tight">
            Young FTI ELITE 11
          </h1>
          <p className="text-lg sm:text-2xl font-bold text-[#FB7170]">
            หลักสูตรนักอุตสาหกรรมรุ่นใหม่
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative aspect-[16/8] max-w-5xl mx-auto bg-slate-900">
          <img
            src="/images/home/hero_leaders.jpg"
            alt="Young FTI Elite 11 Opening Ceremony"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* 3. ข่าวสารโครงการ (Project News) */}
      <section className="space-y-6 text-center">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1E2538] tracking-tight">
          ข่าวสารโครงการ
        </h2>
        <div className="py-8 text-slate-500 text-sm sm:text-base font-normal">
          ยังไม่มีข่าวสาร โปรดรอติดตาม เร็วๆ นี้
        </div>
      </section>

      {/* 4. กิจกรรมโครงการ (Project Activities) */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1E2538] tracking-tight">
            กิจกรรมโครงการ
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {EVENTS.map((event) => (
            <Link
              key={event.id}
              href="/events"
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover transition duration-300 flex flex-col group hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={event.image}
                  alt={event.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#FB7170] block">
                    {event.date}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#1E2538] leading-snug group-hover:text-[#FB7170] transition">
                    {event.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. บรรยากาศกิจกรรม (Activity Atmosphere Gallery) matching yfticonnect.com */}
      <section className="bg-[#1E2538] text-white -mx-3.5 sm:-mx-6 lg:-mx-8 px-4 sm:px-8 py-16 sm:py-20 rounded-3xl shadow-2xl space-y-10">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            บรรยากาศกิจกรรม
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {GALLERY_PHOTOS.map((photo, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md group bg-slate-800"
            >
              <img
                src={photo.img}
                alt={`บรรยากาศกิจกรรม ${idx + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 6. ธุรกิจที่เกี่ยวข้อง (Related Industry Sectors) */}
      <section className="space-y-8">
        {/* Slanted Ribbon Header matching yfticonnect.com */}
        <div 
          className="bg-[#1E2538] text-white py-4 px-8 inline-block shadow-md rounded-l-2xl"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)',
            paddingRight: '3.5rem'
          }}
        >
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            ธุรกิจที่เกี่ยวข้อง
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {INDUSTRY_SECTORS.map((sector, idx) => (
            <Link
              key={idx}
              href={`/directory?industry=${encodeURIComponent(sector.query)}`}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden group shadow-card border border-slate-200 flex flex-col justify-end p-5 transition hover:shadow-card-hover hover:-translate-y-1 bg-slate-900"
            >
              <img
                src={sector.img}
                alt={sector.nameTh}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2538]/95 via-[#1E2538]/50 to-transparent" />
              <div className="relative z-10 text-white space-y-0.5">
                <h3 className="font-black text-lg sm:text-xl leading-tight">
                  {sector.nameTh}
                </h3>
                <p className="text-xs text-slate-300 font-medium tracking-wide">
                  {sector.nameEn}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

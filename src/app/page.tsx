'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  X,
  Maximize2
} from 'lucide-react';

// Hero Swiper Slides
const HERO_SLIDES = [
  {
    image: '/images/home/Young-FTI-11-979-scaled-e1779826560403-1536x863.jpg',
    alt: 'Young FTI ELITE รุ่นที่ 11'
  },
  {
    image: '/images/home/hero_leaders.jpg',
    alt: 'พิธีเปิดและสัมมนาผู้บริหารระดับสูง Young FTI 11'
  },
  {
    image: '/images/home/event_training.jpg',
    alt: 'ภาพบรรยากาศการอบรมโครงการ Young FTI Elite รุ่นที่ 11'
  }
];

// กิจกรรมโครงการ (Activities)
const ACTIVITIES = [
  {
    id: 'act-1',
    date: '24 พ.ค. 2025',
    title: 'พิธีปิดหลักสูตร YOUNG FTI ELITE รุ่นที่ 11',
    image: '/images/home/25680523-Y11-YoungFTI_1683-scaled.jpg',
    link: '/events'
  },
  {
    id: 'act-2',
    date: '17 พ.ค. 2025',
    title: 'ภาพบรรยากาศการอบรมโครงการ Young FTI Elite รุ่นที่ 11',
    image: '/images/home/Y11-YoungFTI-Earth_225-scaled.jpg',
    link: '/events'
  },
  {
    id: 'act-3',
    date: '28 เม.ย. 2025',
    title: 'กิจกรรม Y11 Friendship ณ Hard rock Maldives',
    image: '/images/home/Maldives-Davilsnap-Day2-3_627-scaled.jpg',
    link: '/events'
  }
];

// บรรยากาศกิจกรรม (Gallery Photos - 11 photos matching Elementor mosaic puzzle layout)
const GALLERY_ITEMS = [
  // Left Column - Row 1
  { id: 1, img: '/images/home/Y11_04042025_284-1024x1536.jpg', title: 'Y11_04042025_284' },
  { id: 2, img: '/images/home/Y11_04042025_365-scaled.jpg', title: 'Y11_04042025_365' },
  { id: 3, img: '/images/home/Y11_04042025_113-scaled.jpg', title: 'Y11_04042025_113' },

  // Right Column - Row 1
  { id: 4, img: '/images/home/KIM05966-scaled.jpg', title: 'KIM05966' },
  { id: 5, img: '/images/home/DSC00451-scaled.jpg', title: 'DSC00451' },

  // Left Column - Row 2
  { id: 6, img: '/images/home/YFTI-Pattaya-24-Jan-25-130-scaled.jpg', title: 'YFTI Pattaya (24 Jan 25)-130' },
  { id: 7, img: '/images/home/Young-FTI-11-477-scaled.jpg', title: 'Young FTI 11-477' },
  { id: 8, img: '/images/home/Young-FTI-11-480-scaled.jpg', title: 'Young FTI 11-480' },

  // Right Column - Row 2
  { id: 9, img: '/images/home/Maldives-Davilsnap-Day2-3_461-scaled.jpg', title: 'Maldives Davilsnap Day2-3_461' },
  { id: 10, img: '/images/home/Maldives-Davilsnap-Day2-3_220-scaled.jpg', title: 'Maldives Davilsnap Day2-3_220' },
  { id: 11, img: '/images/home/Young-FTI-11-308-scaled.jpg', title: 'Young FTI 11-308' },
];

// ธุรกิจที่เกี่ยวข้อง (8 Industry Sectors matching Elementor Card Grid with exact images)
const INDUSTRY_SECTORS = [
  {
    nameTh: 'เทคโนโลยี',
    nameEn: 'Technology',
    img: '/images/home/unsplash_FO7JIlwjOtU.webp',
    query: 'เทคโนโลยี'
  },
  {
    nameTh: 'บริการ',
    nameEn: 'Service',
    img: '/images/home/unsplash_hEC6zxdFF0M.webp',
    query: 'บริการ'
  },
  {
    nameTh: 'สินค้าอุปโภคบริโภค',
    nameEn: 'Consumer Products',
    img: '/images/home/unsplash_PLH1lwjWvVg.webp',
    query: 'สินค้าอุปโภคบริโภค'
  },
  {
    nameTh: 'สินค้าอุตสาหกรรม',
    nameEn: 'Industrial Goods',
    img: '/images/home/unsplash_lqx_D7xIZ2o.webp',
    query: 'สินค้าอุตสาหกรรม'
  },
  {
    nameTh: 'การเกษตร / อาหาร',
    nameEn: 'Agriculture / Food',
    img: '/images/home/3684-684x1024.jpg',
    query: 'เกษตร'
  },
  {
    nameTh: 'การก่อสร้าง',
    nameEn: 'Real Estate / Construction',
    img: '/images/home/unsplash_VAhJP5c-XdI.webp',
    query: 'ก่อสร้าง'
  },
  {
    nameTh: 'ทรัพยากร',
    nameEn: 'Resources',
    img: '/images/home/unsplash_dXbteDwOUG8.webp',
    query: 'ทรัพยากร'
  },
  {
    nameTh: 'ธุรกิจการเงิน / ลงทุน',
    nameEn: 'Financials / Investment',
    img: '/images/home/unsplash_8Eiq70dFgU0.webp',
    query: 'การเงิน'
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLightboxImg, setSelectedLightboxImg] = useState<{ img: string; title: string } | null>(null);

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div className="w-full bg-[#FAFAFA] text-[#292929] font-['Kanit',sans-serif] select-none">
      {/* -------------------------------------------------------------------------------- */}
      {/* SECTION 1: TOP HERO NESTED CAROUSEL (Full Width Edge-to-Edge)                    */}
      {/* -------------------------------------------------------------------------------- */}
      <section className="relative w-full min-h-[400px] md:min-h-[80vh] h-[50vw] max-h-[860px] overflow-hidden bg-[#212542]">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
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

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition shadow-lg"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition shadow-lg"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Swiper Pagination Bullets matching Elementor post-8.css */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-8 bg-[#FB7170]'
                  : 'w-2.5 bg-[#FFD7D7] hover:bg-[#FB7170]/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------------------- */}
      {/* SECTION 2: INTRO HEADING & HERO BANNER CARD (Padding: 104px 0)                    */}
      {/* -------------------------------------------------------------------------------- */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-[72px] md:py-[104px]">
        {/* Headings matching Elementor Typography */}
        <div className="text-center space-y-1">
          <h1 className="text-[36px] sm:text-[50px] lg:text-[64px] font-semibold text-[#212542] leading-[1.2] tracking-tight">
            Young FTI ELITE 11
          </h1>
          <h2 className="text-[24px] sm:text-[30px] lg:text-[36px] font-normal text-[#FB7170] leading-[1.3]">
            หลักสูตรนักอุตสาหกรรมรุ่นใหม่
          </h2>
        </div>

        {/* Spacer 64px */}
        <div className="h-10 md:h-16" />

        {/* Hero Banner Box matching .elementor-element-a453397 */}
        <div 
          className="relative w-full min-h-[104px] sm:min-h-[212px] md:min-h-[370px] lg:min-h-[460px] rounded-[12px] overflow-hidden shadow-[0px_4px_24px_8px_rgba(0,0,0,0.25)] group"
          style={{
            backgroundImage: `url('/images/home/Young-FTI-11-440-1536x1022.jpg')`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}
        >
          {/* Overlay matching Elementor Overlay.webp */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-90"
            style={{
              backgroundImage: `url('/images/home/Overlay.webp')`,
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover'
            }}
          />
        </div>
      </section>

      {/* -------------------------------------------------------------------------------- */}
      {/* SECTION 3: ข่าวสารโครงการ (Padding Bottom: 104px)                                 */}
      {/* -------------------------------------------------------------------------------- */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-[72px] md:pb-[104px] text-center">
        <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-semibold text-[#212542] leading-[1.2]">
          ข่าวสารโครงการ
        </h2>

        {/* Spacer 64px */}
        <div className="h-8 md:h-16" />

        {/* Loop grid empty message matching .e-loop-nothing-found-message__text */}
        <div className="py-6 text-[18px] font-normal text-[#292929]">
          ยังไม่มีข่าวสาร โปรดรอติดตาม เร็วๆ นี้
        </div>
      </section>

      {/* -------------------------------------------------------------------------------- */}
      {/* SECTION 4: กิจกรรมโครงการ (Padding Bottom: 104px)                                 */}
      {/* -------------------------------------------------------------------------------- */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-[72px] md:pb-[104px]">
        <div className="text-center">
          <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-semibold text-[#212542] leading-[1.2]">
            กิจกรรมโครงการ
          </h2>
        </div>

        {/* Spacer 64px */}
        <div className="h-8 md:h-16" />

        {/* 3-Column Activities Grid matching Elementor Loop-Grid 117 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVITIES.map((activity) => (
            <Link
              key={activity.id}
              href={activity.link}
              className="bg-white rounded-[12px] p-[20px] flex flex-col justify-between transition-all duration-300 shadow-[0px_4px_16px_2px_rgba(0,0,0,0.15)] hover:shadow-[0px_2px_25px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1 group"
            >
              {/* Featured Image */}
              <div className="w-full h-[180px] sm:h-[200px] md:h-[240px] rounded-[6px] overflow-hidden bg-slate-100">
                <img
                  src={activity.image}
                  alt={activity.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text Body */}
              <div className="mt-[15px] mb-[15px] flex flex-col gap-2 flex-1 justify-between">
                <p className="text-[18px] sm:text-[20px] font-normal text-[#FB7170] py-[6px] leading-tight">
                  {activity.date}
                </p>
                <h4 className="text-[22px] sm:text-[26px] lg:text-[28px] font-semibold text-[#212542] leading-[1.3] group-hover:text-[#FB7170] transition-colors">
                  {activity.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------------------- */}
      {/* SECTION 5: บรรยากาศกิจกรรม (Full Width Dark Navy #212542 Container)               */}
      {/* -------------------------------------------------------------------------------- */}
      <section className="w-full bg-[#212542] text-white py-[72px] md:py-[104px] px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Section Heading */}
          <div className="text-center mb-[48px] md:mb-[88px]">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-semibold text-white leading-[1.2]">
              บรรยากาศกิจกรรม
            </h2>
          </div>

          {/* Mosaic Puzzle Photo Grid matching Elementor container 822967c */}
          <div className="bg-white rounded-[12px] overflow-hidden shadow-2xl">
            {/* Desktop Grid Layout (2 Equal Half Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column (50%) */}
              <div className="flex flex-col">
                {/* Row 1 (Left): 3 images (25% + 25% + 50%) */}
                <div className="flex flex-col sm:flex-row h-auto md:h-[300px]">
                  {/* Img 1 (25%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[0].img, title: GALLERY_ITEMS[0].title })}
                    className="w-full sm:w-1/4 h-[240px] sm:h-[300px] border-b-2 sm:border-b-2 sm:border-r-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[0].img} 
                      alt={GALLERY_ITEMS[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Img 2 (25%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[1].img, title: GALLERY_ITEMS[1].title })}
                    className="w-full sm:w-1/4 h-[240px] sm:h-[300px] border-b-2 sm:border-b-2 sm:border-r-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[1].img} 
                      alt={GALLERY_ITEMS[1].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Img 3 (50%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[2].img, title: GALLERY_ITEMS[2].title })}
                    className="w-full sm:w-1/2 h-[240px] sm:h-[300px] border-b-2 sm:border-b-2 md:border-r-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[2].img} 
                      alt={GALLERY_ITEMS[2].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Row 2 (Left): 3 images (50% + 25% + 25%) */}
                <div className="flex flex-col sm:flex-row h-auto md:h-[300px]">
                  {/* Img 6 (50%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[5].img, title: GALLERY_ITEMS[5].title })}
                    className="w-full sm:w-1/2 h-[240px] sm:h-[300px] border-b-2 sm:border-b-0 sm:border-r-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[5].img} 
                      alt={GALLERY_ITEMS[5].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Img 7 (25%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[6].img, title: GALLERY_ITEMS[6].title })}
                    className="w-full sm:w-1/4 h-[240px] sm:h-[300px] border-b-2 sm:border-b-0 sm:border-r-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[6].img} 
                      alt={GALLERY_ITEMS[6].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Img 8 (25%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[7].img, title: GALLERY_ITEMS[7].title })}
                    className="w-full sm:w-1/4 h-[240px] sm:h-[300px] md:border-r-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[7].img} 
                      alt={GALLERY_ITEMS[7].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (50%) */}
              <div className="flex flex-col">
                {/* Row 1 (Right): 2 images (25% + 75%) */}
                <div className="flex flex-col sm:flex-row h-auto md:h-[300px]">
                  {/* Img 4 (25%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[3].img, title: GALLERY_ITEMS[3].title })}
                    className="w-full sm:w-1/4 h-[240px] sm:h-[300px] border-b-2 sm:border-b-2 sm:border-r-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[3].img} 
                      alt={GALLERY_ITEMS[3].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Img 5 (75%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[4].img, title: GALLERY_ITEMS[4].title })}
                    className="w-full sm:w-3/4 h-[240px] sm:h-[300px] border-b-2 sm:border-b-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[4].img} 
                      alt={GALLERY_ITEMS[4].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Row 2 (Right): 3 images (50% + 25% + 25%) */}
                <div className="flex flex-col sm:flex-row h-auto md:h-[300px]">
                  {/* Img 9 (50%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[8].img, title: GALLERY_ITEMS[8].title })}
                    className="w-full sm:w-1/2 h-[240px] sm:h-[300px] border-b-2 sm:border-b-0 sm:border-r-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[8].img} 
                      alt={GALLERY_ITEMS[8].title}
                      className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Img 10 (25%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[9].img, title: GALLERY_ITEMS[9].title })}
                    className="w-full sm:w-1/4 h-[240px] sm:h-[300px] border-b-2 sm:border-b-0 sm:border-r-2 border-white cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[9].img} 
                      alt={GALLERY_ITEMS[9].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Img 11 (25%) */}
                  <div 
                    onClick={() => setSelectedLightboxImg({ img: GALLERY_ITEMS[10].img, title: GALLERY_ITEMS[10].title })}
                    className="w-full sm:w-1/4 h-[240px] sm:h-[300px] cursor-pointer relative group overflow-hidden"
                  >
                    <img 
                      src={GALLERY_ITEMS[10].img} 
                      alt={GALLERY_ITEMS[10].title}
                      className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------------- */}
      {/* SECTION 6: ธุรกิจที่เกี่ยวข้อง (Related Industry Sectors - 8 Cards)                */}
      {/* -------------------------------------------------------------------------------- */}
      <section className="w-full py-[72px] md:py-[104px]">
        {/* Slanted Ribbon Header matching Elementor container aad4970 */}
        <div className="w-full mb-[48px] md:mb-[88px]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div 
              className="bg-[#212542] text-white py-4 px-8 sm:px-12 inline-block rounded-l-2xl shadow-md"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0% 100%)',
                paddingRight: '4rem'
              }}
            >
              <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-semibold text-white leading-[1.2]">
                ธุรกิจที่เกี่ยวข้อง
              </h2>
            </div>
          </div>
        </div>

        {/* 8 Cards Grid matching Elementor container 83c2160 */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INDUSTRY_SECTORS.map((sector, idx) => (
              <Link
                key={idx}
                href={`/directory?industry=${encodeURIComponent(sector.query)}`}
                className="relative min-h-[320px] rounded-[12px] overflow-hidden flex flex-col justify-end items-center p-6 text-center shadow-card hover:shadow-card-hover transition-all duration-300 group"
                style={{
                  backgroundImage: `url(${sector.img})`,
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover'
                }}
              >
                {/* Background Texture Overlay matching Elementor Overlay-Business.webp */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                  style={{
                    backgroundImage: `url('/images/home/Overlay-Business.webp')`,
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover'
                  }}
                />

                {/* Default Navy Overlay (0.5 opacity) -> Hover Coral Overlay (0.7 opacity) */}
                <div className="absolute inset-0 bg-[#212542] opacity-50 group-hover:bg-[#FB7170] group-hover:opacity-70 transition-all duration-300 mix-blend-multiply" />

                {/* Additional gradient for text clarity */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Text Content matching Elementor Headings */}
                <div className="relative z-10 text-white space-y-1">
                  <h3 className="text-[24px] sm:text-[28px] font-semibold text-white leading-[1.3]">
                    {sector.nameTh}
                  </h3>
                  <h4 className="text-[16px] sm:text-[20px] font-light text-white leading-[1.3] opacity-90">
                    {sector.nameEn}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------------- */}
      {/* LIGHTBOX MODAL (For viewing high-res gallery images)                             */}
      {/* -------------------------------------------------------------------------------- */}
      {selectedLightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedLightboxImg(null)}
        >
          <button
            onClick={() => setSelectedLightboxImg(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition z-50"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedLightboxImg.img}
              alt={selectedLightboxImg.title}
              className="w-auto h-auto max-h-[85vh] max-w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockNews } from '@/lib/mockData';
import { getNews } from '@/lib/dataService';
import { NewsItem } from '@/types';
import { ArrowLeft, Calendar, User, Share2, ArrowRight, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function NewsDetailPage() {
  const params = useParams();
  const id = String(params?.id || '');
  const [newsList, setNewsList] = useState<NewsItem[]>(mockNews);
  const [copied, setCopied] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getNews().then((data) => {
      if (active && data && data.length > 0) {
        setNewsList(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const article = newsList.find((n) => n.id === id);

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-5">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <h1 className="text-xl font-black text-[#1E2538]">ไม่พบข่าวสารที่ค้นหา</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ข่าวสารที่คุณต้องการเปิดดูอาจถูกลบหรือไม่มีอยู่ในระบบ
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E2538] text-white text-xs font-bold hover:bg-[#2B3550] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปหน้าข่าวสาร</span>
          </Link>
        </div>
      </div>
    );
  }

  const relatedArticles = newsList.filter((n) => n.id !== article.id);

  const paragraphs = article.content_paragraphs?.length
    ? article.content_paragraphs
    : [
        article.content,
        'โครงการ Young FTI ELITE มุ่งมั่นพัฒนาศักยภาพผู้ประกอบการรุ่นใหม่ เพื่อเป็นกำลังสำคัญในการขับเคลื่อนอุตสาหกรรมไทยสู่ระดับสากล ผ่านการเรียนรู้เชิงปฏิบัติการ การถ่ายทอดประสบการณ์จากผู้นำตัวจริง และการสร้างเครือข่ายความร่วมมือทางธุรกิจที่ยั่งยืน',
      ];

  const gallery = article.gallery_images?.length ? article.gallery_images : [article.image_url];

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({ title: article.title, url: window.location.href }).catch(() => {});
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-5 sm:px-6 py-6 pb-24 space-y-6 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1E2538] hover:text-[#FB7170] transition px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าข่าวสาร</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1E2538] px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm transition"
        >
          <Share2 className="w-3.5 h-3.5 text-[#FB7170]" />
          <span>{copied ? 'คัดลอกลิงก์แล้ว' : 'แชร์ข่าว'}</span>
        </button>
      </div>

      {/* Article Container */}
      <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Hero Image */}
        <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-4 left-4 px-3.5 py-1 bg-[#FB7170] text-white text-xs font-bold rounded-full shadow-md">
            {article.category}
          </span>
        </div>

        {/* Long-form Content */}
        <div className="p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FB7170]" />
              {new Date(article.date).toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#FB7170]" />
              {article.author || 'YFTI Media'}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-[#1E2538] leading-snug">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base font-semibold text-[#FB7170] leading-relaxed bg-rose-50/70 border-l-4 border-[#FB7170] px-4 py-3 rounded-r-xl">
            {article.summary}
          </p>

          <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Inline Image Gallery */}
          {gallery.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#1E2538]">ภาพประกอบข่าว ({gallery.length} ภาพ)</h2>
                <span className="text-[11px] text-slate-400">คลิกที่ภาพเพื่อดูขนาดเต็ม</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gallery.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className={`group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer text-left ${
                      i === 0 && gallery.length % 2 === 1 ? 'sm:col-span-2 aspect-[16/9]' : 'aspect-[4/3]'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${article.title} - ภาพที่ ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="p-2.5 rounded-full bg-white/90 text-[#1E2538] shadow-md">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related News */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-black text-[#1E2538]">ข่าวสารอื่น ๆ ที่น่าสนใจ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                href={`/news/${rel.id}`}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center gap-3.5 group"
              >
                <img
                  src={rel.image_url}
                  alt={rel.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-[#FB7170]">{rel.category}</span>
                  <h4 className="text-xs font-extrabold text-[#1E2538] line-clamp-2 group-hover:text-[#FB7170] transition-colors">
                    {rel.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 inline-flex items-center gap-1">
                    อ่านต่อ <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs sm:text-sm font-mono text-slate-300">
              ภาพที่ {lightboxIndex + 1} จาก {gallery.length}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={gallery[lightboxIndex]}
              alt={`ภาพประกอบที่ ${lightboxIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === null || prev === 0 ? gallery.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === null || prev === gallery.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="h-4" />
        </div>
      )}
    </div>
  );
}

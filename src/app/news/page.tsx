'use client';

import React, { useState } from 'react';
import { mockNews } from '@/lib/mockData';
import { NewsItem } from '@/types';
import { Newspaper, Calendar, ArrowRight, X } from 'lucide-react';

export default function NewsPage() {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 sm:space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E2538] tracking-tight">
          ข่าวสารโครงการ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          อัปเดตข่าวสาร ประกาศสำคัญ และความเคลื่อนไหวของหลักสูตร Young FTI ELITE 11
        </p>
      </div>

      {/* Featured News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockNews.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-[#1E2538]/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-full border border-white/10">
                {item.category}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FB7170]" />
                  {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1E2538] group-hover:text-[#FB7170] transition-colors leading-snug line-clamp-2 mt-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-2">
                  {item.summary}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1E2538] group-hover:text-[#FB7170]">
                <span>อ่านรายละเอียด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* News Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video overflow-hidden bg-slate-900">
              <img
                src={selectedArticle.image_url}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-[#FB7170] text-white text-xs font-bold rounded-full">
                {selectedArticle.category}
              </span>
            </div>

            <div className="overflow-y-auto p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>📅 {new Date(selectedArticle.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>•</span>
                <span>✍️ {selectedArticle.author || 'YFTI Media'}</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-[#1E2538] leading-snug">
                {selectedArticle.title}
              </h2>

              <p className="text-sm font-semibold text-[#FB7170] leading-relaxed">
                {selectedArticle.summary}
              </p>

              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-3 border-t border-slate-100 space-y-3">
                <p>{selectedArticle.content}</p>
                <p>
                  โครงการ Young FTI ELITE มุ่งมั่นพัฒนาศักยภาพผู้ประกอบการรุ่นใหม่ เพื่อเป็นกำลังสำคัญในการขับเคลื่อนอุตสาหกรรมไทยสู่ระดับสากล ผ่านการเรียนรู้เชิงปฏิบัติการ การถ่ายทอดประสบการณ์จากผู้นำตัวจริง และการสร้างเครือข่ายความร่วมมือทางธุรกิจที่ยั่งยืน
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockNews } from '@/lib/mockData';
import { getNews } from '@/lib/dataService';
import { NewsItem } from '@/types';
import { Calendar, ArrowRight } from 'lucide-react';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>(mockNews);

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

  return (
    <div className="max-w-7xl mx-auto w-full px-5 sm:px-6 lg:px-8 py-6 space-y-8 sm:space-y-10 pb-20">
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
        {newsList.map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.id}`}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
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
                  {new Date(item.date).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
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
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

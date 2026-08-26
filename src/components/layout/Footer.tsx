'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Globe, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1E2538] text-white border-t border-[#2A334E] mt-auto">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Column 1: Organization & Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl flex items-center justify-center shadow-sm">
                <Image
                  src="/YFTI-11-Logo.jpg"
                  alt="Young FTI 11"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-white leading-tight">
                  Young FTI ELITE
                </h3>
                <p className="text-xs text-[#FB7170] font-semibold">
                  หลักสูตรนักอุตสาหกรรมรุ่นใหม่
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed pt-2">
              <p className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FB7170] shrink-0" />
                สำนักงานนักอุตสาหกรรมรุ่นใหม่
              </p>
              <p className="pl-5 text-slate-400">
                ชั้น 10 อาคารสำนักงาน เลขที่ 100/10 ถนนสุขุมวิท แขวงบางนาเหนือ เขตบางนา กรุงเทพมหานคร 10000
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FB7170]" />
              ทางลัดเมนู
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <Link href="/academy" className="hover:text-[#FB7170] transition flex items-center gap-1.5">
                  <span>→</span> เกี่ยวกับเรา / หน้าหลัก
                </Link>
              </li>
              <li>
                <Link href="/directory" className="hover:text-[#FB7170] transition flex items-center gap-1.5">
                  <span>→</span> ธุรกิจภายในโครงการ (ทำเนียบรุ่น)
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#FB7170] transition flex items-center gap-1.5">
                  <span>→</span> กิจกรรมโครงการ
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#FB7170] transition flex items-center gap-1.5">
                  <span>→</span> ข่าวสารโครงการ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FB7170] transition flex items-center gap-1.5">
                  <span>→</span> ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Channels */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FB7170]" />
              ช่องทางติดต่อและติดตาม
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FB7170] shrink-0" />
                <span className="font-mono text-slate-300">098-765-4321, 088-888-8888</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FB7170] shrink-0" />
                <span className="font-mono text-slate-300">contact@yfticonnect.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#FB7170] shrink-0" />
                <a href="https://yfticonnect.com" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white underline font-mono">
                  https://yfticonnect.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-slate-700/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>Young FTI ELITE — สภาอุตสาหกรรมแห่งประเทศไทย</p>
          <p>Copyright © 2025 by exvention | All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Globe, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1E2538] text-white mt-auto select-none">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Column 1: Organization Logo & Address */}
          <div className="md:col-span-5 space-y-6">
            {/* White Trapezoid Brand Box matching yfticonnect.com footer */}
            <div 
              className="bg-white p-4 pr-10 inline-flex items-center gap-4 rounded-xl shadow-lg relative"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0% 100%)'
              }}
            >
              <div className="w-12 h-12 relative shrink-0">
                <Image
                  src="/YFTI-11-Logo.jpg"
                  alt="Young FTI 11 Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl text-[#212542] leading-tight">
                  Young FTI ELITE
                </span>
                <span className="text-xs sm:text-sm text-[#FB7170] font-medium">
                  หลักสูตรนักอุตสาหกรรมรุ่นใหม่
                </span>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                สำนักงานนักอุตสาหกรรมรุ่นใหม่
              </h3>
              <p className="text-[#DBDFFA] text-base sm:text-lg font-light leading-relaxed max-w-md">
                ชั้น 10 อาคารสำนักงาน เลขที่ 100/10 ถนนสุขุมวิท แขวงบางนาเหนือ เขตบางนา กรุงเทพมหานคร 10000
              </p>
            </div>
          </div>

          {/* Column 2: ทางลัดเมนู (Shortcut Menu) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ทางลัดเมนู
            </h3>
            <ul className="space-y-3 text-base sm:text-lg text-[#DBDFFA] font-light">
              <li>
                <Link href="/about" className="hover:text-[#FB7170] transition duration-150 block">
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link href="/directory" className="hover:text-[#FB7170] transition duration-150 block">
                  ธุรกิจภายในโครงการ
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#FB7170] transition duration-150 block">
                  กิจกรรม
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#FB7170] transition duration-150 block">
                  ข่าวสาร
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FB7170] transition duration-150 block">
                  ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: ช่องทางติดต่อและติดตาม (Contact & Social) */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ช่องทางติดต่อและติดตาม
            </h3>
            <div className="space-y-4 text-base sm:text-lg text-[#DBDFFA] font-light">
              {/* Phone */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-[#FB7170] flex items-center justify-center text-[#FB7170] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <span>098-765-4321, 088-888-8888</span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-[#FB7170] flex items-center justify-center text-[#FB7170] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <span>email.test@email.com</span>
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-[#FB7170] flex items-center justify-center text-[#FB7170] shrink-0">
                  <Facebook className="w-5 h-5" />
                </div>
                <span>Young FTI ELITE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar matching yfticonnect.com */}
      <div className="bg-white py-4 px-4 text-center">
        <p className="text-xs sm:text-sm text-[#212542] font-light">
          Copyright ©2025 by exvention
        </p>
      </div>
    </footer>
  );
};

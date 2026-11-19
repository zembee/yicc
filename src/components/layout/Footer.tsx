'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F6F4EF] text-[#161C2C] mt-auto select-none pt-2 pb-24 md:pb-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_6px_22px_rgba(13,19,33,0.05)] space-y-4">
          {/* Top Row: Brand Lockup & Compact Contact Action Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#F6F4EF] p-1.5 relative shrink-0 overflow-hidden">
                <Image
                  src="/YFTI-11-Logo.jpg"
                  alt="Young FTI ELITE 11"
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-extrabold tracking-tight text-[#161C2C]">
                  Young FTI <span className="font-semibold text-[#B18A3B]">ELITE 11</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  หลักสูตรนักอุตสาหกรรมรุ่นใหม่ • สภาอุตสาหกรรมแห่งประเทศไทย
                </p>
              </div>
            </Link>

            {/* Compact Contact Buttons (Phone, Email, LINE) */}
            <div className="flex items-center gap-2">
              <a
                href="tel:0987654321"
                aria-label="โทรศัพท์ติดต่อสำนักงาน"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F6F4EF] hover:bg-[#0D1321] hover:text-white text-xs font-bold text-[#161C2C] transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#B18A3B]" />
                <span>โทร</span>
              </a>

              <a
                href="mailto:email.test@email.com"
                aria-label="ส่งอีเมล"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F6F4EF] hover:bg-[#0D1321] hover:text-white text-xs font-bold text-[#161C2C] transition"
              >
                <Mail className="w-3.5 h-3.5 text-[#B18A3B]" />
                <span>อีเมล</span>
              </a>

              <Link
                href="/contact"
                aria-label="ติดต่อผ่าน LINE"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F6F4EF] hover:bg-[#06C755] hover:text-white text-xs font-bold text-[#161C2C] transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#B18A3B]" />
                <span>LINE</span>
              </Link>
            </div>
          </div>

          {/* Bottom Row: Minimal Quick Links & Copyright */}
          <div className="pt-3.5 border-t border-[#F1ECE2] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-4 font-medium text-slate-500">
              <Link href="/about" className="hover:text-[#161C2C] transition">
                เกี่ยวกับโครงการ
              </Link>
              <Link href="/news" className="hover:text-[#161C2C] transition">
                ข่าวสาร
              </Link>
              <Link href="/contact" className="hover:text-[#161C2C] transition">
                ติดต่อเรา
              </Link>
            </div>
            <span>© 2026 Young FTI ELITE 11</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Users, Sparkles } from 'lucide-react';

const ACTIVITIES = [
  {
    title: 'กิจกรรมละลาย\nพฤติกรรม',
    img: '/images/about/act_icebreaking.webp',
  },
  {
    title: 'รับฟังการบรรยายหัวข้อต่าง ๆ\nจากวิทยากร',
    img: '/images/about/act_lecture.webp',
  },
  {
    title: 'การศึกษาดูงานทั้งภายใน\nประเทศและกิจกรรม CSR',
    img: '/images/about/act_csr.webp',
  },
  {
    title: 'กิจกรรมดูงาน\nต่างประเทศ',
    img: '/images/about/act_overseas.webp',
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-16 animate-in fade-in duration-300">
      {/* 1. Page Main Title */}
      <div className="text-center pt-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E2538] tracking-tight">
          เกี่ยวกับเรา
        </h1>
      </div>

      {/* 2. Signature Slanted Ribbon Banner matching yfticonnect.com */}
      <section className="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          {/* Left Dark Navy Slanted Polygon */}
          <div 
            className="md:col-span-5 bg-[#1E2538] text-white p-8 sm:p-12 relative flex flex-col justify-center min-h-[160px] md:min-h-[200px]"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'
            }}
          >
            <span className="text-sm font-bold text-[#FB7170] uppercase tracking-wider mb-1">
              What&apos;s
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-none">
              Young FTI ELITE
            </h2>
          </div>

          {/* Right Lead Slogan */}
          <div className="md:col-span-7 p-6 sm:p-10 pl-6 md:pl-2">
            <p className="text-base sm:text-xl lg:text-2xl font-bold text-[#1E2538] leading-relaxed">
              Young FTI เป็นหลักสูตรสำหรับนักอุตสาหกรรมรุ่นใหม่ที่ไม่หยุดนิ่งในการพัฒนาตนเองและมีแนวคิดที่จะนำพาภาคอุตสาหกรรมไทยก้าวเดินไปข้างหน้า
            </p>
          </div>
        </div>
      </section>

      {/* 3. Story Section 1: Overview & History with Group Photo */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Text */}
        <div className="lg:col-span-6 space-y-4">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            หลักสูตรนี้เป็นเวทีที่เปิดโอกาสให้นักอุตสาหกรรมรุ่นใหม่เข้ามามีส่วนร่วมในกิจกรรมต่าง ๆ ของสภาอุตสาหกรรมแห่งประเทศไทย ซึ่งเป็นองค์กรตัวแทนภาคอุตสาหกรรมและยังเป็นโครงการที่สนับสนุนให้นักอุตสาหกรรมรุ่นใหม่ได้มีบทบาทในการพัฒนาภาคอุตสาหกรรมมากยิ่งขึ้น ผ่านการเรียนรู้การทำงานจากนักอุตสาหกรรมรุ่นอาวุโส คณาจารย์ และผู้ทรงคุณวุฒิจากสถาบันชั้นนำของประเทศที่จะมาถ่ายทอดความรู้และประสบการณ์อันเป็นรากฐานของความสำเร็จในธุรกิจอุตสาหกรรม ตลอดจนมีการส่งเสริมบทบาทด้านกิจกรรมเพื่อสังคมให้กับนักอุตสาหกรรมรุ่นใหม่เพื่อให้เกิดประสบการณ์ด้านการทำงานในภาคอุตสาหกรรมครบทุกมิติอย่างแท้จริง
          </p>
        </div>

        {/* Right Group Photo */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl overflow-hidden border-2 border-slate-200/80 shadow-lg relative aspect-[16/11] bg-slate-900">
            <img
              src="/images/about/history_group.webp"
              alt="Young FTI Elite พิธีปิดหลักสูตร"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4. Story Section 2: จุดเริ่มต้น (Originator / คุณกรกฤช จุฬางกูร) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Photo: คุณกรกฤช จุฬางกูร */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="rounded-3xl overflow-hidden border-2 border-slate-200/80 shadow-lg relative aspect-[3/4] max-w-md mx-auto bg-slate-900">
            <img
              src="/images/about/founder_kornkris.jpg"
              alt="คุณกรกฤช จุฬางกูร"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Right Text */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1E2538] tracking-tight">
            จุดเริ่มต้น
          </h2>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            งานครั้งนี้เกิดขึ้นจากความตั้งใจของนักธุรกิจและผู้บริหารรุ่นใหม่ โดยมี <strong className="text-[#1E2538] font-bold">“คุณกรกฤช จุฬางกูร”</strong> เป็นหนึ่งในผู้ผลักดัน ซึ่งทุกท่านมาพร้อมประสบการณ์ในโลกธุรกิจจริง โดยเฉพาะในภาคอุตสาหกรรมยานยนต์และการบริหารองค์กรขนาดใหญ่ คุณกรกฤชเป็นที่รู้จักในฐานะหนึ่งในทายาทครอบครัวจุฬางกูร แห่งกลุ่มธุรกิจ Summit Group และมีบทบาทสำคัญในฐานะผู้บริหารของบริษัทในเครือซัมมิท ด้วยประสบการณ์ด้านการทำงาน การบริหาร และการมองหาโอกาสใหม่ ๆ คุณกรกฤชจึงให้ความสำคัญกับการส่งต่อแนวคิด ความรู้ และแรงบันดาลใจให้กับผู้ที่ต้องการพัฒนาตนเองและต่อยอดสู่ความสำเร็จ
          </p>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            จากแนวคิดดังกล่าว จึงเป็นที่มาของ <strong className="text-[#FB7170] font-bold">“Young FTI หลักสูตรสำหรับนักอุตสาหกรรมรุ่นใหม่”</strong> ที่ไม่หยุดนิ่งในการพัฒนาตนเองและมีแนวคิดที่จะนำพาภาคอุตสาหกรรมไทยก้าวเดินไปข้างหน้า เพื่อสร้างพื้นที่สำหรับการเรียนรู้ แลกเปลี่ยนประสบการณ์ และเปิดมุมมองใหม่ ๆ ให้กับผู้เข้าร่วม หลักสูตรนี้ไม่ได้เป็นเพียงกิจกรรมพบปะหรือการบรรยายทั่วไป แต่ถูกออกแบบให้เป็นเวทีที่รวบรวมเรื่องราว แนวคิด และประสบการณ์จริงที่สามารถนำไปปรับใช้ได้
          </p>
        </div>
      </section>

      {/* 5. Section 3: ประธาน Young FTI Elite รุ่นที่ 11 */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* President Portrait Photo */}
          <div className="md:col-span-4 lg:col-span-4">
            <div className="rounded-3xl overflow-hidden border-2 border-slate-200/80 shadow-md relative aspect-[3/4] max-w-xs mx-auto bg-slate-100">
              <img
                src="/images/about/president_tui.jpg"
                alt="อภินันท์ ตรีรัตน์พิจารณ์ (Tui)"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* President Description */}
          <div className="md:col-span-8 lg:col-span-8 space-y-3 text-center md:text-left">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#FB7170]/10 text-[#FB7170] text-xs font-bold uppercase tracking-wider">
              Leadership
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1E2538] tracking-tight">
              ประธาน Young FTI Elite รุ่นที่ 11
            </h2>
            <p className="text-lg sm:text-2xl font-bold text-[#FB7170]">
              อภินันท์ ตรีรัตน์พิจารณ์ (Tui)
            </p>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              ผู้นำรุ่นขับเคลื่อนเครือข่ายความร่วมมือ และสร้างสรรค์กิจกรรมเสริมสร้างความเข้มแข็งของสมาชิกทั้ง 122 ท่านในครอบครัว Young FTI ELITE 11
            </p>
          </div>
        </div>
      </section>

      {/* 6. Section 4: กิจกรรมของหลักสูตร (4 Visual Grid Cards) */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1E2538] tracking-tight">
            กิจกรรมของหลักสูตร
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ประสบการณ์การเรียนรู้ครบทุกมิติ ทั้งวิชาการ ทัศนศึกษา และการสร้างสัมพันธ์
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {ACTIVITIES.map((act, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden group shadow-card border border-slate-200 flex flex-col justify-end p-5 transition hover:shadow-card-hover hover:-translate-y-1"
            >
              <img
                src={act.img}
                alt={act.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2538]/95 via-[#1E2538]/50 to-transparent" />
              <div className="relative z-10 text-white">
                <h3 className="font-extrabold text-base sm:text-lg leading-snug whitespace-pre-line drop-shadow-md">
                  {act.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Bottom Call to Action */}
      <section className="bg-gradient-to-r from-[#1E2538] to-[#2B3550] text-white p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl border border-slate-700/50">
        <h3 className="text-xl sm:text-3xl font-black">
          ร่วมเป็นส่วนหนึ่งของเครือข่ายนักอุตสาหกรรมรุ่นใหม่
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          สำรวจทำเนียบสมาชิก 122 ท่าน และธุรกิจชั้นนำในเครือข่าย Young FTI ELITE 11
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/directory"
            className="py-3 px-6 bg-[#FB7170] hover:bg-[#e85857] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>ดูทำเนียบธุรกิจ (122 ท่าน)</span>
          </Link>
          <Link
            href="/events"
            className="py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2"
          >
            <span>ดูกิจกรรมโครงการ</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

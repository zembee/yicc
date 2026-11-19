'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';

const COURSE_ACTIVITIES = [
  {
    title: 'กิจกรรมละลาย\nพฤติกรรม',
    img: 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/about/post-mock-cover-1.webp',
  },
  {
    title: 'รับฟังการบรรยายหัวข้อต่างๆ จากวิทยากร',
    img: 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/about/IMG-4.webp',
  },
  {
    title: 'การศึกษาดูงานทั้งภายในประเทศและกิจกรรม CSR',
    img: 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/about/IMG-6.webp',
  },
  {
    title: 'กิจกรรมดูงาน\nต่างประเทศ',
    img: 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/about/image_1920x_66cbfa0338994.webp',
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-[#F4F6FA] text-[#1E2538] font-['Kanit',sans-serif] select-none">
      {/* Executive Navy Hero Header */}
      <section className="relative overflow-hidden bg-[#141A2C] text-white pt-8 pb-10 px-5 sm:px-8 border-b-[3px] border-[#FB7170] shadow-[0_10px_30px_rgba(20,26,44,0.18)]">
        <div className="absolute inset-0 pointer-events-none select-none">
          <img
            src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-right opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(115deg, rgba(16,22,38,0.96) 28%, rgba(24,31,52,0.88) 58%, rgba(30,37,56,0.65) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300 block">
            About Program
          </span>
          <h1 className="text-2xl sm:text-4xl tracking-tight leading-tight">
            <span className="font-extrabold">เกี่ยวกับเรา</span>{' '}
            <span className="font-light text-white/95">Young FTI ELITE 11</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#FB7170]">
            หลักสูตรนักอุตสาหกรรมรุ่นใหม่ สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 sm:pt-12 space-y-[56px] md:space-y-[76px] pb-[72px] md:pb-[104px]">
        {/* ------------------------------------------------------------------------------ */}
        {/* SECTION 2: WHAT'S YOUNG FTI ELITE BANNER (.elementor-element-9946fc6)           */}
        {/* ------------------------------------------------------------------------------ */}
        <div className="relative rounded-[12px] overflow-hidden shadow-card border border-slate-200 bg-[#FAFAFA] grid grid-cols-1 md:grid-cols-12 items-center">
          {/* Slanted Navy Background for Desktop */}
          <div 
            className="hidden md:block absolute inset-y-0 left-0 w-[42%] lg:w-[40%] bg-[#212542] [clip-path:polygon(0_0,100%_0,84%_100%,0_100%)] z-0 pointer-events-none" 
          />

          {/* Left Dark Navy Block */}
          <div className="md:col-span-5 bg-[#212542] md:bg-transparent p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-center min-h-[160px] md:min-h-[200px] relative z-10">
            <span className="text-[20px] sm:text-[24px] lg:text-[28px] font-semibold leading-[1.3] text-white">
              What’s
            </span>
            <h2 className="text-[32px] sm:text-[40px] lg:text-[46px] font-semibold leading-[1.2] text-white">
              Young FTI ELITE
            </h2>
          </div>

          {/* Right Lead Text */}
          <div className="md:col-span-7 p-6 sm:p-8 md:p-8 md:pl-10 lg:pl-14 bg-[#FAFAFA] md:bg-transparent relative z-10">
            <p className="text-[18px] sm:text-[20px] lg:text-[22px] font-light text-[#292929] leading-[1.5]">
              <strong className="font-semibold text-[#212542]">Young FTI</strong> เป็นหลักสูตรสำหรับนักอุตสาหกรรมรุ่นใหม่ที่ไม่หยุดนิ่งในการพัฒนาตนเองและมีแนวคิดที่จะนำพาภาคอุตสาหกรรมไทยก้าวเดินไปข้างหน้า
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------------------ */}
        {/* SECTION 3: STORY OVERVIEW & GROUP PHOTO (.elementor-element-723c091)            */}
        {/* ------------------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] md:gap-[48px] items-center">
          {/* Left Text */}
          <div className="flex flex-col justify-center">
            <p className="text-[16px] sm:text-[18px] font-light text-[#292929] leading-[1.7] text-justify md:text-left">
              หลักสูตรนี้เป็นเวทีที่เปิดโอกาสให้นักอุตสาหกรรมรุ่นใหม่เข้ามามีส่วนร่วมในกิจกรรมต่างๆของสภาอุตสาหกรรมแห่งประเทศไทยซึ่งเป็นองค์กรตัวแทนภาคอุตสาหกรรมและยังเป็นโครงการที่สนับสนุนให้นักอุตสาหกรรมรุ่นใหม่ได้มีบทบาทในการพัฒนาภาคอุตสาหกรรมมากยิ่งขึ้น ผ่านการเรียนรู้การทำงานจากนักอุตสาหกรรมรุ่นอาวุโส คณาจารย์ และผู้ทรงคุณวุฒิจากสถาบันชั้นนำของประเทศที่จะมาถ่ายทอดความรู้และประสบการณ์อันเป็นรากฐานของความสำเร็จในธุรกิจอุตสาหกรรม ตลอดจนมีการส่งเสริมบทบาทด้านกิจกรรมเพื่อสังคมให้กับนักอุตสาหกรรมรุ่นใหม่เพื่อให้เกิดประสบการณ์ด้านการทำงานในภาคอุตสาหกรรมครบทุกมิติอย่างแท้จริง
            </p>
          </div>

          {/* Right Image */}
          <div className="flex justify-center">
            <img
              src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/about/IMG-9-1024x683.webp"
              alt="Young FTI Elite Activity"
              className="w-full rounded-[12px] shadow-md object-cover"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------------------ */}
        {/* SECTION 4: จุดเริ่มต้น (ORIGINATOR - คุณกรกฤช จุฬางกูร) (.elementor-element-855e7fd) */}
        {/* ------------------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[32px] md:gap-[48px] items-center">
          {/* Left Portrait Photo (30%) */}
          <div className="md:col-span-4 flex justify-center">
            <img
              src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/about/Young-FTI-11-480-681x1024.webp"
              alt="คุณกร กรกฤช จุฬางกูร"
              className="w-full max-w-[340px] md:max-w-none rounded-[12px] shadow-md object-cover"
            />
          </div>

          {/* Right Text Content (70%) */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-4">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-semibold text-[#212542] leading-[1.2]">
              จุดเริ่มต้น
            </h2>

            <p className="text-[16px] sm:text-[18px] font-light text-[#292929] leading-[1.7]">
              งานครั้งนี้เกิดขึ้นจากความตั้งใจของนักธุรกิจและผู้บริหารรุ่นใหม่ โดยมี “คุณกร กรกฤช จุฬางกูร” เป็นหนึ่งในผู้ผลักดัน ซึ่งทุกท่านมาพร้อมประสบการณ์ในโลกธุรกิจจริง โดยเฉพาะในภาคอุตสาหกรรมยานยนต์และการบริหารองค์กรขนาดใหญ่ คุณกรเป็นที่รู้จักในฐานะหนึ่งในทายาทครอบครัวจุฬางกูร แห่งกลุ่มธุรกิจ Summit Group และมีบทบาทสำคัญในฐานะผู้บริหารของบริษัทในเครือซัมมิท ด้วยประสบการณ์ด้านการทำงาน การบริหาร และการมองหาโอกาสใหม่ ๆ คุณกรจึงให้ความสำคัญกับการส่งต่อแนวคิด ความรู้ และแรงบันดาลใจให้กับผู้ที่ต้องการพัฒนาตนเองและต่อยอดสู่ความสำเร็จ
            </p>

            <p className="text-[16px] sm:text-[18px] font-light text-[#292929] leading-[1.7]">
              จากแนวคิดดังกล่าว จึงเป็นที่มาของ “Young FTI หลักสูตรสำหรับนักอุตสาหกรรมรุ่นใหม่” ที่ไม่หยุดนิ่งในการพัฒนาตนเองและมีแนวคิดที่จะนำพาภาคอุตสาหกรรมไทยก้าวเดินไปข้างหน้า เพื่อสร้างพื้นที่สำหรับการเรียนรู้ แลกเปลี่ยนประสบการณ์ และเปิดมุมมองใหม่ ๆ ให้กับผู้เข้าร่วม หลักสูตรนี้ไม่ได้เป็นเพียงกิจกรรมพบปะหรือการบรรยายทั่วไป แต่ถูกออกแบบให้เป็นเวทีที่รวบรวมเรื่องราว แนวคิด และประสบการณ์จริงที่สามารถนำไปปรับใช้ได้
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------------------ */}
        {/* SECTION 5: ประธาน Young FTI Elite รุ่นที่ 11 (.elementor-element-a52f661)         */}
        {/* ------------------------------------------------------------------------------ */}
        <div className="bg-[#FAFAFA] rounded-[12px] p-6 sm:p-8 md:p-12 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-[32px] md:gap-[48px] items-center">
          {/* Left President Photo (35%) */}
          <div className="md:col-span-4 flex justify-center">
            <img
              src="https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/about/118-683x1024.webp"
              alt="คุณอภินันท์ ตรีรัตน์พิจารณ์"
              className="w-full max-w-[300px] md:max-w-[400px] rounded-[12px] shadow-[4px_4px_12px_0px_rgba(0,0,0,0.15)] object-cover"
            />
          </div>

          {/* Right President Info (65%) */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-3 text-center md:text-left">
            <h2 className="text-[26px] sm:text-[32px] lg:text-[36px] font-semibold text-[#212542] leading-[1.3]">
              ประธาน Young FTI Elite รุ่นที่ 11
            </h2>

            <div className="text-[20px] sm:text-[24px] font-normal text-[#292929]">
              อภินันท์ ตรีรัตน์พิจารณ์ (Tui)
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------------------ */}
        {/* SECTION 6: กิจกรรมของหลักสูตร (4 Cards Grid) (.elementor-element-0632e1f)         */}
        {/* ------------------------------------------------------------------------------ */}
        <div className="space-y-[32px] md:space-y-[48px]">
          <div className="text-center">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-semibold text-[#212542] leading-[1.2]">
              กิจกรรมของหลักสูตร
            </h2>
          </div>

          {/* 4 Cards matching Elementor Grid .elementor-element-58c6a40 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COURSE_ACTIVITIES.map((activity, idx) => (
              <Link
                key={idx}
                href="/events"
                className="relative min-h-[320px] rounded-[12px] overflow-hidden flex flex-col justify-end items-center p-6 text-center shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer"
                style={{
                  backgroundImage: `url(${activity.img})`,
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover'
                }}
              >
                {/* Background Texture Overlay matching Elementor Overlay-Business.webp */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                  style={{
                    backgroundImage: `url('https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/Overlay-Business.webp')`,
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover'
                  }}
                />

                {/* Default Navy Overlay (0.5 opacity) -> Hover Coral Overlay (0.7 opacity) */}
                <div className="absolute inset-0 bg-[#212542] opacity-50 group-hover:bg-[#FB7170] group-hover:opacity-70 transition-all duration-300 mix-blend-multiply" />

                {/* Additional gradient for text clarity */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Text Title */}
                <div className="relative z-10 text-white">
                  <h3 className="text-[20px] sm:text-[24px] font-semibold text-white leading-[1.3] whitespace-pre-line">
                    {activity.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------------------------ */}
        {/* SECTION 7: CALL TO ACTION BANNER                                               */}
        {/* ------------------------------------------------------------------------------ */}
        <div className="bg-[#212542] text-white p-8 sm:p-12 rounded-[12px] text-center space-y-4 shadow-xl">
          <h3 className="text-xl sm:text-3xl font-semibold text-white">
            ร่วมเป็นส่วนหนึ่งของเครือข่ายนักอุตสาหกรรมรุ่นใหม่
          </h3>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto font-light">
            สำรวจทำเนียบสมาชิก 122 ท่าน และธุรกิจชั้นนำในเครือข่าย Young FTI ELITE 11
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Link
              href="/directory"
              className="py-3 px-6 bg-[#FB7170] hover:bg-[#fa5b5a] text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>ดูทำเนียบธุรกิจ (122 ท่าน)</span>
            </Link>
            <Link
              href="/events"
              className="py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2"
            >
              <span>ดูกิจกรรมโครงการ</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


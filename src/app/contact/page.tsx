'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Building2 } from 'lucide-react';
import Image from 'next/image';

export default function ContactPage() {
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-12">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E2538] tracking-tight">
          ติดต่อเรา
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          สำนักงานโครงการนักอุตสาหกรรมรุ่นใหม่ Young FTI ELITE
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                <Image
                  src="/YFTI-11-Logo.jpg"
                  alt="Young FTI 11"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#1E2538]">Young FTI ELITE</h3>
                <p className="text-xs text-[#FB7170] font-semibold">สภาอุตสาหกรรมแห่งประเทศไทย</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#FB7170] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#1E2538]">ที่ตั้งสำนักงาน</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    สำนักงานนักอุตสาหกรรมรุ่นใหม่ ชั้น 10 อาคารสำนักงาน เลขที่ 100/10 ถนนสุขุมวิท แขวงบางนาเหนือ เขตบางนา กรุงเทพมหานคร 10000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#FB7170] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#1E2538]">หมายเลขโทรศัพท์</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">098-765-4321, 088-888-8888</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#FB7170] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#1E2538]">อีเมลติดต่อ</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">contact@yfticonnect.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#FB7170] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#1E2538]">วันและเวลาทำการ</p>
                  <p className="text-xs text-slate-500 mt-0.5">จันทร์ - ศุกร์: 08:30 - 17:30 น.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
            <h3 className="text-lg font-bold text-[#1E2538] mb-1">ส่งข้อความติดต่อสอบถาม</h3>
            <p className="text-xs text-slate-500 mb-6">กรอกข้อมูลและข้อความที่ท่านต้องการติดต่อ ทีมงานจะติดต่อกลับโดยเร็วที่สุด</p>

            {formSent ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">ส่งข้อความสำเร็จเรียบร้อยแล้ว</h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  ขอบพระคุณสำหรับข้อมูล ทีมงาน Young FTI ELITE จะดำเนินการติดต่อกลับตามข้อมูลที่ท่านระบุไว้
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                >
                  ส่งข้อความใหม่
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ระบุชื่อและนามสกุล"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08x-xxx-xxxx"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">อีเมล</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">หัวข้อติดต่อ *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="เรื่องที่ต้องการติดต่อ"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดข้อความ *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="พิมพ์ข้อความหรือคำถามที่ต้องการติดต่อที่นี่..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E2538] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-8 bg-[#1E2538] hover:bg-[#2B3550] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งข้อความติดต่อ</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

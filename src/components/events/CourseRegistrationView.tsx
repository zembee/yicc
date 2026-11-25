'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { EventItem, UserProfile } from '@/types';
import { mockHouses, yftiParticipants } from '@/lib/mockData';
import {
  ChevronLeft,
  Info,
  Upload,
  ArrowRight,
  Check,
  AlertCircle,
  Leaf,
  BookOpen,
} from 'lucide-react';

interface CourseRegistrationViewProps {
  course: EventItem;
  profile: UserProfile | null;
  onBack: () => void;
  onSubmitSuccess: (status: 'PENDING' | 'APPROVED', message: string) => void;
}

const DEFAULT_INTEREST_TOPICS = [
  'Strategy & Leadership',
  'Process Automation',
  'Cost Optimization',
  'Supply Chain',
  'Sustainability / ESG',
];

export const CourseRegistrationView: React.FC<CourseRegistrationViewProps> = ({
  course,
  profile,
  onBack,
  onSubmitSuccess,
}) => {
  const matchedParticipant = useMemo(() => {
    if (!profile?.id) return null;
    return yftiParticipants.find((p) => String(p.id) === String(profile.id)) || null;
  }, [profile?.id]);

  const resolvedHouseName = useMemo(() => {
    const normalized = (profile?.house_id || profile?.house?.id || '').replace(/-/g, '_');
    return (
      mockHouses.find((h) => h.id === normalized)?.name ||
      profile?.house?.name ||
      matchedParticipant?.star_group_label ||
      'The Sun'
    );
  }, [profile, matchedParticipant]);

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [houseGroup, setHouseGroup] = useState('The Sun');
  const [companyAndRole, setCompanyAndRole] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [email, setEmail] = useState('');

  const availableTopics =
    course.interest_topics && course.interest_topics.length > 0
      ? course.interest_topics
      : DEFAULT_INTEREST_TOPICS;

  const [selectedTopics, setSelectedTopics] = useState<string[]>(() =>
    availableTopics.slice(0, 2)
  );
  const [goalNote, setGoalNote] = useState('');

  const [taxEntityType, setTaxEntityType] = useState<'juristic' | 'individual'>('juristic');
  const [taxEntityName, setTaxEntityName] = useState('');
  const [taxId, setTaxId] = useState('0105556012345');
  const [taxBranch, setTaxBranch] = useState('สำนักงานใหญ่');
  const [taxAddress, setTaxAddress] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'card'>('promptpay');
  const [slipFileName, setSlipFileName] = useState('');
  const [slipDataUrl, setSlipDataUrl] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const cleanName = (profile?.display_name || matchedParticipant?.name_thai || '')
      .replace(/\s*\([^)]*\)\s*/g, '')
      .trim();
    const parenMatch = (profile?.display_name || '').match(/\(([^)]+)\)/);
    const derivedNick = matchedParticipant?.nickname_eng || parenMatch?.[1] || 'กอล์ฟ';
    const comp = profile?.company_name || matchedParticipant?.company_name_thai || '';
    const pos = profile?.position || matchedParticipant?.business_position || '';

    setFullName(cleanName || 'พงศ์พิชาญ ธนสิริพูนสิน');
    setNickname(derivedNick);
    setHouseGroup(resolvedHouseName);
    setCompanyAndRole([comp, pos].filter(Boolean).join(' · ') || 'บจก. เอ็มพี ซีวิล · กรรมการผู้จัดการ');
    setPhone(profile?.phone_number || matchedParticipant?.tel_number || '082-269-9962');
    setLineId(matchedParticipant?.line_id || 'yfti.member');
    setEmail(profile?.email || matchedParticipant?.email || 'member@yfticonnect.com');
    setTaxEntityName(comp || 'บริษัท เอ็มพี ซีวิล จำกัด');
    setTaxAddress(
      matchedParticipant?.company_address ||
        '99/9 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310'
    );
  }, [profile, matchedParticipant, resolvedHouseName]);

  const isCourse = course.event_type === 'course';
  const actionLabel = isCourse ? 'สมัครเรียน' : 'ลงทะเบียนกิจกรรม';
  const memberFee = course.fee_member ?? (isCourse ? 12900 : 1200);
  const guestFee = course.fee_guest ?? Math.round(memberFee * 1.25);
  const memberDiscount = Math.max(0, guestFee - memberFee);
  const totalSessions = course.sessions?.length || 1;
  const isEsgTheme = /esg|sustain|green|carbon/i.test(course.title);
  const cleanDisplayTitle = course.title.replace(/^คอร์สเรียน:\s*/i, '');
  const shortLocation = course.location_name.includes('FTI Tower')
    ? 'FTI Tower'
    : course.location_name;

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setFormError('กรุณากรอกข้อมูลผู้เรียนที่มีเครื่องหมาย * ให้ครบถ้วน');
      return;
    }
    if (!taxEntityName.trim() || !taxId.trim() || !taxAddress.trim()) {
      setFormError('กรุณากรอกข้อมูลออกใบเสร็จ / ใบกำกับภาษีให้ครบถ้วน');
      return;
    }
    if (memberFee > 0 && paymentMethod === 'promptpay' && !slipDataUrl && !slipFileName) {
      setFormError('กรุณาอัปโหลดสลิปการโอนเงินเพื่อยืนยันการสมัครเรียน');
      return;
    }
    if (!acceptedTerms) {
      setFormError('กรุณายอมรับเงื่อนไขการสมัครเรียนและนโยบายความเป็นส่วนตัว');
      return;
    }

    const finalStatus: 'PENDING' | 'APPROVED' =
      memberFee === 0 || paymentMethod === 'card' ? 'APPROVED' : 'PENDING';

    const newReg = {
      id: `reg-${Date.now()}`,
      eventId: course.id,
      eventTitle: course.title,
      applicantName: fullName.trim(),
      applicantNickname: nickname.trim(),
      applicantHouse: houseGroup,
      applicantCompany: companyAndRole.trim(),
      applicantPhone: phone.trim(),
      applicantLineId: lineId.trim(),
      applicantEmail: email.trim(),
      interestTopics: selectedTopics,
      goalNote: goalNote.trim(),
      taxEntityType,
      taxEntityName: taxEntityName.trim(),
      taxId: taxId.trim(),
      taxBranch: taxEntityType === 'juristic' ? taxBranch.trim() : undefined,
      taxAddress: taxAddress.trim(),
      paymentMethod,
      ticketType: 'สมาชิก YFTI',
      amount: memberFee,
      slipName:
        paymentMethod === 'card'
          ? 'credit-card-verified'
          : slipFileName || 'transfer-slip.jpg',
      slipDataUrl: slipDataUrl || undefined,
      status: finalStatus,
      createdAt: new Date().toLocaleString('th-TH'),
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
        const filtered = Array.isArray(existing)
          ? existing.filter((r: any) => String(r.eventId) !== String(course.id))
          : [];
        filtered.unshift(newReg);
        localStorage.setItem('yfti_event_registrations', JSON.stringify(filtered));
      } catch {}
    }

    onSubmitSuccess(
      finalStatus,
      finalStatus === 'APPROVED'
        ? 'สมัครเรียนและยืนยันที่นั่งเรียบร้อยแล้ว'
        : 'ส่งใบสมัครเรียบร้อยแล้ว รอแอดมินตรวจสอบสลิป 1–2 วันทำการ'
    );
  };

  return (
    <div className="w-full bg-[#F6F4EF] text-[#161C2C] pb-28">
      {/* ================= TOP OBSIDIAN HEADER ================= */}
      <section className="sticky top-0 md:top-24 z-30 luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)]">
        <div className="max-w-2xl mx-auto space-y-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="ย้อนกลับ"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/12 flex items-center justify-center text-white transition shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-[#ECD28E]" />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold text-white">{actionLabel}</h1>
          </div>

          {/* Course Summary Mini Card */}
          <div className="rounded-2xl bg-white/[0.06] border border-white/12 p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl luxury-gold-btn flex items-center justify-center shrink-0">
              {isEsgTheme ? (
                <Leaf className="w-6 h-6 text-[#12192B] stroke-[2.2]" />
              ) : (
                <BookOpen className="w-6 h-6 text-[#12192B] stroke-[2.2]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-white leading-snug line-clamp-2">
                {cleanDisplayTitle}
              </p>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                {isCourse ? `${totalSessions} ครั้ง · ` : ''}
                {course.published_date_text || 'เร็วๆ นี้'} · {shortLocation}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP REGISTRATION FORM ================= */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {formError && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* STEP 1: ข้อมูลผู้เรียน */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3.5">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#12192B] text-[#ECD28E] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#161C2C]">ข้อมูลผู้เรียน</h2>
              <p className="text-[11px] text-slate-400">ใช้สำหรับออกใบประกาศนียบัตรและติดต่อกลับ</p>
            </div>
          </div>

          <div className="rounded-xl bg-[#FBF6EC] px-3 py-2 text-[11px] font-semibold text-[#9A742B] flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>ดึงข้อมูลจากโปรไฟล์สมาชิกแล้ว แก้ไขได้หากต้องการ</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#161C2C] mb-1">
                ชื่อ – นามสกุล <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#161C2C] mb-1">
                  ชื่อเล่น <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#161C2C] mb-1">กลุ่มดาว</label>
                <input
                  type="text"
                  value={houseGroup}
                  onChange={(e) => setHouseGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#161C2C] mb-1">
                บริษัท / ตำแหน่ง <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyAndRole}
                onChange={(e) => setCompanyAndRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#161C2C] mb-1">
                  เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#161C2C] mb-1">LINE ID</label>
                <input
                  type="text"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#161C2C] mb-1">
                อีเมล <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                ใช้รับเอกสารประกอบการเรียนและใบเสร็จ
              </p>
            </div>
          </div>
        </div>

        {/* STEP 2: ความสนใจและเป้าหมาย */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3.5">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#12192B] text-[#ECD28E] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#161C2C]">
                ความสนใจและเป้าหมาย
              </h2>
              <p className="text-[11px] text-slate-400">ช่วยให้วิทยากรเตรียมเนื้อหาให้ตรงกับคุณ</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#161C2C]">
              หัวข้อที่สนใจเป็นพิเศษ{' '}
              <span className="font-normal text-slate-400">(เลือกได้หลายข้อ)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-[#12192B] border-[#12192B] text-white'
                        : 'bg-white border-[#E6E0D4] text-[#394154] hover:border-[#C5A059]'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#161C2C] mb-1">
              อยากนำความรู้ไปใช้กับธุรกิจอย่างไร
            </label>
            <textarea
              rows={3}
              value={goalNote}
              onChange={(e) => setGoalNote(e.target.value)}
              placeholder="เช่น เตรียมรายงานคาร์บอนให้ลูกค้าในยุโรป หรือวางระบบอัตโนมัติในสายการผลิต"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C] placeholder:text-slate-400 resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              วิทยากรจะปรับตัวอย่างในคลาสให้ตรงกับผู้เรียน
            </p>
          </div>
        </div>

        {/* STEP 3: ข้อมูลออกใบเสร็จ / ใบกำกับภาษี */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3.5">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#12192B] text-[#ECD28E] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#161C2C]">
                ข้อมูลออกใบเสร็จ / ใบกำกับภาษี
              </h2>
              <p className="text-[11px] text-slate-400">เลือกออกในนามบุคคลหรือนิติบุคคล</p>
            </div>
          </div>

          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F3EFE6]">
            <button
              type="button"
              onClick={() => setTaxEntityType('juristic')}
              className={`py-2 rounded-lg text-xs font-extrabold transition ${
                taxEntityType === 'juristic'
                  ? 'bg-white text-[#161C2C] shadow-sm'
                  : 'text-slate-500 hover:text-[#161C2C]'
              }`}
            >
              นิติบุคคล
            </button>
            <button
              type="button"
              onClick={() => setTaxEntityType('individual')}
              className={`py-2 rounded-lg text-xs font-extrabold transition ${
                taxEntityType === 'individual'
                  ? 'bg-white text-[#161C2C] shadow-sm'
                  : 'text-slate-500 hover:text-[#161C2C]'
              }`}
            >
              บุคคลธรรมดา
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#161C2C] mb-1">
                {taxEntityType === 'juristic' ? 'ชื่อนิติบุคคล' : 'ชื่อ – นามสกุลผู้รับใบเสร็จ'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={taxEntityName}
                onChange={(e) => setTaxEntityName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#161C2C] mb-1">
                เลขประจำตัวผู้เสียภาษี (13 หลัก) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={13}
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm font-mono text-[#161C2C]"
              />
            </div>

            {taxEntityType === 'juristic' && (
              <div>
                <label className="block text-xs font-bold text-[#161C2C] mb-1">สาขา</label>
                <input
                  type="text"
                  value={taxBranch}
                  onChange={(e) => setTaxBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#161C2C] mb-1">
                ที่อยู่สำหรับออกใบกำกับภาษี <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={taxAddress}
                onChange={(e) => setTaxAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C]"
              />
            </div>
          </div>
        </div>

        {/* STEP 4: ชำระค่าลงทะเบียน */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3.5">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#12192B] text-[#ECD28E] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#161C2C]">
                ชำระค่าลงทะเบียน
              </h2>
              <p className="text-[11px] text-slate-400">ที่นั่งจะถูกยืนยันเมื่อชำระเงินเรียบร้อย</p>
            </div>
          </div>

          {/* Price Summary Breakdown */}
          <div className="rounded-2xl bg-[#F6F4EF] p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>ค่าลงทะเบียน (ราคาปกติ)</span>
              <span className="tabular-nums font-medium">฿{guestFee.toLocaleString()}</span>
            </div>
            {memberDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>ส่วนลดสมาชิก YFTI</span>
                <span className="tabular-nums">– ฿{memberDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-dashed border-[#D8D1C5] pt-2 flex items-baseline justify-between">
              <span className="font-bold text-[#161C2C]">
                ยอดชำระ <span className="text-[10px] font-normal text-slate-500">(รวม VAT)</span>
              </span>
              <span className="text-lg font-extrabold text-[#8E6F30] tabular-nums">
                ฿{memberFee.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method Radio Cards */}
          {memberFee > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#161C2C]">ช่องทางชำระเงิน</label>

              <button
                type="button"
                onClick={() => setPaymentMethod('promptpay')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                  paymentMethod === 'promptpay'
                    ? 'bg-[#FBF7EE] border-[#C5A059]'
                    : 'bg-white border-[#E6E0D4] hover:border-[#C5A059]/60'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                    paymentMethod === 'promptpay'
                      ? 'border-[#9A742B] bg-[#9A742B]'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {paymentMethod === 'promptpay' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#161C2C]">
                    QR PromptPay / โอนเงิน
                  </p>
                  <p className="text-[11px] text-slate-500">
                    แนบสลิปเพื่อยืนยัน · ตรวจสอบภายใน 1–2 วันทำการ
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                  paymentMethod === 'card'
                    ? 'bg-[#FBF7EE] border-[#C5A059]'
                    : 'bg-white border-[#E6E0D4] hover:border-[#C5A059]/60'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                    paymentMethod === 'card'
                      ? 'border-[#9A742B] bg-[#9A742B]'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {paymentMethod === 'card' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#161C2C]">
                    บัตรเครดิต / เดบิต
                  </p>
                  <p className="text-[11px] text-slate-500">ยืนยันที่นั่งทันทีหลังชำระ</p>
                </div>
              </button>
            </div>
          )}

          {/* Slip Upload Dropzone */}
          {memberFee > 0 && paymentMethod === 'promptpay' && (
            <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-dashed border-[#D5C39B] bg-[#FDFAF3] hover:bg-[#FBF6EC] cursor-pointer transition text-center">
              {slipDataUrl ? (
                <div className="space-y-2 flex flex-col items-center">
                  <img
                    src={slipDataUrl}
                    alt="ตัวอย่างสลิปการโอน"
                    className="max-h-40 rounded-xl object-contain border border-[#E6E0D4] bg-white shadow-sm"
                  />
                  <span className="text-[11px] font-bold text-[#9A742B] underline">
                    เปลี่ยนไฟล์สลิป ({slipFileName})
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-[#F3E8CE] text-[#8E6F30] flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#161C2C]">
                      อัปโหลดสลิปการโอน <span className="text-rose-500">*</span>
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs">
                      บัญชี ธ.กสิกรไทย 055-8-96255-9 (สภาอุตสาหกรรมฯ) · JPG, PNG, PDF ไม่เกิน 5 MB
                    </p>
                  </div>
                </>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSlipFileName(file.name);
                  if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        setSlipDataUrl(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setSlipDataUrl('');
                  }
                }}
              />
            </label>
          )}

          {/* Consent Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={acceptedTerms}
              onClick={() => setAcceptedTerms((prev) => !prev)}
              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition ${
                acceptedTerms
                  ? 'bg-[#12192B] border-[#12192B] text-white'
                  : 'bg-white border-slate-300'
              }`}
            >
              {acceptedTerms && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <span className="text-[11px] text-slate-600 leading-relaxed">
              ยอมรับ{' '}
              <span className="font-semibold text-[#8E6F30] underline">
                เงื่อนไขการสมัครเรียนและการยกเลิก
              </span>{' '}
              และยินยอมให้ใช้ข้อมูลตาม{' '}
              <span className="font-semibold text-[#8E6F30] underline">นโยบายความเป็นส่วนตัว</span>
            </span>
          </label>
        </div>

        {/* ================= STICKY BOTTOM SUBMIT BAR ================= */}
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E6E0D4] px-4 pt-3 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] sm:py-3.5 shadow-[0_-8px_24px_rgba(11,16,29,0.10)]">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium text-slate-500">ยอดชำระ</p>
              <p className="text-base sm:text-lg font-extrabold text-[#161C2C] tabular-nums leading-tight">
                {memberFee > 0 ? `฿${memberFee.toLocaleString()}` : 'เรียนฟรี'}
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition active:scale-95 shadow-sm"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-4 h-4 text-[#ECD28E]" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

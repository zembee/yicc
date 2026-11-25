'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { EventItem, EventRegistrationFieldConfig, UserProfile } from '@/types';
import { mockHouses, yftiParticipants } from '@/lib/mockData';
import { QRCodeSVG } from 'qrcode.react';
import {
  ChevronLeft,
  Info,
  Upload,
  ArrowRight,
  Check,
  AlertCircle,
  Copy,
  Download,
  Minus,
  Plus,
} from 'lucide-react';

interface EventRegistrationViewProps {
  event: EventItem;
  profile: UserProfile | null;
  initialValues?: {
    guestNames?: string[];
    dietaryType?: string;
    allergyNote?: string;
    customFields?: Record<string, string>;
  };
  onBack: () => void;
  onSubmitSuccess: (
    status: 'PENDING' | 'APPROVED',
    message: string,
    regRecord: Record<string, unknown>
  ) => void;
}

const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

const DEFAULT_DIETARY_OPTIONS = ['ทั่วไป', 'มังสวิรัติ', 'ฮาลาล', 'เจ'];

export const EventRegistrationView: React.FC<EventRegistrationViewProps> = ({
  event,
  profile,
  initialValues,
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

  const config = event.registration_config || {};
  const enableDietary = config.enableDietary !== false;
  const dietaryOptions =
    config.dietaryOptions && config.dietaryOptions.length > 0
      ? config.dietaryOptions
      : DEFAULT_DIETARY_OPTIONS;
  const enableAllergyNote = config.enableAllergyNote !== false;
  const enableGuests = config.enableGuests !== false;
  const maxGuests = config.maxGuests ?? 2;
  const memberFee = event.fee_member ?? 1500;
  const guestFee = config.guestFee ?? event.fee_guest ?? 2000;
  const customFields: EventRegistrationFieldConfig[] = useMemo(
    () => (config.customFields || []).filter((f) => f.enabled !== false && f.label.trim()),
    [config.customFields]
  );

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [houseGroup, setHouseGroup] = useState('The Sun');
  const [companyAndRole, setCompanyAndRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [dietaryType, setDietaryType] = useState<string>(
    initialValues?.dietaryType || dietaryOptions[0] || 'ทั่วไป'
  );
  const [allergyNote, setAllergyNote] = useState<string>(initialValues?.allergyNote || '');
  const [guestCount, setGuestCount] = useState<number>(
    initialValues?.guestNames ? Math.min(maxGuests, initialValues.guestNames.length) : 1
  );
  const [guestNames, setGuestNames] = useState<string[]>(
    initialValues?.guestNames && initialValues.guestNames.length > 0
      ? initialValues.guestNames
      : ['คุณปิยะนุช ศรีวัฒนกุล']
  );
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>(
    initialValues?.customFields || {}
  );

  const [slipFileName, setSlipFileName] = useState('');
  const [slipDataUrl, setSlipDataUrl] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  useEffect(() => {
    const cleanName = (profile?.display_name || matchedParticipant?.name_thai || '')
      .replace(/\s*\([^)]*\)\s*/g, '')
      .trim();
    const parenMatch = (profile?.display_name || '').match(/\(([^)]+)\)/);
    const derivedNick = matchedParticipant?.nickname_eng || parenMatch?.[1] || 'ต้น';
    const comp = profile?.company_name || matchedParticipant?.company_name_thai || '';
    const pos = profile?.position || matchedParticipant?.business_position || '';

    setFullName(cleanName || 'ณัฐวุฒิ ศรีวัฒนกุล');
    setNickname(derivedNick);
    setHouseGroup(resolvedHouseName);
    setCompanyAndRole(
      [comp, pos].filter(Boolean).join(' · ') || 'บจก. ศรีวัฒน์ อินดัสทรี · กรรมการผู้จัดการ'
    );
    setPhone(profile?.phone_number || matchedParticipant?.tel_number || '081-234-5678');
    setEmail(profile?.email || matchedParticipant?.email || 'nattawut@sriwat.co.th');
  }, [profile, matchedParticipant, resolvedHouseName]);

  const startD = new Date(event.start_time);
  const validStart = !Number.isNaN(startD.getTime());
  const badgeDay = validStart ? String(startD.getDate()) : '18';
  const badgeMonth = validStart ? THAI_SHORT_MONTHS[startD.getMonth()] : 'ธ.ค.';
  const startTimeShort = validStart
    ? `${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(2, '0')} น.`
    : '17:30 น.';
  const shortVenue = event.location_name.split('·')[0].trim();

  const effectiveGuestCount = enableGuests ? Math.max(0, Math.min(maxGuests, guestCount)) : 0;
  const totalAmount = memberFee + effectiveGuestCount * guestFee;

  const handleGuestCountChange = (nextCount: number) => {
    const clamped = Math.max(0, Math.min(maxGuests, nextCount));
    setGuestCount(clamped);
    setGuestNames((prev) => {
      const next = [...prev];
      while (next.length < clamped) next.push('');
      return next.slice(0, clamped);
    });
  };

  const handleCopyAccount = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('055-8-96255-9');
      setCopiedAccount(true);
      window.setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleSavePromptPayQr = () => {
    const svgEl = document.getElementById('event-promptpay-qr');
    if (!svgEl) return;
    const xml = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptpay-${event.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setFormError('กรุณากรอกข้อมูลผู้สมัครที่มีเครื่องหมาย * ให้ครบถ้วน');
      return;
    }

    if (enableGuests && effectiveGuestCount > 0) {
      const missingGuest = guestNames
        .slice(0, effectiveGuestCount)
        .some((name) => !name || !name.trim());
      if (missingGuest) {
        setFormError('กรุณาระบุชื่อ – นามสกุลผู้ติดตามให้ครบทุกท่าน');
        return;
      }
    }

    for (const field of customFields) {
      if (field.required && !(customFieldValues[field.id] || '').trim()) {
        setFormError(`กรุณาระบุ "${field.label}"`);
        return;
      }
    }

    if (!acceptedTerms) {
      setFormError('กรุณายอมรับเงื่อนไขการเข้าร่วมกิจกรรมและนโยบายความเป็นส่วนตัว');
      return;
    }

    const finalStatus: 'PENDING' | 'APPROVED' = 'APPROVED';
    const seatCode = `GN-${String(profile?.id || '0187')
      .replace(/\D/g, '')
      .padStart(4, '0')
      .slice(-4)}`;

    const newReg: Record<string, unknown> = {
      id: `reg-${Date.now()}`,
      profileId: profile?.id,
      eventId: event.id,
      eventTitle: event.title,
      applicantName: fullName.trim(),
      applicantNickname: nickname.trim(),
      applicantHouse: houseGroup,
      applicantCompany: companyAndRole.trim(),
      applicantPhone: phone.trim(),
      applicantEmail: email.trim(),
      dietaryType: enableDietary ? dietaryType : undefined,
      allergyNote: enableAllergyNote ? allergyNote.trim() : undefined,
      guestCount: effectiveGuestCount,
      guestNames: guestNames.slice(0, effectiveGuestCount).map((g) => g.trim()),
      customFields: customFieldValues,
      ticketType: 'สมาชิก YFTI',
      amount: totalAmount,
      seatCode,
      slipName: slipFileName || 'promptpay-slip.jpg',
      slipDataUrl: slipDataUrl || undefined,
      status: finalStatus,
      createdAt: new Date().toLocaleString('th-TH'),
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('yfti_event_registrations') || '[]');
        const filtered = Array.isArray(existing)
          ? existing.filter((r: any) => String(r.eventId) !== String(event.id))
          : [];
        filtered.unshift(newReg);
        localStorage.setItem('yfti_event_registrations', JSON.stringify(filtered));
      } catch {}
    }

    onSubmitSuccess(finalStatus, 'สมัครเข้าร่วมกิจกรรมเรียบร้อยแล้ว', newReg);
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
            <h1 className="text-base sm:text-lg font-extrabold text-white">สมัครเข้าร่วมกิจกรรม</h1>
          </div>

          {/* Event Summary Mini Card */}
          <div className="rounded-2xl bg-white/[0.06] border border-white/12 p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl luxury-gold-btn !text-[#12192B] flex flex-col items-center justify-center shrink-0 leading-none">
              <span className="text-base font-extrabold tabular-nums">{badgeDay}</span>
              <span className="text-[10px] font-bold mt-0.5">{badgeMonth}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-white leading-snug line-clamp-1">
                {event.title}
              </p>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                {startTimeShort} · {shortVenue}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3-STEP EVENT REGISTRATION FORM ================= */}
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

        {/* STEP 1: ข้อมูลผู้สมัคร */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-3.5">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#12192B] text-[#ECD28E] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#161C2C]">ข้อมูลผู้สมัคร</h2>
              <p className="text-[11px] text-slate-400">ใช้สำหรับลงทะเบียนเข้างานและติดต่อกลับ</p>
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
            </div>
          </div>
        </div>

        {/* STEP 2: รายละเอียดการเข้าร่วม (Dynamic Admin-Configurable Fields) */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-4">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#12192B] text-[#ECD28E] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#161C2C]">
                รายละเอียดการเข้าร่วม
              </h2>
              <p className="text-[11px] text-slate-400">ช่วยให้ทีมงานเตรียมอาหารและที่นั่งได้ถูกต้อง</p>
            </div>
          </div>

          {enableDietary && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#161C2C]">
                ประเภทอาหาร <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {dietaryOptions.map((option) => {
                  const isSelected = dietaryType === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDietaryType(option)}
                      className={`py-2 px-2 rounded-full text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-[#12192B] border-[#12192B] text-white'
                          : 'bg-white border-[#E6E0D4] text-[#394154] hover:border-[#C5A059]'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {enableAllergyNote && (
            <div>
              <label className="block text-xs font-bold text-[#161C2C] mb-1">
                แพ้อาหาร / ข้อจำกัดอื่นๆ
              </label>
              <input
                type="text"
                value={allergyNote}
                onChange={(e) => setAllergyNote(e.target.value)}
                placeholder="เช่น แพ้อาหารทะเล, ไม่ทานเนื้อวัว"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C] placeholder:text-slate-400"
              />
            </div>
          )}

          {enableGuests && (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#F6F4EF] flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-[#161C2C]">ผู้ติดตาม</p>
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    ท่านละ ฿{guestFee.toLocaleString()} · สูงสุด {maxGuests} ท่าน
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleGuestCountChange(effectiveGuestCount - 1)}
                    disabled={effectiveGuestCount <= 0}
                    aria-label="ลดจำนวนผู้ติดตาม"
                    className="w-8 h-8 rounded-full bg-white border border-[#E6E0D4] text-[#161C2C] disabled:opacity-40 flex items-center justify-center transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-extrabold text-[#161C2C] tabular-nums">
                    {effectiveGuestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleGuestCountChange(effectiveGuestCount + 1)}
                    disabled={effectiveGuestCount >= maxGuests}
                    aria-label="เพิ่มจำนวนผู้ติดตาม"
                    className="w-8 h-8 rounded-full bg-white border border-[#E6E0D4] text-[#161C2C] disabled:opacity-40 flex items-center justify-center transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {Array.from({ length: effectiveGuestCount }).map((_, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-bold text-[#161C2C] mb-1">
                    {effectiveGuestCount === 1
                      ? 'ชื่อ – นามสกุลผู้ติดตาม'
                      : `ชื่อ – นามสกุลผู้ติดตามท่านที่ ${idx + 1}`}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestNames[idx] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGuestNames((prev) => {
                        const next = [...prev];
                        next[idx] = val;
                        return next;
                      });
                    }}
                    placeholder={`ระบุชื่อผู้ติดตามท่านที่ ${idx + 1}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-xs sm:text-sm text-[#161C2C] placeholder:text-slate-400"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Custom Admin-Defined Fields */}
          {customFields.length > 0 && (
            <div className="space-y-3 pt-1 border-t border-[#F1ECE2]">
              {customFields.map((field) => {
                const value = customFieldValues[field.id] || '';
                const setValue = (v: string) =>
                  setCustomFieldValues((prev) => ({ ...prev, [field.id]: v }));

                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#161C2C]">
                      {field.label}
                      {field.required && <span className="text-rose-500"> *</span>}
                    </label>

                    {field.type === 'radio' && field.options && field.options.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {field.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setValue(opt)}
                            className={`px-3.5 py-2 rounded-full text-xs font-bold border transition ${
                              value === opt
                                ? 'bg-[#12192B] border-[#12192B] text-white'
                                : 'bg-white border-[#E6E0D4] text-[#394154] hover:border-[#C5A059]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : field.type === 'select' && field.options && field.options.length > 0 ? (
                      <select
                        required={field.required}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] outline-none text-xs sm:text-sm text-[#161C2C]"
                      >
                        <option value="">-- เลือก{field.label} --</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={2}
                        required={field.required}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={field.placeholder || `ระบุ${field.label}`}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] outline-none text-xs sm:text-sm text-[#161C2C]"
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        required={field.required}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={field.placeholder || `ระบุ${field.label}`}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D4] focus:border-[#C5A059] outline-none text-xs sm:text-sm text-[#161C2C]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 3: ชำระค่าลงทะเบียน */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-4">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#12192B] text-[#ECD28E] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#161C2C]">
                ชำระค่าลงทะเบียน
              </h2>
              <p className="text-[11px] text-slate-400">ทีมงานจะตรวจสอบสลิปภายใน 1–2 วันทำการ</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-2xl bg-[#F6F4EF] p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>บัตรสมาชิก × 1</span>
              <span className="tabular-nums font-semibold text-[#161C2C]">
                ฿{memberFee.toLocaleString()}
              </span>
            </div>
            {effectiveGuestCount > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>ผู้ติดตาม × {effectiveGuestCount}</span>
                <span className="tabular-nums font-semibold text-[#161C2C]">
                  ฿{(effectiveGuestCount * guestFee).toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t border-[#E5DEC9] pt-2.5 flex items-baseline justify-between">
              <span className="font-extrabold text-[#161C2C]">ยอดชำระทั้งหมด</span>
              <span className="text-lg font-extrabold text-[#8E6F30] tabular-nums">
                ฿{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* PromptPay QR Payment Box */}
          {totalAmount > 0 && (
            <div className="rounded-2xl border border-[#EFE7D6] bg-white p-3.5 flex items-center gap-3.5">
              <div className="p-2 rounded-xl border border-[#E6E0D4] bg-white shrink-0">
                <QRCodeSVG
                  id="event-promptpay-qr"
                  value={`PROMPTPAY|YFTI11|${event.id}|${totalAmount}`}
                  size={64}
                  level="M"
                  fgColor="#12192B"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="text-xs font-extrabold text-[#161C2C]">สแกนจ่ายผ่าน PromptPay</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    ชื่อบัญชี: โครงการ Young FTI ELITE 11
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSavePromptPayQr}
                    className="py-1.5 px-2.5 rounded-xl bg-[#F6F4EF] hover:bg-[#EFECE4] text-[11px] font-bold text-[#161C2C] inline-flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-[#9A742B]" />
                    <span>บันทึก QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="py-1.5 px-2.5 rounded-xl bg-[#F6F4EF] hover:bg-[#EFECE4] text-[11px] font-bold text-[#161C2C] inline-flex items-center justify-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#9A742B]" />
                    <span>{copiedAccount ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Slip Upload Dropzone */}
          {totalAmount > 0 && (
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
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      JPG, PNG หรือ PDF ไม่เกิน 5 MB
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
                เงื่อนไขการเข้าร่วมกิจกรรม
              </span>{' '}
              และยินยอมให้ใช้ข้อมูลเพื่อการจัดงานตาม{' '}
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
                {totalAmount > 0 ? `฿${totalAmount.toLocaleString()}` : 'เข้าร่วมฟรี'}
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#12192B] hover:bg-[#1B2540] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition active:scale-95 shadow-sm"
            >
              <span>ส่งใบสมัคร</span>
              <ArrowRight className="w-4 h-4 text-[#ECD28E]" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

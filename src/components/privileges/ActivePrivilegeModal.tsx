'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ActivePrivilegeData {
  title: string;
  merchant: string;
  discountLabel?: string;
  code: string;
  redeemedAt?: string;
}

interface ActivePrivilegeModalProps {
  data: ActivePrivilegeData | null;
  onClose: () => void;
}

function Barcode1DSvg({ code }: { code: string }) {
  const bars = useMemo(() => {
    const modules: { x: number; w: number }[] = [];
    let cursor = 0;
    const str = code || 'YFTI-ACTIVE';
    // Guard start bars
    modules.push({ x: cursor, w: 2 });
    cursor += 4;
    modules.push({ x: cursor, w: 2 });
    cursor += 5;

    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      for (let bit = 0; bit < 4; bit++) {
        const val = (charCode >> (bit * 2)) & 0x03;
        const barW = (val % 3) + 1;
        const gapW = ((val >> 1) % 2) + 2;
        modules.push({ x: cursor, w: barW });
        cursor += barW + gapW;
      }
    }

    // Guard end bars
    modules.push({ x: cursor, w: 2 });
    cursor += 4;
    modules.push({ x: cursor, w: 2 });
    cursor += 2;

    return { modules, totalWidth: cursor };
  }, [code]);

  return (
    <svg
      viewBox={`0 0 ${bars.totalWidth} 52`}
      className="w-full h-14 max-w-[260px] mx-auto"
      role="img"
      aria-label={`Barcode ${code}`}
      preserveAspectRatio="none"
    >
      {bars.modules.map((bar, idx) => (
        <rect key={idx} x={bar.x} y={0} width={bar.w} height={52} fill="#1E2538" />
      ))}
    </svg>
  );
}

export const ActivePrivilegeModal: React.FC<ActivePrivilegeModalProps> = ({ data, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!data) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, onClose]);

  if (!data || typeof document === 'undefined') return null;

  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Active Privilege"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 fade-in-soft"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#F8FAFC] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark Navy Header Bar */}
        <div className="bg-[#1E2538] text-white px-5 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-sm sm:text-base font-black tracking-tight">Active Privilege</h3>
          <div className="w-8" />
        </div>

        {/* Scrollable Body */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* 1. QR Code Card with Gold Scan Line */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col items-center space-y-3.5">
            <div className="relative p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <QRCodeSVG value={data.code} size={160} level="M" fgColor="#1E2538" />
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.7)] rounded-full pointer-events-none" />
            </div>
            <span className="px-3.5 py-1 rounded-full bg-slate-100 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              SCAN TO REDEEM
            </span>
          </div>

          {/* 2. 1D Barcode Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm text-center space-y-2">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">
              BARCODE
            </span>
            <Barcode1DSvg code={data.code} />
          </div>

          {/* 3. Code Card + Copy Button */}
          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5 shadow-sm flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block">รหัส (CODE)</span>
              <span className="font-mono text-sm sm:text-base font-black text-[#1E2538] tracking-wider truncate block">
                {data.code}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
            </button>
          </div>

          {/* 4. Red Warning Callout */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-start gap-2.5 text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <p className="text-[11px] font-bold leading-relaxed">
              แสดงหน้าจอนี้ให้พนักงานสแกน QR / บาร์โค้ด หรือกรอกรหัสเพื่อรับสิทธิ์
            </p>
          </div>

          {/* 5. Privilege Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm space-y-0.5">
            <p className="text-xs sm:text-sm font-black text-[#1E2538] line-clamp-1">
              {data.discountLabel ? `${data.discountLabel} • ${data.title}` : data.title}
            </p>
            <p className="text-[11px] text-slate-500">
              {data.merchant}
              {data.redeemedAt ? ` • ${data.redeemedAt}` : ''}
            </p>
          </div>

          {/* 6. Done Gold Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C69C46] to-[#B08635] hover:opacity-95 text-white text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>เสร็จสิ้น</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

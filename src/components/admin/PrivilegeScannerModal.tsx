'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Html5QrcodeScanner } from 'html5-qrcode';
import {
  X,
  QrCode,
  Camera,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Ticket,
  Clock,
  User,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import type { PrivilegeRedemptionRecord } from '@/app/api/privileges/redemptions/route';

interface PrivilegeScannerModalProps {
  isOpen: boolean;
  initialCode?: string;
  adminName?: string;
  onClose: () => void;
  onVerified?: (record: PrivilegeRedemptionRecord) => void;
}

export const PrivilegeScannerModal: React.FC<PrivilegeScannerModalProps> = ({
  isOpen,
  initialCode = '',
  adminName = 'Admin',
  onClose,
  onVerified,
}) => {
  const [mode, setMode] = useState<'camera' | 'manual'>(initialCode ? 'manual' : 'camera');
  const [manualCode, setManualCode] = useState(initialCode);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [lookupResult, setLookupResult] = useState<PrivilegeRedemptionRecord | null>(null);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setJustConfirmed(false);
    setLookupResult(null);
    if (initialCode) {
      setMode('manual');
      setManualCode(initialCode);
      void lookupCode(initialCode);
    } else {
      setMode('camera');
      setManualCode('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
  };

  const extractPrivilegeCode = (rawText: string): string => {
    const trimmed = rawText.trim();
    try {
      const parsed = JSON.parse(trimmed) as { code?: string };
      if (parsed && typeof parsed.code === 'string' && parsed.code.trim()) {
        return parsed.code.trim().toUpperCase();
      }
    } catch {
      // Plain text code (e.g. YEC-XXXXXXX-1234)
    }
    return trimmed.toUpperCase();
  };

  const lookupCode = async (rawCode: string) => {
    const code = extractPrivilegeCode(rawCode);
    if (!code) {
      setErrorMsg('กรุณาระบุรหัสสิทธิพิเศษ');
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    setIsLookingUp(true);
    setErrorMsg(null);
    setJustConfirmed(false);

    try {
      const res = await fetch(`/api/privileges/redemptions?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = (await res.json()) as { redemption?: PrivilegeRedemptionRecord | null };
        if (data.redemption) {
          stopCamera();
          setLookupResult(data.redemption);
          return;
        }
      }

      // Fallback: check localStorage on same device (for previously redeemed local-only codes)
      if (typeof window !== 'undefined') {
        try {
          const localRaw = JSON.parse(localStorage.getItem('yfti_redemptions') || '[]');
          if (Array.isArray(localRaw)) {
            const localMatch = localRaw.find(
              (r: any) => typeof r?.code === 'string' && r.code.trim().toUpperCase() === code
            );
            if (localMatch) {
              // Sync local code to server so verification works cleanly
              const syncRes = await fetch('/api/privileges/redemptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: localMatch.id,
                  code: localMatch.code,
                  privilegeId: localMatch.privilegeId,
                  title: localMatch.title,
                  merchant: localMatch.merchant,
                  discountLabel: localMatch.discountLabel,
                  points: localMatch.points,
                  redeemedAt: localMatch.redeemedAt,
                }),
              });
              if (syncRes.ok) {
                const synced = (await syncRes.json()) as { redemption?: PrivilegeRedemptionRecord };
                if (synced.redemption) {
                  stopCamera();
                  setLookupResult(synced.redemption);
                  return;
                }
              }
            }
          }
        } catch {}
      }

      setErrorMsg(`ไม่พบรหัส "${code}" ในระบบ กรุณาตรวจสอบอีกครั้ง`);
    } catch {
      setErrorMsg('ไม่สามารถเชื่อมต่อเพื่อตรวจสอบรหัสได้ กรุณาลองใหม่');
    } finally {
      setIsLookingUp(false);
      busyRef.current = false;
    }
  };

  useEffect(() => {
    if (!isOpen || mode !== 'camera' || lookupResult) return;
    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        const { Html5QrcodeScanner: QrScanner } = await import('html5-qrcode');
        if (cancelled) return;

        const scanner = new QrScanner(
          'privilege-qr-reader',
          {
            fps: 10,
            qrbox: { width: 230, height: 230 },
            aspectRatio: 1.0,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            void lookupCode(decodedText);
          },
          () => {
            // ignore continuous frame scan errors
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.error('Privilege QR Scanner init error:', err);
        if (!cancelled) {
          setErrorMsg('ไม่สามารถเปิดกล้องได้ กรุณาใช้โหมดกรอกรหัสแทน');
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, lookupResult]);

  const handleConfirmUse = async () => {
    if (!lookupResult || lookupResult.status === 'USED') return;
    setIsConfirming(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/privileges/redemptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: lookupResult.code,
          verifiedBy: adminName,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        redemption?: PrivilegeRedemptionRecord;
      };

      if (!res.ok) {
        if (data.redemption) {
          setLookupResult(data.redemption);
        }
        setErrorMsg(data.error || 'ไม่สามารถตัดสิทธิ์ได้');
        return;
      }

      if (data.redemption) {
        setLookupResult(data.redemption);
        setJustConfirmed(true);
        onVerified?.(data.redemption);
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReset = () => {
    setLookupResult(null);
    setJustConfirmed(false);
    setErrorMsg(null);
    setManualCode('');
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="สแกนตรวจสอบสิทธิพิเศษ"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 fade-in-soft"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1E2538] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E5C158]" />
            <div>
              <h3 className="text-sm sm:text-base font-extrabold leading-tight">
                สแกนตรวจ &amp; ตัดสิทธิ์ Privilege
              </h3>
              <p className="text-[11px] text-slate-300">
                สแกน QR จากหน้าจอสมาชิก หรือกรอกรหัส YEC-...
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {!lookupResult ? (
            <>
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('camera');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    mode === 'camera'
                      ? 'bg-[#1E2538] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#1E2538]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>สแกนกล้อง QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setErrorMsg(null);
                    setMode('manual');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    mode === 'manual'
                      ? 'bg-[#1E2538] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#1E2538]'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>กรอกรหัสคูปอง</span>
                </button>
              </div>

              {mode === 'camera' ? (
                <div className="space-y-2.5">
                  <div
                    id="privilege-qr-reader"
                    className="w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 min-h-[240px]"
                  />
                  <p className="text-[11px] text-slate-500 text-center">
                    ส่องกล้องไปที่ QR Code ในหน้า Active Privilege ของสมาชิก
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void lookupCode(manualCode);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      รหัสสิทธิพิเศษ (Coupon Code)
                    </label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="เช่น YEC-AB12CD3-4567"
                      autoFocus
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#1E2538] outline-none font-mono text-sm font-bold text-[#1E2538] tracking-wider"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLookingUp || !manualCode.trim()}
                    className="w-full py-3 rounded-xl bg-[#1E2538] hover:bg-[#2A334E] disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition"
                  >
                    {isLookingUp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังตรวจสอบรหัส...</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 text-[#E5C158]" />
                        <span>ตรวจสอบรหัสสิทธิพิเศษ</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Status Banner */}
              {justConfirmed ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-extrabold text-emerald-800">
                    ยืนยันตัดสิทธิ์สำเร็จ!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    บันทึกการใช้สิทธิ์เรียบร้อยแล้ว รหัสนี้ไม่สามารถใช้ซ้ำได้
                  </p>
                </div>
              ) : lookupResult.status === 'USED' ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-extrabold text-rose-800">
                    รหัสนี้ถูกใช้สิทธิ์ไปแล้ว
                  </h4>
                  <p className="text-xs text-rose-700">
                    ใช้เมื่อ {lookupResult.usedAt || '-'}
                    {lookupResult.verifiedBy ? ` • โดย ${lookupResult.verifiedBy}` : ''}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      STATUS: ACTIVE • พร้อมใช้งาน
                    </span>
                    <p className="text-xs font-bold text-[#1E2538]">
                      รหัสถูกต้อง สามารถกดยืนยันตัดสิทธิ์ได้ทันที
                    </p>
                  </div>
                </div>
              )}

              {/* Coupon Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-semibold">รหัสคูปอง</span>
                  <span className="font-mono font-black text-[#1E2538] tracking-wider">
                    {lookupResult.code}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    {lookupResult.merchant}
                  </span>
                  <p className="text-sm font-extrabold text-[#1E2538] leading-snug">
                    {lookupResult.discountLabel
                      ? `${lookupResult.discountLabel} • ${lookupResult.title}`
                      : lookupResult.title}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> สมาชิกผู้แลก
                    </span>
                    <span className="font-bold text-[#1E2538]">
                      {lookupResult.memberName || 'สมาชิก Young FTI 11'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> เวลาที่แลกสิทธิ์
                    </span>
                    <span className="font-semibold text-slate-700">{lookupResult.redeemedAt}</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {lookupResult.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={handleConfirmUse}
                    disabled={isConfirming}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C69C46] to-[#B08635] hover:opacity-95 disabled:opacity-50 text-white text-sm font-extrabold shadow-md flex items-center justify-center gap-2 transition"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังบันทึกการตัดสิทธิ์...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ยืนยันตัดสิทธิ์ (Confirm Redeem)</span>
                      </>
                    )}
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E2538] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>สแกนรายการถัดไป</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-3 rounded-xl bg-[#1E2538] hover:bg-[#2A334E] text-white text-xs font-bold transition"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

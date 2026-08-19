'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AlertTriangle, X, ShieldCheck, UserCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export const QrScannerModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            handleDecodedText(decodedText);
          },
          (errorMessage) => {
            // silent scan error loop
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.error('QR Scanner init error:', err);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isOpen]);

  const handleDecodedText = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScanError(null);

    try {
      const payload = JSON.parse(decodedText);
      const now = Date.now();

      // ตรวจสอบความถูกต้องของ Token
      if (payload.ts && Math.abs(now - payload.ts) > 60000) {
        setScanError('QR Code นี้หมดอายุแล้ว (กรุณาให้สมาชิกเปิดหน้าจอสด)');
        setIsProcessing(false);
        return;
      }

      setScanResult(payload);
      onSuccess(payload);
    } catch (e) {
      setScanError('รูปแบบ QR Code ไม่ถูกต้องสำหรับระบบ YFTI');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setScanError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#212542]/70 backdrop-blur-md">
      <div className="bg-white border border-[#EEEEEE] w-full max-w-sm rounded-3xl p-5 relative shadow-2xl flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6B7280] hover:text-[#212542] bg-[#F8F9FC]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#212542]" />
          <h3 className="text-base font-extrabold text-[#212542]">Staff QR Check-in Scanner</h3>
        </div>

        {/* Viewfinder or Success Card */}
        {!scanResult ? (
          <div className="w-full">
            <div id="qr-reader" className="w-full rounded-2xl overflow-hidden bg-[#F8F9FC] border border-[#EEEEEE] text-[#292929]" />
            <p className="text-xs text-[#6B7280] text-center mt-3 font-medium">
              สแกน QR Code จากหน้าจอสมาร์ทโฟนของสมาชิก
            </p>

            {scanError && (
              <div className="mt-3 p-3 rounded-xl bg-[#FFF5F5] border border-[#FFD7D7] text-[#FB7170] text-xs flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center text-center py-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
              <UserCheck className="w-8 h-8" />
            </div>

            <h4 className="text-lg font-extrabold text-[#212542] mb-1">เช็คชื่อสำเร็จ!</h4>
            <p className="text-sm font-bold text-emerald-600 mb-1">{scanResult.displayName || 'สมาชิก Cohort'}</p>
            <p className="text-xs text-[#6B7280] mb-4">{scanResult.eventTitle || 'กิจกรรมพิเศษ'}</p>

            <div className="w-full bg-[#F8F9FC] p-3.5 rounded-2xl border border-[#EEEEEE] text-xs text-[#292929] mb-5 space-y-1 text-left font-mono">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">LINE ID:</span>
                <span className="font-semibold text-[#212542]">{scanResult.lineUserId || 'Verified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Reward:</span>
                <span className="text-[#FB7170] font-extrabold">+50 Coins / +100 XP</span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#F8F9FC] text-[#212542] text-xs font-bold border border-[#EEEEEE] hover:bg-[#EEEEEE]"
              >
                สแกนคนถัดไป
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#212542] text-white font-extrabold text-xs hover:bg-[#2d335a] shadow-md shadow-[#212542]/20"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

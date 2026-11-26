'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Check, Expand, Loader2, RefreshCw, Upload, X } from 'lucide-react';
import { DEFAULT_AVATAR_DATA_URI, handleAvatarError } from './profileUtils';

interface EditProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSrc: string;
  displayName: string;
  memberId?: string;
  lineUserId?: string;
  linePictureUrl?: string;
  onSaved: (newPictureUrl: string) => void;
  onViewFullScreen: () => void;
}

const MAX_DIMENSION = 640;

async function compressImageToBlob(file: File): Promise<{ blob: Blob; previewUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพนี้ได้'));
      image.src = objectUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const targetWidth = Math.max(1, Math.round(img.width * scale));
    const targetHeight = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('เบราว์เซอร์ไม่รองรับการประมวลผลรูปภาพ');
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('ไม่สามารถบีบอัดรูปภาพได้'));
        },
        'image/jpeg',
        0.86
      );
    });

    const previewUrl = URL.createObjectURL(blob);
    return { blob, previewUrl };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export const EditProfilePhotoModal: React.FC<EditProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  currentSrc,
  displayName,
  memberId,
  lineUserId,
  linePictureUrl,
  onSaved,
  onViewFullScreen,
}) => {
  const [mounted, setMounted] = useState(false);
  const [stagedBlob, setStagedBlob] = useState<Blob | null>(null);
  const [stagedUrl, setStagedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const blobPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset modal state whenever opened/closed
  useEffect(() => {
    if (!isOpen) {
      if (blobPreviewRef.current) {
        URL.revokeObjectURL(blobPreviewRef.current);
        blobPreviewRef.current = null;
      }
      setStagedBlob(null);
      setStagedUrl(null);
      setErrorMsg(null);
      setIsProcessing(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !mounted) return null;

  const previewSrc = stagedUrl || currentSrc || DEFAULT_AVATAR_DATA_URI;
  const hasPendingChange = Boolean(stagedBlob || (stagedUrl && stagedUrl !== currentSrc));
  const showLineOption = Boolean(
    linePictureUrl &&
      linePictureUrl !== currentSrc &&
      linePictureUrl !== stagedUrl
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const { blob, previewUrl } = await compressImageToBlob(file);
      if (blobPreviewRef.current) {
        URL.revokeObjectURL(blobPreviewRef.current);
      }
      blobPreviewRef.current = previewUrl;
      setStagedBlob(blob);
      setStagedUrl(previewUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'ไม่สามารถโหลดรูปภาพได้');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseLinePhoto = () => {
    if (!linePictureUrl) return;
    if (blobPreviewRef.current) {
      URL.revokeObjectURL(blobPreviewRef.current);
      blobPreviewRef.current = null;
    }
    setErrorMsg(null);
    setStagedBlob(null);
    setStagedUrl(linePictureUrl);
  };

  const handleSave = async () => {
    if (!hasPendingChange || isSaving) return;

    setErrorMsg(null);
    setIsSaving(true);
    try {
      let res: Response;
      if (stagedBlob) {
        const formData = new FormData();
        formData.append('file', new File([stagedBlob], 'avatar.jpg', { type: 'image/jpeg' }));
        if (memberId) formData.append('memberId', String(memberId));
        if (lineUserId) formData.append('lineUserId', lineUserId);
        if (displayName) formData.append('displayName', displayName);
        res = await fetch('/api/members/avatar', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/members/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId,
            lineUserId,
            displayName,
            pictureUrl: stagedUrl,
          }),
        });
      }

      const data = (await res.json()) as { ok?: boolean; pictureUrl?: string; error?: string };
      if (!res.ok || !data.pictureUrl) {
        throw new Error(data.error || 'ไม่สามารถบันทึกรูปโปรไฟล์ได้');
      }

      onSaved(data.pictureUrl);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกรูปโปรไฟล์');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="แก้ไขรูปโปรไฟล์"
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-[#080C18]/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        className="w-full max-w-md luxury-stage text-white rounded-t-[28px] sm:rounded-[28px] border border-[#C5A059]/30 p-5 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] sm:p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#ECD28E]" />
            <h3 className="text-base font-extrabold text-white">แก้ไขรูปโปรไฟล์</h3>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar Preview */}
        <div className="flex flex-col items-center gap-3 py-1">
          <div className="relative">
            <img
              src={previewSrc}
              alt={displayName}
              onError={handleAvatarError}
              className="w-32 h-32 rounded-full object-cover object-top ring-2 ring-[#ECD28E]/60 bg-[#0D1321] shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
            />
            {isProcessing && (
              <div className="absolute inset-0 rounded-full bg-[#080C18]/70 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#ECD28E] animate-spin" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onViewFullScreen();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.07] hover:bg-white/[0.14] text-[11px] font-semibold text-slate-200 transition"
          >
            <Expand className="w-3 h-3 text-[#ECD28E]" />
            <span>ดูรูปขนาดเต็ม</span>
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-2xl bg-rose-500/15 border border-rose-400/30 px-3.5 py-2.5 text-xs text-rose-200 text-center">
            {errorMsg}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isProcessing || isSaving}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-extrabold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-[#ECD28E]" />
            <span>{stagedUrl ? 'เลือกรูปอื่น' : 'เลือกรูปภาพจากเครื่อง'}</span>
          </button>

          {showLineOption && (
            <button
              type="button"
              disabled={isProcessing || isSaving}
              onClick={handleUseLinePhoto}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#ECD28E]" />
              <span>ใช้รูปโปรไฟล์จาก LINE</span>
            </button>
          )}

          {hasPendingChange && (
            <button
              type="button"
              disabled={isProcessing || isSaving}
              onClick={handleSave}
              className="w-full py-3 px-4 rounded-2xl luxury-gold-btn !text-[#12192B] text-xs font-extrabold transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกรูปโปรไฟล์...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>บันทึกรูปโปรไฟล์</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

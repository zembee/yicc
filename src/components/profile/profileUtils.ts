export const DEFAULT_AVATAR_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="24" fill="#1E2538"/>
      <circle cx="64" cy="48" r="22" fill="#C59B38" fill-opacity="0.85"/>
      <path d="M26 110c4-22 19-34 38-34s34 12 38 34" fill="#C59B38" fill-opacity="0.65"/>
    </svg>`
  );

export function handleAvatarError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  img.onerror = null;
  if (img.src !== DEFAULT_AVATAR_DATA_URI) {
    img.src = DEFAULT_AVATAR_DATA_URI;
  }
}

export function safeReadLocalStorage<T>(
  key: string,
  fallback: T,
  validator?: (value: unknown) => value is T
): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validator) {
      return validator(parsed) ? parsed : fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function safeWriteLocalStorage(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function formatMemberCode(rawId: string | number | undefined | null): string {
  const str = String(rawId ?? '').trim();
  const digits = str.replace(/\D/g, '');
  if (digits.length > 0) {
    const normalized = digits.length > 6 ? digits.slice(-4) : digits.padStart(4, '0');
    return `Y11-${normalized}`;
  }
  const alnum = str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
  return `Y11-${alnum || 'GUEST'}`;
}

export function getRoleBadge(role: string | undefined): {
  label: string;
  className: string;
} {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        label: 'ADMIN',
        className: 'badge-gold-metallic',
      };
    case 'HOUSE_ADMIN':
      return {
        label: 'HOUSE ADMIN',
        className: 'badge-gold-metallic',
      };
    case 'PENDING':
      return {
        label: 'PENDING',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-400/40',
      };
    default:
      return {
        label: 'MEMBER',
        className: 'badge-gold-metallic',
      };
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below for restricted WebViews / HTTP contexts
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export interface MissionSubmissionRecord {
  status: 'APPROVED' | 'PENDING' | 'NOT_STARTED';
  fileName?: string;
  note?: string;
  submittedAt?: string;
  previewDataUrl?: string;
}

export function normalizeMissionRecords(
  raw: unknown
): Record<string, MissionSubmissionRecord> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const result: Record<string, MissionSubmissionRecord> = {};
  for (const [missionId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string') {
      if (value === 'APPROVED' || value === 'PENDING' || value === 'NOT_STARTED') {
        result[missionId] = { status: value };
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      const rec = value as Record<string, unknown>;
      const status = rec.status;
      if (status === 'APPROVED' || status === 'PENDING' || status === 'NOT_STARTED') {
        result[missionId] = {
          status,
          fileName: typeof rec.fileName === 'string' ? rec.fileName : undefined,
          note: typeof rec.note === 'string' ? rec.note : undefined,
          submittedAt: typeof rec.submittedAt === 'string' ? rec.submittedAt : undefined,
          previewDataUrl:
            typeof rec.previewDataUrl === 'string' ? rec.previewDataUrl : undefined,
        };
      }
    }
  }
  return result;
}

const MAX_PROOF_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export function readImageProofFile(
  file: File
): Promise<{ fileName: string; previewDataUrl: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น'));
      return;
    }
    if (file.size > MAX_PROOF_FILE_BYTES) {
      reject(new Error('ขนาดไฟล์ต้องไม่เกิน 5 MB'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      // Create a small thumbnail so localStorage won't hit quota limits
      const img = new window.Image();
      img.onerror = () => resolve({ fileName: file.name, previewDataUrl: '' });
      img.onload = () => {
        try {
          const maxDim = 240;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ fileName: file.name, previewDataUrl: '' });
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          resolve({ fileName: file.name, previewDataUrl: thumbnail });
        } catch {
          resolve({ fileName: file.name, previewDataUrl: '' });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

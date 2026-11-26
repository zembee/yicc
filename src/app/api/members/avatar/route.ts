import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readCloudJsonStore, writeCloudJsonStore } from '@/lib/serverJsonStore';

export const dynamic = 'force-dynamic';

export interface MemberAvatarRecord {
  member_id?: string;
  line_user_id?: string;
  display_name?: string;
  picture_url: string;
  updated_at: string;
}

const STORE_FILE = 'member-avatars.json';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB raw upload limit
const MAX_DATA_URL_BYTES = 600 * 1024; // 600KB fallback limit for JSON store

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes('mock-yicc')) return null;
  return createClient(url, key);
}

function findAvatarRecord(
  records: MemberAvatarRecord[],
  memberId?: string | null,
  lineUserId?: string | null
): MemberAvatarRecord | undefined {
  return records.find(
    (r) =>
      (memberId && r.member_id && String(r.member_id) === String(memberId)) ||
      (lineUserId && r.line_user_id && r.line_user_id === lineUserId)
  );
}

function sanitizeKey(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48) || 'member';
}

function isAllowedPictureUrl(url: string): boolean {
  return (
    url.startsWith('https://') ||
    url.startsWith('http://') ||
    url.startsWith('data:image/')
  );
}

export async function GET(req: NextRequest) {
  try {
    const memberId = req.nextUrl.searchParams.get('memberId')?.trim();
    const lineUserId = req.nextUrl.searchParams.get('lineUserId')?.trim();

    if (!memberId && !lineUserId) {
      return NextResponse.json({ pictureUrl: null });
    }

    const records = await readCloudJsonStore<MemberAvatarRecord[]>(STORE_FILE, []);
    const match = findAvatarRecord(records, memberId, lineUserId);
    return NextResponse.json({ pictureUrl: match?.picture_url || null });
  } catch (error) {
    console.error('GET /api/members/avatar error:', error);
    return NextResponse.json({ pictureUrl: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let memberId: string | undefined;
    let lineUserId: string | undefined;
    let displayName: string | undefined;
    let resolvedPictureUrl = '';
    let storageSaved = false;

    const sb = getSupabaseServerClient();

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const rawMemberId = formData.get('memberId');
      const rawLineUserId = formData.get('lineUserId');
      const rawDisplayName = formData.get('displayName');

      memberId = typeof rawMemberId === 'string' ? rawMemberId.trim() || undefined : undefined;
      lineUserId = typeof rawLineUserId === 'string' ? rawLineUserId.trim() || undefined : undefined;
      displayName = typeof rawDisplayName === 'string' ? rawDisplayName.trim() || undefined : undefined;

      if (!memberId && !lineUserId) {
        return NextResponse.json({ error: 'ไม่พบข้อมูลสมาชิก' }, { status: 400 });
      }

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'กรุณาเลือกไฟล์รูปภาพ' }, { status: 400 });
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'รองรับเฉพาะไฟล์รูปภาพเท่านั้น' }, { status: 400 });
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ error: 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5MB)' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type || 'image/jpeg';
      const ext =
        mimeType === 'image/png'
          ? 'png'
          : mimeType === 'image/webp'
          ? 'webp'
          : 'jpg';

      if (sb) {
        try {
          const ownerKey = sanitizeKey(memberId || lineUserId || 'member');
          const objectPath = `avatars/${ownerKey}-${Date.now()}.${ext}`;
          const { error: uploadError } = await sb.storage
            .from('participants-assets')
            .upload(objectPath, buffer, {
              contentType: mimeType,
              cacheControl: '3600',
              upsert: false,
            });

          if (!uploadError) {
            const { data: publicData } = sb.storage
              .from('participants-assets')
              .getPublicUrl(objectPath);
            if (publicData?.publicUrl) {
              resolvedPictureUrl = publicData.publicUrl;
              storageSaved = true;
            }
          } else {
            console.warn('Supabase avatar upload failed:', uploadError.message);
          }
        } catch (err) {
          console.warn('Supabase avatar upload error:', err);
        }
      }

      if (!resolvedPictureUrl) {
        if (buffer.byteLength > MAX_DATA_URL_BYTES) {
          return NextResponse.json(
            { error: 'ไม่สามารถอัปโหลดรูปภาพขนาดใหญ่ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง' },
            { status: 413 }
          );
        }
        resolvedPictureUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    } else {
      const body = (await req.json()) as {
        memberId?: string;
        lineUserId?: string;
        displayName?: string;
        pictureUrl?: string;
      };

      memberId = body.memberId ? String(body.memberId).trim() : undefined;
      lineUserId = body.lineUserId?.trim();
      displayName = body.displayName?.trim();
      const candidateUrl = body.pictureUrl?.trim() || '';

      if (!memberId && !lineUserId) {
        return NextResponse.json({ error: 'ไม่พบข้อมูลสมาชิก' }, { status: 400 });
      }

      if (!candidateUrl || !isAllowedPictureUrl(candidateUrl)) {
        return NextResponse.json({ error: 'รูปแบบรูปภาพไม่ถูกต้อง' }, { status: 400 });
      }

      if (candidateUrl.startsWith('data:image/') && candidateUrl.length > MAX_DATA_URL_BYTES * 1.4) {
        return NextResponse.json({ error: 'ขนาดรูปภาพใหญ่เกินไป' }, { status: 413 });
      }

      resolvedPictureUrl = candidateUrl;
    }

    const now = new Date().toISOString();
    const records = await readCloudJsonStore<MemberAvatarRecord[]>(STORE_FILE, []);
    const existing = findAvatarRecord(records, memberId, lineUserId);

    const record: MemberAvatarRecord = {
      ...(existing || {}),
      member_id: memberId || existing?.member_id,
      line_user_id: lineUserId || existing?.line_user_id,
      display_name: displayName || existing?.display_name,
      picture_url: resolvedPictureUrl,
      updated_at: now,
    };

    const next = existing
      ? records.map((r) => (r === existing ? record : r))
      : [record, ...records];
    await writeCloudJsonStore(STORE_FILE, next);

    let supabaseSaved = false;
    if (sb && (lineUserId || (memberId && UUID_RE.test(memberId)))) {
      try {
        const query = sb
          .from('profiles')
          .update({ picture_url: resolvedPictureUrl, updated_at: now });
        const { error } = lineUserId
          ? await query.eq('line_user_id', lineUserId)
          : await query.eq('id', memberId!);
        supabaseSaved = !error;
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      pictureUrl: resolvedPictureUrl,
      storageSaved,
      supabaseSaved,
    });
  } catch (error) {
    console.error('POST /api/members/avatar error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ไม่สามารถบันทึกรูปโปรไฟล์ได้' },
      { status: 500 }
    );
  }
}

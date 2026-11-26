import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readCloudJsonStore, writeCloudJsonStore } from '@/lib/serverJsonStore';

export const dynamic = 'force-dynamic';

export type AssignableRole = 'MEMBER' | 'HOUSE_ADMIN' | 'SUPER_ADMIN';

export interface MemberRoleRecord {
  member_id?: string;
  line_user_id?: string;
  display_name?: string;
  role: AssignableRole;
  updated_at: string;
  updated_by?: string;
}

const STORE_FILE = 'member-roles.json';
const ASSIGNABLE_ROLES: AssignableRole[] = ['MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN'];
// Built-in super admins (cannot be demoted, always allowed to manage roles)
const BUILTIN_SUPER_ADMIN_IDS = ['3296'];

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes('mock-yicc')) return null;
  return createClient(url, key);
}

function findRecord(
  records: MemberRoleRecord[],
  memberId?: string | null,
  lineUserId?: string | null
): MemberRoleRecord | undefined {
  return records.find(
    (r) =>
      (memberId && r.member_id && String(r.member_id) === String(memberId)) ||
      (lineUserId && r.line_user_id && r.line_user_id === lineUserId)
  );
}

function isSuperAdmin(
  records: MemberRoleRecord[],
  memberId?: string | null,
  lineUserId?: string | null
): boolean {
  if (memberId && BUILTIN_SUPER_ADMIN_IDS.includes(String(memberId))) return true;
  return findRecord(records, memberId, lineUserId)?.role === 'SUPER_ADMIN';
}

export async function GET(req: NextRequest) {
  try {
    const records = await readCloudJsonStore<MemberRoleRecord[]>(STORE_FILE, []);
    const memberId = req.nextUrl.searchParams.get('memberId')?.trim();
    const lineUserId = req.nextUrl.searchParams.get('lineUserId')?.trim();

    if (memberId || lineUserId) {
      const match = findRecord(records, memberId, lineUserId) || null;
      const role: AssignableRole | null =
        memberId && BUILTIN_SUPER_ADMIN_IDS.includes(memberId) ? 'SUPER_ADMIN' : match?.role || null;
      return NextResponse.json({ role, record: match });
    }

    return NextResponse.json({ roles: records });
  } catch (error) {
    console.error('GET /api/members/roles error:', error);
    return NextResponse.json({ roles: [] }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      memberId?: string;
      lineUserId?: string;
      displayName?: string;
      role?: AssignableRole;
      actor?: { memberId?: string; lineUserId?: string; role?: string; displayName?: string };
    };

    const memberId = body.memberId ? String(body.memberId).trim() : undefined;
    const lineUserId = body.lineUserId?.trim();
    const role = body.role;

    if ((!memberId && !lineUserId) || !role || !ASSIGNABLE_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const records = await readCloudJsonStore<MemberRoleRecord[]>(STORE_FILE, []);

    // Only Super Admins may assign roles
    const actor = body.actor || {};
    const actorAllowed =
      isSuperAdmin(records, actor.memberId, actor.lineUserId) ||
      // Fallback: session marked SUPER_ADMIN (e.g. credential login) when no record exists yet
      (actor.role === 'SUPER_ADMIN' && !findRecord(records, actor.memberId, actor.lineUserId));
    if (!actorAllowed) {
      return NextResponse.json({ error: 'เฉพาะ Super Admin เท่านั้นที่แต่งตั้งสิทธิ์ได้' }, { status: 403 });
    }

    if (memberId && BUILTIN_SUPER_ADMIN_IDS.includes(memberId) && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'ไม่สามารถลดสิทธิ์ Super Admin หลักของระบบได้' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const existing = findRecord(records, memberId, lineUserId);
    const record: MemberRoleRecord = {
      ...(existing || {}),
      member_id: memberId || existing?.member_id,
      line_user_id: lineUserId || existing?.line_user_id,
      display_name: body.displayName || existing?.display_name,
      role,
      updated_at: now,
      updated_by: actor.displayName || actor.memberId || actor.lineUserId,
    };

    const next = existing ? records.map((r) => (r === existing ? record : r)) : [record, ...records];
    await writeCloudJsonStore(STORE_FILE, next);

    // Sync role to Supabase profiles if reachable
    let supabaseSaved = false;
    const sb = getSupabaseServerClient();
    if (sb && lineUserId) {
      try {
        const { error } = await sb
          .from('profiles')
          .update({ role, updated_at: now })
          .eq('line_user_id', lineUserId);
        supabaseSaved = !error;
      } catch {}
    }

    return NextResponse.json({ ok: true, record, supabaseSaved });
  } catch (error) {
    console.error('PATCH /api/members/roles error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update role' },
      { status: 500 }
    );
  }
}

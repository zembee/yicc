import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '@/types';
import { linkRichMenuToUser, unlinkRichMenuFromUser } from '@/lib/lineRichMenu';
import { readCloudJsonStore, writeCloudJsonStore } from '@/lib/serverJsonStore';

export const dynamic = 'force-dynamic';

export interface StoredMemberApplication extends UserProfile {
  created_at?: string;
  updated_at?: string;
}

const STORE_FILE = 'member-applications.json';
const REAL_LINE_USER_ID_RE = /^U[0-9a-f]{32}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes('mock-yicc')) return null;
  return createClient(url, key);
}

function normalizeRowToApplication(row: any): StoredMemberApplication {
  const isPendingBatch =
    typeof row.cohort_batch === 'string' && row.cohort_batch.includes('PENDING');
  const isRejectedBatch =
    typeof row.cohort_batch === 'string' && row.cohort_batch.includes('REJECTED');

  return {
    ...row,
    role: row.role === 'PENDING' || isPendingBatch ? 'PENDING' : row.role || 'MEMBER',
    approval_status: isRejectedBatch
      ? 'REJECTED'
      : row.role === 'PENDING' || isPendingBatch
      ? 'PENDING'
      : 'APPROVED',
  };
}

export async function GET(req: NextRequest) {
  try {
    const lineUserId = req.nextUrl.searchParams.get('lineUserId')?.trim();
    const localApps = await readCloudJsonStore<StoredMemberApplication[]>(STORE_FILE, []);
    const mergedMap = new Map<string, StoredMemberApplication>();

    localApps.forEach((a) => {
      if (a.line_user_id) mergedMap.set(a.line_user_id, a);
    });

    let supabaseReachable = false;
    const sb = getSupabaseServerClient();
    if (sb) {
      try {
        const query = sb
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(100);

        const { data, error } = lineUserId
          ? await sb.from('profiles').select('*').eq('line_user_id', lineUserId).maybeSingle()
          : await query;

        if (!error) {
          supabaseReachable = true;
          const rows = lineUserId ? (data ? [data] : []) : Array.isArray(data) ? data : [];
          rows.forEach((row: any) => {
            const app = normalizeRowToApplication(row);
            if (
              lineUserId ||
              app.role === 'PENDING' ||
              app.approval_status === 'PENDING' ||
              app.approval_status === 'REJECTED' ||
              mergedMap.has(app.line_user_id)
            ) {
              mergedMap.set(app.line_user_id, app);
            }
          });
        }
      } catch {
        supabaseReachable = false;
      }
    }

    const applications = Array.from(mergedMap.values());

    if (lineUserId) {
      const match = applications.find((a) => a.line_user_id === lineUserId) || null;
      return NextResponse.json({ application: match, supabaseReachable });
    }

    return NextResponse.json({ applications, supabaseReachable });
  } catch (error) {
    console.error('GET /api/members/applications error:', error);
    return NextResponse.json({ applications: [], supabaseReachable: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StoredMemberApplication;
    if (!body?.line_user_id || !body?.display_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const applications = await readCloudJsonStore<StoredMemberApplication[]>(STORE_FILE, []);
    const existingIndex = applications.findIndex((a) => a.line_user_id === body.line_user_id);

    if (existingIndex >= 0) {
      const existing = applications[existingIndex];
      if (existing.approval_status === 'APPROVED' || existing.approval_status === 'REJECTED') {
        return NextResponse.json({ ok: true, application: existing });
      }
    }

    const record: StoredMemberApplication = {
      ...body,
      role: body.role || 'PENDING',
      approval_status: body.approval_status || 'PENDING',
      created_at: existingIndex >= 0 ? applications[existingIndex].created_at || now : now,
      updated_at: now,
    };

    if (existingIndex >= 0) {
      applications[existingIndex] = record;
    } else {
      applications.unshift(record);
    }
    await writeCloudJsonStore(STORE_FILE, applications);

    // Sync to Supabase if reachable (handle user_role enum without PENDING & UUID house_id)
    let supabaseSaved = false;
    const sb = getSupabaseServerClient();
    if (sb) {
      try {
        const basePayload = {
          line_user_id: record.line_user_id,
          display_name: record.display_name,
          picture_url: record.picture_url || null,
          phone_number: record.phone_number || null,
          email: record.email || null,
          company_name: record.company_name || null,
          position: record.position || null,
          industry: record.industry || null,
          house_id: record.house_id && UUID_RE.test(record.house_id) ? record.house_id : null,
          cohort_batch: 'YFTI 11 (PENDING)',
          points_balance: 0,
          xp_balance: 0,
          updated_at: now,
        };

        const { error: pendingErr } = await sb
          .from('profiles')
          .upsert({ ...basePayload, role: 'PENDING' }, { onConflict: 'line_user_id' });

        if (!pendingErr) {
          supabaseSaved = true;
        } else {
          // Fallback if Postgres user_role enum only permits MEMBER/HOUSE_ADMIN/SUPER_ADMIN
          const { error: memberErr } = await sb
            .from('profiles')
            .upsert({ ...basePayload, role: 'MEMBER' }, { onConflict: 'line_user_id' });
          if (!memberErr) supabaseSaved = true;
        }
      } catch {}
    }

    return NextResponse.json({ ok: true, application: record, supabaseSaved });
  } catch (error) {
    console.error('POST /api/members/applications error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save application' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      lineUserId?: string;
      decision?: 'APPROVED' | 'REJECTED';
    };

    const lineUserId = body.lineUserId?.trim();
    const decision = body.decision;

    if (!lineUserId || (decision !== 'APPROVED' && decision !== 'REJECTED')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const applications = await readCloudJsonStore<StoredMemberApplication[]>(STORE_FILE, []);
    const idx = applications.findIndex((a) => a.line_user_id === lineUserId);

    const current = idx >= 0 ? applications[idx] : ({ line_user_id: lineUserId, display_name: lineUserId } as StoredMemberApplication);
    const updated: StoredMemberApplication = {
      ...current,
      role: decision === 'APPROVED' ? 'MEMBER' : 'PENDING',
      approval_status: decision,
      points_balance: decision === 'APPROVED' ? Math.max(current.points_balance || 0, 100) : 0,
      xp_balance: decision === 'APPROVED' ? Math.max(current.xp_balance || 0, 300) : 0,
      updated_at: now,
    };

    if (idx >= 0) {
      applications[idx] = updated;
    } else {
      applications.unshift(updated);
    }
    await writeCloudJsonStore(STORE_FILE, applications);

    // Update Supabase if reachable
    const sb = getSupabaseServerClient();
    if (sb) {
      try {
        await sb
          .from('profiles')
          .update({
            role: 'MEMBER',
            cohort_batch: decision === 'APPROVED' ? 'YFTI 11' : 'YFTI 11 (REJECTED)',
            points_balance: updated.points_balance,
            xp_balance: updated.xp_balance,
            updated_at: now,
          })
          .eq('line_user_id', lineUserId);
      } catch {}
    }

    // Update LINE Rich Menu if this is a real LINE userId
    if (REAL_LINE_USER_ID_RE.test(lineUserId) && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      try {
        const loggedInRichMenuId =
          process.env.LINE_RICH_MENU_LOGGED_IN_ID || 'richmenu-4677488aeef077f1b275f3fc7694f69b';
        if (decision === 'APPROVED') {
          await linkRichMenuToUser(lineUserId, loggedInRichMenuId);
        } else if (decision === 'REJECTED') {
          await unlinkRichMenuFromUser(lineUserId);
        }
      } catch (lineErr) {
        console.warn('LINE Rich Menu sync warning:', lineErr);
      }
    }

    return NextResponse.json({ ok: true, application: updated });
  } catch (error) {
    console.error('PATCH /api/members/applications error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update application' },
      { status: 500 }
    );
  }
}

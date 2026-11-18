import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { UserProfile } from '@/types';
import { linkRichMenuToUser, unlinkRichMenuFromUser } from '@/lib/lineRichMenu';

export interface StoredMemberApplication extends UserProfile {
  created_at?: string;
  updated_at?: string;
}

const REAL_LINE_USER_ID_RE = /^U[0-9a-f]{32}$/i;

function getStorageFilePath(): string {
  const localDir = path.join(process.cwd(), '.data');
  try {
    if (!existsSync(localDir)) {
      mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, 'member-applications.json');
  } catch {
    return '/tmp/yfti-member-applications.json';
  }
}

function readApplications(): StoredMemberApplication[] {
  const filePath = getStorageFilePath();
  if (!existsSync(filePath)) return [];
  try {
    const raw = readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeApplications(list: StoredMemberApplication[]): void {
  const filePath = getStorageFilePath();
  writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
}

export async function GET(req: NextRequest) {
  try {
    const lineUserId = req.nextUrl.searchParams.get('lineUserId')?.trim();
    const applications = readApplications();

    if (lineUserId) {
      const match = applications.find((a) => a.line_user_id === lineUserId) || null;
      return NextResponse.json({ application: match });
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('GET /api/members/applications error:', error);
    return NextResponse.json({ applications: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StoredMemberApplication;
    if (!body?.line_user_id || !body?.display_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const applications = readApplications();
    const existingIndex = applications.findIndex((a) => a.line_user_id === body.line_user_id);

    // Do not overwrite an already-approved or rejected status back to PENDING on passive sync
    if (existingIndex >= 0) {
      const existing = applications[existingIndex];
      if (
        existing.approval_status === 'APPROVED' ||
        existing.approval_status === 'REJECTED'
      ) {
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

    writeApplications(applications);
    return NextResponse.json({ ok: true, application: record });
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

    const applications = readApplications();
    const idx = applications.findIndex((a) => a.line_user_id === lineUserId);
    if (idx < 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const current = applications[idx];
    const updated: StoredMemberApplication = {
      ...current,
      role: decision === 'APPROVED' ? 'MEMBER' : 'PENDING',
      approval_status: decision,
      points_balance: decision === 'APPROVED' ? Math.max(current.points_balance || 0, 100) : 0,
      xp_balance: decision === 'APPROVED' ? Math.max(current.xp_balance || 0, 300) : 0,
      updated_at: new Date().toISOString(),
    };

    applications[idx] = updated;
    writeApplications(applications);

    // Update LINE Rich Menu if this is a real LINE userId
    if (REAL_LINE_USER_ID_RE.test(lineUserId) && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      try {
        if (decision === 'APPROVED' && process.env.LINE_RICH_MENU_LOGGED_IN_ID) {
          await linkRichMenuToUser(lineUserId, process.env.LINE_RICH_MENU_LOGGED_IN_ID);
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

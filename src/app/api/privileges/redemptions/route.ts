import { NextRequest, NextResponse } from 'next/server';
import { readCloudJsonStore, writeCloudJsonStore } from '@/lib/serverJsonStore';

export interface PrivilegeRedemptionRecord {
  id: string;
  code: string;
  privilegeId: string;
  title: string;
  merchant: string;
  discountLabel?: string;
  points: number;
  memberId?: string;
  memberName?: string;
  redeemedAt: string;
  status: 'ACTIVE' | 'USED';
  usedAt?: string;
  verifiedBy?: string;
}

const STORE_FILE = 'privilege-redemptions.json';

async function loadRedemptions(): Promise<PrivilegeRedemptionRecord[]> {
  const stored = await readCloudJsonStore<PrivilegeRedemptionRecord[] | null>(STORE_FILE, null);
  return Array.isArray(stored) ? stored : [];
}

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export async function GET(req: NextRequest) {
  const codeParam = req.nextUrl.searchParams.get('code');
  const redemptions = await loadRedemptions();

  if (codeParam) {
    const target = normalizeCode(codeParam);
    const found = redemptions.find((r) => normalizeCode(r.code) === target) || null;
    return NextResponse.json({ redemption: found });
  }

  return NextResponse.json({ redemptions });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<PrivilegeRedemptionRecord>;
    const code = body.code ? normalizeCode(body.code) : '';
    if (!code || !body.title?.trim()) {
      return NextResponse.json({ error: 'Missing required code or privilege title' }, { status: 400 });
    }

    const redemptions = await loadRedemptions();
    const existing = redemptions.find((r) => normalizeCode(r.code) === code);
    if (existing) {
      return NextResponse.json({ ok: true, redemption: existing });
    }

    const record: PrivilegeRedemptionRecord = {
      id: body.id || `red-${Date.now()}`,
      code,
      privilegeId: body.privilegeId || '',
      title: body.title.trim(),
      merchant: body.merchant?.trim() || 'YFTI Partner',
      discountLabel: body.discountLabel?.trim() || undefined,
      points: Number(body.points) || 0,
      memberId: body.memberId,
      memberName: body.memberName?.trim() || 'สมาชิก Young FTI 11',
      redeemedAt: body.redeemedAt || new Date().toLocaleString('th-TH'),
      status: 'ACTIVE',
    };

    const next = [record, ...redemptions];
    await writeCloudJsonStore(STORE_FILE, next);
    return NextResponse.json({ ok: true, redemption: record });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save redemption' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { code?: string; verifiedBy?: string };
    const code = body.code ? normalizeCode(body.code) : '';
    if (!code) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสสิทธิพิเศษ' }, { status: 400 });
    }

    const redemptions = await loadRedemptions();
    const idx = redemptions.findIndex((r) => normalizeCode(r.code) === code);
    if (idx < 0) {
      return NextResponse.json({ error: 'ไม่พบรหัสสิทธิพิเศษนี้ในระบบ' }, { status: 404 });
    }

    const target = redemptions[idx];
    if (target.status === 'USED') {
      return NextResponse.json(
        {
          error: `รหัสนี้ถูกใช้สิทธิ์ไปแล้ว${target.usedAt ? ` เมื่อ ${target.usedAt}` : ''}`,
          redemption: target,
        },
        { status: 409 }
      );
    }

    const updated: PrivilegeRedemptionRecord = {
      ...target,
      status: 'USED',
      usedAt: new Date().toLocaleString('th-TH'),
      verifiedBy: body.verifiedBy?.trim() || 'Admin',
    };

    redemptions[idx] = updated;
    await writeCloudJsonStore(STORE_FILE, redemptions);
    return NextResponse.json({ ok: true, redemption: updated, redemptions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify redemption' },
      { status: 500 }
    );
  }
}

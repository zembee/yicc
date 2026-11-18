import { NextRequest, NextResponse } from 'next/server';
import { mockPrivileges } from '@/lib/mockData';
import { PrivilegeItem } from '@/types';
import { readJsonStore, writeJsonStore } from '@/lib/serverJsonStore';

const STORE_FILE = 'privileges.json';

function loadPrivileges(): PrivilegeItem[] {
  const stored = readJsonStore<PrivilegeItem[] | null>(STORE_FILE, null);
  if (Array.isArray(stored)) return stored;
  return [...mockPrivileges];
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')?.trim();
  const privileges = loadPrivileges();
  if (id) {
    const item = privileges.find((p) => p.id === id) || null;
    return NextResponse.json({ privilege: item });
  }
  return NextResponse.json({ privileges });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<PrivilegeItem>;
    if (!body.title?.trim() || !body.merchant?.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อสิทธิพิเศษและชื่อร้านค้า' }, { status: 400 });
    }

    const privileges = loadPrivileges();
    const newItem: PrivilegeItem = {
      id: body.id || `priv-${Date.now()}`,
      title: body.title.trim(),
      merchant: body.merchant.trim(),
      discount_label: body.discount_label?.trim() || 'สิทธิพิเศษ',
      category: body.category || 'Lifestyle',
      points_required: Number(body.points_required) || 100,
      expiry_date: body.expiry_date?.trim() || '31 ธ.ค. 2026',
      image_url: body.image_url?.trim() || '/images/home/unsplash_hEC6zxdFF0M.webp',
      description: body.description?.trim() || '',
      conditions: Array.isArray(body.conditions) && body.conditions.length > 0
        ? body.conditions
        : ['แสดง QR Code สิทธิพิเศษจากแอป YFTI-CONNECT ก่อนรับบริการ'],
      how_to_use: Array.isArray(body.how_to_use) && body.how_to_use.length > 0
        ? body.how_to_use
        : ['กดปุ่ม "แลก Point" เพื่อรับรหัส QR / Barcode', 'แสดงรหัสแก่พนักงานก่อนชำระเงิน'],
      is_featured: Boolean(body.is_featured),
    };

    const next = [newItem, ...privileges];
    writeJsonStore(STORE_FILE, next);
    return NextResponse.json({ ok: true, privilege: newItem, privileges: next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create privilege' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<PrivilegeItem> & { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: 'Missing privilege id' }, { status: 400 });
    }

    const privileges = loadPrivileges();
    const idx = privileges.findIndex((p) => p.id === body.id);
    if (idx < 0) {
      return NextResponse.json({ error: 'Privilege not found' }, { status: 404 });
    }

    const updated: PrivilegeItem = {
      ...privileges[idx],
      ...body,
      points_required:
        body.points_required !== undefined
          ? Number(body.points_required)
          : privileges[idx].points_required,
    };

    privileges[idx] = updated;
    writeJsonStore(STORE_FILE, privileges);
    return NextResponse.json({ ok: true, privilege: updated, privileges });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update privilege' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')?.trim();
    if (!id) {
      return NextResponse.json({ error: 'Missing privilege id' }, { status: 400 });
    }
    const privileges = loadPrivileges();
    const next = privileges.filter((p) => p.id !== id);
    writeJsonStore(STORE_FILE, next);
    return NextResponse.json({ ok: true, privileges: next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete privilege' },
      { status: 500 }
    );
  }
}

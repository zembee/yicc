import { NextRequest, NextResponse } from 'next/server';
import { mockEvents } from '@/lib/mockData';
import { EventItem } from '@/types';
import { readCloudJsonStore, writeCloudJsonStore } from '@/lib/serverJsonStore';

const STORE_FILE = 'events.json';

async function loadEvents(): Promise<EventItem[]> {
  const stored = await readCloudJsonStore<EventItem[] | null>(STORE_FILE, null);
  if (Array.isArray(stored)) return stored;
  return [...mockEvents];
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')?.trim();
  const events = await loadEvents();
  if (id) {
    const item = events.find((e) => e.id === id) || null;
    return NextResponse.json({ event: item });
  }
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<EventItem>;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อกิจกรรม / คอร์สเรียน' }, { status: 400 });
    }

    const events = await loadEvents();
    const startIso = body.start_time || new Date(Date.now() + 86400000 * 7).toISOString();
    const endIso =
      body.end_time || new Date(new Date(startIso).getTime() + 3600000 * 3).toISOString();

    const newEvent: EventItem = {
      id: body.id || `evt-${Date.now()}`,
      title: body.title.trim(),
      description: body.description?.trim() || 'กิจกรรมและหลักสูตรสำหรับสมาชิก Young FTI ELITE 11',
      location_name: body.location_name?.trim() || 'สภาอุตสาหกรรมแห่งประเทศไทย (FTI)',
      start_time: startIso,
      end_time: endIso,
      reward_points: Number(body.reward_points) || 50,
      reward_xp: Number(body.reward_xp) || 100,
      is_mandatory: Boolean(body.is_mandatory),
      status: body.status || 'UPCOMING',
      image_url: body.image_url?.trim() || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/home/unsplash_hEC6zxdFF0M.webp',
      event_type: body.event_type || 'course',
      fee_member: body.fee_member !== undefined ? Number(body.fee_member) : 1500,
      fee_guest: body.fee_guest !== undefined ? Number(body.fee_guest) : 2500,
      dress_code: body.dress_code,
      registration_config: body.registration_config,
    };

    const next = [newEvent, ...events];
    await writeCloudJsonStore(STORE_FILE, next);
    return NextResponse.json({ ok: true, event: newEvent, events: next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<EventItem> & { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: 'Missing event id' }, { status: 400 });
    }

    const events = await loadEvents();
    const idx = events.findIndex((e) => e.id === body.id);
    if (idx < 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updated: EventItem = {
      ...events[idx],
      ...body,
      reward_points:
        body.reward_points !== undefined ? Number(body.reward_points) : events[idx].reward_points,
      reward_xp: body.reward_xp !== undefined ? Number(body.reward_xp) : events[idx].reward_xp,
      fee_member: body.fee_member !== undefined ? Number(body.fee_member) : events[idx].fee_member,
      fee_guest: body.fee_guest !== undefined ? Number(body.fee_guest) : events[idx].fee_guest,
    };

    events[idx] = updated;
    await writeCloudJsonStore(STORE_FILE, events);
    return NextResponse.json({ ok: true, event: updated, events });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')?.trim();
    if (!id) {
      return NextResponse.json({ error: 'Missing event id' }, { status: 400 });
    }
    const events = await loadEvents();
    const next = events.filter((e) => e.id !== id);
    await writeCloudJsonStore(STORE_FILE, next);
    return NextResponse.json({ ok: true, events: next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete event' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { linkRichMenuToUser, unlinkRichMenuFromUser } from '@/lib/lineRichMenu';

const REAL_LINE_USER_ID_RE = /^U[0-9a-f]{32}$/i;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { lineUserId?: string; action?: 'link' | 'unlink' };
    const lineUserId = body.lineUserId?.trim();
    const action = body.action;

    if (!lineUserId || !action || (action !== 'link' && action !== 'unlink')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!REAL_LINE_USER_ID_RE.test(lineUserId)) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'non_line_user_id' });
    }

    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'missing_access_token' });
    }

    if (action === 'link') {
      const loggedInRichMenuId = process.env.LINE_RICH_MENU_LOGGED_IN_ID;
      if (!loggedInRichMenuId) {
        return NextResponse.json({ ok: true, skipped: true, reason: 'missing_logged_in_rich_menu_id' });
      }
      await linkRichMenuToUser(lineUserId, loggedInRichMenuId);
    } else {
      await unlinkRichMenuFromUser(lineUserId);
    }

    return NextResponse.json({ ok: true, action, lineUserId });
  } catch (error) {
    console.error('LINE Rich Menu API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update LINE Rich Menu' },
      { status: 500 }
    );
  }
}

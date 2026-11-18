// Native fetch is available in Node 22, no need for node-fetch
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_BASE = 'https://api.line.me/v2/bot';
const DATA_API_BASE = 'https://api-data.line.me/v2/bot';

function getAccessToken(): string {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN in environment');
  }
  return token;
}

function getLiffBaseUrl(): string {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2011170570-qSzFUdyR';
  return `https://liff.line.me/${liffId}`;
}

async function createRichMenuFromBody(body: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${API_BASE}/richmenu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { richMenuId?: string };
  if (!res.ok || !data.richMenuId) {
    throw new Error(`Create RichMenu failed: ${JSON.stringify(data)}`);
  }
  console.log('✅ RichMenu created – ID:', data.richMenuId);
  return data.richMenuId;
}

/** Create the Rich Menu for logged-in members (4-area layout) */
export async function createLoggedInRichMenu(): Promise<string> {
  const liffBase = getLiffBaseUrl();
  return createRichMenuFromBody({
    size: { width: 2500, height: 1686 },
    selected: false,
    name: 'YFTI-CONNECT Member Menu',
    chatBarText: 'เมนูสมาชิก',
    areas: [
      {
        // Top Banner: Young FTI ELITE 11 -> เข้าสู่หน้าหลัก (Home)
        bounds: { x: 0, y: 0, width: 2500, height: 840 },
        action: { type: 'uri', uri: liffBase },
      },
      {
        // Bottom Left Card: Points (คะแนนสะสม / สิทธิพิเศษ)
        bounds: { x: 0, y: 840, width: 833, height: 846 },
        action: { type: 'uri', uri: `${liffBase}/privileges` },
      },
      {
        // Bottom Middle Card: Activity & Course (กิจกรรมและหลักสูตร)
        bounds: { x: 833, y: 840, width: 834, height: 846 },
        action: { type: 'uri', uri: `${liffBase}/events` },
      },
      {
        // Bottom Right Card: Profile (โปรไฟล์ของฉัน)
        bounds: { x: 1667, y: 840, width: 833, height: 846 },
        action: { type: 'uri', uri: `${liffBase}/profile` },
      },
    ],
  });
}

/** Create the Rich Menu for users who have not logged in yet */
export async function createGuestRichMenu(): Promise<string> {
  const liffBase = getLiffBaseUrl();
  return createRichMenuFromBody({
    size: { width: 2500, height: 1686 },
    selected: true,
    name: 'YFTI-CONNECT Guest Login Menu',
    chatBarText: 'เข้าสู่ระบบสมาชิก',
    areas: [
      {
        // Full-screen CTA: เข้าสู่ระบบสมาชิก
        bounds: { x: 0, y: 0, width: 2500, height: 1686 },
        action: { type: 'uri', uri: `${liffBase}/register` },
      },
    ],
  });
}

/** Backward-compatible alias */
export const createRichMenu = createLoggedInRichMenu;

/** Upload image for a Rich Menu (must be <= 1MB, 2500×1686) */
export async function uploadRichMenuImage(richMenuId: string, filename?: string): Promise<void> {
  const candidates = filename
    ? [{ file: path.resolve(process.cwd(), 'public', filename), type: filename.endsWith('.png') ? 'image/png' : 'image/jpeg' }]
    : [
        { file: path.resolve(process.cwd(), 'public', 'richmenu-logged-in.jpg'), type: 'image/jpeg' },
        { file: path.resolve(process.cwd(), 'public', 'richmenu.jpg'), type: 'image/jpeg' },
        { file: path.resolve(process.cwd(), 'public', 'richmenu.png'), type: 'image/png' },
      ];

  const selected = candidates.find((p) => existsSync(p.file));
  if (!selected) {
    throw new Error(`❌ RichMenu image not found in public/ (${candidates.map((c) => path.basename(c.file)).join(', ')})`);
  }

  const buffer = readFileSync(selected.file);
  console.log(`Uploading ${selected.file} (${(buffer.length / 1024).toFixed(1)} KB, ${selected.type})...`);

  const res = await fetch(`${DATA_API_BASE}/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': selected.type,
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: buffer,
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error('Upload failed with status', res.status, txt);
    throw new Error(`Upload image failed: ${txt}`);
  }
  console.log('✅ RichMenu image uploaded');
}

/** Set a Rich Menu as default for all users (used for non-logged-in users) */
export async function setDefaultRichMenu(richMenuId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/user/all/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Set default RichMenu failed: ${txt}`);
  }
  console.log('✅ Default RichMenu applied to all users:', richMenuId);
}

/** Link a Rich Menu to a specific user (e.g. after login) */
export async function linkRichMenuToUser(userId: string, richMenuId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/user/${userId}/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Link RichMenu to user failed: ${txt}`);
  }
  console.log(`✅ RichMenu ${richMenuId} linked to user ${userId}`);
}

/** Unlink a user-specific Rich Menu so they fall back to the default (guest) Rich Menu */
export async function unlinkRichMenuFromUser(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/user/${userId}/richmenu`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok && res.status !== 404) {
    const txt = await res.text();
    throw new Error(`Unlink RichMenu from user failed: ${txt}`);
  }
  console.log(`✅ RichMenu unlinked from user ${userId}`);
}

/** Provision both Guest (default) and Logged-in Rich Menus */
export async function provisionRichMenus(): Promise<{
  guestRichMenuId: string;
  loggedInRichMenuId: string;
}> {
  const guestRichMenuId = await createGuestRichMenu();
  await uploadRichMenuImage(guestRichMenuId, 'richmenu-guest.jpg');
  await setDefaultRichMenu(guestRichMenuId);

  const loggedInRichMenuId = await createLoggedInRichMenu();
  await uploadRichMenuImage(loggedInRichMenuId, 'richmenu-logged-in.jpg');

  return { guestRichMenuId, loggedInRichMenuId };
}

/** Backward-compatible convenience wrapper */
export async function provisionRichMenu(): Promise<void> {
  await provisionRichMenus();
}

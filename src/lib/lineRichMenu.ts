// Native fetch is available in Node 22, no need for node-fetch
import { readFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN as string;
if (!ACCESS_TOKEN) {
  throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN in environment');
}

const API_BASE = 'https://api.line.me/v2/bot';

/** Create a Rich Menu and return its ID */
export async function createRichMenu(): Promise<string> {
  const body = {
    size: { width: 2500, height: 1686 },
    selected: false,
    name: 'YFTI‑CONNECT Main Menu',
    chatBarText: 'เมนู',
    areas: [
      {
        bounds: { x: 0, y: 0, width: 300, height: 300 },
        action: { type: 'uri', uri: 'https://yicc.vercel.app' }
      },
      {
        bounds: { x: 1100, y: 700, width: 300, height: 300 },
        action: { type: 'message', text: 'เช็คคะแนน' }
      },
      {
        bounds: { x: 2200, y: 1300, width: 300, height: 300 },
        action: { type: 'uri', uri: 'https://yicc.vercel.app/profile' }
      }
    ]
  };

  const res = await fetch(`${API_BASE}/richmenu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`
    },
    body: JSON.stringify(body)
  });

  const data = (await res.json()) as { richMenuId: string };
  if (!res.ok) {
    throw new Error(`Create RichMenu failed: ${JSON.stringify(data)}`);
  }
  console.log('✅ RichMenu created – ID:', data.richMenuId);
  return data.richMenuId;
}

/** Upload PNG image for the Rich Menu (must be 2500×1686) */
export async function uploadRichMenuImage(richMenuId: string): Promise<void> {
  const imagePath = path.resolve(process.cwd(), 'public', 'richmenu.png');
  const buffer = readFileSync(imagePath);
  const res = await fetch(`${API_BASE}/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/png',
      Authorization: `Bearer ${ACCESS_TOKEN}`
    },
    body: buffer
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error('Upload failed with status', res.status, txt);
    throw new Error(`Upload image failed: ${txt}`);
  }
  console.log('✅ RichMenu image uploaded');
}

/** Set this Rich Menu as default for all users */
export async function setDefaultRichMenu(richMenuId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/user/all/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Set default RichMenu failed: ${txt}`);
  }
  console.log('✅ Default RichMenu applied to all users');
}

/** Link a Rich Menu to a specific user (optional) */
export async function linkRichMenuToUser(userId: string, richMenuId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/user/${userId}/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Link RichMenu to user failed: ${txt}`);
  }
  console.log(`✅ RichMenu ${richMenuId} linked to user ${userId}`);
}

/** Convenience wrapper */
export async function provisionRichMenu(): Promise<void> {
  const id = await createRichMenu();
  await uploadRichMenuImage(id);
  await setDefaultRichMenu(id);
}

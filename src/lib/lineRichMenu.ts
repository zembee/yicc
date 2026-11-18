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
    name: 'YFTI‑CONNECT Main Menu v2',
    chatBarText: 'เมนู',
    areas: [
      {
        // Top Banner: Young FTI ELITE 11 -> เข้าสู่หน้าหลัก (Home)
        bounds: { x: 0, y: 0, width: 2500, height: 840 },
        action: { type: 'uri', uri: 'https://liff.line.me/2011170570-qSzFUdyR' }
      },
      {
        // Bottom Left Card: Points (คะแนนสะสม / สิทธิพิเศษ)
        bounds: { x: 0, y: 840, width: 833, height: 846 },
        action: { type: 'uri', uri: 'https://liff.line.me/2011170570-qSzFUdyR/privileges' }
      },
      {
        // Bottom Middle Card: Activity & Course (กิจกรรมและหลักสูตร)
        bounds: { x: 833, y: 840, width: 834, height: 846 },
        action: { type: 'uri', uri: 'https://liff.line.me/2011170570-qSzFUdyR/events' }
      },
      {
        // Bottom Right Card: Profile (โปรไฟล์ของฉัน)
        bounds: { x: 1667, y: 840, width: 833, height: 846 },
        action: { type: 'uri', uri: 'https://liff.line.me/2011170570-qSzFUdyR/profile' }
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

/** Upload image for the Rich Menu (must be <= 1MB, 2500×1686) */
export async function uploadRichMenuImage(richMenuId: string): Promise<void> {
  const fs = await import('fs');
  const possiblePaths = [
    { file: path.resolve(process.cwd(), 'public', 'richmenu.jpg'), type: 'image/jpeg' },
    { file: path.resolve(process.cwd(), 'public', 'richmenu.png'), type: 'image/png' }
  ];

  let selected = possiblePaths.find(p => fs.existsSync(p.file));
  if (!selected) {
    throw new Error('❌ RichMenu image not found in public/ (richmenu.jpg or richmenu.png)');
  }

  const buffer = readFileSync(selected.file);
  console.log(`Uploading ${selected.file} (${(buffer.length / 1024).toFixed(1)} KB, ${selected.type})...`);

  // Use data endpoint for image upload as required by LINE
  const dataBase = API_BASE.replace('api.line.me', 'api-data.line.me');
  const res = await fetch(`${dataBase}/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': selected.type,
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

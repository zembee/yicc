import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export function getStorePath(filename: string): string {
  const localDir = path.join(process.cwd(), '.data');
  try {
    if (!existsSync(localDir)) {
      mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, filename);
  } catch {
    return path.join('/tmp', `yfti-${filename}`);
  }
}

export function readJsonStore<T>(filename: string, fallback: T): T {
  const filePath = getStorePath(filename);
  if (!existsSync(filePath)) return fallback;
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonStore<T>(filename: string, data: T): void {
  const filePath = getStorePath(filename);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getSupabaseStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes('mock-yicc')) return null;
  return createClient(url, key);
}

export async function readCloudJsonStore<T>(filename: string, fallback: T): Promise<T> {
  const sb = getSupabaseStorageClient();
  if (sb) {
    try {
      const { data, error } = await sb.storage
        .from('participants-assets')
        .download(`data/${filename}`);
      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text) as T;
        writeJsonStore(filename, parsed);
        return parsed;
      }
    } catch {}
  }
  return readJsonStore<T>(filename, fallback);
}

export async function writeCloudJsonStore<T>(filename: string, data: T): Promise<void> {
  writeJsonStore(filename, data);
  const sb = getSupabaseStorageClient();
  if (sb) {
    try {
      const buf = Buffer.from(JSON.stringify(data, null, 2), 'utf8');
      await sb.storage.from('participants-assets').upload(`data/${filename}`, buf, {
        contentType: 'application/json',
        upsert: true,
        cacheControl: '0',
      });
    } catch {}
  }
}

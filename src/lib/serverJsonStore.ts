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

// Cloud JSON stores are written as append-only versions under `data/<name>/<timestamp>.json`.
// The public Supabase key may create objects but not overwrite them (storage RLS), so an
// in-place upsert of `data/<filename>` silently fails after the first write. Each write
// therefore creates a new version and reads pick the newest one, falling back to the
// legacy single file.
function versionDir(filename: string): string {
  return `data/${filename.replace(/\.json$/i, '')}`;
}

export async function readCloudJsonStore<T>(filename: string, fallback: T): Promise<T> {
  const sb = getSupabaseStorageClient();
  if (sb) {
    const bucket = sb.storage.from('participants-assets');
    try {
      const dir = versionDir(filename);
      const { data: files, error: listErr } = await bucket.list(dir, {
        limit: 1,
        sortBy: { column: 'name', order: 'desc' },
      });
      const latest = !listErr ? files?.find((f) => f.name.endsWith('.json')) : undefined;
      const target = latest ? `${dir}/${latest.name}` : `data/${filename}`;
      const { data, error } = await bucket.download(target);
      if (!error && data) {
        const parsed = JSON.parse(await data.text()) as T;
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
      const version = `${String(Date.now()).padStart(15, '0')}-${Math.random().toString(36).slice(2, 8)}`;
      const { error } = await sb.storage
        .from('participants-assets')
        .upload(`${versionDir(filename)}/${version}.json`, buf, {
          contentType: 'application/json',
          cacheControl: '0',
        });
      if (error) console.warn(`writeCloudJsonStore(${filename}) cloud upload failed:`, error.message);
    } catch (err) {
      console.warn(`writeCloudJsonStore(${filename}) cloud upload error:`, err);
    }
  }
}

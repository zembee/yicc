import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

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

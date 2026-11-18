import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'participants-assets';
const FOLDERS = ['participants', 'logos', 'home', 'events', 'about'];

function convertToWebpIfNeeded(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.webp') return filePath;
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return null;

  const webpPath = filePath.slice(0, -ext.length) + '.webp';
  if (!fs.existsSync(webpPath)) {
    execFileSync('/opt/homebrew/bin/cwebp', ['-q', '82', '-m', '4', '-quiet', filePath, '-o', webpPath]);
  }
  return webpPath;
}

async function main() {
  // Clean up test-ping.txt if present
  await supabase.storage.from(BUCKET).remove(['test-ping.txt']).catch(() => {});

  let totalFiles = 0;
  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;
  let uploadedCount = 0;
  let failedCount = 0;

  for (const folder of FOLDERS) {
    const dir = path.join(ROOT, 'public', 'images', folder);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => !f.startsWith('.'));
    const seenWebp = new Set();

    console.log(`\n📁 Processing ${folder}/ (${files.length} entries)...`);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) continue;

      const ext = path.extname(file).toLowerCase();
      if (!['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) continue;

      totalFiles++;
      totalOriginalBytes += fs.statSync(fullPath).size;

      let webpPath;
      try {
        webpPath = convertToWebpIfNeeded(fullPath);
      } catch (err) {
        console.warn(`  ⚠️ WebP conversion failed for ${folder}/${file}:`, err.message);
        failedCount++;
        continue;
      }

      if (!webpPath || seenWebp.has(webpPath)) continue;
      seenWebp.add(webpPath);

      const webpName = path.basename(webpPath);
      const buf = fs.readFileSync(webpPath);
      totalWebpBytes += buf.length;

      const storagePath = `${folder}/${webpName}`;
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '31536000',
      });

      if (error) {
        console.warn(`  ❌ Upload failed for ${storagePath}:`, error.message);
        failedCount++;
      } else {
        uploadedCount++;
      }
    }
    console.log(`  ✅ Uploaded ${seenWebp.size} WebP files for ${folder}/`);
  }

  console.log('\n🎉 Summary:');
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   WebP uploaded:   ${uploadedCount} (failed: ${failedCount})`);
  console.log(`   Original size:   ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   WebP size:       ${(totalWebpBytes / (1024 * 1024)).toFixed(2)} MB`);
  if (totalOriginalBytes > 0) {
    console.log(
      `   Saved:           ${((1 - totalWebpBytes / totalOriginalBytes) * 100).toFixed(1)}%`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

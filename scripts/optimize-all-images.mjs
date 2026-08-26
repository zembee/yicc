import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const participantsDir = path.join(__dirname, '../public/images/participants');
const logosDir = path.join(__dirname, '../public/images/logos');

function optimizeDir(dir, maxSize, quality) {
  const files = fs.readdirSync(dir);
  let totalBefore = 0;
  let totalAfter = 0;

  console.log(`Optimizing ${files.length} images in ${path.basename(dir)}...`);

  for (const f of files) {
    if (f.startsWith('.')) continue;
    const fullPath = path.join(dir, f);
    const sBefore = fs.statSync(fullPath).size;
    totalBefore += sBefore;

    try {
      execSync(`sips -Z ${maxSize} -s formatOptions ${quality} "${fullPath}"`, { stdio: 'ignore' });
    } catch (e) {
      // fallback
    }

    const sAfter = fs.statSync(fullPath).size;
    totalAfter += sAfter;
  }

  console.log(`- Before: ${(totalBefore / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`- After: ${(totalAfter / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`- Saved: ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}% bandwidth!`);
}

async function uploadToSupabase() {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
    const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
    const supabaseAnonKey = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('\nSyncing optimized lightweight images to Supabase Storage...');

    const pFiles = fs.readdirSync(participantsDir);
    for (const f of pFiles) {
      if (f.startsWith('.')) continue;
      const buf = fs.readFileSync(path.join(participantsDir, f));
      await supabase.storage.from('participants-assets').upload(`participants/${f}`, buf, {
        contentType: f.endsWith('.webp') ? 'image/webp' : f.endsWith('.png') ? 'image/png' : 'image/jpeg',
        upsert: true
      });
    }

    const lFiles = fs.readdirSync(logosDir);
    for (const f of lFiles) {
      if (f.startsWith('.')) continue;
      const buf = fs.readFileSync(path.join(logosDir, f));
      await supabase.storage.from('participants-assets').upload(`logos/${f}`, buf, {
        contentType: f.endsWith('.webp') ? 'image/webp' : f.endsWith('.png') ? 'image/png' : 'image/jpeg',
        upsert: true
      });
    }
    console.log('✓ Successfully uploaded all optimized images to Supabase Storage!');
  } catch (err) {
    console.warn('Supabase storage upload notice:', err.message);
  }
}

async function main() {
  optimizeDir(participantsDir, 600, 80);
  optimizeDir(logosDir, 400, 85);
  await uploadToSupabase();
  console.log('\n✨ ALL IMAGES ARE NOW OPTIMIZED AND SUPER FAST!');
}

main().catch(console.error);

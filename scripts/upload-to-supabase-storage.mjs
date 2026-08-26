import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseAnonKey = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const participantsDir = path.join(__dirname, '../public/images/participants');
const logosDir = path.join(__dirname, '../public/images/logos');

async function uploadFolder(localDir, storagePrefix) {
  const files = fs.readdirSync(localDir);
  console.log(`Uploading ${files.length} files from ${storagePrefix}...`);

  for (const file of files) {
    if (file.startsWith('.')) continue;
    const filePath = path.join(localDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = file.endsWith('.webp') ? 'image/webp' : file.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const storagePath = `${storagePrefix}/${file}`;

    const { data, error } = await supabase.storage
      .from('participants-assets')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.warn(`Upload error for ${file}:`, error.message);
    }
  }
}

async function main() {
  console.log('Uploading all images to Supabase Storage Bucket [participants-assets]...');
  await uploadFolder(participantsDir, 'participants');
  await uploadFolder(logosDir, 'logos');

  console.log('✓ All images uploaded to Supabase Cloud Storage successfully!');
  const sampleUrl = `${supabaseUrl}/storage/v1/object/public/participants-assets/participants/p_3296.webp`;
  console.log('Sample Cloud URL:', sampleUrl);
}

main().catch(console.error);

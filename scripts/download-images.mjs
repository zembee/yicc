import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/lib/yftiParticipantsData.json');
const participants = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const participantsDir = path.join(__dirname, '../public/images/participants');
const logosDir = path.join(__dirname, '../public/images/logos');

if (!fs.existsSync(participantsDir)) fs.mkdirSync(participantsDir, { recursive: true });
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

async function downloadFile(url, destPath) {
  try {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      return true; // Already downloaded
    }
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.warn(`Failed to download ${url} (status ${res.status})`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.warn(`Error downloading ${url}:`, err.message);
    return false;
  }
}

function getExt(url) {
  try {
    const clean = url.split('?')[0];
    const ext = path.extname(clean).toLowerCase() || '.jpg';
    return ext;
  } catch {
    return '.jpg';
  }
}

async function main() {
  console.log(`Starting download of assets for ${participants.length} participants...`);

  let photoSuccess = 0;
  let logoSuccess = 0;

  // Process concurrently in chunks of 10
  const chunkSize = 10;
  for (let i = 0; i < participants.length; i += chunkSize) {
    const chunk = participants.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (p) => {
        // 1. Photo
        if (p.profile_picture_url && p.profile_picture_url.startsWith('http')) {
          const ext = getExt(p.profile_picture_url);
          const fileName = `p_${p.id}${ext}`;
          const dest = path.join(participantsDir, fileName);
          const ok = await downloadFile(p.profile_picture_url, dest);
          if (ok) {
            p.profile_picture_url = `/images/participants/${fileName}`;
            photoSuccess++;
          }
        }

        // 2. Logo
        if (p.company_logo_url && p.company_logo_url.startsWith('http')) {
          const ext = getExt(p.company_logo_url);
          const fileName = `logo_${p.id}${ext}`;
          const dest = path.join(logosDir, fileName);
          const ok = await downloadFile(p.company_logo_url, dest);
          if (ok) {
            p.company_logo_url = `/images/logos/${fileName}`;
            logoSuccess++;
          }
        }
      })
    );
    console.log(`Processed ${Math.min(i + chunkSize, participants.length)} / ${participants.length}...`);
  }

  // Save updated json
  fs.writeFileSync(jsonPath, JSON.stringify(participants, null, 2), 'utf-8');
  console.log(`✓ Saved updated yftiParticipantsData.json with local paths!`);
  console.log(`- Photos downloaded: ${photoSuccess}`);
  console.log(`- Logos downloaded: ${logoSuccess}`);

  // Also sync new local URLs to Supabase DB!
  try {
    const connectionString = 'postgresql://postgres.ygtiouphuajowaistiru:8HqOkhJ1tn7zom79@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    const { Client } = pg;
    const client = new Client({ connectionString });
    await client.connect();

    console.log('Updating image URLs in Supabase Database...');
    for (const p of participants) {
      await client.query(`
        UPDATE public.participants
        SET profile_picture_url = $1, company_logo_url = $2
        WHERE id = $3;
      `, [p.profile_picture_url, p.company_logo_url, p.id]);

      const lineUserId = `U_YFTI_${p.id}`;
      await client.query(`
        UPDATE public.profiles
        SET picture_url = $1
        WHERE line_user_id = $2;
      `, [p.profile_picture_url, lineUserId]);
    }
    await client.end();
    console.log('✓ Updated Supabase Database with fast local image paths!');
  } catch (dbErr) {
    console.warn('DB update notice:', dbErr.message);
  }
}

main().catch(console.error);

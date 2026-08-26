import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;
const connectionString = 'postgresql://postgres.ygtiouphuajowaistiru:8HqOkhJ1tn7zom79@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL database...');

  // 1. Ensure schema
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.participants (
      id BIGINT PRIMARY KEY,
      name_thai VARCHAR(255) NOT NULL,
      nickname_eng VARCHAR(100),
      fullname_eng VARCHAR(255),
      tel_number VARCHAR(50),
      profile_picture_url TEXT,
      star_group VARCHAR(100),
      star_group_label VARCHAR(100),
      gen VARCHAR(50) DEFAULT 'yfti_11',
      gen_label VARCHAR(50) DEFAULT 'YFTI 11',
      company_name_thai VARCHAR(255),
      company_name_eng VARCHAR(255),
      founded_year VARCHAR(50),
      business_position VARCHAR(255),
      industrial_groups VARCHAR(100),
      industrial_groups_label VARCHAR(255),
      business_categories VARCHAR(255),
      business_categories_label VARCHAR(255),
      company_description TEXT,
      company_address TEXT,
      comp_tel_number VARCHAR(100),
      company_logo_url TEXT,
      raw_meta JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.news (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      summary TEXT,
      content TEXT,
      image_url TEXT,
      category VARCHAR(100),
      date TIMESTAMPTZ DEFAULT NOW(),
      author VARCHAR(100) DEFAULT 'YFTI Media',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✓ Tables verified.');

  // 2. Sync Houses
  const houses = [
    { name: 'The Sun', color_hex: '#F59E0B', total_points: 1250 },
    { name: 'Earth', color_hex: '#10B981', total_points: 1180 },
    { name: 'Jupiter', color_hex: '#6366F1', total_points: 1120 },
    { name: 'The Mars', color_hex: '#EF4444', total_points: 980 },
    { name: 'Mercury', color_hex: '#8B5CF6', total_points: 950 },
    { name: 'Neptune', color_hex: '#06B6D4', total_points: 920 },
    { name: 'Saturn', color_hex: '#EC4899', total_points: 890 },
    { name: 'Uranus', color_hex: '#14B8A6', total_points: 860 },
    { name: 'Venus', color_hex: '#F97316', total_points: 830 },
  ];

  const houseMap = {};
  for (const h of houses) {
    const res = await client.query(`
      INSERT INTO public.houses (name, color_hex, total_points)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO UPDATE SET 
        color_hex = EXCLUDED.color_hex,
        total_points = EXCLUDED.total_points
      RETURNING id, name;
    `, [h.name, h.color_hex, h.total_points]);
    houseMap[h.name.toLowerCase()] = res.rows[0].id;
  }
  console.log('✓ Synced 9 Constellation Houses.');

  // 3. Load & sync all 122 participants from WordPress JSON extraction
  const participantsFilePath = path.join(__dirname, '../src/lib/yftiParticipantsData.json');
  const participants = JSON.parse(fs.readFileSync(participantsFilePath, 'utf-8'));

  console.log(`Syncing ${participants.length} real participants from WordPress into Supabase...`);

  for (const p of participants) {
    // 3a. Insert into participants
    await client.query(`
      INSERT INTO public.participants (
        id, name_thai, nickname_eng, fullname_eng, tel_number,
        profile_picture_url, star_group, star_group_label, gen, gen_label,
        company_name_thai, company_name_eng, founded_year, business_position,
        industrial_groups, industrial_groups_label, business_categories,
        business_categories_label, company_description, company_address,
        comp_tel_number, company_logo_url, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        $21, $22, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name_thai = EXCLUDED.name_thai,
        nickname_eng = EXCLUDED.nickname_eng,
        fullname_eng = EXCLUDED.fullname_eng,
        tel_number = EXCLUDED.tel_number,
        profile_picture_url = EXCLUDED.profile_picture_url,
        star_group = EXCLUDED.star_group,
        star_group_label = EXCLUDED.star_group_label,
        gen = EXCLUDED.gen,
        gen_label = EXCLUDED.gen_label,
        company_name_thai = EXCLUDED.company_name_thai,
        company_name_eng = EXCLUDED.company_name_eng,
        founded_year = EXCLUDED.founded_year,
        business_position = EXCLUDED.business_position,
        industrial_groups = EXCLUDED.industrial_groups,
        industrial_groups_label = EXCLUDED.industrial_groups_label,
        business_categories = EXCLUDED.business_categories,
        business_categories_label = EXCLUDED.business_categories_label,
        company_description = EXCLUDED.company_description,
        company_address = EXCLUDED.company_address,
        comp_tel_number = EXCLUDED.comp_tel_number,
        company_logo_url = EXCLUDED.company_logo_url,
        updated_at = NOW();
    `, [
      p.id,
      p.name_thai,
      p.nickname_eng || null,
      p.fullname_eng || null,
      p.tel_number || null,
      p.profile_picture_url || null,
      p.star_group || null,
      p.star_group_label || null,
      p.gen || 'yfti_11',
      p.gen_label || 'YFTI 11',
      p.company_name_thai || null,
      p.company_name_eng || null,
      p.founded_year || null,
      p.business_position || null,
      p.industrial_groups || null,
      p.industrial_groups_label || null,
      p.business_categories || null,
      p.business_categories_label || null,
      p.company_description || null,
      p.company_address || null,
      p.comp_tel_number || null,
      p.company_logo_url || null,
    ]);

    // 3b. Insert into profiles
    const lineUserId = `U_YFTI_${p.id}`;
    const email = `member${p.id}@yfticonnect.com`;
    const displayName = `${p.name_thai}${p.nickname_eng ? ` (${p.nickname_eng})` : ''}`;
    
    let matchedHouseId = null;
    if (p.star_group_label) {
      const key = p.star_group_label.toLowerCase().trim();
      matchedHouseId = houseMap[key] || houseMap['the ' + key] || null;
    }

    await client.query(`
      INSERT INTO public.profiles (
        line_user_id, email, display_name, picture_url, phone_number,
        company_name, position, industry, cohort_batch, house_id, role,
        points_balance, xp_balance
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, 'YFTI 11', $9, 'MEMBER',
        350, 1500
      )
      ON CONFLICT (line_user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        picture_url = EXCLUDED.picture_url,
        phone_number = EXCLUDED.phone_number,
        company_name = EXCLUDED.company_name,
        position = EXCLUDED.position,
        industry = EXCLUDED.industry,
        house_id = EXCLUDED.house_id;
    `, [
      lineUserId,
      email,
      displayName,
      p.profile_picture_url || null,
      p.tel_number || null,
      p.company_name_thai || null,
      p.business_position || null,
      p.industrial_groups_label || null,
      matchedHouseId
    ]);
  }
  console.log(`✓ Seeded ${participants.length} participants & profiles into Supabase!`);

  // 4. Seed News
  const newsList = [
    {
      id: 'news-1',
      title: 'พิธีเปิดหลักสูตรนักอุตสาหกรรมรุ่นใหม่ Young FTI ELITE รุ่นที่ 11',
      summary: 'สภาอุตสาหกรรมแห่งประเทศไทย (ส.อ.ท.) จัดพิธีเปิดหลักสูตรอย่างเป็นทางการ ณ โรงแรม ดิ แอทธินี โฮเทล แบงค็อก',
      content: 'สภาอุตสาหกรรมแห่งประเทศไทย (ส.อ.ท.) เดินหน้าขับเคลื่อนภาคอุตสาหกรรมไทยอย่างต่อเนื่อง จัดพิธีเปิดหลักสูตรนักอุตสาหกรรมรุ่นใหม่ Young FTI ELITE รุ่นที่ 11 พร้อมต้อนรับผู้บริหารและทายาทธุรกิจชั้นนำกว่า 120 ท่าน เพื่อร่วมสร้างเครือข่ายผู้นำอุตสาหกรรมยุคใหม่',
      image_url: 'https://yfticonnect.com/wp-content/uploads/2026/05/Young-FTI-11-477-scaled.jpg',
      category: 'ข่าวประชาสัมพันธ์',
      date: '2025-06-15T09:00:00Z',
      author: 'ทีมข่าว ส.อ.ท.'
    },
    {
      id: 'news-2',
      title: 'เจาะลึกนวัตกรรม Green Industry 4.0 สู่ความยั่งยืนระดับสากล',
      summary: 'สรุปประเด็นสัมมนาและการศึกษาดูงานโมเดลธุรกิจสีเขียวและ Carbon Neutrality สำหรับผู้บริหาร YFTI 11',
      content: 'การสัมมนาเชิงลึกด้านแนวคิด Net Zero และ ESG ในภาคอุตสาหกรรม พร้อมตัวอย่าง Best Practices จากโรงงานต้นแบบที่ประสบความสำเร็จในการลดต้นทุนพลังงานและเพิ่มมูลค่าแบรนด์ในตลาดยุโรป',
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
      category: 'ความรู้และนวัตกรรม',
      date: '2025-05-30T10:30:00Z',
      author: 'ฝ่ายวิชาการ YFTI'
    },
    {
      id: 'news-3',
      title: 'ภาพความประทับใจ Y11 Friendship Trip @ Maldives',
      summary: 'กิจกรรมสานสัมพันธ์และขยายโอกาสทางธุรกิจระดับนานาชาติของสมาชิก ณ ประเทศมัลดีฟส์',
      content: 'สมาชิก Young FTI ELITE รุ่นที่ 11 ร่วมเดินทางในทริปกระชับมิตรเพื่อแลกเปลี่ยนวิสัยทัศน์ทางธุรกิจ และเสริมสร้างความผูกพันระหว่างกลุ่มดวงดาวทั้ง 9 หลังอย่างอบอุ่น',
      image_url: 'https://yfticonnect.com/wp-content/uploads/2026/05/Maldives-Davilsnap-Day2-3_461-scaled.jpg',
      category: 'กิจกรรมสัมพันธ์',
      date: '2025-05-05T14:00:00Z',
      author: 'ฝ่ายกิจกรรมสันทนาการ'
    }
  ];

  for (const n of newsList) {
    await client.query(`
      INSERT INTO public.news (id, title, summary, content, image_url, category, date, author)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        content = EXCLUDED.content,
        image_url = EXCLUDED.image_url,
        category = EXCLUDED.category,
        date = EXCLUDED.date,
        author = EXCLUDED.author;
    `, [n.id, n.title, n.summary, n.content, n.image_url, n.category, n.date, n.author]);
  }
  console.log('✓ Synced news items.');

  // Set Public Read RLS
  await client.query(`
    ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public read participants" ON public.participants;
    CREATE POLICY "Allow public read participants" ON public.participants FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow public read houses" ON public.houses;
    CREATE POLICY "Allow public read houses" ON public.houses FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow public read news" ON public.news;
    CREATE POLICY "Allow public read news" ON public.news FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow public read events" ON public.events;
    CREATE POLICY "Allow public read events" ON public.events FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
    CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
  `);
  console.log('✓ RLS Policies configured.');

  const countRes = await client.query('SELECT count(*) FROM public.participants');
  const profCountRes = await client.query('SELECT count(*) FROM public.profiles');
  console.log(`=== SYNC COMPLETE ===`);
  console.log(`- Total participants in Supabase: ${countRes.rows[0].count}`);
  console.log(`- Total profiles in Supabase: ${profCountRes.rows[0].count}`);

  await client.end();
}

main().catch(err => {
  console.error('Error syncing:', err);
  process.exit(1);
});

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.ygtiouphuajowaistiru:8HqOkhJ1tn7zom79@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const schemaSql = `
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('MEMBER', 'HOUSE_ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('EVENT_ATTENDANCE', 'MISSION_REWARD', 'MANUAL_ADJUST', 'REDEEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. HOUSES
CREATE TABLE IF NOT EXISTS public.houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color_hex VARCHAR(7) DEFAULT '#3B82F6',
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    picture_url TEXT,
    phone_number VARCHAR(50),
    linkedin_url TEXT,
    company_name VARCHAR(255),
    position VARCHAR(255),
    industry VARCHAR(100),
    cohort_batch VARCHAR(50) NOT NULL DEFAULT 'YFTI Cohort 1',
    house_id UUID REFERENCES public.houses(id) ON DELETE SET NULL,
    role user_role NOT NULL DEFAULT 'MEMBER',
    points_balance INTEGER NOT NULL DEFAULT 0,
    xp_balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id ON public.profiles(line_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_house ON public.profiles(house_id);
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON public.profiles(industry);

-- 4. EVENTS & ATTENDANCE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_name VARCHAR(255),
    google_maps_url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reward_points INTEGER DEFAULT 50,
    reward_xp INTEGER DEFAULT 100,
    is_mandatory BOOLEAN DEFAULT TRUE,
    status event_status DEFAULT 'UPCOMING',
    checkin_secret_key VARCHAR(64) DEFAULT encode(gen_random_bytes(32), 'hex'),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    verified_by UUID REFERENCES public.profiles(id),
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    points_awarded INTEGER DEFAULT 0,
    xp_awarded INTEGER DEFAULT 0,
    CONSTRAINT unique_event_profile_checkin UNIQUE (event_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_checkins_profile ON public.event_checkins(profile_id);

-- 5. MISSIONS & SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reward_points INTEGER NOT NULL DEFAULT 20,
    reward_xp INTEGER NOT NULL DEFAULT 50,
    max_completions_per_user INTEGER DEFAULT 1,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    photo_storage_path TEXT NOT NULL,
    notes TEXT,
    status submission_status DEFAULT 'PENDING',
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewer_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POINT TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    house_id UUID REFERENCES public.houses(id) ON DELETE SET NULL,
    points_change INTEGER NOT NULL,
    xp_change INTEGER NOT NULL,
    type transaction_type NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATTENDANCE STATS VIEW
CREATE OR REPLACE VIEW public.profile_attendance_stats AS
SELECT 
    p.id AS profile_id,
    COUNT(DISTINCT e.id) FILTER (WHERE e.is_mandatory = TRUE AND e.start_time <= NOW()) AS total_mandatory_events,
    COUNT(DISTINCT ec.id) FILTER (WHERE e.is_mandatory = TRUE) AS attended_mandatory_events,
    CASE 
        WHEN COUNT(DISTINCT e.id) FILTER (WHERE e.is_mandatory = TRUE AND e.start_time <= NOW()) = 0 THEN 100.0
        ELSE ROUND(
            (COUNT(DISTINCT ec.id) FILTER (WHERE e.is_mandatory = TRUE)::NUMERIC / 
             NULLIF(COUNT(DISTINCT e.id) FILTER (WHERE e.is_mandatory = TRUE AND e.start_time <= NOW()), 0)) * 100, 
            2
        )
    END AS attendance_percentage
FROM public.profiles p
CROSS JOIN public.events e
LEFT JOIN public.event_checkins ec ON ec.profile_id = p.id AND ec.event_id = e.id
GROUP BY p.id;
`;

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✓ Connected successfully.');

    console.log('Applying Schema DDL...');
    await client.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    // Seed Houses
    console.log('Seeding Houses...');
    const houseAlpha = (await client.query(`
      INSERT INTO public.houses (name, color_hex, total_points)
      VALUES ('House Alpha (Dragons)', '#EF4444', 1450)
      ON CONFLICT (name) DO UPDATE SET total_points = 1450
      RETURNING id;
    `)).rows[0];

    const housePhoenix = (await client.query(`
      INSERT INTO public.houses (name, color_hex, total_points)
      VALUES ('House Phoenix', '#F59E0B', 1320)
      ON CONFLICT (name) DO UPDATE SET total_points = 1320
      RETURNING id;
    `)).rows[0];

    const housePegasus = (await client.query(`
      INSERT INTO public.houses (name, color_hex, total_points)
      VALUES ('House Pegasus', '#3B82F6', 1580)
      ON CONFLICT (name) DO UPDATE SET total_points = 1580
      RETURNING id;
    `)).rows[0];

    const houseTitans = (await client.query(`
      INSERT INTO public.houses (name, color_hex, total_points)
      VALUES ('House Titans', '#10B981', 1210)
      ON CONFLICT (name) DO UPDATE SET total_points = 1210
      RETURNING id;
    `)).rows[0];
    console.log('✓ Houses seeded.');

    // Seed Profiles
    console.log('Seeding Profiles...');
    const userPanupong = (await client.query(`
      INSERT INTO public.profiles (
        line_user_id, display_name, picture_url, email, phone_number, linkedin_url,
        company_name, position, industry, cohort_batch, house_id, role, points_balance, xp_balance
      ) VALUES (
        'U_demo_executive_001',
        'Panupong (CEO TechCorp)',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        'panupong@techcorp.co',
        '081-234-5678',
        'https://linkedin.com',
        'TechCorp Innovation',
        'Chief Executive Officer',
        'Technology & AI',
        'YFTI Cohort 1',
        $1,
        'SUPER_ADMIN',
        380,
        1450
      )
      ON CONFLICT (line_user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        picture_url = EXCLUDED.picture_url,
        role = EXCLUDED.role,
        house_id = EXCLUDED.house_id
      RETURNING id;
    `, [housePegasus.id])).rows[0];

    const userNatacha = (await client.query(`
      INSERT INTO public.profiles (
        line_user_id, display_name, picture_url, email, phone_number, linkedin_url,
        company_name, position, industry, cohort_batch, house_id, role, points_balance, xp_balance
      ) VALUES (
        'U_demo_002',
        'Natacha (MD Alpha Retail)',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        'natacha@alpharetail.co',
        '089-111-2222',
        'https://linkedin.com',
        'Alpha Retail Group',
        'Managing Director',
        'Retail & E-Commerce',
        'YFTI Cohort 1',
        $1,
        'MEMBER',
        290,
        980
      )
      ON CONFLICT (line_user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        picture_url = EXCLUDED.picture_url
      RETURNING id;
    `, [houseAlpha.id])).rows[0];

    const userKrit = (await client.query(`
      INSERT INTO public.profiles (
        line_user_id, display_name, picture_url, email, phone_number, linkedin_url,
        company_name, position, industry, cohort_batch, house_id, role, points_balance, xp_balance
      ) VALUES (
        'U_demo_003',
        'Krit (Founder FinTech X)',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        'krit@fintechx.io',
        '086-999-8888',
        'https://linkedin.com',
        'FinTech X Global',
        'Founder & Chairman',
        'Finance & Banking',
        'YFTI Cohort 1',
        $1,
        'HOUSE_ADMIN',
        420,
        1600
      )
      ON CONFLICT (line_user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        picture_url = EXCLUDED.picture_url
      RETURNING id;
    `, [housePhoenix.id])).rows[0];

    const userSiriwan = (await client.query(`
      INSERT INTO public.profiles (
        line_user_id, display_name, picture_url, email, phone_number, linkedin_url,
        company_name, position, industry, cohort_batch, house_id, role, points_balance, xp_balance
      ) VALUES (
        'U_demo_004',
        'Siriwan (VP Logistics Hub)',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
        'siriwan@logisticshub.th',
        '085-555-4321',
        'https://linkedin.com',
        'Siam Logistics Supply',
        'Vice President',
        'Logistics & Supply Chain',
        'YFTI Cohort 1',
        $1,
        'MEMBER',
        180,
        620
      )
      ON CONFLICT (line_user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        picture_url = EXCLUDED.picture_url
      RETURNING id;
    `, [houseTitans.id])).rows[0];
    console.log('✓ Profiles seeded.');

    // Seed Events
    console.log('Seeding Events...');
    const event1 = (await client.query(`
      INSERT INTO public.events (
        title, description, location_name, google_maps_url, start_time, end_time,
        reward_points, reward_xp, is_mandatory, status, created_by
      ) VALUES (
        'Executive Leadership & AI Strategy Forum',
        'เวิร์กช็อปพิเศษด้านการนำ Generative AI มาขับเคลื่อนองค์กรระดับ Enterprise พร้อมกรณีศึกษาจากผู้เชี่ยวชาญ',
        'The St. Regis Bangkok, Grand Ballroom',
        'https://maps.google.com',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '2 days' + INTERVAL '4 hours',
        100,
        250,
        TRUE,
        'UPCOMING',
        $1
      ) RETURNING id;
    `, [userPanupong.id])).rows[0];

    const event2 = (await client.query(`
      INSERT INTO public.events (
        title, description, location_name, start_time, end_time,
        reward_points, reward_xp, is_mandatory, status, created_by
      ) VALUES (
        'Cocktail Dinner & Business Speed Networking',
        'งานสังสรรค์กระชับมิตรและแลกเปลี่ยนคอนเนกชันทางธุรกิจระหว่างสมาชิกทุก House',
        'Park Hyatt Bangkok, Penthouse Grill',
        NOW() + INTERVAL '6 days',
        NOW() + INTERVAL '6 days' + INTERVAL '3 hours',
        50,
        150,
        FALSE,
        'UPCOMING',
        $1
      ) RETURNING id;
    `, [userPanupong.id])).rows[0];

    const event3 = (await client.query(`
      INSERT INTO public.events (
        title, description, location_name, start_time, end_time,
        reward_points, reward_xp, is_mandatory, status, created_by
      ) VALUES (
        'Cohort Orientation & Team Building Day',
        'วันปฐมนิเทศรุ่น แบ่งบ้านประจำกลุ่ม และกิจกรรมสานสัมพันธ์ผู้นำ',
        'Waldorf Astoria Bangkok',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days' + INTERVAL '8 hours',
        150,
        300,
        TRUE,
        'COMPLETED',
        $1
      ) RETURNING id;
    `, [userPanupong.id])).rows[0];

    // Seed Check-in for Event 3
    await client.query(`
      INSERT INTO public.event_checkins (event_id, profile_id, points_awarded, xp_awarded)
      VALUES ($1, $2, 150, 300)
      ON CONFLICT (event_id, profile_id) DO NOTHING;
    `, [event3.id, userPanupong.id]);
    console.log('✓ Events & Checkins seeded.');

    // Seed Missions
    console.log('Seeding Missions...');
    const mission1 = (await client.query(`
      INSERT INTO public.missions (title, description, reward_points, reward_xp, is_active)
      VALUES (
        'Seatmate Snap 📸',
        'ถ่ายรูปคู่กับเพื่อนร่วมโต๊ะหรือเพื่อนต่าง House ในคลาสเรียน แล้วอัปโหลดเพื่อสะสมแต้ม',
        30,
        80,
        TRUE
      ) RETURNING id;
    `)).rows[0];

    const mission2 = (await client.query(`
      INSERT INTO public.missions (title, description, reward_points, reward_xp, is_active)
      VALUES (
        'Mentor Connect 1-on-1 ☕',
        'นัดทานกาแฟหรือคุยแลกเปลี่ยนมุมมองธุรกิจกับวิทยากรหรือ Mentor ประจำกลุ่ม',
        80,
        200,
        TRUE
      ) RETURNING id;
    `)).rows[0];

    const mission3 = (await client.query(`
      INSERT INTO public.missions (title, description, reward_points, reward_xp, is_active)
      VALUES (
        'Business Cross-Collab 🤝',
        'ริเริ่มโปรเจกต์หรือจับคู่ธุรกิจ (Synergy) ร่วมกับสมาชิกในรุ่นอย่างน้อย 1 ธุรกิจ',
        150,
        400,
        TRUE
      ) RETURNING id;
    `)).rows[0];

    // Seed Mission Submissions
    await client.query(`
      INSERT INTO public.mission_submissions (
        mission_id, profile_id, photo_storage_path, notes, status
      ) VALUES (
        $1,
        $2,
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
        'Coffee chat กับ ดร.สมชาย เรื่อง AI Architecture',
        'PENDING'
      );
    `, [mission2.id, userPanupong.id]);

    await client.query(`
      INSERT INTO public.mission_submissions (
        mission_id, profile_id, photo_storage_path, notes, status
      ) VALUES (
        $1,
        $2,
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
        'ถ่ายรูปคู่กับทีม Pegasus ในช่วงเวิร์กช็อปเช้า',
        'PENDING'
      );
    `, [mission1.id, userNatacha.id]);

    console.log('✓ Missions and Submissions seeded.');
    console.log('\n========================================');
    console.log('🎉 ALL DATABASE TABLES AND MOCK DATA SEEDED SUCCESSFULLY!');
    console.log('========================================');

  } catch (error) {
    console.error('Database migration/seed error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

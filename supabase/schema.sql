-- =========================================================================
-- YEC / YICC Executive Cohort Community Database Schema (Supabase / Postgres)
-- =========================================================================

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

-- 2. HOUSES / TEAMS
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
    cohort_batch VARCHAR(50) NOT NULL DEFAULT 'Batch 1',
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

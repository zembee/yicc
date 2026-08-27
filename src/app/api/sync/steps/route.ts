import { NextRequest, NextResponse } from 'next/server';

interface SyncActivity {
  activityId?: number;
  activityName?: string;
  calories?: number;
  device?: string;
  distance?: number;
  duration?: number;
  id?: string;
  metadata?: {
    description?: string;
    intensity?: number;
    steps?: number;
  };
  sourceName?: string;
  start?: string;
  end?: string;
}

interface DailyStepRecord {
  date: string;
  steps: number;
  distance_meters?: number;
  calories_burned?: number;
  os?: 'ios' | 'android' | string;
  activities?: SyncActivity[];
}

interface StepSyncPayload {
  sync_type: 'daily_steps';
  user_id?: string;
  data: DailyStepRecord[];
}

export async function POST(req: NextRequest) {
  try {
    const body: StepSyncPayload = await req.json();

    if (body.sync_type !== 'daily_steps' || !Array.isArray(body.data)) {
      return NextResponse.json(
        { error: 'Invalid payload structure. Expected sync_type: "daily_steps" with data array.' },
        { status: 400 }
      );
    }

    let totalSteps = 0;
    let totalCalories = 0;
    let totalDistanceMeters = 0;
    let totalActivitiesCount = 0;

    const processedRecords = body.data.map((record) => {
      totalSteps += record.steps || 0;
      totalCalories += record.calories_burned || 0;
      totalDistanceMeters += record.distance_meters || 0;
      totalActivitiesCount += (record.activities || []).length;

      // Calculate reward coins & XP (e.g. 1 coin per 500 steps, max 20 coins/day)
      const earnedCoins = Math.min(20, Math.floor((record.steps || 0) / 500));
      const earnedXp = Math.floor((record.steps || 0) / 100);

      return {
        date: record.date,
        steps: record.steps,
        distance_km: Number(((record.distance_meters || 0) / 1000).toFixed(2)),
        calories_burned: record.calories_burned || 0,
        os: record.os || 'unknown',
        activities_count: (record.activities || []).length,
        earned_coins: earnedCoins,
        earned_xp: earnedXp,
      };
    });

    const totalCoinsEarned = processedRecords.reduce((acc, r) => acc + r.earned_coins, 0);
    const totalXpEarned = processedRecords.reduce((acc, r) => acc + r.earned_xp, 0);

    return NextResponse.json({
      success: true,
      sync_type: 'daily_steps',
      message: `Successfully synchronized ${body.data.length} daily step records!`,
      summary: {
        total_days_synced: body.data.length,
        total_steps: totalSteps,
        total_distance_km: Number((totalDistanceMeters / 1000).toFixed(2)),
        total_calories_burned: totalCalories,
        total_activities: totalActivitiesCount,
        reward_coins: totalCoinsEarned,
        reward_xp: totalXpEarned,
      },
      records: processedRecords,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process step sync request', details: error.message },
      { status: 500 }
    );
  }
}

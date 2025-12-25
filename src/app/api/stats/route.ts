// Stats API Route - Fetches and computes year statistics
import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken, getStoredAthlete } from '@/lib/tokens';
import { getAllActivitiesForYear, getAthlete } from '@/lib/strava';
import { computeYearStats } from '@/lib/stats';
import { StravaAthlete } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  // Get valid access token
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Get full athlete profile
    const storedAthlete = await getStoredAthlete();
    let athlete: StravaAthlete;

    if (storedAthlete && storedAthlete.id) {
      // Fetch full athlete data for complete profile
      athlete = await getAthlete(accessToken);
    } else {
      athlete = await getAthlete(accessToken);
    }

    // Fetch all activities for the year
    const activities = await getAllActivitiesForYear(accessToken, year);

    // Compute statistics
    const stats = computeYearStats(activities, athlete, year);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

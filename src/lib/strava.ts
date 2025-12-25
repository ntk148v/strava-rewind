// Strava API Client
import {
  StravaTokens,
  StravaAthlete,
  StravaActivity,
  StravaStats,
} from "@/types";

const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export function getAuthorizationUrl(): string {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "read,activity:read_all",
    approval_prompt: "auto",
  });

  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<StravaTokens> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<StravaTokens> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

export async function getAthlete(accessToken: string): Promise<StravaAthlete> {
  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch athlete");
  }

  return response.json();
}

export async function getAthleteStats(
  accessToken: string,
  athleteId: number
): Promise<StravaStats> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athletes/${athleteId}/stats`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch athlete stats");
  }

  return response.json();
}

export async function getActivities(
  accessToken: string,
  after: number,
  before: number,
  page: number = 1,
  perPage: number = 200
): Promise<StravaActivity[]> {
  const params = new URLSearchParams({
    after: after.toString(),
    before: before.toString(),
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  return response.json();
}

export async function getAllActivitiesForYear(
  accessToken: string,
  year: number
): Promise<StravaActivity[]> {
  const startOfYear = new Date(year, 0, 1).getTime() / 1000;
  const endOfYear = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;

  const allActivities: StravaActivity[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const activities = await getActivities(
      accessToken,
      startOfYear,
      endOfYear,
      page
    );
    allActivities.push(...activities);

    if (activities.length < 200) {
      hasMore = false;
    } else {
      page++;
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allActivities;
}

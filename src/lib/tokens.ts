// Token management utilities
import { cookies } from "next/headers";
import { StravaTokens, StravaAthlete } from "@/types";
import { refreshAccessToken, getAthlete } from "./strava";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export async function setTokens(tokens: StravaTokens, athlete: StravaAthlete) {
  const cookieStore = await cookies();

  cookieStore.set("strava_access_token", tokens.access_token, COOKIE_OPTIONS);
  cookieStore.set("strava_refresh_token", tokens.refresh_token, COOKIE_OPTIONS);
  cookieStore.set(
    "strava_expires_at",
    tokens.expires_at.toString(),
    COOKIE_OPTIONS
  );
  cookieStore.set(
    "strava_athlete",
    JSON.stringify({
      id: athlete.id,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      profile: athlete.profile,
    }),
    COOKIE_OPTIONS
  );
}

export async function clearTokens() {
  const cookieStore = await cookies();

  cookieStore.delete("strava_access_token");
  cookieStore.delete("strava_refresh_token");
  cookieStore.delete("strava_expires_at");
  cookieStore.delete("strava_athlete");
}

export async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("strava_access_token")?.value;
  const refreshToken = cookieStore.get("strava_refresh_token")?.value;
  const expiresAt = cookieStore.get("strava_expires_at")?.value;

  console.log("[Token] Checking tokens:", {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasExpiresAt: !!expiresAt,
    expiresAt: expiresAt,
  });

  if (!accessToken || !refreshToken || !expiresAt) {
    console.log("[Token] Missing required tokens");
    return null;
  }

  const expiresAtTime = parseInt(expiresAt);
  const now = Math.floor(Date.now() / 1000);

  console.log("[Token] Token expiry check:", {
    expiresAtTime,
    now,
    diff: expiresAtTime - now,
    isValid: expiresAtTime > now + 300,
  });

  // If token is still valid (with 5 min buffer), return it
  if (expiresAtTime > now + 300) {
    return accessToken;
  }

  // Token expired or about to expire, refresh it
  console.log("[Token] Token expired, attempting refresh...");
  try {
    const newTokens = await refreshAccessToken(refreshToken);
    console.log(
      "[Token] Refresh successful, new expires_at:",
      newTokens.expires_at
    );
    const athlete = await getAthlete(newTokens.access_token);
    await setTokens(newTokens, athlete);
    console.log("[Token] New tokens set successfully");
    return newTokens.access_token;
  } catch (error) {
    // Refresh failed, clear tokens
    console.error("[Token] Refresh failed:", error);
    await clearTokens();
    return null;
  }
}

export async function getStoredAthlete(): Promise<Partial<StravaAthlete> | null> {
  const cookieStore = await cookies();

  const athleteJson = cookieStore.get("strava_athlete")?.value;
  if (!athleteJson) return null;

  try {
    return JSON.parse(athleteJson);
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getValidAccessToken();
  return token !== null;
}

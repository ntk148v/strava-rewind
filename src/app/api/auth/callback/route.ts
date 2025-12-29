// OAuth Callback Route - Handles Strava redirect
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getAthlete } from "@/lib/strava";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Handle user denial or errors
  if (error || !code) {
    const errorMessage = error || "No authorization code received";
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get athlete profile
    const athlete = await getAthlete(tokens.access_token);

    // Create redirect response
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    // Set cookies directly on the response (more reliable for redirects)
    response.cookies.set(
      "strava_access_token",
      tokens.access_token,
      COOKIE_OPTIONS
    );
    response.cookies.set(
      "strava_refresh_token",
      tokens.refresh_token,
      COOKIE_OPTIONS
    );
    response.cookies.set(
      "strava_expires_at",
      tokens.expires_at.toString(),
      COOKIE_OPTIONS
    );
    response.cookies.set(
      "strava_athlete",
      JSON.stringify({
        id: athlete.id,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
        profile: athlete.profile,
      }),
      COOKIE_OPTIONS
    );

    console.log("[Callback] Cookies set on response, redirecting to dashboard");

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent("Authentication failed")}`,
        request.url
      )
    );
  }
}

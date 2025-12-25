// OAuth Callback Route - Handles Strava redirect
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getAthlete } from '@/lib/strava';
import { setTokens } from '@/lib/tokens';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle user denial or errors
  if (error || !code) {
    const errorMessage = error || 'No authorization code received';
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get athlete profile
    const athlete = await getAthlete(tokens.access_token);

    // Store tokens in cookies
    await setTokens(tokens, athlete);

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('Authentication failed')}`, request.url)
    );
  }
}

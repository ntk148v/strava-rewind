// OAuth Login Route - Redirects to Strava
import { redirect } from 'next/navigation';
import { getAuthorizationUrl } from '@/lib/strava';

export async function GET() {
  const authUrl = getAuthorizationUrl();
  redirect(authUrl);
}

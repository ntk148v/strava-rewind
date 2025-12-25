// Logout Route - Clears tokens and redirects home
import { NextResponse } from 'next/server';
import { clearTokens } from '@/lib/tokens';

export async function GET(request: Request) {
  await clearTokens();

  const url = new URL('/', request.url);
  return NextResponse.redirect(url);
}

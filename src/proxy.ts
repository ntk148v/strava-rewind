// Proxy to protect dashboard routes (Next.js 16+)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Only protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const accessToken = request.cookies.get("strava_access_token");
    const source = searchParams.get("source");

    // Allow access if using upload source (CSV data in localStorage)
    if (source === "upload") {
      return NextResponse.next();
    }

    // Require auth for OAuth-based access
    if (!accessToken) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

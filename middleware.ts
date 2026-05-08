import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight auth guard — reads cookies synchronously, zero network calls.
 *
 * The Supabase @supabase/ssr package stores the session JWT in a cookie whose
 * name matches `sb-*-auth-token*`. Checking for its presence is enough for
 * routing purposes; actual JWT validation and RLS enforcement happen in
 * Supabase's own servers when the client makes data requests.
 *
 * The old async `updateSession()` approach created a full Supabase client and
 * called `getSession()` on every single request (including RSC fetches for
 * each client-side navigation), blocking the entire response pipeline.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isPublic = isAuthRoute || pathname === "/";

  // Presence of any Supabase auth cookie means the user has a session.
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run on actual page/API routes — never on _next/static, _next/image,
  // or asset files. This ensures JS/CSS bundles are NEVER intercepted.
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)$).*)",
  ],
};

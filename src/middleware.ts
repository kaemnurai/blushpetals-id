import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Auth is handled entirely client-side by AdminGuard.
  // Middleware passes all admin requests through to avoid redirect ping-pong
  // caused by the mismatch between cookie-based (auth-helpers) and
  // localStorage-based (supabase-js) session storage.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path+"],
};

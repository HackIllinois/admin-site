import { NextRequest, NextResponse } from "next/server"
import { getAuthStatus, resolveAuthRedirect } from "@/util/auth"

// Runs before protected pages render, so an unauthenticated visitor is sent to
// sign-in instead of briefly seeing the admin UI. It also runs for RSC requests
// during client-side navigation and for direct loads.
export async function middleware(request: NextRequest) {
    const status = await getAuthStatus(request.headers.get("cookie"))
    const redirect = resolveAuthRedirect(status, request.nextUrl)
    if (redirect) {
        return NextResponse.redirect(new URL(redirect, request.nextUrl.origin))
    }
    return NextResponse.next()
}

// Keep this list to page routes. /account is the local sign-in page, /api holds
// auth/logout calls, and /email/*.png are public images used in sent mail.
export const config = {
    matcher: [
        "/admissions/:path*",
        "/attendances/:path*",
        "/notifications/:path*",
        "/events/:path*",
        "/staff-shifts/:path*",
        "/mentorship/:path*",
        "/newsletters/:path*",
        "/email",
        "/shop/:path*",
        "/jobs/:path*",
        "/sponsors/:path*",
        "/version/:path*",
        "/statistics/:path*",
    ],
}

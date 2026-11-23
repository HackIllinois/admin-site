// Pure auth helpers shared by the Edge middleware and the client API helper.
// Keep this module free of React and Next.js imports so both runtimes can use it.

const DEFAULT_API_BASE_URL = "https://adonix.hackillinois.org"
const PUBLIC_SITE_URL = "https://hackillinois.org/"
const STAFF_ROLES: readonly string[] = ["STAFF", "ADMIN"]

export type AuthStatus =
    | "authorized"
    | "signed-in"
    | "unauthenticated"
    | "unknown"

export function isLocalApi() {
    return process.env.NEXT_PUBLIC_API_URL !== undefined
}

export function getAuthApiUrl(path = "") {
    const base = (
        process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL
    ).replace(/\/+$/, "")
    return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base
}

export function isStaffRole(role: unknown) {
    return typeof role === "string" && STAFF_ROLES.includes(role)
}

function parseRoles(data: unknown): string[] {
    if (typeof data !== "object" || data === null || !("roles" in data)) {
        return []
    }
    const roles = (data as { roles?: unknown }).roles
    return Array.isArray(roles)
        ? roles.filter((role): role is string => typeof role === "string")
        : []
}

async function getErrorCode(response: Response): Promise<string | null> {
    try {
        const data: unknown = await response.json()
        if (
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
        ) {
            return data.error
        }
    } catch {
        // Fall through; an unreadable body is not proof of authorization.
    }
    return null
}

// Ask adonix whether the request's cookie is a valid staff session. The JWT is
// HTTP-only, so the browser cannot make this decision on its own.
export async function getAuthStatus(
    cookieHeader: string | null,
    fetchImpl: typeof fetch = fetch,
): Promise<AuthStatus> {
    let response: Response
    try {
        response = await fetchImpl(getAuthApiUrl("/auth/roles/"), {
            headers: cookieHeader ? { cookie: cookieHeader } : {},
            cache: "no-store",
        })
    } catch {
        // An unreachable API is not a reason to bounce staff to sign-in.
        return "unknown"
    }

    if (response.status === 200) {
        try {
            const roles = parseRoles(await response.json())
            return roles.some(isStaffRole) ? "authorized" : "signed-in"
        } catch {
            return "unknown"
        }
    }

    // adonix uses 403 both for expired tokens and for a valid login without
    // the required role. Only "Forbidden" means the session itself is good.
    if (response.status === 403) {
        return (await getErrorCode(response)) === "Forbidden"
            ? "signed-in"
            : "unauthenticated"
    }
    // Server errors and outages should not sign everyone out or cause loops.
    if (response.status >= 500) {
        return "unknown"
    }
    return "unauthenticated"
}

export function getSignInUrl(currentUrl: URL, provider = "google") {
    if (isLocalApi()) {
        // Local development signs in through the seeded users on /account.
        return "/account"
    }
    const url = new URL(
        `/auth/login/${encodeURIComponent(provider)}`,
        DEFAULT_API_BASE_URL,
    )
    url.searchParams.set("redirect", currentUrl.toString())
    return url.toString()
}

// Returns the URL to redirect to, or null when the request can proceed.
export function resolveAuthRedirect(status: AuthStatus, currentUrl: URL) {
    switch (status) {
        case "authorized":
        case "unknown":
            return null
        case "signed-in":
            // Already signed in but not staff: sending them to sign-in again
            // would just loop after the provider logs them back in.
            return isLocalApi() ? "/account" : PUBLIC_SITE_URL
        case "unauthenticated":
            return getSignInUrl(currentUrl)
    }
}

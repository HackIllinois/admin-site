import assert from "node:assert/strict"
import { test } from "node:test"
import { NextRequest } from "next/server"
import { config, middleware } from "../middleware"
import { routes } from "../util/routes"
import {
    getAuthApiUrl,
    getAuthStatus,
    getSignInUrl,
    isStaffRole,
    resolveAuthRedirect,
} from "../util/auth"

function withEnv(value: string | undefined, fn: () => void) {
    const previous = process.env.NEXT_PUBLIC_API_URL
    if (value === undefined) {
        delete process.env.NEXT_PUBLIC_API_URL
    } else {
        process.env.NEXT_PUBLIC_API_URL = value
    }
    try {
        fn()
    } finally {
        if (previous === undefined) {
            delete process.env.NEXT_PUBLIC_API_URL
        } else {
            process.env.NEXT_PUBLIC_API_URL = previous
        }
    }
}

async function withEnvAsync(
    value: string | undefined,
    fn: () => Promise<void>,
) {
    const previous = process.env.NEXT_PUBLIC_API_URL
    if (value === undefined) {
        delete process.env.NEXT_PUBLIC_API_URL
    } else {
        process.env.NEXT_PUBLIC_API_URL = value
    }
    try {
        await fn()
    } finally {
        if (previous === undefined) {
            delete process.env.NEXT_PUBLIC_API_URL
        } else {
            process.env.NEXT_PUBLIC_API_URL = previous
        }
    }
}

function stubFetch(
    response: Response,
    onCall?: (url: string, init?: RequestInit) => void,
): typeof fetch {
    return async (input, init) => {
        onCall?.(String(input), init)
        return response
    }
}

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    })
}

test("getAuthApiUrl points at adonix by default and the local API in dev", () => {
    withEnv(undefined, () => {
        assert.equal(getAuthApiUrl(), "https://adonix.hackillinois.org")
        assert.equal(
            getAuthApiUrl("/auth/roles/"),
            "https://adonix.hackillinois.org/auth/roles/",
        )
    })
    withEnv("http://localhost:8080/", () => {
        assert.equal(
            getAuthApiUrl("/auth/roles/"),
            "http://localhost:8080/auth/roles/",
        )
    })
})

test("isStaffRole only accepts staff and admin", () => {
    assert.equal(isStaffRole("STAFF"), true)
    assert.equal(isStaffRole("ADMIN"), true)
    assert.equal(isStaffRole("USER"), false)
    assert.equal(isStaffRole("ATTENDEE"), false)
    assert.equal(isStaffRole(null), false)
    assert.equal(isStaffRole(undefined), false)
})

test("getSignInUrl preserves the requested page and uses the dev login locally", () => {
    const current = new URL("https://admin.hackillinois.org/attendances?week=2")
    withEnv(undefined, () => {
        const url = new URL(getSignInUrl(current))
        assert.equal(
            url.origin + url.pathname,
            "https://adonix.hackillinois.org/auth/login/google",
        )
        assert.equal(url.searchParams.get("redirect"), current.toString())
        assert.equal(
            new URL(getSignInUrl(current, "github")).pathname,
            "/auth/login/github",
        )
    })
    withEnv("http://localhost:8080", () => {
        assert.equal(getSignInUrl(current), "/account")
    })
})

test("getAuthStatus forwards the cookie and recognizes a staff session", async () => {
    let seenUrl = ""
    let seenInit: RequestInit | undefined
    const fakeFetch = stubFetch(
        jsonResponse({ roles: ["USER", "STAFF"] }),
        (url, init) => {
            seenUrl = url
            seenInit = init
        },
    )
    await withEnvAsync(undefined, async () => {
        assert.equal(await getAuthStatus("token=abc", fakeFetch), "authorized")
    })
    assert.equal(seenUrl, "https://adonix.hackillinois.org/auth/roles/")
    assert.deepEqual(seenInit?.headers, { cookie: "token=abc" })
})

test("getAuthStatus separates non-staff, missing, and unavailable sessions", async () => {
    await withEnvAsync(undefined, async () => {
        assert.equal(
            await getAuthStatus(
                null,
                stubFetch(jsonResponse({ roles: ["USER"] })),
            ),
            "signed-in",
        )
        assert.equal(
            await getAuthStatus(
                null,
                stubFetch(jsonResponse({ roles: "STAFF" })),
            ),
            "signed-in",
        )
        assert.equal(
            await getAuthStatus(
                null,
                stubFetch(jsonResponse({ error: "Forbidden" }, 403)),
            ),
            "signed-in",
        )
        assert.equal(
            await getAuthStatus(
                null,
                stubFetch(jsonResponse({ error: "TokenExpired" }, 403)),
            ),
            "unauthenticated",
        )
        assert.equal(
            await getAuthStatus(
                null,
                stubFetch(new Response(null, { status: 401 })),
            ),
            "unauthenticated",
        )
        assert.equal(
            await getAuthStatus(
                null,
                stubFetch(new Response(null, { status: 503 })),
            ),
            "unknown",
        )
        assert.equal(
            await getAuthStatus(null, stubFetch(new Response("not json"))),
            "unknown",
        )
        assert.equal(
            await getAuthStatus(null, async () => {
                throw new Error("offline")
            }),
            "unknown",
        )
    })
})

test("resolveAuthRedirect avoids sending signed-in users back to sign-in", () => {
    const current = new URL("https://admin.hackillinois.org/attendances")
    withEnv(undefined, () => {
        assert.equal(resolveAuthRedirect("authorized", current), null)
        assert.equal(resolveAuthRedirect("unknown", current), null)
        assert.equal(
            resolveAuthRedirect("signed-in", current),
            "https://hackillinois.org/",
        )
        assert.equal(
            resolveAuthRedirect("unauthenticated", current),
            getSignInUrl(current),
        )
    })
    withEnv("http://localhost:8080", () => {
        assert.equal(resolveAuthRedirect("signed-in", current), "/account")
    })
})

function isProtected(pathname: string) {
    return config.matcher.some((pattern) => {
        const suffix = "/:path*"
        if (!pattern.endsWith(suffix)) {
            return pattern === pathname
        }
        const base = pattern.slice(0, -suffix.length)
        return pathname === base || pathname.startsWith(`${base}/`)
    })
}

test("the middleware matcher covers every admin page and its sub pages", () => {
    for (const route of routes) {
        // /account is the local sign-in page and must stay reachable.
        if (route.path === "/account") {
            continue
        }
        assert.equal(
            isProtected(route.path),
            true,
            `${route.path} should be protected`,
        )
    }
    assert.equal(isProtected("/events/abc/checkin"), true)
    assert.equal(isProtected("/admissions/review"), true)
})

test("the middleware matcher leaves public routes and assets alone", () => {
    for (const pathname of [
        "/",
        "/account",
        "/api/auth/logout/",
        "/api/auth/dev/login/staff/",
        "/_next/static/chunk.js",
        "/favicon.ico",
        "/email/header-2027.png",
    ]) {
        assert.equal(
            isProtected(pathname),
            false,
            `${pathname} should stay public`,
        )
    }
})

async function withFetch(response: Response, fn: () => Promise<void>) {
    const original = globalThis.fetch
    globalThis.fetch = stubFetch(response)
    try {
        await fn()
    } finally {
        globalThis.fetch = original
    }
}

test("middleware sends an unauthenticated page load to sign-in with the page preserved", async () => {
    await withFetch(new Response(null, { status: 401 }), async () => {
        await withEnvAsync(undefined, async () => {
            const response = await middleware(
                new NextRequest(
                    "https://admin.hackillinois.org/attendances?week=2",
                ),
            )
            assert.equal(response.status, 307)
            const location = new URL(response.headers.get("location")!)
            assert.equal(
                location.origin + location.pathname,
                "https://adonix.hackillinois.org/auth/login/google",
            )
            assert.equal(
                location.searchParams.get("redirect"),
                "https://admin.hackillinois.org/attendances?week=2",
            )
            assert.equal(await response.text(), "")
        })
    })
})

test("middleware lets a staff session through and never re-signs-in other users", async () => {
    await withFetch(jsonResponse({ roles: ["USER", "STAFF"] }), async () => {
        await withEnvAsync(undefined, async () => {
            const response = await middleware(
                new NextRequest("https://admin.hackillinois.org/attendances"),
            )
            assert.equal(response.headers.get("x-middleware-next"), "1")
        })
    })
    await withFetch(jsonResponse({ error: "Forbidden" }, 403), async () => {
        await withEnvAsync(undefined, async () => {
            const response = await middleware(
                new NextRequest("https://admin.hackillinois.org/attendances"),
            )
            assert.equal(response.status, 307)
            assert.equal(
                response.headers.get("location"),
                "https://hackillinois.org/",
            )
        })
    })
})

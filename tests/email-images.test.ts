import assert from "node:assert/strict"
import { afterEach, beforeEach, mock, test } from "node:test"
import { POST } from "../app/api/email/images/route"
import { emailImageHtml, MAX_EMAIL_IMAGE_BYTES } from "../util/email-images"
import { renderEmailBody } from "../util/email-template"

const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6v8AAAAASUVORK5CYII=",
    "base64",
)
const origin = "https://admin.hackillinois.org"
const sha = "a".repeat(40)
const originalEnvironment = { ...process.env }

beforeEach(() => {
    process.env.EMAIL_IMAGES_GITHUB_TOKEN = "test-server-secret"
    delete process.env.EMAIL_IMAGES_GITHUB_REPOSITORY
    delete process.env.EMAIL_IMAGES_GITHUB_BRANCH
})
afterEach(() => {
    mock.restoreAll()
    for (const name of [
        "EMAIL_IMAGES_GITHUB_TOKEN",
        "EMAIL_IMAGES_GITHUB_REPOSITORY",
        "EMAIL_IMAGES_GITHUB_BRANCH",
    ]) {
        if (originalEnvironment[name] === undefined) delete process.env[name]
        else process.env[name] = originalEnvironment[name]
    }
})

function request(body: BodyInit = png, headers: Record<string, string> = {}) {
    return new Request(`${origin}/api/email/images`, {
        method: "POST",
        body,
        headers: {
            origin,
            authorization: "Bearer test-user-session",
            "content-type": "image/png",
            ...headers,
        },
    })
}

function upstream(
    options: {
        roles?: string[]
        private?: boolean
        uploadStatus?: number
        authStatus?: number
    } = {},
) {
    return mock.method(
        globalThis,
        "fetch",
        async (input: string | URL | Request, init?: RequestInit) => {
            const url = String(input)
            if (url.includes("/auth/roles/"))
                return Response.json(
                    { roles: options.roles ?? ["ADMIN"] },
                    { status: options.authStatus ?? 200 },
                )
            if (init?.method === "PUT")
                return Response.json(
                    { commit: { sha } },
                    { status: options.uploadStatus ?? 201 },
                )
            return Response.json({ private: options.private ?? false })
        },
    )
}

test("an admin upload creates a new GitHub file and returns an immutable public URL", async () => {
    const fetchMock = upstream()
    const response = await POST(request())
    assert.equal(response.status, 201)
    const { url } = await response.json()
    assert.match(
        url,
        new RegExp(
            `^https://raw.githubusercontent.com/HackIllinois/adonix-metadata/${sha}/email/uploads/[a-f0-9-]+\\.png$`,
        ),
    )
    const calls = fetchMock.mock.calls
    assert.equal(calls.length, 3)
    assert.equal(
        new Headers(calls[0].arguments[1]?.headers).get("Authorization"),
        "Bearer test-user-session",
    )
    const upload = calls[2].arguments[1]!
    assert.equal(
        new Headers(upload.headers).get("Authorization"),
        "Bearer test-server-secret",
    )
    const payload = JSON.parse(String(upload.body))
    assert.equal(payload.content, png.toString("base64"))
    assert.equal(payload.branch, "main")
    assert.equal(
        payload.sha,
        undefined,
        "must never overwrite an existing image",
    )
    assert.ok(!url.includes("secret"))
})

test("rejects cross-origin requests before calling any upstream", async () => {
    const fetchMock = upstream()
    assert.equal(
        (await POST(request(png, { origin: "https://other.example" }))).status,
        403,
    )
    assert.equal(fetchMock.mock.calls.length, 0)
})

test("rejects missing authentication before calling any upstream", async () => {
    const fetchMock = upstream()
    assert.equal((await POST(request(png, { authorization: "" }))).status, 401)
    assert.equal(fetchMock.mock.calls.length, 0)
})

test("rejects staff without ADMIN permission before accessing GitHub", async () => {
    const fetchMock = upstream({ roles: ["STAFF"] })
    assert.equal((await POST(request())).status, 403)
    assert.equal(fetchMock.mock.calls.length, 1)
})

test("reports an expired session", async () => {
    upstream({ authStatus: 401 })
    assert.equal((await POST(request())).status, 401)
})

test("forwards only the auth cookie when no bearer is provided", async () => {
    const fetchMock = upstream()
    assert.equal(
        (
            await POST(
                request(png, {
                    authorization: "",
                    cookie: "unrelated=private; jwt=session",
                }),
            )
        ).status,
        201,
    )
    assert.equal(
        new Headers(fetchMock.mock.calls[0].arguments[1]?.headers).get(
            "cookie",
        ),
        "jwt=session",
    )
})

test("reports missing server setup without writing to GitHub", async () => {
    delete process.env.EMAIL_IMAGES_GITHUB_TOKEN
    const fetchMock = upstream()
    assert.equal((await POST(request())).status, 503)
    assert.equal(fetchMock.mock.calls.length, 1)
})

test("rejects disguised HTML and SVG images without trusting MIME type", async () => {
    const fetchMock = upstream()
    for (const body of [
        "<html>not an image</html>",
        "<svg xmlns='http://www.w3.org/2000/svg'></svg>",
        "",
    ]) {
        assert.equal((await POST(request(body))).status, 415)
    }
    assert.equal(fetchMock.mock.calls.length, 3)
})

test("enforces actual upload size even without Content-Length", async () => {
    const fetchMock = upstream()
    assert.equal(
        (await POST(request(Buffer.alloc(MAX_EMAIL_IMAGE_BYTES + 1)))).status,
        413,
    )
    assert.equal(fetchMock.mock.calls.length, 1)
})

test("rejects private repositories before writing", async () => {
    const fetchMock = upstream({ private: true })
    assert.equal((await POST(request())).status, 503)
    assert.equal(fetchMock.mock.calls.length, 2)
})

test("reports GitHub write failures without returning a broken URL", async () => {
    upstream({ uploadStatus: 409 })
    const response = await POST(request())
    assert.equal(response.status, 502)
    assert.equal((await response.json()).url, undefined)
})

test("handles network failures without leaking credentials", async () => {
    mock.method(globalThis, "fetch", async () => {
        throw new Error("test-server-secret")
    })
    const response = await POST(request())
    assert.equal(response.status, 502)
    assert.ok(!(await response.text()).includes("test-server-secret"))
})

test("escapes alt text and uses the same hosted image in the email wrapper", () => {
    const html = emailImageHtml(
        "https://example.com/banner.png",
        '\" onerror=\"alert(1) <b>&',
    )
    assert.ok(
        html.includes('alt="&quot; onerror=&quot;alert(1) &lt;b&gt;&amp;"'),
    )
    assert.ok(html.includes("max-width:560px"))
    assert.ok(renderEmailBody(html, origin).includes(html))
    assert.throws(() => emailImageHtml("javascript:alert(1)", ""))
})

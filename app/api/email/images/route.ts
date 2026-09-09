import { imageExtension, MAX_EMAIL_IMAGE_BYTES } from "@/util/email-images"

export const runtime = "nodejs"

const jsonError = (message: string, status: number) =>
    Response.json({ message }, { status })

export async function POST(request: Request) {
    // Require same-origin browser requests, including when authenticating by cookie.
    if (request.headers.get("origin") !== new URL(request.url).origin) {
        return jsonError("Upload images from the admin email editor.", 403)
    }
    const authorization = request.headers.get("authorization")
    const jwt = request.headers
        .get("cookie")
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("jwt="))
    if (!authorization && !jwt)
        return jsonError("Sign in before uploading images.", 401)

    try {
        const auth = await fetch(
            "https://adonix.hackillinois.org/auth/roles/",
            {
                headers: authorization
                    ? { Authorization: authorization }
                    : { Cookie: jwt! },
                cache: "no-store",
                redirect: "error",
                signal: AbortSignal.timeout(15000),
            },
        )
        if (auth.status === 401)
            return jsonError("Your session expired. Sign in again.", 401)
        if (!auth.ok)
            return jsonError(
                "Unable to verify your admin access.",
                auth.status === 403 ? 403 : 502,
            )
        const user = await auth.json()
        if (!Array.isArray(user.roles) || !user.roles.includes("ADMIN")) {
            return jsonError("Only admins can upload email images.", 403)
        }

        const token = process.env.EMAIL_IMAGES_GITHUB_TOKEN
        const repo =
            process.env.EMAIL_IMAGES_GITHUB_REPOSITORY ||
            "HackIllinois/adonix-metadata"
        const branch = process.env.EMAIL_IMAGES_GITHUB_BRANCH || "main"
        if (!token)
            return jsonError(
                "Image uploads are not configured yet. Ask the site maintainer to connect the GitHub image repository.",
                503,
            )
        if (!/^[\w.-]+\/[\w.-]+$/.test(repo))
            return jsonError(
                "The image repository configuration is invalid.",
                503,
            )

        const declaredSize = Number(request.headers.get("content-length"))
        if (declaredSize > MAX_EMAIL_IMAGE_BYTES)
            return jsonError("Choose an image smaller than 5 MB.", 413)
        if (!request.body) return jsonError("Choose an image to upload.", 400)
        const reader = request.body.getReader()
        const chunks: Uint8Array[] = []
        let size = 0
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            size += value.byteLength
            if (size > MAX_EMAIL_IMAGE_BYTES) {
                await reader.cancel()
                return jsonError("Choose an image smaller than 5 MB.", 413)
            }
            chunks.push(value)
        }
        const bytes = Buffer.concat(chunks)
        const extension = imageExtension(bytes)
        if (!extension)
            return jsonError("Choose a PNG, JPEG, or GIF image.", 415)

        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "HackIllinois-admin-email-images",
        }
        // Never produce authenticated/expiring image links from a private repo.
        const repository = await fetch(`https://api.github.com/repos/${repo}`, {
            headers,
            cache: "no-store",
            redirect: "error",
            signal: AbortSignal.timeout(15000),
        })
        if (!repository.ok || (await repository.json()).private !== false) {
            return jsonError(
                "The image repository must be public and accessible to the upload service.",
                503,
            )
        }
        const path = `email/uploads/${crypto.randomUUID()}.${extension}`
        const uploaded = await fetch(
            `https://api.github.com/repos/${repo}/contents/${path}`,
            {
                method: "PUT",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `Add email image ${path}`,
                    content: bytes.toString("base64"),
                    branch,
                }),
                redirect: "error",
                signal: AbortSignal.timeout(30000),
            },
        )
        if (!uploaded.ok)
            return jsonError(
                "GitHub could not save the image. Check repository write access and branch rules, then try again.",
                502,
            )
        const result = await uploaded.json()
        if (!/^[a-f0-9]{40}$/.test(result.commit?.sha))
            return jsonError(
                "GitHub saved the image but did not return its public URL. Contact the site maintainer.",
                502,
            )
        return Response.json(
            {
                url: `https://raw.githubusercontent.com/${repo}/${result.commit.sha}/${path}`,
            },
            { status: 201 },
        )
    } catch {
        return jsonError(
            "The image upload could not finish. Please try again.",
            502,
        )
    }
}

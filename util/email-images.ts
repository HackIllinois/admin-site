// Files are deployed from public/email/. Use a new filename for revised artwork
// so images referenced by previously sent emails remain unchanged.
export const EMAIL_IMAGES = [
    {
        path: "/email/speedrun_alpha_graphic.png",
        label: "speedrun Alpha banner",
        alt: "speedrun Alpha",
    },
    {
        path: "/email/header-2027.png",
        label: "HackIllinois 2027 header",
        alt: "HackIllinois",
    },
    {
        path: "/email/footer-2027.png",
        label: "HackIllinois 2027 footer",
        alt: "",
    },
] as const

export function emailImageUrl(path: string, assetBaseUrl: string): string {
    const base = new URL(assetBaseUrl)
    if (!["http:", "https:"].includes(base.protocol)) {
        throw new Error("Email images must be hosted at an HTTP or HTTPS URL.")
    }
    return new URL(path, base).href
}

export function emailImageHtml(url: string, alt: string): string {
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol))
        throw new Error("Images need an HTTP or HTTPS URL.")
    const escape = (value: string) =>
        value.replace(
            /[&<>"']/g,
            (char) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[char]!,
        )
    return `\n<img src="${escape(parsed.href)}" alt="${escape(alt)}" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;margin:16px auto;" />\n`
}

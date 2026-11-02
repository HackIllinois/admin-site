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
    // Reusable 2027 Wild West theme assets (public/email/assets/2027/)
    {
        path: "/email/assets/2027/canyon_hero.jpg",
        label: "2027 canyon sunset hero",
        alt: "",
    },
    {
        path: "/email/assets/2027/horse_divider.png",
        label: "2027 horse divider",
        alt: "",
    },
    {
        path: "/email/assets/2027/wood_plank_blank.png",
        label: "2027 wood plank (blank)",
        alt: "",
    },
    // Newsletter, November 2, 2026 (public/email/newsletter-2026-11-02/)
    {
        path: "/email/newsletter-2026-11-02/btn_theme_reveal.png",
        label: "Nov 2 newsletter: Watch the theme reveal button",
        alt: "Watch the theme reveal",
    },
    {
        path: "/email/newsletter-2026-11-02/btn_visa_roles.png",
        label: "Nov 2 newsletter: Explore Visa roles button",
        alt: "Explore Visa roles",
    },
    {
        path: "/email/newsletter-2026-11-02/btn_hardware_survey.png",
        label: "Nov 2 newsletter: Take the hardware survey button",
        alt: "Take the hardware survey",
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

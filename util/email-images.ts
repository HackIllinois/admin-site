export const MAX_EMAIL_IMAGE_BYTES = 5 * 1024 * 1024
export const EMAIL_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"]

export function imageExtension(bytes: Uint8Array): string | null {
    if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte))
        return "png"
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg"
    const signature = String.fromCharCode(...bytes.slice(0, 6))
    if (signature === "GIF87a" || signature === "GIF89a") return "gif"
    return null
}

export function emailImageHtml(url: string, alt: string): string {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:")
        throw new Error("Images need a public HTTPS URL.")
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

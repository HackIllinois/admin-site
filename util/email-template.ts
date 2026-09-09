function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        }
        return entities[character]
    })
}

/** The same email-safe HTML fragment is used for preview and both send actions. */
export function renderEmailBody(body: string, assetBaseUrl: string): string {
    const baseUrl = new URL(assetBaseUrl)
    if (!["http:", "https:"].includes(baseUrl.protocol)) {
        throw new Error("Email artwork must be hosted at an HTTP or HTTPS URL.")
    }

    const headerUrl = escapeHtml(
        new URL("/email/header-2027.png", baseUrl).href,
    )
    const footerUrl = escapeHtml(
        new URL("/email/footer-2027.png", baseUrl).href,
    )

    // Keep this a fragment: the mail API inserts it into its generic template.
    // PNGs and inline table styles also work in email clients without SVG/CSS support.
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#ffffff;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;">
                <tr>
                    <td style="padding:0;line-height:0;">
                        <img src="${headerUrl}" alt="HackIllinois" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#222222;overflow-wrap:anywhere;">
                        ${body}
                    </td>
                </tr>
                <tr>
                    <td style="padding:0;line-height:0;">
                        <img src="${footerUrl}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`
}

export function renderEmailPreview(subject: string, emailBody: string): string {
    return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin:0;background-color:#ffffff;">${emailBody}</body>
</html>`
}

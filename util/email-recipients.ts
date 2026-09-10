import { MailService, NewsletterService } from "@/generated"
import { handleError } from "@/util/api-client"

export const DEFAULT_EMAIL_GROUP = "registration_submissions"
const NEWSLETTER_PREFIX = "newsletter:"

export function newsletterGroupValue(id: string): string {
    return `${NEWSLETTER_PREFIX}${id}`
}

export function newsletterRecipients(subscribers: string[]): string[] {
    return [
        ...new Set(
            subscribers
                .map((email) => email.trim().toLowerCase())
                .filter(Boolean),
        ),
    ]
}

type PreparedGroup =
    | { kind: "registration"; label: string }
    | { kind: "newsletter"; label: string; emails: string[] }

export function groupConfirmation(group: PreparedGroup): string {
    const audience =
        group.kind === "registration"
            ? "registration_submissions (submissions matched to attendee profiles)"
            : `${group.emails.length} recipients in ${group.label}`
    return `Send this email to ${audience}? This cannot be undone.`
}

/** Resolve newsletter subscribers immediately before confirmation. Never fall
 * back to registration recipients when a newsletter cannot be loaded. */
export async function sendEmailToGroup(
    selection: string,
    message: { subject: string; body: string },
    confirm: (group: PreparedGroup) => boolean,
) {
    let group: PreparedGroup
    if (selection === DEFAULT_EMAIL_GROUP) {
        group = { kind: "registration", label: DEFAULT_EMAIL_GROUP }
    } else {
        if (
            !selection.startsWith(NEWSLETTER_PREFIX) ||
            selection === NEWSLETTER_PREFIX
        ) {
            throw new Error("Select an available recipient group.")
        }
        const id = selection.slice(NEWSLETTER_PREFIX.length)
        const newsletter = handleError(
            await NewsletterService.getNewsletterById({ path: { id } }),
        )
        const emails = newsletterRecipients(newsletter.subscribers)
        if (!emails.length)
            throw new Error(
                "This newsletter group has no recipients. No email was sent.",
            )
        group = { kind: "newsletter", label: `Newsletter: ${id}`, emails }
    }

    if (!confirm(group)) return null
    const response =
        group.kind === "registration"
            ? await MailService.postMailSendAttendees({ body: message })
            : await MailService.postMailSend({
                  body: { ...message, emails: group.emails },
              })
    return handleError(response)
}

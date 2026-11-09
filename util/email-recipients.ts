import {
    AdmissionService,
    MailService,
    NewsletterService,
    type ApplicantTag,
} from "@/generated"
import { handleError } from "@/util/api-client"
import { APPLICANT_TAGS, tagLabel } from "@/util/applicant-tags"

export const DEFAULT_EMAIL_GROUP = "registration_submissions"
export const ADMISSION_TAGS_GROUP = "admission_tags"
const NEWSLETTER_PREFIX = "newsletter:"
const TAGS_PREFIX = "tags:"

/** Selection value for a union of admission tags, in canonical tag order. */
export function tagGroupValue(tags: ApplicantTag[]): string {
    const chosen = APPLICANT_TAGS.filter((tag) => tags.includes(tag))
    return `${TAGS_PREFIX}${chosen.join(",")}`
}

function parseTagGroup(selection: string): ApplicantTag[] {
    return APPLICANT_TAGS.filter((tag) =>
        selection.slice(TAGS_PREFIX.length).split(",").includes(tag),
    )
}

/** Union several tag email lists: trimmed, lowercased, deduplicated. */
export function tagRecipients(lists: string[][]): string[] {
    return newsletterRecipients(lists.flat())
}

export function countApplicantsByTag(
    applicants: { tag: ApplicantTag }[],
): Record<ApplicantTag, number> {
    const counts = Object.fromEntries(
        APPLICANT_TAGS.map((tag) => [tag, 0]),
    ) as Record<ApplicantTag, number>
    for (const { tag } of applicants) counts[tag] += 1
    return counts
}

export function emailsToText(
    emails: string[],
    separator: "comma" | "newline",
): string {
    return emails.join(separator === "comma" ? ", " : "\n")
}

function csvCell(value: string): string {
    return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

export function emailsToCsv(emails: string[]): string {
    return ["email", ...emails.map(csvCell)].map((r) => `${r}\r\n`).join("")
}

/** Fetch current emails for one tag. Mailing lists are never stored. */
export async function fetchTagEmails(tag: ApplicantTag): Promise<string[]> {
    const data = handleError(
        await AdmissionService.getAdmissionApplicantsEmails({ query: { tag } }),
    )
    return newsletterRecipients(data.emails)
}

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
    | { kind: "newsletter"; listName: string; label: string; emails: string[] }
    | { kind: "tags"; label: string; emails: string[] }

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
    } else if (selection.startsWith(TAGS_PREFIX)) {
        const tags = parseTagGroup(selection)
        if (!tags.length) throw new Error("Select at least one admission tag.")
        const lists = await Promise.all(tags.map(fetchTagEmails))
        const emails = tagRecipients(lists)
        if (!emails.length)
            throw new Error(
                "The selected admission tags have no recipients. No email was sent.",
            )
        group = {
            kind: "tags",
            label: `Admission tags: ${tags.map(tagLabel).join(", ")}`,
            emails,
        }
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
        group = {
            kind: "newsletter",
            listName: id,
            label: `Newsletter: ${id}`,
            emails,
        }
    }

    if (!confirm(group)) return null
    const response =
        group.kind === "registration"
            ? await MailService.postMailSendAttendees({ body: message })
            : group.kind === "tags"
              ? await MailService.postMailSend({
                    body: { ...message, emails: group.emails },
                })
              : await MailService.postMailSendNewsletter({
                    body: { ...message, listName: group.listName },
                })
    return handleError(response)
}

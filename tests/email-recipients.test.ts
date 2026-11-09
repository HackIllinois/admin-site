import assert from "node:assert/strict"
import { afterEach, beforeEach, test } from "node:test"
import { client } from "../generated/client.gen"
import type { MailBulkSendResult } from "../generated"
import {
    DEFAULT_EMAIL_GROUP,
    countApplicantsByTag,
    emailsToCsv,
    emailsToText,
    groupConfirmation,
    newsletterGroupValue,
    sendEmailToGroup,
    tagGroupValue,
    tagRecipients,
} from "../util/email-recipients"

const originalConfig = client.getConfig()
const originalAlert = globalThis.alert
const message = { subject: "Test subject", body: "<p>Test body</p>" }
const success = { success: true, successCount: 2, failedCount: 0, errors: [] }
let requests: Request[] = []
let subscribers: string[] = []
let tagEmails: Record<string, string[]> = {}
let newsletterStatus = 200
let sendResult: MailBulkSendResult = success

beforeEach(() => {
    requests = []
    subscribers = ["one@example.com", "two@example.com"]
    tagEmails = {}
    newsletterStatus = 200
    sendResult = success
    globalThis.alert = () => {}
    client.setConfig({
        baseUrl: "https://email-test.invalid",
        fetch: async (request) => {
            requests.push(request.clone())
            assert.equal(
                new URL(request.url).origin,
                "https://email-test.invalid",
            )
            if (request.method === "GET") {
                const url = new URL(request.url)
                if (url.pathname === "/admission/applicants/emails/") {
                    return Response.json({
                        emails:
                            tagEmails[url.searchParams.get("tag") ?? ""] ?? [],
                    })
                }
                assert.ok(
                    new URL(request.url).pathname.startsWith("/newsletter/"),
                )
                return newsletterStatus === 200
                    ? Response.json({ newsletterId: "test-group", subscribers })
                    : Response.json(
                          { message: "Newsletter unavailable" },
                          { status: newsletterStatus },
                      )
            }
            assert.equal(request.method, "POST")
            return Response.json(sendResult)
        },
    })
})

afterEach(() => {
    client.setConfig(originalConfig)
    if (originalAlert) globalThis.alert = originalAlert
    else Reflect.deleteProperty(globalThis, "alert")
})

test("registration_submissions is the default and retains the existing attendee endpoint", async () => {
    assert.equal(DEFAULT_EMAIL_GROUP, "registration_submissions")
    const result = await sendEmailToGroup(
        DEFAULT_EMAIL_GROUP,
        message,
        (group) => {
            assert.match(
                groupConfirmation(group),
                /submissions matched to attendee profiles/,
            )
            return true
        },
    )
    assert.deepEqual(result, success)
    assert.equal(requests.length, 1)
    assert.equal(new URL(requests[0].url).pathname, "/mail/send/attendees/")
    assert.deepEqual(await requests[0].json(), message)
})

test("newsletter send confirms fresh subscribers and sends the list identity for server-side delivery", async () => {
    subscribers = [
        " One@example.com ",
        "one@example.com",
        "two@example.com",
        "",
    ]
    const result = await sendEmailToGroup(
        newsletterGroupValue("marketing"),
        message,
        (group) => {
            assert.equal(
                requests.length,
                1,
                "fetch subscribers before confirmation",
            )
            assert.match(
                groupConfirmation(group),
                /2 recipients in Newsletter: marketing/,
            )
            return true
        },
    )
    assert.deepEqual(result, success)
    assert.equal(new URL(requests[0].url).pathname, "/newsletter/marketing/")
    assert.equal(new URL(requests[1].url).pathname, "/mail/send/newsletter/")
    assert.deepEqual(await requests[1].json(), {
        ...message,
        listName: "marketing",
    })
})

test("a newsletter named registration_submissions does not select the registration audience", async () => {
    await sendEmailToGroup(
        newsletterGroupValue(DEFAULT_EMAIL_GROUP),
        message,
        () => true,
    )
    assert.equal(
        new URL(requests[0].url).pathname,
        "/newsletter/registration_submissions/",
    )
    assert.equal(new URL(requests[1].url).pathname, "/mail/send/newsletter/")
    assert.equal((await requests[1].json()).listName, DEFAULT_EMAIL_GROUP)
})

test("cancelling either confirmation sends no email", async () => {
    assert.equal(
        await sendEmailToGroup(DEFAULT_EMAIL_GROUP, message, () => false),
        null,
    )
    assert.equal(requests.length, 0)
    assert.equal(
        await sendEmailToGroup(
            newsletterGroupValue("marketing"),
            message,
            () => false,
        ),
        null,
    )
    assert.equal(requests.length, 1)
    assert.equal(requests[0].method, "GET")
})

test("empty newsletters cannot send or fall back to registration", async () => {
    subscribers = []
    await assert.rejects(
        sendEmailToGroup(newsletterGroupValue("empty"), message, () => {
            assert.fail("must not confirm an empty audience")
        }),
        /no recipients/,
    )
    assert.equal(requests.length, 1)
    assert.equal(requests[0].method, "GET")
})

test("newsletter lookup failures cannot send or fall back to registration", async () => {
    newsletterStatus = 404
    await assert.rejects(
        sendEmailToGroup(newsletterGroupValue("deleted"), message, () => true),
        /Newsletter unavailable/,
    )
    assert.equal(requests.length, 1)
    assert.equal(requests[0].method, "GET")
})

test("invalid group identifiers never send", async () => {
    for (const selection of ["", "unknown", "newsletter:"]) {
        await assert.rejects(
            sendEmailToGroup(selection, message, () => true),
            /Select an available recipient group/,
        )
    }
    assert.equal(requests.length, 0)
})

test("partial send results are returned without retrying successful recipients", async () => {
    sendResult = {
        success: false,
        successCount: 1,
        failedCount: 1,
        errors: ["Delivery failed"],
    }
    assert.deepEqual(
        await sendEmailToGroup(
            newsletterGroupValue("marketing"),
            message,
            () => true,
        ),
        sendResult,
    )
    assert.equal(requests.length, 2)
})

test("tagRecipients unions several tag lists, normalizes and dedupes", () => {
    assert.deepEqual(
        tagRecipients([
            [" A@x.com ", "b@x.com", ""],
            ["a@x.com", "C@x.com"],
        ]),
        ["a@x.com", "b@x.com", "c@x.com"],
    )
    assert.deepEqual(tagRecipients([]), [])
})

test("countApplicantsByTag counts rows per tag and zero-fills", () => {
    assert.deepEqual(
        countApplicantsByTag([
            { tag: "ADMITTED" },
            { tag: "ADMITTED" },
            { tag: "REJECTED" },
        ]),
        {
            IN_REVIEW: 0,
            ADMITTED: 2,
            ADMITTED_REIMBURSED: 0,
            WAITLISTED: 0,
            REJECTED: 1,
        },
    )
})

test("emailsToText joins with comma or newline", () => {
    assert.equal(
        emailsToText(["a@x.com", "b@x.com"], "comma"),
        "a@x.com, b@x.com",
    )
    assert.equal(
        emailsToText(["a@x.com", "b@x.com"], "newline"),
        "a@x.com\nb@x.com",
    )
})

test("emailsToCsv has a header, one row per email, and quotes unsafe values", () => {
    assert.equal(
        emailsToCsv(["a@x.com", "b@x.com"]),
        "email\r\na@x.com\r\nb@x.com\r\n",
    )
    assert.equal(
        emailsToCsv(['we"ird,@x.com']),
        'email\r\n"we""ird,@x.com"\r\n',
    )
    assert.equal(emailsToCsv([]), "email\r\n")
})

test("tag send unions fresh tag emails, confirms the deduped count, and posts to /mail/send/", async () => {
    tagEmails = {
        ADMITTED: ["a@x.com", "B@x.com"],
        ADMITTED_REIMBURSED: ["b@x.com", "c@x.com"],
    }
    const result = await sendEmailToGroup(
        tagGroupValue(["ADMITTED", "ADMITTED_REIMBURSED"]),
        message,
        (group) => {
            assert.equal(requests.length, 2, "fetch emails before confirmation")
            assert.equal(
                groupConfirmation(group),
                "Send this email to 3 recipients in Admission tags: Admitted, Admitted + reimb.? This cannot be undone.",
            )
            return true
        },
    )
    assert.deepEqual(result, success)
    assert.equal(new URL(requests[2].url).pathname, "/mail/send/")
    assert.deepEqual(await requests[2].json(), {
        ...message,
        emails: ["a@x.com", "b@x.com", "c@x.com"],
    })
})

test("tag send with no recipients or no tags never confirms or sends", async () => {
    await assert.rejects(
        sendEmailToGroup(tagGroupValue(["ADMITTED"]), message, () => {
            assert.fail("must not confirm an empty audience")
        }),
        /no recipients/,
    )
    await assert.rejects(
        sendEmailToGroup(tagGroupValue([]), message, () => true),
        /Select at least one admission tag/,
    )
    await assert.rejects(
        sendEmailToGroup("tags:NOPE", message, () => true),
        /Select at least one admission tag/,
    )
    assert.ok(requests.every((r) => r.method === "GET"))
})

test("cancelling a tag send posts nothing", async () => {
    tagEmails = { ADMITTED: ["a@x.com"] }
    assert.equal(
        await sendEmailToGroup(
            tagGroupValue(["ADMITTED"]),
            message,
            () => false,
        ),
        null,
    )
    assert.equal(requests.length, 1)
})

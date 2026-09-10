import assert from "node:assert/strict"
import { afterEach, beforeEach, test } from "node:test"
import { client } from "../generated/client.gen"
import {
    DEFAULT_EMAIL_GROUP,
    groupConfirmation,
    newsletterGroupValue,
    sendEmailToGroup,
} from "../util/email-recipients"

const originalConfig = client.getConfig()
const originalAlert = globalThis.alert
const message = { subject: "Test subject", body: "<p>Test body</p>" }
const success = { success: true, successCount: 2, failedCount: 0, errors: [] }
let requests: Request[] = []
let subscribers: string[] = []
let newsletterStatus = 200
let sendResult = success

beforeEach(() => {
    requests = []
    subscribers = ["one@example.com", "two@example.com"]
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

test("newsletter send confirms and sends only its freshly fetched unique subscribers", async () => {
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
    assert.equal(new URL(requests[1].url).pathname, "/mail/send/")
    assert.deepEqual(await requests[1].json(), {
        ...message,
        emails: ["one@example.com", "two@example.com"],
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
    assert.equal(new URL(requests[1].url).pathname, "/mail/send/")
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

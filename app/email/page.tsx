"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    MailService,
    MailBulkSendResult,
    NewsletterService,
    NewsletterSubscription,
} from "@/generated"
import { handleError } from "@/util/api-client"
import { renderEmailBody, renderEmailPreview } from "@/util/email-template"
import styles from "./style.module.scss"
import ImagePicker from "./ImagePicker"
import {
    DEFAULT_EMAIL_GROUP,
    groupConfirmation,
    newsletterGroupValue,
    newsletterRecipients,
    sendEmailToGroup,
} from "@/util/email-recipients"

type SendState =
    | { status: "editing" }
    | { status: "sending-self" }
    | { status: "sent-self" }
    | { status: "preparing-group" }
    | { status: "sending-group" }
    | { status: "sent-group" }
    | { status: "error"; message: string }

export default function Email() {
    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [assetBaseUrl, setAssetBaseUrl] = useState("")
    const [recipientGroup, setRecipientGroup] = useState(DEFAULT_EMAIL_GROUP)
    const [newsletters, setNewsletters] = useState<NewsletterSubscription[]>([])
    const [groupsLoading, setGroupsLoading] = useState(true)
    const [groupsError, setGroupsError] = useState("")
    const bodyRef = useRef<HTMLTextAreaElement>(null)
    const selectionRef = useRef({ start: 0, end: 0 })
    const previewRef = useRef<HTMLIFrameElement>(null)
    const [sendState, setSendState] = useState<SendState>({ status: "editing" })
    const [sendResult, setSendResult] = useState<MailBulkSendResult | null>(
        null,
    )

    const locked =
        sendState.status !== "editing" && sendState.status !== "error"

    const registrationSelected = recipientGroup === DEFAULT_EMAIL_GROUP
    const selectedNewsletter = newsletters.find(
        (newsletter) =>
            newsletterGroupValue(newsletter.newsletterId) === recipientGroup,
    )
    const groupLabel = registrationSelected
        ? DEFAULT_EMAIL_GROUP
        : `Newsletter: ${selectedNewsletter?.newsletterId ?? "unavailable"}`
    const recipientCount = selectedNewsletter
        ? newsletterRecipients(selectedNewsletter.subscribers).length
        : 0
    const groupReady =
        registrationSelected ||
        (!groupsLoading &&
            !groupsError &&
            !!selectedNewsletter &&
            recipientCount > 0)

    const loadGroups = useCallback(async () => {
        setGroupsLoading(true)
        setGroupsError("")
        try {
            const data = handleError(await NewsletterService.getNewsletter())
            setNewsletters(
                [...data].sort((a, b) =>
                    a.newsletterId.localeCompare(b.newsletterId),
                ),
            )
        } catch (err) {
            setGroupsError(err instanceof Error ? err.message : String(err))
        } finally {
            setGroupsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadGroups()
    }, [loadGroups])

    useEffect(() => {
        setAssetBaseUrl(
            process.env.NEXT_PUBLIC_EMAIL_ASSET_BASE_URL ||
                window.location.origin,
        )
    }, [])

    const email = useMemo(() => {
        if (!assetBaseUrl) return { body: "", error: "" }
        try {
            return { body: renderEmailBody(body, assetBaseUrl), error: "" }
        } catch (err) {
            return {
                body: "",
                error: err instanceof Error ? err.message : String(err),
            }
        }
    }, [assetBaseUrl, body])

    // Keep srcDoc stable while editing so the iframe and artwork stay loaded.
    const previewHtml = useMemo(() => {
        if (!assetBaseUrl) return ""
        try {
            return renderEmailPreview(
                "",
                renderEmailBody(
                    '<div id="email-preview-body"></div>',
                    assetBaseUrl,
                ),
            )
        } catch {
            // The existing email error reports invalid artwork configuration.
            return ""
        }
    }, [assetBaseUrl])

    const updatePreviewBody = useCallback(() => {
        const container =
            previewRef.current?.contentDocument?.getElementById(
                "email-preview-body",
            )
        if (container) container.innerHTML = body
    }, [body])

    const updatePreviewTitle = useCallback(() => {
        const document = previewRef.current?.contentDocument
        if (document) document.title = subject
    }, [subject])

    useEffect(updatePreviewBody, [updatePreviewBody])
    useEffect(updatePreviewTitle, [updatePreviewTitle])

    const handleSendSelf = async () => {
        if (!email.body) return
        setSendState({ status: "sending-self" })
        try {
            const result = await MailService.postMailSendSelf({
                body: { subject, body: email.body },
            })
            handleError(result)
            setSendState({ status: "sent-self" })
        } catch (err) {
            setSendState({
                status: "error",
                message: err instanceof Error ? err.message : String(err),
            })
        }
    }

    const handleSendGroup = async () => {
        if (!email.body || !groupReady || sendState.status !== "sent-self")
            return
        setSendState({ status: "preparing-group" })
        try {
            const data = await sendEmailToGroup(
                recipientGroup,
                { subject, body: email.body },
                (group) => {
                    if (!window.confirm(groupConfirmation(group))) return false
                    setSendState({ status: "sending-group" })
                    return true
                },
            )
            if (!data) {
                setSendState({ status: "sent-self" })
                return
            }
            setSendResult(data)
            setSendState({ status: "sent-group" })
        } catch (err) {
            setSendState({
                status: "error",
                message: err instanceof Error ? err.message : String(err),
            })
        }
    }

    const handleEdit = () => {
        setSendState({ status: "editing" })
        setSendResult(null)
    }

    const insertImage = (html: string) => {
        const { start, end } = selectionRef.current
        setBody(
            (current) => current.slice(0, start) + html + current.slice(end),
        )
        const cursor = start + html.length
        selectionRef.current = { start: cursor, end: cursor }
        requestAnimationFrame(() => {
            bodyRef.current?.focus()
            bodyRef.current?.setSelectionRange(cursor, cursor)
        })
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Email Preview</h1>
            </div>

            <div className={styles.subjectRow}>
                <label htmlFor="email-subject">Subject</label>
                <input
                    id="email-subject"
                    type="text"
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={locked}
                />
            </div>

            <div className={styles.recipientRow}>
                <label htmlFor="email-recipient-group">Recipient group</label>
                <div className={styles.recipientControls}>
                    <select
                        id="email-recipient-group"
                        value={recipientGroup}
                        disabled={locked}
                        aria-describedby="email-recipient-hint"
                        onChange={(event) => {
                            setRecipientGroup(event.target.value)
                            setSendState({ status: "editing" })
                            setSendResult(null)
                        }}
                    >
                        <option value={DEFAULT_EMAIL_GROUP}>
                            registration_submissions
                        </option>
                        <optgroup label="Newsletter groups">
                            {newsletters.map((newsletter) => (
                                <option
                                    key={newsletter.newsletterId}
                                    value={newsletterGroupValue(
                                        newsletter.newsletterId,
                                    )}
                                >
                                    {newsletter.newsletterId} (
                                    {
                                        newsletterRecipients(
                                            newsletter.subscribers,
                                        ).length
                                    }{" "}
                                    recipients)
                                </option>
                            ))}
                        </optgroup>
                        {!registrationSelected && !selectedNewsletter && (
                            <option value={recipientGroup} disabled>
                                Selected newsletter unavailable
                            </option>
                        )}
                    </select>
                    <button
                        type="button"
                        disabled={locked || groupsLoading}
                        onClick={loadGroups}
                    >
                        {groupsLoading ? "Loading groups…" : "Refresh groups"}
                    </button>
                </div>
                <p className={styles.editorHint} id="email-recipient-hint">
                    {registrationSelected
                        ? "Current registration audience: submissions matched to attendee profiles. No year filter is applied."
                        : `${recipientCount} unique recipients in this newsletter. The latest subscriber list is checked before confirmation.`}
                </p>
                {groupsError && (
                    <p className={styles.errorMessage} role="alert">
                        Could not load newsletter groups: {groupsError}.
                        Registration submissions remain available. Select
                        Refresh groups to retry.
                    </p>
                )}
                {!groupsLoading && !groupsError && newsletters.length === 0 && (
                    <p className={styles.editorHint}>
                        No newsletter groups found.
                    </p>
                )}
                {!registrationSelected && !groupsLoading && !groupReady && (
                    <p className={styles.editorHint}>
                        This group is unavailable or empty. Select another group
                        or refresh the list.
                    </p>
                )}
            </div>

            <ImagePicker
                assetBaseUrl={assetBaseUrl}
                disabled={locked}
                onInsert={insertImage}
            />

            <div className={styles.editorLayout}>
                <div className={styles.editorPane}>
                    <label htmlFor="email-body">Body (HTML)</label>
                    <p className={styles.editorHint} id="email-body-hint">
                        The HackIllinois header and footer are included
                        automatically. Place your cursor where you want an
                        image, then select Insert image above.
                    </p>
                    <textarea
                        ref={bodyRef}
                        id="email-body"
                        aria-describedby="email-body-hint"
                        placeholder="Enter email body HTML..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={locked}
                        onSelect={(event) => {
                            selectionRef.current = {
                                start: event.currentTarget.selectionStart,
                                end: event.currentTarget.selectionEnd,
                            }
                        }}
                    />
                </div>

                <div className={styles.previewPane}>
                    <label>Preview</label>
                    <iframe
                        ref={previewRef}
                        className={styles.previewFrame}
                        srcDoc={previewHtml}
                        onLoad={() => {
                            updatePreviewBody()
                            updatePreviewTitle()
                        }}
                        sandbox="allow-same-origin"
                        title="Email Preview"
                    />
                </div>
            </div>

            {sendState.status === "error" && (
                <div className={styles.errorMessage}>{sendState.message}</div>
            )}

            {email.error && (
                <div className={styles.errorMessage} role="alert">
                    {email.error}
                </div>
            )}

            <div className={styles.actions}>
                {sendState.status === "editing" ||
                sendState.status === "error" ? (
                    <button
                        className={styles.sendSelfBtn}
                        onClick={handleSendSelf}
                        disabled={!subject || !body || !email.body}
                    >
                        Send to Self
                    </button>
                ) : sendState.status === "sending-self" ? (
                    <button className={styles.sendSelfBtn} disabled>
                        Sending...
                    </button>
                ) : sendState.status === "sent-self" ? (
                    <>
                        <button className={styles.editBtn} onClick={handleEdit}>
                            Edit
                        </button>
                        <button
                            className={styles.sendGroupBtn}
                            onClick={handleSendGroup}
                            disabled={!email.body || !groupReady}
                        >
                            Send to {groupLabel}
                        </button>
                    </>
                ) : sendState.status === "preparing-group" ||
                  sendState.status === "sending-group" ? (
                    <button className={styles.sendGroupBtn} disabled>
                        {sendState.status === "preparing-group"
                            ? "Checking recipients…"
                            : `Sending to ${groupLabel}…`}
                    </button>
                ) : sendState.status === "sent-group" ? (
                    <>
                        <button className={styles.editBtn} onClick={handleEdit}>
                            Edit
                        </button>
                        {sendResult && (
                            <div className={styles.resultInfo}>
                                <span>{groupLabel}: </span>
                                <span
                                    className={
                                        sendResult.success
                                            ? styles.successMessage
                                            : styles.errorMessage
                                    }
                                >
                                    {sendResult.success
                                        ? "Sent successfully"
                                        : "Completed with errors"}
                                </span>
                                <span>
                                    {" "}
                                    — {sendResult.successCount} succeeded,{" "}
                                    {sendResult.failedCount} failed
                                </span>
                                {sendResult.errors.length > 0 && (
                                    <ul className={styles.errorList}>
                                        {sendResult.errors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </>
                ) : null}
            </div>
            <p className={styles.sendHint}>
                {sendState.status === "sent-self"
                    ? `Test email sent. Check your inbox, then send to ${groupLabel}. Select Edit to change the message or recipient group.`
                    : sendState.status === "editing" ||
                        sendState.status === "error"
                      ? `Send to Self sends only a test email to your account. After it succeeds, you can send to ${groupLabel}.`
                      : ""}
            </p>
        </div>
    )
}

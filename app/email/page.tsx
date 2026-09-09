"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MailService, MailBulkSendResult } from "@/generated"
import { handleError } from "@/util/api-client"
import { renderEmailBody, renderEmailPreview } from "@/util/email-template"
import styles from "./style.module.scss"
import ImagePicker from "./ImagePicker"

type SendState =
    | { status: "editing" }
    | { status: "sending-self" }
    | { status: "sent-self" }
    | { status: "sending-attendees" }
    | { status: "sent-attendees" }
    | { status: "error"; message: string }

export default function Email() {
    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [assetBaseUrl, setAssetBaseUrl] = useState("")
    const bodyRef = useRef<HTMLTextAreaElement>(null)
    const selectionRef = useRef({ start: 0, end: 0 })
    const previewRef = useRef<HTMLIFrameElement>(null)
    const [sendState, setSendState] = useState<SendState>({ status: "editing" })
    const [sendResult, setSendResult] = useState<MailBulkSendResult | null>(
        null,
    )

    const locked =
        sendState.status !== "editing" && sendState.status !== "error"

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

    const handleSendAttendees = async () => {
        if (!email.body) return
        if (
            !window.confirm(
                "Are you sure you want to send this email to ALL attendees? This cannot be undone.",
            )
        ) {
            return
        }
        setSendState({ status: "sending-attendees" })
        try {
            const result = await MailService.postMailSendAttendees({
                body: { subject, body: email.body },
            })
            const data = handleError(result)
            setSendResult(data)
            setSendState({ status: "sent-attendees" })
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
                            className={styles.sendAttendeesBtn}
                            onClick={handleSendAttendees}
                            disabled={!email.body}
                        >
                            Send to All Attendees
                        </button>
                    </>
                ) : sendState.status === "sending-attendees" ? (
                    <button className={styles.sendAttendeesBtn} disabled>
                        Sending to Attendees...
                    </button>
                ) : sendState.status === "sent-attendees" ? (
                    <>
                        <button className={styles.editBtn} onClick={handleEdit}>
                            Edit
                        </button>
                        {sendResult && (
                            <div className={styles.resultInfo}>
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
        </div>
    )
}

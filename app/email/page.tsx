"use client"
import React, { useEffect, useMemo, useState } from "react"
import { MailService, MailBulkSendResult } from "@/generated"
import { handleError } from "@/util/api-client"
import styles from "./style.module.scss"

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
    const [template, setTemplate] = useState("")
    const [sendState, setSendState] = useState<SendState>({ status: "editing" })
    const [sendResult, setSendResult] = useState<MailBulkSendResult | null>(null)

    const locked = sendState.status !== "editing" && sendState.status !== "error"

    useEffect(() => {
        fetch("/email-template.html")
            .then((res) => res.text())
            .then(setTemplate)
            .catch((err) => console.error("Failed to load email template:", err))
    }, [])

    const previewHtml = useMemo(() => {
        if (!template) return ""
        return template
            .replace("{{subject}}", subject)
            .replace("{{body}}", body)
    }, [template, subject, body])

    const handleSendSelf = async () => {
        setSendState({ status: "sending-self" })
        try {
            const result = await MailService.postMailSendSelf({
                body: { subject, body },
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
        if (!window.confirm("Are you sure you want to send this email to ALL attendees? This cannot be undone.")) {
            return
        }
        setSendState({ status: "sending-attendees" })
        try {
            const result = await MailService.postMailSendAttendees({
                body: { subject, body },
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

            <div className={styles.editorLayout}>
                <div className={styles.editorPane}>
                    <label htmlFor="email-body">Body (HTML)</label>
                    <textarea
                        id="email-body"
                        placeholder="Enter email body HTML..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={locked}
                    />
                </div>

                <div className={styles.previewPane}>
                    <label>Preview</label>
                    <iframe
                        className={styles.previewFrame}
                        srcDoc={previewHtml}
                        sandbox="allow-same-origin"
                        title="Email Preview"
                    />
                </div>
            </div>

            {sendState.status === "error" && (
                <div className={styles.errorMessage}>{sendState.message}</div>
            )}

            <div className={styles.actions}>
                {sendState.status === "editing" || sendState.status === "error" ? (
                    <button
                        className={styles.sendSelfBtn}
                        onClick={handleSendSelf}
                        disabled={!subject || !body}
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
                                <span className={sendResult.success ? styles.successMessage : styles.errorMessage}>
                                    {sendResult.success ? "Sent successfully" : "Completed with errors"}
                                </span>
                                <span> — {sendResult.successCount} succeeded, {sendResult.failedCount} failed</span>
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

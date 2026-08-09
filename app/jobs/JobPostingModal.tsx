"use client"

import {
    JobPosting,
    JobPostingCreateRequest,
    JobPostingMongoId,
} from "@/generated"
import { FormEvent, useEffect, useState } from "react"
import styles from "./style.module.scss"

interface JobPostingModalProps {
    posting: Partial<JobPosting>
    isSaving: boolean
    onClose: () => void
    onSave: (
        postingId: JobPostingMongoId | undefined,
        posting: JobPostingCreateRequest,
    ) => void
    onDelete: (postingId: JobPostingMongoId) => void
}

const emptyPosting: JobPostingCreateRequest = {
    companyName: "",
    logoUrl: "",
    jobTitle: "",
    jobDescription: "",
    applicationUrl: "",
}

export default function JobPostingModal({
    posting,
    isSaving,
    onClose,
    onSave,
    onDelete,
}: JobPostingModalProps) {
    const [form, setForm] = useState<JobPostingCreateRequest>({
        ...emptyPosting,
        ...posting,
    })

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isSaving) onClose()
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isSaving, onClose])

    const updateField = (
        field: keyof JobPostingCreateRequest,
        value: string,
    ) => {
        setForm((current) => ({ ...current, [field]: value }))
    }

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSave(posting._id, form)
    }

    return (
        <div
            className={styles.backdrop}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSaving) {
                    onClose()
                }
            }}
        >
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="job-posting-modal-title"
            >
                <div className={styles.modalHeader}>
                    <h2 id="job-posting-modal-title">
                        {posting._id ? "Edit job posting" : "Add job posting"}
                    </h2>
                    <button
                        className={styles.closeButton}
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form className={styles.form} onSubmit={submit}>
                    <label>
                        Company name
                        <input
                            value={form.companyName}
                            onChange={(event) =>
                                updateField("companyName", event.target.value)
                            }
                            required
                            autoFocus
                        />
                    </label>

                    <label>
                        Job title
                        <input
                            value={form.jobTitle}
                            onChange={(event) =>
                                updateField("jobTitle", event.target.value)
                            }
                            required
                        />
                    </label>

                    <label>
                        Logo URL
                        <input
                            type="url"
                            value={form.logoUrl}
                            onChange={(event) =>
                                updateField("logoUrl", event.target.value)
                            }
                            placeholder="https://example.com/logo.png"
                            required
                        />
                    </label>

                    <label>
                        Application URL
                        <input
                            type="url"
                            value={form.applicationUrl}
                            onChange={(event) =>
                                updateField(
                                    "applicationUrl",
                                    event.target.value,
                                )
                            }
                            placeholder="https://example.com/apply"
                            required
                        />
                    </label>

                    <label>
                        Job description
                        <textarea
                            value={form.jobDescription}
                            onChange={(event) =>
                                updateField(
                                    "jobDescription",
                                    event.target.value,
                                )
                            }
                            rows={8}
                            required
                        />
                    </label>

                    <div className={styles.formActions}>
                        {posting._id && (
                            <button
                                className={styles.deleteButton}
                                type="button"
                                onClick={() => onDelete(posting._id!)}
                                disabled={isSaving}
                            >
                                Delete
                            </button>
                        )}
                        <div className={styles.actionSpacer} />
                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            className={styles.primaryButton}
                            type="submit"
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}

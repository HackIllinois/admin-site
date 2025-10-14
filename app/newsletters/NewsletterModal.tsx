import React, { useState } from "react"
import { NewsletterSubscription } from "@/generated"
import styles from "./NewsletterModal.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes, faCopy, faCheck } from "@fortawesome/free-solid-svg-icons"

interface NewsletterModalProps {
    newsletter: NewsletterSubscription
    onClose: () => void
}

export default function NewsletterModal({
    newsletter,
    onClose,
}: NewsletterModalProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const emailList = newsletter.subscribers.join(", ")

        try {
            await navigator.clipboard.writeText(emailList)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea")
            textArea.value = emailList
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand("copy")
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>{newsletter.newsletterId}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={styles.content}>

                    <div className={styles.emailSection}>
                        <div className={styles.sectionHeader}>
                            <h3>{newsletter.subscribers.length} Subscriber Emails</h3>
                            <button
                                className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
                                onClick={handleCopy}
                            >
                                <FontAwesomeIcon
                                    icon={copied ? faCheck : faCopy}
                                />
                                {copied ? "Copied!" : "Copy List"}
                            </button>
                        </div>

                        <div className={styles.emailList}>
                            {newsletter.subscribers.length === 0 ? (
                                <div className={styles.empty}>
                                    No subscribers
                                </div>
                            ) : (
                                newsletter.subscribers.map((email, index) => (
                                    <div key={index} className={styles.email}>
                                        {email}
                                    </div>
                                ))
                            )}
                        </div>

                        {newsletter.subscribers.length > 0 && (
                            <div className={styles.copyPreview}>
                                <h4>Copy format preview:</h4>
                                <div className={styles.previewText}>
                                    {newsletter.subscribers.join(", ")}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

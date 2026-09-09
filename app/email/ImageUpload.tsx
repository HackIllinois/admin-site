"use client"

import { useRef, useState } from "react"
import { AuthService } from "@/generated"
import { handleError } from "@/util/api-client"
import {
    EMAIL_IMAGE_TYPES,
    MAX_EMAIL_IMAGE_BYTES,
    emailImageHtml,
} from "@/util/email-images"
import styles from "./style.module.scss"

export default function ImageUpload({
    disabled,
    onInsert,
    onBusyChange,
}: {
    disabled: boolean
    onInsert: (html: string) => void
    onBusyChange: (busy: boolean) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [alt, setAlt] = useState("")
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const [lastUrl, setLastUrl] = useState("")
    const [copied, setCopied] = useState(false)

    const upload = async (file: File) => {
        setError("")
        if (!EMAIL_IMAGE_TYPES.includes(file.type)) {
            setError("Choose a PNG, JPEG, or GIF image.")
            return
        }
        if (!file.size || file.size > MAX_EMAIL_IMAGE_BYTES) {
            setError("Choose a nonempty image smaller than 5 MB.")
            return
        }
        setBusy(true)
        onBusyChange(true)
        try {
            // The API cookie belongs to Adonix; obtain a JWT for this same-origin
            // endpoint as well, including on localhost and workers.dev previews.
            const session = handleError(await AuthService.getAuthToken())
            const response = await fetch("/api/email/images", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.jwt}`,
                    "Content-Type": file.type,
                },
                body: file,
            })
            const result = await response.json()
            if (!response.ok)
                throw new Error(result.message || "Image upload failed.")
            onInsert(emailImageHtml(result.url, alt))
            setLastUrl(result.url)
            setCopied(false)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Image upload failed.",
            )
        } finally {
            setBusy(false)
            onBusyChange(false)
        }
    }

    return (
        <div className={styles.imageUpload}>
            <label htmlFor="email-image-alt">
                Image description (alt text)
            </label>
            <input
                id="email-image-alt"
                value={alt}
                placeholder="Describe the banner, or leave blank if decorative"
                disabled={disabled || busy}
                onChange={(event) => setAlt(event.target.value)}
            />
            <div className={styles.imageActions}>
                <input
                    ref={inputRef}
                    type="file"
                    accept={EMAIL_IMAGE_TYPES.join(",")}
                    hidden
                    disabled={disabled || busy}
                    onChange={(event) => {
                        const file = event.target.files?.[0]
                        event.target.value = ""
                        if (file) void upload(file)
                    }}
                />
                <button
                    type="button"
                    disabled={disabled || busy}
                    onClick={() => inputRef.current?.click()}
                >
                    {busy ? "Uploading image…" : "Upload & insert image"}
                </button>
                <span>PNG, JPEG or GIF · Up to 5 MB · Hosted publicly</span>
            </div>
            {lastUrl && (
                <div className={styles.uploadResult}>
                    <span role="status">Image inserted.</span>{" "}
                    <a href={lastUrl} target="_blank" rel="noreferrer">
                        Open hosted image
                    </a>
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(lastUrl)
                                setCopied(true)
                            } catch {
                                setError(
                                    "Could not copy the URL. Open the hosted image to copy its address.",
                                )
                            }
                        }}
                    >
                        {copied ? "Copied!" : "Copy URL"}
                    </button>
                </div>
            )}
            {error && (
                <p className={styles.errorMessage} role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}

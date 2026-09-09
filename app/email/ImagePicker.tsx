"use client"

import { useRef, useState } from "react"
import {
    EMAIL_IMAGES,
    emailImageHtml,
    emailImageUrl,
} from "@/util/email-images"
import styles from "./style.module.scss"

export default function ImagePicker({
    assetBaseUrl,
    disabled,
    onInsert,
}: {
    assetBaseUrl: string
    disabled: boolean
    onInsert: (html: string) => void
}) {
    const [selectedPath, setSelectedPath] = useState<string>(
        EMAIL_IMAGES[0].path,
    )
    const [copiedUrl, setCopiedUrl] = useState("")
    const [copyError, setCopyError] = useState("")
    const urlRef = useRef<HTMLInputElement>(null)
    const selected = EMAIL_IMAGES.find((image) => image.path === selectedPath)!
    let url = ""
    try {
        if (assetBaseUrl) url = emailImageUrl(selected.path, assetBaseUrl)
    } catch {
        // The email editor reports invalid artwork configuration below.
    }

    const copyUrl = async () => {
        setCopyError("")
        try {
            await navigator.clipboard.writeText(url)
            setCopiedUrl(url)
        } catch {
            urlRef.current?.focus()
            urlRef.current?.select()
            setCopyError("Copy the selected image URL with your keyboard.")
        }
    }

    return (
        <div className={styles.imagePicker}>
            <label htmlFor="email-image">Email images</label>
            <div className={styles.imageActions}>
                <select
                    id="email-image"
                    value={selectedPath}
                    onChange={(event) => {
                        setSelectedPath(event.target.value)
                        setCopiedUrl("")
                        setCopyError("")
                    }}
                >
                    {EMAIL_IMAGES.map((image) => (
                        <option key={image.path} value={image.path}>
                            {image.label}
                        </option>
                    ))}
                </select>
                <button type="button" disabled={!url} onClick={copyUrl}>
                    Copy image URL
                </button>
                <button
                    type="button"
                    disabled={disabled || !url}
                    onClick={() => onInsert(emailImageHtml(url, selected.alt))}
                >
                    Insert image
                </button>
            </div>
            <input
                ref={urlRef}
                className={styles.imageUrl}
                aria-label="Selected image URL"
                value={url}
                readOnly
                onFocus={(event) => event.target.select()}
            />
            <p className={styles.editorHint}>
                Paste the full URL into your image&apos;s src attribute, or
                insert the image at the cursor. New images become available
                after a site deployment.
            </p>
            <span className={styles.copyStatus} role="status">
                {copyError ||
                    (copiedUrl && copiedUrl === url ? "Image URL copied." : "")}
            </span>
        </div>
    )
}

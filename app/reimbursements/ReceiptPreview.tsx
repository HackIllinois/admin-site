"use client"

import { getReceiptDownloadUrl } from "@/app/lib/api/reimbursements"
import { previewKind, type ReceiptSubmission } from "@/util/reimbursements"
import {
    faArrowUpRightFromSquare,
    faDownload,
    faFileCircleExclamation,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faRotateRight,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useState } from "react"
import styles from "./styles.module.scss"

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]

type PreviewState =
    | { kind: "loading" }
    | { kind: "ready"; url: string }
    | { kind: "error" }

export default function ReceiptPreview({
    submission,
}: {
    submission: ReceiptSubmission
}) {
    const [state, setState] = useState<PreviewState>({ kind: "loading" })
    const [zoomIndex, setZoomIndex] = useState(ZOOM_STEPS.indexOf(1))
    const [imageFailed, setImageFailed] = useState(false)

    const uploaded = Boolean(submission.uploadCompletedAt)
    const kind = previewKind(submission.contentType)

    // Presigned URLs are short-lived, so fetch a fresh one every time a receipt is opened
    const load = useCallback(async () => {
        setState({ kind: "loading" })
        setImageFailed(false)
        try {
            setState({
                kind: "ready",
                url: await getReceiptDownloadUrl(submission.id),
            })
        } catch {
            setState({ kind: "error" })
        }
    }, [submission.id])

    useEffect(() => {
        setZoomIndex(ZOOM_STEPS.indexOf(1))
        if (uploaded) {
            load()
        }
    }, [load, uploaded])

    // The URL may have expired since the preview loaded, so get a new one for the new tab
    const openInNewTab = async () => {
        const tab = window.open("", "_blank")
        try {
            const url = await getReceiptDownloadUrl(submission.id)
            if (tab) {
                tab.location.href = url
            } else {
                window.open(url, "_blank")
            }
        } catch {
            tab?.close()
            setState({ kind: "error" })
        }
    }

    if (!uploaded) {
        return (
            <div className={styles.previewEmpty}>
                <FontAwesomeIcon
                    icon={faFileCircleExclamation}
                    className={styles.previewEmptyIcon}
                />
                <h3>Upload not finished</h3>
                <p>
                    The attendee started this submission but the receipt file
                    never finished uploading. There&apos;s nothing to review yet.
                </p>
            </div>
        )
    }

    const zoom = ZOOM_STEPS[zoomIndex]
    const fileLabel =
        submission.originalFileName ??
        submission.contentType.split("/")[1].toUpperCase()

    return (
        <div className={styles.preview}>
            <div className={styles.previewToolbar}>
                <span className={styles.previewFile} title={fileLabel}>
                    {fileLabel}
                </span>
                <div className={styles.previewTools}>
                    {kind === "image" && state.kind === "ready" && (
                        <>
                            <button
                                className={styles.iconButton}
                                onClick={() =>
                                    setZoomIndex((i) => Math.max(0, i - 1))
                                }
                                disabled={zoomIndex === 0}
                                title="Zoom out"
                            >
                                <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
                            </button>
                            <button
                                className={styles.zoomLabel}
                                onClick={() =>
                                    setZoomIndex(ZOOM_STEPS.indexOf(1))
                                }
                                title="Reset zoom"
                            >
                                {Math.round(zoom * 100)}%
                            </button>
                            <button
                                className={styles.iconButton}
                                onClick={() =>
                                    setZoomIndex((i) =>
                                        Math.min(ZOOM_STEPS.length - 1, i + 1),
                                    )
                                }
                                disabled={zoomIndex === ZOOM_STEPS.length - 1}
                                title="Zoom in"
                            >
                                <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                            </button>
                        </>
                    )}
                    <button
                        className={styles.iconButton}
                        onClick={openInNewTab}
                        title="Open in new tab"
                    >
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </button>
                </div>
            </div>

            <div className={styles.previewBody}>
                {state.kind === "loading" && (
                    <div className={styles.previewMessage}>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <p>Loading receipt…</p>
                    </div>
                )}

                {(state.kind === "error" || imageFailed) && (
                    <div className={styles.previewMessage}>
                        <FontAwesomeIcon
                            icon={faFileCircleExclamation}
                            className={styles.previewEmptyIcon}
                        />
                        <h3>Couldn&apos;t load the receipt</h3>
                        <p>
                            The file storage may not be set up yet, or the link
                            expired. Try again in a moment.
                        </p>
                        <button className={styles.secondaryButton} onClick={load}>
                            <FontAwesomeIcon icon={faRotateRight} /> Retry
                        </button>
                    </div>
                )}

                {state.kind === "ready" && !imageFailed && kind === "pdf" && (
                    <iframe
                        className={styles.pdfFrame}
                        src={state.url}
                        title={`Receipt ${fileLabel}`}
                    />
                )}

                {state.kind === "ready" && !imageFailed && kind === "image" && (
                    <div className={styles.imageScroller}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not optimizable */}
                        <img
                            src={state.url}
                            alt={`Receipt ${fileLabel}`}
                            className={styles.receiptImage}
                            style={{ width: `${zoom * 100}%` }}
                            onError={() => setImageFailed(true)}
                        />
                    </div>
                )}

                {state.kind === "ready" && kind === "unsupported" && (
                    <div className={styles.previewMessage}>
                        <FontAwesomeIcon
                            icon={faFileCircleExclamation}
                            className={styles.previewEmptyIcon}
                        />
                        <h3>Preview not available</h3>
                        <p>
                            {submission.contentType === "image/heic" ||
                            submission.contentType === "image/heif"
                                ? "HEIC photos from iPhones can't be shown in most browsers."
                                : "This file type can't be shown in the browser."}{" "}
                            Download it to review.
                        </p>
                        <button
                            className={styles.secondaryButton}
                            onClick={openInNewTab}
                        >
                            <FontAwesomeIcon icon={faDownload} /> Download receipt
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

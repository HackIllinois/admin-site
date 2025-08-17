import React, { useRef, useState } from "react"
import { QRCode } from "react-qrcode-logo"
import { Event } from "@/generated"

import styles from "./EventCodeForm.module.scss"

interface EventCodeFormProps {
    event: Event
    onSubmit: () => void
    onCancel: () => void
}

export default function EventCodeForm({ event, onCancel }: EventCodeFormProps) {
    const [code, setCode] = useState(event.eventId)
    const [copySuccess, setCopySuccess] = useState(false)
    const qrCodeRef = useRef<QRCode>(null)

    function copyToClipboard() {
        if (!qrCodeRef.current) {
            return
        }
        const canvas = (
            qrCodeRef.current as unknown as {
                canvasRef: { current: HTMLCanvasElement }
            }
        ).canvasRef.current
        canvas.toBlob((blob) => {
            if (blob) {
                navigator.clipboard
                    .write([new ClipboardItem({ "image/png": blob })])
                    .then(() => {
                        setCopySuccess(true)
                        setTimeout(() => setCopySuccess(false), 1000)
                    })
                    .catch(() => {
                        alert("Failed to copy QR code.")
                    })
            }
        }, "image/png")
    }

    function download() {
        if (!qrCodeRef.current) {
            return
        }
        qrCodeRef.current.download("png", `${event.name} QR Code.png`)
    }

    return (
        <div className={styles.container}>
            <h2>QR Code</h2>
            <input
                className={styles["form-field"]}
                type="text"
                placeholder="Enter a code..."
                value={code}
                onChange={(event) => setCode(event.target.value)}
            />
            <div className={styles.code}>
                <QRCode ref={qrCodeRef} value={code} style={{
                    width: '300px',
                    height: '300px',
                }} />
            </div>
            <div className={styles.buttons}>
                <button
                    className={copySuccess ? styles.success : ""}
                    type="button"
                    onClick={copyToClipboard}
                >
                    Copy to Clipboard
                </button>
                <button type="button" onClick={download}>
                    Download
                </button>
                <button type="button" onClick={onCancel}>
                    Close
                </button>
            </div>
        </div>
    )
}

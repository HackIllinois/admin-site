'use client'

import React, { useRef, useState } from "react"
import { QRCode } from "react-qrcode-logo"
import { Event } from "@/generated"

import styles from "./EventCodeForm.module.scss"
import { BASENAME } from "@/util/basename"

interface EventCodeFormProps {
  event: Event
  onSubmit: () => void
  onCancel: () => void
}

export default function EventCodeForm({ event, onCancel }: EventCodeFormProps) {
  const [code, setCode] = useState(event.eventId)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isWeb, setIsWeb] = useState(true)
  const qrCodeRef = useRef<QRCode>(null)

  const displayedValue = isWeb
    ? `${BASENAME}/events/${event.eventId}/checkin`
    : code

  function copyToClipboard() {
    if (!qrCodeRef.current) return

    const canvas = (
      qrCodeRef.current as unknown as { canvasRef: { current: HTMLCanvasElement } }
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
    if (!qrCodeRef.current) return
    qrCodeRef.current.download(
      "png",
      `${event.name} ${isWeb ? "Web" : "Mobile"} QR Code.png`
    )
  }

  return (
    <div className={styles.container}>
      <h2>QR Code</h2>

      <div className={styles.toggleRow}>
        <button
          type="button"
          onClick={() => setIsWeb((prev) => !prev)}
        >
          {isWeb ? "Switch to Mobile QR" : "Switch to Web QR"}
        </button>
      </div>

      <input
        className={styles["form-field"]}
        type="text"
        placeholder="Enter a code..."
        value={displayedValue}
        onChange={(e) => setCode(e.target.value)}
      />

      <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '8px' }}>
        {isWeb ? "Web QR Code" : "Mobile QR Code"}
      </p>

      <div className={styles.code}>
        <QRCode
          ref={qrCodeRef}
          value={displayedValue}
          style={{ width: 300, height: 300 }}
        />
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
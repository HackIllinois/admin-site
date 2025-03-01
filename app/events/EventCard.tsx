import React, { useState } from "react"
import clsx from "clsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faKey,
    faLock,
    faClone,
} from "@fortawesome/free-solid-svg-icons"

import FormPopup from "@/components/FormPopup"
import EventCodeForm from "./EventCodeForm"
import { Event } from "@/generated"

import styles from "./EventCard.module.scss"

interface EventCardProps {
    event: Event
    canEdit: boolean
    onClick: (event: Event) => void
    onDuplicate: () => void
}

export default function EventCard({
    event,
    canEdit,
    onClick,
    onDuplicate,
}: EventCardProps) {
    const [showCodeForm, setShowCodeForm] = useState(false)

    const formatTime = (seconds: number) =>
        new Date(seconds * 1000).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
        })

    const calculateDayDifference = (event: Event) => {
        const startDay = new Date(event.startTime * 1000)
        const endDay = new Date(event.endTime * 1000)
        startDay.setHours(0, 0, 0, 0)
        endDay.setHours(0, 0, 0, 0)

        const difference = Math.round(
            (endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24),
        )
        const prefix = difference < 0 ? "-" : "+"
        if (difference !== 0) {
            return prefix + Math.abs(difference)
        }
        return ""
    }

    return (
        <div className={styles.container}>
            <button
                className={clsx(styles.card, canEdit && styles.clickable)}
                onClick={() => canEdit && onClick(event)}
            >
                <div className={styles.header}>
                    <div className={styles.name}>
                        {event.isPrivate && (
                            <FontAwesomeIcon
                                className={styles.private}
                                icon={faLock}
                                size="xs"
                            />
                        )}
                        {event.name}
                    </div>
                    <div className={styles.time}>
                        <div>{formatTime(event.startTime)}</div>
                        <div>
                            {formatTime(event.endTime)}
                            <span className="day-difference">
                                {calculateDayDifference(event)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.details}>
                    <div className={styles.description}>
                        {event.description}
                    </div>

                    {event.locations.length > 0 && (
                        <div className={styles.location}>
                            {(event.locations || [])
                                .map((location) => location.description)
                                .map((x) => x.trim())
                                .join(", ")}
                        </div>
                    )}

                    {event.points > 0 && (
                        <div className={styles.points}>
                            {event.points} Points
                        </div>
                    )}

                    <div className={styles.type}>{event.eventType}</div>
                </div>
            </button>

            <div className={styles.buttons}>
                <button onClick={onDuplicate}>
                    <FontAwesomeIcon icon={faClone} fixedWidth />
                </button>
                <button onClick={() => setShowCodeForm(true)}>
                    <FontAwesomeIcon icon={faKey} fixedWidth />
                </button>
            </div>

            <FormPopup
                form={EventCodeForm}
                onSubmit={() => setShowCodeForm(false)}
                onCancel={() => setShowCodeForm(false)}
                overrideShow={showCodeForm}
                event={event}
            ></FormPopup>
        </div>
    )
}

interface EventAddCardProps {
    onClick: () => void
}

export function EventAddCard({ onClick }: EventAddCardProps) {
    return (
        <div className={styles.container}>
            <button
                className={clsx(styles.card, styles.add, styles.clickable)}
                onClick={() => onClick()}
            >
                <FontAwesomeIcon icon={faPlus} />
            </button>
        </div>
    )
}

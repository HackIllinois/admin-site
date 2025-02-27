import React from "react"
import clsx from "clsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faKey, faLock } from "@fortawesome/free-solid-svg-icons"

import FormPopup from "@/components/FormPopup"
import EventCodeForm from "./EventCodeForm"
import { Event } from "@/generated"

import styles from "./EventCard.module.scss"

interface EventCardProps {
    event: Event
    canEdit: boolean
    onClick: (event: Event) => void
}

export default function EventCard({ event, canEdit, onClick }: EventCardProps) {
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

                    <div className={styles.location}>
                        {(event.locations || [])
                            .map((location) => location.description)
                            .map((x) => x.trim())
                            .join(", ")}
                    </div>

                    <div className={styles.type}>{event.eventType}</div>
                </div>
            </button>

            <FormPopup
                form={EventCodeForm}
                onSubmit={() => {}}
                onCancel={() => {}}
                overrideShow={undefined}
                event={event}
            >
                <button className={styles["code-button"]}>
                    <FontAwesomeIcon icon={faKey} fixedWidth />
                </button>
            </FormPopup>
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

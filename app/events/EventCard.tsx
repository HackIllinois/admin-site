import { faClone, faLock, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import clsx from "clsx"
import { useState } from "react"

import FormPopup from "@/components/FormPopup"
import { Event } from "@/generated"
import EventCodeForm from "./EventCodeForm"

import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode"
import { AccessTime, Place } from "@mui/icons-material"
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
                    <div className={styles.tags}>
                        <div className={styles.type}>{event.eventType}</div>
                        {event.points > 0 && (
                            <div className={styles.points}>
                                {event.points} Points
                            </div>
                        )}
                    </div>
                    <div className={styles.timeAndLocation}>
                        <div className={styles.time}>
                            <AccessTime
                                className={styles.icon}
                                fontSize="small"
                            />
                            <div>{formatTime(event.startTime)}</div>
                            {event.endTime !== event.startTime ? (
                                <>
                                    {" to "}
                                    <div>
                                        {formatTime(event.endTime)}
                                        <span className="day-difference">
                                            {calculateDayDifference(event)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                        {event.locations.length > 0 && (
                            <div className={styles.location}>
                                <Place
                                    className={styles.icon}
                                    fontSize="small"
                                />
                                {(event.locations || [])
                                    .map((location) => location.description)
                                    .map((x) => x.trim())
                                    .join(", ")}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.details}>
                    <div className={styles.description}>
                        {event.description}
                    </div>
                </div>
            </button>

            <div className={styles.buttons}>
                {canEdit && (
                    <button onClick={onDuplicate}>
                        <FontAwesomeIcon icon={faClone} fixedWidth />
                    </button>
                )}

                <button onClick={() => setShowCodeForm(true)}>
                    <FontAwesomeIcon icon={faQrcode} fixedWidth />
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

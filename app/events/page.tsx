"use client"
import React, { useCallback, useEffect, useState } from "react"

import EventEditPopup from "./EventEditPopup"
import Loading from "@/components/Loading"
import EventCard, { EventAddCard } from "./EventCard"
import { CreateEventRequest, Event, EventId, EventService } from "@/generated"
import { handleError, useRoles } from "@/util/api-client"

import styles from "./style.module.scss"

interface EventsForDay {
    date: Date
    events: Event[]
}
function sortEventsIntoDays(events: Event[]): EventsForDay[] {
    const eventsByDayTimestamp = new Map<number, Event[]>()

    events.forEach((event) => {
        const eventDate = new Date(event.startTime * 1000)
        eventDate.setHours(0, 0, 0, 0) // Sets to start of day
        const dayTimestamp = eventDate.getTime()

        if (!eventsByDayTimestamp.has(dayTimestamp)) {
            eventsByDayTimestamp.set(dayTimestamp, [])
        }
        eventsByDayTimestamp.get(dayTimestamp)!.push(event)
    })

    return Array.from(eventsByDayTimestamp.entries())
        .sort(([dateA], [dateB]) => dateA - dateB) // Sort timestamps in ascending order
        .map(([timestamp, events]) => ({
            date: new Date(timestamp),
            events: events.sort((a, b) => {
                if (a.startTime == b.startTime) {
                    return a.endTime - b.endTime
                }
                return a.startTime - b.startTime
            }),
        }))
}

export default function Events() {
    const [isLoading, setIsLoading] = useState(true)
    const [attendeeEventsByDays, setAttendeeEventsByDays] = useState<
        EventsForDay[]
    >([])
    const [staffEventsByDays, setStaffEventsByDays] = useState<EventsForDay[]>(
        [],
    )
    const [staffView, setStaffView] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(
        null,
    )
    const [editingDay, setEditingDay] = useState(new Date())
    const roles = useRoles()

    const fetchEvents = useCallback(async () => {
        setIsLoading(true)
        const [events, staffEvents] = await Promise.all([
            EventService.getEvent()
                .then(handleError)
                .then((result) =>
                    // Required because /event returns all non-staff-shift events
                    result.events.filter((event) => !event.isStaff),
                ),
            EventService.getEventStaff()
                .then(handleError)
                .then((result) => result.events),
        ])
        setAttendeeEventsByDays(sortEventsIntoDays(events))
        setStaffEventsByDays(sortEventsIntoDays(staffEvents))
        setIsLoading(false)
    }, [])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const deleteEvent = async (eventId: EventId) => {
        await EventService.deleteEventById({
            path: {
                id: eventId,
            },
        }).then(handleError)
        setEditingEvent(null)
        await fetchEvents()
    }

    const updateEvent = async (
        eventId: EventId | undefined,
        newEvent: CreateEventRequest,
    ) => {
        const request = eventId
            ? EventService.putEvent({ body: { eventId, ...newEvent } })
            : EventService.postEvent({ body: newEvent })
        await request.then(handleError)
        setEditingEvent(null)
        await fetchEvents()
    }

    if (isLoading) {
        return <Loading />
    }

    const isAdmin = roles.includes("ADMIN")
    const eventsByDays = staffView ? staffEventsByDays : attendeeEventsByDays

    return (
        <div className={styles.container}>
            <div className={styles.titles}>
                <div
                    className={staffView ? styles.active : ""}
                    onClick={() => setStaffView(true)}
                >
                    Staff Schedule
                </div>
                <div
                    className={!staffView ? styles.active : ""}
                    onClick={() => setStaffView(false)}
                >
                    Attendee Schedule
                </div>
            </div>
            <div className={styles["events-page"]}>
                {editingEvent && (
                    <EventEditPopup
                        editingEventId={editingEvent.eventId}
                        initialEvent={editingEvent}
                        initialDay={editingDay}
                        staffView={staffView}
                        onDismiss={() => setEditingEvent(null)}
                        onDeleteEvent={deleteEvent}
                        onUpdateEvent={updateEvent}
                    />
                )}

                {/* If there are no days, we still want to offer the ability to add events for admins */}
                {eventsByDays.length === 0 && isAdmin && (
                    <div className={styles.event}>
                        <div className={styles["day-of-week"]}>
                            No Events Found
                        </div>
                        <EventAddCard
                            onClick={() => {
                                setEditingDay(new Date())
                                setEditingEvent({})
                            }}
                        />
                    </div>
                )}

                {eventsByDays.map((day) => (
                    <div className={styles.day} key={day.date.toString()}>
                        <div className={styles["day-of-week"]}>
                            {day.date.toLocaleDateString("en-US", {
                                weekday: "long",
                            })}
                        </div>
                        <div className={styles.date}>
                            {day.date.toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                        <div className={styles.underline} />
                        <div className={styles.events}>
                            {day.events.map((event) => (
                                <EventCard
                                    canEdit={isAdmin}
                                    event={event}
                                    onClick={() => {
                                        setEditingDay(day.date)
                                        setEditingEvent(event)
                                    }}
                                    key={event.eventId}
                                />
                            ))}

                            {isAdmin && (
                                <EventAddCard
                                    onClick={() => {
                                        setEditingDay(day.date)
                                        setEditingEvent({})
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

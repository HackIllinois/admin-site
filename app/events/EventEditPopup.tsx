import React, { useState } from "react"
import { Formik, Form, Field } from "formik"

import DateInput from "@/components/DateInput"
import SelectField from "@/components/SelectField/SelectField"
import Checkbox, { FormikCheckbox } from "@/components/Checkbox"

import styles from "./EventEditPopup.module.scss"
import { CreateEventRequest, EventId } from "@/generated"
import LocationInput from "./LocationInput"

const publicEventTypes = [
    "MEAL",
    "MINIEVENT",
    "SPEAKER",
    "WORKSHOP",
    "QNA",
    "OTHER",
]
const staffEventTypes = ["MEETING", "STAFFSHIFT", "OTHER"]

type EventEditForm = Omit<CreateEventRequest, "eventType"> & {
    eventType: {
        label: CreateEventRequest["eventType"]
        value: CreateEventRequest["eventType"]
    } | null
}

interface EventEditProps {
    editingEventId?: EventId
    initialEvent: Partial<CreateEventRequest>
    initialDay?: Date
    staffView: boolean
    onDismiss: () => void
    onDeleteEvent: (eventId: EventId) => void
    onUpdateEvent: (
        eventId: EventId | undefined,
        newEvent: CreateEventRequest,
    ) => void
}

export default function EventEditPopup({
    editingEventId,
    initialEvent,
    initialDay = new Date(),
    staffView,
    onDismiss,
    onDeleteEvent,
    onUpdateEvent,
}: EventEditProps) {
    // New events default to current day @ noon
    const secondsUntilNoon = 12 * 60 * 60
    const time = Math.floor(initialDay.getTime() / 1000) + secondsUntilNoon
    const initialValues: EventEditForm = {
        startTime: time,
        endTime: time,
        name: "",
        description: "",
        // eventType: "",
        locations: [],
        sponsor: "",
        points: 0,
        isPrivate: false,
        displayOnStaffCheckIn: false,
        isAsync: false,
        isStaff: staffView,
        mapImageUrl: "",
        isPro: false,
        ...initialEvent,
        eventType: initialEvent.eventType
            ? {
                  label: initialEvent.eventType,
                  value: initialEvent.eventType,
              }
            : null,
    }

    const [expires, setExpires] = useState(!!initialValues.exp)

    const submit = (values: EventEditForm) => {
        if (!values.eventType) {
            return alert("Event type is required")
        }
        const newEvent: CreateEventRequest = {
            ...values,
            eventType: values.eventType.value,
            exp: expires ? values.exp : 0,
        }
        onUpdateEvent(editingEventId, newEvent)
    }

    return (
        <div className={styles["event-edit-popup"]}>
            <div className={styles["popup-background"]} onClick={onDismiss} />

            <div className={styles["popup-container"]}>
                <div className={styles.title}>
                    {editingEventId ? "Edit Event" : "Add Event"}
                </div>
                <Formik initialValues={initialValues} onSubmit={submit}>
                    {({ values, setFieldValue }) => (
                        <Form className={styles.form}>
                            <Field
                                className={styles["form-field"]}
                                name="name"
                                placeholder="Event Name"
                                autoFocus
                            />
                            <Field
                                component={DateInput}
                                name="startTime"
                                label="Start:"
                            />
                            <Field
                                component={DateInput}
                                name="endTime"
                                label="End:"
                            />

                            <div className={styles.expires}>
                                <Checkbox
                                    fast={false}
                                    label={"Expires"}
                                    value={expires}
                                    noHighlight={false}
                                    onChange={(enabled: boolean) => {
                                        if (enabled) {
                                            setFieldValue("exp", values.endTime)
                                        }
                                        setExpires(enabled)
                                    }}
                                />

                                {expires && (
                                    <Field component={DateInput} name="exp" />
                                )}
                            </div>

                            <Field
                                className={styles["form-field"]}
                                name="description"
                                as="textarea"
                                rows="5"
                                placeholder="Description"
                            />
                            <LocationInput name="locations" />

                            {!staffView && (
                                <Field
                                    className={styles["form-field"]}
                                    name="sponsor"
                                    placeholder="Sponsor"
                                />
                            )}

                            {staffView && (
                                <SelectField
                                    className={styles.select}
                                    name="eventType"
                                    menuPlacement="top"
                                    options={staffEventTypes.map((value) => ({
                                        label: value,
                                        value,
                                    }))}
                                    placeholder="Type"
                                />
                            )}

                            {/* TODO: Add label indicating that the following field is for Points (placeholder never shows up because default value is 0) */}
                            {!staffView && (
                                <>
                                    <SelectField
                                        className={styles.select}
                                        name="eventType"
                                        menuPlacement="top"
                                        options={publicEventTypes.map(
                                            (value) => ({
                                                label: value,
                                                value,
                                            }),
                                        )}
                                        placeholder="Type"
                                    />

                                    <Field
                                        className={styles["form-field"]}
                                        name="points"
                                        placeholder="Points"
                                        type="number"
                                    />
                                    <Field
                                        className={styles["form-field"]}
                                        name="mapImageUrl"
                                        placeholder="Map Image URL"
                                    />
                                    <Field
                                        className={styles["form-margins"]}
                                        component={FormikCheckbox}
                                        name="isPrivate"
                                        label="Private Event"
                                    />
                                    <Field
                                        className={styles["form-margins"]}
                                        component={FormikCheckbox}
                                        name="displayOnStaffCheckIn"
                                        label="Display on Staff Check-in"
                                    />
                                    <Field
                                        className={styles["form-margins"]}
                                        component={FormikCheckbox}
                                        name="isPro"
                                        label="Pro Event"
                                    />
                                </>
                            )}

                            <Field
                                className={styles["form-margins"]}
                                component={FormikCheckbox}
                                name="isAsync"
                                label="Async Event"
                            />

                            <div className={styles.buttons}>
                                {editingEventId && (
                                    <button
                                        className={styles.delete}
                                        type="button"
                                        onClick={() =>
                                            onDeleteEvent(editingEventId)
                                        }
                                    >
                                        Delete
                                    </button>
                                )}

                                <div className={styles.spacer} />
                                <button type="button" onClick={onDismiss}>
                                    Cancel
                                </button>
                                <button type="submit">Save</button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}

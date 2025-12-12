import React, { useCallback, useEffect, useState } from "react"
import { Formik, Form, Field, FormikHelpers } from "formik"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPaperPlane, faSync } from "@fortawesome/free-solid-svg-icons"
import { Tab, Tabs } from "@mui/material"

import SelectField from "@/components/SelectField/SelectField"
import Loading from "@/components/Loading"
import {
    EventService,
    NotificationMessage,
    NotificationService,
    NotificationSendRequest,
    Role,
} from "@/generated"

import styles from "./style.module.scss"
import { handleError, useRoles } from "@/util/api-client"
import type { Option } from "@/components/SelectField/SelectField"

interface NotificationSendFormOptions {
    title: string
    body: string
    topic: Option<string> | null
    role: Option<string> | null
    foodWave: Option<string> | null
    eventId: Option<string> | null
    staffShift: Option<string> | null
    userIds: string
}

const notificationInitialValues: NotificationSendFormOptions = {
    title: "",
    body: "",
    topic: null,
    role: null,
    foodWave: null,
    eventId: null,
    staffShift: null,
    userIds: "",
}

const topicOptions = [
    { label: "Role", value: "Role" },
    { label: "Event", value: "Event" },
    { label: "Staff Shift", value: "StaffShift" },
    { label: "Food Wave", value: "FoodWave" },
    { label: "Users", value: "UserIds" },
]

const roleOptions = [
    { label: "Admin", value: "ADMIN" },
    { label: "Staff", value: "STAFF" },
    { label: "Mentor", value: "MENTOR" },
    { label: "Attendee", value: "ATTENDEE" },
    { label: "User (Everyone)", value: "USER" },
]

const foodWaveOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
]

// function formatDate(seconds) {
//   return new Date(seconds * 1000).toLocaleDateString('en-US', {
//     month: 'long',
//     day: 'numeric',
//     hour: 'numeric',
//     minute: '2-digit',
//     second: '2-digit'
//   });
// }

export default function Notifications() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [sendProcessing, setSendProcessing] = useState<boolean>(false)
    const [notifications, setNotifications] = useState<NotificationMessage[]>(
        [],
    )

    const roles = useRoles()
    const [eventOptions, setEventOptions] = useState<
        { label: string; value: string }[]
    >([])
    const [staffEventOptions, setStaffEventOptions] = useState<
        { label: string; value: string }[]
    >([])

    const updateNotifications = () =>
        NotificationService.getNotification()
            .then(handleError)
            .then((response) => setNotifications(response.reverse()))

    const updateEventOptions = () =>
        EventService.getEvent()
            .then(handleError)
            .then((response) =>
                setEventOptions(
                    response.events.map((event) => ({
                        label: event.name,
                        value: event.eventId,
                    })),
                ),
            )

    const updateStaffEventOptions = () =>
        EventService.getEventStaff()
            .then(handleError)
            .then((response) =>
                setStaffEventOptions(
                    response.events.map((event) => ({
                        label: event.name,
                        value: event.eventId,
                    })),
                ),
            )

    const refresh = useCallback(() => {
        setIsLoading(true)
        Promise.all([
            updateNotifications(),
            updateEventOptions(),
            updateStaffEventOptions(),
        ]).then(() => setIsLoading(false))
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const submit = (
        values: NotificationSendFormOptions,
        formik: FormikHelpers<NotificationSendFormOptions>,
    ) => {
        if (values.title && values.topic) {
            const notification: NotificationSendRequest = {
                title: values.title,
                body: values.body,
            }
            switch (values.topic.value) {
                case "Role": {
                    if (!values.role) return alert("Role is required")
                    notification.role = values.role.value as Role
                    break
                }
                case "Event": {
                    if (!values.eventId) return alert("Event Id is required")
                    notification.eventId = values.eventId.value
                    break
                }
                case "StaffShift": {
                    if (!values.staffShift)
                        return alert("Staff Shift is required")
                    notification.staffShift = values.staffShift.value
                    break
                }
                case "FoodWave": {
                    if (values.foodWave === null)
                        return alert("Food wave is required")
                    notification.foodWave = parseInt(values.foodWave.value)
                    break
                }
                case "UserIds": {
                    if (!values.userIds) return alert("User Ids is required")
                    notification.userIds = values.userIds
                        .split(",")
                        .map((s) => s.trim())
                    break
                }
            }

            setSendProcessing(true)

            NotificationService.postNotificationSend({
                body: notification,
            })
                .then(handleError)
                .then(async () => {
                    setSendProcessing(false)
                    await refresh()
                    formik.resetForm()
                })
        }
    }

    if (isLoading) {
        return <Loading />
    }

    const isAdmin = roles.includes("ADMIN")
    const tabIndex = 0

    return (
        <div className={styles.page}>
            {isAdmin && (
                <div className={styles.top}>
                    <div
                        className={`${styles["send-notification"]} ${styles.tile}`}
                    >
                        <div className={styles.title}>Send Notification</div>
                        <Formik
                            initialValues={notificationInitialValues}
                            onSubmit={submit}
                        >
                            {({ values: { topic } }) => (
                                <Form>
                                    <Field
                                        className={styles["form-field"]}
                                        name="title"
                                        placeholder="Title"
                                    />

                                    <SelectField
                                        name="topic"
                                        className={styles["select-container"]}
                                        placeholder="Select Topic"
                                        options={topicOptions}
                                    />

                                    {topic?.value === "Role" && (
                                        <SelectField
                                            name="role"
                                            className={styles.select}
                                            placeholder="Select Role"
                                            options={roleOptions}
                                        />
                                    )}

                                    {topic?.value === "Event" && (
                                        <SelectField
                                            name="eventId"
                                            className={styles.select}
                                            placeholder="Select Event"
                                            options={eventOptions}
                                        />
                                    )}

                                    {topic?.value === "StaffShift" && (
                                        <SelectField
                                            name="staffShift"
                                            className={styles.select}
                                            placeholder="Select Staff Shift"
                                            options={staffEventOptions}
                                        />
                                    )}

                                    {topic?.value === "FoodWave" && (
                                        <SelectField
                                            name="foodWave"
                                            className={styles.select}
                                            placeholder="Select Food Wave"
                                            options={foodWaveOptions}
                                        />
                                    )}

                                    {topic?.value === "UserIds" && (
                                        <Field
                                            name="userIds"
                                            className={styles["form-field"]}
                                            placeholder="Enter User Ids (comma separated)"
                                        />
                                    )}

                                    <Field
                                        className={styles["form-field"]}
                                        as="textarea"
                                        name="body"
                                        placeholder="Body"
                                        rows="4"
                                    />

                                    <div className={styles.buttons}>
                                        <button
                                            disabled={sendProcessing}
                                            type="submit"
                                        >
                                            <FontAwesomeIcon
                                                icon={faPaperPlane}
                                            />{" "}
                                            &nbsp;Send
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}

            <div className={styles["heading-container"]}>

                <Tabs value={tabIndex}>
                    <Tab label="Past Notifications" className={styles.tab} />
                </Tabs>

                <FontAwesomeIcon
                    className={styles.refresh}
                    icon={faSync}
                    onClick={() => refresh()}
                />
            </div>

            <div className={styles.notifications}>
                {notifications.map((notification, index) => (
                    <div className={styles.notification} key={index}>
                        <div className={styles.topic}>
                            Sender: {notification.sender}
                        </div>
                        <div className={styles.title}>{notification.title}</div>
                        <div className={styles.body}>{notification.body}</div>
                        <div className={styles.spacer}></div>
                        <div className={styles.sent}>
                            Sent: {notification.sent.length}
                        </div>
                        <div className={styles.failed}>
                            Failed: {notification.failed.length}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

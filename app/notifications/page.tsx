"use client"
import React, { useCallback, useEffect, useState } from "react"
import { Formik, Form, Field, FormikHelpers } from "formik"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPaperPlane, faSync } from "@fortawesome/free-solid-svg-icons"

import SelectField from "@/components/SelectField/SelectField"
import Loading from "@/components/Loading"
import {
    AuthService,
    EventService,
    NotificationMessage,
    NotificationService,
    NotificationSendRequest,
    Role,
} from "@/generated"

import styles from "./style.module.scss"

interface NotificationSendFormOptions {
    title: string
    body: string
    topic: string
    role: string
    foodWave: string
    eventId: string
    staffShift: string
    userIds: string
}

const notificationInitialValues: NotificationSendFormOptions = {
    title: "",
    body: "",
    topic: "",
    role: "",
    foodWave: "",
    eventId: "",
    staffShift: "",
    userIds: "",
}

const topicOptions = [
    { label: "Role", value: "Role" },
    { label: "Event", value: "Event" },
    { label: "Staff Shift", value: "StaffShift" },
    { label: "Food Wave", value: "FoodWave" },
    { label: "Users", value: "UserIds" },
]

const roles = [
    { label: "Admin", value: "ADMIN" },
    { label: "Staff", value: "STAFF" },
    { label: "Mentor", value: "MENTOR" },
    { label: "Attendee", value: "ATTENDEE" },
    { label: "User (Everyone)", value: "USER" },
]

const foodWaves = [
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
    const [isAdmin, setIsAdmin] = useState(false)
    const [notifications, setNotifications] = useState<NotificationMessage[]>(
        [],
    )
    const [eventOptions, setEventOptions] = useState<
        { label: string; value: string }[]
    >([])
    const [staffEventOptions, setStaffEventOptions] = useState<
        { label: string; value: string }[]
    >([])

    const updateNotifications = () =>
        NotificationService.getNotification().then((response) =>
            setNotifications(response.data!.reverse()),
        )

    const updateEventOptions = () =>
        EventService.getEvent().then((response) =>
            setEventOptions(
                response.data!.events.map((event) => ({
                    label: event.name,
                    value: event.eventId,
                })),
            ),
        )

    const updateStaffEventOptions = () =>
        EventService.getEventStaff().then((response) =>
            setStaffEventOptions(
                response.data!.events.map((event) => ({
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

    useEffect(() => {
        AuthService.getAuthRoles().then((result) => {
            setIsAdmin(result.data!.roles.includes("ADMIN"))
        })
    }, [])

    const submit = (
        values: NotificationSendFormOptions,
        formik: FormikHelpers<NotificationSendFormOptions>,
    ) => {
        if (values.title && values.topic) {
            const notification: NotificationSendRequest = {
                title: values.title,
                body: values.body,
            }
            switch (values.topic) {
                case "Role": {
                    notification.role = values.role as Role
                    break
                }
                case "Event": {
                    notification.eventId = values.eventId
                    break
                }
                case "StaffShift": {
                    notification.staffShift = values.staffShift
                    break
                }
                case "FoodWave": {
                    notification.foodWave = parseInt(values.foodWave)
                    break
                }
                case "UserIds": {
                    notification.userIds = values.userIds
                        .split(",")
                        .map((s) => s.trim())
                    break
                }
            }

            setSendProcessing(true)

            NotificationService.postNotificationSend({
                body: notification,
            }).then(async () => {
                setSendProcessing(false)
                await refresh()
                formik.resetForm()
            })
        }
    }

    if (isLoading) {
        return <Loading />
    }

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
                            {(props) => (
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

                                    {props.values.topic === "Role" && (
                                        <SelectField
                                            name="role"
                                            className={styles.select}
                                            placeholder="Select Role"
                                            options={roles}
                                        />
                                    )}

                                    {props.values.topic === "Event" && (
                                        <SelectField
                                            name="eventId"
                                            className={styles.select}
                                            placeholder="Select Event"
                                            options={eventOptions}
                                        />
                                    )}

                                    {props.values.topic === "StaffShift" && (
                                        <SelectField
                                            name="staffShift"
                                            className={styles.select}
                                            placeholder="Select Staff Shift"
                                            options={staffEventOptions}
                                        />
                                    )}

                                    {props.values.topic === "FoodWave" && (
                                        <SelectField
                                            name="foodWave"
                                            className={styles.select}
                                            placeholder="Select Food Wave"
                                            options={foodWaves}
                                        />
                                    )}

                                    {props.values.topic === "UserIds" && (
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
                <div className={styles.heading}>
                    Past Notifications
                    <div className={styles.underline} />
                </div>

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
                        <div className={styles.sent}>
                            Sent: {notification.sent.length}
                            <br />
                            Failed: {notification.failed.length}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

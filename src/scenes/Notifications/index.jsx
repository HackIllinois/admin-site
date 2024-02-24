import React from "react";
import { Formik, Form, Field } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSync } from "@fortawesome/free-solid-svg-icons";

import "./style.scss";
import SelectField from "components/SelectField";
import Loading from "components/Loading";
import {
    getNotifications,
    sendNotification,
    getRoles,
    getEvents,
    getStaffEvents,
} from "util/api";

const notificationInitialValues = {
    title: "",
    body: "",
    topic: "",
    role: "",
    foodWaves: "",
    eventId: "",
    staffShift: ""
};

const topicOptions = [
    { label: "Role", value: "Role" },
    { label: "Event", value: "Event" },
    { label: "Staff Shift", value: "StaffShift" },
    { label: "Food Wave", value: "FoodWave" },
];

const roles = [
    { label: "Admin", value: "ADMIN" },
    { label: "Staff", value: "STAFF" },
    { label: "Mentor", value: "MENTOR" },
    { label: "Attendee", value: "ATTENDEE" },
    { label: "User (Everyone)", value: "USER" },
];

const foodWaves = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
];

// function formatDate(seconds) {
//   return new Date(seconds * 1000).toLocaleDateString('en-US', {
//     month: 'long',
//     day: 'numeric',
//     hour: 'numeric',
//     minute: '2-digit',
//     second: '2-digit'
//   });
// }

export default class Notifications extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            sendProcessing: false,
            notifications: [],
            events: [],
            staffEvents: [],
        };
    }

    componentDidMount() {
        this.updateEvents();
        this.updateNotifications();
    }

    updateEvents() {
        getEvents().then((events) => {
            this.setState({
                events: events.map((event) => {
                    return { label: event.name, value: event.eventId };
                }),
            });
        });

        getStaffEvents().then((staffEvents) => {
            this.setState({
                staffEvents: staffEvents
                    .filter((e) => e.eventType === "STAFFSHIFT")
                    .map((staffEvent) => {
                        return {
                            label: staffEvent.name,
                            value: staffEvent.eventId,
                        };
                    }),
            });
        });
    }

    updateNotifications() {
        this.setState({ isLoading: true });
        getNotifications()
            .then((notifications) => {
                notifications.forEach((notification) => {
                    let sentCount = 0;
                    let failedCount = 0;
                    notification.batches.forEach((batch) => {
                        sentCount += batch.sent.length
                        failedCount += batch.failed.length
                    })
                    notification.sentCount = sentCount
                    notification.failedCount = failedCount
                })

                this.setState({
                    notifications: notifications.reverse(),
                });
            })
            .finally(() => {
                this.setState({ isLoading: false });
            });
    }

    submit(notification, formik) {
        if (notification.title && notification.topic) {
            let notificationToSend = { title: notification.title, body: notification.body };
            notification.topic === "Role" && (notificationToSend.role = notification.role);
            notification.topic === "Event" && (notificationToSend.eventId = notification.eventId);
            notification.topic === "StaffShift" && (notificationToSend.staffShift = notification.staffShift);
            notification.topic === "FoodWave" && (notificationToSend.foodWave = notification.foodWave);

            this.setState({
                sendProcessing: true,
            })

            sendNotification(notificationToSend).then(() => {
                this.setState({
                    sendProcessing: false,
                })
                this.updateNotifications();
                formik.resetForm();
            });
            
        }
    }

    render() {
        const { notifications, isLoading } = this.state;

        if (isLoading) {
            return <Loading />;
        }

        const isAdmin = getRoles().includes("ADMIN"); // REVERT BACK TO ADMIN ONLY
        return (
            <div className="notifications-page">
                {isAdmin && (
                    <div className="top">
                        <div className="send-notification tile">
                            <div className="title">Send Notification</div>
                            <Formik
                                initialValues={notificationInitialValues}
                                onSubmit={(values, formik) =>
                                    this.submit(values, formik)
                                }
                            >
                                {(props) => (
                                    <Form>
                                        <Field
                                            className="form-field"
                                            name="title"
                                            placeholder="Title"
                                        />

                                        <SelectField
                                            name="topic"
                                            className="select"
                                            placeholder="Select Topic"
                                            options={topicOptions}
                                        />

                                        {props.values.topic === "Role" && (
                                            <SelectField
                                                name="role"
                                                className="select"
                                                placeholder="Select Role"
                                                options={roles}
                                            />
                                        )}

                                        {props.values.topic === "Event" && (
                                            <SelectField
                                                name="eventId"
                                                className="select"
                                                placeholder="Select Event"
                                                options={this.state.events}
                                            />
                                        )}

                                        {props.values.topic === "StaffShift" && (
                                            <SelectField
                                                name="staffShift"
                                                className="select"
                                                placeholder="Select Staff Shift"
                                                options={this.state.staffEvents}
                                            />
                                        )}

                                        {props.values.topic === "FoodWave" && (
                                            <SelectField
                                                name="foodWave"
                                                className="select"
                                                placeholder="Select Food Wave"
                                                options={foodWaves}
                                            />
                                        )}

                                        <Field
                                            className="form-field"
                                            as="textarea"
                                            name="body"
                                            placeholder="Body"
                                            rows="4"
                                        />

                                        <div className="buttons">
                                            <button disabled={this.state.sendProcessing} type="submit">
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

                <div className="heading-container">
                    <div className="heading">
                        Past Notifications
                        <div className="underline" />
                    </div>

                    <FontAwesomeIcon
                        className="refresh"
                        icon={faSync}
                        onClick={() => this.updateNotifications()}
                    />
                </div>

                <div className="notifications-container">
                    {notifications.map((notification) => (
                        <div className="notification" key={notification._id}>
                            <div className="topic">
                                Sender: {notification.sender}
                            </div>
                            <div className="title">{notification.title}</div>
                            <div className="body">{notification.body}</div>
                            <div className="time">
                                Sent: {notification.sentCount}<br />Failed: {notification.failedCount}
                            </div>
                            {/* <div className="time">{ formatDate(notification.time) }</div> */}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

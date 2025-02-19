import { Field, Form, Formik, useField } from 'formik'
import React, { useState } from 'react'
import { QRCode } from 'react-qrcode-logo'

import { updateEvent } from 'util/api'
import DateInput from 'components/DateInput'
import './style.scss'

const EventCodeForm = ({ event, onSubmit }) => {
    // const [isLoading, setIsLoading] = useState(false);
    // const [initialValues, setInitialValues] = useState(null);

    // 0 - user hasn't clicked submit yet
    // 1 - user clicked submit and request is being sent (i.e. loading)
    // 2 - request failed
    const [status, setStatus] = useState(0)

    const handleSubmit = (event) => {
        setStatus(1) // loading
        console.log('event: ', event)
        updateEvent(event)
            .then(() => onSubmit(event)) // this should close the form, so no need to change status
            .catch((err) => {
                console.log('Failed to set event code, error: ', err)
                setStatus(2) // failed
            })
    }

    // if (isLoading) {
    //     return <h4 className="event-code-form">Loading...</h4>;
    // }

    if (!event.exp) {
        return (
            <h4 className="event-code-form">Expiration date does not exist!</h4>
        )
    }

    const EventCodeField = ({ label, ...props }) => {
        const [field] = useField(props)

        return (
            <>
                <label>
                    {label}
                    <input {...field} {...props} />
                </label>
                <div className="qr-container">
                    <label>Auto-generated QR:</label>
                    <QRCode className="qr" value={field.value} />
                </div>
            </>
        )
    }

    return (
        <Formik initialValues={event} onSubmit={handleSubmit}>
            <Form className="event-code-form">
                <h2>Edit Code</h2>
                <EventCodeField
                    name="eventId"
                    className="form-field"
                    placeholder="QR..."
                />
                <Field component={DateInput} name="exp" label="Expiration:" />
                <button
                    type="submit"
                    className="submit-button"
                    disabled={status === 1}
                >
                    {['Submit', 'Loading...', 'Failed, try again?'][status]}
                </button>
            </Form>
        </Formik>
    )
}

export default EventCodeForm

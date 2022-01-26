import { Field, Form, Formik, useField } from 'formik';
import React, { useEffect, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

import { getEventCode, setEventCode } from 'util/api';
import DateInput from 'components/DateInput';
import './style.scss';

const EventCodeForm = ({ event, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null);

  // 0 - user hasn't clicked submit yet
  // 1 - user clicked submit and request is being sent (i.e. loading)
  // 2 - request failed
  const [status, setStatus] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setInitialValues(null);
    if (event) {
      getEventCode(event.id)
        .then(({ id, code, expiration }) => setInitialValues({ id, code, expiration }))
        .catch(err => console.log('Failed to get event code, error: ', err))
        .finally(() => setIsLoading(false));
    }
  }, [event]);

  const handleSubmit = (values) => {
    const { id, code, expiration } = values;
    setStatus(1); // loading
    setEventCode(id, code, expiration)
      .then(() => onSubmit(values)) // this should close the form, so no need to change status
      .catch(err => {
        console.log('Failed to set event code, error: ', err);
        setStatus(2); // failed
      });
  };

  if (isLoading) {
    return <h4 className="event-code-form">Loading...</h4>;
  }

  if (!initialValues) {
    return <h4 className="event-code-form">Error fetching code</h4>;
  }

  const EventCodeField = ({ label, ...props }) => {
    const [field] = useField(props);

    return (
      <>
        <label>
          {label}
          <input {...field} {...props} />
        </label>
        <QRCode 
          className="qr" 
          value={ JSON.stringify({ code: field.value }) } 
        />
      </>
    );
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form className="event-code-form">
        <h2>Edit Code</h2>
        <EventCodeField name="code" className="form-field" placeholder="Code..." />
        <Field component={DateInput} name="expiration" label="Expiration:"/>
        <button type="submit" className="submit-button" disabled={status === 1}>
          {['Submit', 'Loading...', 'Failed, try again?'][status]}
        </button>
      </Form>
    </Formik>
  );
};

export default EventCodeForm;

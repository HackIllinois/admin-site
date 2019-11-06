import React from 'react';
import { Formik, Form, Field } from 'formik';

import { updateEvent } from './eventsUtil';
import './EventEditPopup.scss';

export default class EventEditPopup extends React.Component {
  constructor(props) {
    super(props);
    const { startTime, endTime, name, description, sponsor, eventType } = props.event;
    this.state = {
      eventValues: { startTime, endTime, name, description, sponsor, eventType }
    }
  }

  submit(values) {
    const newEvent = Object.assign({}, this.props.event, values);
    updateEvent(newEvent).then(() => {
      this.props.onUpdateEvent();
      this.props.onDismiss();
    });
  }

  render() {
    return (
      <div className="event-edit-popup" onClick={() => this.props.onDismiss()}>
        <div className="popup-container" onClick={e => e.stopPropagation()}>
          <div className="title">Edit Event</div>
          <Formik initialValues={this.state.eventValues} onSubmit={values => this.submit(values)}>
            {() => (
              <Form className="form">
                <Field className="form-field" name="name" placeholder="Event Name"/>
                <Field className="form-field" name="startTime" placeholder="Start Time"/>
                <Field className="form-field" name="endTime" placeholder="End Time"/>
                <Field className="form-field" name="description" as="textarea" rows="5" placeholder="Description"/>
                <Field className="form-field" name="sponsor" placeholder="Sponsor"/>
                <Field className="form-field" name="eventType" placeholder="Event Type"/>
                <div className="buttons">
                  <button className="button" onClick={() => this.props.onDismiss()}>Cancel</button>
                  <button className="button" type="submit">Save</button>
                </div>
              </Form>
            )}
          </Formik>
          </div>
      </div>
    );
  }
}
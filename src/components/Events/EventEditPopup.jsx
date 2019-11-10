import React from 'react';
import { Formik, Form, Field } from 'formik';

import { updateEvent, deleteEvent } from './eventsUtil';
import LocationInput from './LocationInput';
import TimeInput from './TimeInput';
import './EventEditPopup.scss';

export default class EventEditPopup extends React.Component {
  constructor(props) {
    super(props);

    // we explicitly select which properties of the event are editable
    const {
      startTime = '',
      endTime = '',
      name = '',
      description = '',
      locations = [],
      sponsor = '',
      eventType = ''
    } = props.event;
    
    this.state = {
      eventValues: { startTime, endTime, name, description, locations, sponsor, eventType }
    }
  }

  submit(values) {
    const newEvent = Object.assign({}, this.props.event, values);
    console.log(newEvent);
    updateEvent(newEvent).then(() => {
      this.props.onUpdateEvent();
      this.props.onDismiss();
    });
  }

  delete() {
    if (this.props.event.id) {
      deleteEvent(this.props.event.id).then(() => {
        this.props.onUpdateEvent();
        this.props.onDismiss();
      });
    }
  }

  isNewEvent() {
    // if the id property of the event prop does not exist, it means we're creating a new event
    return !this.props.event.id;
  }

  render() {
    return (
      <div className="event-edit-popup" onClick={() => this.props.onDismiss()}>
        <div className="popup-container" onClick={e => e.stopPropagation()}>
          <div className="title">{this.isNewEvent() ? 'Add Event' : 'Edit Event'}</div>
          <Formik initialValues={this.state.eventValues} onSubmit={values => this.submit(values)}>
            {() => (
              <Form className="form">
                <Field className="form-field" name="name" placeholder="Event Name"/>
                <Field component={TimeInput} name="startTime" label="Start Time: "/>
                <Field component={TimeInput} name="endTime" label="End Time: "/>
                <Field className="form-field" name="description" as="textarea" rows="5" placeholder="Description"/>
                <Field component={LocationInput} name="locations"/>
                <Field className="form-field" name="sponsor" placeholder="Sponsor"/>
                <Field className="form-field" name="eventType" placeholder="Event Type"/>
                <div className="buttons">
                  { !this.isNewEvent() && 
                    <button className="button delete" onClick={() => this.delete()}>Delete</button>}
                  
                  <div className="spacer"/>
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
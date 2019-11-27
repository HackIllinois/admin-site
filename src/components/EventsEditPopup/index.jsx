import React from 'react';
import { Formik, Form, Field } from 'formik';

import { addEvent, updateEvent, deleteEvent } from 'api';
import LocationInput from './LocationInput';
import TimeInput from './TimeInput';
import DayInput from './DayInput';
import './styles.scss';

const possibleEventTypes = ['MEAL', 'SPONSOR', 'WORKSHOP', 'OTHER'];

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
      eventType = possibleEventTypes[0],
    } = props.event;
    
    this.state = {
      eventValues: { startTime, endTime, name, description, locations, sponsor, eventType }
    }
  }

  submit(values) {
    const newEvent = Object.assign({}, this.props.event, values);
    const addOrUpdateEvent = this.isNewEvent() ? addEvent : updateEvent;
    addOrUpdateEvent(newEvent).then(() => {
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
            {({ values, setFieldValue }) => (
              <Form className="form">
                <Field className="form-field" name="name" placeholder="Event Name"/>
                <DayInput values={values} setFieldValue={setFieldValue}/>
                <Field component={TimeInput} name="startTime" label="Start Time: "/>
                <Field component={TimeInput} name="endTime" label="End Time: "/>
                <Field className="form-field" name="description" as="textarea" rows="5" placeholder="Description"/>
                <Field component={LocationInput} name="locations"/>
                <Field className="form-field" name="sponsor" placeholder="Sponsor"/>
                <Field as="select" className="form-field" name="eventType">
                  {
                    possibleEventTypes.map(eventType => <option key={eventType}>{eventType}</option>)
                  }
                </Field>
                <div className="buttons">
                  { !this.isNewEvent() && 
                    <button className="button delete" onClick={() => this.delete()}>Delete</button>}
                  
                  <div className="spacer"/>
                  <button className="button" type="button" onClick={() => this.props.onDismiss()}>Cancel</button>
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
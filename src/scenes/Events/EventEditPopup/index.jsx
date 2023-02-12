import React from 'react';
import { Formik, Form, Field } from 'formik';

import { addEvent, updateEvent, deleteEvent } from 'util/api';
import LocationInput from './LocationInput';
import DateInput from 'components/DateInput';
import SelectField from 'components/SelectField';
import './style.scss';
import { FormikCheckbox } from 'components/Checkbox';

const possibleEventTypes = ['MEAL', 'MINIEVENT', 'SPEAKER', 'WORKSHOP', 'QNA', 'OTHER'];

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
      eventType = '',
      points = 0,
      isPrivate = false,
      displayOnStaffCheckin = false,
    } = props.event;

    this.state = {
      eventValues: { startTime, endTime, name, description, locations, sponsor, eventType, points, isPrivate, displayOnStaffCheckin }
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
    // TODO: maybe add a confirmation before deleting
    if (this.props.event.id) {
      deleteEvent(this.props.event.id).then(() => {
        this.props.onUpdateEvent();
        this.props.onDismiss();
      });
    }
  }

  handleKeyUp(e) {
    if (e.key === 'Escape') {
      this.props.onDismiss();
    }
  };

  isNewEvent() {
    // if the id property of the event prop does not exist, it means we're creating a new event
    return !this.props.event.id;
  }

  render() {
    return (
      <div className="event-edit-popup" onKeyUp={e => this.handleKeyUp(e)}>
        <div className="popup-background" onClick={() => this.props.onDismiss()}/>

        <div className="popup-container">
          <div className="title">{this.isNewEvent() ? 'Add Event' : 'Edit Event'}</div>
          <Formik initialValues={this.state.eventValues} onSubmit={values => this.submit(values)}>
            {() => (
              <Form className="form">
                <Field className="form-field" name="name" placeholder="Event Name" autoFocus/>
                <Field component={DateInput} name="startTime" label="Start:"/>
                <Field component={DateInput} name="endTime" label="End:"/>
                <Field className="form-field" name="description" as="textarea" rows="5" placeholder="Description"/>
                <Field component={LocationInput} name="locations"/>
                <Field className="form-field" name="sponsor" placeholder="Sponsor"/>
                <SelectField
                  className="select"
                  name="eventType"
                  menuPlacement="top"
                  options={possibleEventTypes.map(eventType => ({ label: eventType, value: eventType }))}
                  placeholder="Type"
                />

                {/* TODO: Add label indicating that the following field is for Points (placeholder never shows up because default value is 0) */}
                <Field className="form-field" name="points" placeholder="Points" type="number" />

                <Field component={FormikCheckbox} className="form-field" name="isPrivate" />
                <Field component={FormikCheckbox} className="form-field" name="displayOnStaffCheckin" />

                <div className="buttons">
                  { !this.isNewEvent() &&
                    <button className="button delete" type="button" onClick={() => this.delete()}>Delete</button>
                  }

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

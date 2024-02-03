import React from 'react';
import { Formik, Form, Field } from 'formik';

import { addEvent, updateEvent, deleteEvent } from 'util/api';
import LocationInput from './LocationInput';
import DateInput from 'components/DateInput';
import SelectField from 'components/SelectField';
import './style.scss';
import { FormikCheckbox } from 'components/Checkbox';

const publicEventTypes = ['MEAL', 'MINIEVENT', 'SPEAKER', 'WORKSHOP', 'QNA', 'OTHER'];
const staffEventTypes = ['MEETING', 'STAFFSHIFT', 'OTHER'];

export default class EventEditPopup extends React.Component {
  constructor(props) {
    super(props);

    // we explicitly select which properties of the event are editable
    const {
      startTime = '',
      endTime = '',
      name = '',
      description = '',
      staffEventType = '',
      publicEventType = '',
      eventType = '',
      locations = [],
      sponsor = '',
      points = 0,
      isPrivate = false,
      displayOnStaffCheckIn = false,
      isAsync = false,
      isStaff = props.staffEvent,
      mapImageUrl = ''
    } = props.event;
    
    this.state = {
      eventValues: { startTime, endTime, name, description, staffEventType, publicEventType, eventType, locations, sponsor, points, isPrivate, displayOnStaffCheckIn, isAsync, isStaff, mapImageUrl }
    }
  }

  submit(values) {
    const newEvent = Object.assign({}, this.props.event, values);
    newEvent.publicEventType = newEvent.eventType;
    newEvent.staffEventType = newEvent.eventType;
    const addOrUpdateEvent = this.isNewEvent() ? addEvent : updateEvent;
    addOrUpdateEvent(newEvent).then(() => {
      this.props.onUpdateEvent();
      this.props.onDismiss();
    });
  }

  delete() {
    // TODO: maybe add a confirmation before deleting
    if (this.props.event.eventId) {
      deleteEvent(this.props.event.eventId).then(() => {
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
    return !this.props.event.eventId;
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
                <Field disabled="true" component={LocationInput} name="locations"/>
                
                {!this.props.staffEvent && (
                <Field className="form-field" name="sponsor" placeholder="Sponsor"/>
                )}

                {this.props.staffEvent && (
                  <SelectField
                    className="select"
                    name="eventType"
                    menuPlacement="top"
                    options={staffEventTypes.map(staffEventType => ({ label: staffEventType, value: staffEventType }))}
                    placeholder="Type"
                  />
                )}

                {/* TODO: Add label indicating that the following field is for Points (placeholder never shows up because default value is 0) */}
                {!this.props.staffEvent && (<>
                  <SelectField
                    className="select"
                    name="eventType"
                    menuPlacement="top"
                    options={publicEventTypes.map(publicEventType => ({ label: publicEventType, value: publicEventType }))}
                    placeholder="Type"
                  />

                <Field className="form-field" name="points" placeholder="Points" type="number" />
                <Field className="form-field" name="mapImageUrl" placeholder="Map Image URL" />
                <Field className="form-margins" component={FormikCheckbox} name="isPrivate" label="Private Event" />
                <Field className="form-margins" component={FormikCheckbox} name="displayOnStaffCheckIn" label="Display on Staff Check-in" />
                </>)}

                <Field className="form-margins" component={FormikCheckbox} name="isAsync" label="Async Event" />

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
import React from 'react';
import { Formik, Form, Field } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './styles.scss';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import {
  getNotificationTopics,
  getNotifications,
  sendNotification,
  addNotificationTopic,
  removeNotificationTopic,
} from 'api';

const notificationInitialValues = {
  title: '',
  body: '',
  topic: '',
}

function formatDate(seconds) {
  return new Date(seconds * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
}

export default class Notifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notificationTopics: [],
      notifications: [],
      addTopicValue: '',
      removeTopicValue: '',
    }
  }

  componentDidMount() {
    this.updateNotifications();
  }

  updateNotifications() {
    getNotificationTopics().then(topics => {
      this.setState({ notificationTopics: topics });
      getNotifications(topics).then(notifications => {
        this.setState({
          notifications: notifications.sort((a, b) => b.time - a.time)
        })
      });
    });
  }

  submit({ title, body, topic }, formik) {
    if (title && topic) {
      sendNotification({ title, body }, topic).then(() => {
        this.updateNotifications();
        formik.resetForm();
      });
    }
  }

  addTopic({ topic }, formik) {
    if (topic) {
      addNotificationTopic(topic).then(() => {
        this.updateNotifications();
        formik.resetForm();
      })
    }
  }

  removeTopic({ topic }, formik) {
    console.log(topic);
    if (topic) {
      removeNotificationTopic(topic).then(() => {
        this.updateNotifications();
        formik.resetForm();
      })
    }
  }

  render() {
    return (
      <div className="notifications-page">
        <div className="top">
          <div className="send-notification tile">
            <div className="title">Send Notification</div>
            <Formik initialValues={notificationInitialValues} onSubmit={(values, formik) => this.submit(values, formik)}>
              {() => (
                <Form>
                  <Field className="form-field" name="title" placeholder="Title"/>
                  <Field as="select" name="topic" className="form-field">
                    <option value="">Select Topic</option>
                    {
                      this.state.notificationTopics.map(topic => (
                        <option key={topic}>{topic}</option>
                      ))
                    }
                  </Field>
                  <Field className="form-field" as="textarea" name="body" placeholder="Body" rows="4"/>

                  <div className="buttons">
                    <button type="submit">
                      <FontAwesomeIcon icon={faPaperPlane}/> &nbsp;Send
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <div>
            <div className="add-topic tile">
              <Formik
                initialValues={{ topic: '' }}
                onSubmit={(values, formik) => this.addTopic(values, formik)}>
                {() => (
                  <Form>
                    <div className="title">Add Topic</div>

                    <Field className="form-field" name="topic" placeholder="Topic"/>

                    <div className="buttons">
                      <button type="submit">Add</button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>

            <div className="remove-topic tile">
              <Formik
                initialValues={{ topic: '' }}
                onSubmit={(values, formik) => this.removeTopic(values, formik)}>
                {() => (
                  <Form>
                    <div className="title">Remove Topic</div>

                    <Field as="select" className="form-field" name="topic">
                      <option value="">Select Topic</option>
                      {
                        this.state.notificationTopics.map(topic => (
                          <option key={topic}>{topic}</option>
                        ))
                      }
                    </Field>

                    <div className="buttons">
                      <button type="submit">Remove</button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
          
        </div>

        <div className="heading">
          Past Notifications
          <div className="underline"/>
        </div>

        <div className="notifications-container">
          {
            this.state.notifications.map(notification => (
              <div className="notification" key={notification.id}>
                <div className="topic">{ notification.topic }</div>
                <div className="title">{ notification.title }</div>
                <div className="body">{ notification.body }</div>
                <div className="time">{ formatDate(notification.time) }</div>
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}
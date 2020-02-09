import React from 'react';
import { Formik, Form, Field } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faSync } from '@fortawesome/free-solid-svg-icons';

import './style.scss';
import SelectField from 'components/SelectField';
import Loading from 'components/Loading';
import {
  getNotificationTopics,
  getNotifications,
  sendNotification,
  getRoles,
} from 'util/api';

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
      isLoading: true,
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
          notifications: notifications.sort((a, b) => b.time - a.time),
        });
      }).finally(() => {
        this.setState({ isLoading: false });
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

  render() {
    const { notifications, notificationTopics, isLoading } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    const topicOptions = notificationTopics.map(topic => ({ label: topic, value: topic }));
    const isAdmin = getRoles().includes('Admin');
    return (
      <div className="notifications-page">
        {isAdmin &&
          <div className="top">
            <div className="send-notification tile">
              <div className="title">Send Notification</div>
              <Formik initialValues={notificationInitialValues} onSubmit={(values, formik) => this.submit(values, formik)}>
                {() => (
                  <Form>
                    <Field className="form-field" name="title" placeholder="Title"/>
                    
                    <SelectField
                      name="topic"
                      className="select"
                      placeholder="Select Topic"
                      options={topicOptions}/>

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
          </div>
        }

        <div className="heading-container">
          <div className="heading">
            Past Notifications
            <div className="underline"/>
          </div>
          
          <FontAwesomeIcon className="refresh" icon={faSync} onClick={() => this.updateNotifications()} />
        </div>
        

        <div className="notifications-container">
          {
            notifications.map(notification => (
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
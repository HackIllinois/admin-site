import React from 'react';
import { connect } from 'react-redux';
import {Document, Page} from 'react-pdf'

import './styles.css';

import pdfFile from './examplePDF.pdf';
import { getRegistration } from '../../services/registration/actions';

let profile = {
  name: "John Smith",
  github: "github0000001",
  status: "Accepted",
  wave: 1,
  email: "john.smith@example.com",
  school: "University of Illinois at Urbana-Champaign",
  major: "Computer Science",
  year: "Freshman"
};

class Profile extends React.Component {
  componentDidMount() {
    const username = this.props.match.params.handle;
    const { getRegistration, jwt } = this.props;
    if (jwt) {
      getRegistration(username, jwt);
    }
  }

  render() {
    if (this.props.fetching === false){
      if (this.props.user === null || this.props.user.attendee === null){
        return (
          <div className="profile-main">
            <div className="profile-info">
              No such attendee found
            </div>
          </div>
        )
      }
      const attendee = this.props.user.attendee;

      return (
        <div className="profile-main">
          <div className="profile-info">
            <div>
              <h1 className="student_name">{attendee.firstName + " " + attendee.lastName}</h1>
              <h4 className="github">Github: <a target="_blank" href={"github.com/" + attendee.github}>{attendee.github}</a>
              </h4>
            </div>

            <br></br>

            <div>
              <h3 className="category">
                Admission Status
              </h3>
              <p className={"admission-" + profile.status}>
                Wave {profile.wave} - {profile.status}
              </p>
            </div>

            <br></br>

            <div>
              <h3 className="category">
                Email
              </h3>
              {attendee.email}
            </div>

            <div>
              <h3 className="category">
                School
              </h3>
              {attendee.school}
            </div>

            <div>
              <h3 className="category">
                Major
              </h3>
              {attendee.major}
            </div>

            <div>
              <h3 className="category">
                Graduation Year
              </h3>
              {attendee.graduationYear}
            </div>

          </div>

          <div>
            <Document file={pdfFile}>
              <Page pageNumber={1}/>
            </Document>
          </div>
        </div>
      )
    } else {
      return (
        <div className="profile-main">
          <div className="profile-info">
            Loading
          </div>
        </div>
      )
    }
  }
}

const mapStateToProps = (state) => ({
  jwt: state.auth.jwt,
  user: state.registration.user,
  fetching: state.registration.fetching,
  error: state.registration.error
});

const mapDispatchToProps = (dispatch) => ({
  getRegistration: (id, token) => dispatch(getRegistration(id, token)),
});

export default (connect(mapStateToProps, mapDispatchToProps)(Profile));

import React from 'react';
import { connect } from 'react-redux';
import {Document, Page} from 'react-pdf'

import './styles.css';

import { getRegistration, getPDF } from '../../services/registration/actions';

class Profile extends React.Component {
  componentDidMount() {
    const username = this.props.match.params.handle;
    const { getRegistration, getPDF, jwt } = this.props;
    if (jwt) {
      getRegistration(username, jwt);
      getPDF(username, jwt);
    }
  }

  render() {
    function getPDFDEV(pdfObject){
      if (process.env.NODE_ENV !== 'production'){
        return <Document file={"https://hackillinois.org/assets/sponsorship-2019.pdf"}>
          <Page pageNumber={1}/>
        </Document>;
      }   else if (pdfObject !== undefined && pdfObject !== null && pdfObject.resume !== undefined && pdfObject.resume !== null){
        return <Document file={pdfObject.resume}>
          <Page pageNumber={1}/>
        </Document>;
      } else {
        return "Loading PDF";
      }
    }

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
              <h1 className="student_name">{attendee.firstname + " " + attendee.lastname}</h1>
              <h4 className="github">Github: <a target="_blank" href={"github.com/" + attendee.github}>{attendee.github}</a></h4>
              <h4 className="github">Linkedin: <a target="_blank" href={"github.com/" + attendee.github}>{attendee.linkedin}</a></h4>
            </div>

            <br></br>

            <div>
              <h3 className="category">
                Admission Status
              </h3>
              <p className={"admission-Unimplemented"}>
                Wave 0 - Unimplemented
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
                Phone
              </h3>
              {attendee.phonenumber}
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
              {attendee.graduationyear}
            </div>

          </div>

          <div>
            { getPDFDEV(this.props.pdf) }
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
  pdf: state.registration.PDF,
  fetching: state.registration.fetching,
  error: state.registration.error
});

const mapDispatchToProps = (dispatch) => ({
  getRegistration: (id, token) => dispatch(getRegistration(id, token)),
  getPDF: (id, token) => dispatch(getPDF(id, token)),
});

export default (connect(mapStateToProps, mapDispatchToProps)(Profile));

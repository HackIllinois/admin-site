import React from 'react';
import {Document, Page} from 'react-pdf'

import './styles.css';

import pdfFile from './examplePDF.pdf';

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

const Profile = () => (
  <div className="profile-main">
    <div className="profile-info">
      <div>
        <h1 className="student_name">{profile.name}</h1>
        <h4 className="github">Github: <a target="_blank" href={"github.com/" + profile.github}>{profile.github}</a></h4>
      </div>

      <br></br>

      <div>
        <h4>
          Admission Status
        </h4>
        <p className={"admission-" + profile.status}>
          Wave {profile.wave} - {profile.status}
        </p>
      </div>

      <br></br>

      <div>
        <h4>
          Email
        </h4>
        {profile.email}
      </div>

      <div>
        <h4>
          School
        </h4>
        {profile.school}
      </div>

      <div>
        <h4>
          Major
        </h4>
        {profile.major}
      </div>

      <div>
        <h4>
          Graduation Year
        </h4>
        {profile.year}
      </div>

    </div>

    <div>
      <Document file={pdfFile}>
        <Page pageNumber={1} />
      </Document>
    </div>
  </div>
);

export default Profile;

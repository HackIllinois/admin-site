import React from 'react';
import {Document, Page} from 'react-pdf'

import './styles.css';

import pdfFile from './examplePDF.pdf';

const Profile = () => (
  <div className="profile-main">
    <div>
      <h1 className="student_name">John Smith</h1>
      <h4 className="github">Github: github0000001</h4>
    </div>

    <br></br>

    <div>
      <h4>
        Admission Status
      </h4>
      <p className="admission-accepted">
        Wave 1 - Accepted
      </p>
    </div>

    <br></br>

    <div>
      <h4>
        Email
      </h4>
      <p>
        john.smith@example.com
      </p>
    </div>

    <div>
      <h4>
        School
      </h4>
      <p>
        University of Illinois at Urbana-Champaign
      </p>
    </div>

    <div>
      <h4>
        Major
      </h4>
      <p>
        Computer Science
      </p>
    </div>

    <div>
      <h4>
        Graduation Year
      </h4>
      <p>
        Freshman
      </p>
    </div>

    <div>
      <Document file={pdfFile}>
        <Page pageNumber={1} />
      </Document>
    </div>
  </div>
);

export default Profile;

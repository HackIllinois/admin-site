import React from 'react';
import { Formik, Form, Field } from 'formik';

import './style.scss';
import {
  getRoles,
  updatePoints
} from 'util/api';

const Points = (props) => {
  const isAdmin = getRoles().includes('Admin');
  console.log(getRoles());

  const submit = (values) => {
      updatePoints(values)
        .then(newPoints => console.log(newPoints));
  }

  return (
    <div className="points-page">
    {isAdmin &&
        <div className="top">
        <div className="send-notification tile">
            <div className="title">Add Points</div>
            <Formik 
                initialValues={{
                    id: null,
                    points: 0
                }} 
                onSubmit={submit}
            >
                <Form>
                    <Field className="form-field" name="id" placeholder="Github Id" type="text"/>
                    <Field className="form-field" name="points" placeholder="Points To Add" type="number" />

                    <div className="buttons">
                        <button type="submit">
                        Submit
                        </button>
                    </div>
                </Form>
            </Formik>
        </div>
        </div>
    }
    </div>
  )
};

export default Points;

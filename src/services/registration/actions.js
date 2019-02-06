import { fetchRegistration, fetchRegistrationList } from 'services/api/registration';
import { fetchPDF } from 'services/api/pdf';

export const GET_PDF_REQUEST = 'GET_PDF_REQUEST';
export const GET_PDF_SUCCESS = 'GET_PDF_SUCCESS';
export const GET_PDF_FAILURE = 'GET_PDF_FAILURE';
export const GET_REGISTRATION_REQUEST = 'GET_REGISTRATION_REQUEST';
export const GET_REGISTRATION_SUCCESS = 'GET_REGISTRATION_SUCCESS';
export const GET_REGISTRATION_FAILURE = 'GET_REGISTRATION_FAILURE';
export const GET_REGISTRATION_LIST_REQUEST = 'GET_REGISTRATION_LIST_REQUEST';
export const GET_REGISTRATION_LIST_SUCCESS = 'GET REGISTRATION_LIST_SUCCESS';
export const GET_REGISTRATION_LIST_FAILURE = 'GET_REGISTRATION_LIST_FAILURE';

export function requestPDF(id) {
  return {
    type: GET_PDF_REQUEST,
    id,
  }
}

export function receivePDF(err, PDFLink) {
  if (err)
    return { type: GET_PDF_FAILURE };
  return {
    type: GET_PDF_SUCCESS,
    PDF: PDFLink,
  };
}

export function getPDF(id, token) {
  return (dispatch) => {
    dispatch(requestPDF(id));
    fetchPDF(id, token)
      .then(data => dispatch(receivePDF(false, data)))
      .catch(err => dispatch(receivePDF(true, null)));
  };
}

export function requestRegistration(id) {
  return {
    type: GET_REGISTRATION_REQUEST,
    id,
  }
}

export function receiveRegistration(err, registration) {
  if (err)
    return { type: GET_REGISTRATION_FAILURE };
  return {
    type: GET_REGISTRATION_SUCCESS,
    user: registration,
  };
}

export function getRegistration(id, token) {
  return (dispatch) => {
    dispatch(requestRegistration(id));
    fetchRegistration(id, token)
      .then(data => dispatch(receiveRegistration(false, data)))
      .catch(err => dispatch(receiveRegistration(true, null)));
  };
}

export function requestRegistrationList(query) {
  return {
    type: GET_REGISTRATION_LIST_REQUEST,
    query,
  }
}

export function receiveRegistrationList(err, data) {
  if (err) {
    return { type: GET_REGISTRATION_LIST_FAILURE };
  }

  let usersList = [];
  if (data.registrations) {
    usersList = data.registrations;
  }

  return {
    type: GET_REGISTRATION_LIST_SUCCESS,
    usersList: usersList,
  };

}

export function getRegistrationList(query, token) {
  return (dispatch) => {
    dispatch(requestRegistrationList(query));
    fetchRegistrationList(query, token)
      .then(data => dispatch(receiveRegistrationList(false, data)))
      .catch(err => dispatch(receiveRegistrationList(true, null)));
  };
}

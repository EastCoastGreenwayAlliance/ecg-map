// Redux Action Creators to handle email signups with the Mailchimp API
// Used with Redux Thunk, see: http://redux.js.org/docs/advanced/AsyncActions.html
// See also the server.js in the root of this repo for how API POST requests are made
import fetch from 'isomorphic-fetch';
import {
  MAILCHIMP_POST_REQUEST,
  MAILCHIMP_POST_SUCESS,
  MAILCHIMP_POST_ERROR,
} from '../common/actionTypes';

const mailchimpPostRequest = () => ({
  type: MAILCHIMP_POST_REQUEST,
});

const mailchimpPostSuccess = text => ({
  type: MAILCHIMP_POST_SUCESS,
  text,
});

const mailchimpPostError = error => ({
  type: MAILCHIMP_POST_ERROR,
  error,
});

const postMailchimpAPI = (data) => {
  const url = '/signup';

  return (dispatch) => {
    dispatch(mailchimpPostRequest());
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        email_address: data,
      }),
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      mode: 'cors'
    })
      .then(res => res.text())
      .then(text => dispatch(mailchimpPostSuccess(text)))
      .catch(error => dispatch(mailchimpPostError(error)));
  };
};

export default postMailchimpAPI;

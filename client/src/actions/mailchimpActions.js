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
  const url = process.env.NODE_ENV === 'production' ? '/signup' : 'http://:5001/signup';

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

// Redux reducer to store app state relating to a POST request to the Mailchimp API
import {
  MAILCHIMP_POST_REQUEST,
  MAILCHIMP_POST_SUCESS,
  MAILCHIMP_POST_ERROR,
} from '../common/actionTypes';

const defaultState = {
  postingMailchimpAPI: false,
  text: '',
  error: null,
};

/*
 * Mailchimp Reducer
 * @param {object} state: default reducer state
 * @param {object} action: redux action creator
*/
export default (state = defaultState, action) => {
  switch (action.type) {
    case MAILCHIMP_POST_REQUEST:
      return {
        ...state,
        postingMailchimpAPI: true,
      };

    case MAILCHIMP_POST_SUCESS:
      return {
        ...state,
        postingMailchimpAPI: false,
        text: action.text,
      };

    case MAILCHIMP_POST_ERROR:
      return {
        ...state,
        postingMailchimpAPI: false,
        error: action.error,
      };

    default:
      return state;
  }
};

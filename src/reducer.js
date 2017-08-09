import { handleActions } from 'redux-actions';
import {
  PORT_OPERATING,
  PORT_LIST,
} from './actions';


export default handleActions({
  [PORT_OPERATING]: (state, action) => {
    return {
      ...state,
      operating: action.payload.operating,
      operatingMessage: action.payload.msg || '',
    };
  },
  [PORT_LIST]: (state, action) => {
    return {
      ...state,
      portList: action.payload.portList || [],
    };
  },
}, {
  operating: false,
  operatingMessage: '',
  generateDisabled: false,
  portList: [],
});

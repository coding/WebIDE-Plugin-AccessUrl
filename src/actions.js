/* @flow weak */
import { createAction } from 'redux-actions';
import * as api from './api';
import { global } from './manager';

const { notify, NOTIFY_TYPE } = global.sdk.Notify;

export const PORT_OPERATING = 'PORT_OPERATING';
export const portOperating = createAction(PORT_OPERATING);
export function setOperating({ operating, msg }) {
  return dispatch => dispatch(portOperating({ operating, msg }));
}

export const PORT_LIST = 'PORT_LIST';
export const updatePortList = createAction(PORT_LIST);
export function listPorts() {
  return (dispatch) => {
    api.listPorts()
      .then((res) => {
        dispatch(updatePortList({ portList: res }));
      })
  }
}

export function createPort({ port }) {
  return (dispatch) => {
    dispatch(portOperating({ operating: true }));
    api.createPort({ port })
      .then((res) => {
        if (res.error) {
          notify({
            notifyType: NOTIFY_TYPE.ERROR,
            message: `Create failed: ${res.msg}`,
          });
        } else {
          notify({ message: 'Create success!' });
        }
        dispatch(listPorts());
        dispatch(portOperating({ operating: false }));
      })
  }
}

export function deletePort({ port }) {
  return (dispatch) => {
    dispatch(portOperating({ operating: true }));
    api.deletePort({ port })
      .then((res) => {
        if (res.error) {
          notify({
            notifyType: NOTIFY_TYPE.ERROR,
            message: `Delete failed: ${res.msg}`,
          });
        } else {
          notify({ message: 'Delete success!' });
        }
        dispatch(listPorts());
        dispatch(portOperating({ operating: false }));
      })
  }
}


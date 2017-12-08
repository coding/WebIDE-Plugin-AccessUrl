/* @flow weak */
import { createAction } from 'redux-actions';
import * as api from './api';
import { global } from './manager';

const i18n = global.i18n;
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
    return api.listPorts()
      .then((res) => {
        dispatch(updatePortList({ portList: res }));
        return res;
      });
  };
}

export function createPort({ port }) {
  return (dispatch) => {
    dispatch(portOperating({ operating: true }));
    return api.createPort({ port })
      .then((res) => {
        if (res.error) {
          notify({
            notifyType: NOTIFY_TYPE.ERROR,
            message: i18n`global.message.createFailed${{ msg: res.msg }}`,
          });
        } else {
          notify({ message: i18n`global.message.createSuccess` });
        }
        dispatch(portOperating({ operating: false }));
        return dispatch(listPorts());
      });
  };
}

export function deletePort({ port }) {
  return (dispatch) => {
    dispatch(portOperating({ operating: true }));
    api.deletePort({ port })
      .then((res) => {
        if (res.error) {
          notify({
            notifyType: NOTIFY_TYPE.ERROR,
            message: i18n`global.message.deleteFailed${{ msg: res.msg }}`,
          });
        } else {
          notify({ message: i18n`global.message.deleteSuccess` });
        }
        dispatch(listPorts());
        dispatch(portOperating({ operating: false }));
      });
  };
}

export function savePort({ port }) {
  return (dispatch) => {
    dispatch(portOperating({ operating: true }));
    return api.savePort({ port })
      .then((res) => {
        if (res.error) {
          notify({
            notifyType: NOTIFY_TYPE.ERROR,
            message: i18n`global.message.saveFailed${{ msg: res.msg }}`,
          });
        } else {
          notify({ message: i18n`global.message.saveSuccess` });
        }
        
        dispatch(portOperating({ operating: false }));
        return dispatch(listPorts());
      })
      .catch((res) => {
        notify({
          notifyType: NOTIFY_TYPE.ERROR,
          message: i18n`global.message.saveFailed${{ msg: res.msg }}`,
        });
      });
  };
}


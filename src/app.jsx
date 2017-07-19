import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import { default as AccessUrl } from './AccessUrl';
import { global } from './manager';

import reducer from './reducer';


AccessUrl.propTypes = {
  name: PropTypes.string,
  style: PropTypes.object,
};
export const store = global.getStoreByReducer(reducer)

const app = props => (
  <Provider store={store}>
    <AccessUrl {...props} />
  </Provider>
);

export default React.createElement(app)

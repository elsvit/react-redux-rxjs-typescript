/**
 * @fileOverview
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import './styles/index.scss';

import {rehydrateState} from '@io-app/redux/localStorageSync';
import configureStore from '@io-app/redux/store';
import App from './App';

const {store, history} = configureStore(rehydrateState());

ReactDOM.render(
  (
    <Provider store={store}>
      <App history={history}/>
    </Provider>
  ),
  document.getElementById('root') as HTMLElement,
);

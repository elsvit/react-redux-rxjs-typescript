import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import mock from '@io-shared/mock';
import App from './App';

jest.mock('@io-shared/shared.scss', () => mock);

import * as responsive from '@io-app/types/ScreenResponsiveType';
const getBreakpointsMock = jest.spyOn(responsive, 'getBreakpoints');
getBreakpointsMock.mockReturnValue({
  phone: 100,
  desktop: 200,
  tablet: 300,
  widescreen: 400,
});

import configureStore from '@io-app/redux/store';

const {store, history} = configureStore();

describe('App tests', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <App history={history}/>
      </Provider>, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});

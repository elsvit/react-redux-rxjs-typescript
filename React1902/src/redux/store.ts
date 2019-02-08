/**
 * @fileOverview
 */

import {connectRouter, routerMiddleware} from 'connected-react-router';
import {History} from 'history';
import createBrowserHistory from 'history/createBrowserHistory';
import get from 'lodash-es/get';
import {Store, applyMiddleware, combineReducers, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import {createEpicMiddleware} from 'redux-observable';
import {responsiveStoreEnhancer} from 'redux-responsive';

import {initServices} from '@io-app/api';
import {AppState} from './IAppState';
import appMiscReducer from './app/reducer';
import assetsReducer from './assets/reducer';
import {SetFingerprintAction} from './auth/actions';
import authReducer from './auth/reducer';
import dashboardReducer from './dashboard/reducer';
import groupsReducer from './groups/reducer';
import {syncStorageMiddleware} from './localStorageSync';
import logsReducer from './logs/reducer';
import menuReducer from './menu/reducer';
import modalReducer from './modal/reducer';
import organizationsReducer from './organizations/reducer';
import reportsReducer from './reports/reducer';
import responsiveReducer from './responsive/reducer';
import rootEpic from './root-epic';
import toastsReducer from './toasts/reducer';
import usersReducer from './users/reducer';

const envPublicUrl = process.env.PUBLIC_URL || '';
const basename = envPublicUrl.endsWith('/') ? envPublicUrl : `${envPublicUrl}/`;
const history = createBrowserHistory({basename});

const reducer = combineReducers({
  auth: authReducer,
  appMisc: appMiscReducer,
  assets: assetsReducer,
  browser: responsiveReducer,
  dashboard: dashboardReducer,
  groups: groupsReducer,
  logs: logsReducer,
  menu: menuReducer,
  modal: modalReducer,
  organizations: organizationsReducer,
  reports: reportsReducer,
  toasts: toastsReducer,
  users: usersReducer,
});

const services = initServices();

const epicMiddleware = createEpicMiddleware({
  dependencies: {...services},
});

const historyMiddleware = routerMiddleware(history);

export default function configureStore(initialState: Partial<AppState> = {}): {store: Store<AppState>, history: History} {
  const store = createStore(
    connectRouter(history)(reducer),
    initialState,
    composeWithDevTools(
      responsiveStoreEnhancer,
      applyMiddleware(historyMiddleware, epicMiddleware, syncStorageMiddleware)),
  );

  epicMiddleware.run(rootEpic);

  services.httpAuthService.auth = get(initialState, ['auth', 'fingerprint'], '');
  services.httpAuthService.dispatchRefreshAuth = (token: string) => store.dispatch(SetFingerprintAction(token));

  return {store, history};
}

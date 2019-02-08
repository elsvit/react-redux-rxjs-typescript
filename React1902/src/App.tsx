/**
 * @fileOverview Root app component
 */

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import classNames from 'classnames';
import {ConnectedRouter} from 'connected-react-router';
import {History} from 'history';
import React, {Component} from 'react';
import 'react-dates/initialize';
import {connect} from 'react-redux';
import {Redirect, Route, Switch} from 'react-router-dom';
import {createStructuredSelector} from 'reselect';

import ModalPortal from '@io-app/components/common/Modal/ModalPortal';
import {AppState} from '@io-app/redux/IAppState';
import {LogoutAction} from '@io-app/redux/auth/actions';
import {getScreenResponsiveClass} from '@io-app/redux/responsive/reducer';
import {baseTheme} from '@io-ui/Themes/baseTheme';
import AuthRoute from './components/common/ProtectedRoute/AuthRoute';
import LandingRoute from './components/common/ProtectedRoute/LandingRoute';
import SessionExpiredModal from './components/common/SessionExpiredModal';
import ToastsComponent from './components/common/Toasts';
import DashboardPage from './components/scenes/Dashboard/DashboardPage';
import DevicesPage from './components/scenes/Devices/DevicesPage';
import GroupsPage from './components/scenes/Groups/GroupsPage';
import LoginPage from './components/scenes/Login/LoginPage';
import LogsPage from './components/scenes/Logs/LogsPage';
import OrganizationsPage from './components/scenes/Organizations/OrganizationsPage';
import ReportsPage from './components/scenes/Reports/ReportsPage';
import UsersPage from './components/scenes/Users/UsersPage';

interface IStateMap {
  screenResponsiveClass: string
}

interface IOwnProps {
  history: History
}

type AppProps = IStateMap & IOwnProps;

class App extends Component<AppProps & {logout: typeof LogoutAction}> {

  public render() {
    return (
      <ConnectedRouter history={this.props.history}>
        <MuiThemeProvider theme={baseTheme}>
          <div className={classNames('app fill-height-or-more', this.props.screenResponsiveClass)}>
            <Switch>
              <LandingRoute path={'/login'} component={LoginPage}/>
              <AuthRoute path={`/dashboard`} redirectTo={`/login`} component={DashboardPage}/>
              <AuthRoute path={`/groups`} redirectTo={`/login`} component={GroupsPage}/>
              <AuthRoute path={`/devices`} redirectTo={`/login`} component={DevicesPage}/>
              <AuthRoute path={`/logs`} redirectTo={`/login`} component={LogsPage}/>
              <AuthRoute path={`/reports`} redirectTo={`/login`} component={ReportsPage}/>
              <AuthRoute path={`/users`} redirectTo={`/login`} component={UsersPage}/>
              <AuthRoute path={`/organizations`} redirectTo={`/login`} component={OrganizationsPage}/>
              <Route
                exact={true}
                path={`/logout`}
                render={() => {
                  this.props.logout();
                  return null;
                }}
              />
              <AuthRoute path={'/'} render={() => <Redirect to={'/dashboard'}/>}/>
            </Switch>
            <ToastsComponent/>
            <ModalPortal/>
            <SessionExpiredModal/>
          </div>
        </MuiThemeProvider>
      </ConnectedRouter>
    );
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  screenResponsiveClass: getScreenResponsiveClass,
});

const mapDispatchToProps = {
  logout: LogoutAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);

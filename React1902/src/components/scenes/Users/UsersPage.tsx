/**
 * @fileOverview
 */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, Route, RouteComponentProps, Switch} from 'react-router';
import {withRouter} from 'react-router-dom';
import {AnyAction, Dispatch, compose} from 'redux';

import AppPage from '@io-app/components/common/AppPage';
import AuthRoute from '@io-app/components/common/ProtectedRoute/AuthRoute';
import {PollingProps, withPolling} from '@io-app/components/common/hoc';
import {LoadOrganizationsAction} from '@io-app/redux/organizations/actions';
import {LoadUsersAction} from '@io-app/redux/users/actions';
import UserAdd from './UserChange/UserAdd';
import UserEdit from './UserChange/UserEdit';
import UsersList from './UsersList/UsersList';

type UsersPageProps = PollingProps & RouteComponentProps<void>;

class UsersPage extends Component<UsersPageProps> {
  public render() {
    return (
      <AppPage>
        <div className="users-page page">
          <Switch>
            <AuthRoute exact={true} path={`${this.props.match.url}/edit/:userId`} component={UserEdit} />
            <AuthRoute exact={true} path={`${this.props.match.url}/add`} component={UserAdd} />
            <AuthRoute path={`${this.props.match.url}`} component={UsersList} />
            <Route render={() => <Redirect to={'/users'}/>} />
          </Switch>
        </div>
      </AppPage>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
  poll: () => {
    dispatch(LoadUsersAction());
    dispatch(LoadOrganizationsAction({force: true}));
  },
});

export default compose(
  connect(null, mapDispatchToProps),
  withRouter,
  withPolling,
)(UsersPage);

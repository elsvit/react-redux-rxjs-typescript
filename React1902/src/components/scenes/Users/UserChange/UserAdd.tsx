/**
 * @fileOverview
 */

import MuiButton from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import {RouterAction, push} from 'connected-react-router';
import {Formik} from 'formik';
import React, {Component, RefObject, createRef} from 'react';
import {connect} from 'react-redux';
import {createSelector, createStructuredSelector} from 'reselect';

import PageHeader from '@io-app/components/common/AppPage/PageHeader';
import {AppState} from '@io-app/redux/IAppState';
import {LoadableKeys as LoadableKeysOrganizations} from '@io-app/redux/organizations/IOrganizationsState';
import {
  getOrganizationsOptions,
  isInitialized as isInitializedOrganizations,
} from '@io-app/redux/organizations/reducer';
import {LoadableKeys, LoadableKeys as LoadableKeysUsers} from '@io-app/redux/users/IUsersState';
import {AddUserAction} from '@io-app/redux/users/actions';
import {isInitialized as isInitializedUsers, isLoading} from '@io-app/redux/users/reducer';
import {IOption} from '@io-app/types/IOption';
import {DEFAULT_USER, IUser} from '@io-app/types/IUser';
import {stopEvent} from '@io-app/utils/browser';
import {selectUnaryEvery} from '@io-app/utils/common';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import {FormActionsButtonsTheme} from '@io-ui/Themes/formActionsButtonsTheme';
import UserForm from './UserForm';

interface IDispatchMap {
  createUser: (user: IUser) => void
  close: () => RouterAction
}

interface IStateMap {
  disabled: boolean
  organizationsOptions: IOption<string>[]
  isInitialized: boolean
}

type UserAddProps = IDispatchMap & IStateMap;

class UserAdd extends Component<UserAddProps> {
  constructor(props: UserAddProps) {
    super(props);
    this.form = createRef<Formik<IUser>>();
  }

  public save = stopEvent((e) => {
    this.form.current && this.form.current.handleSubmit(e);
  }, true);

  public cancel = stopEvent(() => {
    this.props.close();
  });

  public form: RefObject<Formik<IUser>>;

  public render() {
    return (
      <>
        <PageHeader title={STRING_RESOURCES.users.create_user} />
        <div className="page-container">
          <Grid container={true}>
            <Grid item={true} xs={12} sm={12} md={7} lg={6}>
              <UserForm
                user={DEFAULT_USER}
                save={this.props.createUser}
                organizationsOptions={this.props.organizationsOptions}
                className={'with-border-bottom'}
                ref={this.form}
              />
            </Grid>
          </Grid>
        </div>
        <MuiThemeProvider theme={FormActionsButtonsTheme}>
          <Grid container={true} className="sticky-container sticky-footer footer-padding">
            <Grid
              container={true}
              item={true}
              xs={12}
              sm={12}
              md={7}
              lg={6}
              spacing={8}
            >
              <Grid item={true} xs={12} sm={6}>
                <MuiButton
                  onClick={this.cancel}
                  disabled={this.props.disabled}
                  variant="contained"
                  color={'secondary'}
                  disableRipple={true}
                  disableFocusRipple={true}
                  className="full-fill"
                >
                  {STRING_RESOURCES.actions.cancel}
                </MuiButton>
              </Grid>
              <Grid item={true} xs={12} sm={6}>
                <MuiButton
                  onClick={this.save}
                  disabled={this.props.disabled}
                  variant="contained"
                  color={'primary'}
                  disableRipple={true}
                  disableFocusRipple={true}
                  className="full-fill"
                >
                  {STRING_RESOURCES.actions.save}
                </MuiButton>
              </Grid>
            </Grid>
          </Grid>
        </MuiThemeProvider>
      </>
    );
  }
}

const mapDispatchToProps: IDispatchMap = {
  createUser: AddUserAction,
  close: () => push('/users'),
};

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  organizationsOptions: getOrganizationsOptions,
  disabled: isLoading(LoadableKeys.ADD_USER),
  isInitialized: createSelector(
    isInitializedUsers(LoadableKeysUsers.LOAD_USERS),
    isInitializedOrganizations(LoadableKeysOrganizations.LOAD_ORGANIZATIONS),
    selectUnaryEvery,
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserAdd);

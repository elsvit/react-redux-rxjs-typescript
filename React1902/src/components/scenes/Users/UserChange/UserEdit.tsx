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
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {createSelector, createStructuredSelector} from 'reselect';

import ActionModalContent from '@io-app/components/common/ActionModalContent';
import PageHeader from '@io-app/components/common/AppPage/PageHeader';
import {withPageLoader} from '@io-app/components/common/hoc';
import {AppState} from '@io-app/redux/IAppState';
import {OpenModalAction} from '@io-app/redux/modal/actions';
import {LoadableKeys as LoadableKeysOrganizations} from '@io-app/redux/organizations/IOrganizationsState';
import {
  getOrganizationsOptions,
  isInitialized as isInitializedOrganizations,
} from '@io-app/redux/organizations/reducer';
import {LoadableKeys, LoadableKeys as LoadableKeysUsers} from '@io-app/redux/users/IUsersState';
import {
  EditUserAction,
  GetUserByIdAction,
  RemoveUserAction,
  SetSelectedUserIdAction,
} from '@io-app/redux/users/actions';
import {getSelectedUser, isInitialized as isInitializedUsers, isLoading} from '@io-app/redux/users/reducer';
import {IOption} from '@io-app/types/IOption';
import {IUser} from '@io-app/types/IUser';
import {stopEvent} from '@io-app/utils/browser';
import {loadFromUrlParams, selectUnaryEvery, selectUnarySome} from '@io-app/utils/common';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import {RemoveIcon} from '@io-ui/Icons';
import {FormActionsButtonsTheme} from '@io-ui/Themes';
import QRCodeView from './QRCodeView';
import UserForm from './UserForm';

interface IDispatchMap {
  saveUser: typeof EditUserAction
  close: () => RouterAction
  setSelectedUserId: typeof SetSelectedUserIdAction,
  removeUser: typeof RemoveUserAction
  getUserById: typeof GetUserByIdAction
  openModal: typeof OpenModalAction
}

interface IStateMap {
  user: Maybe<IUser>
  organizationsOptions: IOption<string>[]
  disabled: boolean
  isInitialized: boolean
}

type UserEditProps = IDispatchMap & IStateMap;

class UserEdit extends Component<UserEditProps> {
  constructor(props: UserEditProps) {
    super(props);
    this.form = createRef<Formik<IUser>>();
  }

  public form: RefObject<Formik<IUser>>;

  public save = stopEvent((e) => {
    this.form.current && this.form.current.handleSubmit(e);
  }, true);

  public remove = stopEvent(() => {
    const {openModal, user, removeUser} = this.props;
    openModal({
      content: (
        <ActionModalContent
          icon={<RemoveIcon />}
          header={STRING_RESOURCES.actions.delete}
          text={STRING_RESOURCES.users.confirm_delete_question}
          actionBtnTitle={STRING_RESOURCES.actions.delete}
          submit={() => (user && removeUser(user.id))}
        />
      ),
    });
  });

  public cancel = stopEvent(() => {
    this.props.setSelectedUserId(null);
    this.props.close();
  });

  public componentDidUpdate(prevProps: UserEditProps) {
    // if user just loaded (refresh page case) update state
    if (prevProps.user == null && this.props.user != null) {
      this.form.current && this.form.current.setValues(this.props.user);
    }
  }

  public componentDidMount() {
    if (this.props.user === null) {
      loadFromUrlParams(this.props, 'userId', this.props.getUserById, this.props.close);
    }
  }

  public render() {
    if (this.props.user == null) {
      return null;
    }

    return (
      <>
        <PageHeader title={this.props.user.name} />
        <i className="io-icon io-icon-medium remove remove-entity-btn" onClick={this.remove}/>
        <div className="page-container">
          <Grid container={true}>
            <Grid item={true} xs={12} sm={12} md={7} lg={6}>
              <UserForm
                user={this.props.user}
                organizationsOptions={this.props.organizationsOptions}
                save={this.props.saveUser}
                className={'with-border-bottom'}
                ref={this.form}
              />
              <QRCodeView disabled={this.props.disabled} id={this.props.user.id}/>
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

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  user: getSelectedUser,
  organizationsOptions: getOrganizationsOptions,
  disabled: createSelector(
    isLoading(LoadableKeys.EDIT_USER),
    isLoading(LoadableKeys.REMOVE_USER),
    selectUnarySome,
  ),
  isInitialized: createSelector(
    isInitializedUsers(LoadableKeysUsers.LOAD_USERS),
    isInitializedOrganizations(LoadableKeysOrganizations.LOAD_ORGANIZATIONS),
    selectUnaryEvery,
  ),
});

const mapDispatchToProps: IDispatchMap = {
  saveUser: EditUserAction,
  close: () => push('/users'),
  setSelectedUserId: SetSelectedUserIdAction,
  removeUser: RemoveUserAction,
  getUserById: GetUserByIdAction,
  openModal: OpenModalAction,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withPageLoader(),
)(UserEdit);

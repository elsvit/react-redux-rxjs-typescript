/**
 * @fileOverview Users List
 */

import Grid from '@material-ui/core/Grid';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import {RouterAction, push} from 'connected-react-router';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {createSelector, createStructuredSelector} from 'reselect';

import PageHeader from '@io-app/components/common/AppPage/PageHeader';
import EntitiesList from '@io-app/components/common/EntitiesList';
import {withPageLoader} from '@io-app/components/common/hoc';
import {AppState} from '@io-app/redux/IAppState';
import {LoadableKeys as LoadableKeysOrganizations} from '@io-app/redux/organizations/IOrganizationsState';
import {isInitialized as isInitializedOrganizations} from '@io-app/redux/organizations/reducer';
import {LoadableKeys as LoadableKeysUsers} from '@io-app/redux/users/IUsersState';
import {SetQRYFilterAction, SetSelectedUserIdAction} from '@io-app/redux/users/actions';
import {
  getQRYResult,
  getSelectedUserId,
  getUsers,
  isInitialized as isInitializedUsers,
} from '@io-app/redux/users/reducer';
import {IQRYResult} from '@io-app/types/ILoadEntitiesResponse';
import {IUser} from '@io-app/types/IUser';
import {selectUnaryEvery} from '@io-app/utils/common';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import IconLabelButton from '@io-ui/IconLabelButton';
import {AddIcon} from '@io-ui/Icons';
import {InfoButtonsTheme} from '@io-ui/Themes';
import UserRow from './UserRow';

interface IOwnProps {
  className?: string;
}

interface IStateMap {
  users: IUser[]
  selectedUserId: Maybe<string>
  qryResult: IQRYResult
  isInitialized: boolean
}

interface IDispatchMap {
  setSelectedUserId: typeof SetSelectedUserIdAction
  navigateToEdit: (id: string) => RouterAction
  navigateToAdd: () => RouterAction
  setQRYFilter: typeof SetQRYFilterAction
}

type UsersListProps = IOwnProps & IStateMap & IDispatchMap;

class UsersList extends Component<UsersListProps> {
  public editUser = (id: string) => {
    this.props.setSelectedUserId(id);
    this.props.navigateToEdit(id);
  }

  public navigateToAdd = () => {
    this.props.setSelectedUserId(null);
    this.props.navigateToAdd();
  }

  public render() {
    const stickyHeader = (
      <Grid container={true} item={true} className={'filters-main-header lists-main-header'} xs={12}>
        <Grid item={true} xs={12} sm={4}>
          <MuiThemeProvider theme={InfoButtonsTheme}>
            <IconLabelButton
              icon={<AddIcon color={'primary'}/>}
              onClick={this.navigateToAdd}
              label={STRING_RESOURCES.users.add_user}
              variant="contained"
              color={'primary'}
            />
          </MuiThemeProvider>
        </Grid>
      </Grid>
    );

    return (
      <>
        <PageHeader title={STRING_RESOURCES.navigation.users} stickyHeader={stickyHeader}/>
        <div className="users-list page-container">
          {/*todo: uncomment when backend will be ready*/}
          {/*<TablePagination*/}
            {/*qryResult={this.props.qryResult}*/}
            {/*setQRYFilter={this.props.setQRYFilter}*/}
          {/*/>*/}
          <EntitiesList
            entities={this.props.users}
            renderRow={({index, entity}) =>
              <UserRow
                key={index}
                user={entity}
                edit={({id}) => this.editUser(id)}
              />}
            selectedEntityId={this.props.selectedUserId}
            setSelectedEntityId={this.props.setSelectedUserId}
            emptyEntitiesMessage={STRING_RESOURCES.users.empty_entities_message}
          />
        </div>
      </>
    );
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  users: getUsers,
  selectedUserId: getSelectedUserId,
  qryResult: getQRYResult,
  isInitialized: createSelector(
    isInitializedUsers(LoadableKeysUsers.LOAD_USERS),
    isInitializedOrganizations(LoadableKeysOrganizations.LOAD_ORGANIZATIONS),
    selectUnaryEvery,
  ),
});

const mapDispatchToProps: IDispatchMap = {
  setSelectedUserId: SetSelectedUserIdAction,
  setQRYFilter: SetQRYFilterAction,
  navigateToEdit: (id: string) => push(`/users/edit/${id}`),
  navigateToAdd: () => push('/users/add'),
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPageLoader(STRING_RESOURCES.navigation.users),
)(UsersList);

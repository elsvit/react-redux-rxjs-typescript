/**
 * @fileOverview
 */

import noop from 'lodash-es/noop';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, Route, RouteComponentProps, Switch} from 'react-router';
import {withRouter} from 'react-router-dom';
import {createStructuredSelector} from 'reselect';
import {Subject, timer} from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';

import {AppState} from '@io-app/redux/IAppState';
import {
  LoadAssetsAction,
  LoadMidItemsAction, ResetAssetsFilter, ResetQRYFilterAction,
  ResetSelectedAssetAction,
  SetAssetsAction,
  SetSelectedAssetAction,
} from '@io-app/redux/assets/actions';

import {getAssetsFilter} from '@io-app/redux/assets/reducer';
import {LoadGroupsAction} from '@io-app/redux/groups/actions';
import {LoadAssetTemplateAction} from '@io-app/redux/organizations/actions';
import {IAssetsFilter} from '@io-app/types/IAssetsFilter';
import {POLLING_TIMER} from '@io-app/utils/constants';
import AppPage from '../../common/AppPage';
import AuthRoute from '../../common/ProtectedRoute/AuthRoute';
import {DeviceAdd, DeviceEdit} from './DeviceChange';
import AssetsList from './DevicesList';

interface IDevicesPageOwnProps {
  className?: string
}

interface IStateMap {
  currentFilter: Partial<IAssetsFilter>
}

interface IDispatchMap {
  loadAssets: typeof LoadAssetsAction
  loadMids: typeof LoadMidItemsAction
  loadGroups: typeof LoadGroupsAction
  loadAssetTemplate: typeof LoadAssetTemplateAction
  setAssets: typeof SetAssetsAction
  setSelectedAsset: typeof SetSelectedAssetAction
  resetSelectedAsset: typeof ResetSelectedAssetAction
  resetAssetsFilter: typeof ResetAssetsFilter
  resetQRYFilter: typeof ResetQRYFilterAction
}

type DevicesPageProps = IDevicesPageOwnProps & IStateMap & IDispatchMap & RouteComponentProps<void>;

class DevicesPage extends Component<DevicesPageProps> {
  constructor(props: DevicesPageProps) {
    super(props);
  }

  protected disposed$: Subject<boolean> = new Subject();

  public componentDidMount() {
    // TODO: create withPolling hoc
    timer(0, POLLING_TIMER)
      .pipe(
        tap(() => {
          this.props.loadAssets(this.props.currentFilter);
          this.props.loadGroups({force: true});
        }),
        takeUntil(this.disposed$),
      )
      .subscribe(noop);

    this.props.loadAssetTemplate();
    this.props.loadMids();
  }

  public componentWillUnmount() {
    this.disposed$.next(true);
    this.props.setAssets([]);
    this.props.resetSelectedAsset();
    this.props.resetAssetsFilter();
    this.props.resetQRYFilter();
  }

  public render() {
    return (
      <AppPage className="devices">
        <Switch>
          <AuthRoute
            path={`${this.props.match.url}/edit/:assetId`}
            component={DeviceEdit}
          />
          <AuthRoute
            exact={true}
            path={`${this.props.match.url}/add`}
            component={DeviceAdd}
          />
          <AuthRoute path={`${this.props.match.url}`} component={AssetsList}/>
          <Route render={() => <Redirect to={'/devices'}/>} />
        </Switch>
      </AppPage>
    );
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  currentFilter: getAssetsFilter,
});

const mapDispatchToProps: IDispatchMap = {
  loadAssets: LoadAssetsAction,
  loadGroups: LoadGroupsAction,
  loadAssetTemplate: LoadAssetTemplateAction,
  loadMids: LoadMidItemsAction,
  setAssets: SetAssetsAction,
  setSelectedAsset: SetSelectedAssetAction,
  resetSelectedAsset: ResetSelectedAssetAction,
  resetAssetsFilter: ResetAssetsFilter,
  resetQRYFilter: ResetQRYFilterAction,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DevicesPage));

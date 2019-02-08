/**
 * @fileOverview Device Edit Page
 */

import MuiButton from '@material-ui/core/Button/Button';
import Grid from '@material-ui/core/Grid/Grid';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import classNames from 'classnames';
import {RouterAction, push} from 'connected-react-router';
import noop from 'lodash-es/noop';
import some from 'lodash-es/some';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, Switch, withRouter} from 'react-router';
import {createStructuredSelector} from 'reselect';

import {AppState} from '@io-app/redux/IAppState';
import {LoadableKeys} from '@io-app/redux/assets/IAssetsState';
import {
  GetAssetByIdAction,
  RemoveAssetAction, ResetSelectedAssetAction,
  SendAssetCommandAction,
  SetSelectedAssetAction,
  UpdateAssetAction,
} from '@io-app/redux/assets/actions';
import {getSelectedAsset, getSelectedAssetGroups, isLoading} from '@io-app/redux/assets/reducer';
import {LoadGroupsAction} from '@io-app/redux/groups/actions';
import {ResetAction as ResetLogsAction} from '@io-app/redux/logs/actions';
import {OpenModalAction} from '@io-app/redux/modal/actions';
import {DEFAULT_ASSET_TIMEOUTS, IAsset} from '@io-app/types/IAsset';
import {IAssetHistory} from '@io-app/types/IAssetHistory';
import {IRawAssetsGroup} from '@io-app/types/IAssetsGroup';
import {CommandTypes, ICommand} from '@io-app/types/ICommand';
import {toProvSpec} from '@io-app/types/IProvSpec';
import {stopEvent} from '@io-app/utils/browser';
import {loadFromUrlParams, notEqual} from '@io-app/utils/common';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import IOButton from '@io-ui/IOButton';
import {RemoveIcon, StartProvisioningIcon} from '@io-ui/Icons';
import Tabs, {ITab} from '@io-ui/Tabs';
import {InfoButtonsTheme} from '@io-ui/Themes';
import ActionModalContent from '../../../common/ActionModalContent';
import PageHeader from '../../../common/AppPage/PageHeader';
import AuthRoute from '../../../common/ProtectedRoute/AuthRoute';
import UnsavedChangesModalContent from '../../../common/UnsavedChangesModalContent';
import {AuthLogs, ExceptionLogs, OperationLogs} from '../../Logs/Logs';
import AssetHistory from './AssetHistory';
import AssetChange from './DeviceChange';
import {
  FULL_VIEW_ASSET_LOGS_TEMPLATES,
  TABLE_VIEW_ASSET_LOGS_TEMPLATES,
} from './asset-logs-templates';

interface IOwnProps {
  className?: string
}

interface AssetEditState {
  asset: Maybe<IAsset>
}

interface IStateMap {
  asset: Maybe<IAsset>
  groups: IRawAssetsGroup[]
  disabled: boolean
}

interface IDispatchMap {
  updateAsset: typeof UpdateAssetAction
  removeAsset: typeof RemoveAssetAction
  getAssetById: typeof GetAssetByIdAction
  close: () => RouterAction,
  loadGroups: typeof LoadGroupsAction,
  openModal: typeof OpenModalAction
  setSelectedAsset: typeof SetSelectedAssetAction
  sendAssetCommand: typeof SendAssetCommandAction
  resetSelectedAsset: typeof ResetSelectedAssetAction
  resetLogs: typeof ResetLogsAction
}

type AssetEditProps = IOwnProps & IStateMap & IDispatchMap & RouteComponentProps<{assetId: string}>;

class DeviceEdit extends Component<AssetEditProps, AssetEditState> {
  constructor(props: AssetEditProps) {
    super(props);

    this.state = {asset: this.props.asset};
  }

  public remove = stopEvent(() => {
    const {openModal, asset, removeAsset} = this.props;
    openModal({
      content: (
        <ActionModalContent
          icon={<RemoveIcon />}
          header={STRING_RESOURCES.actions.delete}
          text={STRING_RESOURCES.devices.confirm_delete_question}
          actionBtnTitle={STRING_RESOURCES.actions.delete}
          submit={() => (asset && removeAsset(asset.id))}
        />
      ),
    });
  });

  public static getDerivedStateFromProps(nextProps: AssetEditProps, prevState: AssetEditState) {
    if (nextProps.asset != null && (prevState.asset == null || nextProps.asset.id !== prevState.asset.id)) {
      return {asset: nextProps.asset};
    }
    return null;
  }

  public isAssetEdited = () => {
    const currentAsset = this.state.asset;
    const prevAsset = this.props.asset;
    if (prevAsset == null || currentAsset == null) {
      return false;
    }

    const valuableKeys = ['provSpec', 'inf', 'bands', ...Object.keys(DEFAULT_ASSET_TIMEOUTS)];
    return some(valuableKeys, (assetKey: string) => notEqual(prevAsset[assetKey], currentAsset[assetKey]));
  };

  public saveAndSendCommand = (fn: (payload: ICommand<IAsset>) => void,
                               forceSaveEntity: boolean = false,
                               type: CommandTypes = CommandTypes.ASSET_REPROVISIONING) => {
    if (!this.state.asset) return;
    fn({entity: this.state.asset, forceSaveEntity, type});
  }

  public sendCommand = (action: string,
                        fn: (payload: ICommand<IAsset>) => void = noop,
                        type: CommandTypes = CommandTypes.ASSET_REPROVISIONING) => {
    if (this.state.asset == null) {
      return;
    }

    if (this.isAssetEdited()) {
      this.props.openModal({
        content: (
          <UnsavedChangesModalContent
            entity={this.state.asset.name}
            action={action}
            fn={(force: boolean) => this.saveAndSendCommand(fn, force)}
          />
        ),
      });
    } else {
      fn({entity: this.state.asset, forceSaveEntity: false, type});
    }
  }

  public componentDidMount() {
    loadFromUrlParams(this.props, 'assetId', this.props.getAssetById, this.props.close);
  }

  public componentWillUnmount(): void {
    this.props.resetSelectedAsset();
    this.props.resetLogs();
  }

  public save = () => {
    if (this.state.asset == null) {
      return;
    }
    this.props.updateAsset(this.state.asset);
  };

  public onAssetChange = (asset: IAsset) => {
    if (this.state.asset == null) {
      return;
    }

    this.setState({asset: {...this.state.asset, ...asset}});
  }

  public onApplyHistory = (history: IAssetHistory) => {
    this.onAssetChange({
      inf: history.inf,
      provSpec: toProvSpec(history.provSpec),
      bands: history.bands,
    } as IAsset);
  }

  public renderAssetChange = () => {
    if (this.props.asset == null) {
      return null;
    }

    return (
      <AssetChange
        save={this.save}
        asset={this.props.asset}
        groups={this.props.groups}
        onChange={this.onAssetChange}
        className={'edit-asset'}
        disabled={this.props.disabled}
        renderActions={this.renderActions}
        renderStickyActions={this.renderStickyActions}
        cancel={this.props.close}
      />
    );
  }

  public renderStickyActions = (hasErrors: boolean) => {
    return (
      <MuiThemeProvider theme={InfoButtonsTheme}>
        <Grid container={true}>
          <Grid item={true} xs={12} sm={12} className="command-button-grid">
            <IOButton
              className="full-fill"
              onClick={() => this.sendCommand(
                STRING_RESOURCES.actions.synchronize, this.props.sendAssetCommand,
              )}
              disabled={this.props.disabled || hasErrors}
              variant="contained"
              color={'primary'}
              icon={<StartProvisioningIcon
                isDisabled={this.props.disabled || hasErrors}
                className={classNames({disabled: this.props.disabled || hasErrors})}
              />}
              label={STRING_RESOURCES.actions.synchronize}
            />
          </Grid>
        </Grid>
      </MuiThemeProvider>
    );
  }

  public renderActions = () => (this.props.asset == null ? null
    : <i className="io-icon io-icon-medium remove remove-entity-btn" onClick={this.remove} />
  );

  public renderHeader = () => {
    const {asset} = this.props;

    if (asset == null) {
      return null;
    }

    const url = this.props.match.url;
    const tabs: ITab[] = [
      {title: STRING_RESOURCES.actions.edit, path: url, exact: true},
      {title: STRING_RESOURCES.navigation.history, path: `${url}/history`},
      {title: STRING_RESOURCES.navigation.auth_logs, path: `${url}/authlogs`},
      {title: STRING_RESOURCES.navigation.operation_logs, path: `${url}/operationlogs`},
      {title: STRING_RESOURCES.navigation.exception_logs, path: `${url}/exceptionlogs`},
    ];

    const stickyHeader = (
      <Tabs items={tabs} className={'with-border-bottom full-fill'}/>
    );

    return (
      <PageHeader
        title={asset.name}
        stickyHeader={stickyHeader}
      />
    );
  }

  public render() {
    return (
      <>
        {this.renderHeader()}
        <div className="page-container">
          <Switch>
            <AuthRoute
              path={`${this.props.match.path}/history`}
              render={() => <AssetHistory onApply={this.onApplyHistory}/>}
            />
            <AuthRoute
              path={`${this.props.match.path}/operationlogs`}
              render={() => (
                <OperationLogs
                  fullViewTemplates={FULL_VIEW_ASSET_LOGS_TEMPLATES}
                  tableViewTemplates={TABLE_VIEW_ASSET_LOGS_TEMPLATES}
                  shouldApplyFilter={false}
                />
              )}
            />
            <AuthRoute
              path={`${this.props.match.path}/exceptionlogs`}
              render={() => (
                <ExceptionLogs
                  fullViewTemplates={FULL_VIEW_ASSET_LOGS_TEMPLATES}
                  tableViewTemplates={TABLE_VIEW_ASSET_LOGS_TEMPLATES}
                  shouldApplyFilter={false}
                />
              )}
            />
            <AuthRoute
              path={`${this.props.match.path}/authlogs`}
              render={() => (
                <AuthLogs
                  fullViewTemplates={FULL_VIEW_ASSET_LOGS_TEMPLATES}
                  tableViewTemplates={TABLE_VIEW_ASSET_LOGS_TEMPLATES}
                  shouldApplyFilter={false}
                />
              )}
            />
            <AuthRoute
              path={`${this.props.match.path}`}
              render={this.renderAssetChange}
            />
          </Switch>
        </div>
      </>
    );
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  asset: getSelectedAsset,
  disabled: isLoading(LoadableKeys.UPDATE_ASSET),
  groups: getSelectedAssetGroups,
});

const mapDispatchToProps: IDispatchMap = {
  close: () => push('/devices'),
  updateAsset: UpdateAssetAction,
  removeAsset: RemoveAssetAction,
  getAssetById: GetAssetByIdAction,
  loadGroups: LoadGroupsAction,
  openModal: OpenModalAction,
  setSelectedAsset: SetSelectedAssetAction,
  resetSelectedAsset: ResetSelectedAssetAction,
  resetLogs: ResetLogsAction,
  sendAssetCommand: SendAssetCommandAction,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DeviceEdit));

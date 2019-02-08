/**
 * @fileOverview AssetConfigurationHistory
 */

import {RouterAction, push} from 'connected-react-router';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {createStructuredSelector} from 'reselect';

import {AppState} from '@io-app/redux/IAppState';
import {GetAssetHistoryAction, SetSelectedAssetAction} from '@io-app/redux/assets/actions';
import {
  getSelectedAssetHistory, getSelectedAssetId,
  hasSelectedAssetHistory,
} from '@io-app/redux/assets/reducer';
import {getAssetTemplate} from '@io-app/redux/organizations/reducer';
import {IAssetHistory} from '@io-app/types/IAssetHistory';
import {IAssetTemplate} from '@io-app/types/IAssetTemplate';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import AssetHistoryRow from './AssetHistoryRow/AssetHistoryRow';

interface IOwnProps {
  onApply: (history: IAssetHistory) => void
}

interface IStateMap {
  selectedAssetId: Maybe<string>
  assetHistory: IAssetHistory[]
  assetTemplate: Maybe<IAssetTemplate>
  hasAssetHistory: boolean
}

interface IDispatchMap {
  navigateToEdit: (deviceId: string) => RouterAction
  navigateToDevices: () => RouterAction
  getAssetHistory: typeof GetAssetHistoryAction
  setSelectedAsset: typeof SetSelectedAssetAction
}

type ConfigurationHistoryProps = IOwnProps & IStateMap & IDispatchMap & RouteComponentProps<{assetId: string}>;

interface ConfigurationHistoryState {
  selectedRowIdx: number
}

class AssetHistory extends Component<ConfigurationHistoryProps, ConfigurationHistoryState> {
  constructor(props: ConfigurationHistoryProps) {
    super(props);
    this.state = {selectedRowIdx: -1};
  }

  public apply = (history: IAssetHistory) => {
    if (this.props.selectedAssetId == null) {
      return;
    }

    this.props.onApply(history);
    this.props.navigateToEdit(this.props.selectedAssetId);
  }

  public componentDidMount() {
    const {match} = this.props;
    const {params} = match;
    if (!params || params.assetId == null) {
      return;
    }

    if (this.props.selectedAssetId !== params.assetId) {
      this.props.setSelectedAsset({id: params.assetId});
    }

    this.props.getAssetHistory(params.assetId);
  }

  public render() {
    const {assetHistory, assetTemplate, hasAssetHistory} = this.props;
    return (
      <div className={'form-control'}>
        {
          hasAssetHistory ?  (
            assetHistory.map(val => {
              return (
                <AssetHistoryRow
                  key={`${val.id}${val.modified}`}
                  assetHistory={val}
                  apply={() => this.apply(val)}
                  assetTemplate={assetTemplate}
                />
              );
            })
          ) : (
            <div className={'empty-entities-message'}>{STRING_RESOURCES.devices.empty_history}</div>
          )
        }
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  assetHistory: getSelectedAssetHistory,
  assetTemplate: getAssetTemplate,
  hasAssetHistory: hasSelectedAssetHistory,
  selectedAssetId: getSelectedAssetId,
});

const mapDispatchToProps: IDispatchMap = {
  navigateToEdit: (deviceId: string) => push(`/devices/edit/${deviceId}`),
  navigateToDevices: () => push(`/devices`),
  getAssetHistory: GetAssetHistoryAction,
  setSelectedAsset: SetSelectedAssetAction,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AssetHistory));

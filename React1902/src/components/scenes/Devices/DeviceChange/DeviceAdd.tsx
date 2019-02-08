/**
 * @fileOverview Add gateway asset page
 */

import {push} from 'connected-react-router';
import get from 'lodash-es/get';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import {AppState} from '@io-app/redux/IAppState';
import {LoadableKeys} from '@io-app/redux/assets/IAssetsState';
import {AddAssetAction} from '@io-app/redux/assets/actions';
import {isLoading as isAssetsLoading} from '@io-app/redux/assets/reducer';
import {getAssetTemplate} from '@io-app/redux/organizations/reducer';
import {DEFAULT_ASSET} from '@io-app/types/IAsset';
import {IAssetTemplate} from '@io-app/types/IAssetTemplate';
import {toProvSpec} from '@io-app/types/IProvSpec';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import PageHeader from '../../../common/AppPage/PageHeader';
import AssetChange from './DeviceChange';

interface IOwnProps {
  className?: string;
}

interface IDispatchMap {
  addGateway: typeof AddAssetAction
  close: () => void
}

export interface IStateMap {
  disabled: boolean
  assetTemplate: Maybe<IAssetTemplate>
}

type AssetAddProps = IOwnProps & IStateMap & IDispatchMap;

class DeviceAdd extends Component<AssetAddProps> {
  public render() {
    const provSpec = toProvSpec(get(this.props.assetTemplate, 'provSpec'));
    const defaultAsset = {...DEFAULT_ASSET, provSpec};

    return (
      <>
        <PageHeader title={STRING_RESOURCES.devices.add_device}/>
        <div className="page-container">
          <AssetChange
            save={this.props.addGateway}
            asset={defaultAsset}
            groups={[]}
            title={STRING_RESOURCES.devices.add_device}
            className={'add-gateway'}
            cancel={this.props.close}
            disabled={this.props.disabled}
            isAdding={true}
          />
        </div>
      </>
    );
  }
}

export const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  disabled: isAssetsLoading(LoadableKeys.ADD_ASSET),
  assetTemplate: getAssetTemplate,
});

export const mapDispatchToProps: IDispatchMap = {
  addGateway: AddAssetAction,
  close: () => push('/devices'),
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceAdd);

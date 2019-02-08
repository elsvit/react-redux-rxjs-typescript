/**
 * @fileOverview Assets List
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
import {LoadableKeys} from '@io-app/redux/assets/IAssetsState';
import {
  ResetSelectedAssetAction,
  SetQRYFilterAction,
  SetSelectedAssetAction,
} from '@io-app/redux/assets/actions';
import {
  getQRYResult,
  getRawAssets,
  getSelectedAssetId,
  isInitialized,
  isLoading,
} from '@io-app/redux/assets/reducer';
import {LoadableKeys as LoadableKeysGroups} from '@io-app/redux/groups/IGroupsState';
import {isInitialized as isInitializedGroups} from '@io-app/redux/groups/reducer';
import {LoadableKeys as LoadableKeysOrganizations} from '@io-app/redux/organizations/IOrganizationsState';
import {isInitialized as isInitializedOrganizations} from '@io-app/redux/organizations/reducer';
import {IRawAsset} from '@io-app/types/IAsset';
import {IQRYResult} from '@io-app/types/ILoadEntitiesResponse';
import {selectUnaryEvery} from '@io-app/utils/common';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import IconLabelButton from '@io-ui/IconLabelButton';
import {AddIcon} from '@io-ui/Icons';
import TablePagination from '@io-ui/TablePagination';
import {InfoButtonsTheme} from '@io-ui/Themes';
import AssetRowWrapper from './AssetRowWrapper';
import DevicesFilter from './DevicesFilter';

interface IStateMap {
  assets: IRawAsset[]
  qryResult: IQRYResult
  selectedAssetId: Maybe<string>
  isLoading: boolean
  isInitialized: boolean
}

interface IDispatchMap {
  resetSelectedAsset: typeof ResetSelectedAssetAction
  setSelectedAsset: typeof SetSelectedAssetAction
  navigateToEdit: (assetId: string) => RouterAction
  navigateToAdd: () => RouterAction
  setQRYFilter: typeof SetQRYFilterAction
}

interface IOwnProps {
  className?: string;
}

interface AssetsListState {
  isFilterOpen: boolean
}

type AssetsListProps = IOwnProps & IStateMap & IDispatchMap;

class DevicesList extends Component<AssetsListProps, AssetsListState> {
  constructor(props: AssetsListProps) {
    super(props);
    this.state = {isFilterOpen: false};
  }

  public editAsset = (asset: IRawAsset) => {
    this.props.setSelectedAsset({entity: asset, id: asset.id});
    this.props.navigateToEdit(asset.id);
  }

  public addAsset = () => {
    this.props.resetSelectedAsset();
    this.props.navigateToAdd();
  }

  public toggleIsFilterOpen = () => {
    this.setState({isFilterOpen: !this.state.isFilterOpen});
  }

  public setSelectedAsset = (id: Maybe<string>) => {
    this.props.setSelectedAsset({id});
  }

  public render() {
    const stickyHeader = (
      <Grid container={true} item={true} className={'filters-main-header lists-main-header'} xs={12}>
        <Grid item={true} xs={12} sm={4}>
          <MuiThemeProvider theme={InfoButtonsTheme}>
            <IconLabelButton
              icon={<AddIcon/>}
              onClick={this.addAsset}
              label={STRING_RESOURCES.devices.add_device}
              variant="contained"
              color={'primary'}
            />
          </MuiThemeProvider>
        </Grid>
        <DevicesFilter/>
      </Grid>
    );

    return (
      <>
        <PageHeader
          title={STRING_RESOURCES.navigation.devices}
          stickyHeader={stickyHeader}
        />
        <div className={'page-container'}>
          <TablePagination
            qryResult={this.props.qryResult}
            setQRYFilter={this.props.setQRYFilter}
          />
          <EntitiesList
            entities={this.props.assets}
            isLoading={this.props.isLoading}
            renderRow={({index, entity}) =>
              <AssetRowWrapper
                key={index}
                asset={entity}
                edit={this.editAsset}
              />}
            selectedEntityId={this.props.selectedAssetId}
            setSelectedEntityId={this.setSelectedAsset}
            emptyEntitiesMessage={STRING_RESOURCES.devices.empty_entities_message}
          />
        </div>
      </>
    );
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  assets: getRawAssets,
  selectedAssetId: getSelectedAssetId,
  isLoading: isLoading(LoadableKeys.LOAD_ASSETS),
  qryResult: getQRYResult,
  isInitialized: createSelector(
    isInitialized(LoadableKeys.LOAD_ASSETS),
    isInitialized(LoadableKeys.LOAD_MIDS),
    isInitializedGroups(LoadableKeysGroups.LOAD_GROUPS),
    isInitializedOrganizations(LoadableKeysOrganizations.LOAD_ASSET_TEMPLATE),
    selectUnaryEvery,
  ),
});

const mapDispatchToProps: IDispatchMap = {
  resetSelectedAsset: ResetSelectedAssetAction,
  setSelectedAsset: SetSelectedAssetAction,
  navigateToEdit: (assetId: string) => push(`/devices/edit/${assetId}`),
  navigateToAdd: () => push('/devices/add'),
  setQRYFilter: SetQRYFilterAction,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPageLoader(STRING_RESOURCES.navigation.devices),
)(DevicesList);

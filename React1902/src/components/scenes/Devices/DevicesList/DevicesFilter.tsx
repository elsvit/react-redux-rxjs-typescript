/**
 * @fileOverview Devices Filter
 */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createSelector, createStructuredSelector} from 'reselect';

import FilterContainer from '@io-app/components/common/EntitiesFilter/FilterContainer';
import {IFilterTemplate} from '@io-app/components/common/EntitiesFilter/IFilterTemplate';
import {AppState} from '@io-app/redux/IAppState';
import {LoadableKeys} from '@io-app/redux/assets/IAssetsState';
import {LoadAssetsAction, ResetAssetsFilter, SetAssetsFilter} from '@io-app/redux/assets/actions';
import {getAssets} from '@io-app/redux/assets/reducer';
import {getAssetsFilter} from '@io-app/redux/assets/reducer';
import {isLoading} from '@io-app/redux/assets/reducer';
import {getRawGroups, hasGroups} from '@io-app/redux/groups/reducer';
import {IAssetsFilter, toAssetsFilter} from '@io-app/types/IAssetsFilter';
import {IOption} from '@io-app/types/IOption';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import {BASE_DEVICE_FILTER_TEMPLATE} from './devices-filter-templates';

interface IDevicesFilterState {
  filter: IAssetsFilter
  focusedDateInput: 'startDate' | 'endDate' | null
}

interface IStateMap {
  filter: Partial<IAssetsFilter>
  groupsOptions: IOption<string>[]
  assetOptions: IOption<string>[]
  hasGroups: boolean
  isLoading: boolean
}

interface IDispatchMap {
  setFilter: typeof SetAssetsFilter
  resetFilter: typeof ResetAssetsFilter
  loadAssets: typeof LoadAssetsAction
}

type DevicesFilterProps = IStateMap & IDispatchMap;

class DevicesFilter extends Component<DevicesFilterProps, IDevicesFilterState> {
  public render() {
    const template: IFilterTemplate<IAssetsFilter> = {
      controls: BASE_DEVICE_FILTER_TEMPLATE.controls.map((template) => {
        return template.control.controlKey === 'group'
          ? {...template, control: {...template.control, options: this.props.groupsOptions}}
          : template;
      }),
    };

    return (
      <FilterContainer
        isLoading={this.props.isLoading}
        filter={this.props.filter}
        setFilter={this.props.setFilter}
        loadData={this.props.loadAssets}
        resetFilter={this.props.resetFilter}
        template={template}
        entityType={'devices'}
        toEntitiesFilter={toAssetsFilter}
        placeholder={STRING_RESOURCES.devices.device_name}
        className="tile is-4"
      />
    );
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  filter: getAssetsFilter,
  groupsOptions: createSelector(getRawGroups, (groups) => groups.map((group) => ({value: group.id, label: group.name}))),
  assetOptions: createSelector(getAssets, (assets) => assets.map((asset) => ({value: asset.id, label: asset.name}))),
  hasGroups: hasGroups,
  isLoading: isLoading(LoadableKeys.LOAD_ASSETS),
});

export const mapDispatchToProps: IDispatchMap = {
  setFilter: SetAssetsFilter,
  resetFilter: ResetAssetsFilter,
  loadAssets: LoadAssetsAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(DevicesFilter);


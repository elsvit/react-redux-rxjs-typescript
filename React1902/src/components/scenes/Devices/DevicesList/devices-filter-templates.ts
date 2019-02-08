import {
  FilterControlPosition,
  FilterControlType,
  IDateRangePickerTemplate,
  IFilterTemplate, ISearchControlTemplate, ISelectControlTemplate,
} from '@io-app/components/common/EntitiesFilter/IFilterTemplate';
import {AppType, appTypeOptions} from '@io-app/types/AppType';
import {AssetUpdateState, assetUpdateStateOptions} from '@io-app/types/AssetUpdateState';
import {IAssetsFilter} from '@io-app/types/IAssetsFilter';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';

export const BASE_DEVICE_FILTER_TEMPLATE: IFilterTemplate<IAssetsFilter> = {
  controls: [
    {
      control: {
        type: FilterControlType.DATE,
        className: 'date-filter',
        label: STRING_RESOURCES.devices.filter.last_seen,
        fromKey: 'from',
        toKey: 'to',
        controlKey: 'date',
      } as IDateRangePickerTemplate<IAssetsFilter>,
      position: FilterControlPosition.CONTAINER,
    },
    {
      control: {
        type: FilterControlType.SELECT,
        className: 'group-filter',
        label: STRING_RESOURCES.devices.filter.group,
        placeholder: STRING_RESOURCES.devices.filter.select_group,
        noOptionsMessage: STRING_RESOURCES.devices.filter.groups_not_found,
        controlKey: 'group',
        entityKey: 'groupId',
        options: [],
        isSearchable: true,
        isClearable: true,
      } as ISelectControlTemplate<IAssetsFilter, string>,
      position: FilterControlPosition.CONTAINER,
    },
    {
      control: {
        type: FilterControlType.SELECT,
        className: 'status-filter',
        label: STRING_RESOURCES.devices.filter.update_state,
        placeholder: STRING_RESOURCES.devices.filter.update_state,
        noOptionsMessage: '',
        controlKey: 'updateState',
        entityKey: 'updateState',
        options: assetUpdateStateOptions,
        isClearable: true,
      } as ISelectControlTemplate<IAssetsFilter, AssetUpdateState>,
      position: FilterControlPosition.CONTAINER,
    },
    {
      control: {
        type: FilterControlType.SELECT,
        className: 'type-filter',
        label: STRING_RESOURCES.common.type,
        placeholder: STRING_RESOURCES.devices.filter.select_type,
        noOptionsMessage: '',
        controlKey: 'app',
        entityKey: 'app',
        options: appTypeOptions,
        isClearable: true,
      } as ISelectControlTemplate<IAssetsFilter, AppType>,
      position: FilterControlPosition.CONTAINER,
    },
    {
      control: {
        className: 'search-filter',
        type: FilterControlType.SEARCH,
        placeholder: STRING_RESOURCES.common.search,
        controlKey: 'searchByName',
        entityKey: 'searchKey',
      } as ISearchControlTemplate<IAssetsFilter>,
      position: FilterControlPosition.ROOT,
    },
  ],
};
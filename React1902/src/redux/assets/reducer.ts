/**
 * @fileOverview
 */

import {compact, find, some}  from 'lodash-es/compact';
import {createSelector} from 'reselect';

import {IErrorPayload, IKeyBooleanPayload} from '@io-app/types/Actions';
import {IAsset, IRawAsset, ISelectedAsset, normalizeRawAsset} from '@io-app/types/IAsset';
import {IAssetLink} from '@io-app/types/IAssetLink';
import {IAssetsFilter} from '@io-app/types/IAssetsFilter';
import {IRawAssetsGroup} from '@io-app/types/IAssetsGroup';
import {ILoadEntitiesResponse, IQRYResult} from '@io-app/types/ILoadEntitiesResponse';
import {IMidItem} from '@io-app/types/IMidItem';
import {DEFAULT_PAGINATION_FILTER} from '@io-app/types/IPaginationFilter';
import {notEmpty} from '@io-app/utils/common';
import {AppState} from '../IAppState';
import {
  createGetErrorByKeySelector,
  createGetErrorsRawSelector,
  createGetLoadingSelector,
  createIsInitializedByKeySelector,
  createIsLoadingByKeySelector,
} from '../common/selectors';
import {
  addEntityInArrayByPath, removeEntityFromArrayByPath, setErrors, setInitializingBools, setLoadingBools,
  setPropIfNotEqual,
  updateEntityInArrayByPath,
} from '../common/store-utils';
import {getRawGroups} from '../groups/reducer';
import {AssetsState, LoadableKeys} from './IAssetsState';
import {ActionTypes, Actions} from './actions';

export const initialState: AssetsState = {
  loading: null,
  errors: null,
  initializing: null,
  assets: [],
  qryResult: {...DEFAULT_PAGINATION_FILTER, totalResults: 0},
  filter: {},
  selectedAsset: {
    id: null,
    entity: null,
    history: [],
    groups: [],
  },
  midItems: [],
};

const updateAsset = updateEntityInArrayByPath<AssetsState, 'assets', IRawAsset>('assets');
const addAsset = addEntityInArrayByPath<AssetsState, 'assets', IRawAsset>('assets');
const removeAsset = removeEntityFromArrayByPath<AssetsState, 'assets', IRawAsset>('assets');
const setMidItems = setPropIfNotEqual<AssetsState, 'midItems'>('midItems');

export default function reducer(state = initialState, {type, payload}: Actions): AssetsState {
  switch (type) {
    case ActionTypes.LOAD_ASSETS_SUCCESS:
      const {results, qryResult} = payload as ILoadEntitiesResponse<IRawAsset>;
      return {...state, assets: results, qryResult: {...state.qryResult, totalResults: qryResult.totalResults}};

    case ActionTypes.SET_ASSETS:
      return {...state, assets: payload as IRawAsset[]};

    case ActionTypes.SET_QRY_FILTER:
      return {...state, qryResult: {...state.qryResult, ...(payload as Partial<IQRYResult>)}};

    case ActionTypes.SET_SELECTED_ASSET:
      return _setSelectedAsset(state, payload as Partial<ISelectedAsset>);

    case ActionTypes.SET_LOADING:
      return setLoadingBools(state, payload as IKeyBooleanPayload<LoadableKeys>);

    case ActionTypes.SET_ERRORS:
      return setErrors(state, payload as IErrorPayload<LoadableKeys>);

    case ActionTypes.RESET:
      return initialState;

    default:
      return state;
  }
}

// Selectors

export const getAssetsState = (state: AppState) => state.assets;

export const getRawAssets = createSelector(getAssetsState, (s) => s.assets);
export const getAssets = createSelector(getRawAssets, getRawGroups, _mapGroupsToAssets); // todo: remove
export const hasAssets = createSelector(getRawAssets, notEmpty);
export const selectAssetById = (id: string) =>
  createSelector(getAssets, (assets: IAsset[]) => find(assets, (d) => d.id === id));

export const getMidItems = createSelector(getAssetsState, (s) => s.midItems);
export const hasMidItems = createSelector(getMidItems, notEmpty);

export const getSelectedEntity = createSelector(getAssetsState, (s) => s.selectedAsset);
export const getSelectedAssetId = createSelector(getSelectedEntity, (e) => e.id);
export const getSelectedRawAsset = createSelector(getSelectedEntity, _getSelectedRawAsset);
export const getSelectedAsset = createSelector(getSelectedEntity, _getSelectedAsset);
export const getSelectedAssetGroups = createSelector(getSelectedEntity, (e) => e.groups);
export const hasSelectedAssetId = createSelector(getSelectedAssetId, notEmpty);
export const hasSelectedAsset = createSelector(getSelectedAsset, notEmpty);
export const getSelectedAssetHistory = createSelector(getSelectedEntity, (e) => e.history);
export const hasSelectedAssetHistory = createSelector(getSelectedAssetHistory, notEmpty);

export const getAssetsFilter = createSelector(getAssetsState, (s) => s.filter);
export const hasAssetsFilter = createSelector(getAssetsFilter, (s) => some(s, notEmpty));
export const getQRYResult = createSelector(getAssetsState, (s) => s.qryResult);

export const getErrorByKey = createGetErrorByKeySelector<LoadableKeys>(getAssetsState);
export const getErrorsRaw = createGetErrorsRawSelector<LoadableKeys>(getAssetsState);
export const isInitialized = createIsInitializedByKeySelector<LoadableKeys>(getAssetsState);
export const isAssetsInitialized = isInitialized(LoadableKeys.LOAD_ASSETS);
export const getLoading = createGetLoadingSelector<LoadableKeys>(getAssetsState);
export const isLoading = createIsLoadingByKeySelector<LoadableKeys>(getAssetsState);
export const isAssetsLoading = isLoading(LoadableKeys.LOAD_ASSETS);

export function getAssetsNamesByLink(link: IAssetLink) {
  return createSelector(getAssets, (assets: IAsset[]) => {
    return assets
      .filter((asset) => asset.id === link.assetA || asset.id === link.assetB)
      .map((asset) => asset.name)
      .join(', ');
  });
}

function _getSelectedRawAsset(selectedAsset: ISelectedAsset): Maybe<IRawAsset> {
  if (selectedAsset.entity == null || selectedAsset.entity.id !== selectedAsset.id) {
    return null;
  }

  return selectedAsset.entity;
}

function _getSelectedAsset(selectedAsset: ISelectedAsset): Maybe<IAsset> {
  if (selectedAsset.entity == null) {
    return null;
  }

  return normalizeRawAsset(selectedAsset.entity, selectedAsset.groups);
}

function _mapGroupsToAssets(assets: IRawAsset[], groups: IRawAssetsGroup[]): IAsset[] {
  return compact(assets.map((a) => normalizeRawAsset(a, groups)));
}

function _setSelectedAsset(state: AssetsState, selectedAsset: Partial<ISelectedAsset>): AssetsState {
  return {...state, selectedAsset: {...state.selectedAsset, ...selectedAsset}};
}

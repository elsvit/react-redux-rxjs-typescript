/**
 * @fileOverview
 */

import {
  ActionWithPayload,
  IErrorPayload,
  IKeyBooleanPayload,
  actionCreator,
  reset, setErrors, setInit, setLoading,
  type, voidActionCreator,
} from '@io-app/types/Actions';
import {IAsset, IRawAsset, ISelectedAsset} from '@io-app/types/IAsset';
import {IAssetsFilter} from '@io-app/types/IAssetsFilter';
import {ICommand} from '@io-app/types/ICommand';
import {ILoadEntitiesResponse, IQRYResult} from '@io-app/types/ILoadEntitiesResponse';
import {IMidItem} from '@io-app/types/IMidItem';
import {LoadableKeys} from './IAssetsState';

const TAG = 'Assets';

export const ActionTypes = {
  SET_INITIALIZED: setInit(TAG),
  SET_ERRORS: setErrors(TAG),
  SET_LOADING: setLoading(TAG),
  RESET: reset(TAG),
  LOAD_ASSETS: type(TAG, 'load assets'),
  LOAD_ASSETS_SUCCESS: type(TAG, 'load assets success'),
  ADD_ASSET: type(TAG, 'add asset'),
  UPDATE_ASSET: type(TAG, 'update asset'),
  REMOVE_ASSET: type(TAG, 'remove asset'),
  GET_ASSET_BY_ID: type(TAG, 'get asset by id'),
  GET_ASSET_BY_ID_SUCCESS: type(TAG, 'get asset by id success'),
  SET_SELECTED_ASSET: type(TAG, 'set selectedAsset'),
  RESET_SELECTED_ASSET: type(TAG, 'reset selectedAsset'),
  SEND_ASSET_COMMAND: type(TAG, 'send command for asset'),
  LOAD_MID_ITEMS: type(TAG, 'Load MIDs list'),
  LOAD_MID_ITEMS_SUCCESS: type(TAG, 'MIDs list loaded'),
  GET_ASSET_HISTORY: type(TAG, 'load asset history'),
  GET_ASSET_HISTORY_SUCCESS: type(TAG, 'load asset history success'),
  GET_ASSET_GROUPS: type(TAG, 'load asset groups'),
  GET_ASSET_GROUPS_SUCCESS: type(TAG, 'load asset groups success'),
  SET_ASSETS: type(TAG, 'set assets'), // todo: remove?
  SET_QRY_FILTER: type(TAG, 'set qry filter'),
  RESET_QRY_FILTER: type(TAG, 'reset qry filter'),
  SET_ASSETS_FILTER: type(TAG, 'set assets filter'),
  RESET_ASSETS_FILTER: type(TAG, 'reset assets filter'),
};

export const SetErrorsAction = actionCreator<IErrorPayload<LoadableKeys>>(ActionTypes.SET_ERRORS);
export const SetLoadingAction = actionCreator<IKeyBooleanPayload<LoadableKeys>>(ActionTypes.SET_LOADING);
export const SetInitializedAction = actionCreator<IKeyBooleanPayload<LoadableKeys>>(ActionTypes.SET_INITIALIZED);
export const ResetAction = voidActionCreator(ActionTypes.RESET);

export const LoadAssetsAction = voidActionCreator<Partial<IAssetsFilter>>(ActionTypes.LOAD_ASSETS);
export const LoadAssetsSuccessAction = actionCreator<ILoadEntitiesResponse<IRawAsset>>(ActionTypes.LOAD_ASSETS_SUCCESS);
export const SetAssetsFilter = actionCreator<Partial<IAssetsFilter>>(ActionTypes.SET_ASSETS_FILTER);
export const ResetAssetsFilter = voidActionCreator(ActionTypes.RESET_ASSETS_FILTER);
export const SetQRYFilterAction = actionCreator<Partial<IQRYResult>>(ActionTypes.SET_QRY_FILTER);
export const ResetQRYFilterAction = voidActionCreator(ActionTypes.RESET_QRY_FILTER);

export const AddAssetAction = actionCreator<IAsset>(ActionTypes.ADD_ASSET);
export const UpdateAssetAction = actionCreator<IAsset>(ActionTypes.UPDATE_ASSET);
export const RemoveAssetAction = actionCreator<string>(ActionTypes.REMOVE_ASSET);

export const SetSelectedAssetAction = actionCreator<Partial<ISelectedAsset>>(ActionTypes.SET_SELECTED_ASSET);
export const ResetSelectedAssetAction = voidActionCreator(ActionTypes.RESET_SELECTED_ASSET);
export const GetAssetByIdAction = actionCreator<string>(ActionTypes.GET_ASSET_BY_ID);
export const GetAssetHistoryAction = actionCreator<string>(ActionTypes.GET_ASSET_HISTORY);
export const GetAssetGroupsAction = actionCreator<string>(ActionTypes.GET_ASSET_GROUPS);
export const SendAssetCommandAction = actionCreator<ICommand<IAsset>>(ActionTypes.SEND_ASSET_COMMAND);

export const LoadMidItemsAction = voidActionCreator(ActionTypes.LOAD_MID_ITEMS);
export const LoadMidItemsSuccessAction = actionCreator<IMidItem[]>(ActionTypes.LOAD_MID_ITEMS_SUCCESS);

export const SetAssetsAction = actionCreator<IRawAsset[]>(ActionTypes.SET_ASSETS); // todo remove?

export type Actions
  = ActionWithPayload<string> |
  ActionWithPayload<Partial<IQRYResult>> |
  ActionWithPayload<Partial<IAssetsFilter>> |
  ActionWithPayload<IRawAsset> |
  ActionWithPayload<IRawAsset[]> | // todo: remove?
  ActionWithPayload<IAsset> |
  ActionWithPayload<ICommand<IAsset>> |
  ActionWithPayload<IMidItem[]> |
  ActionWithPayload<void> |
  ActionWithPayload<ILoadEntitiesResponse<IRawAsset>> |
  ActionWithPayload<IErrorPayload<LoadableKeys>> |
  ActionWithPayload<IKeyBooleanPayload<LoadableKeys>>;

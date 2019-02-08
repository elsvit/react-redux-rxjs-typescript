/**
 * @fileOverview
 */

import {IRawAsset, ISelectedAsset} from '@io-app/types/IAsset';
import {IAssetsFilter} from '@io-app/types/IAssetsFilter';
import {IQRYResult} from '@io-app/types/ILoadEntitiesResponse';
import {IMidItem} from '@io-app/types/IMidItem';
import {ILoadableState} from '../ILoadableState';

export const LoadableKeys = {
  LOAD_ASSETS: 'LOAD_ASSETS' as 'LOAD_ASSETS',
  ADD_ASSET: 'ADD_ASSET' as 'ADD_ASSET',
  UPDATE_ASSET: 'UPDATE_ASSET' as 'UPDATE_ASSET',
  REMOVE_ASSET: 'REMOVE_ASSET' as 'REMOVE_ASSET',
  GET_ASSET_BY_ID: 'GET_ASSET_BY_ID' as 'GET_ASSET_BY_ID',
  GET_ASSET_HISTORY: 'GET_ASSET_HISTORY' as 'GET_ASSET_HISTORY',
  GET_ASSET_GROUPS_BY_ID: 'GET_ASSET_GROUPS_BY_ID' as 'GET_ASSET_GROUPS_BY_ID',
  SEND_ASSET_COMMAND: 'SEND_ASSET_COMMAND' as 'SEND_ASSET_COMMAND',
  LOAD_MIDS: 'LOAD_MIDS' as 'LOAD_MIDS',
};

export type LoadableKeys = (typeof LoadableKeys)[keyof typeof LoadableKeys];

export interface IAssetsState extends ILoadableState<LoadableKeys> {
  assets: IRawAsset[]
  qryResult: IQRYResult
  filter: Partial<IAssetsFilter>
  selectedAsset: ISelectedAsset
  midItems: IMidItem[]
}

export type AssetsState = Readonly<IAssetsState>;
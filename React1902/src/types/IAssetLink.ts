
import {BaseEntity} from './BaseEntity';
import {BACKEND_ASSET_ID, IAssetNodeDatum} from './IAssetNodeDatum';
import {IRawAuthEventReport} from './IAuthEventReport';
import {ILinkDatum} from './ILinkNodeDatum';
import {ILinkReport} from './ILinkReport';

export interface IAssetLink extends BaseEntity {
  assetA: string
  assetB: string
  authenticated: boolean
  id: string
  lastReport?: IRawAuthEventReport
  states: ILinkReport
}

export function isBackendAssetLink(link: IAssetLink): boolean {
  return (
    link.assetA === BACKEND_ASSET_ID ||
    link.assetB === BACKEND_ASSET_ID
  );
}

export function isEqualAssetLink(a: IAssetLink, b: IAssetLink): boolean {
  return (
    a.assetA === b.assetA &&
    a.assetB === b.assetB
  ) || (
    a.assetA === b.assetB &&
    a.assetB === b.assetA
  );
}

export function mapLinkDatumToAssetLink(link: ILinkDatum): IAssetLink {
  return {
    assetA: (link.source as IAssetNodeDatum).id,
    assetB: (link.target as IAssetNodeDatum).id,
    id: link.id,
    authenticated: link.authenticated,
    states: link.states,
  };
}

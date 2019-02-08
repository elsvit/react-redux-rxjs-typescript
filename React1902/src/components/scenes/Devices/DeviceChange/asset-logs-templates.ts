
import {AssetLogTypes} from '@io-app/types/IAssetLogLine';

export const TABLE_VIEW_ASSET_LOGS_TEMPLATES = {
  [AssetLogTypes.AUTH]: [
    {label: 'State', entityKey: 'statusStr', className: 'status is-2'},
    {label: 'Date & Time', entityKey: 'dateTime', className: 'is-2', valueClassName: 'list-row-value-md'},
    {label: 'Message', entityKey: 'message', className: 'is-8'},
  ],
  [AssetLogTypes.OPERATION]: [
    {label: 'Level', entityKey: 'statusStr', className: 'status is-2'},
    {label: 'Date & Time', entityKey: 'dateTime', className: 'is-2', valueClassName: 'list-row-value-md'},
    {label: 'Name', entityKey: 'name', className: 'status is-4'},
    {label: 'Measure', entityKey: 'measure', className: 'is-2'},
    {label: 'Value', entityKey: 'value', className: 'is-2'},
  ],
  [AssetLogTypes.EXCEPTION]: [
    {label: 'Type', entityKey: 'statusStr', className: 'status is-2'},
    {label: 'Date & Time', entityKey: 'dateTime', className: 'is-2', valueClassName: 'list-row-value-md'},
    {label: 'Message', entityKey: 'message', className: 'is-8'},
  ],
};

export const FULL_VIEW_ASSET_LOGS_TEMPLATES = {
  [AssetLogTypes.AUTH]: [
    {label: 'State', entityKey: 'statusStr', className: 'status is-4'},
    {label: 'Message', entityKey: 'message', className: 'is-8'},
  ],
  [AssetLogTypes.OPERATION]: [
    {label: 'Level', entityKey: 'statusStr', className: 'status is-4'},
    {label: 'Name', entityKey: 'name', className: 'status is-4'},
    {label: 'Measure', entityKey: 'measure', className: 'is-2'},
    {label: 'Value', entityKey: 'value', className: 'is-2'},
  ],
  [AssetLogTypes.EXCEPTION]: [
    {label: 'Type', entityKey: 'statusStr', className: 'status is-4'},
    {label: 'Message', entityKey: 'message', className: 'is-8'},
  ],
};
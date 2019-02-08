/**
 * @fileOverview Asset Row
 */

import Grid from '@material-ui/core/Grid';
import classNames from 'classnames';
import get from 'lodash-es/get';
import React, {ReactNode} from 'react';
import {Link} from 'react-router-dom';

import MidTooltip from '@io-app/components/common/MidTooltip';
import {assetUpdateStateMap, updateStateToColorMap} from '@io-app/types/AssetUpdateState';
import {IRawAsset} from '@io-app/types/IAsset';
import {getUIStatus} from '@io-app/types/IAssetStatus';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import {Circle} from '@io-ui/Icons';
import {DateTimeLabel} from '@io-ui/Layout/utils';

interface AssetRowProps {
  asset: IRawAsset
  className?: string
}

const BASE_ASSET_KEYS = ['inf', 'kv'];
const BASE_STR = STRING_RESOURCES.devices.asset_row;

const AssetStatus = ({label, value, color, date}: {label: string, value: string, color: string, date: Maybe<string>}) => (
  <Grid container={true}>
    <Grid item={true} className="list-row-label" xs={12} xl={4}>{`${label}:`}</Grid>
    <Grid item={true} xs={12} lg={6} xl={4}>
      <div className={'is-flex'}>
        <Circle nativeColor={color}/>
        <div className="list-row-value-sm">{value}</div>
      </div>
    </Grid>
    <Grid className="flex-self-center" item={true} xs={12} lg={6} xl={4}>
      {date && <DateTimeLabel className="flex-items-center" date={date}/>}
    </Grid>
  </Grid>
);

const InfoRow = ({label, value}: {label: string, value: string}) => (
  <Grid container={true} direction={'row'}>
    <Grid item={true} className="list-row-label" xs={5} md={4} xl={3}>{`${label}:`}</Grid>
    <Grid item={true} className="list-row-value-sm flex-1">
      {value == null || value === '' ? STRING_RESOURCES.common.not_available : value}
    </Grid>
  </Grid>
);

interface InfoRowProps {
  label: string
  value: string
  renderRow?: ({label, value}: {label: string, value: string}) => ReactNode
}

const AssetInfo = ({info}: {info: InfoRowProps[]}) => (
  <Grid container={true} direction={'column'}>
    {info.map(({label, value, renderRow}: InfoRowProps) => {
      return (renderRow == null)
        ? (<InfoRow key={label} label={label} value={value}/>)
        : renderRow({label, value});
    })}
  </Grid>
);

// todo: remove. we shouldn't calculate asset groups name for every row
const AssetGroup = ({group}: {group: {id: string, name: string}}) => (
  <Grid container={true}>
    <Grid item={true} className="list-row-label" xs={5} md={4} xl={3}>{BASE_STR.group}:</Grid>
    <Grid container={true} item={true} className="list-row-value-sm flex-1" direction={'column'}>
      <Link className={'link'} to={`/groups/edit/${group.id}`}>{group.name}</Link>
    </Grid>
  </Grid>
);

const AssetRow = ({asset, className}: AssetRowProps) => {
  const midValue = get(asset, [...BASE_ASSET_KEYS, 'MID'], '');
  const info = [
    {label: BASE_STR.hardware_id, value: get(asset, 'hardwareId', '')},
    {label: BASE_STR.serial, value: asset.serial || ''},
    {
      label: BASE_STR.mid,
      value: midValue,
      renderRow: ({label, value}: {label: string, value: string}) =>
        (<MidTooltip value={value} key={label}><InfoRow key={label} label={label} value={value}/></MidTooltip>),
    },
    {label: BASE_STR.model_id, value: get(asset, [...BASE_ASSET_KEYS, 'ModelId'], '')},
    {label: BASE_STR.model_name, value: get(asset, [...BASE_ASSET_KEYS, 'ModelName'], '')},
  ];
  const updateStatus = getUIStatus(asset, 'updateState', 'Update State', assetUpdateStateMap, updateStateToColorMap);
  return (
    <Grid container={true} className={classNames('asset-row', className)}>
      <Grid item={true} xs={12} md={3}>
        {asset.lastSeen && <DateTimeLabel date={asset.lastSeen}/>}
        <div className={'list-row-value-sm'}>{asset.name}</div>
      </Grid>
      <Grid item={true} xs={12} md={4} className={'statuses-block'}>
        <AssetStatus {...updateStatus} date={asset.lastStateModified}/>
      </Grid>
      <Grid item={true} xs={12} md={5}>
        <AssetInfo info={info}/>
      </Grid>
    </Grid>
  );
};

export default AssetRow;


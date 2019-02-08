/**
 * @fileOverview Asset Row Wrapper
 */

import React from 'react';

import {IRawAsset} from '@io-app/types/IAsset';
import {primary, slateGrey} from '@io-shared/shared.scss';
import Accordion from '@io-ui/Accordion';
import {ArrowDownThinIcon} from '@io-ui/Icons';
import {accordionPanelTheme} from '@io-ui/Themes';
import AssetRow from './AssetRow';

export interface IAssetRowProps {
  className?: string;
  asset: IRawAsset
  edit: (asset: IRawAsset) => void
}

const AssetRowWrapper = ({asset, edit}: IAssetRowProps) => {
  return (
    <Accordion
      content={[{
        heading: asset.name,
        item: (<AssetRow asset={asset}/>),
      }]}
      onHeadingClick={() => edit(asset)}
      theme={accordionPanelTheme}
      className="device-row"
      renderExpandIcon={(isExpanded: boolean) =>
        <ArrowDownThinIcon
          nativeColor={isExpanded ? primary : slateGrey}
          fillOpacity={isExpanded ? 1 : 0.87}
        />
      }
    />
  );
};

export default AssetRowWrapper;

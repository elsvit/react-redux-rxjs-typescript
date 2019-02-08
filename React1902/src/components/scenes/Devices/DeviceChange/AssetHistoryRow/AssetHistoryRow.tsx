/**
 * @fileOverview HistoryRow
 */

import MuiButton from '@material-ui/core/Button';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import classNames from 'classnames';
import React, {Component} from 'react';

import KVDictionaryView from '@io-app/components/common/KVDictionaryView';
import {IAssetHistory} from '@io-app/types/IAssetHistory';
import {IAssetTemplate} from '@io-app/types/IAssetTemplate';
import {mapBandsToHistoryDictionary} from '@io-app/types/IBands';
import {stopEvent} from '@io-app/utils/browser';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import {primary, slateGrey} from '@io-shared/shared.scss';
import {ArrowDownIcon} from '@io-ui/Icons';
import {DateTimeLabel} from '@io-ui/Layout/utils';
import {InfoButtonsTheme, accordionPanelTheme} from '@io-ui/Themes';

export interface IHistoryRowProps {
  className?: string;
  assetHistory: IAssetHistory
  apply: (assetHistory: IAssetHistory) => void
  assetTemplate: Maybe<IAssetTemplate>
}

export interface IHistoryRowState {
  isVisible: boolean,
}

class AssetHistoryRow extends Component<IHistoryRowProps, IHistoryRowState> {
  constructor(props: IHistoryRowProps) {
    super(props);
    this.state = {
      isVisible: false,
    };
  }

  public handleApply = stopEvent(() => {
    this.props.apply && this.props.apply(this.props.assetHistory);
  })
  ;

  public toggleVisibility = () => {
    this.setState({isVisible: !this.state.isVisible});
  }

  public render() {
    const {className, assetHistory, assetTemplate} = this.props;
    if (!assetHistory) {
      return null;
    }
    const {id, inf, provSpec, modified, bands} = assetHistory;
    const {isVisible} = this.state;
    const title = id ? `${id}` : '';
    const infoTemplate = assetTemplate ? assetTemplate.inf : null;
    const provSpecTemplate = assetTemplate ? assetTemplate.provSpec : null;
    const bandsTemplate = assetTemplate ? assetTemplate.bands : null;

    return (
      <div className={classNames('history-row-desktop', className)}>
        <div
          className="field-title-wrapper section-title"
          onClick={() => this.toggleVisibility()}
        >
          <div className="section-title">{title}</div>
          <MuiThemeProvider theme={accordionPanelTheme}>
            <ArrowDownIcon
              className={`field-title-arrow ${isVisible && 'rotate-180'}`}
              nativeColor={!isVisible ? slateGrey : primary}
              fillOpacity={!isVisible ? 1 : 0.87}
            />
          </MuiThemeProvider>
        </div>
        <div className="field-history-wrapper">
          <DateTimeLabel date={modified}/>

          <KVDictionaryView
            isToggled={!isVisible}
            title={STRING_RESOURCES.devices.info}
            dictionary={inf}
            template={infoTemplate}
          />

          {
            provSpec
              ? (
                <KVDictionaryView
                  isToggled={!isVisible}
                  title={STRING_RESOURCES.devices.ps}
                  dictionary={provSpec}
                  template={provSpecTemplate}
                />
              )
              : null
          }
          {
            bands
              ? (
                <KVDictionaryView
                  isToggled={!isVisible}
                  title={STRING_RESOURCES.devices.bands}
                  dictionary={mapBandsToHistoryDictionary(bands)}
                  template={bandsTemplate}
                />
              )
              : null
          }

          <MuiThemeProvider theme={InfoButtonsTheme}>
            <div className={'form-actions'}>
              <MuiButton
                onClick={this.handleApply}
                variant="contained"
                color={'primary'}
                disableRipple={true}
                disableFocusRipple={true}
                className={'single-action'}
              >
                {STRING_RESOURCES.actions.apply}
              </MuiButton>
            </div>
          </MuiThemeProvider>
        </div>
      </div>
    );
  }
}

export default AssetHistoryRow;


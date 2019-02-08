/**
 * @fileOverview DeviceChange
 */

import MuiButton from '@material-ui/core/Button';
import Grid, {GridSize} from '@material-ui/core/Grid';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import classNames from 'classnames';
import {FormikErrors, FormikProps, withFormik} from 'formik';
import isEmpty from 'lodash-es/isEmpty';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {createStructuredSelector} from 'reselect';
import {from, noop} from 'rxjs';
import {map, take} from 'rxjs/operators';

import {AppState} from '@io-app/redux/IAppState';
import {getMidItems} from '@io-app/redux/assets/reducer';
import {isDesktopMenuCollapsed} from '@io-app/redux/menu/reducer';
import {OpenModalAction} from '@io-app/redux/modal/actions';
import {getAssetTemplate} from '@io-app/redux/organizations/reducer';
import {AddToastAction} from '@io-app/redux/toasts/actions';
import {DEFAULT_ASSET, IAsset} from '@io-app/types/IAsset';
import {IAssetTemplate} from '@io-app/types/IAssetTemplate';
import {IRawAssetsGroup} from '@io-app/types/IAssetsGroup';
import {IMidItem} from '@io-app/types/IMidItem';
import {createErrorToast} from '@io-app/types/IToast';
import {stopEvent} from '@io-app/utils/browser';
import {toNumberValues, trimValues} from '@io-app/utils/forms';
import {ERROR_STRINGS, STRING_RESOURCES} from '@io-app/utils/string-resources';
import {FormActionsButtonsTheme} from '@io-ui/Themes/formActionsButtonsTheme';
import AssetForm from '../AssetForm/AssetForm';
import {ASSET_SCHEMA} from '../AssetForm/schema';

interface IOwnProps {
  className?: string
  disabled: boolean
  save: (a: IAsset) => void
  cancel: () => void
  asset: Maybe<IAsset>
  groups: IRawAssetsGroup[]
  title?: string
  renderActions?: () => Maybe<JSX.Element>
  renderStickyActions?: (hasError: boolean) => Maybe<JSX.Element>
  onChange?: (a: IAsset) => void
  isAdding?: boolean
}

interface IAssetChangeState {
  expandedAccordionIdx: number
}

interface IStateMap {
  assetTemplate: Maybe<IAssetTemplate>
  isDesktopMenuCollapsed: boolean
  midItems: IMidItem[]
}

interface IDispatchMap {
  addToast: typeof AddToastAction
  openModal: typeof OpenModalAction
}

type AssetChangeProps = IOwnProps & IDispatchMap & IStateMap & FormikProps<IAsset>;

class DeviceChange extends Component<AssetChangeProps, IAssetChangeState> {
  constructor(props: AssetChangeProps) {
    super(props);
    this.state = {
      expandedAccordionIdx: -1,
    };
  }

  public static schema = ASSET_SCHEMA;

  public save = stopEvent((e) => {
    from(this.props.validateForm())
      .pipe(
        map((errors: FormikErrors<IAsset>) => {
          this._showAccordionErrorToast(errors);
          const isValid = isEmpty(errors);
          if (isValid) {
            this.props.handleSubmit(e);
          }
        }),
        take(1),
      ).subscribe(noop);
  }, true);

  public onAccordionChange = (idx: number, isExpanded: boolean) => {
    this.setState({expandedAccordionIdx: isExpanded ? idx : -1});
  };

  public onAssetFormChange = (value: IAsset) => {
    this.props.setValues(value);
    this.props.onChange && this.props.onChange(value);
  }

  public componentDidUpdate(prevProps: AssetChangeProps) {
    const {asset, assetTemplate} = this.props;
    if ((asset != null && prevProps.asset == null)
      //todo it has to be removed
      || (asset != null && assetTemplate != null && prevProps.assetTemplate == null && this.props.isAdding)
    ) {
      this.props.setValues(asset);
      this.props.validateForm();
    }
  }

  public getPageGridSizes(): {[key: string]: GridSize} {
    return this.props.isDesktopMenuCollapsed
      ? {xs: 12, sm: 12, md: 10, lg: 6, xl: 5}
      : {xs: 12, sm: 12, md: 11, lg: 8, xl: 5};
  }

  public render() {
    if (!this.props.asset || !this.props.assetTemplate) {
      return null;
    }

    const {disabled, groups, errors} = this.props;
    return (
      <>
        <Grid container={true} className={classNames('asset-change', this.props.className)}>
          <Grid item={true} {...this.getPageGridSizes()} className="asset-form">
            <AssetForm
              asset={this.props.asset}
              groups={groups}
              assetTemplate={this.props.assetTemplate}
              onChange={this.onAssetFormChange}
              disabled={disabled}
              errors={errors}
              onAccordionChange={this.onAccordionChange}
              openModal={this.props.openModal}
              isAdding={this.props.isAdding}
              midItems={this.props.midItems}
            />
          </Grid>
          {this.props.renderActions && this.props.renderActions()}
        </Grid>
        <MuiThemeProvider theme={FormActionsButtonsTheme}>
          <Grid container={true} className="sticky-container sticky-footer">
            <Grid container={true} item={true} {...this.getPageGridSizes()}>
              <Grid item={true} xs={12} sm={4} md={3}>
                <MuiButton
                  onClick={this.props.cancel}
                  disabled={this.props.disabled}
                  variant="contained"
                  color={'secondary'}
                  disableRipple={true}
                  disableFocusRipple={true}
                  className="full-fill"
                >
                  {STRING_RESOURCES.actions.cancel}
                </MuiButton>
              </Grid>

              <Grid item={true} xs={12} sm={4} md={6}>
                {this.props.renderStickyActions && this.props.renderStickyActions(!isEmpty(errors))}
              </Grid>

              <Grid item={true} xs={12} sm={4} md={3}>
                <MuiButton
                  onClick={this.save}
                  disabled={!isEmpty(errors) || this.props.disabled}
                  variant="contained"
                  color={'primary'}
                  disableRipple={true}
                  disableFocusRipple={true}
                  className="full-fill"
                >
                  {STRING_RESOURCES.actions.save}
                </MuiButton>
              </Grid>
            </Grid>
          </Grid>
        </MuiThemeProvider>
      </>
    );
  }

  private _showAccordionErrorToast = (errors: FormikErrors<IAsset>) => {
    if (errors) {
      const {
        inf: isInfError,
        authTimeout,
        commitmentTimeout,
        handshakingTimeout,
        secretKeyExchangeTimeout,
        submitsCount,
      } = errors;

      const isTimeoutsError = Boolean(
        authTimeout ||
        commitmentTimeout ||
        handshakingTimeout ||
        secretKeyExchangeTimeout ||
        submitsCount,
      );
      // check Inf with error is hidden: Timeouts idx = 0, Inf idx = 1
      if (this.state.expandedAccordionIdx !== 0 && isTimeoutsError) {
        this.props.addToast(createErrorToast({message: ERROR_STRINGS.enter_correct_timeouts}));
      }
      if (this.state.expandedAccordionIdx !== 1 && isInfError) {
        this.props.addToast(createErrorToast({message: ERROR_STRINGS.enter_correct_info}));
      }
    }
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  assetTemplate: getAssetTemplate,
  isDesktopMenuCollapsed,
  midItems: getMidItems,
});

const mapDispatchToProps: IDispatchMap = {
  addToast: AddToastAction,
  openModal: OpenModalAction,
};

export default compose<AssetChangeProps, IOwnProps>(
  connect<IStateMap, IDispatchMap>(mapStateToProps, mapDispatchToProps),
  withFormik<IOwnProps, IAsset>({
    mapPropsToValues({asset}: IOwnProps) {
      return asset || DEFAULT_ASSET;
    },
    validationSchema: DeviceChange.schema,
    handleSubmit(
      values: IAsset,
      {props}: {props: IOwnProps},
    ) {
      let data = trimValues(values, ['name', 'description', 'hardwareId', 'serial']);
      data = toNumberValues(data, ['proxyWeight']);
      props.save(data);
    },
  }),
)(DeviceChange);
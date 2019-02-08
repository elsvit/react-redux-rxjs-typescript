/** @fileOverview Asset Form */

import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import {FormikErrors} from 'formik';
import {keyBy, mapValues} from 'lodash-es';
import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';

import ConfigurationForm, {
  IConfigurationSection,
} from '@io-app/components/common/ConfigurationForm';
import {OpenModalAction} from '@io-app/redux/modal/actions';
import {appTypeOptions} from '@io-app/types/AppType';
import {IAsset, TIMEOUTS_KEYS} from '@io-app/types/IAsset';
import {getAssetUIStatuses} from '@io-app/types/IAssetStatus';
import {IAssetTemplate} from '@io-app/types/IAssetTemplate';
import {IRawAssetsGroup} from '@io-app/types/IAssetsGroup';
import {IBands} from '@io-app/types/IBands';
import {IMidItem} from '@io-app/types/IMidItem';
import {IOption, findOption} from '@io-app/types/IOption';
import {UpdateType} from '@io-app/types/IUpdateScope';

import {stopEvent} from '@io-app/utils/browser';
import {getErrorHelperTextByKey, hasErrorByKey} from '@io-app/utils/forms';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import {primary, slateGrey} from '@io-shared/shared.scss';
import Accordion from '@io-ui/Accordion';
import IOSelect from '@io-ui/IOSelect';
import {ArrowDownIcon, Circle} from '@io-ui/Icons';
import {DateTimeLabel} from '@io-ui/Layout/utils';
import {accordionPanelTransparentTheme} from '@io-ui/Themes';
import BandsEditor from './BandsEditor';
import KVBlockEditor from './KVBlockEditor/KVBlockEditor';
import {PROVSPEC_SCHEMA, TIMEOUTS_SCHEMA} from './schema';

interface IAssetFormProps {
  isAdding?: boolean
  asset: IAsset
  groups: IRawAssetsGroup[]
  assetTemplate: Maybe<IAssetTemplate>
  onChange: (value: IAsset) => void
  disabled: boolean
  errors: FormikErrors<IAsset>
  onAccordionChange: (idx: number, isExpanded: boolean) => void
  openModal: typeof OpenModalAction
  midItems: IMidItem[]
}

export interface IAssetFormState {
  value: IAsset
}

class AssetForm extends Component<IAssetFormProps, IAssetFormState> {
  constructor(props: IAssetFormProps) {
    super(props);
    this.state = {
      value: {bands: [{}, {}, {}], ...this.props.asset},
    };
  }

  public onInputChange = stopEvent((e) => {
    const newState = {
      ...this.state,
      value: {...this.state.value, [e.target.name]: e.target.value},
    };
    this.setState(newState);
    this.props.onChange(newState.value);
  });

  public onInputNumberChange = stopEvent((e) => {
    const newState = {
      ...this.state,
      value: {...this.state.value, [e.target.name]: e.target.value === '' ? e.target.value : +e.target.value},
    };
    this.setState(newState);
    this.props.onChange(newState.value);
  });

  public static getDerivedStateFromProps(nextProps: IAssetFormProps, prevState: IAssetFormState) {
    const shouldUpdateAsset = ((nextProps.asset as IAsset).id !== (prevState.value as IAsset).id);
    return shouldUpdateAsset ? {value: nextProps.asset} : null;
  }

  public updateValueAndThrowOnChange = (value: any, key: string) => {
    this.setState({value: {...this.state.value, [key]: value}}, () => this.props.onChange(this.state.value));
  }

  public onSelectChange = (selectedOption: IOption) => {
    const {value} = this.state;
    const currentValueApp = value.app;
    if (currentValueApp !== selectedOption.value) {
      this.setState({
        value: {...value, app: selectedOption.value },
      }, () => this.props.onChange(this.state.value));
    }
  }

  public onConfigurationChange<T = Partial<IAsset>>(configuration: Partial<IAsset>): void {
    const timeouts = mapValues(keyBy(configuration[0].fields, 'fieldKey'), field => field.value);
    const newState = {
      ...this.state,
      value: {...this.state.value, ...timeouts},
    };
    this.setState(newState);
    this.props.onChange(newState.value);
  }

  public renderAssetConfigurationAccordion = () => {
    const value = this.state.value as IAsset;
    const {errors, disabled, isAdding} = this.props;
    if (!value) {
      return;
    }

    const assetTemplate = this.props.assetTemplate;
    const infoTemplate = assetTemplate ? assetTemplate.inf : null;
    const bands = value.bands || [];
    const readonlyFields = isAdding ? [] : ['MID'];

    const info = (
      <KVBlockEditor
        title={STRING_RESOURCES.devices.info}
        template={infoTemplate}
        value={value.inf}
        errors={errors.inf}
        onChange={(v) => this.updateValueAndThrowOnChange(v, 'inf')}
        readonlyFields={readonlyFields}
        midItems={this.props.midItems}
      />
    );

    const timeoutsSections: IConfigurationSection[] = [{
      sectionKey: 'timeouts',
      isRootSection: true,
      fields:  TIMEOUTS_KEYS.map((fieldKey) => ({
        fieldKey,
        label: STRING_RESOURCES.controls[fieldKey].label,
        type: 'number',
        inputProps: {min: 1},
        name: fieldKey,
        value: this.state.value[fieldKey],
        updateType: UpdateType.ADD_UPDATE,
      })),
    }];
    const timeoutsInputs = (
      <ConfigurationForm
        sections={timeoutsSections}
        isActionable={false}
        disabled={this.props.disabled}
        onChange={(values) => this.onConfigurationChange(values)}
        validationSchema={TIMEOUTS_SCHEMA}
      />
    );

    const provSpecSections: IConfigurationSection[] = [{
      sectionKey: 'provSpec',
      isRootSection: true,
      fields: [{
        fieldKey: 'provSpec',
        type: 'provSpec',
        value: this.state.value.provSpec,
        // value: this.props.asset.provSpec,
        updateType: UpdateType.ADD_UPDATE,
      }],
    }];

    const provSpec = (
      <ConfigurationForm
        sections={provSpecSections}
        isActionable={false}
        disabled={this.props.disabled}
        onChange={(values) => this.onConfigurationChange(values)}
        validationSchema={PROVSPEC_SCHEMA}
      />
    );

    const bandsSection = (
      <BandsEditor
        bands={bands}
        onChange={(v: IBands) => this.updateValueAndThrowOnChange(v, 'bands')}
        errors={errors.bands}
      />
    );

    const sectionItems = [
      {heading: STRING_RESOURCES.devices.info_section_title, item: info, classes: {heading: 'accordion-heading'}},
      {heading: STRING_RESOURCES.devices.timeouts_section_title, item: timeoutsInputs, classes: {heading: 'accordion-heading'}},
      {heading: STRING_RESOURCES.devices.provspec_section_title, item: provSpec, classes: {heading: 'accordion-heading '}},
      {heading: STRING_RESOURCES.devices.bands_section_title, item: bandsSection, classes: {heading: 'accordion-heading'}},
    ];

    return (
      <Accordion
        content={sectionItems}
        theme={accordionPanelTransparentTheme}
        renderExpandIcon={(isExpanded: boolean) =>
          <ArrowDownIcon
            nativeColor={isExpanded ? primary : slateGrey}
            fillOpacity={isExpanded ? 1 : 0.87}
          />
        }
        onAccordionChange={this.props.onAccordionChange}
      />
    );
  }

  public renderAssetInfo = () => {
    const value = this.state.value as IAsset;
    if (!value) {
      return;
    }

    const {asset, isAdding} = this.props;
    if (isAdding) {
      return;
    }

    const integrationId = asset.uid || '';
    const assetStatus = getAssetUIStatuses(this.props.asset);
    return (
      <>
        <Tooltip title={STRING_RESOURCES.devices.hardware_id_vendor_id_customer_id}>
          <div className="integration-id">
            {`${STRING_RESOURCES.devices.UID}: `}
            <span className="ellipsis">
              {integrationId}
            </span>
          </div>
        </Tooltip>
        <div className="section with-border-bottom">
          <div className="flex-row flex-justify-between flex-wrap">
            <div className="flex-column min-width-125">
              <div>
                <div className="section-title">{assetStatus.updateStatus.label}</div>
                <div className="section-data ellipsis">
                  <div className={'flex-row'}>
                    <Circle nativeColor={assetStatus.updateStatus.color} />
                    <span className="list-row-value-sm">{assetStatus.updateStatus.value}</span>
                  </div>
                </div>
                <div className="section-data ellipsis max-width-160">
                  {value.lastStateModified && <DateTimeLabel date={value.lastStateModified}/>}
                </div>
              </div>
            </div>
            <div className="flex-column min-width-125">
              <div className="section-title">{STRING_RESOURCES.controls.last_seen.label}</div>
              <div className="section-data ellipsis max-width-160">
                <DateTimeLabel date={value.lastSeen}/>
              </div>
            </div>
            <div className="flex-column min-width-125">
              <div className="section-title">{STRING_RESOURCES.controls.serial.label}</div>
              <div className="section-data ellipsis max-width-160">{asset.serial}</div>
            </div>
            <div className="flex-column min-width-125">
              <div className="section-title">{STRING_RESOURCES.controls.hardwareId.label}</div>
              <div className="section-data ellipsis max-width-160">{asset.hardwareId}</div>
            </div>
          </div>
        </div>
        {
          this.props.groups.length === 0
            ? null
            : (
              <div className="section with-border-bottom">
                <div className="section-title">{STRING_RESOURCES.controls.groups.label}</div>
                {this.props.groups.map(({id, name}: IRawAssetsGroup) => (
                  <NavLink to={`/groups/edit/${id}`} className="brown" key={id}>{name}</NavLink>
                ))}
              </div>
            )
        }
      </>
    );
  }

  public render() {
    const {value} = this.state;
    const {errors} = this.props;
    if (!value) {
      return;
    }
    const {disabled, isAdding} = this.props;

    const hasNameError = hasErrorByKey(errors, 'name');
    const hasDescriptionError = hasErrorByKey(errors, 'description');
    const hasWeightOfProxyError = hasErrorByKey(errors, 'proxyWeight');
    const hasHardwareIdError = hasErrorByKey(errors, 'hardwareId');
    const hasSerialError = hasErrorByKey(errors, 'serial');
    return (
      <>
        {this.renderAssetInfo()}
        <div className="section">

          <div className={'is-paddingless'}>
            <p className={'control-label'}>{STRING_RESOURCES.devices.device_type}</p>
            <IOSelect
              options={appTypeOptions}
              value={findOption(appTypeOptions, value.app)}
              onChange={(t: IOption<string>) => this.onSelectChange(t)}
              isClearable={true}
            />
          </div>

          <div className="form-control">
            <TextField
              InputLabelProps={{shrink: true}}
              label={STRING_RESOURCES.controls.name.label}
              type="text"
              name="name"
              value={this.state.value.name || ''}
              onChange={this.onInputChange}
              className={classNames({invalid: hasNameError})}
              error={hasNameError}
              helperText={getErrorHelperTextByKey(errors, 'name')}
            />
          </div>

          <div className="form-control">
            <TextField
              InputLabelProps={{shrink: true}}
              label={STRING_RESOURCES.controls.description.label}
              name="description"
              value={value.description || ''}
              onChange={this.onInputChange}
              multiline={true}
              error={hasDescriptionError}
              helperText={getErrorHelperTextByKey(errors, 'description')}
            />
          </div>

          <div className="form-control">
            <TextField
              InputLabelProps={{shrink: true}}
              label={STRING_RESOURCES.controls.proxyWeight.label}
              type="number"
              name="proxyWeight"
              value={value.proxyWeight == null ? '' : value.proxyWeight}
              onChange={this.onInputNumberChange}
              className={classNames({invalid: hasWeightOfProxyError})}
              error={hasWeightOfProxyError}
              helperText={getErrorHelperTextByKey(errors, 'proxyWeight')}
            />
          </div>

          {
            isAdding && (
              <>
                <div className="form-control">
                  <TextField
                    InputLabelProps={{shrink: true}}
                    label={STRING_RESOURCES.controls.hardwareId.label}
                    type="text"
                    name="hardwareId"
                    value={this.state.value.hardwareId || ''}
                    onChange={this.onInputChange}
                    className={classNames({invalid: hasHardwareIdError})}
                    error={hasHardwareIdError}
                    helperText={getErrorHelperTextByKey(errors, 'hardwareId')}
                  />
                </div>
                <div className="form-control">
                  <TextField
                    InputLabelProps={{shrink: true}}
                    label={STRING_RESOURCES.controls.serial.label}
                    type="text"
                    name="serial"
                    value={this.state.value.serial || ''}
                    onChange={this.onInputChange}
                    className={classNames({invalid: hasSerialError})}
                    error={hasSerialError}
                    helperText={getErrorHelperTextByKey(errors, 'serial')}
                  />
                </div>
              </>
            )
          }
        </div>

        {this.renderAssetConfigurationAccordion()}
      </>
    );
  }
}

export default AssetForm;

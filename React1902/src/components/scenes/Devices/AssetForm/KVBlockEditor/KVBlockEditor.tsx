/**
 * @fileOverview KVDictionary editor
 */

import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import {FormikErrors} from 'formik';
import find from 'lodash-es/find';
import includes from 'lodash-es/includes';
import keys from 'lodash-es/keys';
import React, {ChangeEvent, Component} from 'react';

import {IKVDictionary} from '@io-app/types/IKVDictionary';
import {IMidItem} from '@io-app/types/IMidItem';
import {IOption} from '@io-app/types/IOption';
import {stopEvent} from '@io-app/utils/browser';
import {notEmpty} from '@io-app/utils/common';
import {getErrorHelperTextByKey, hasErrorByKey} from '@io-app/utils/forms';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import IOCreatableSelectComponent from '@io-ui/IOCreatebleSelect/IOCreatableSelectComponent';
import {RowField} from '@io-ui/Layout/utils';
import {baseTheme} from '@io-ui/Themes/baseTheme';

export interface IEditorProps {
  template: Maybe<IKVDictionary>
  onChange: (value: IKVDictionary) => void
  value?: IKVDictionary
  errors?: FormikErrors<IKVDictionary>
  title: string
  inputType?: string
  readonlyFields?: string[]
  midItems?: IMidItem[]
}

export interface IEditorState {
  value: IKVDictionary
}

class KVBlockEditor extends Component<IEditorProps, IEditorState> {
  constructor(props: IEditorProps) {
    super(props);
    this.state = {
      value: props.value ? props.value : {kv: {}},
    };
  }

  public onChangeInput = stopEvent((e: ChangeEvent<HTMLInputElement>) =>
    this._updateStateAndThrowOnchange(e.target.name, e.target.value.trim()));

  public renderInput = ({fieldKey}: {fieldKey: string}) => {
    const {errors} = this.props;
    const errorsKv = errors && errors.kv;
    return (
      <TextField
        InputLabelProps={{shrink: true}}
        label={`${fieldKey}`}
        type={'text'}
        name={`${fieldKey}`}
        value={(this.props.value || {kv: {}}).kv[fieldKey] || ''}
        onChange={this.onChangeInput}
        error={errorsKv && hasErrorByKey(errorsKv, fieldKey)}
        helperText={errorsKv && getErrorHelperTextByKey(errorsKv, fieldKey)}
      />
    );
  }

  public renderTextarea = ({fieldKey}: {fieldKey: string}) => (
    <TextField
      InputLabelProps={{shrink: true}}
      label={fieldKey}
      name={`${fieldKey}`}
      value={(this.props.value || {kv: {}}).kv[fieldKey] || ''}
      onChange={this.onChangeInput}
      multiline={true}
    />
  )

  public renderMidWithTooltip = () => {
    const id = (this.props.value || {kv: {}}).kv.MID || '';
    const midObject = id ? find(this.props.midItems, ['id', id]) : null;
    const tooltipTitle = midObject ? `${midObject.description}: ${midObject.name}` : id;
    return (
      <Tooltip title={tooltipTitle} key={'MID-readonly'} placement="bottom-start">
        <div className="tooltip-content-wrapper">
          <RowField
            label={`${'MID'}: `}
            value={(this.props.value || {kv: {}}).kv.MID || ''}
            className="readonly-field is-paddingless"
            labelClassName="row-field-label flex-center"
            isHorizontal={true}
          />
        </div>
      </Tooltip>
    );
  }

  public renderReadonlyField = ({fieldKey}: {fieldKey: string}) =>
    fieldKey === 'MID' ? this.renderMidWithTooltip() : (
      <RowField
        key={fieldKey + '-readonly'}
        label={`${fieldKey}: `}
        value={(this.props.value || {kv: {}}).kv[fieldKey] || ''}
        className="readonly-field is-paddingless"
        labelClassName="row-field-label flex-center"
        isHorizontal={true}
      />
    )

  public onMIDSelectChange = (o: Maybe<IOption<string> | string>) => this.onChangeSelect(o, 'MID');

  public onChangeSelect = (option: Maybe<IOption<string> | string>, fieldKey: string) => {
    const o = option as Maybe<IOption>;
    if (o && o.value == null) {
      return;
    }
    if (typeof o === 'object') {
      return this._updateStateAndThrowOnchange(fieldKey, o ? o.value : '');
    }
  }

  public renderMidSelector = (readonlyFields: string[], templateKeys: string[]) => {
    if (this.props.midItems && !includes(readonlyFields, 'MID') && includes(templateKeys, 'MID')) {
      return (
        <IOCreatableSelectComponent
          options={this.props.midItems.map((m: IMidItem) => this._formatOption(m.id))}
          value={(this.props.value && this._formatOption(this.props.value.kv.MID) || this._formatOption(''))}
          onChange={this.onMIDSelectChange}
          onInputChange={this.onMIDSelectChange}
          isClearable={true}
          placeholder={STRING_RESOURCES.controls.mid.placeholder}
          label={STRING_RESOURCES.controls.mid.label}
          key={STRING_RESOURCES.controls.mid.label}
        />
      );
    }
    return null;
  };

  public render() {
    const readonlyFields = this.props.readonlyFields || [];
    const templateKeys = (this.props.template ? keys(this.props.template.kv) : [])
      .filter((key) => !readonlyFields.includes(key));
    const {mid} = STRING_RESOURCES.controls;
    return (
      <MuiThemeProvider theme={baseTheme}>
        <form className={'kv-block-editor'}>
          {this.renderMidSelector(readonlyFields, templateKeys)}
          {readonlyFields.map((fieldKey: string) => this.renderReadonlyField({fieldKey}))}
          {templateKeys.map((fieldKey: string) => {
            return fieldKey !== mid.label && (
              <div key={fieldKey} className="form-control">
                {
                  this.props.inputType && this.props.inputType === 'textarea'
                    ? this.renderTextarea({fieldKey})
                    : this.renderInput({fieldKey})
                }
              </div>
            );
          })}
        </form>
      </MuiThemeProvider>
    );
  }

  private _updateStateAndThrowOnchange(fieldKey: string, fieldValue: string) {
    const kvUpdate = {...this.state.value.kv, [fieldKey]: fieldValue};
    const stateUpdate = {...this.state, value: {...this.state.value, kv: kvUpdate}};
    this.setState(stateUpdate, () => this.props.onChange(this.state.value));
  }

  private _formatOption(id: string) {
    const newMID = {id, description: id, name: id, group: id};
    const rawMID = notEmpty(id) ? (find(this.props.midItems, ['id', id]) || newMID) : newMID;
    return {
      data: 'MID',
      value: rawMID.id,
      label: rawMID.description || rawMID.id,
    } as IOption<string> | string;
  }
}

export default KVBlockEditor;

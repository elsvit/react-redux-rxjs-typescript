/**
 * @fileOverview Configuration Form
 */

import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import {Theme} from '@material-ui/core/styles/createMuiTheme';
import classNames from 'classnames';
import {Formik, FormikProps} from 'formik';
import size from 'lodash-es/size';
import React, {Component} from 'react';

import ProvSpecEditor from '@io-app/components/common/ProvSpecEditor';
import {DEFAULT_PROVSPEC, IProvSpec} from '@io-app/types/IProvSpec';
import {UpdateType} from '@io-app/types/IUpdateScope';
import {removeEntityFromArray, updateEntityInArray} from '@io-app/utils/array';
import {notEmpty} from '@io-app/utils/common';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import {primary, slateGrey} from '@io-shared/shared.scss';
import Accordion from '@io-ui/Accordion';
import Checkbox from '@io-ui/Checkbox';
import {ArrowDownIcon} from '@io-ui/Icons';
import {accordionPanelTransparentTheme, baseTheme} from '@io-ui/Themes';
import {ConfigurationFieldType, IConfigurationField, IConfigurationSection} from './IConfigurationSection';
import {CONFIG_SCHEMA} from './default-schema';

interface IConfigurationFormProps<T = any> {
  className?: string
  isActionable?: boolean
  disabled?: boolean
  sections: IConfigurationSection[]
  mapValues?: (sections: IConfigurationSection[]) => T
  onChange?: (values: IConfigurationSection[] | T) => void
  onSubmit?: (values: IConfigurationSection[] | T) => void
  onConfigAccordionChange?: (idx: number, isExpanded: boolean) => void
  validationSchema?: any
  theme?: Theme
}

type GetFieldUpdateFn = (oldFields: IConfigurationField<ConfigurationFieldType>[]) => IConfigurationField<ConfigurationFieldType>[];

export type ConfigurationFormProps = IConfigurationFormProps & FormikProps<IConfigurationSection[]>;

class ConfigurationForm extends Component<ConfigurationFormProps> {
  constructor(props: ConfigurationFormProps) {
    super(props);
  }

  public handleTextFieldChange = (value: string,
                                  sectionKey: string,
                                  field: IConfigurationField<string | number>) => {
    const val = notEmpty(value) ? (field.type === 'number' ? +value : value) : '';
    this._updateField(sectionKey, {...field, value: val});
  };

  public removeField = (sectionKey: string, fieldKey: string) => {
    this._removeField(sectionKey, fieldKey);
  };

  public toggleCheckbox = (sectionKey: string, field: IConfigurationField<ConfigurationFieldType>) => {
    const updateType = field.updateType === UpdateType.ADD_UPDATE
      ? UpdateType.ONLY_ADD
      : UpdateType.ADD_UPDATE;

    const fieldUpdate = {...field, updateType};

    this._updateField(sectionKey, fieldUpdate);
  };

  public handleProvSpecChange = (provSpec: IProvSpec, sectionKey: string, field: IConfigurationField<IProvSpec>) => {
    this._updateField(sectionKey, {...field, value: provSpec});
  };

  public renderInputField = (fieldKey: string, sectionKey: string, error: string) => {
    const field = this._getFieldByKeys(fieldKey, sectionKey) as IConfigurationField<string | number>;
    if (field == null) {
      return null;
    }
    const value = typeof field.value === 'string' || typeof field.value === 'number' ? field.value : '';
    const {updateType, fieldKey: fK, ...fieldProps} = field;
    const inputProps = this.props.isActionable ? {
      endAdornment: (
        <Tooltip title={STRING_RESOURCES.actions.remove_with_name(field.label as string || '')}>
          <button
            aria-label={'remove'}
            onClick={() => this.removeField(sectionKey, fieldKey)}
            className="io-icon delete"
          />
        </Tooltip>
      ),
      startAdornment: (
        <Tooltip title={STRING_RESOURCES.update_type.override_existing}>
          <Checkbox
            checked={updateType === UpdateType.ADD_UPDATE}
            onClick={() => this.toggleCheckbox(sectionKey, field)}
          />
        </Tooltip>
      ),
    } : {};

    return (
      <MuiThemeProvider theme={this.props.theme ? this.props.theme : baseTheme} key={fieldKey}>
        <div className="form-control flex-row">
          <TextField
            InputProps={inputProps}
            InputLabelProps={{shrink: true}}
            type={field.type}
            onChange={(e) => this.handleTextFieldChange(e.target.value, sectionKey, field)}
            disabled={this.props.disabled}
            {...fieldProps}
            value={value}
            className={classNames({invalid: Boolean(error)})}
            error={Boolean(error)}
            helperText={error}
          />
        </div>
      </MuiThemeProvider>
    );
  };

  public renderProvSpecField = (fieldKey: string, sectionKey: string, error: string) => {
    const field = this._getFieldByKeys(fieldKey, sectionKey) as IConfigurationField<IProvSpec>;
    if (field == null) {
      return null;
    }

    return (
      <ProvSpecEditor
        theme={this.props.theme}
        key={field.fieldKey}
        provSpec={field.value || DEFAULT_PROVSPEC}
        onChange={(val) => this.handleProvSpecChange(val, sectionKey, field)}
        isActionable={this.props.isActionable}
      />
    );
  };

  public renderSection = ({fields, sectionKey}: IConfigurationSection, sectionErrors: {[fieldKey: string]: string}) => {
    return (
      <>
        {fields.filter(({updateType}) => updateType !== UpdateType.SKIP).map((field) => {
          const error = sectionErrors && sectionErrors[field.fieldKey];
          switch (field.type) {
            case 'provSpec':
              return this.renderProvSpecField(field.fieldKey, sectionKey, error);
            case 'text':
            case 'number':
              return this.renderInputField(field.fieldKey, sectionKey, error);
            default:
              return null;
          }
        })}
      </>
    );
  };

  public render() {
    const {errors, sections} = this.props;
    if (!size(sections)) {
      return null;
    }

    const accordionSectionItems = sections.filter(s => !s.isRootSection).map((section: IConfigurationSection) => {
      const sectionErrors = errors[section.sectionKey];
      return {
        heading: section.name || '',
        item: this.renderSection(section, sectionErrors),
        classes: {heading: 'accordion-heading'},
      };
    });
    const hasAccordionSections = size(accordionSectionItems);

    const rootSectionItems = sections.filter(s => s.isRootSection).map((section: IConfigurationSection) => {
      const sectionErrors = errors[section.sectionKey];
      return {
        heading: section.name || '',
        item: this.renderSection(section, sectionErrors),
        classes: {heading: 'accordion-heading'},
      };
    });
    const hasRootSections = size(rootSectionItems);

    return (
      <form className={classNames(this.props.className, 'configuration-form')}>
        { hasRootSections ?
          <>
            {
              rootSectionItems.map((s, idx) => (
                <div key={idx}>
                  {s.item}
                </div>
              ))
            }
          </> : null
        }

        { hasAccordionSections ?
          <div className={'with-border-bottom'}>
            <Accordion
              content={accordionSectionItems}
              theme={accordionPanelTransparentTheme}
              renderExpandIcon={(isExpanded: boolean) =>
                <ArrowDownIcon
                  nativeColor={isExpanded ? primary : slateGrey}
                  fillOpacity={isExpanded ? 1 : 0.87}
                />
              }
              onAccordionChange={this.props.onConfigAccordionChange}
              defaultExpandedIdx={0}
            />
          </div> : null
        }
      </form>
    );
  }

  private _removeField(sectionKey: string, fieldKey: string) {
    this._updateSectionFields(sectionKey, (fields) => removeEntityFromArray(fields, fieldKey, 'fieldKey'));
  }

  private _updateField(sectionKey: string, fieldUpdate: IConfigurationField<ConfigurationFieldType>) {
    const getFieldsUpdate: GetFieldUpdateFn = (fields) => updateEntityInArray(fields, fieldUpdate, 'fieldKey');
    this._updateSectionFields(sectionKey, getFieldsUpdate);
  }

  private _updateSectionFields(sectionKey: string,
                               getFieldsUpdate: GetFieldUpdateFn) {
    const oldSection  = this.props.values.find((s) => s.sectionKey === sectionKey);
    if (oldSection == null) {
      return;
    }

    const sectionUpdate = {...oldSection, fields: getFieldsUpdate(oldSection.fields)};
    const sectionsUpdate = updateEntityInArray(this.props.values, sectionUpdate, 'sectionKey');

    this.props.setValues(sectionsUpdate);
    this.props.onChange && this.props.onChange(this.props.mapValues ? this.props.mapValues(sectionsUpdate) : sectionsUpdate);
  }

  private _getFieldByKeys = (fieldKey: string, sectionKey: string) => {
    const section = this.props.values.find((section) => sectionKey === section.sectionKey);
    if (section == null) {
      return null;
    }
    return section.fields.find((f) => f.fieldKey === fieldKey);
  }
}

export default React.forwardRef((props: IConfigurationFormProps, ref: any) => (
  <Formik
    ref={ref}
    initialValues={props.sections}
    validationSchema={props.validationSchema || CONFIG_SCHEMA}
    onSubmit={(values: IConfigurationSection[]) => {
      props.onSubmit && props.onSubmit(props.mapValues ? props.mapValues(values) : values);
    }}
    render={(formikProps) => <ConfigurationForm {...props} {...formikProps} />}
    validateOnChange={true}
    enableReinitialize={true}
  />
));

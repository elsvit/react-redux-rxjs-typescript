import {TextFieldProps} from '@material-ui/core/TextField';

import {IProvSpec} from '@io-app/types/IProvSpec';
import {UpdateType} from '@io-app/types/IUpdateScope';

export type ConfigurationFieldType = number | string | IProvSpec;

interface ConfigurationFieldProps extends TextFieldProps {
  value?: any
}

export interface IConfigurationField<T> extends ConfigurationFieldProps {
  updateType: UpdateType
  fieldKey: string
  value?: T
}

export interface IConfigurationSection {
  name?: string
  isRootSection?: boolean
  sectionKey: string
  fields: IConfigurationField<ConfigurationFieldType>[]
}

export interface FieldErrors {
  [fieldKey: string]: string
}

export interface SectionErrors {
  [sectionKey: string]: FieldErrors
}

/**
 * @fileOverview CronEditor
 */

import FormLabel from '@material-ui/core/FormLabel';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import TextField from '@material-ui/core/TextField/TextField';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import React, {ChangeEvent, Component} from 'react';
import CronBuilder from 'react-cron-builder';
import {connect} from 'react-redux';

import {AddToastAction} from '@io-app/redux/toasts/actions';
import {IProvSpecField, PROV_SPEC_SECTION_SEPARATAROR} from '@io-app/types/IProvSpec';
import {createErrorToast} from '@io-app/types/IToast';
import {UpdateType} from '@io-app/types/IUpdateScope';
import {ERROR_STRINGS, STRING_RESOURCES} from '@io-app/utils/string-resources';
import {darkGrey54} from '@io-shared/shared.scss';
import Checkbox from '@io-ui/Checkbox';
import {EditIcon} from '@io-ui/Icons';
import './styles.scss';

export interface IOwnProps {
  field: IProvSpecField
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  removeField: (name: string) => void
  isActionable?: boolean
  toggleUpdateType?: (fieldKey: string) => void
}

interface IDispatchMap {
  addToast: typeof AddToastAction
}

type ICronEditorProps = IOwnProps & IDispatchMap;

interface ICronEditorState {
  isEditing: boolean
}

class CronEditor extends Component<ICronEditorProps, ICronEditorState> {
  constructor(props: ICronEditorProps) {
    super(props);
    this.state = {isEditing: false};
  }

  public toggleIsEditing = () => {
    this.setState({isEditing: !this.state.isEditing});
  }

  public onChange = (cron: string) => {
    const isNullInside = cron.includes('null');
    if (!isNullInside) {
      this.props.onChange({
        target: {
          name: this.props.field.name,
          value: cron,
        },
      } as ChangeEvent<HTMLInputElement>);
      this.toggleIsEditing();
    } else {
      this.props.addToast(createErrorToast({message: ERROR_STRINGS.enter_schedule_parameters}));
    }
  }

  public render() {
    const {name, value, updateType} = this.props.field;
    const inputProps = {
      classes: {input: 'provspec-edit__field-input'},
      endAdornment: (
        <InputAdornment position="start" classes={{root: 'provspec-edit__field-adornment'}}>
          <Tooltip title={STRING_RESOURCES.prov_spec_editor.edit_cron_expression}>
            <EditIcon className="cursor-pointer" nativeColor={darkGrey54} onClick={this.toggleIsEditing}/>
          </Tooltip>
          <Tooltip title={STRING_RESOURCES.actions.remove_with_name(name)}>
            <button
              aria-label={name}
              onClick={() => this.props.removeField(name)}
              className="io-icon delete"
            />
          </Tooltip>
        </InputAdornment>
      ),
      startAdornment: this.props.isActionable && this.props.toggleUpdateType != null ? (
        <Tooltip title={STRING_RESOURCES.update_type.override_existing}>
          <Checkbox
            checked={updateType === UpdateType.ADD_UPDATE}
            onClick={() => this.props.toggleUpdateType && this.props.toggleUpdateType(name)}
          />
        </Tooltip>
      ) : null,
    };
    return (
      <div className="cron-builder-row">
        {this.state.isEditing
          ? (<>
              <FormLabel>{name}</FormLabel>
              <CronBuilder
                cronExpression={value || '* * * * *'}
                onChange={this.onChange}
                showResult={false}
              />
            </>)
          : (<>
              <TextField
                InputLabelProps={{
                  shrink: true,
                  classes: {root: 'ellipsis max-width-500'},
                }}
                error={value.includes(PROV_SPEC_SECTION_SEPARATAROR)}
                label={name}
                placeholder={name}
                name={name}
                value={value || ''}
                onChange={this.props.onChange}
                InputProps={inputProps}
              />
            </>)
        }
      </div>
    );
  }
}

const mapDispatchToProps: IDispatchMap = {
  addToast: AddToastAction,
};

export default connect(null, mapDispatchToProps)(CronEditor);
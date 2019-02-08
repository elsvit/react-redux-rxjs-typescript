/**
 * @fileOverview
 */

import TextField from '@material-ui/core/TextField';
import classNames from 'classnames';
import {Formik, FormikProps} from 'formik';
import React, {Component} from 'react';

import {IOption, findOption} from '@io-app/types/IOption';
import {IUser} from '@io-app/types/IUser';
import {stopEvent} from '@io-app/utils/browser';
import {getErrorHelperTextByKey, hasErrorByKey, trimValues} from '@io-app/utils/forms';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import IOSelect from '@io-ui/IOSelect';
import {USER_SCHEMA} from './schema';

interface IUserFormProps {
  user: IUser
  organizationsOptions: IOption<string>[]
  save: (user: IUser) => void
  className?: string
}

export type UserFormProps = IUserFormProps & FormikProps<IUser>;

class UserForm extends Component<UserFormProps> {
  public onInputChange = stopEvent((e) => {
    if (e.target && e.target.name) {
      const userUpdate = {...this.props.values, [e.target.name]: e.target.value};
      this.props.setValues(userUpdate);
    }
  });

  public onSelectChange = (selectedOption: Maybe<IOption<string>>, key: keyof IUser) => {
    const userUpdate = {...this.props.values, [key]: selectedOption ? selectedOption.value : null};
    this.props.setValues(userUpdate);
  }

  public render() {
    const {organizationsOptions} = this.props;
    const user = this.props.values;
    const name = user.name || '';
    const lastName = user.lastName || '';
    const secret = user.secretPhrase || '';
    const email = user.eMail || '';
    const {errors} = this.props;
    const hasNameError = hasErrorByKey(errors, 'name');
    const hasLastNameError = hasErrorByKey(errors, 'lastName');
    const hasSecretError = hasErrorByKey(errors, 'secretPhrase');
    const hasEmailError = hasErrorByKey(errors, 'eMail');

    return (
      <div className={classNames('form-control user-form', this.props.className)}>
        <TextField
          InputLabelProps={{shrink: true}}
          label={STRING_RESOURCES.controls.firstName.label}
          name="name"
          onChange={this.onInputChange}
          type="text"
          value={name}
          error={hasNameError}
          helperText={getErrorHelperTextByKey(errors, 'name')}
        />
        <TextField
          InputLabelProps={{shrink: true}}
          label={STRING_RESOURCES.controls.lastName.label}
          name="lastName"
          onChange={this.onInputChange}
          type="text"
          value={lastName}
          error={hasLastNameError}
          helperText={getErrorHelperTextByKey(errors, 'lastName')}
        />
        <TextField
          InputLabelProps={{shrink: true}}
          label={STRING_RESOURCES.controls.secret.label}
          name="secretPhrase"
          onChange={this.onInputChange}
          type="text"
          value={secret}
          error={hasSecretError}
          helperText={getErrorHelperTextByKey(errors, 'secretPhrase')}
        />
        <TextField
          InputLabelProps={{shrink: true}}
          label={STRING_RESOURCES.controls.email.label}
          name="eMail"
          onChange={this.onInputChange}
          type="email"
          value={email}
          error={hasEmailError}
          helperText={getErrorHelperTextByKey(errors, 'eMail')}
        />

        <div className={'is-paddingless'}>
          <p className={'control-label'}>{STRING_RESOURCES.controls.organization.label}</p>
          <IOSelect
            options={organizationsOptions}
            value={findOption(organizationsOptions, user.currentOrgId)}
            onChange={(o: IOption<string>) => this.onSelectChange(o, 'currentOrgId')}
            placeholder={STRING_RESOURCES.users.select_organization}
            isClearable={true}
          />
        </div>
      </div>
    );
  }
}

export default React.forwardRef((props: IUserFormProps, ref: any) => (
  <Formik
    ref={ref}
    initialValues={props.user}
    validationSchema={USER_SCHEMA}
    onSubmit={(values: IUser) => {
      const data = trimValues(values, ['name', 'lastName', 'secretPhrase', 'eMail']);
      props.save(data);
    }}
    render={(formikProps) => <UserForm {...props} {...formikProps} />}
    validateOnChange={true}
  />
));


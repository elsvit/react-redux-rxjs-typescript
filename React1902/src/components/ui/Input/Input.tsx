/**
 * @fileOverview
 */

import FormControl from '@material-ui/core/FormControl';
import MuiInput, {InputProps} from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React from 'react';

const Input = (props: InputProps & {label?: string}) => {
  const {label, ...rest} = props;
  return (
    <FormControl>
      {
        label && (
          <InputLabel shrink={true}>
            {label}
          </InputLabel>
        )
      }
      <MuiInput
        disableUnderline={true}
        {...rest}
      />
    </FormControl>
  );
};

export default Input;

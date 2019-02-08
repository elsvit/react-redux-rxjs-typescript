
import SvgIcon, {SvgIconProps} from '@material-ui/core/SvgIcon';
import React from 'react';

export const AddIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <path
        fillRule="nonzero"
        // tslint:disable-next-line:max-line-length
        d="M13.167 10.833V6.167a1.167 1.167 0 1 0-2.333 0v4.666H6.166a1.167 1.167 0 1 0 0 2.333h4.666v4.667a1.167 1.167 0 1 0 2.333 0v-4.666h4.667a1.167 1.167 0 1 0 0-2.333h-4.666z"
      />
    </SvgIcon>
  );
};

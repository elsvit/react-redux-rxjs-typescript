import SvgIcon, {SvgIconProps} from '@material-ui/core/SvgIcon';
import withStyles from '@material-ui/core/styles/withStyles';
import React from 'react';

import  * as variables from '@io-shared/shared.scss';

const styles = {
  root: {
    width: '2rem',
    marginTop: '0.3rem',
    marginRight: '0.5rem',
  },
};

const OvalIcon = (props: SvgIconProps & {label?: string}) => (
  <SvgIcon {...props} viewBox="0 0 32 27">
    <g fill="none" fillRule="evenodd">
      <rect width="32" height="18" fill={props.nativeColor} rx="9" />
      <text
        fill={variables.whiteFour}
        fillOpacity=".87"
        fontFamily="HelveticaNeue-Medium, Helvetica Neue"
        fontSize="12"
        fontWeight="400"
      >
        <tspan x="7.216" y="13">
          {props.label}
        </tspan>
      </text>
    </g>
  </SvgIcon>
);

export default withStyles(styles)(OvalIcon);

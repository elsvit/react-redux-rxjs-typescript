import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

import  * as variables from '@io-shared/shared.scss';
import {whiteFour} from '@io-shared/shared.scss';
import {whiteFour76} from '@io-shared/shared.scss';
import {darkGrey87} from '@io-shared/shared.scss';
import {darkGrey54} from '@io-shared/shared.scss';

export const baseThemeObj = {
  props: {
    MuiButtonBase: {
      disableRipple: true,
      disableTouchRipple: true,
      focusRipple: false,
      centerRipple: false,
    },
    MuiIconButton: {
      disableRipple: true,
      disableTouchRipple: true,
      focusRipple: false,
      centerRipple: false,
    },
    MuiButton: {
      disableRipple: true,
      disableTouchRipple: true,
      focusRipple: false,
      centerRipple: false,
    },
  },
  palette: {
    primary: {main: variables.primary},
    secondary: {
      main: whiteFour,
      dark: whiteFour76,
      contrastText: darkGrey87,
    },
  },
  overrides: {
    MuiSvgIcon: {
      root: {
        width: '1.5rem',
        height: '1.5rem',
      },
    },
    MuiButtonBase: {
      label: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: 1.4,
      },
    },
    MuiButton: {
      containedSecondary: {
        border: `1px solid ${darkGrey54}`,
      },
    },
    MuiTooltip: {
      tooltip: {
        wordBreak: 'break-all',
        fontSize: '1rem',
        maxWidth: '600px',
        padding: '8px',
        opacity:  0.98,
      },
    },
  },
};

export const baseTheme = createMuiTheme({
  ...baseThemeObj,
  overrides: {
    MuiTooltip: baseThemeObj.overrides.MuiTooltip as any,
    MuiFormControl: {
      root: {
        marginLeft: '0',
        marginRight: '0',
        marginTop: '0.25rem',
        marginBottom: '0.25rem',
        width: '100%',
      },
    },
    MuiFormLabel: {
      root: {
        color: variables.darkGrey54,
        fontSize: '1rem',
        margin: '0 0.5rem 0.1875rem 0.3125rem',
        // zIndex: 1, // show label over input
      },
      focused: {
        '&$focused': {
          color: variables.primary,
        },
      },
      error: {
        '&$error': {
          color: variables.paleRed,
        },
      },
    },
    MuiFormHelperText: {
      error: {
        '&$error': {
          color: variables.paleRed,
        },
      },
    },
    MuiInput: {
      root: {
        'label + &': {
          marginTop: '1rem',
        },
      },
      input: {
        borderRadius: '0.25rem',
        backgroundColor: variables.whiteFour,
        border: '1px solid transparent',
        padding: '0.5rem 0.5rem',
        fontSize: '0.875rem',
        color: `${variables.darkGrey76}`,
        height: 'auto',
        borderColor: 'transparent',
        width: '-webkit-fill-available',
        '&:focus': {
          borderColor: variables.primary,
        },
      },
      error: {
        border: `1px solid ${variables.paleRed} !important`,
        borderRadius: '0.25rem',
        '& > *': {
          border: `1px solid transparent !important`,
        },
      },
      underline: {
        '&:before': {
          display: 'none',
        },
        '&:after': {
          display: 'none',
        },
      },
    },
    MuiIconButton: {
      colorPrimary: {
        color: variables.primary,
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
      colorSecondary: {
        color: variables.info,
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiButton: {
      containedPrimary: {
        color: variables.whiteFour,
      },
      fab: {
        margin: '.3rem',
        width: '2.3rem',
        height: '2.3rem',
        padding: 2,
      },
      sizeSmall: {
        minWidth: '1rem',
        minHeight: '1rem',
      },
    },
    MuiSvgIcon: {
      colorPrimary: {
        color: variables.primary,
      },
      colorSecondary: {
        color: variables.info,
      },
    },
    MuiRadio: {
      root: {
        color: variables.darkGrey36,
        '&$checked': {
          color: variables.primary + ' !important',
        },
      },
    },
  },
});

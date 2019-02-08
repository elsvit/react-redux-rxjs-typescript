import SvgIcon, {SvgIconProps} from '@material-ui/core/SvgIcon';
import React from 'react';

import {active, primary} from '@io-shared/shared.scss';

//tslint:disable:max-line-length
export const QRcodeIcon = (props: SvgIconProps & {isActive?: boolean, isDisabled?: boolean}) => {
  const {isActive, isDisabled, className, ...rest} = props;
  return (
    <SvgIcon {...rest} className={className}>
      <path
        fill={isActive && !isDisabled ? primary : active}
        fillRule="evenodd"
        fillOpacity={isDisabled ? 0.38 : 1}
        d="M18.6 18.6H20V20h-1.4v-1.4zm0-2.8H20v1.4h-1.4v-1.4zm0-2.8H20v1.4h-1.4V13zm-2.8 5.6h1.4V20h-1.4v-1.4zm0-2.8h1.4v1.4h-1.4v-1.4zm0-2.8h1.4v1.4h-1.4V13zm1.4 4.2h1.4v1.4h-1.4v-1.4zm0-2.8h1.4v1.4h-1.4v-1.4zm0-2.8h1.4V13h-1.4v-1.4zm-2.8 5.6h1.4v1.4h-1.4v-1.4zm0-2.8h1.4v1.4h-1.4v-1.4zm0-2.8h1.4V13h-1.4v-1.4zm-2.8 5.6H13v1.4h-1.4v-1.4zm0-2.8H13v1.4h-1.4v-1.4zm0-2.8H13V13h-1.4v-1.4zm0-4.2H13v1.4h-1.4V7.4zm0-2.8H13V6h-1.4V4.6zm-4.2 7h1.4V13H7.4v-1.4zm-2.9 3.6h3.8a.5.5 0 0 1 .5.5v3.8a.5.5 0 0 1-.5.5H4.5a.5.5 0 0 1-.5-.5v-3.8a.5.5 0 0 1 .5-.5zm.9 1.4v2h2v-2h-2zM4.5 4h3.8a.5.5 0 0 1 .5.5v3.8a.5.5 0 0 1-.5.5H4.5a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5zm.9 1.4v2h2v-2h-2zM15.7 4h3.8a.5.5 0 0 1 .5.5v3.8a.5.5 0 0 1-.5.5h-3.8a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5zm.9 1.4v2h2v-2h-2zm-12 6.2H6V13H4.6v-1.4zm8.4 7h1.4V20H13v-1.4zm0-2.8h1.4v1.4H13v-1.4zm0-2.8h1.4v1.4H13V13z"
      />
    </SvgIcon>
  );
};

export const EyeCrossedIcon = (props: SvgIconProps & {isActive?: boolean, isDisabled?: boolean}) => {
  const {isActive, isDisabled, className, ...rest} = props;
  return (
    <SvgIcon {...rest} className={className}>
      <path
        fill={isActive && !isDisabled ? primary : active}
        fillOpacity={isDisabled ? 0.38 : 1}
        fillRule="nonzero"
        d="M10.988 9.933l3.038 3.158 2.03 2.112.94.977 2.516 2.617a.714.714 0 0 1-.012 1.002.693.693 0 0 1-.988-.012l-2.68-2.79c-1.125.649-2.4 1.006-3.832 1.006-2.544 0-4.589-1.127-6.18-3.009a11.41 11.41 0 0 1-1.715-2.754A5.135 5.135 0 0 1 4 11.983c.017-.012.051-.1.105-.223A11.41 11.41 0 0 1 5.82 9.006a9.763 9.763 0 0 1 1.189-1.19L4.495 5.202a.714.714 0 0 1 .01-1 .686.686 0 0 1 .98.01L8.17 7.003l.974 1.012 1.844 1.918zm-.373-2.429L9.539 6.386A7.732 7.732 0 0 1 12 5.997c2.544 0 4.589 1.128 6.18 3.01a11.41 11.41 0 0 1 1.715 2.753c.054.123.088.211.105.257-.017.012-.051.1-.105.223a11.41 11.41 0 0 1-1.887 2.952l-.943-.98a10.907 10.907 0 0 0 1.424-2.19C17.155 9.302 15.098 7.365 12 7.365c-.487 0-.948.048-1.385.14zm-.638 3.401L7.946 8.792c-.995.81-1.796 1.914-2.435 3.186C6.842 14.696 8.901 16.63 12 16.63c1.07 0 2.018-.233 2.855-.65l-1.84-1.915a2.3 2.3 0 0 1-3.038-3.161z"
      />
    </SvgIcon>
  );
};

export const EyeIcon = (props: SvgIconProps & {isActive?: boolean, isDisabled?: boolean}) => {
  const {isActive, isDisabled, className, ...rest} = props;
  return (
    <SvgIcon {...rest} className={className}>
      <path
        fill={isActive && !isDisabled ? primary : active}
        fillOpacity={isDisabled ? 0.38 : 1}
        fillRule="nonzero"
        d="M12 6C9.456 6 7.411 7.127 5.82 9.007a11.403 11.403 0 0 0-1.715 2.753c-.054.123-.088.21-.105.223a10.147 10.147 0 0 0 .432.94c.37.705.83 1.41 1.388 2.07C7.411 16.873 9.456 18 12 18c2.544 0 4.589-1.127 6.18-3.007a11.403 11.403 0 0 0 1.715-2.753c.054-.123.088-.21.105-.223a5.131 5.131 0 0 0-.105-.257 11.403 11.403 0 0 0-1.715-2.753C16.589 7.127 14.544 6 12 6zm0 1.366c3.098 0 5.155 1.936 6.489 4.657-1.34 2.668-3.405 4.606-6.489 4.606-3.098 0-5.158-1.935-6.489-4.652C6.857 9.303 8.916 7.366 12 7.366zM12 9.7a2.3 2.3 0 1 1 .001 4.599A2.3 2.3 0 0 1 12 9.7z"
      />
    </SvgIcon>
  );
};

export const LoadIcon = (props: SvgIconProps & {isActive?: boolean, isDisabled?: boolean}) => {
  const {isActive, isDisabled, className, ...rest} = props;
  return (
    <SvgIcon {...rest} className={className} viewBox={'0 0 20 20'}>
      <path
        fill={isActive && !isDisabled ? primary : active}
        fillOpacity={props.isDisabled ? 0.38 : 1}
        fillRule="evenodd"
        d="M12 4a.709.709 0 1 0 0 1.418A.709.709 0 0 0 12 4zm-.709 3.938v6.402l-1.53-1.53a.708.708 0 0 0-1.002 0 .71.71 0 0 0 0 1.002l2.74 2.74a.709.709 0 0 0 1.002 0l2.74-2.741a.708.708 0 0 0 0-1.002.71.71 0 0 0-1.003.001l-1.53 1.53V7.938a.709.709 0 0 0-1.418 0zm-7.29 8.912V19a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1v-2.054a.709.709 0 1 0-1.418 0v1.436a.2.2 0 0 1-.2.2H5.618a.2.2 0 0 1-.2-.2V16.85a.709.709 0 0 0-1.418 0z"
      />
    </SvgIcon>
  );
};

//tslint:enable:max-line-length


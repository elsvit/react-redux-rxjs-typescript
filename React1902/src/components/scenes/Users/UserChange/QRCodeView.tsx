/**
 * @fileOverview
 */

import MuiButton from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import classNames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import {AppState} from '@io-app/redux/IAppState';
import {GetUserQRCodeImgByIdAction, SetCurrentQRCodeImgAction} from '@io-app/redux/users/actions';
import {getCurrentQRCodeImg, isQRCodeImgLoading} from '@io-app/redux/users/reducer';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import {InfoButtonsTheme} from '@io-ui/Themes/infoButtonsTheme';

const QR_CODE_STUB = require('@io-app/resources/img/qrcode_stub.png');

interface OwnProps {
  id: string
  className?: string
  disabled: boolean
}

interface IStateMap {
  isLoading: boolean
  qrCodeBase64: Maybe<string>
}

interface IDispatchMap {
  getQRCode: typeof GetUserQRCodeImgByIdAction,
  setQRCode: typeof SetCurrentQRCodeImgAction,
}

type QRCodeViewProps = OwnProps & IStateMap & IDispatchMap;

class QRCodeView extends Component<QRCodeViewProps> {
  public getQRCode = () => {
    this.props.getQRCode(this.props.id);
  }

  public componentWillUnmount() {
    this.props.setQRCode(null);
  }

  public render() {
    return (
      <>
        <Grid item={true} xs={12} sm={6} className={'form-actions'}>
          <MuiThemeProvider theme={InfoButtonsTheme}>
            <Tooltip title={STRING_RESOURCES.users.get_qr_code}>
              <MuiButton
                onClick={this.getQRCode}
                disabled={this.props.disabled || this.props.isLoading}
                variant="contained"
                color={'primary'}
                disableRipple={true}
                disableFocusRipple={true}
              >
                {STRING_RESOURCES.actions.get_qr_code}
              </MuiButton>
            </Tooltip>
          </MuiThemeProvider>
        </Grid>
        {
          this.props.isLoading ? (
            <div className={classNames('qr-code-stub', 'with-border-bottom')}>
              <img src={QR_CODE_STUB} alt="QR code" className="usersQRCodeImg" style={{filter: 'blur(5px)'}}/>
            </div>
          ) : (this.props.qrCodeBase64) && (
            <div className={classNames('with-border-bottom')}>
              <img src={this.props.qrCodeBase64} alt="QR code" className="usersQRCodeImg"/>
            </div>
          )
        }
      </>
    );
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  isLoading: isQRCodeImgLoading,
  qrCodeBase64: getCurrentQRCodeImg,
});

const mapDispatchToProps: IDispatchMap = {
  getQRCode: GetUserQRCodeImgByIdAction,
  setQRCode: SetCurrentQRCodeImgAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(QRCodeView);

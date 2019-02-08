/**
 * @fileOverview
 */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import {AppState} from '@io-app/redux/IAppState';
import {RemoveToastAction} from '@io-app/redux/toasts/actions';
import {getToasts} from '@io-app/redux/toasts/reducer';
import {IToast} from '@io-app/types/IToast';
import {notEmpty} from '@io-app/utils/common';
import Toast from './Toast';

interface IStateMap {
  toasts: IToast[]
}

interface IDispatchMap {
  removeToast: typeof RemoveToastAction,
}

type ToastsProps = IStateMap & IDispatchMap;

class ToastsComponent extends Component<ToastsProps> {
  public render() {
    return (
      <>
        {notEmpty(this.props.toasts) && (
          <div className="toasts-list">
            {
              this.props.toasts
                .map((t: IToast) => (<Toast key={t.id} toast={t}/>))
            }
          </div>
        )}
      </>
    );
  }
}

const mapStateToProps = createStructuredSelector<AppState, IStateMap>({
  toasts: getToasts,
});

const mapDispatchToProps: IDispatchMap = {
  removeToast: RemoveToastAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ToastsComponent);
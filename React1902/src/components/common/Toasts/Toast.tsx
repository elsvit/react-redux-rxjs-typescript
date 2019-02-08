/**
 * @fileOverview
 */

import classNames from 'classnames';
import noop from 'lodash-es/noop';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {NEVER, Observable, Subject, fromEvent, race, timer} from 'rxjs';
import {take, takeUntil, tap} from 'rxjs/operators';

import {RemoveToastAction} from '@io-app/redux/toasts/actions';
import {IActionableToast, IToast, IToastBase, ToastType} from '@io-app/types/IToast';
import {EIGHT_SECONDS, THIRTY_SECONDS} from '@io-app/utils/constants';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';

interface IToastProps {
  toast: IToast,
}

type ToastProps = IToastProps & {removeToast: typeof RemoveToastAction};

class ToastComponent extends Component<ToastProps> {
  constructor(props: ToastProps) {
    super(props);
  }

  public readonly typeMap: Map<ToastType, number> = new Map([
    [ToastType.Actionable, THIRTY_SECONDS],
    [ToastType.Info, EIGHT_SECONDS],
    [ToastType.Error, EIGHT_SECONDS],
  ]);

  protected _disposed$: Subject<boolean> = new Subject();

  private _dismissed = false;
  private _dismissToast: Maybe<HTMLButtonElement | HTMLDivElement>;
  private _actionToast: Maybe<HTMLButtonElement>;

  public componentDidMount() {
    const timer$: Observable<any> = this.props.toast.persistent
      ? NEVER
      : timer(this._timeout).pipe(tap(this._dismiss));

    const dismiss$ = !this.props.toast.persistent && this._dismissToast
      ? fromEvent(this._dismissToast, 'click').pipe(tap(this._dismiss))
      : NEVER;

    const action$ = this._actionToast
      ? fromEvent(this._actionToast, 'click').pipe(tap(this._action))
      : NEVER;

    // Finish when the first of the observables is satisfied
    race(
      timer$.pipe(take(1)),
      dismiss$.pipe(take(1)),
      action$.pipe(take(1)),
    )
      .pipe(takeUntil(this._disposed$))
      .subscribe(noop);
  }

  public componentWillUnmount() {
    this._disposed$.next(true);
    if (!this._dismissed && this.props.toast.dismiss) {
      this.props.toast.dismiss();
    }
  }

  public setDismissToastEl = (el: HTMLButtonElement | HTMLDivElement | null) => {
    this._dismissToast = el;
  }

  public render() {
    return (
      <div className="toast">
        <div
          className={classNames('toast-content', {error: this.props.toast.type === ToastType.Error})}
          ref={(el) => this.props.toast.type !== ToastType.Actionable ? this.setDismissToastEl(el) : noop}
        >
          <p className="word-break">{this.props.toast.message}</p>
          {this.props.toast.type === ToastType.Actionable && (
            <div className={'form-actions'}>
              <button
                className="button is-outlined"
                ref={(el) => this._dismissToast = el}
              >
                {(this.props.toast as IActionableToast).cancelActionText || STRING_RESOURCES.actions.cancel}
              </button>
              <button
                className="button is-primary"
                ref={(el) => this._actionToast = el}
              >
                {(this.props.toast as IActionableToast).actionText || STRING_RESOURCES.actions.ok}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  private get _timeout(): number {
    return this.typeMap.get((this.props.toast as IToastBase).type) || EIGHT_SECONDS;
  }

  private _dismiss = () => {
    this._handleToast(this.props.toast.dismiss);
  }

  private _action = () => {
    this._handleToast((this.props.toast as IActionableToast).action);
  }

  private _handleToast(fn = noop) {
    this.props.removeToast(this.props.toast.id);
    fn();
    this._dismissed = true;
  }
}

export default connect(null, {removeToast: RemoveToastAction})(ToastComponent);
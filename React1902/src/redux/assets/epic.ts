/**
 * @fileOverview
 */

import {push} from 'connected-react-router';
import join from 'lodash-es/join';
import partialRight from 'lodash-es/partialRight';
import size from 'lodash-es/size';
import {Action} from 'redux';
import {StateObservable, combineEpics, ofType} from 'redux-observable';
import {Observable, forkJoin, of} from 'rxjs';
import {catchError, filter, flatMap, map, switchMap} from 'rxjs/operators';

import {IAppServices} from '@io-app/api';
import {IOError, isIOError} from '@io-app/api/errors';
import {ErrorCodes} from '@io-app/types/ErrorCodes';
import {IAssetHistory} from '@io-app/types/IAssetHistory';
import {IAssetsFilter} from '@io-app/types/IAssetsFilter';
import {IRawAssetsGroup} from '@io-app/types/IAssetsGroup';
import {CommandTypes, ICommand} from '@io-app/types/ICommand';
import {
  ILoadEntitiesResponse,
  IModifyEntityResponse,
  IQRYResult,
  ModifyEntityFn,
} from '@io-app/types/ILoadEntitiesResponse';
import {IMidItem} from '@io-app/types/IMidItem';
import {DEFAULT_PAGINATION_FILTER} from '@io-app/types/IPaginationFilter';
import {IToast, createErrorToast, createInfoToast} from '@io-app/types/IToast';
import {notEmpty} from '@io-app/utils/common';
import {ERROR_STRINGS, STRING_RESOURCES} from '@io-app/utils/string-resources';
import {ActionWithPayload} from '../../types/Actions';
import {IAsset, IRawAsset, normalizeRawAsset} from '../../types/IAsset';
import {AppState} from '../IAppState';
import {shouldPoll} from '../app/reducer';
import {ErrorHandler, createCommandObs, withHandleErrors, withHandleLoadableState} from '../common/epic-utils';
import {CloseModalAction} from '../modal/actions';
import {AddToastAction} from '../toasts/actions';
import {LoadableKeys} from './IAssetsState';
import {
  ActionTypes,
  LoadAssetsAction,
  LoadAssetsSuccessAction, LoadMidItemsSuccessAction,
  ResetSelectedAssetAction,
  SendAssetCommandAction,
  SetErrorsAction,
  SetInitializedAction,
  SetLoadingAction,
  SetQRYFilterAction,
  SetSelectedAssetAction,
} from './actions';
import {getAssetsFilter, getQRYResult, getSelectedAsset, hasMidItems, isLoading} from './reducer';

const handleLoadableState = (key: LoadableKeys, ...observables: Observable<any>[]) => {
  return withHandleLoadableState<LoadableKeys>(key, SetErrorsAction, SetLoadingAction, ...observables);
};

const handleErrors = (key: LoadableKeys,
                      handler?: Maybe<ErrorHandler | ActionWithPayload<IToast>>,
                      ...observables: Observable<any>[]) => {
  return partialRight(withHandleErrors, key, true, SetErrorsAction, SetLoadingAction, handler, ...observables);
};

const handleAssetErrors = (e: IOError, defaultMessage: string) => {
  let message = defaultMessage;

  if (isIOError(e, ErrorCodes.ASSET_MODEL_INVALID)) {
    if (size(e.data) > 0) {
      message = join(e.data.map((val) => {
        return val.value || `Error ${val.key || ''}`;
      }), ', ');
    }
  }

  if (isIOError(e, ErrorCodes.ASSET_HARDWARE_ID_EXISTS)) {
    message = e.message;
  }

  return [of(AddToastAction(createErrorToast({message})))];
};

function _getCommandMessages(type: CommandTypes, entity: IAsset) {
  const isUpdating = notEmpty(entity.id);
  const saveDefaultErrorMessage = isUpdating ? ERROR_STRINGS.update_error : ERROR_STRINGS.add_device_error;
  const saveSuccessMessage = isUpdating
    ? STRING_RESOURCES.devices.device_was_updated_successfully(entity.name)
    : STRING_RESOURCES.devices.device_was_added_successfully(entity.name);
  let commandSuccessMessage = '';
  let commandErrorMessage = ERROR_STRINGS.generic_error;
  switch (type) {
    case CommandTypes.ASSET_REPROVISIONING:
      commandSuccessMessage = STRING_RESOURCES.devices.configuration_was_sent(entity.name);
      commandErrorMessage = ERROR_STRINGS.apply_configuration_error;
      break;
    case CommandTypes.ASSET_RESET_CLEAN:
      commandSuccessMessage = STRING_RESOURCES.devices.reset_clean_was_sent(entity.name);
      commandErrorMessage = ERROR_STRINGS.reset_device_error;
      break;
    case CommandTypes.ASSET_RESET_DISCOVERY:
      commandSuccessMessage = STRING_RESOURCES.devices.reset_discovery_was_sent(entity.name);
      commandErrorMessage = ERROR_STRINGS.reset_device_error;
      break;
    case CommandTypes.ASSET_RESET:
      commandSuccessMessage = STRING_RESOURCES.devices.reset_was_sent(entity.name);
      commandErrorMessage = ERROR_STRINGS.reset_device_error;
      break;
    default:
      throw new IOError(ErrorCodes.BAD_COMMAND);
  }

  return {saveSuccessMessage, saveDefaultErrorMessage, commandSuccessMessage, commandErrorMessage};
}

function _modifyAsset(action$: Observable<Action>,
                      state$: StateObservable<any>,
                      actionType: string,
                      key: LoadableKeys,
                      method: ModifyEntityFn<IAsset | string, IRawAsset>,
                      successMessage: (payload: IAsset | string, oldAsset?: Maybe<IAsset>) => string,
                      defaultErrorMessage: string) {
  return action$.pipe(
    ofType(actionType),
    filter(() => shouldPoll(state$.value)),
    filter(() => !isLoading(key)(state$.value)),
    switchMap(({payload}: ActionWithPayload<IAsset | string>) => handleLoadableState(
      key,
      method(payload, getQRYResult(state$.value), getAssetsFilter(state$.value))
        .pipe(
          flatMap(({entities}: IModifyEntityResponse<IRawAsset>) => {
            const oldAsset = getSelectedAsset(state$.value);
            return of(
              LoadAssetsSuccessAction(entities),
              SetLoadingAction({key, value: false}),
              ResetSelectedAssetAction(),
              push('/devices'),
              AddToastAction(createInfoToast(
                {message: successMessage(payload, oldAsset)},
              )),
            );
          }),
          catchError(handleErrors(key, (e) => handleAssetErrors(e, defaultErrorMessage))),
        ),
      ),
    ),
  );
}

const updateAssetEpic = (action$: Observable<Action>,
                         state$: StateObservable<any>,
                         {assetsService}: IAppServices) =>
  _modifyAsset(
    action$,
    state$,
    ActionTypes.UPDATE_ASSET, LoadableKeys.UPDATE_ASSET,
    assetsService.updateAsset,
    (asset: IAsset) => STRING_RESOURCES.devices.device_was_updated_successfully(asset.name),
    ERROR_STRINGS.update_error,
  );

const addAssetEpic = (action$: Observable<Action>,
                      state$: StateObservable<any>,
                      {assetsService}: IAppServices) =>
  _modifyAsset(
    action$,
    state$,
    ActionTypes.ADD_ASSET,
    LoadableKeys.ADD_ASSET,
    assetsService.addAsset,
    (asset: IAsset) => STRING_RESOURCES.devices.device_was_added_successfully(asset.name),
    ERROR_STRINGS.add_device_error,
  );

const removeAssetEpic = (action$: Observable<Action>,
                         state$: StateObservable<any>,
                         {assetsService}: IAppServices) =>
  _modifyAsset(action$, state$, ActionTypes.REMOVE_ASSET, LoadableKeys.REMOVE_ASSET, assetsService.removeAsset,
    (_id, oldAsset) => STRING_RESOURCES.devices.device_was_removed_successfully(oldAsset ? oldAsset.name : ''),
    ERROR_STRINGS.remove_entity_error,
  );

const loadAssetsEpic = (action$: Observable<Action>,
                        state$: StateObservable<AppState>,
                        {assetsService}: IAppServices) => action$.pipe(
  ofType(ActionTypes.LOAD_ASSETS),
  filter(() => shouldPoll(state$.value)),
  filter(() => !isLoading(LoadableKeys.LOAD_ASSETS)(state$.value)),
  switchMap(({payload}: ActionWithPayload<Partial<IAssetsFilter>>) => handleLoadableState(
    LoadableKeys.LOAD_ASSETS,
    assetsService.fetchAssets(getQRYResult(state$.value), payload)
      .pipe(
        flatMap((response: ILoadEntitiesResponse<IRawAsset>) => of(
          LoadAssetsSuccessAction(response),
          SetLoadingAction({key: LoadableKeys.LOAD_ASSETS, value: false}),
          SetInitializedAction({key: LoadableKeys.LOAD_ASSETS, value: true}),
        )),
        catchError(handleErrors(LoadableKeys.LOAD_ASSETS)),
      ),
    ),
  ),
);

const paginationEpic = (action$: Observable<Action>, state$: StateObservable<any>) => action$.pipe(
  ofType(ActionTypes.SET_QRY_FILTER),
  filter(() => shouldPoll(state$.value)),
  map(() => LoadAssetsAction(getAssetsFilter(state$.value))),
);

const resetPaginationOnSetFilterEpic = (action$: Observable<Action>, state$: StateObservable<any>) => action$.pipe(
  ofType(ActionTypes.SET_ASSETS_FILTER),
  filter(() => shouldPoll(state$.value)),
  map(() => SetQRYFilterAction(DEFAULT_PAGINATION_FILTER)),
);

const getSelectedAssetHistoryEpic = (action$: Observable<Action>,
                                     state$: StateObservable<AppState>,
                                     {assetsService}: IAppServices) => action$.pipe(
  ofType(ActionTypes.GET_ASSET_HISTORY),
  filter(() => shouldPoll(state$.value)),
  filter(() => !isLoading(LoadableKeys.GET_ASSET_HISTORY)(state$.value)),
  switchMap(({payload}: ActionWithPayload<string>) => handleLoadableState(
    LoadableKeys.GET_ASSET_HISTORY,
    assetsService.fetchAssetHistory(payload)
      .pipe(
        flatMap((response: IAssetHistory[]) => of(
          SetSelectedAssetAction({history: response}),
          SetLoadingAction({key: LoadableKeys.GET_ASSET_HISTORY, value: false}),
        )),
        catchError(handleErrors(LoadableKeys.GET_ASSET_HISTORY)),
      ),
    ),
  ),
);

const getAssetByIdEpic = (action$: Observable<Action>,
                          state$: StateObservable<any>,
                          {assetsService}: IAppServices) => action$.pipe(
  ofType(ActionTypes.GET_ASSET_BY_ID),
  filter(() => shouldPoll(state$.value)),
  filter(() => !isLoading(LoadableKeys.GET_ASSET_BY_ID)(state$.value)),
  switchMap(({payload}: ActionWithPayload<string>) => handleLoadableState(
    LoadableKeys.GET_ASSET_BY_ID,
    forkJoin([assetsService.getAssetById(payload), assetsService.getAssetGroupsById(payload)])
      .pipe(
        flatMap(([asset, groups]: [IRawAsset, IRawAssetsGroup[]]) => of(
          SetSelectedAssetAction({entity: asset, groups}),
          SetLoadingAction({key: LoadableKeys.GET_ASSET_BY_ID, value: false}),
        )),
        catchError(handleErrors(LoadableKeys.GET_ASSET_BY_ID)),
      ),
    ),
  ),
);

const loadMidItemsEpic = (action$: Observable<Action>,
                          state$: StateObservable<any>,
                          {assetsService}: IAppServices) => action$.pipe(
  ofType(ActionTypes.LOAD_MID_ITEMS),
  filter(() => shouldPoll(state$.value)),
  filter(() => !hasMidItems(state$.value)),
  filter(() => !isLoading(LoadableKeys.LOAD_MIDS)(state$.value)),
  switchMap(() => handleLoadableState(
    LoadableKeys.LOAD_MIDS,
    assetsService.fetchMids()
      .pipe(
        flatMap((response: IMidItem[]) => of(
          LoadMidItemsSuccessAction(response),
          SetLoadingAction({key: LoadableKeys.LOAD_MIDS, value: false}),
          SetInitializedAction({key: LoadableKeys.LOAD_MIDS, value: true}),
        )),
        catchError(handleErrors(LoadableKeys.LOAD_MIDS)),
      ),
    ),
  ),
);

const sendAssetCommandEpic = (action$: Observable<Action>,
                              state$: StateObservable<any>,
                              {assetsService}: IAppServices) => action$.pipe(
  ofType(ActionTypes.SEND_ASSET_COMMAND),
  filter(() => shouldPoll(state$.value)),
  filter(() => !isLoading(LoadableKeys.SEND_ASSET_COMMAND)(state$.value)),
  switchMap(({payload}: ActionWithPayload<ICommand<IAsset>>) => handleLoadableState(
    LoadableKeys.SEND_ASSET_COMMAND,
    of([getQRYResult(state$.value), getAssetsFilter(state$.value)])
      .pipe(
        switchMap(([paginationFilter, filter]: [IQRYResult, IAssetsFilter]) => {
          const {entity, type} = payload;
          const isUpdating = notEmpty(entity.id);
          const save = isUpdating
            ? partialRight(assetsService.updateAsset, paginationFilter, filter)
            : partialRight(assetsService.addAsset, paginationFilter, filter);
          const messages = _getCommandMessages(type, entity);

          return createCommandObs(
            payload,
            save,
            ({entities}: IModifyEntityResponse<IRawAsset>) => ([
              of(
                LoadAssetsSuccessAction(entities),
                AddToastAction(createInfoToast({message: messages.saveSuccessMessage})),
                SetLoadingAction({key: LoadableKeys.SEND_ASSET_COMMAND, value: false}),
              ),
            ]),
            handleErrors(
              LoadableKeys.SEND_ASSET_COMMAND,
              (e: IOError) => {
                return [of(CloseModalAction()), ...handleAssetErrors(e, messages.saveDefaultErrorMessage)];
              }),
            (rawAsset: IRawAsset) => {
              // we don't care about groups here.
              const asset = normalizeRawAsset(rawAsset, []);
              return SendAssetCommandAction({entity: asset as IAsset, forceSaveEntity: false, type});
            },
            assetsService.sendCommand,
            () => of(
              CloseModalAction(),
              AddToastAction(createInfoToast({message: STRING_RESOURCES.devices.command_was_sent(entity.name)})),
              SetLoadingAction({key: LoadableKeys.SEND_ASSET_COMMAND, value: false}),
            ),
            handleErrors(
              LoadableKeys.SEND_ASSET_COMMAND,
              () => {
                return [of(CloseModalAction(), AddToastAction(createErrorToast({message: messages.commandErrorMessage})))];
              },
            ),
          );
        }),
      ),
    ),
  ),
  catchError(() => of(CloseModalAction(), AddToastAction(createErrorToast({message: ERROR_STRINGS.generic_error})))),
);

export default combineEpics(
  loadAssetsEpic,
  paginationEpic,
  resetPaginationOnSetFilterEpic,
  getSelectedAssetHistoryEpic,
  getAssetByIdEpic,
  addAssetEpic,
  updateAssetEpic,
  removeAssetEpic,
  loadMidItemsEpic,
  sendAssetCommandEpic,
);

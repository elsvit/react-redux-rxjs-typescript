/**
 * @fileOverview root app state
 */

import {IOBreakPoints} from '@io-app/types/ScreenResponsiveType';
import {IBrowser} from 'redux-responsive';
import {AppMiscState} from './app/IAppMiscState';
import {AssetsState} from './assets/IAssetsState';
import {AuthState} from './auth/IAuthState';
import {DashboardState} from './dashboard/IDashboardState';
import {AssetsGroupsState} from './groups/IGroupsState';
import {LogsState} from './logs/ILogsState';
import {MenuState} from './menu/IMenuState';
import {ModalState} from './modal/IModalState';
import {OrganizationsState} from './organizations/IOrganizationsState';
import {ReportsState} from './reports/IReportsState';
import {ToastsState} from './toasts/IToastsState';
import {UsersState} from './users/IUsersState';

export interface IAppState {
  auth: AuthState
  appMisc: AppMiscState
  assets: AssetsState
  browser: IBrowser<IOBreakPoints>
  dashboard: DashboardState
  groups: AssetsGroupsState
  logs: LogsState
  menu: MenuState
  modal: ModalState
  organizations: OrganizationsState
  reports: ReportsState
  toasts: ToastsState
  users: UsersState
}

export type AppState = Readonly<IAppState>;

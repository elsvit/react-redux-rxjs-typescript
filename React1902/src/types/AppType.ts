
import {IOption, optionsToMap} from './IOption';

export enum AppType {
  ASSET = 1,
  AGENT = 3,
  GATEWAY = 2,
}

export const appTypeOptions: IOption<AppType>[] = [
  {value: AppType.ASSET, label: 'Asset'},
  {value: AppType.GATEWAY, label: 'Gateway'},
  {value: AppType.AGENT, label: 'Agent'},
];

export const appTypeMap: Map<AppType, string> = optionsToMap(appTypeOptions);

/**
 * @fileOverview
 */

import {catchError} from 'rxjs/operators';

import {IAssetLink} from '@io-app/types/IAssetLink';
import HttpAuthService from './HttpAuthService';
import {mapCodeAndThrowObservable} from './errors';

const BASE_URL = 'assetlink';

export class AssetLinksService {
  constructor(httpAuthService: HttpAuthService) {
    this.httpAuthService = httpAuthService;
  }

  httpAuthService: HttpAuthService;

  public fetchAssetLinks = () => {
    return this.httpAuthService
      .get(`${BASE_URL}/all`)
      .pipe(catchError(mapCodeAndThrowObservable));
  }

  public updateAssetsLinks = (links: IAssetLink[]) => {
    return this.httpAuthService
      .post(`${BASE_URL}/update/all`, links)
      .pipe(catchError(mapCodeAndThrowObservable));
  }

  public addAssetLink = (link: IAssetLink) => {
    return this.httpAuthService
      .post(`${BASE_URL}/add`, link)
      .pipe(catchError(mapCodeAndThrowObservable));
  }

  public removeAssetLink = (link: IAssetLink) => {
    return this.httpAuthService
      .delete(`${BASE_URL}/remove/${link.id}`)
      .pipe(catchError(mapCodeAndThrowObservable));
  }

  public startAuthForLink = (link: IAssetLink) => {
    return this.httpAuthService
      .get(`${BASE_URL}/auth/${link.id}`)
      .pipe(catchError(mapCodeAndThrowObservable));
  }

  public fetchAssetsLinksWithStates = () => {
    return this.httpAuthService
      .get(`${BASE_URL}/states`)
      .pipe(catchError(mapCodeAndThrowObservable));
  }

  public getAssetsLinkAuthSession = (id: string) => {
    return this.httpAuthService
      .get(`${BASE_URL}/authsession/${id}`)
      .pipe(catchError(mapCodeAndThrowObservable));
  }
}

export default AssetLinksService;

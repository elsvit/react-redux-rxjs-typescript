import compact from 'lodash-es/compact';
import keys from 'lodash-es/keys';
import noop from 'lodash-es/noop';
import {isMoment} from 'moment';
import {AjaxRequest, AjaxResponse, ajax} from 'rxjs/ajax';
import {map, take} from 'rxjs/operators';

import {BASE_API_URL} from '../types/IHttpAuth';

const baseHeaders = {
  crossDomain: true,
  accept: 'application/json',
  'Content-Type': 'application/json',
};

class HttpAuthService {
  public auth: string;
  public dispatchRefreshAuth: (token: string) => void = noop;

  public createBasicRequest = (method: string, url: string,
                               body?: any, opts?: any, searchParams?: Maybe<URLSearchParams>) => {
    return this._createBasicRequest(method, url, opts, body, searchParams);
  };

  public get = (url: string, opts?: any, searchParams?: Maybe<URLSearchParams>) => {
    return this._createAuthRequest('GET', url, null, opts, searchParams);
  };

  public delete = (url: string, opts?: any) => {
    return this._createAuthRequest('DELETE', url, null, opts);
  };

  public put = (url: string, body?: any, opts?: any, searchParams?: Maybe<URLSearchParams>) => {
    return this._createAuthRequest('PUT', url, body, opts, searchParams);
  };

  public post = (url: string, body?: any, opts?: any, searchParams?: Maybe<URLSearchParams>) => {
    return this._createAuthRequest('POST', url, body, opts, searchParams);
  };

  private _createAuthRequest(method: string, url: string, body?: any, opts?: any,
                             searchParams?: Maybe<URLSearchParams>) {
    let mergedOpts = {...opts, Authorization: `Bearer ${this.auth}`};
    return this._createBasicRequest(method, url, mergedOpts, body, searchParams);
  }

  private _createBasicRequest(method: string, url: string, opts?: any, body?: any,
                              searchParams?: Maybe<URLSearchParams>) {
    let headers = {...baseHeaders, ...opts};
    const request: AjaxRequest = {
      url: `${BASE_API_URL}/${url}${searchParams ? `?${searchParams.toString()}` : ''}`,
      body,
      method,
      headers,
    };

    return ajax(request)
      .pipe(
        map((res: AjaxResponse) => {
          const headers = res.xhr.getAllResponseHeaders();
          if (headers.includes('x-refresh-token')) {
            const refreshToken = res.xhr.getResponseHeader('x-refresh-token');

            if (refreshToken !== null && refreshToken !== this.auth) {
              this.auth = refreshToken;
              this.dispatchRefreshAuth(this.auth);
            }
          }
          return res.response;
        }),
        take(1),
      );
  }
}

export function entityToSearchParams(entity: Maybe<any>): Maybe<URLSearchParams> {
  if (entity == null) {
    return null;
  }

  const params = compact(keys(entity || {}).map((key: string) => {
    return entity[key] == null ? null : [key, isMoment(entity[key]) ? entity[key].format() : entity[key]];
  }));

  return new URLSearchParams(params as any);
}

export default HttpAuthService;

import {FormikErrors} from 'formik';
import mapValues from 'lodash-es/mapValues';
import trim from 'lodash-es/trim';

export function trimValues<T>(data: T, keys: string[]): T {
  if (
    !data
    || typeof data !== 'object'
    || !Object.keys(data).length
    || !keys
    || !keys.length
  ) {
    return data;
  }
  return mapValues(data, (v: any, key: string) => keys.includes(key) ? trim(v) : v) as T;
}

export function toNumberValues<T>(data: T, keys: string[]): T {
  if (
    !data
    || typeof data !== 'object'
    || !Object.keys(data).length
    || !keys
    || !keys.length
  ) {
    return data;
  }
  return mapValues(data, (v: any, key: string) => keys.includes(key) ? +v : v) as T;
}

export function hasErrorByKey<T>(errors: FormikErrors<T>, key: keyof T) {
  return Boolean(errors && errors[key]);
}

export function getErrorHelperTextByKey<T>(errors: FormikErrors<T>, key: keyof T) {
  return hasErrorByKey<T>(errors, key) && errors[key];
}

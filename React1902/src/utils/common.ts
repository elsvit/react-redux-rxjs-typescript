/**
 * @fileOverview utilities
 */

import every from 'lodash-es/every';
import identity from 'lodash-es/identity';
import isEmpty from 'lodash-es/isEmpty';
import isEqual from 'lodash-es/isEqual';
import isEqualWith from 'lodash-es/isEqualWith';
import negate from 'lodash-es/negate';
import noop from 'lodash-es/noop';
import some from 'lodash-es/some';
import unary from 'lodash-es/unary';
import v4 from 'uuid/v4';

export function uuidObject<T = any>(obj: T): T & {id: string} {
  return {...(obj as any), id: v4()};
}

export const typedIdObjectFactory = <T>(template: T) => (partial: Partial<T>): T & {id: string} => {
  return {...(template as any), ...(partial as any), id: v4()};
};

export const notEmpty: (v?: any) => boolean = negate(isEmpty);
export const notEqual = negate(isEqual);
export const notEqualWith: (v: any, o: any, c: (v: any, o: any) => boolean) => boolean = negate(isEqualWith);
export const notIdentity = negate(identity);
export const unaryEvery = unary(every);
export const unarySome = unary(some);
export const unaryNone = negate(unarySome);
export const selectUnaryEvery = (...args: boolean[]) => unaryEvery(args);
export const selectUnarySome = (...args: boolean[]) => unarySome(args);
export const selectUnaryNone = (...args: boolean[]) => unaryNone(args);

export type VoidFn = () => void;

export function loadFromUrlParams(props: any, paramName: string, load: (p: string) => void, cancel: () => void = noop) {
  const {match} = props;
  if (!match.params || match.params[paramName] === null) {
    cancel();
  } else {
    load(match.params[paramName]);
  }
}

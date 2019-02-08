/**
 * @fileOverview
 */
import {duration} from 'moment';

export const MAX_DESCRIPTION_LENGTH = 3000;

export const ONE_MINUTE = duration(1, 'minutes').asMilliseconds();
export const THIRTY_SECONDS = duration(30, 'seconds').asMilliseconds();
export const EIGHT_SECONDS = duration(8, 'seconds').asMilliseconds();

export const ANIMATION_DURATION = duration(500).milliseconds();
export const ANIMATION_DURATION_FAST = duration(200).milliseconds();
export const ANIMATION_DURATION_SLOW = duration(800).milliseconds();

export const POLLING_TIMER = duration(30, 'seconds').asMilliseconds();

export const DATE_TIME_FORMAT = 'DD MMM YY HH:mm:ss.SSS';
export const TIME_PERIOD_FORMAT = 'HH[h] mm[m] ss[s]';

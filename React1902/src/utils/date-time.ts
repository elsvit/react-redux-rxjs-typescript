
import moment from 'moment';

import {DATE_TIME_FORMAT, TIME_PERIOD_FORMAT} from '@io-app/utils/constants';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';

export function formatDateTime(dateTime: any): string {
  return dateTime && moment(dateTime).isValid()
    ? moment(dateTime).format(DATE_TIME_FORMAT)
    : STRING_RESOURCES.common.not_available;
}

export function formatPeriodAgo(period: Maybe<number>): Maybe<string> {
  return period
    ? `${moment.utc(moment.duration(period).asMilliseconds()).format(TIME_PERIOD_FORMAT)} ${STRING_RESOURCES.dashboard.ago}`
    : STRING_RESOURCES.common.never;
}

export function getPeriodFromNow(startTimeIn: any): Maybe<number> {
  const endTime = moment.utc().valueOf();
  const startTime = (startTimeIn && moment(startTimeIn).isValid()) ? moment(startTimeIn).valueOf() : null;
  return startTime == null ? null : endTime - startTime;
}
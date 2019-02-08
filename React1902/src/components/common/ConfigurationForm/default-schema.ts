import * as yup from 'yup';

import keyBy from 'lodash-es/keyBy';
import mapValues from 'lodash-es/mapValues';

import {PROV_SPEC_SECTION_SEPARATAROR} from '@io-app/types/IProvSpec';
import {ERROR_STRINGS} from '@io-app/utils/string-resources';

export const CONFIG_SCHEMA = yup.object()
  .transform((current, original) => {
    return mapValues(keyBy(original, 'sectionKey'), (section) => {
      return mapValues(keyBy(section.fields, 'fieldKey'), field => field.value);
    });
  }).shape({
    timeouts: yup.lazy((obj) => {
      const fieldsShape  = mapValues(obj, (value, key) => {
        return key === 'submitsCount'
          ? yup.number()
            .typeError(ERROR_STRINGS.submits_count_integer)
            .integer(ERROR_STRINGS.submits_count_integer)
            .min(1, ERROR_STRINGS.counts_must_be_more_or_equal(1))
            .required(ERROR_STRINGS.submits_count_required)
          : yup.number()
            .typeError(ERROR_STRINGS.timeout_integer)
            .integer(ERROR_STRINGS.timeout_integer)
            .min(1, ERROR_STRINGS.timeouts_must_be_more_or_equal(1))
            .required(ERROR_STRINGS.timeout_required);
      });
      return yup.object().shape(fieldsShape);
    }),
    provSpec: yup.object().shape({
      fields: yup.array().of(
        yup.object().shape({
          value: yup.string().test(
            'provSpec',
            ERROR_STRINGS.avoid_using_separator,
            val => !val.includes(PROV_SPEC_SECTION_SEPARATAROR),
          ),
        }),
      ),
      sections: yup.array().of(yup.object().shape({
        name: yup.string().required(),
        fields: yup.array().of(
          yup.object().shape({
            value: yup.string().test(
              'provSpec',
              ERROR_STRINGS.avoid_using_separator,
              val => !val.includes(PROV_SPEC_SECTION_SEPARATAROR),
            ),
          }),
        ),
      })),
    }),
  });

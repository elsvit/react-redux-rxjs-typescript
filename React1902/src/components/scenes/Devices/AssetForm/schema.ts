import filter from 'lodash-es/filter';
import size from 'lodash-es/size';
import uniqBy from 'lodash-es/uniqBy';
import * as yup from 'yup';

import {IAssetInterface} from '@io-app/types/IBands';
import {PROV_SPEC_SECTION_SEPARATAROR} from '@io-app/types/IProvSpec';
import {notEmpty} from '@io-app/utils/common';
import {MAX_DESCRIPTION_LENGTH} from '@io-app/utils/constants';
import {ERROR_STRINGS} from '@io-app/utils/string-resources';
import keyBy from 'lodash-es/keyBy';
import mapValues from 'lodash-es/mapValues';

export const ASSET_SCHEMA = yup.object().shape({
  hardwareId: yup
    .string()
    .trim()
    .required(ERROR_STRINGS.device_hardware_id_is_required),
  name: yup
    .string()
    .trim()
    .required(ERROR_STRINGS.device_name_is_required),
  description: yup
    .string().max(MAX_DESCRIPTION_LENGTH, `${ERROR_STRINGS.description_must_be_less(MAX_DESCRIPTION_LENGTH)}`)
    .notRequired()
    .nullable(true),
  app: yup
    .number()
    .required(),
  proxyWeight: yup
    .number()
    .required(ERROR_STRINGS.pec_is_required)
    .integer(ERROR_STRINGS.pec_must_be_integer)
    .min(0, ERROR_STRINGS.number_must_be_more_or_equal(0))
    .max(128, ERROR_STRINGS.number_must_be_less_or_equal(128)),
  provSpec: yup
    .object().shape({
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
  serial: yup
    .string()
    .trim()
    .required(ERROR_STRINGS.serial_is_required)
    .matches(/^[A-Za-z0-9]*$/, ERROR_STRINGS.only_letters_and_numbers),
  bands: yup
    .object().shape({
      interfaces: yup
        .array()
        .min(1, ERROR_STRINGS.at_least_one_interface_required)
        .of(yup.object().shape({
          name: yup
            .string()
            .trim()
            .min(1, ERROR_STRINGS.interface_name_required)
            .max(45, ERROR_STRINGS.interface_name_must_be_less(45)),
        }),
      ).test('bands', ERROR_STRINGS.ip_uniqueness, (interfaces: IAssetInterface[]) => {
        const notEmptyInterfaces = filter(interfaces, ({ip}: {ip: string}) => notEmpty(ip));
        const uniqueInterfaces = uniqBy(notEmptyInterfaces, 'ip');
        return size(uniqueInterfaces) === size(notEmptyInterfaces);
      }),
      current: yup
        .array()
        .test('bands', ERROR_STRINGS.each_band_need_interface, val => !val.includes(null)),
    }),
  authTimeout: yup.number()
    .typeError(ERROR_STRINGS.timeout_integer)
    .positive(ERROR_STRINGS.timeout_positive)
    .integer(ERROR_STRINGS.timeout_integer)
    .min(1, ERROR_STRINGS.timeouts_must_be_more_or_equal(1))
    .required(ERROR_STRINGS.timeout_required),
  commitmentTimeout: yup.number()
    .typeError(ERROR_STRINGS.timeout_integer)
    .positive(ERROR_STRINGS.timeout_positive)
    .integer(ERROR_STRINGS.timeout_integer)
    .min(1, ERROR_STRINGS.timeouts_must_be_more_or_equal(1))
    .required(ERROR_STRINGS.timeout_required),
  handshakingTimeout: yup.number()
    .typeError(ERROR_STRINGS.timeout_integer)
    .positive(ERROR_STRINGS.timeout_positive)
    .integer(ERROR_STRINGS.timeout_integer)
    .min(1, ERROR_STRINGS.timeouts_must_be_more_or_equal(1))
    .required(ERROR_STRINGS.timeout_required),
  secretKeyExchangeTimeout: yup.number()
    .typeError(ERROR_STRINGS.timeout_integer)
    .positive(ERROR_STRINGS.timeout_positive)
    .integer(ERROR_STRINGS.timeout_integer)
    .min(1, ERROR_STRINGS.timeouts_must_be_more_or_equal(1))
    .required(ERROR_STRINGS.timeout_required),
  submitsCount: yup.number()
    .typeError(ERROR_STRINGS.timeout_integer)
    .positive(ERROR_STRINGS.submits_count_positive)
    .integer(ERROR_STRINGS.submits_count_integer)
    .min(1, ERROR_STRINGS.counts_must_be_more_or_equal(1))
    .required(ERROR_STRINGS.submits_count_required),
});

export const TIMEOUTS_SCHEMA = yup.object()
  .transform((current, original) => {
    const sectionsObj = mapValues(keyBy(original, 'sectionKey'), (section) => {
      const fields = mapValues(keyBy(section.fields, 'fieldKey'), field => field.value);
      return fields;
    });
    return sectionsObj;
  }).shape({
    timeouts: yup.object().shape({
      authTimeout: yup.number()
        .typeError(ERROR_STRINGS.timeout_integer)
        .integer(ERROR_STRINGS.timeout_integer)
        .min(0, ERROR_STRINGS.timeouts_must_be_more_or_equal(0))
        .required(ERROR_STRINGS.timeout_required),
      commitmentTimeout: yup.number()
        .typeError(ERROR_STRINGS.timeout_integer)
        .integer(ERROR_STRINGS.timeout_integer)
        .min(0, ERROR_STRINGS.timeouts_must_be_more_or_equal(0))
        .required(ERROR_STRINGS.timeout_required),
      handshakingTimeout: yup.number()
        .typeError(ERROR_STRINGS.timeout_integer)
        .integer(ERROR_STRINGS.timeout_integer)
        .min(0, ERROR_STRINGS.timeouts_must_be_more_or_equal(0))
        .required(ERROR_STRINGS.timeout_required),
      secretKeyExchangeTimeout: yup.number()
        .typeError(ERROR_STRINGS.timeout_integer)
        .integer(ERROR_STRINGS.timeout_integer)
        .min(0, ERROR_STRINGS.timeouts_must_be_more_or_equal(0))
        .required(ERROR_STRINGS.timeout_required),
      submitsCount: yup.number()
        .typeError(ERROR_STRINGS.submits_count_integer)
        .integer(ERROR_STRINGS.submits_count_integer)
        .min(0, ERROR_STRINGS.counts_must_be_more_or_equal(0))
        .required(ERROR_STRINGS.submits_count_required),
    }),
  });

export const PROVSPEC_SCHEMA = yup.object()
  .transform((current, original) => {
    const sectionsObj = mapValues(keyBy(original, 'sectionKey'), (section) => {
      const fields = mapValues(keyBy(section.fields, 'fieldKey'), field => field.value);
      return fields;
    });
    return sectionsObj;
  }).shape({
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

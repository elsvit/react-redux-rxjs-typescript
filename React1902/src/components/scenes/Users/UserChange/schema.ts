import * as yup from 'yup';

import {ERROR_STRINGS} from '@io-app/utils/string-resources';

export const USER_SCHEMA = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required(ERROR_STRINGS.user_name_is_required),
  lastName: yup
    .string()
    .trim()
    .required(ERROR_STRINGS.user_last_name_is_required),
  secretPhrase: yup
    .string()
    .trim()
    .required(ERROR_STRINGS.secret_phrase_is_required),
  eMail: yup
    .string()
    .email(ERROR_STRINGS.invalid_email)
    .required(ERROR_STRINGS.email_is_required),
});
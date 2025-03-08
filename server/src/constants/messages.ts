export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',

  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_3_TO_100: 'Name length must be from 3 to 100',

  EMAIL_IS_VALID: 'Email is not valid',
  EMAIL_IS_REQUIRED: 'Email is required',

  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_IS_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',
  PASSWORD_MUST_BE_A_STRONG: 'Password must be a strong',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',
  CONFIRM_PASSWORD_MUST_BE_A_STRONG: 'Confirm password must be a strong',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',

  ROLE_IS_REQUIRED: 'Role is required',
  ROLE_MUST_BE_A_STRING: 'Role must be a string',
  ROLE_LENGTH_MUST_BE_FROM_3_TO_100: 'Role length must be from 3 to 100',

  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',

  ACCOUNT_CREATED: 'Account created'
} as const

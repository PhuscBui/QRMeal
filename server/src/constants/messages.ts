export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',

  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_3_TO_100: 'Name length must be from 3 to 100',

  EMAIL_IS_VALID: 'Email is not valid',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_ALREADY_EXISTS: 'Email already exists',

  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',

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

  ACCOUNT_CREATED: 'Account created',
  OWNER_NOT_FOUND: 'Owner not found',

  USER_LOGIN_SUCCESS: 'User login success',
  LOGOUT_SUCCESS: 'Logout success',
  USER_NOT_FOUND: 'User not found',

  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_MUST_BE_A_STRING: 'Refresh token must be a string',
  USED_REFRESH_TOKEN_OR_NOT_EXISTS: 'Used refresh token or not exists',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
  UNAUTHORIZED: 'Unauthorized',
  ACCOUNTS_FETCHED: 'Accounts fetched',

  GET_EMPLOYEE_SUCCESS: 'Get employee success',
  DELETE_EMPLOYEE_SUCCESS: 'Delete employee success',
  GET_ME_SUCCESS: 'Get me success',
  UPDATE_ME_SUCCESS: 'Update me success',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  PASSWORD_IS_INCORRECT: 'Password is incorrect'
} as const

export const COMMON_MESSAGES = {
  LIMIT_MUST_BE_LESS_THAN_100: 'Limit must be less than 100',
  LIMIT_MUST_E_GREATER_THAN_0: 'Limit must be greater than 0',
  PAGE_MUST_E_GREATER_THAN_0: 'Page must be greater than 0',
  IMAGE_URL_MUST_BE_A_STRING: 'Image URL must be a string',
  IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400: 'Image URL length must be from 1 to 400'
} as const

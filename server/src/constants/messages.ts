export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',

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

export const DISHES_MESSAGE = {
  DISH_NOT_FOUND: 'Dish not found',
  DISH_CREATED: 'Dish created',
  DISH_UPDATED: 'Dish updated',
  DISH_DELETED: 'Dish deleted',
  DISH_FETCHED: 'Dish fetched',
  DISHES_FETCHED: 'Dishes fetched',
  DISH_ID_IS_REQUIRED: 'Dish ID is required',
  DISH_ID_MUST_BE_A_STRING: 'Dish ID must be a string',
  DISH_ID_IS_INVALID: 'Dish ID is invalid',

  PRICE_MUST_BE_A_NUMBER: 'Price must be a number',
  PRICE_MUST_BE_A_FLOAT: 'Price must be a float',
  PRICE_LENGTH_MUST_BE_GREATER_THAN_0: 'Price length must be greater than 0',
  DESCRIPTION_IS_REQUIRED: 'Description is required',
  DESCRIPTION_MUST_BE_A_STRING: 'Description must be a string',
  DESCRIPTION_LENGTH_MUST_BE_GREATER_THAN_0: 'Description length must be greater than 0',
  STATUS_IS_REQUIRED: 'Status is required',
  STATUS_MUST_BE_A_STRING: 'Status must be a string',
  STATUS_LENGTH_MUST_BE_GREATER_THAN_0: 'Status length must be greater than 0',
  STATUS_MUST_BE_AVAILABLE_OR_UNAVAILABLE_OR_HIDDEN: 'Status must be available, unavailable or hidden'
} as const

export const TABLES_MESSAGES = {
  TABLE_NOT_FOUND: 'Table not found',
  TABLE_CREATED: 'Table created',
  TABLE_UPDATED: 'Table updated',
  TABLE_DELETED: 'Table deleted',
  TABLE_FETCHED: 'Table fetched',
  TABLES_FETCHED: 'Tables fetched',
  TABLE_NUMBER_IS_REQUIRED: 'Table number is required',
  TABLE_NUMBER_MUST_BE_A_NUMBER: 'Table number must be a number',
  TABLE_NUMBER_MUST_BE_GREATER_THAN_0: 'Table number must be greater than 0',
  TABLE_NUMBER_IS_INVALID: 'Table number is invalid',
  TABLE_CAPACITY_IS_REQUIRED: 'Table capacity is required',
  TABLE_CAPACITY_MUST_BE_A_NUMBER: 'Table capacity must be a number',
  TABLE_CAPACITY_MUST_BE_GREATER_THAN_0: 'Table capacity must be greater than 0',
  TABLE_STATUS_IS_REQUIRED: 'Table status is required',
  TABLE_STATUS_MUST_BE_A_STRING: 'Table status must be a string',
  TABLE_STATUS_LENGTH_MUST_BE_GREATER_THAN_0: 'Table status length must be greater than 0',
  TABLE_STATUS_MUST_BE_AVAILABLE_OR_HIDDEN_OR_RESERVED: 'Table status must be available, hidden or reserved',
  TABLE_NUMBER_IS_EXISTS: 'Table number is exists',
  CHANGE_TOKEN_MUST_BE_A_BOOLEAN: 'Change token must be a boolean'
} as const

export const COMMON_MESSAGES = {
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_3_TO_100: 'Name length must be from 3 to 100',

  LIMIT_MUST_BE_LESS_THAN_100: 'Limit must be less than 100',
  LIMIT_MUST_E_GREATER_THAN_0: 'Limit must be greater than 0',
  PAGE_MUST_E_GREATER_THAN_0: 'Page must be greater than 0',
  UPLOAD_IMAGE_SUCCESS: 'Upload image success',
  IMAGE_NOT_FOUND: 'Image not found',
  IMAGE_URL_MUST_BE_A_STRING: 'Image URL must be a string',
  IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400: 'Image URL length must be from 1 to 400'
} as const

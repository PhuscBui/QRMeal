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
  PASSWORD_IS_INCORRECT: 'Password is incorrect',
  USER_LOGIN_FAILED: 'User login failed',
  USER_LOGOUT_SUCCESS: 'User logout success',

  ORDER_CREATE_SUCCESS: 'Order create success'
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
  STATUS_MUST_BE_AVAILABLE_OR_UNAVAILABLE_OR_HIDDEN: 'Status must be available, unavailable or hidden',
  DISH_IS_HIDDEN_PLEASE_CHOOSE_ANOTHER_DISH: 'Dish is hidden, please choose another dish',
  DISH_IS_UNAVAILABLE_PLEASE_CHOOSE_ANOTHER_DISH: 'Dish is unavailable, please choose another dish'
} as const

export const TABLES_MESSAGES = {
  TABLE_NOT_ASSIGNED: 'Table not assigned',
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
  CHANGE_TOKEN_MUST_BE_A_BOOLEAN: 'Change token must be a boolean',
  TABLE_IS_HIDDEN_PLEASE_CHOOSE_ANOTHER_TABLE: 'Table is hidden, please choose another table',
  TABLE_IS_RESERVED_PLEASE_CHOOSE_ANOTHER_TABLE: 'Table is reserved, please choose another table'
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
  IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400: 'Image URL length must be from 1 to 400',

  FROM_DATE_MUST_BE_A_DATE: 'From date must be a date',
  TO_DATE_MUST_BE_A_DATE: 'To date must be a date'
} as const

export const ORDERS_MESSAGE = {
  ORDER_CREATE_SUCCESS: 'Order create success',
  ORDER_NOT_FOUND: 'Order not found',
  ORDER_GET_SUCCESS: 'Order get success',
  NO_ORDERS_TO_PAY: 'No orders to pay',
  ORDER_PAY_SUCCESS: 'Order pay success',
  GUEST_NOT_FOUND: 'Guest not found'
} as const

export const PROMOTIONS_MESSAGE = {
  PROMOTION_NOT_FOUND: 'Promotion not found',
  DESCRIPTION_MUST_BE_A_STRING: 'Description must be a string',
  PROMOTION_CREATED: 'Promotion created',
  PROMOTION_UPDATED: 'Promotion updated',
  PROMOTION_DELETED: 'Promotion deleted',
  PROMOTION_FETCHED: 'Promotion fetched',
  PROMOTIONS_FETCHED: 'Promotions fetched',
  PROMOTION_ID_IS_REQUIRED: 'Promotion ID is required',
  PROMOTION_ID_MUST_BE_A_STRING: 'Promotion ID must be a string',
  PROMOTION_ID_IS_INVALID: 'Promotion ID is invalid',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_3_TO_100: 'Name length must be from 3 to 100',
  DISCOUNT_TYPE_IS_REQUIRED: 'Discount type is required',
  DISCOUNT_TYPE_MUST_BE_A_STRING: 'Discount type must be a string',
  DISCOUNT_TYPE_LENGTH_MUST_BE_GREATER_THAN_0: 'Discount type length must be greater than 0',
  DISCOUNT_TYPE_MUST_BE_DISCOUNT_OR_LOYALTYPOINTS_OR_FREEITEM_OR_PERCENT:
    'Discount type must be discount, loyalty points or free item or percent',
  DISCOUNT_VALUE_IS_REQUIRED: 'Discount value is required',
  DISCOUNT_VALUE_MUST_BE_A_NUMBER: 'Discount value must be a number',
  DISCOUNT_VALUE_MUST_BE_GREATER_THAN_0: 'Discount value must be greater than 0',
  DISCOUNT_VALUE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0: 'Discount value must be greater than or equal to 0',
  DISCOUNT_VALUE_MUST_BE_A_FLOAT: 'Discount value must be a float',
  MIN_SPEND_IS_REQUIRED: 'Min spend is required',
  MIN_SPEND_MUST_BE_A_NUMBER: 'Min spend must be a number',
  MIN_SPEND_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0: 'Min spend must be greater than or equal to 0',
  MIN_VISITS_IS_REQUIRED: 'Min visits is required',
  MIN_VISITS_MUST_BE_A_NUMBER: 'Min visits must be a number',
  MIN_VISITS_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0: 'Min visits must be greater than or equal to 0',
  MIN_LOYALTY_POINTS_IS_REQUIRED: 'Min loyalty points is required',
  MIN_LOYALTY_POINTS_MUST_BE_A_NUMBER: 'Min loyalty points must be a number',
  MIN_LOYALTY_POINTS_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0: 'Min loyalty points must be greater than or equal to 0',
  START_DATE_IS_REQUIRED: 'Start date is required',
  START_DATE_MUST_BE_ISO8601: 'Start date must be ISO8601',
  END_DATE_IS_REQUIRED: 'End date is required',
  END_DATE_MUST_BE_ISO8601: 'End date must be ISO8601',
  IS_ACTIVE_IS_REQUIRED: 'Is active is required',
  IS_ACTIVE_MUST_BE_A_BOOLEAN: 'Is active must be a boolean',
  IS_ACTIVE_MUST_BE_TRUE_OR_FALSE: 'Is active must be true or false',
  PROMOTION_IS_HIDDEN_PLEASE_CHOOSE_ANOTHER_PROMOTION: 'Promotion is hidden, please choose another promotion',
  PROMOTION_IS_UNAVAILABLE_PLEASE_CHOOSE_ANOTHER_PROMOTION: 'Promotion is unavailable, please choose another promotion',
  MIN_SPEND_MUST_BE_A_FLOAT: 'Min spend must be a float',
  MIN_SPEND_LENGTH_MUST_BE_GREATER_THAN_0: 'Min spend length must be greater than 0',
  MIN_VISITS_MUST_BE_AN_INTEGER: 'Min visits must be an integer',
  MIN_VISITS_LENGTH_MUST_BE_GREATER_THAN_0: 'Min visits length must be greater than 0',
  MIN_LOYALTY_POINTS_MUST_BE_AN_INTEGER: 'Min loyalty points must be an integer',
  MIN_LOYALTY_POINTS_LENGTH_MUST_BE_GREATER_THAN_0: 'Min loyalty points length must be greater than 0',
  END_DATE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_START_DATE: 'End date must be greater than or equal to start date',
  PROMOTION_ID_MUST_BE_A_VALID_OBJECT_ID: 'Promotion ID must be a valid ObjectId'
} as const

export const GUEST_LOYALTY_MESSAGE = {
  GUEST_LOYALTY_NOT_FOUND: 'Guest loyalty not found',
  GUEST_LOYALTY_CREATED: 'Guest loyalty created',
  GUEST_LOYALTY_UPDATED: 'Guest loyalty updated',
  GUEST_LOYALTY_DELETED: 'Guest loyalty deleted',
  GUEST_LOYALTY_FETCHED: 'Guest loyalty fetched',
  GUEST_LOYALTIES_FETCHED: 'Guest loyalties fetched',
  GUEST_PHONE_IS_REQUIRED: 'Guest phone is required',
  GUEST_PHONE_MUST_BE_A_STRING: 'Guest phone must be a string',
  GUEST_PHONE_IS_INVALID: 'Guest phone is invalid',
  GUEST_ID_IS_REQUIRED: 'Guest ID is required',
  GUEST_ID_MUST_BE_A_STRING: 'Guest ID must be a string',
  GUEST_ID_IS_INVALID: 'Guest ID is invalid',
  TOTAL_SPEND_IS_REQUIRED: 'Total spend is required',
  TOTAL_SPEND_MUST_BE_A_NUMBER: 'Total spend must be a number',
  TOTAL_SPEND_MUST_BE_GREATER_THAN_0: 'Total spend must be greater than 0',
  VISIT_COUNT_IS_REQUIRED: 'Visit count is required',
  VISIT_COUNT_MUST_BE_A_NUMBER: 'Visit count must be a number',
  VISIT_COUNT_MUST_BE_GREATER_THAN_0: 'Visit count must be greater than 0',
  VISIT_COUNT_MUST_BE_AN_INTEGER: 'Visit count must be an integer',
  LOYALTY_POINTS_IS_REQUIRED: 'Loyalty points is required',
  LOYALTY_POINTS_MUST_BE_A_NUMBER: 'Loyalty points must be a number',
  LOYALTY_POINTS_MUST_BE_GREATER_THAN_0: 'Loyalty points must be greater than 0'
} as const

export const GUEST_PROMOTION_MESSAGE = {
  GUEST_PROMOTION_NOT_FOUND: 'Guest promotion not found',
  GUEST_PROMOTION_CREATED: 'Guest promotion created',
  GUEST_PROMOTION_UPDATED: 'Guest promotion updated',
  GUEST_PROMOTION_DELETED: 'Guest promotion deleted',
  GUEST_PROMOTION_FETCHED: 'Guest promotion fetched',
  GUEST_PROMOTIONS_FETCHED: 'Guest promotions fetched',
  GUEST_ID_IS_REQUIRED: 'Guest ID is required',
  GUEST_ID_MUST_BE_A_STRING: 'Guest ID must be a string',
  GUEST_ID_IS_INVALID: 'Guest ID is invalid',
  GUEST_PHONE_IS_REQUIRED: 'Guest phone is required',
  GUEST_PHONE_MUST_BE_A_STRING: 'Guest phone must be a string',
  GUEST_PHONE_IS_INVALID: 'Guest phone is invalid',
  PROMOTION_ID_IS_REQUIRED: 'Promotion ID is required',
  PROMOTION_ID_MUST_BE_A_STRING: 'Promotion ID must be a string',
  PROMOTION_ID_IS_INVALID: 'Promotion ID is invalid',
  GUEST_PROMOTION_ID_IS_REQUIRED: 'Guest promotion ID is required',
  GUEST_PROMOTION_ID_MUST_BE_A_STRING: 'Guest promotion ID must be a string'
} as const

export const REVENUES_MESSAGE = {
  REVENUE_NOT_FOUND: 'Revenue not found',
  REVENUE_CREATED: 'Revenue created',
  REVENUE_UPDATED: 'Revenue updated',
  REVENUE_DELETED: 'Revenue deleted',
  REVENUE_FETCHED: 'Revenue fetched',
  REVENUES_FETCHED: 'Revenues fetched',
  GUEST_ID_IS_REQUIRED: 'Guest ID is required',
  GUEST_ID_MUST_BE_A_STRING: 'Guest ID must be a string',
  GUEST_ID_IS_INVALID: 'Guest ID is invalid',
  REVENUE_CREATE_FAILED: 'Revenue create failed',
  TOTAL_AMOUNT_IS_REQUIRED: 'Total amount is required',
  TOTAL_AMOUNT_MUST_BE_A_NUMBER: 'Total amount must be a number',
  TOTAL_AMOUNT_MUST_BE_GREATER_THAN_0: 'Total amount must be greater than 0',
  TOTAL_AMOUNT_MUST_BE_POSITIVE: 'Total amount must be positive'
} as const

export const GUEST_MESSAGE = {
  GUEST_NOT_FOUND: 'Guest not found',
  GUEST_CREATED: 'Guest created',
  GUEST_UPDATED: 'Guest updated',
  GUEST_DELETED: 'Guest deleted',
  GUEST_FETCHED: 'Guest fetched',
  GUESTS_FETCHED: 'Guests fetched',
  GUEST_ID_IS_REQUIRED: 'Guest ID is required',
  GUEST_ID_MUST_BE_A_STRING: 'Guest ID must be a string',
  GUEST_ID_IS_INVALID: 'Guest ID is invalid',
  GUEST_PHONE_IS_REQUIRED: 'Guest phone is required',
  GUEST_PHONE_MUST_BE_A_STRING: 'Guest phone must be a string',
  GUEST_PHONE_IS_INVALID: 'Guest phone is invalid'
} as const

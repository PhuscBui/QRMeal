import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES, PROMOTIONS_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import promotionsService from '~/services/promotions.service'
import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: COMMON_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: COMMON_MESSAGES.NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 3, max: 100 },
    errorMessage: COMMON_MESSAGES.NAME_LENGTH_MUST_BE_FROM_3_TO_100
  },
  trim: true
}

const descriptionSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: PROMOTIONS_MESSAGE.DESCRIPTION_MUST_BE_A_STRING
  },
  trim: true
}

const categorySchema: ParamSchema = {
  notEmpty: { errorMessage: PROMOTIONS_MESSAGE.CATEGORY_IS_REQUIRED },
  isString: { errorMessage: PROMOTIONS_MESSAGE.CATEGORY_MUST_BE_A_STRING },
  custom: {
    options: (value) => ['discount', 'buy_x_get_y', 'combo', 'freeship'].includes(value),
    errorMessage: PROMOTIONS_MESSAGE.CATEGORY_INVALID
  }
}

const discountTypeSchema: ParamSchema = {
  optional: true,
  isString: { errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_TYPE_MUST_BE_A_STRING },
  custom: {
    options: (value) => ['percentage', 'fixed'].includes(value),
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_TYPE_INVALID
  }
}

const discountValueSchema: ParamSchema = {
  optional: true,
  isFloat: { errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_VALUE_MUST_BE_A_FLOAT },
  custom: {
    options: (value) => parseFloat(value) >= 0,
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_VALUE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0
  }
}

// Conditions (nested)
const conditionsSchema = {
  'conditions.min_spend': {
    optional: true,
    isFloat: { errorMessage: PROMOTIONS_MESSAGE.MIN_SPEND_MUST_BE_A_FLOAT },
    custom: {
      options: (value: string) => parseFloat(value) >= 0,
      errorMessage: PROMOTIONS_MESSAGE.MIN_SPEND_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0
    }
  },
  'conditions.min_visits': {
    optional: true,
    isInt: { errorMessage: PROMOTIONS_MESSAGE.MIN_VISITS_MUST_BE_AN_INTEGER },
    custom: {
      options: (value: string) => parseInt(value) >= 0,
      errorMessage: PROMOTIONS_MESSAGE.MIN_VISITS_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0
    }
  },
  'conditions.min_loyalty_points': {
    optional: true,
    isInt: { errorMessage: PROMOTIONS_MESSAGE.MIN_LOYALTY_POINTS_MUST_BE_AN_INTEGER },
    custom: {
      options: (value: string) => parseInt(value) >= 0,
      errorMessage: PROMOTIONS_MESSAGE.MIN_LOYALTY_POINTS_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0
    }
  },
  'conditions.buy_quantity': {
    optional: true,
    isInt: { errorMessage: PROMOTIONS_MESSAGE.BUY_QUANTITY_MUST_BE_AN_INTEGER }
  },
  'conditions.get_quantity': {
    optional: true,
    isInt: { errorMessage: PROMOTIONS_MESSAGE.GET_QUANTITY_MUST_BE_AN_INTEGER }
  },
  'conditions.applicable_items': {
    optional: true,
    isArray: { errorMessage: PROMOTIONS_MESSAGE.APPLICABLE_ITEMS_MUST_BE_AN_ARRAY }
  }
}

const startDateSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PROMOTIONS_MESSAGE.START_DATE_IS_REQUIRED
  },
  isISO8601: {
    errorMessage: PROMOTIONS_MESSAGE.START_DATE_MUST_BE_ISO8601
  }
}

const endDateSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PROMOTIONS_MESSAGE.END_DATE_IS_REQUIRED
  },
  isISO8601: {
    errorMessage: PROMOTIONS_MESSAGE.END_DATE_MUST_BE_ISO8601
  },
  custom: {
    options: (value, { req }) => {
      const startDate = new Date(req.body.start_date)
      const endDate = new Date(value)
      return startDate <= endDate
    },
    errorMessage: PROMOTIONS_MESSAGE.END_DATE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_START_DATE
  }
}

const isActiveSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PROMOTIONS_MESSAGE.IS_ACTIVE_IS_REQUIRED
  },
  isBoolean: {
    errorMessage: PROMOTIONS_MESSAGE.IS_ACTIVE_MUST_BE_A_BOOLEAN
  },
  custom: {
    options: (value) => value === true || value === false,
    errorMessage: PROMOTIONS_MESSAGE.IS_ACTIVE_MUST_BE_TRUE_OR_FALSE
  }
}

const applicableToSchema: ParamSchema = {
  notEmpty: { errorMessage: PROMOTIONS_MESSAGE.APPLICABLE_TO_IS_REQUIRED },
  isString: { errorMessage: PROMOTIONS_MESSAGE.APPLICABLE_TO_MUST_BE_A_STRING },
  custom: {
    options: (value) => ['guest', 'customer', 'both'].includes(value),
    errorMessage: PROMOTIONS_MESSAGE.APPLICABLE_TO_INVALID
  }
}

export const createPromotionValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      description: descriptionSchema,
      category: categorySchema,
      discount_type: discountTypeSchema,
      discount_value: discountValueSchema,
      ...conditionsSchema,
      start_date: startDateSchema,
      end_date: endDateSchema,
      is_active: isActiveSchema,
      applicable_to: applicableToSchema
    },
    ['body']
  )
)

export const promotionIdValidator = validate(
  checkSchema(
    {
      promotionId: {
        notEmpty: {
          errorMessage: PROMOTIONS_MESSAGE.PROMOTION_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: PROMOTIONS_MESSAGE.PROMOTION_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: PROMOTIONS_MESSAGE.PROMOTION_ID_MUST_BE_A_VALID_OBJECT_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const promotion = await promotionsService.getPromotionById(value)
            if (!promotion) {
              throw new ErrorWithStatus({
                message: PROMOTIONS_MESSAGE.PROMOTION_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.promotion = promotion
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const updatePromotionValidator = validate(
  checkSchema(
    {
      name: { ...nameSchema, optional: true },
      description: descriptionSchema,
      category: { ...categorySchema, optional: true },
      discount_type: discountTypeSchema,
      discount_value: discountValueSchema,
      ...conditionsSchema,
      start_date: { ...startDateSchema, optional: true },
      end_date: { ...endDateSchema, optional: true },
      is_active: { ...isActiveSchema, optional: true },
      applicable_to: { ...applicableToSchema, optional: true }
    },
    ['body']
  )
)

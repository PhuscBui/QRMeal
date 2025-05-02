import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES, PROMOTIONS_MESSAGE } from '~/constants/messages'
import { PromotionTypeValues } from '~/constants/type'
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
const discountTypeSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_TYPE_IS_REQUIRED
  },
  isString: {
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_TYPE_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 1 },
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_TYPE_LENGTH_MUST_BE_GREATER_THAN_0
  },
  trim: true,
  custom: {
    options: (value) => PromotionTypeValues.includes(value),
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_TYPE_MUST_BE_DISCOUNT_OR_LOYALTYPOINTS_OR_FREEITEM_OR_PERCENT
  }
}

const discountValueSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_VALUE_IS_REQUIRED
  },
  isNumeric: {
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_VALUE_MUST_BE_A_NUMBER
  },
  isFloat: {
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_VALUE_MUST_BE_A_FLOAT
  },
  isLength: {
    options: { min: 1 },
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_VALUE_MUST_BE_GREATER_THAN_0
  },
  custom: {
    options: (value) => parseFloat(value) >= 0,
    errorMessage: PROMOTIONS_MESSAGE.DISCOUNT_VALUE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0
  }
}

const minSpendSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PROMOTIONS_MESSAGE.MIN_SPEND_IS_REQUIRED
  },
  isNumeric: {
    errorMessage: PROMOTIONS_MESSAGE.MIN_SPEND_MUST_BE_A_NUMBER
  },
  isFloat: {
    errorMessage: PROMOTIONS_MESSAGE.MIN_SPEND_MUST_BE_A_FLOAT
  },
  isLength: {
    options: { min: 1 },
    errorMessage: PROMOTIONS_MESSAGE.MIN_SPEND_LENGTH_MUST_BE_GREATER_THAN_0
  },
  custom: {
    options: (value) => parseFloat(value) >= 0,
    errorMessage: PROMOTIONS_MESSAGE.MIN_SPEND_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0
  }
}

const minVisitsSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PROMOTIONS_MESSAGE.MIN_VISITS_IS_REQUIRED
  },
  isNumeric: {
    errorMessage: PROMOTIONS_MESSAGE.MIN_VISITS_MUST_BE_A_NUMBER
  },
  isInt: {
    errorMessage: PROMOTIONS_MESSAGE.MIN_VISITS_MUST_BE_AN_INTEGER
  },
  isLength: {
    options: { min: 1 },
    errorMessage: PROMOTIONS_MESSAGE.MIN_VISITS_LENGTH_MUST_BE_GREATER_THAN_0
  },
  custom: {
    options: (value) => parseInt(value) >= 0,
    errorMessage: PROMOTIONS_MESSAGE.MIN_VISITS_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0
  }
}

const minLoyaltyPointsSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PROMOTIONS_MESSAGE.MIN_LOYALTY_POINTS_IS_REQUIRED
  },
  isNumeric: {
    errorMessage: PROMOTIONS_MESSAGE.MIN_LOYALTY_POINTS_MUST_BE_A_NUMBER
  },
  isInt: {
    errorMessage: PROMOTIONS_MESSAGE.MIN_LOYALTY_POINTS_MUST_BE_AN_INTEGER
  },
  isLength: {
    options: { min: 1 },
    errorMessage: PROMOTIONS_MESSAGE.MIN_LOYALTY_POINTS_LENGTH_MUST_BE_GREATER_THAN_0
  },
  custom: {
    options: (value) => parseInt(value) >= 0,
    errorMessage: PROMOTIONS_MESSAGE.MIN_LOYALTY_POINTS_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0
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

export const createPromotionValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      description: descriptionSchema,
      discount_type: discountTypeSchema,
      discount_value: discountValueSchema,
      min_spend: minSpendSchema,
      min_visits: minVisitsSchema,
      min_loyalty_points: minLoyaltyPointsSchema,
      start_date: startDateSchema,
      end_date: endDateSchema,
      is_active: isActiveSchema
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
      name: nameSchema,
      description: descriptionSchema,
      discount_type: discountTypeSchema,
      discount_value: discountValueSchema,
      min_spend: minSpendSchema,
      min_visits: minVisitsSchema,
      min_loyalty_points: minLoyaltyPointsSchema,
      start_date: startDateSchema,
      end_date: endDateSchema,
      is_active: isActiveSchema
    },
    ['body']
  )
)

import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { LOYALTY_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import loyaltyService from '~/services/loyalties.service'
import { validate } from '~/utils/validation'

export const customerIdValidator = validate(
  checkSchema(
    {
      customerId: {
        notEmpty: {
          errorMessage: LOYALTY_MESSAGE.CUSTOMER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: LOYALTY_MESSAGE.CUSTOMER_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            const customerLoyalty = await loyaltyService.getLoyaltyByCustomerId(value)
            if (!customerLoyalty) {
              throw new ErrorWithStatus({
                message: LOYALTY_MESSAGE.LOYALTY_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.loyalty = customerLoyalty
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const updateLoyaltyValidator = validate(
  checkSchema(
    {
      total_spend: {
        notEmpty: {
          errorMessage: LOYALTY_MESSAGE.TOTAL_SPEND_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: LOYALTY_MESSAGE.TOTAL_SPEND_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value) => parseFloat(value) > 0,
          errorMessage: LOYALTY_MESSAGE.TOTAL_SPEND_MUST_BE_GREATER_THAN_0
        }
      },
      visit_count: {
        notEmpty: {
          errorMessage: LOYALTY_MESSAGE.VISIT_COUNT_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: LOYALTY_MESSAGE.VISIT_COUNT_MUST_BE_A_NUMBER
        },
        isInt: {
          errorMessage: LOYALTY_MESSAGE.VISIT_COUNT_MUST_BE_AN_INTEGER
        },
        custom: {
          options: (value) => parseFloat(value) > 0,
          errorMessage: LOYALTY_MESSAGE.VISIT_COUNT_MUST_BE_GREATER_THAN_0
        }
      },
      loyalty_points: {
        notEmpty: {
          errorMessage: LOYALTY_MESSAGE.LOYALTY_POINTS_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: LOYALTY_MESSAGE.LOYALTY_POINTS_MUST_BE_A_NUMBER
        },

        custom: {
          options: (value) => parseFloat(value) > 0,
          errorMessage: LOYALTY_MESSAGE.LOYALTY_POINTS_MUST_BE_GREATER_THAN_0
        }
      }
    },
    ['body']
  )
)

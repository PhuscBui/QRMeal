import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { GUEST_LOYALTY_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import guestLoyaltyService from '~/services/guest-loyalty.service'
import { validate } from '~/utils/validation'

export const guestPhoneValidator = validate(
  checkSchema(
    {
      guestPhone: {
        notEmpty: {
          errorMessage: GUEST_LOYALTY_MESSAGE.GUEST_PHONE_IS_REQUIRED
        },
        isString: {
          errorMessage: GUEST_LOYALTY_MESSAGE.GUEST_PHONE_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            if (!/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(value)) {
              throw new ErrorWithStatus({
                message: GUEST_LOYALTY_MESSAGE.GUEST_PHONE_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const guestLoyalty = await guestLoyaltyService.getGuestLoyaltyByPhone(value)
            if (!guestLoyalty) {
              throw new ErrorWithStatus({
                message: GUEST_LOYALTY_MESSAGE.GUEST_LOYALTY_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.guestLoyalty = guestLoyalty
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const updateGuestLoyaltyValidator = validate(
  checkSchema(
    {
      total_spend: {
        notEmpty: {
          errorMessage: GUEST_LOYALTY_MESSAGE.TOTAL_SPEND_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: GUEST_LOYALTY_MESSAGE.TOTAL_SPEND_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value) => parseFloat(value) > 0,
          errorMessage: GUEST_LOYALTY_MESSAGE.TOTAL_SPEND_MUST_BE_GREATER_THAN_0
        }
      },
      visit_count: {
        notEmpty: {
          errorMessage: GUEST_LOYALTY_MESSAGE.VISIT_COUNT_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: GUEST_LOYALTY_MESSAGE.VISIT_COUNT_MUST_BE_A_NUMBER
        },
        isInt: {
          errorMessage: GUEST_LOYALTY_MESSAGE.VISIT_COUNT_MUST_BE_AN_INTEGER
        },
        custom: {
          options: (value) => parseFloat(value) > 0,
          errorMessage: GUEST_LOYALTY_MESSAGE.VISIT_COUNT_MUST_BE_GREATER_THAN_0
        }
      },
      loyalty_points: {
        notEmpty: {
          errorMessage: GUEST_LOYALTY_MESSAGE.LOYALTY_POINTS_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: GUEST_LOYALTY_MESSAGE.LOYALTY_POINTS_MUST_BE_A_NUMBER
        },

        custom: {
          options: (value) => parseFloat(value) > 0,
          errorMessage: GUEST_LOYALTY_MESSAGE.LOYALTY_POINTS_MUST_BE_GREATER_THAN_0
        }
      }
    },
    ['body']
  )
)

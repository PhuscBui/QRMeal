import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { GUEST_PROMOTION_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import guestPromotionService from '~/services/guest-promotion.service'
import { validate } from '~/utils/validation'

export const guestIdValidator = validate(
  checkSchema(
    {
      guestId: {
        notEmpty: {
          errorMessage: GUEST_PROMOTION_MESSAGE.GUEST_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: GUEST_PROMOTION_MESSAGE.GUEST_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: GUEST_PROMOTION_MESSAGE.GUEST_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const guestPromotions = await guestPromotionService.getGuestPromotionByGuestId(value)
            if (!guestPromotions) {
              throw new ErrorWithStatus({
                message: GUEST_PROMOTION_MESSAGE.GUEST_PROMOTION_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.guestPromotions = guestPromotions
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const createGuestPromotionValidator = validate(
  checkSchema(
    {
      guest_id: {
        notEmpty: {
          errorMessage: GUEST_PROMOTION_MESSAGE.GUEST_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: GUEST_PROMOTION_MESSAGE.GUEST_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: GUEST_PROMOTION_MESSAGE.GUEST_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      guest_phone: {
        notEmpty: {
          errorMessage: GUEST_PROMOTION_MESSAGE.GUEST_PHONE_IS_REQUIRED
        },
        isString: {
          errorMessage: GUEST_PROMOTION_MESSAGE.GUEST_PHONE_MUST_BE_A_STRING
        }
      },
      promotion_id: {
        notEmpty: {
          errorMessage: GUEST_PROMOTION_MESSAGE.PROMOTION_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: GUEST_PROMOTION_MESSAGE.PROMOTION_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: GUEST_PROMOTION_MESSAGE.PROMOTION_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

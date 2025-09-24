import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { CUSTOMER_PROMOTION_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import customerPromotionService from '~/services/customer-promotion.service'
import { validate } from '~/utils/validation'

export const customerIdValidator = validate(
  checkSchema(
    {
      customerId: {
        notEmpty: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const customerPromotions = await customerPromotionService.getCustomerPromotionByCustomerId(value)
            if (!customerPromotions) {
              throw new ErrorWithStatus({
                message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_PROMOTION_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.customerPromotions = customerPromotions
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const createCustomerPromotionValidator = validate(
  checkSchema(
    {
      customer_id: {
        notEmpty: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      promotion_id: {
        notEmpty: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.PROMOTION_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.PROMOTION_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: CUSTOMER_PROMOTION_MESSAGE.PROMOTION_ID_IS_INVALID,
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

export const usedCustomerPromotionValidator = validate(
  checkSchema(
    {
      customer_id: {
        notEmpty: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      promotion_id: {
        notEmpty: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.PROMOTION_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.PROMOTION_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: CUSTOMER_PROMOTION_MESSAGE.PROMOTION_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      order_group_ids: {
        optional: true,
        isArray: {
          errorMessage: CUSTOMER_PROMOTION_MESSAGE.ORDER_GROUP_IDS_MUST_BE_AN_ARRAY
        },
        custom: {
          options: (value: string[]) => {
            for (const id of value) {
              if (!ObjectId.isValid(id)) {
                throw new ErrorWithStatus({
                  message: CUSTOMER_PROMOTION_MESSAGE.ORDER_GROUP_ID_IS_INVALID,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

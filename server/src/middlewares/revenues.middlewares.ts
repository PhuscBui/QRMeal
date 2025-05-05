import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { GUEST_MESSAGE, REVENUES_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { validate } from '~/utils/validation'

export const createRevenueValidator = validate(
  checkSchema(
    {
      guest_id: {
        notEmpty: {
          errorMessage: GUEST_MESSAGE.GUEST_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: GUEST_MESSAGE.GUEST_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: GUEST_MESSAGE.GUEST_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      total_amount: {
        notEmpty: {
          errorMessage: REVENUES_MESSAGE.TOTAL_AMOUNT_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: REVENUES_MESSAGE.TOTAL_AMOUNT_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value: number) => {
            if (value < 0) {
              throw new ErrorWithStatus({
                message: REVENUES_MESSAGE.TOTAL_AMOUNT_MUST_BE_POSITIVE,
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

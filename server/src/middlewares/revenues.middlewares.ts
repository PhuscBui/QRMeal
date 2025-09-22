import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { GUEST_MESSAGE, REVENUES_MESSAGE, USERS_MESSAGES } from '~/constants/messages'
import { Role } from '~/constants/type'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/Account.request'
import databaseService from '~/services/databases.service'
import { validate } from '~/utils/validation'

export const createRevenueValidator = validate(
  checkSchema(
    {
      guest_id: {
        optional: { options: { nullable: true } },
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
      },
      customer_id: {
        optional: { options: { nullable: true } },
        notEmpty: {
          errorMessage: REVENUES_MESSAGE.CUSTOMER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: REVENUES_MESSAGE.CUSTOMER_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: REVENUES_MESSAGE.CUSTOMER_ID_IS_INVALID,
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

export const checkUserRoleValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.accounts.findOne({ _id: new ObjectId(account_id) })
  if (!user || (user.role !== Role.Employee && user.role !== Role.Owner && user.role !== Role.Customer)) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      message: USERS_MESSAGES.UNAUTHORIZED
    })
    return
  }

  next()
}

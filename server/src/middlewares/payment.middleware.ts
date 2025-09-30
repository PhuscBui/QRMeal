// middlewares/payment.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import { validate } from '~/utils/validation'
import databaseService from '~/services/databases.service'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '~/models/requests/Account.request'

// Validate create payment link request
export const createPaymentLinkValidator = validate(
  checkSchema(
    {
      order_group_ids: {
        isArray: {
          errorMessage: 'order_group_ids must be an array'
        },
        custom: {
          options: async (value: string[]) => {
            if (!value || value.length === 0) {
              throw new ErrorWithStatus({
                message: 'At least one order group ID is required',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            // Validate all IDs are valid ObjectIds
            const invalidIds = value.filter((id) => !ObjectId.isValid(id))
            if (invalidIds.length > 0) {
              throw new ErrorWithStatus({
                message: `Invalid order group IDs: ${invalidIds.join(', ')}`,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            // Check if all order groups exist
            const orderGroups = await databaseService.orderGroups
              .find({ _id: { $in: value.map((id) => new ObjectId(id)) } })
              .toArray()

            if (orderGroups.length !== value.length) {
              throw new ErrorWithStatus({
                message: 'Some order groups do not exist',
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if any order group is already paid
            const paidOrders = orderGroups.filter((og) => og.status === 'Paid')
            if (paidOrders.length > 0) {
              throw new ErrorWithStatus({
                message: 'Some orders are already paid',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            return true
          }
        }
      },
      total_amount: {
        isFloat: {
          options: { min: 0 },
          errorMessage: 'total_amount must be a positive number'
        }
      }
    },
    ['body']
  )
)

// Validate payment ID parameter
export const paymentIdValidator = validate(
  checkSchema(
    {
      payment_id: {
        in: ['params'],
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'Invalid payment ID',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            const payment = await databaseService.payments.findOne({
              _id: new ObjectId(value)
            })

            if (!payment) {
              throw new ErrorWithStatus({
                message: 'Payment not found',
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            return true
          }
        }
      }
    },
    ['params']
  )
)

// Validate order group IDs query parameter
export const orderGroupIdsQueryValidator = validate(
  checkSchema(
    {
      order_group_ids: {
        in: ['query'],
        isString: {
          errorMessage: 'order_group_ids must be a comma-separated string'
        },
        custom: {
          options: (value: string) => {
            const ids = value
              .split(',')
              .map((id) => id.trim())
              .filter(Boolean)

            if (ids.length === 0) {
              throw new ErrorWithStatus({
                message: 'At least one order group ID is required',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            const invalidIds = ids.filter((id) => !ObjectId.isValid(id))
            if (invalidIds.length > 0) {
              throw new ErrorWithStatus({
                message: `Invalid order group IDs: ${invalidIds.join(', ')}`,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            return true
          }
        }
      }
    },
    ['query']
  )
)

// Check if user has permission to view/create payment for orders
export const checkOrderOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { account_id, role } = req.decoded_authorization as TokenPayload
    const orderGroupIds =
      req.body.order_group_ids || (req.query.order_group_ids as string)?.split(',').map((id) => id.trim())

    if (!orderGroupIds) {
      return next()
    }

    const orderGroups = await databaseService.orderGroups
      .find({ _id: { $in: orderGroupIds.map((id: string) => new ObjectId(id)) } })
      .toArray()

    // Check if user owns all order groups
    const unauthorizedOrders = orderGroups.filter(
      (og) => og.customer_id?.toString() !== account_id && og.guest_id?.toString() !== account_id
    )

    if (unauthorizedOrders.length > 0 && role !== 'Owner' && role !== 'Employee') {
      throw new ErrorWithStatus({
        message: 'You do not have permission to access these orders',
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    next()
  } catch (error) {
    next(error)
  }
}

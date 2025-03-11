import { checkSchema } from 'express-validator'
import { COMMON_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'
import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: (value) => {
            const num = Number(value)
            if (num > 100) {
              throw new Error(COMMON_MESSAGES.LIMIT_MUST_BE_LESS_THAN_100)
            }
            if (num < 1) {
              throw new Error(COMMON_MESSAGES.LIMIT_MUST_E_GREATER_THAN_0)
            }
            return true
          }
        },
        optional: { options: { nullable: true } }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error(COMMON_MESSAGES.PAGE_MUST_E_GREATER_THAN_0)
            }
            return true
          }
        },
        optional: { options: { nullable: true } }
      }
    },
    ['query']
  )
)

type FilterKeys<T> = Array<keyof T>

export const filterMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }

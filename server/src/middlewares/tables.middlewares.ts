import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { TABLES_MESSAGES } from '~/constants/messages'
import { TableStatus, TableStatusValues } from '~/constants/type'
import tablesService from '~/services/tables.service'
import { validate } from '~/utils/validation'

const capacitySchema: ParamSchema = {
  notEmpty: {
    errorMessage: TABLES_MESSAGES.TABLE_CAPACITY_IS_REQUIRED
  },
  isNumeric: {
    errorMessage: TABLES_MESSAGES.TABLE_CAPACITY_MUST_BE_A_NUMBER
  },
  isInt: {
    options: { min: 1 },
    errorMessage: TABLES_MESSAGES.TABLE_CAPACITY_MUST_BE_GREATER_THAN_0
  }
}

const statusSchema: ParamSchema = {
  notEmpty: {
    errorMessage: TABLES_MESSAGES.TABLE_STATUS_IS_REQUIRED
  },
  isString: {
    errorMessage: TABLES_MESSAGES.TABLE_STATUS_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 1 },
    errorMessage: TABLES_MESSAGES.TABLE_STATUS_LENGTH_MUST_BE_GREATER_THAN_0
  },
  isIn: {
    options: [TableStatusValues],
    errorMessage: TABLES_MESSAGES.TABLE_STATUS_MUST_BE_AVAILABLE_OR_HIDDEN_OR_RESERVED
  }
}

export const createTableValidator = validate(
  checkSchema(
    {
      number: {
        notEmpty: {
          errorMessage: TABLES_MESSAGES.TABLE_NUMBER_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: TABLES_MESSAGES.TABLE_NUMBER_MUST_BE_A_NUMBER
        },
        isInt: {
          options: { min: 1 },
          errorMessage: TABLES_MESSAGES.TABLE_NUMBER_MUST_BE_GREATER_THAN_0
        },
        custom: {
          options: async (value) => {
            const isExists = await tablesService.checkTableExist(Number(value))
            if (isExists) {
              return Promise.reject(TABLES_MESSAGES.TABLE_NUMBER_IS_EXISTS)
            }
            return Promise.resolve()
          }
        }
      },
      capacity: capacitySchema,
      status: statusSchema
    },
    ['body']
  )
)

export const updateTableValidator = validate(
  checkSchema(
    {
      capacity: capacitySchema,
      status: statusSchema,
      changeToken: {
        optional: true,
        isBoolean: {
          errorMessage: TABLES_MESSAGES.CHANGE_TOKEN_MUST_BE_A_BOOLEAN
        }
      }
    },
    ['body']
  )
)

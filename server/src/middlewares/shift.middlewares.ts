import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SHIFTS_MESSAGES } from '~/constants/messages'
import { Role } from '~/constants/type'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/databases.service'
import { validate } from '~/utils/validation'

const staffIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: SHIFTS_MESSAGES.STAFF_ID_IS_REQUIRED
  },
  isString: {
    errorMessage: SHIFTS_MESSAGES.STAFF_ID_MUST_BE_A_STRING
  },
  custom: {
    options: async (value) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: SHIFTS_MESSAGES.INVALID_STAFF_ID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const staff = await databaseService.accounts.findOne({ _id: new ObjectId(value) })
      if (!staff || (staff.role !== Role.Employee && staff.role !== Role.Owner)) {
        throw new ErrorWithStatus({
          message: SHIFTS_MESSAGES.STAFF_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}

const shiftDateSchema: ParamSchema = {
  notEmpty: {
    errorMessage: SHIFTS_MESSAGES.SHIFT_DATE_IS_REQUIRED
  },
  isISO8601: {
    options: { strict: true, strictSeparator: true },
    errorMessage: SHIFTS_MESSAGES.SHIFT_DATE_MUST_BE_ISO8601
  }
}

const timeSchema: ParamSchema = {
  notEmpty: {
    errorMessage: SHIFTS_MESSAGES.TIME_IS_REQUIRED
  },
  isString: {
    errorMessage: SHIFTS_MESSAGES.TIME_MUST_BE_A_STRING
  },
  matches: {
    options: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    errorMessage: SHIFTS_MESSAGES.INVALID_TIME_FORMAT
  }
}

export const createShiftValidator = validate(
  checkSchema(
    {
      staff_id: staffIdSchema,
      shift_date: shiftDateSchema,
      start_time: {
        ...timeSchema,
        errorMessage: SHIFTS_MESSAGES.START_TIME_IS_REQUIRED
      },
      end_time: {
        ...timeSchema,
        errorMessage: SHIFTS_MESSAGES.END_TIME_IS_REQUIRED,
        custom: {
          options: (value, { req }) => {
            const startTime = req.body.start_time
            if (startTime && value <= startTime) {
              throw new ErrorWithStatus({
                message: SHIFTS_MESSAGES.END_TIME_MUST_BE_AFTER_START_TIME,
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

export const updateShiftValidator = validate(
  checkSchema(
    {
      staff_id: {
        ...staffIdSchema,
        optional: true
      },
      shift_date: {
        ...shiftDateSchema,
        optional: true
      },
      start_time: {
        ...timeSchema,
        optional: true,
        errorMessage: SHIFTS_MESSAGES.START_TIME_IS_REQUIRED
      },
      end_time: {
        ...timeSchema,
        optional: true,
        errorMessage: SHIFTS_MESSAGES.END_TIME_IS_REQUIRED,
        custom: {
          options: (value, { req }) => {
            const startTime = req.body.start_time
            if (startTime && value && value <= startTime) {
              throw new ErrorWithStatus({
                message: SHIFTS_MESSAGES.END_TIME_MUST_BE_AFTER_START_TIME,
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

export const shiftParamValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: {
          errorMessage: SHIFTS_MESSAGES.SHIFT_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: SHIFTS_MESSAGES.SHIFT_ID_MUST_BE_A_STRING
        },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: SHIFTS_MESSAGES.INVALID_SHIFT_ID,
                status: HTTP_STATUS.BAD_REQUEST
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

import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { Role } from '~/constants/type'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/Account.request'
import accountsService from '~/services/accounts.service'
import databaseService from '~/services/databases.service'
import { hashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validation'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 6, max: 100 },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 6, max: 100 },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRONG
  },
  custom: {
    options: (value, { req }) => value === req.body.password,
    errorMessage: USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 3, max: 100 },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_3_TO_100
  },
  trim: true
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: COMMON_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: { min: 0, max: 400 },
    errorMessage: COMMON_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: { strict: true, strictSeparator: true },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
}

export const createEmployeeValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_VALID
        },
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value) => {
            const result = await accountsService.checkEmailExist(value)
            if (result) {
              return Promise.reject(new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS))
            }
            return Promise.resolve()
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },

    ['body']
  )
)

export const updateEmployeeValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_VALID
        },
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const result = await databaseService.accounts.findOne({ email: value })
            if (result && req.params && result._id.toString() !== req.params.id) {
              return Promise.reject(new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS))
            }
            return Promise.resolve()
          }
        }
      },
      avatar: imageSchema,
      password: {
        optional: true,
        ...passwordSchema
      },
      confirm_password: {
        optional: true,
        ...confirmPasswordSchema
      },
      date_of_birth: dateOfBirthSchema
    },
    ['body', 'params']
  )
)

export const isAdminValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.accounts.findOne({ _id: new ObjectId(account_id) })
  if (!user || user.role !== Role.Owner) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      message: USERS_MESSAGES.UNAUTHORIZED
    })
    return
  }

  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      avatar: imageSchema
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { account_id } = req.decoded_authorization as TokenPayload
            const user = await databaseService.accounts.findOne({ _id: new ObjectId(account_id) })
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const isPasswordMatch = hashPassword(value) === user.password
            if (!isPasswordMatch) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.PASSWORD_IS_INCORRECT,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

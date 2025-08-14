import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { CATEGORIES_MESSAGE, COMMON_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import categoryService from '~/services/categories.service'
import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: COMMON_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: COMMON_MESSAGES.NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 3, max: 100 },
    errorMessage: COMMON_MESSAGES.NAME_LENGTH_MUST_BE_FROM_3_TO_100
  },
  trim: true
}

const descriptionSchema: ParamSchema = {
  notEmpty: {
    errorMessage: CATEGORIES_MESSAGE.CATEGORY_DESCRIPTION_IS_REQUIRED
  },
  isString: {
    errorMessage: CATEGORIES_MESSAGE.CATEGORY_DESCRIPTION_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 1 },
    errorMessage: CATEGORIES_MESSAGE.CATEGORY_DESCRIPTION_LENGTH_MUST_BE_GREATER_THAN_0
  }
}

export const categoryIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: COMMON_MESSAGES.ID_IS_REQUIRED
  },
  isString: {
    errorMessage: COMMON_MESSAGES.ID_IS_INVALID
  },
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: COMMON_MESSAGES.ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const category = await categoryService.getCategoryById(value)
      if (!category) {
        throw new ErrorWithStatus({
          message: CATEGORIES_MESSAGE.CATEGORY_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      req.category = category
      return true
    }
  }
}

export const createCategoryValidation = validate(
  checkSchema(
    {
      name: nameSchema,
      description: descriptionSchema
    },
    ['body']
  )
)

export const updateCategoryValidation = validate(
  checkSchema(
    {
      name: nameSchema,
      description: descriptionSchema
    },
    ['body']
  )
)

export const categoryIdValidation = validate(
  checkSchema({
    categoryId: categoryIdSchema
  })
)

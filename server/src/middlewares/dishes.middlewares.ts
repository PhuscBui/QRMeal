import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES, DISHES_MESSAGE } from '~/constants/messages'
import { DishStatusValues } from '~/constants/type'
import { ErrorWithStatus } from '~/models/Error'
import { dishesService } from '~/services/dishes.service'
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

const priceSchema: ParamSchema = {
  isNumeric: {
    errorMessage: DISHES_MESSAGE.PRICE_MUST_BE_A_NUMBER
  },
  isFloat: {
    errorMessage: DISHES_MESSAGE.PRICE_MUST_BE_A_FLOAT
  },
  isLength: {
    options: { min: 1 },
    errorMessage: DISHES_MESSAGE.PRICE_LENGTH_MUST_BE_GREATER_THAN_0
  },
  custom: {
    options: (value) => parseFloat(value) > 0,
    errorMessage: DISHES_MESSAGE.PRICE_LENGTH_MUST_BE_GREATER_THAN_0
  }
}

const descriptionSchema: ParamSchema = {
  notEmpty: {
    errorMessage: DISHES_MESSAGE.DESCRIPTION_IS_REQUIRED
  },
  isString: {
    errorMessage: DISHES_MESSAGE.DESCRIPTION_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 1 },
    errorMessage: DISHES_MESSAGE.DESCRIPTION_LENGTH_MUST_BE_GREATER_THAN_0
  }
}

const statusSchema: ParamSchema = {
  notEmpty: {
    errorMessage: DISHES_MESSAGE.STATUS_IS_REQUIRED
  },
  isString: {
    errorMessage: DISHES_MESSAGE.STATUS_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 1 },
    errorMessage: DISHES_MESSAGE.STATUS_LENGTH_MUST_BE_GREATER_THAN_0
  },
  custom: {
    options: (value) => DishStatusValues.includes(value),
    errorMessage: DISHES_MESSAGE.STATUS_MUST_BE_AVAILABLE_OR_UNAVAILABLE_OR_HIDDEN
  }
}

export const createDishValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      price: priceSchema,
      description: descriptionSchema,
      image: imageSchema,
      status: statusSchema
    },
    ['body']
  )
)

export const updateDishValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      price: priceSchema,
      description: descriptionSchema,
      image: imageSchema,
      status: statusSchema
    },
    ['body']
  )
)

export const dishIdValidator = validate(
  checkSchema(
    {
      dishId: {
        notEmpty: {
          errorMessage: DISHES_MESSAGE.DISH_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: DISHES_MESSAGE.DISH_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: DISHES_MESSAGE.DISH_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const dish = await dishesService.getDish(value)
            if (!dish) {
              throw new ErrorWithStatus({
                message: DISHES_MESSAGE.DISH_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.dish = dish
            return true
          }
        }
      }
    },
    ['params']
  )
)
